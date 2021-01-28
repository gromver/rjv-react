/**
 *
 * Scope - changes root path context
 *
 */

import React, { useMemo, memo, useContext } from 'react'
import { utils, types } from 'rjv'
import ScopeContext from '../../contexts/ScopeContext'

type ScopeProps = {
  path: types.Path
  children: React.ReactNode
}

const Scope = memo<ScopeProps>((props: ScopeProps) => {
  const { path, children } = props

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
  }, [path, scopeContext])

  return (
    <ScopeContext.Provider value={context}>
      {children}
    </ScopeContext.Provider>
  )
})

export default Scope
