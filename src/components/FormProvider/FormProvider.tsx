/**
 *
 * FormProvider - a form context provider
 *
 */

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  useRef,
  useContext,
  useCallback
} from 'react'
import _cloneDeep from 'lodash/cloneDeep'
import _isEqual from 'lodash/isEqual'
import { types, Storage, ValidationMessage, utils } from 'rjv'
import { EventEmitter2 } from 'eventemitter2'
import { createEmitter } from '../../utils'
import {
  IField,
  FieldState,
  SubmitFormFn,
  TriggerFieldsFn,
  SyncFormFn,
  FormState
} from '../../types'
import { DEFAULT_OPTIONS } from './constants'
import { Scope } from '../Scope'
import { CatchErrors } from '../CatchErrors'
import { EmitterProvider, events } from '../EmitterProvider'
import UpdaterContext from '../../contexts/UpdaterContext'
import OptionsContext, { OptionsContextValue } from '../../contexts/OptionsContext'
import DataContext, { DataContextValue } from '../../contexts/DataContext'
import FieldContext from '../../contexts/FieldContext'
import FormContext, { FormContextValue } from '../../contexts/FormContext'
import FormStateContext from '../../contexts/FormStateContext'

function extractMessageFromResult (res: types.IValidationResult, ref: types.IRef): ValidationMessage {
  return res.results[ref.path]
    ? res.results[ref.path]!.messages[0]
    : new ValidationMessage(false, 'react', 'The field has no validation rules, check the schema')
}

function createDefaultStateFromSchema (schema: types.ISchema): FieldState {
  const isRequired = typeof schema.presence === 'boolean'
    ? schema.presence : false
  const isReadonly = typeof schema.readonly === 'boolean'
    ? schema.readonly : false

  return {
    isRequired,
    isReadonly,
    isValid: false,
    isValidating: false,
    isValidated: false,
    isPristine: true,
    isTouched: false,
    isDirty: false,
    isChanged: false
  }
}

const INITIAL_FORM_STATE: FormState = {
  isValid: false,
  isSubmitting: false,
  submitted: 0,
  isTouched: false,
  isDirty: false,
  isChanged: false
}

// FormUpdater
type FormUpdaterProps = {
  children: React.ReactNode
}

type FormUpdaterRef = {
  updateForm (): void
}

function FormUpdater ({ children }: FormUpdaterProps, elRef: React.Ref<FormUpdaterRef>) {
  const [updater, setUpdater] = useState({})

  useImperativeHandle(elRef, () => ({
    updateForm: () => setUpdater({})
  }))

  return <UpdaterContext.Provider value={updater}>{children}</UpdaterContext.Provider>
}

const FormUpdaterWithRef = forwardRef<FormUpdaterRef, FormUpdaterProps>(FormUpdater)

// FormProvider
type FormProviderProps = {
  children: React.ReactNode,
  data?: any
}

