/**
 *
 * Field - renders field and provides an api to interact with data and state
 *
 */

import React, {
  createRef,
  RefObject
} from 'react'
import { utils, types, Validator, ValidationMessage } from 'rjv'
import { FormProviderContext, FormProviderContextValue } from '../FormProvider'
import { ScopeContext, ScopeContextValue } from '../Scope'
import { EmitterProviderContext, EmitterProviderContextValue, events } from '../EmitterProvider'
import { EventEmitter2, Listener } from 'eventemitter2'
import { TrackingRef, EmittingRef } from '../../refs'
import { OptionsProviderContext, OptionsProviderContextValue } from '../OptionsProvider'
import {
  DEFAULT_DESCRIPTION_RESOLVER,
  DEFAULT_VALIDATOR_OPTIONS
} from '../OptionsProvider/OptionsProvider'

function extractMessageFromResult (res: types.IValidationResult, ref: types.IRef): ValidationMessage {
  return res.results[ref.path]
    ? res.results[ref.path]!.messages[0]
    : new ValidationMessage(false, 'react', 'The field has no validation rules, check the schema')
}

export class FieldApi {
  constructor (private component: FieldComponent) {}

  set value (value: any) {
    this.component.setState({
      isTouched: true,
      isDirty: true,
      isPristine: false
    })

    this.component.ref.value = value
  }

  get value (): any {
    if (!this.state.isInitiated) {
      return this.component.ref.value === undefined
        ? this.component.schema.default
        : this.component.ref.value
    }

    return this.component.ref.value
  }

  get state (): State {
    return this.component.state
  }

  get ref (): types.IRef {
    return this.component.ref
  }

  async validate (): Promise<types.IValidationResult> {
    this.component.setState({ isValidating: true })

    const ref = this.component.ref
    const res = await this.component.validator.validateRef(ref)

    this.component.setState({
      isValid: res.valid,
      isTouched: true,
      isValidated: true,
      isValidating: false,
      message: extractMessageFromResult(res, ref)
    }, () => {
      this.component.emitter.emit(ref.path, new events.ValidatedEvent())
    })

    return res
  }

  focus () {
    this.component.inputRef.current
    && this.component.inputRef.current.focus
    && this.component.inputRef.current.focus()
  }

  markAsTouched (): this {
    this.component.setState({
      isTouched: true,
      isPristine: false
    })

    return this
  }

  markAsPristine (): this {
    this.component.setState({
      isTouched: false,
      isValidated: false,
      isDirty: false,
      isPristine: true
    })

    return this
  }

  markAsDirty (): this {
    this.component.setState({
      isTouched: true,
      isDirty: true,
      isPristine: false
    })

    return this
  }

  markAsInvalidated (): this {
    this.component.setState({
      isValidated: false
    }, () => {
      this.component.emitter.emit(this.component.ref.path, new events.InvalidatedEvent())
    })

    return this
  }

  get isRequired (): boolean {
    return this.component.state.isRequired
  }

  get isReadonly (): boolean {
    return this.component.state.isReadonly
  }

  get messageDescription (): string | undefined {
    const message = this.component.state.isValidated ? this.component.state.message : undefined

    return message && this.component.options.descriptionResolver(message)
  }
}

type State = {
  isValid: boolean,
  isValidating: boolean,
  isValidated: boolean,
  isPristine: boolean,
  isTouched: boolean,
  isDirty: boolean,
  isRequired: boolean,
  isReadonly: boolean,
  isInitiated: boolean,
  message?: any
}

const DEFAULT_STATE: State = {
  isValid: false,
  isValidating: false,
  isValidated: false,
  isPristine: true,
  isTouched: false,
  isDirty: false,
  isRequired: false,
  isReadonly: false,
  isInitiated: false
}

const DEFAULT_OPTIONS: OptionsProviderContextValue = {
  validatorOptions: DEFAULT_VALIDATOR_OPTIONS,
  descriptionResolver: DEFAULT_DESCRIPTION_RESOLVER
}

