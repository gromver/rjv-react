import { FormApi, FormState } from '../types'
import useFormApi from './useFormApi'
import useFormState from './useFormState'

export type FormInfo = {
  state: FormState
  form: FormApi
}

export default function useForm (): FormInfo {
  const state = useFormState()
  const form = useFormApi()

  return { state, form }
}