export default function FormProvider ({ data, children }: FormProviderProps) {
  const dataRef = useRef<any>(data)
  const updaterRef = useRef<FormUpdaterRef>(null)
  const emitterRef = useRef<EventEmitter2>()
  const formReadyRef = useRef(false)
  const optionsRef = useRef<OptionsContextValue>()
  const normalizeFormStateRef = useRef<() => void>()

  const [emitter, setEmitter] = useState(() => createEmitter())

  const [fields, setFields] = useState<Map<IField, FieldState>>(() => new Map())
  const curFieldsRef = useRef<Map<IField, FieldState>>(fields)
  const nextFieldsRef = useRef<Map<IField, FieldState>>(new Map())

  const [dataContext, setDataContext] = useState<DataContextValue>(() => ({
    dataStorage: new Storage(_cloneDeep(data)),
    initialDataStorage: new Storage(_cloneDeep(data))
  }))
  const dataContextRef = useRef<DataContextValue>(dataContext)

  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE)
  const formStateRef = useRef<FormState>(formState)

  useMemo(() => formStateRef.current = formState, [formState])

  const registerFieldHandler = useMemo(() => {
    nextFieldsRef.current = new Map<IField, FieldState>()

    const registerFieldHandler = (path: string, event: events.BaseEvent) => {
      // fields reconcile phase
      if (event instanceof events.RegisterFieldEvent) {
        nextFieldsRef.current.set(event.field, fields.get(event.field) ?? createDefaultStateFromSchema(event.field.schema()))
      }
    }

    emitter.onAny(registerFieldHandler)

    return registerFieldHandler
  }, [emitter])

  useEffect(() => {
    if (emitter !== emitterRef.current) {
      emitterRef.current = emitter

      // fields reconcile phase cancelled
      emitter.offAny(registerFieldHandler)

      emitter.on('**', (event: events.BaseEvent) => {
        if (
          event instanceof events.RegisterFieldEvent
          || event instanceof events.UnregisterFieldEvent
          || event instanceof events.ReconcileFieldsEvent
        ) {
          // a new field registered/unregistered after the fields have been reconciled
          // have to change emitter and reconcile fields again
          emitter.removeAllListeners()

          formReadyRef.current = false
          setEmitter(createEmitter())
        }
      })

      // apply reconciled fields map
      setFields(nextFieldsRef.current)
      curFieldsRef.current = nextFieldsRef.current
      formReadyRef.current = true
    }
  }, [emitter, registerFieldHandler])

  useEffect(() => {
    if (data !== dataRef.current) {
      dataRef.current = data

      fields.forEach((state, field) => {
        fields.set(field, createDefaultStateFromSchema(field.schema()))
      })

      const dataContext = {
        dataStorage: new Storage(_cloneDeep(data)),
        initialDataStorage: new Storage(_cloneDeep(data))
      }

      setDataContext(dataContext)
      dataContextRef.current = dataContext

      setFormState(INITIAL_FORM_STATE)

      updaterRef.current?.updateForm()
    }
  }, [data, fields])

  const optionsContext = useContext(OptionsContext)

  const options = useMemo(() => {
    return optionsRef.current = optionsContext || DEFAULT_OPTIONS
  }, [optionsContext])

  const getFieldState = useCallback((field: IField) => {
    return curFieldsRef.current.get(field) || createDefaultStateFromSchema(field.schema())
  }, [])

  const setFieldState = useCallback((field: IField, state: Partial<FieldState>) => {
    const curState = getFieldState(field)

    curFieldsRef.current.set(field, { ...curState, ...state })
  }, [])

  const getFields = useCallback((path: types.Path): IField[] => {
    return Array.from(curFieldsRef.current.keys()).filter((item) => item.ref().path === path)
  }, [])

  normalizeFormStateRef.current = useCallback(() => {
    const fieldStates = Array.from(fields.values())
    const isTouched = fieldStates.some((fieldState) => fieldState.isTouched)
    const isDirty = fieldStates.some((fieldState) => fieldState.isDirty)
    const isChanged = fieldStates.some((fieldState) => fieldState.isChanged)

    const _formState = { ...formState, ...{ isTouched, isDirty, isChanged } }

    if (!_isEqual(formState, _formState)) {
      setFormState(_formState)
    }
  }, [fields, dataContext, formState])

  const fieldsContext = useMemo(() => ({
    fields,
    emitter,
    getFields,
    getState: getFieldState,
    setState: setFieldState
  }), [fields, emitter])

  const ensureFormReady = useCallback(() => {
    return new Promise((res) => {
      function isReady () {
        if (formReadyRef.current) {
          res()
        } else {
          requestAnimationFrame(isReady)
        }
      }

      isReady()
    })
  }, [])

  const submit = useCallback<SubmitFormFn>(async (onSuccess, onError) => {
    await ensureFormReady()

    let firstErrorField: IField | undefined
    const fieldsArr = Array.from(curFieldsRef.current.keys())

    setFormState({ ...formStateRef.current, isSubmitting: true })

    const results = await new Promise((r) => setTimeout(r)).then(() => Promise.all(
      fieldsArr
        .map((field) => {
          return field.validate()
            .then((res) => {
              const curState = getFieldState(field)

              setFieldState(field, {
                ...curState,
                isValid: res.valid,
                isTouched: true,
                isValidated: true,
                isValidating: false,
                message: extractMessageFromResult(res, field.ref())
              })

              return res
            })
        })))

    const invalidResult = results.find((res) => !res.valid)
    if (invalidResult) {
      const i = results.indexOf(invalidResult)
      firstErrorField = fieldsArr[i]
    }

    // update view
    updaterRef.current?.updateForm()

    if (firstErrorField) {
      onError && await onError({
        path: firstErrorField.ref().path,
        focus: firstErrorField.focus,
        inputEl: firstErrorField.inputEl()
      })
    } else {
      onSuccess && await onSuccess(dataContextRef.current.dataStorage.get([]))
    }

    setFormState({
      ...formStateRef.current,
      isValid: !firstErrorField,
      isSubmitting: false,
      submitted: formStateRef.current.submitted + 1
    })
  }, [])

  const sync = useCallback<SyncFormFn>(async () => {
    await ensureFormReady()

    const fieldsArr = Array.from(curFieldsRef.current.keys())
    let isValid = !!fieldsArr.length

    await Promise.all(
      fieldsArr.map((field) => {
        return field.validate()
          .then((res) => {
            if (!res.valid) {
              isValid = false
            }
          })
      }))

    if (formStateRef.current.isValid !== isValid) {
      setFormState({
        ...formStateRef.current,
        isValid
      })
    }
  }, [])

  const validateFields = useCallback<TriggerFieldsFn>(async (path) => {
    await ensureFormReady()

    const _path = (Array.isArray(path) ? path : [path])
      .map((item) => utils.resolvePath(item, '/'))

    await Promise.all(
      Array
        .from(curFieldsRef.current.keys())
        .filter((field) => _path.includes(field.ref().path))
        .map((field) => {
          const fieldPath = field.ref().path

          setFieldState(field, {
            isValidating: true
          })

          field.emit(fieldPath, new events.FieldStateChangedEvent())

          return field.validate().then((res) => {
            setFieldState(field, {
              isValid: res.valid,
              isTouched: true,
              isValidated: true,
              isValidating: false,
              message: extractMessageFromResult(res, field.ref())
            })

            field.emit(fieldPath, new events.FieldValidatedEvent())
          })
        }))
  }, [])

  const syncFields = useCallback<TriggerFieldsFn>(async (path) => {
    await ensureFormReady()

    const _path = (Array.isArray(path) ? path : [path])
      .map((item) => utils.resolvePath(item, '/'))

    await Promise.all(
      Array
        .from(curFieldsRef.current.keys())
        .filter((field) => _path.includes(field.ref().path))
        .map((field) => {
          const fieldPath = field.ref().path

          return field.validate().then((res) => {
            setFieldState(field, {
              isValid: res.valid,
              message: extractMessageFromResult(res, field.ref())
            })

            field.emit(fieldPath, new events.FieldValidatedEvent())
          })
        }))
  }, [])

  const formContext = useMemo<FormContextValue>(() => ({
    submit,
    sync,
    validateFields,
    syncFields
  }), [submit, validateFields, syncFields, sync])

  useEffect(() => {
    emitter.onAny((path, event: events.BaseEvent) => {
      if (event instanceof events.FieldStateChangedEvent) {
        normalizeFormStateRef.current && normalizeFormStateRef.current()
      }
    })

    return () => {
      emitter.removeAllListeners()
    }
  }, [emitter])

  return <DataContext.Provider value={dataContext}>
    <FormContext.Provider value={formContext}>
      <FieldContext.Provider value={fieldsContext}>
        <OptionsContext.Provider value={options}>
          <Scope path="/">
            <EmitterProvider emitter={emitter}>
              <CatchErrors emitter={emitter}>
                <FormStateContext.Provider value={formState}>
                  <FormUpdaterWithRef ref={updaterRef}>
                    {children}
                  </FormUpdaterWithRef>
                </FormStateContext.Provider>
              </CatchErrors>
            </EmitterProvider>
          </Scope>
        </OptionsContext.Provider>
      </FieldContext.Provider>
    </FormContext.Provider>
  </DataContext.Provider>
}
