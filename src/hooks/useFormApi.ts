import { useContext, useMemo } from 'react'
import FormContext from '../contexts/FormContext'
import { FormApi } from '../types'

export default function useFormApi (): FormApi {
  const formContext = useContext(FormContext)

  if (!formContext) {
    throw new Error('useFormApi - form is not provided')
  }

  return useMemo(
    () => ({
      submit: formContext.submit,
      validateFields: formContext.validateFields,
      syncFields: formContext.syncFields,
      sync: formContext.sync
    }),
    [formContext]
  )
}
