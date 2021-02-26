import { createContext } from 'react'
import { SubmitFormFn, SyncFormFn, TriggerFieldsFn } from '../types'

export type FormContextValue = {
  submit: SubmitFormFn
  sync: SyncFormFn
  validateFields: TriggerFieldsFn
  syncFields: TriggerFieldsFn
}

export default createContext<FormContextValue | undefined>(undefined)
