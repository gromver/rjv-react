import { useContext, useMemo } from 'react'
import { types, utils } from 'rjv'
import { FormContext, IField } from '../components/FormProvider'
import { ScopeContext } from '../components/Scope'

export default function useField (fieldPath: types.Path): IField | undefined {
  const formContext = useContext(FormContext)
  const scopeContext = useContext(ScopeContext)

  if (!formContext) {
    throw new Error('useField - FormContext must be provided')
  }

  const path = useMemo(() => {
    return scopeContext
      ? utils.resolvePath(fieldPath, scopeContext.scope)
      : utils.resolvePath(fieldPath, '/')
  }, [fieldPath, scopeContext])

  return formContext.getField(path)
}
