import { createContext } from 'react'
import { types } from 'rjv'
import { SubmitFormFn, ValidationErrors, IFieldApi } from './types'

export type FormContextValue = {
  dataStorage: types.IStorage
  initialDataStorage: types.IStorage
  submit: SubmitFormFn
  getData: () => any
  getField: (path: types.Path) => IFieldApi | undefined
  getErrors: () => ValidationErrors
}

export default createContext<FormContextValue | undefined>(undefined)
