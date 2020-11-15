import { useContext, useMemo } from 'react'
import { ProviderContext, ProviderRef } from '../components/Provider'
import { ScopeContext } from '../components/Scope'

type RjvApi = {
  scope: string
} & ProviderRef

export default function useRjv (): RjvApi | undefined {
  const providerContext = useContext(ProviderContext)
  const scopeContext = useContext(ScopeContext)

  const api: RjvApi | undefined = useMemo(() => {
    if (providerContext && scopeContext) {
      return {
        scope: scopeContext.scope,
        submit: providerContext.submit,
        getData: providerContext.getData
      }
    }

    return undefined
  }, [providerContext, scopeContext])

  return api
}
