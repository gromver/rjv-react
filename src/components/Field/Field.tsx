/**
 *
 * Field - renders field and provides an api to interact with data and state
 *
 */

import React, {
  RefObject,
  useContext, useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { utils, types, Validator, ValidationMessage, Ref } from 'rjv'
import _isPlainObject from 'lodash/isPlainObject'
import {
  FormContext,
  FormContextValue,
  IField,
  IFieldState
} from '../FormProvider'
import { ScopeContext } from '../Scope'
import { EmitterContext, events } from '../EmitterProvider'
import { EventEmitter2, Listener } from 'eventemitter2'
import UpdaterContext from '../FormProvider/UpdaterContext'
import { EmittingRef } from '../../refs'

function extractMessageFromResult (res: types.IValidationResult, ref: types.IRef): ValidationMessage {
  return res.results[ref.path]
    ? res.results[ref.path]!.messages[0]
    : new ValidationMessage(false, 'react', 'The field has no validation rules, check the schema')
}

function extractStateFromSchema (schema: types.ISchema): Partial<IFieldState> {
  const isRequired = typeof schema.presence === 'boolean'
    ? schema.presence : false
  const isReadonly = typeof schema.readonly === 'boolean'
    ? schema.readonly : false

  return { isRequired, isReadonly }
}

export class FieldApi {
  constructor (private field: IField, private formContext: FormContextValue) {}

  set value (value: any) {
    this.field.ref().value = value
  }

  get value (): any {
    const value = this.field.ref().value

    return value === undefined ? this.field.schema.default : value
  }

  get state (): IFieldState {
    return this.formContext.getFieldState(this.field)
  }

  get ref (): types.IRef {
    return this.field.ref()
  }

  async validate (): Promise<types.IValidationResult> {
    const res = await this.field.validate()

    this.formContext.setFieldState(this.field, {
      isValid: res.valid,
      isTouched: true,
      isValidated: true,
      isValidating: false,
      message: extractMessageFromResult(res, this.field.ref())
    })

    this.field.emit(this.field.ref().path, new events.FieldValidatedEvent())

    return res
  }

  focus () {
    this.field.focus()
  }

  markAsTouched (): this {
    this.formContext.setFieldState(this.field, {
      isTouched: true,
      isPristine: false
    })

    this.field.emit(this.field.ref().path, new events.StateChangedEvent())

    return this
  }

  markAsPristine (): this {
    this.formContext.setFieldState(this.field, {
      isTouched: false,
      isValidated: false,
      isDirty: false,
      isPristine: true
    })

    this.field.emit(this.field.ref().path, new events.FieldInvalidatedEvent())

    return this
  }

  markAsDirty (): this {
    this.formContext.setFieldState(this.field, {
      isTouched: true,
      isDirty: true,
      isPristine: false
    })

    this.field.emit(this.field.ref().path, new events.StateChangedEvent())

    return this
  }

  markAsInvalidated (): this {
    this.formContext.setFieldState(this.field, {
      isValidated: false
    })

    this.field.emit(this.field.ref().path, new events.FieldInvalidatedEvent())

    return this
  }

  get messageDescription (): string | undefined {
    return this.formContext.getMessageDescription(this.field)
  }
}

type FieldProps = {
  render: (field: FieldApi, inputRef: RefObject<any>) => React.ReactElement
  path: types.Path
  schema: types.ISchema
}

export default function Field ({render, path, schema}: FieldProps) {
  const [, update] = useState({})
  const formContext = useContext(FormContext)
  const emitterContext = useContext(EmitterContext)
  const scopeContext = useContext(ScopeContext)
  useContext(UpdaterContext)

  if (!emitterContext) {
    throw new Error('Field - EmitterContext must be provided')
  }

  if (!formContext) {
    throw new Error('Field - FormContext must be provided')
  }

  if (!_isPlainObject(schema)) {
    throw new Error('Field - a schema object is not provided')
  }

  const inputRef = useRef<any>()
  const isInitiatedRef = useRef(false)
  const emitterRef = useRef<EventEmitter2>(emitterContext.emitter)
  const dataRef = useRef<types.IRef>(null as any)

  const _schema = useMemo(() => schema, [])

  const _path = useMemo(() => {
    if (scopeContext) {
      return utils.resolvePath(path, scopeContext.scope)
    } else {
      return utils.resolvePath(path, '/')
    }
  }, [])

  const _validator = useMemo(() => {
    return new Validator(_schema, formContext.options.validatorOptions)
  }, [])

  useMemo(
    () => dataRef.current = new EmittingRef(formContext.dataStorage, _path, emitterContext.emitter),
    [formContext.dataStorage, emitterContext.emitter]
  )

  // set default value silently using "default" keyword of the schema if it exists
  useMemo(
    () => {
      const ref = new Ref(formContext.dataStorage, _path)

      if (ref.value === undefined && _schema.default !== undefined) {
        ref.value = _schema.default
      }
    },
    [formContext.dataStorage]
  )

  useMemo(() => {
    emitterRef.current = emitterContext.emitter
  }, [emitterContext])

  useLayoutEffect(() => {
    // subscribe to the root emitter
    const listener = formContext.emitter.on(_path, (/* event: events.BaseEvent */) => {
      update({})
    }, {objectify: true}) as Listener

    return () => {
      listener.off()
    }
  }, [formContext.emitter])

  const field: IField = useMemo(() => {
    return {
      schema: _schema,
      ref: () => dataRef.current,
      emit: (path, event) => emitterRef.current.emit(path, event),
      validate: () => _validator.validateRef(dataRef.current),
      focus () {
        inputRef.current && inputRef.current.focus && inputRef.current.focus()
      },
      async init () {
        if (isInitiatedRef.current) {
          return
        }

        const res = await _validator.validateRef(dataRef.current)

        formContext.setFieldState(field, {
          ...extractStateFromSchema(_schema),
          isValid: res.valid,
          message: extractMessageFromResult(res, dataRef.current)
        })

        isInitiatedRef.current = true
      }
    }
  }, [])

  useLayoutEffect(() => {
    emitterContext.emitter.emit(_path, new events.RegisterFieldEvent(field))
  }, [emitterContext, field])

  const fieldApi: FieldApi = useMemo(() => {
    return new FieldApi(field, formContext)
  }, [formContext, field])

  useEffect(() => {
    return () => {
      emitterRef.current.emit(_path, new events.UnregisterFieldEvent(field))
    }
  }, [])

  return render(fieldApi as any, inputRef)
}
