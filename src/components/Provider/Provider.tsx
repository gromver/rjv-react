/**
 *
 * Provider
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
import ProviderContext, { ProviderContextValue } from './ProviderContext'
import { EventEmitter } from '../EventEmitter'
import { createEmitter } from '../../utils'
import { BaseEvent, RegisterFieldEvent, UnregisterFieldEvent } from '../EventEmitter/events'
import { FieldApi } from '../Field'
import { SubmitFormFn } from './types'
import { Scope } from '../Scope'

const DEFAULT_VALIDATION_OPTIONS: Partial<types.IValidatorOptions> = {
  coerceTypes: false,
  removeAdditional: false
}

export type ProviderRef = {
  submit: SubmitFormFn
  getData: () => any
}

type Props = {
  validationOptions?: Partial<types.IValidatorOptions>,
  data?: any,
  children: React.ReactNode
}

function Provider (props: Props, elRef: React.Ref<ProviderRef>) {
  const { data, validationOptions, children } = props

  const { dataStorage, initialDataStorage, fields, emitter } = useMemo(() => {
    const emitter = createEmitter()

    emitter.onAny((path: string, event: BaseEvent) => {
      if (event instanceof RegisterFieldEvent) {
        fields.push(event.field)
      }
      if (event instanceof UnregisterFieldEvent) {
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

  const context = useMemo<ProviderContextValue>(() => ({
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
    getData: () => dataStorage.get([])
  }), [dataStorage, initialDataStorage, fields, _validationOptions])

  useEffect(() => {
    return () => {
      emitter.removeAllListeners()
    }
  }, [])

  useImperativeHandle(elRef, () => {
    return {
      submit: context.submit,
      getData: context.getData
    }
  }, [context])

  return <ProviderContext.Provider
    value={context}
  >
    <Scope path="/">
      <EventEmitter emitter={emitter}>
        {children}
      </EventEmitter>
    </Scope>
  </ProviderContext.Provider>
}

const forwardedRef = forwardRef<ProviderRef, Props>(Provider)

export default memo<typeof forwardedRef>(forwardedRef, _isEqual)