type ComponentProps = {
  fieldRef?: (field: FieldApi) => void
  render: (field: FieldApi, inputRef: RefObject<any>) => React.ReactNode
  path: types.Path
  schema: types.ISchema
}

type ComponentPropsWithContexts = ComponentProps & {
  providerContext: FormProviderContextValue
  scopeContext: ScopeContextValue
  emitterContext: EmitterProviderContextValue
  optionsContext: OptionsProviderContextValue
}

class FieldComponent extends React.Component<ComponentPropsWithContexts, State> {
  path: types.Path
  schema: types.ISchema
  ref: EmittingRef
  validator: Validator
  api: FieldApi
  emitter: EventEmitter2
  inputRef: RefObject<any>
  listeners: Listener[]
  options: OptionsProviderContextValue

  constructor (props: ComponentPropsWithContexts) {
    super(props)

    const {
      path, schema, providerContext, scopeContext, emitterContext, optionsContext, fieldRef
    } = props

    if (!providerContext) {
      throw new Error('Received invalid providerContext')
    }

    if (!emitterContext) {
      throw new Error('Received invalid emitterContext')
    }

    if (!schema) {
      throw new Error('Schema is not provided')
    }

    if (scopeContext) {
      this.path = utils.resolvePath(path, scopeContext.scope)
    } else {
      this.path = utils.resolvePath(path, '/')
    }

    this.schema = schema
    this.emitter = emitterContext.emitter
    this.options = optionsContext || DEFAULT_OPTIONS
    this.ref = new EmittingRef(providerContext.dataStorage, this.path, this.emitter)
    this.validator = new Validator(this.schema, this.options.validatorOptions)
    this.api = new FieldApi(this)
    this.inputRef = createRef()
    this.listeners = []

    this.emitter.emit(this.path, new events.RegisterFieldEvent(this.api))

    this.listeners.push(this.emitter.on(this.path, (event: events.BaseEvent) => {
      switch (event.type) {
        case events.ValueChangedEvent.TYPE:
          this.state.isInitiated && this.setState({})
          break
      }
    }, { objectify: true }) as Listener)

    if (fieldRef) {
      fieldRef(this.api)
    }

    this.state = {
      ...DEFAULT_STATE,
      isRequired: !!schema.presence,
      isReadonly: !!schema.readonly
    }
  }

  componentDidMount () {
    this._initiateField()
  }

  shouldComponentUpdate (nextProps: ComponentPropsWithContexts, nextState: State) {
    return nextState !== this.state
      || nextProps.providerContext !== this.props.providerContext
      || nextProps.optionsContext !== this.props.optionsContext
  }

  componentDidUpdate (prevProps: Readonly<ComponentPropsWithContexts>, prevState: Readonly<State>, snapshot?: any) {
    if (prevProps.providerContext !== this.props.providerContext) {
      // data context changed - the form has been reset
      // need to update the ref to the new data and init field
      this.ref = new EmittingRef(this.props.providerContext.dataStorage, this.path, this.emitter)

      this.setState({
        ...DEFAULT_STATE,
        isRequired: !!this.schema.presence,
        isReadonly: !!this.schema.readonly
      }, () => this.emitter.emit(this.path, new events.InvalidatedEvent()))

      this._initiateField()
    }

    if (prevProps.optionsContext !== this.props.optionsContext) {
      this.options = this.props.optionsContext || DEFAULT_OPTIONS

      if (prevProps.optionsContext && this.props.optionsContext) {
        if (prevProps.optionsContext.validatorOptions !== this.props.optionsContext.validatorOptions) {
          // default validator options changed - update validator
          this.validator = new Validator(this.schema, this.options.validatorOptions)

          if (this.state.isValidated) {
            this.api.validate().catch((e) => { throw e })
          } else {
            this.validator.validateRef(this.ref).catch((e) => { throw e })
          }

          this._processResolveSchema()
        }

        if (prevProps.optionsContext.descriptionResolver !== this.props.optionsContext.descriptionResolver) {
          // localization changed - revalidate if needed and refresh field
          if (this.state.isValidated) {
            this.emitter.emit(this.path, new events.ValidatedEvent())
          }
          this.forceUpdate()
        }
      }
    }
  }

