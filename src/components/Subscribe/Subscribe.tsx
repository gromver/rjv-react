/**
 *
 * Subscribe - a HOC component over Connect
 *
 */

import React, { useMemo } from 'react'
import { utils, types } from 'rjv'
import { Connect, ObserveMode } from '../Connect'
import { ModelProviderContext, ModelProviderContextValue } from '../ModelProvider'
import { ScopeContext, ScopeContextValue } from '../Scope'

type PropsPartial = {
  render: (...args: any[]) => React.ReactNode
  to?: types.Path[]
  mode?: ObserveMode
  debounce?: number
}
type Props = PropsPartial & {
  providerContext?: ModelProviderContextValue
  scopeContext?: ScopeContextValue
}

function Subscribe (props: Props) {
  const { render, scopeContext, mode, debounce } = props

  const providerContext = useMemo(() => {
    // todo check shape
    if (!props.providerContext) {
      throw new Error('Received invalid providerContext')
    }

    return props.providerContext
  }, [props.providerContext])

  const observe = useMemo(() => {
    const to = props.to || []

    if (scopeContext) {
      return to.map((path) => utils.resolvePath(path, scopeContext.scope))
    }

    return to.map((path) => utils.resolvePath(path, '/'))
  }, [props.to, scopeContext])

  const refs = useMemo(() => {
    return observe.map((path) => providerContext.model.ref(path))
  }, [providerContext, observe])

  return (
    <Connect
      model={providerContext.model}
      observe={observe}
      observeMode={mode}
      debounce={debounce}
      render={render}
      args={refs}
    />
  )
}

export default (props: PropsPartial) => (
  <ModelProviderContext.Consumer>
    {(providerContext) => (
      <ScopeContext.Consumer>
        {(scopeContext) => <Subscribe
          {...props}
          providerContext={providerContext}
          scopeContext={scopeContext}
        />}
      </ScopeContext.Consumer>
    )}
  </ModelProviderContext.Consumer>
)
