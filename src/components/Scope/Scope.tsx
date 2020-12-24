/**
 *
 * Scope - changes root path context
 *
 */

import React, { useMemo, memo } from 'react'
import { utils, types } from 'rjv'
import ScopeContext, { ScopeContextValue } from './ScopeContext'
import { FormContext, FormContextValue } from '../FormProvider'

type PropsPartial = {
  path: types.Path
  children: React.ReactNode
}

type Props = PropsPartial & {
  formContext?: FormContextValue
  scopeContext?: ScopeContextValue
}

const Scope = memo<Props>((props: Props) => {
  const { path, children, scopeContext } = props

  const formContext = useMemo(() => {
    if (!props.formContext) {
      throw new Error('Received invalid formContext')
    }

    return props.formContext
  }, [props.formContext])

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

export default (props: PropsPartial) => (
  <FormContext.Consumer>
    {(formContext) => (
      <ScopeContext.Consumer>
        {(scopeContext) => <Scope {...props} formContext={formContext} scopeContext={scopeContext} />}
      </ScopeContext.Consumer>
    )}
  </FormContext.Consumer>
)