  componentWillUnmount () {
    this.emitter.emit(this.path, new events.UnregisterFieldEvent(this.api))

    this.listeners.forEach((listener) => listener.off())
  }

  render () {
    return this.props.render(this.api, this.inputRef)
  }

  protected _initiateField () {
    this.validator.validateRef(this.ref)
      .then(() => {
        this.setState({ isInitiated: true })
      })
      .catch((e) => { throw e })

    this._processResolveSchema()
  }

  /**
   * If the field schema contains the "resolveSchema" keyword,
   * try to resolve it and update isRequired, isReadonly states.
   * If the "resolveSchema" keyword depends on the values of other fields,
   * subscribe to those fields and recalculate each time the value changes.
   */
  protected _processResolveSchema () {
    const resolveSchema = this.schema.resolveSchema

    if (resolveSchema) {
      const trackingRef = new TrackingRef(this.props.providerContext.dataStorage, this.ref.path)

      Promise.resolve(resolveSchema(trackingRef))
        .then((initiallyResolvedSchema) => {
          // resolves schema and applies state changes
          const handler = async (event: events.BaseEvent) => {
            if (event instanceof events.ValueChangedEvent) {
              const resolvedSchema = await resolveSchema(this.ref)
              const [isRequired, isReadonly] = this._extractMetadata(resolvedSchema)

              if (this.state.isValidated) {
                this.setState({ isValidating: true })

                const res = await this.validator.validateRef(this.ref)

                this.setState({
                  isRequired,
                  isReadonly,
                  isValid: res.valid,
                  isValidating: false,
                  message: extractMessageFromResult(res, this.ref)
                }, () => {
                  this.emitter.emit(this.ref.path, new events.ValidatedEvent())
                })
              } else if (isRequired !== this.state.isRequired || isReadonly !== this.state.isReadonly) {
                this.setState({ isRequired, isReadonly })
              }
            }
          }

          // subscribe to the props that affects resolvedSchema keyword
          trackingRef.propsToTrack.forEach((path) => {
            this.listeners.push(this.emitter.on(path, handler, { objectify: true }) as Listener)
          })

          // apply an initial state of the resolved schema
          const [isRequired, isReadonly] = this._extractMetadata(initiallyResolvedSchema)

          if (isRequired !== this.state.isRequired || isReadonly !== this.state.isReadonly) {
            this.setState({ isRequired, isReadonly })
          }
        }).catch((e) => {
          throw e
        })
    }
  }

  protected _extractMetadata (schema: types.ISchema): [isRequired: boolean, isReadonly: boolean] {
    const isRequired = typeof schema.presence === 'boolean'
      ? schema.presence : !!this.schema.presence
    const isReadonly = typeof schema.readonly === 'boolean'
      ? schema.readonly : !!this.schema.readonly

    return [isRequired, isReadonly]
  }
}

export default (props: ComponentProps) => (
  <FormProviderContext.Consumer>
    {(formContext) => (
      <ScopeContext.Consumer>
        {(scopeContext) => (
          <EmitterProviderContext.Consumer>
            {(emitterContext) => (
              <OptionsProviderContext.Consumer>
                {(optionsContext) => <FieldComponent
                  {...props}
                  providerContext={formContext as any}
                  scopeContext={scopeContext as any}
                  emitterContext={emitterContext as any}
                  optionsContext={optionsContext as any}
                />}
              </OptionsProviderContext.Consumer>
            )}
          </EmitterProviderContext.Consumer>
        )}
      </ScopeContext.Consumer>
    )}
  </FormProviderContext.Consumer>
)
