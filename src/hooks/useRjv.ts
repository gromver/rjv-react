import { useCallback, useContext } from 'react'
import { Model } from 'rjv'
import { ModelProviderContext, RefStoreApi, SubmitFormFn } from '../components/ModelProvider'
import { ScopeContext } from '../components/Scope'

type RjvApi = {
  submit: SubmitFormFn
  model: Model
  scope: string
} & RefStoreApi

export default function useRjv (): RjvApi | undefined {
  const modelProviderContext = useContext(ModelProviderContext)
  const scopeContext = useContext(ScopeContext)

  const submit = useCallback(async () => {
    if (modelProviderContext) {
      const { model, getRef } = modelProviderContext
      const isValid = await model.validate()
      const firstErrorRef = isValid ? undefined : model.ref().firstError
      const firstErrorComponent = firstErrorRef ? getRef(firstErrorRef.path) : undefined

      return { isValid, firstErrorRef, firstErrorComponent, model }
    }
  }, [modelProviderContext])

  if (modelProviderContext && scopeContext) {
    return {
      submit: submit as SubmitFormFn,
      model: modelProviderContext.model,
      getRef: modelProviderContext.getRef,
      setRef: modelProviderContext.setRef,
      unsetRef: modelProviderContext.unsetRef,
      scope: scopeContext.scope
    }
  }
}
