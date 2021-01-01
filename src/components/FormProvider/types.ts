import { types } from 'rjv'

export interface IFieldState {
  isValid: boolean,
  isValidating: boolean,
  isValidated: boolean,
  isPristine: boolean,
  isTouched: boolean,
  isDirty: boolean,
  isRequired: boolean,
  isReadonly: boolean,
  message?: any
}

export interface IFieldApi {
  value: any
  state: IFieldState
  ref: types.IRef
  messageDescription: string | undefined
  validate (): Promise<types.IValidationResult>
  focus (): void
}

export type ValidationErrors = {path: string, message: string}[]

export type SubmitFormFn = () => Promise<{
  valid: boolean
  data?: any
  firstErrorField?: IFieldApi
}>
