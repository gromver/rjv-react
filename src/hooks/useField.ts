import { useContext, useMemo } from 'react'
import { types, utils } from 'rjv'
import { FormProviderContext } from '../components/FormProvider'
import { FieldApi } from '../components/Field'
import { ScopeContext } from '../components/Scope'

export default function useField (fieldPath: types.Path): FieldApi | undefined {
  const providerContext = useContext(FormProviderContext)
  const scopeContext = useContext(ScopeContext)

  const path = useMemo(() => {
    return scopeContext
      ? utils.resolvePath(fieldPath, scopeContext.scope)
      : utils.resolvePath(fieldPath, '/')
  }, [scopeContext])

  return useMemo(() => {
    if (providerContext) {
      return providerContext.getField(path) as FieldApi
    }

    return undefined
  }, [providerContext, path])
}
