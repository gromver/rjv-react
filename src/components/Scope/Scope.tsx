/**
 *
 * Scope - changes root path context
 *
 */

import React, { useMemo, memo } from 'react'
import { utils, types } from 'rjv'
import ScopeContext, { ScopeContextValue } from './ScopeContext'
import { FormProviderContext, FormProviderContextValue } from '../FormProvider'

type PropsPartial = {
  path: types.Path
  children: React.ReactNode
}

type Props = PropsPartial & {
  providerContext?: FormProviderContextValue
  scopeContext?: ScopeContextValue
}

const Scope = memo<Props>((props: Props) => {
  const { path, children, scopeContext } = props

  const providerContext = useMemo(() => {
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
  <FormProviderContext.Consumer>
    {(providerContext) => (
      <ScopeContext.Consumer>
        {(scopeContext) => <Scope {...props} providerContext={providerContext} scopeContext={scopeContext} />}
      </ScopeContext.Consumer>
    )}
  </FormProviderContext.Consumer>
)
