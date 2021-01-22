import { useCallback, useContext } from 'react'
import { types, utils } from 'rjv'
import FormContext from '../contexts/FormContext'
import ScopeContext from '../contexts/ScopeContext'

export default function useValidate (): (path: types.Path | types.Path[]) => Promise<void> {
  const scopeContext = useContext(ScopeContext)
  const formContext = useContext(FormContext)

  if (!formContext) {
    throw new Error('useValidate - FormContext must be provided')
  }

  return useCallback((path: types.Path | types.Path[]): Promise<void> => {
    const _path = (Array.isArray(path) ? path : [path])
      .map((item) => utils.resolvePath(item, scopeContext?.scope ?? '/'))

    return formContext.validate(_path)
  }, [formContext, scopeContext?.scope])
}
