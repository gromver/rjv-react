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
  memo
} from 'react'
import _isEqual from 'lodash/isEqual'
import _merge from 'lodash/merge'
import _cloneDeep from 'lodash/cloneDeep'
import { types, Storage } from 'rjv'
import ProviderContext, { FormProviderContextValue } from './FormProviderContext'
import { EmitterProvider, events } from '../EmitterProvider'
import { createEmitter } from '../../utils'
import { FieldApi } from '../Field'
import { SubmitFormFn, ValidationErrors } from './types'
import { Scope } from '../Scope'

const DEFAULT_VALIDATION_OPTIONS: Partial<types.IValidatorOptions> = {
  coerceTypes: false,
  removeAdditional: false
}

export type FormProviderRef = {
  submit: SubmitFormFn
  getData: () => any
  getErrors: () => ValidationErrors
}

type Props = {
  validationOptions?: Partial<types.IValidatorOptions>,
  data?: any,
  children: React.ReactNode
}

function FormProvider (props: Props, elRef: React.Ref<FormProviderRef>) {
  const { data, validationOptions, children } = props

  const { dataStorage, initialDataStorage, fields, emitter } = useMemo(() => {
    const emitter = createEmitter()

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
      dataStorage: new Storage(_cloneDeep(data)),
      initialDataStorage: new Storage(_cloneDeep(data)),
      fields: [] as FieldApi[]
    }
  }, [])

  const _validationOptions = useMemo(
    () => _merge({}, DEFAULT_VALIDATION_OPTIONS, validationOptions),
    []
  )

  const context = useMemo<FormProviderContextValue>(() => ({
    dataStorage,
    initialDataStorage,
    validationOptions: _validationOptions,
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
        data: dataStorage.get([])
      }
    },
    getData: () => dataStorage.get([]),
    getErrors: () => {
      const res: ValidationErrors = []

      fields.forEach((field) => {
        if (field.state.isValidated && !field.state.isValid) {
          res.push([field.ref.path, field.messageDescription as any])
        }
      })

      return res
    }
  }), [dataStorage, initialDataStorage, fields, _validationOptions])

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

  return <ProviderContext.Provider
    value={context}
  >
    <Scope path="/">
      <EmitterProvider emitter={emitter}>
        {children}
      </EmitterProvider>
    </Scope>
  </ProviderContext.Provider>
}

const forwardedRef = forwardRef<FormProviderRef, Props>(FormProvider)

export default memo<typeof forwardedRef>(forwardedRef, _isEqual)
