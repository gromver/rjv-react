import { useContext, useMemo } from 'react'
import { FormContext, FormApi } from '../components/FormProvider'

export default function useForm (): FormApi {
  const formContext = useContext(FormContext)

  if (!formContext) {
    throw new Error('useForm - FormContext must be provided')
  }

  return useMemo(() => ({
    submit: formContext.submit,
    validate: formContext.validate,
    getDataRef: formContext.getDataRef,
    getErrors: formContext.getErrors
  }), [formContext])
}
