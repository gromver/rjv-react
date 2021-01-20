import { ReactElement } from 'react'
import { types, ValidationMessage } from 'rjv'
import { BaseEvent } from '../EmitterProvider/events'

export interface IField {
  schema (): types.ISchema
  ref (): types.IRef
  inputEl (): ReactElement
  emit (path: string, Event: BaseEvent): void
  validate (): Promise<types.IValidationResult>
  focus (): void
}

export type FieldState = {
  isValid: boolean
  isValidating: boolean
  isValidated: boolean
  isPristine: boolean
  isTouched: boolean
  isDirty: boolean
  isRequired: boolean
  isReadonly: boolean
  message?: ValidationMessage
}

export type ValidationErrors = {path: string, message: string}[]

export type FirstErrorField = {
  path: types.Path,
  focus: () => void,
  inputEl?: ReactElement
}

export type SubmitFormFn = () => Promise<{
  valid: boolean
  data?: any
  firstErrorField?: FirstErrorField
}>

export type FormApi = {
  submit: SubmitFormFn
  validate: (path: types.Path | types.Path[]) => Promise<void>
  getDataRef: (path?: types.Path) => types.IRef
  getErrors: () => ValidationErrors
}
