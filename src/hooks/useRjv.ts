import { useContext } from 'react'
import { Model } from 'rjv'
import { ProviderContext, RefStoreApi } from '../components/Provider'
import { ScopeContext } from '../components/Scope'

type RjvApi = {
  model: Model
  scope: string
} & RefStoreApi

export default function useRjv (): RjvApi | undefined {
  const providerContext = useContext(ProviderContext)
  const scopeContext = useContext(ScopeContext)

  if (providerContext && scopeContext) {
    return {
      model: providerContext.model,
      getRef: providerContext.getRef,
      setRef: providerContext.setRef,
      unsetRef: providerContext.unsetRef,
      scope: scopeContext.scope
    }
  }
}
