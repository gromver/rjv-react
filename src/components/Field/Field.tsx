/**
 *
 * Field - a HOC component over ModelRef and SchemaRef
 * resolves a model's ref using given path to the field
 * and determines which component should be used to subscribe to field events
 *
 */

import React, { useMemo } from 'react'
import { Ref, utils, types } from 'rjv'
import { Connect } from '../Connect'
import { ProviderContext, ProviderContextValue } from '../Provider'
import { ScopeContext, ScopeContextValue } from '../Scope'
import ModelRef from './ModelRef'
import SchemaRef from './SchemaRef'

type PropsPartial = {
  render: (ref: Ref) => React.ReactNode
  path: types.Path
  schema?: types.ISchema
  safe?: boolean
}
type Props = PropsPartial & {
  providerContext?: ProviderContextValue
  scopeContext?: ScopeContextValue
}

function Field (props: Props) {
  const { render, schema, scopeContext, safe = false } = props

  const providerContext = useMemo(() => {
    // todo check shape
    if (!props.providerContext) {
      throw new Error('Received invalid providerContext')
    }

    return props.providerContext
  }, [props.providerContext])

  const path = useMemo(() => {
    if (scopeContext) {
      return utils.resolvePath(props.path, scopeContext.scope)
    }

    return utils.resolvePath(props.path, '/')
  }, [props.path, scopeContext])

  if (safe) {
    return (
      <Connect
        render={(model) => <ModelRef field={model.safeRef(path)} render={render} />}
        observe={['/']}
        observeMode="validationAfter"
        debounce={0}
      />
    )
  }

  const ref = useMemo(() => {
    return providerContext.model.ref(path)
  }, [providerContext, path])

  if (schema && providerContext.schemaCollector) {
    return (
      <SchemaRef
        field={ref}
        render={render}
        schema={schema}
        schemaCollector={providerContext.schemaCollector}
      />
    )
  }

  return (
    <ModelRef
      field={ref}
      render={render}
    />
  )
}

export default (props: PropsPartial) => (
  <ProviderContext.Consumer>
    {(providerContext) => (
      <ScopeContext.Consumer>
        {(scopeContext) => <Field
          {...props}
          providerContext={providerContext}
          scopeContext={scopeContext}
        />}
      </ScopeContext.Consumer>
    )}
  </ProviderContext.Consumer>
)
