/**
 *
 * Field - a HOC component over ModelRef and SchemaRef
 * resolves a model's ref using given path to the field
 * and determines which component should be used to subscribe to field events
 *
 */

import React, {
  createRef,
  RefObject
} from 'react'
import { utils, Ref, types, Validator, ValidationMessage } from 'rjv'
import { ProviderContext, ProviderContextValue } from '../Provider'
import { ScopeContext, ScopeContextValue } from '../Scope'
import { EventEmitterContext, EventEmitterContextValue, events } from '../EventEmitter'
import { EventEmitter2, Listener } from 'eventemitter2'
import { descriptionResolver } from '../../utils'

export class FieldApi {
  constructor (private component: FieldComponent) {}

  set value (value: any) {
    this.component.setState({
      isTouched: true,
      isDirty: true,
      isPristine: false
    })

    this.component.ref.value = value
    this.component.emitter.emit(this.component.ref.path, new events.ValueChangedEvent())
  }

  get value (): any {
    return this.component.ref.value
  }

  get state (): State {
    return this.component.state
  }

  async validate (): Promise<types.IValidationResult> {
    this.component.setState({ isValidating: true })

    const res = await this.component.validator.validateData(this.component.ref.value)

    this.component.setState({
      isValid: res.valid,
      isTouched: true,
      isValidated: true,
      isValidating: false,
      message: res.results['/']
        ? res.results['/'].messages[0]
        : new ValidationMessage(false, 'react', 'The field has no validation rules, check the schema')
    }, () => {
      this.component.emitter.emit(this.component.ref.path, new events.ValidatedEvent())
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
    return !!this.component.schema.presence
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
  // uiState: 'pristine' | 'touched' | 'dirty',
  isPristine: boolean,
  isTouched: boolean,
  isDirty: boolean,
  message?: any
}

const DEFAULT_STATE: State = {
  isValid: false,
  isValidating: false,
  isValidated: false,
  isPristine: true,
  isTouched: false,
  isDirty: false
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
  ref: Ref
  validator: Validator
  api: FieldApi
  emitter: EventEmitter2
  inputRef: RefObject<any>
  listener: Listener

  constructor (props: ComponentPropsWithContexts) {
    super(props)

    const { path, schema, providerContext, scopeContext, emitterContext, fieldRef } = props

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

    this.ref = new Ref(providerContext.dataStorage, this.path)
    this.validator = new Validator(this.schema, providerContext.validationOptions)

    this.api = new FieldApi(this)
    this.inputRef = createRef()

    if (fieldRef) {
      fieldRef(this.api)
    }

    this.state = {
      ...DEFAULT_STATE
    }
  }

  componentDidMount () {
    this.props.emitterContext.emitter.emit(this.path, new events.RegisterFieldEvent(this.api))

    this.listener = this.emitter.on(this.path, (event: events.BaseEvent) => {
      // todo add events
      switch (event.type) {
        case events.ValueChangedEvent.TYPE:
          this.forceUpdate()
          break
      }
    }, { objectify: true }) as Listener
  }

  componentWillUnmount () {
    this.props.emitterContext.emitter.emit(this.path, new events.UnregisterFieldEvent(this.api))

    this.listener.off()
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
