import { FieldApi } from '../Field'

export type ValidationErrors = [path: string, message: string][]

export type SubmitFormFn = () => Promise<{
  valid: boolean
  data?: any
  firstErrorField?: FieldApi
}>
