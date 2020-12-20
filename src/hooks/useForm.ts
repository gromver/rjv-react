import { useContext, useMemo } from 'react'
import { FormProviderContext, FormProviderRef } from '../components/FormProvider'
import { ScopeContext } from '../components/Scope'

type FormApi = {
  scope: string
} & FormProviderRef

export default function useForm (): FormApi | undefined {
  const providerContext = useContext(FormProviderContext)
  const scopeContext = useContext(ScopeContext)

  const api: FormApi | undefined = useMemo(() => {
    if (providerContext && scopeContext) {
      return {
        scope: scopeContext.scope,
        submit: providerContext.submit,
        getData: providerContext.getData,
        getField: providerContext.getField,
        getErrors: providerContext.getErrors
      }
    }

    return undefined
  }, [providerContext, scopeContext])

  return api
}
