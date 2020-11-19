/**
 *
 * Field - a component renders field and provides an api to interact with data and state
 *
 */

import React, {
  createRef,
  RefObject
} from 'react'
import { utils, types, Validator, ValidationMessage } from 'rjv'
import { ProviderContext, ProviderContextValue } from '../Provider'
import { ScopeContext, ScopeContextValue } from '../Scope'
import { EventEmitterContext, EventEmitterContextValue, events } from '../EventEmitter'
import { EventEmitter2, Listener } from 'eventemitter2'
import { descriptionResolver } from '../../utils'
import { TrackingRef, EmittingRef } from '../../refs'

function extractMessageFromResult (res: types.IValidationResult, ref: types.IRef): ValidationMessage {
  return res.results[ref.path]
    ? res.results[ref.path].messages[0]
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

  get messageDescription (): string | undefined {
    const message = this.component.state.isValidated ? this.component.state.message : undefined

    return message && descriptionResolver(message)
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
  message?: any
}

const DEFAULT_STATE: State = {
  isValid: false,
  isValidating: false,
  isValidated: false,
  isPristine: true,
  isTouched: false,
  isDirty: false,
  isRequired: false
}

type ComponentProps = {
  fieldRef?: (field: FieldApi) => void
  render: (field: FieldApi, inputRef: RefObject<any>) => React.ReactNode
  path: types.Path
  schema: types.ISchema
}

type ComponentPropsWithContexts = ComponentProps & {
  providerContext: ProviderContextValue
  scopeContext: ScopeContextValue
  emitterContext: EventEmitterContextValue
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

  constructor (props: ComponentPropsWithContexts) {
    super(props)

    const {
      path, schema, providerContext, scopeContext, emitterContext, fieldRef
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
    this.ref = new EmittingRef(providerContext.dataStorage, this.path, this.emitter)
    this.validator = new Validator(this.schema, providerContext.validationOptions)
    this.api = new FieldApi(this)
    this.inputRef = createRef()
    this.listeners = []

    this.emitter.emit(this.path, new events.RegisterFieldEvent(this.api))

    this.listeners.push(this.emitter.on(this.path, (event: events.BaseEvent) => {
      switch (event.type) {
        case events.ValueChangedEvent.TYPE:
          this.setState({})
          break
      }
    }, { objectify: true }) as Listener)

    if (fieldRef) {
      fieldRef(this.api)
    }

    this.state = {
      ...DEFAULT_STATE,
      isRequired: !!schema.presence
    }
  }

  componentDidMount () {
    this.validator.validateRef(this.ref).catch((e) => { throw e })

    const resolveSchema = this.schema.resolveSchema
    if (resolveSchema) {
      const trackingRef = new TrackingRef(this.props.providerContext.dataStorage, this.ref.path)
      Promise.resolve(resolveSchema(trackingRef)).then(() => {
        trackingRef.propsToTrack.forEach((path) => {
          this.listeners.push(this.emitter.on(path, async (event: events.BaseEvent) => {
            if (event instanceof events.ValueChangedEvent) {
              const resolvedSchema = await resolveSchema(this.ref)
              const isRequired = !!resolvedSchema.presence
              if (this.state.isValidated) {
                this.setState({ isValidating: true })

                const res = await this.validator.validateRef(this.ref)

                this.setState({
                  isRequired,
                  isValid: res.valid,
                  isValidating: false,
                  message: extractMessageFromResult(res, this.ref)
                }, () => {
                  this.emitter.emit(this.ref.path, new events.ValidatedEvent())
                })
              } else if (isRequired !== this.state.isRequired) {
                this.setState({ isRequired })
              }
            }
          }, { objectify: true }) as Listener)
        })
      }).catch((e) => {
        throw e
      })
    }
  }

  componentWillUnmount () {
    this.emitter.emit(this.path, new events.UnregisterFieldEvent(this.api))

    this.listeners.forEach((listener) => listener.off())
  }

  handleRegisterControl (el: any) {
    this.inputRef = el
  }

  render () {
    return this.props.render(this.api, this.inputRef)
  }
}

export default (props: ComponentProps) => (
  <ProviderContext.Consumer>
    {(providerContext) => (
      <ScopeContext.Consumer>
        {(scopeContext) => (
          <EventEmitterContext.Consumer>
            {(emitterContext) => <FieldComponent
              {...props}
              providerContext={providerContext as any}
              scopeContext={scopeContext as any}
              emitterContext={emitterContext as any}
            />}
          </EventEmitterContext.Consumer>
        )}
      </ScopeContext.Consumer>
    )}
  </ProviderContext.Consumer>
)
