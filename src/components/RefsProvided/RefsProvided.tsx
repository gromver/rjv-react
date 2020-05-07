/**
 *
 * RefsProvided
 * If model refs provided - renders content, if not - nothing happens
 * Render function is supplied with a provided refs
 * Subscribes to whole model verification events to observe the refs tree changes
 *
 */

import React, { useMemo } from 'react'
import { utils, types, Ref } from 'rjv'
import { Connect } from '../Connect'
import { ProviderContext, ProviderContextValue } from '../Provider'
import { ScopeContext, ScopeContextValue } from '../Scope'

type PropsPartial = {
  render: (...args: Ref[]) => React.ReactNode
  paths?: types.Path[]
}
type Props = PropsPartial & {
  providerContext?: ProviderContextValue
  scopeContext?: ScopeContextValue
}

function Subscribe (props: Props) {
  const { render, scopeContext } = props

  const providerContext = useMemo(() => {
    // todo check shape
    if (!props.providerContext) {
      throw new Error('Received invalid providerContext')
    }

    return props.providerContext
  }, [props.providerContext])

  const observe = useMemo(() => {
    const paths = props.paths || []

    if (scopeContext) {
      return paths.map((path) => utils.resolvePath(path, scopeContext.scope))
    }

    return paths.map((path) => utils.resolvePath(path, '/'))
  }, [props.paths, scopeContext])

  return (
    <Connect
      model={providerContext.model}
      observeMode="validationAfter"
      debounce={0}
      render={(model) => {
        const refs = observe.map((path) => model.safeRef(path))

        return refs.some((item) => item === undefined) ? null : render(...refs as any)
      }}
    />
  )
}

export default (props: PropsPartial) => (
  <ProviderContext.Consumer>
    {(providerContext) => (
      <ScopeContext.Consumer>
        {(scopeContext) => <Subscribe
          {...props}
          providerContext={providerContext}
          scopeContext={scopeContext}
        />}
      </ScopeContext.Consumer>
    )}
  </ProviderContext.Consumer>
)
