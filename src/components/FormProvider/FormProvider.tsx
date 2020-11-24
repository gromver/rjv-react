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
  useState
} from 'react'
import _cloneDeep from 'lodash/cloneDeep'
import { types, Storage } from 'rjv'
import FormProviderContext, { FormProviderContextValue } from './FormProviderContext'
import { EmitterProvider, events } from '../EmitterProvider'
import { createEmitter } from '../../utils'
import { FieldApi } from '../Field'
import { SubmitFormFn, ValidationErrors } from './types'
import { Scope } from '../Scope'

export type FormProviderRef = {
  submit: SubmitFormFn
  getData: () => any
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
  const [dataState, setDataState] = useState<DataState>(() => ({
    initialData: _cloneDeep(data),
    dataStorage: new Storage(_cloneDeep(data)),
    initialDataStorage: new Storage(_cloneDeep(data))
  }))

  const { fields, emitter } = useMemo(() => {
    const emitter = createEmitter()
    const fields: FieldApi[] = []

    emitter.onAny((path: string, event: events.BaseEvent) => {
      if (event instanceof events.RegisterFieldEvent) {
        fields.push(event.field)
      }
      if (event instanceof events.UnregisterFieldEvent) {
        const i = fields.indexOf(event.field)
        if (i !== -1) {
          fields.splice(i, 1)
        }
      }
    })

    return {
      emitter,
      fields
    }
  }, [])

  useEffect(() => {
    setDataState({
      initialData: _cloneDeep(data),
      dataStorage: new Storage(_cloneDeep(data)),
      initialDataStorage: new Storage(_cloneDeep(data))
    })
  }, [data])

  const context = useMemo<FormProviderContextValue>(() => ({
    dataStorage: dataState.dataStorage,
    initialDataStorage: dataState.initialDataStorage,
    submit: async () => {
      const results = await Promise.all(fields.map((item) => item.validate()))
      const invalidResult = results.find((res) => !res.valid)

      if (invalidResult) {
        const i = results.indexOf(invalidResult)
        return {
          valid: false,
          firstErrorField: fields[i]
        }
      }

      return {
        valid: true,
        data: dataState.dataStorage.get([])
      }
    },
    getData: () => dataState.dataStorage.get([]),
    getErrors: () => {
      const res: ValidationErrors = []

      fields.forEach((field) => {
        if (field.state.isValidated && !field.state.isValid) {
          res.push([field.ref.path, field.messageDescription as any])
        }
      })

      return res
    }
  }), [dataState, fields])

  useEffect(() => {
    return () => {
      emitter.removeAllListeners()
    }
  }, [])

  useImperativeHandle(elRef, () => {
    return {
      submit: context.submit,
      getData: context.getData,
      getErrors: context.getErrors
    }
  }, [context])

  return <FormProviderContext.Provider
    value={context}
  >
    <Scope path="/">
      <EmitterProvider emitter={emitter}>
        {children}
      </EmitterProvider>
    </Scope>
  </FormProviderContext.Provider>
}

const forwardedRef = forwardRef<FormProviderRef, Props>(FormProvider)

export default memo<typeof forwardedRef>(forwardedRef)
