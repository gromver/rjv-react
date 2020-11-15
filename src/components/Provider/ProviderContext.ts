import { createContext } from 'react'
import { types } from 'rjv'
import { SubmitFormFn } from './types'

export type ProviderContextValue = {
  dataStorage: types.IStorage
  initialDataStorage: types.IStorage
  validationOptions: Partial<types.IValidatorOptions>
  submit: SubmitFormFn
  getData: () => any
}

export default createContext<ProviderContextValue | undefined>(undefined)
