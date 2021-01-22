import { useContext, useMemo } from 'react'
import { types, utils } from 'rjv'
import ScopeContext from '../contexts/ScopeContext'

export default function usePath (fieldPath: types.Path): types.Path {
  const scopeContext = useContext(ScopeContext)

  return useMemo(
    () => utils.resolvePath(fieldPath, scopeContext?.scope || '/'),
    [fieldPath, scopeContext?.scope]
  )
}
