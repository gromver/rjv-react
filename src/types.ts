import { ReactElement } from 'react'
import { types, ValidationMessage } from 'rjv'
import { BaseEvent } from './components/EmitterProvider/events'

// Field
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
  isChanged: boolean
  message?: ValidationMessage
}

export type FieldApi = {
  value: any
  ref: types.IRef
  validate: () => Promise<types.IValidationResult>
  focus: () => void
  dirty: () => FieldApi
  touched: () => FieldApi
  pristine: () => FieldApi
  invalidated: () => FieldApi
  messageDescription: string | undefined
}

// FieldArray
export type FieldArrayApi = {
  append: (value: any) => void
  prepend: (value: any) => void
  remove: (index: number) => void
  clear: () => void
  insert: (index: number, value: any) => void
  swap: (indexA: number, indexB: number) => void
  move: (from: number, to: number) => void
}

export type FieldArrayItem = { key: string, path: types.Path }

// Form
export type ValidationErrors = {path: string, message: string}[]

export type FirstErrorField = {
  path: types.Path,
  focus: () => void,
  inputEl?: ReactElement
}

export type SubmitFormFn = (
  onSuccess?: (data: any) => void | Promise<void>,
  onError?: (firstErrorField: FirstErrorField) => void | Promise<void>
) => void

export type CalcValidationStateFn = () => Promise<void>

export type ValidateFieldsFn = (path: types.Path | types.Path[]) => Promise<void>

export type FormState = {
  isValid: boolean
  isSubmitting: boolean
  submitted: number
  isTouched: boolean
  isDirty: boolean
  isChanged: boolean
}

export type FormApi = {
  submit: SubmitFormFn
  validate: ValidateFieldsFn
  getDataRef: (path?: types.Path) => types.IRef
  getErrors: () => ValidationErrors
}

// Options
export type DescriptionResolverFn = (message: ValidationMessage) => string
