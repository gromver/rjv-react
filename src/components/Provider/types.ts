import { FieldApi } from '../Field'

export type SubmitFormFn = () => Promise<{
  valid: boolean
  data?: any
  firstErrorField?: FieldApi
}>
