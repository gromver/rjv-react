import { useContext } from 'react'
import { Model } from 'rjv'
import { ModelProviderContext, RefStoreApi } from '../components/ModelProvider'
import { ScopeContext } from '../components/Scope'

type RjvApi = {
  model: Model
  scope: string
} & RefStoreApi

export default function useRjv (): RjvApi | undefined {
  const modelProviderContext = useContext(ModelProviderContext)
  const scopeContext = useContext(ScopeContext)

  if (modelProviderContext && scopeContext) {
    return {
      model: modelProviderContext.model,
      getRef: modelProviderContext.getRef,
      setRef: modelProviderContext.setRef,
      unsetRef: modelProviderContext.unsetRef,
      scope: scopeContext.scope
    }
  }
}
