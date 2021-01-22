import { createContext } from 'react'
import { SubmitFormFn, ValidateFieldsFn } from '../types'

export type FormContextValue = {
  submit: SubmitFormFn
  validate: ValidateFieldsFn
}

export default createContext<FormContextValue | undefined>(undefined)
