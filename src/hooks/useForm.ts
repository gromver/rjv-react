import { useContext, useMemo } from 'react'
import { FormContext, FormProviderRef } from '../components/FormProvider'
import { ScopeContext } from '../components/Scope'

type FormApi = {
  scope: string
} & FormProviderRef

export default function useForm (): FormApi | undefined {
  const formContext = useContext(FormContext)
  const scopeContext = useContext(ScopeContext)

  const api: FormApi | undefined = useMemo(() => {
    if (formContext && scopeContext) {
      return {
        scope: scopeContext.scope,
        submit: formContext.submit,
        getData: formContext.getData,
        getField: formContext.getField,
        getErrors: formContext.getErrors
      }
    }

    return undefined
  }, [formContext, scopeContext])

  return api
}
