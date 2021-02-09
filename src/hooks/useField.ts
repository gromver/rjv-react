import {
  RefObject,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { types, Validator, ValidationMessage, Ref } from 'rjv'
import _isPlainObject from 'lodash/isPlainObject'
import _isEqual from 'lodash/isEqual'
import _isEqualWith from 'lodash/isEqualWith'
import _clone from 'lodash/clone'
import { EventEmitter2, Listener } from 'eventemitter2'
import { events } from '../components/EmitterProvider'
import EmitterContext from '../contexts/EmitterContext'
import FieldContext, { FieldContextValue } from '../contexts/FieldContext'
import UpdaterContext from '../contexts/UpdaterContext'
import DataContext from '../contexts/DataContext'
import OptionsContext, { OptionsContextValue } from '../contexts/OptionsContext'
import { EmittingRef } from '../refs'
import { IField, FieldApi, FieldState } from '../types'
import usePath from './usePath'

function extractMessageFromResult (res: types.IValidationResult, ref: types.IRef): ValidationMessage {
  return res.results[ref.path]
    ? res.results[ref.path]!.messages[0]
    : new ValidationMessage(false, 'react', 'The field has no validation rules, check the schema')
}

function extractStateFromSchema (schema: types.ISchema): Partial<FieldState> {
  const isRequired = typeof schema.presence === 'boolean'
    ? schema.presence : false
  const isReadonly = typeof schema.readonly === 'boolean'
    ? schema.readonly : false

  return { isRequired, isReadonly }
}

export function schemaEqualCustomizer (s1, s2) {
  if (typeof s1 === 'function' && typeof s2 === 'function') {
    return s1.toString() === s2.toString()
  }
}

const DONT_UPDATE_ON_EVENTS = [events.RegisterFieldEvent.TYPE, events.UnregisterFieldEvent.TYPE]

export type FieldInfo = {
  state: FieldState
  field: FieldApi
  inputRef: RefObject<any>
}

export default function useField (path: types.Path, schema: types.ISchema): FieldInfo {
  const [, update] = useState({})
  const fieldContext = useContext(FieldContext)
  const dataContext = useContext(DataContext)
  const emitterContext = useContext(EmitterContext)
  const optionsContext = useContext(OptionsContext)
  useContext(UpdaterContext)

  if (!emitterContext || !fieldContext || !dataContext || !optionsContext) {
    throw new Error('Field - form is not provided')
  }

  if (!_isPlainObject(schema)) {
    throw new Error('Field - a schema object is not provided')
  }

  const inputRef = useRef<any>()
  const isInitiatedRef = useRef(false)
  const dataRef = useRef<types.IRef>(null as any)
  const initialValueRef = useRef<any>()
  const schemaRef = useRef<types.ISchema>(null as any)
  const emitterRef = useRef<EventEmitter2>(null as any)
  const fieldsRef = useRef<FieldContextValue>(null as any)
  const optionsRef = useRef<OptionsContextValue>(null as any)
  const validatorRef = useRef<Validator>(null as any)

  const _schema = useMemo(() => {
    if (!_isEqualWith(schemaRef.current, schema, schemaEqualCustomizer)) {
      return schemaRef.current = schema
    }

    return schemaRef.current
  }, [schema])

  const _path = usePath(path)

  // set validator
  const _validator = useMemo(() => {
    return validatorRef.current = new Validator(_schema, optionsContext.validatorOptions)
  }, [_schema, optionsContext.validatorOptions])

  // set dataRef
  useMemo(
    () => dataRef.current = new EmittingRef(dataContext.dataStorage, _path, emitterContext.emitter),
    [dataContext.dataStorage, emitterContext.emitter, _path]
  )

  // set emitter
  useMemo(() => {
    emitterRef.current = emitterContext.emitter
  }, [emitterContext])

  // set field context
  useMemo(() => {
    fieldsRef.current = fieldContext
  }, [fieldContext])

  // set options context
  useMemo(() => {
    optionsRef.current = optionsContext
  }, [optionsContext])

  // set default value silently using "default" keyword of the schema if it exists
  useMemo(
    () => {
      const ref = new Ref(dataContext.dataStorage, _path)

      if (ref.value === undefined && _schema.default !== undefined) {
        ref.value = _schema.default
      }

      initialValueRef.current = _clone(ref.value)
    },
    [dataContext.dataStorage, _schema, _path]
  )

  useLayoutEffect(() => {
    // subscribe to the root emitter
    const listener = fieldContext.emitter.on(_path, (event: events.BaseEvent) => {
      if (!DONT_UPDATE_ON_EVENTS.includes(event.type as any)) {
        update({})
      }
    }, { objectify: true }) as Listener

    return () => {
      listener.off()
    }
  }, [fieldContext.emitter])

  const field: IField = useMemo(() => {
    return {
      schema: () => schemaRef.current,
      ref: () => dataRef.current,
      inputEl: () => inputRef.current,
      emit: (path, event) => emitterRef.current.emit(path, event),
      validate: () => validatorRef.current.validateRef(dataRef.current),
      focus: () => inputRef.current && inputRef.current.focus && inputRef.current.focus()
    }
  }, [])

  const api: FieldApi = useMemo(() => {
    return {
      set value (value: any) {
        dataRef.current.value = value

        const isChanged = !_isEqual(value, initialValueRef.current)

        if (fieldsRef.current.getState(field).isChanged !== isChanged) {
          fieldsRef.current.setState(field, { isChanged })

          emitterRef.current.emit(dataRef.current.path, new events.FieldStateChangedEvent())
        }
      },
      get value (): any {
        return dataRef.current.value
      },
      get ref (): types.IRef {
        return dataRef.current
      },
      get messageDescription (): string | undefined {
        const state = fieldsRef.current.getState(field)

        const message = state && (state.isValidated ? state.message : undefined)

        return message && optionsRef.current.descriptionResolver(message)
      },
      focus () {
        inputRef.current && inputRef.current.focus && inputRef.current.focus()
      },
      async validate (): Promise<types.IValidationResult> {
        fieldsRef.current.setState(field, {
          isValidating: true
        })
        emitterRef.current.emit(dataRef.current.path, new events.FieldStateChangedEvent())

        const res = await validatorRef.current.validateRef(dataRef.current)

        fieldsRef.current.setState(field, {
          isValid: res.valid,
          isTouched: true,
          isValidated: true,
          isValidating: false,
          message: extractMessageFromResult(res, dataRef.current)
        })

        emitterRef.current.emit(dataRef.current.path, new events.FieldValidatedEvent())

        return res
      },
      async sync (): Promise<void> {
        const res = await validatorRef.current.validateRef(dataRef.current)

        fieldsRef.current.setState(field, {
          isValid: res.valid,
          message: extractMessageFromResult(res, dataRef.current)
        })

        emitterRef.current.emit(dataRef.current.path, new events.FieldValidatedEvent())
      },
      dirty (): FieldApi {
        const curState = fieldsRef.current.getState(field)

        if (!curState.isTouched || !curState.isDirty || curState.isPristine) {
          fieldsRef.current.setState(field, {
            isTouched: true,
            isDirty: true,
            isPristine: false
          })

          emitterRef.current.emit(dataRef.current.path, new events.FieldStateChangedEvent())
        }

        return this
      },
      touched (): FieldApi {
        const curState = fieldsRef.current.getState(field)

        if (!curState.isTouched || curState.isPristine) {
          fieldsRef.current.setState(field, {
            isTouched: true,
            isPristine: false
          })

          emitterRef.current.emit(dataRef.current.path, new events.FieldStateChangedEvent())
        }

        return this
      },
      pristine (): FieldApi {
        const curState = fieldsRef.current.getState(field)

        if (curState.isTouched || curState.isValidated || curState.isDirty || !curState.isPristine) {
          fieldsRef.current.setState(field, {
            isTouched: false,
            isValidated: false,
            isDirty: false,
            isPristine: true
          })

          emitterRef.current.emit(dataRef.current.path, new events.FieldStateChangedEvent())
        }

        return this
      },
      invalidated (): FieldApi {
        const curState = fieldsRef.current.getState(field)

        if (curState.isValidated) {
          fieldsRef.current.setState(field, {
            isValidated: false
          })

          emitterRef.current.emit(dataRef.current.path, new events.FieldInvalidatedEvent())
        }

        return this
      }
    }
  }, [])

  useLayoutEffect(() => {
    emitterContext.emitter.emit(_path, new events.RegisterFieldEvent(field))
  }, [emitterContext.emitter, field])

  useLayoutEffect(() => {
    if (isInitiatedRef.current) {
      const ref = dataRef.current
      _validator.validateRef(ref).then((res) => {
        fieldsRef.current.setState(field, {
          ...extractStateFromSchema(schemaRef.current),
          isValid: res.valid,
          message: extractMessageFromResult(res, ref)
        })

        emitterRef.current.emit(_path, new events.FieldValidatedEvent())
      })
    }
  }, [_path, _validator])

  useEffect(() => {
    isInitiatedRef.current = true

    return () => {
      emitterRef.current.emit(_path, new events.UnregisterFieldEvent(field))
    }
  }, [])

  return {
    inputRef,
    field: api,
    state: fieldsRef.current.getState(field)
  }
}
