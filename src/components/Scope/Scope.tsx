/**
 *
 * Scope - changes root path context
 *
 */

import React, { useMemo, memo, useContext } from 'react'
import { utils, types } from 'rjv'
import ScopeContext from './ScopeContext'
import FormContext from '../FormProvider/FormContext'

type Props = {
  path: types.Path
  children: React.ReactNode
}

const Scope = memo<Props>((props: Props) => {
  const { path, children } = props

  const formContext = useContext(FormContext)

  if (!formContext) {
    throw new Error('Scope - FormContext must be provided')
  }

  const scopeContext = useContext(ScopeContext)

  const context = useMemo(() => {
    if (scopeContext) {
      return {
        scope: utils.resolvePath(path, scopeContext.scope)
      }
    }

    return {
      scope: utils.resolvePath(path, '/')
    }
  }, [path, formContext, scopeContext])

  return <ScopeContext.Provider
    value={context}
  >
    {children}
  </ScopeContext.Provider>
})

export default Scope
