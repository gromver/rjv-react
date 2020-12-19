import { useContext, useMemo } from 'react'
import { FormProviderContext, FormProviderRef } from '../components/FormProvider'
import { ScopeContext } from '../components/Scope'

type RjvApi = {
  scope: string
} & FormProviderRef

export default function useRjv (): RjvApi | undefined {
  const providerContext = useContext(FormProviderContext)
  const scopeContext = useContext(ScopeContext)

  const api: RjvApi | undefined = useMemo(() => {
    if (providerContext && scopeContext) {
      return {
        scope: scopeContext.scope,
        submit: providerContext.submit,
        getData: providerContext.getData,
        getErrors: providerContext.getErrors
      }
    }

    return undefined
  }, [providerContext, scopeContext])

  return api
}
