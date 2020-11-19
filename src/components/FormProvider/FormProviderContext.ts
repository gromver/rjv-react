import { createContext } from 'react'
import { types } from 'rjv'
import { SubmitFormFn, ValidationErrors } from './types'

export type FormProviderContextValue = {
  dataStorage: types.IStorage
  initialDataStorage: types.IStorage
  validationOptions: Partial<types.IValidatorOptions>
  submit: SubmitFormFn
  getData: () => any
  getErrors: () => ValidationErrors
}

export default createContext<FormProviderContextValue | undefined>(undefined)
