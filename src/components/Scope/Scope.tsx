/**
 *
 * Scope
 *
 */

import React, { useMemo, memo } from 'react'
import { utils, types } from 'rjv'
import ScopeContext, { ScopeContextValue } from './ScopeContext'
import { ModelProviderContext, ModelProviderContextValue } from '../ModelProvider'

type PropsPartial = {
  path: types.Path
  children: React.ReactNode
}

type Props = PropsPartial & {
  providerContext?: ModelProviderContextValue
  scopeContext?: ScopeContextValue
}

const Scope = memo<Props>((props: Props, ref) => {
  const { path, children, scopeContext } = props

  const providerContext = useMemo(() => {
    // todo check shape
    if (!props.providerContext) {
      throw new Error('Received invalid providerContext')
    }

    return props.providerContext
  }, [props.providerContext])

  const context = useMemo(() => {
    if (scopeContext) {
      return {
        scope: utils.resolvePath(path, scopeContext.scope)
      }
    }

    return {
      scope: utils.resolvePath(path, '/')
    }
  }, [path, providerContext, scopeContext])

  return <ScopeContext.Provider
    value={context}
  >
    {children}
  </ScopeContext.Provider>
})

export default (props: PropsPartial) => (
  <ModelProviderContext.Consumer>
    {(providerContext) => (
      <ScopeContext.Consumer>
        {(scopeContext) => <Scope {...props} providerContext={providerContext} scopeContext={scopeContext} />}
      </ScopeContext.Consumer>
    )}
  </ModelProviderContext.Consumer>
)
