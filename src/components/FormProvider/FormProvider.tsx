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
  useState, useRef
} from 'react'
import _cloneDeep from 'lodash/cloneDeep'
import { types, Storage } from 'rjv'
import FormContext, { FormContextValue } from './FormContext'
import { EmitterProvider, events } from '../EmitterProvider'
import { createEmitter } from '../../utils'
import { SubmitFormFn, ValidationErrors, IFieldApi } from './types'
import { Scope } from '../Scope'
import { ErrorProvider } from '../ErrorProvider'
import { FieldApi } from '../Field'

export type FormProviderRef = {
  submit: SubmitFormFn
  getData: () => any
  getField: (path: types.Path) => IFieldApi | undefined
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
  const dataRef = useRef(data)

  const [emitter, setEmitter] = useState(() => createEmitter())
  const emitterRef = useRef() as any

  const fieldsRef = useRef<FieldApi[]>([])

  const [dataState, setDataState] = useState<DataState>(() => ({
    initialData: _cloneDeep(data),
    dataStorage: new Storage(_cloneDeep(data)),
    initialDataStorage: new Storage(_cloneDeep(data))
  }))

  const registerFieldHandler = useMemo(() => {
    fieldsRef.current = []

    const registerFieldHandler = (path: string, event: events.BaseEvent) => {
      // fields reconcile phase
      if (event instanceof events.RegisterFieldEvent) {
        fieldsRef.current.push(event.field)
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
    }
  }, [emitter, registerFieldHandler])

  useEffect(() => {
    if (data !== dataRef.current) {
      dataRef.current = data

      setDataState({
        initialData: _cloneDeep(data),
        dataStorage: new Storage(_cloneDeep(data)),
        initialDataStorage: new Storage(_cloneDeep(data))
      })
    }
  }, [data])

  const context = useMemo<FormContextValue>(() => ({
    dataStorage: dataState.dataStorage,
    initialDataStorage: dataState.initialDataStorage,
    submit: async () => {
      const results = await Promise.all(fieldsRef.current.map((item) => item.validate()))
      const invalidResult = results.find((res) => !res.valid)

      if (invalidResult) {
        const i = results.indexOf(invalidResult)
        return {
          valid: false,
          firstErrorField: fieldsRef.current[i]
        }
      }

      return {
        valid: true,
        data: dataState.dataStorage.get([])
      }
    },
    getData: () => dataState.dataStorage.get([]),
    getField: (path) => fieldsRef.current.find((item) => item.ref.path === path),
    getErrors: () => {
      const res: ValidationErrors = []

      fieldsRef.current.forEach((field) => {
        if (field.state.isValidated && !field.state.isValid) {
          res.push([field.ref.path, field.messageDescription as any])
        }
      })

      return res
    }
  }), [dataState])

  useEffect(() => {
    return () => {
      emitter.removeAllListeners()
    }
  }, [])

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
        <ErrorProvider>
          {children}
        </ErrorProvider>
      </EmitterProvider>
    </Scope>
  </FormContext.Provider>
}

const forwardedRef = forwardRef<FormProviderRef, Props>(FormProvider)

export default memo<typeof forwardedRef>(forwardedRef)
