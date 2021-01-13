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
  memo,
  useState,
  useRef,
  useContext,
  useCallback
} from 'react'
import _cloneDeep from 'lodash/cloneDeep'
import { types, Storage, ValidationMessage } from 'rjv'
import FormContext, { FormContextValue } from './FormContext'
import UpdaterContext from './UpdaterContext'
import { EmitterProvider, events } from '../EmitterProvider'
import { createEmitter } from '../../utils'
import { SubmitFormFn, ValidationErrors, IField, IFieldState } from './types'
import { Scope } from '../Scope'
import { ErrorProvider } from '../ErrorProvider'
import { DEFAULT_OPTIONS } from './constants'
import { OptionsContext, OptionsContextValue } from '../OptionsProvider'
import { EventEmitter2 } from 'eventemitter2'

function extractMessageFromResult (res: types.IValidationResult, ref: types.IRef): ValidationMessage {
  return res.results[ref.path]
    ? res.results[ref.path]!.messages[0]
    : new ValidationMessage(false, 'react', 'The field has no validation rules, check the schema')
}

function createDefaultStateFromSchema (schema: types.ISchema): IFieldState {
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
    isDirty: false
  }
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
export type FormProviderRef = {
  submit: SubmitFormFn
  getData: () => any
  getField: (path: types.Path) => IField | undefined
  getErrors: () => ValidationErrors
}

type DataState = {
  initialData: any,
  dataStorage: types.IStorage,
  initialDataStorage: types.IStorage
}

type Props = {
  data?: any,
  children: React.ReactNode
}

function FormProvider (props: Props, elRef: React.Ref<FormProviderRef>) {
  const { data, children } = props
  const dataRef = useRef<any>(data)
  const updaterRef = useRef<FormUpdaterRef>(null)
  const emitterRef = useRef<EventEmitter2>()
  const fieldsRef = useRef<Map<IField, IFieldState>>(new Map())
  const nextFieldsRef = useRef<Map<IField, IFieldState>>(new Map())
  const optionsRef = useRef<OptionsContextValue>()

  const [emitter, setEmitter] = useState(() => createEmitter())
  const [dataState, setDataState] = useState<DataState>(() => ({
    initialData: _cloneDeep(data),
    dataStorage: new Storage(_cloneDeep(data)),
    initialDataStorage: new Storage(_cloneDeep(data))
  }))

  const registerFieldHandler = useMemo(() => {
    nextFieldsRef.current = new Map<IField, IFieldState>()

    const registerFieldHandler = (path: string, event: events.BaseEvent) => {
      // fields reconcile phase
      if (event instanceof events.RegisterFieldEvent) {
        nextFieldsRef.current.set(event.field, fieldsRef.current.get(event.field) ?? createDefaultStateFromSchema(event.field.schema()))
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
        if (event instanceof events.RegisterFieldEvent || event instanceof events.UnregisterFieldEvent) {
          // a new field registered/unregistered after the fields have been reconciled
          // have to change emitter and reconcile fields again
          emitter.removeAllListeners()

          setEmitter(createEmitter())
        }
      })

      // apply reconciled fields map
      fieldsRef.current = nextFieldsRef.current
    }
  }, [emitter, registerFieldHandler])

  useEffect(() => {
    if (data !== dataRef.current) {
      dataRef.current = data

      fieldsRef.current.forEach((state, field) => {
        fieldsRef.current.set(field, createDefaultStateFromSchema(field.schema()))
      })

      setDataState({
        initialData: _cloneDeep(data),
        dataStorage: new Storage(_cloneDeep(data)),
        initialDataStorage: new Storage(_cloneDeep(data))
      })

      updaterRef.current?.updateForm()
    }
  }, [data])

  const optionsContext = useContext(OptionsContext)

  const options = useMemo(() => {
    return optionsRef.current = optionsContext || DEFAULT_OPTIONS
  }, [optionsContext])

  const getFieldState = useCallback((field: IField) => {
    return fieldsRef.current.get(field) || createDefaultStateFromSchema(field.schema())
  }, [])

  const context = useMemo<FormContextValue>(() => ({
    options,
    emitter,
    dataStorage: dataState.dataStorage,
    initialDataStorage: dataState.initialDataStorage,
    submit: async () => {
      // todo refactor validation process to increase performance
      let firstErrorField: IField | undefined
      await Promise.all(
        Array
          .from(fieldsRef.current.keys())
          .map((field) => {
            return field.validate()
              .then((res) => {
                const curState = fieldsRef.current.get(field)

                fieldsRef.current.set(field, {
                  ...curState,
                  isValid: res.valid,
                  isTouched: true,
                  isValidated: true,
                  isValidating: false,
                  message: extractMessageFromResult(res, field.ref())
                } as IFieldState)

                if (!firstErrorField && !res.valid) {
                  firstErrorField = field
                }
              })
          }))

      // update view
      updaterRef.current?.updateForm()

      if (firstErrorField) {
        return {
          firstErrorField,
          valid: false
        }
      }

      return {
        valid: true,
        data: dataState.dataStorage.get([])
      }
    },
    getData: () => dataState.dataStorage.get([]),
    getField: (path) => Array.from(fieldsRef.current.keys()).find((item) => item.ref().path === path),
    getErrors: () => {
      const res: ValidationErrors = []

      fieldsRef.current.forEach((state, field) => {
        if (state.isValidated && !state.isValid) {
          const message = state.message && optionsRef.current?.descriptionResolver(state.message) || ''

          res.push({path: field.ref().path, message})
        }
      })

      return res
    },
    getFieldState,
    setFieldState: (field, state) => {
      const curState = getFieldState(field)

      fieldsRef.current.set(field, { ...curState, ...state })
    },
    getMessageDescription: (field) => {
      const state = fieldsRef.current.get(field)

      const message = state && (state.isValidated ? state.message : undefined)

      return message && optionsRef.current?.descriptionResolver(message)
    }
  }), [dataState, options, emitter, getFieldState])

  useEffect(() => {
    return () => {
      emitter.removeAllListeners()
    }
  }, [emitter])

  useImperativeHandle(elRef, () => {
    return {
      submit: context.submit,
      getData: context.getData,
      getField: context.getField,
      getErrors: context.getErrors
    }
  }, [context])

  return <FormContext.Provider
    value={context}
  >
    <Scope path="/">
      <EmitterProvider emitter={emitter}>
        <ErrorProvider emitter={emitter}>
          <FormUpdaterWithRef ref={updaterRef}>
            {children}
          </FormUpdaterWithRef>
        </ErrorProvider>
      </EmitterProvider>
    </Scope>
  </FormContext.Provider>
}

const forwardedRef = forwardRef<FormProviderRef, Props>(FormProvider)

export default memo<typeof forwardedRef>(forwardedRef)
