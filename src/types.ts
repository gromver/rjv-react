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
  message?: ValidationMessage
}

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

export type ValidateFieldsFn = (path: types.Path | types.Path[]) => Promise<void>

// Form
export type FormState = {
  isValid: boolean
  isSubmitting: boolean
  submitted: number
  // isValidating: boolean
  // isPristine: boolean
  // isTouched: boolean
  // isDirty: boolean
}

// Options
export type DescriptionResolverFn = (message: ValidationMessage) => string
