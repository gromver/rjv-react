import { types, ValidationMessage } from 'rjv'
import { BaseEvent } from '../EmitterProvider/events'

export interface IFieldState {
  isValid: boolean,
  isValidating: boolean,
  isValidated: boolean,
  isPristine: boolean,
  isTouched: boolean,
  isDirty: boolean,
  isRequired: boolean,
  isReadonly: boolean,
  message?: ValidationMessage
}

export interface IField {
  schema: types.ISchema,
  ref (): types.IRef,
  emit (path: string, Event: BaseEvent): void,
  validate (): Promise<types.IValidationResult>
  init (): Promise<void>
  focus (): void
}

export type ValidationErrors = {path: string, message: string}[]

export type SubmitFormFn = () => Promise<{
  valid: boolean
  data?: any
  firstErrorField?: IField
}>
