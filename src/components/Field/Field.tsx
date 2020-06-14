/**
 *
 * Field - a HOC component over ModelRef and SchemaRef
 * resolves a model's ref using given path to the field
 * and determines which component should be used to subscribe to field events
 *
 */

import React, { useEffect, useMemo } from 'react'
import { Ref, utils, types } from 'rjv'
import { Connect } from '../Connect'
import { ProviderContext, ProviderContextValue } from '../Provider'
import { ScopeContext, ScopeContextValue } from '../Scope'
import ModelRef from './ModelRef'
import { buildSchema } from './utils'

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
  const { render, scopeContext, safe = false } = props

  // Checking and getting providerContext. If the context is invalid, throw an exception.
  const providerContext = useMemo(() => {
    // todo check shape
    if (!props.providerContext) {
      throw new Error('Received invalid providerContext')
    }

    return props.providerContext
  }, [props.providerContext])

  const schema = useMemo(() => props.schema,[])

  // calculate absolute path considering scopes
  const path = useMemo(() => {
    if (scopeContext) {
      return utils.resolvePath(props.path, scopeContext.scope)
    }

    return utils.resolvePath(props.path, '/')
  }, [props.path, scopeContext])

  // if schema and schemaCollector were provided, apply this schema to the model
  useEffect(() => {
    if (schema && providerContext.schemaCollector) {
      const builtSchema = buildSchema(path, schema)

      providerContext.schemaCollector.add(builtSchema)
    }
  }, [providerContext.schemaCollector, path])

  // on destroy the schema of the model should be invalidated
  useEffect(() => () => {
    if (schema && providerContext.schemaCollector) {
      providerContext.schemaCollector.invalidate()
    }
  }, [])

  if (safe) {
    return (
      <Connect
        render={(model) => <ModelRef field={model.safeRef(path)} render={render} />}
        model={providerContext.model}
        observe={['/']}
        observeMode="validationAfter"
        debounce={0}
      />
    )
  }

  const ref = useMemo(() => {
    return providerContext.model.ref(path)
  }, [providerContext, path])

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
