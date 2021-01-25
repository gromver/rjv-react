import { createContext } from 'react'
import { SubmitFormFn, CalcValidationStateFn, ValidateFieldsFn } from '../types'

export type FormContextValue = {
  submit: SubmitFormFn
  validate: ValidateFieldsFn
  calcValidationState: CalcValidationStateFn
}

export default createContext<FormContextValue | undefined>(undefined)
