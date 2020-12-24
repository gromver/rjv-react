import { useContext, useMemo } from 'react'
import { types, utils } from 'rjv'
import { FormContext } from '../components/FormProvider'
import { FieldApi } from '../components/Field'
import { ScopeContext } from '../components/Scope'

export default function useField (fieldPath: types.Path): FieldApi | undefined {
  const formContext = useContext(FormContext)
  const scopeContext = useContext(ScopeContext)

  const path = useMemo(() => {
    return scopeContext
      ? utils.resolvePath(fieldPath, scopeContext.scope)
      : utils.resolvePath(fieldPath, '/')
  }, [scopeContext])

  return useMemo(() => {
    if (formContext) {
      return formContext.getField(path) as FieldApi
    }

    return undefined
  }, [formContext, path])
}
