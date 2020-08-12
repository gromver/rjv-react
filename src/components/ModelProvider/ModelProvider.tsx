/**
 *
 * Provider
 *
 */

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  useContext,
  memo
} from 'react'
import isEqual from 'lodash/isEqual'
import isEmpty from 'lodash/isEmpty'
import merge from 'lodash/merge'
import memoize from 'lodash/memoize'
import { Model, Ref, types } from 'rjv'
import ModelProviderContext, { ModelProviderContextValue, RefStoreApi } from './ModelProviderContext'
import { SchemaCollector } from '../SchemaCollector'
import { OptionsProviderContext } from '../OptionsProvider'
import { Scope } from '../Scope'

export type ModelProviderRef = {
  submit: () => Promise<{
    isValid: boolean
    firstErrorRef?: Ref
    firstErrorComponent?: React.ReactElement
    model: Model
  }>
  model: () => Model
}

type Props = {
  ref?: React.RefObject<ModelProviderRef | undefined>
  options?: types.IModelOptionsPartial,
  model?: Model,
  schema?: types.ISchema,
  data?: any,
  children: React.ReactNode
}

const getRefStoreApi = memoize((model: Model): RefStoreApi => {
  const refs = {}

  return {
    getRef: (path: string): React.ReactElement | undefined => refs[path],
    setRef: (path: string, el: React.ReactElement) => {
      refs[path] = el
    },
    unsetRef: (path: string) => {
      delete refs[path]
    }
  }
})

function ModelProvider (props: Props, ref) {
  const { data, options, children } = props

  const schema = useMemo(() => props.schema, [])

  const defaultOptions = useContext(OptionsProviderContext)

  const modelOptions = useMemo(() => {
    return merge({}, defaultOptions, options)
  }, [defaultOptions, options])

  /*
   Provide initial context
   */
  const initialContext: ModelProviderContextValue = useMemo(() => {
    if (props.model) {
      const schema = props.model.getSchema()

      if (isEmpty(schema)) {
        const schemaCollector = new SchemaCollector()
        return { schemaCollector, model: props.model, ...getRefStoreApi(props.model) }
      }

      return { model: props.model, ...getRefStoreApi(props.model) }
    }

    if (schema) {
      const model = new Model(schema, data, modelOptions)

      return { model, ...getRefStoreApi(model) }
    }

    const schemaCollector = new SchemaCollector()
    const model = new Model({}, data, modelOptions)

    return { schemaCollector, model, ...getRefStoreApi(model) }
  }, [])

  const [context, setContext] = useState(initialContext)

  /*
   Prepare model when component mounted
   */
  useEffect(() => {
    context.model.prepare().then(() => setContext({ ...context }))
  }, [])

  /*
    Handle schemaCollector changes
   */
  useEffect(() => {
    /*
      If schemaCollector exists it means that form works in "dynamic" mode and
      the schema of the model is being composed using schemas of the fields
     */
    if (context.schemaCollector) {
      /*
        Subscribe to "onInvalidated" event, when event is acquired handler creates new
        schemaCollector and recollects schemas from fields
       */
      context.schemaCollector.onInvalidated = () => {
        setContext({
          model: context.model,
          schemaCollector: new SchemaCollector(),
          ...getRefStoreApi(context.model)
        })
      }

      // all schemas are collected from all fields, have to apply them
      context.model.setSchema(context.schemaCollector.mergedSchema)
      context.model.prepare().then(() => setContext({ ...context }))
    }
  }, [context.schemaCollector])

  /*
    Recreates context when receiving data source changes, works if model is not supplied
   */
  useEffect(() => {
    // check if model is not supplied
    // also we dont need to recreate context after component mounting
    if (!props.model && !isEqual(context.model.ref().initialValue, data)) {
      if (schema) {
        const model = new Model(schema, data, modelOptions)

        model.prepare().then(() => setContext({ model, ...getRefStoreApi(model) }))
      } else {
        const schemaCollector = new SchemaCollector()
        const model = new Model({}, data, modelOptions)

        model.prepare().then(() => setContext({ schemaCollector, model, ...getRefStoreApi(model) }))
      }
    }
  }, [data, schema])

  /*
  Recreates context when receiving model source changes
 */
  useEffect(() => {
    const { model } = props

    // check if model exists
    // also we dont need to recreate context after component mounting
    if (model && context.model !== model) {
      const schema = model.getSchema()

      if (isEmpty(schema)) {
        const schemaCollector = new SchemaCollector()
        model
          .prepare()
          .then(() => setContext({ schemaCollector, model, ...getRefStoreApi(model) }))
      }

      model
        .prepare()
        .then(() => setContext({ model, ...getRefStoreApi(model) }))
    }
  }, [props.model])

  useImperativeHandle(ref, () => {
    return {
      submit: async () => {
        const { model, getRef } = context
        const isValid = await model.validate()
        const firstErrorRef = isValid ? undefined : model.ref().firstError
        const firstErrorComponent = firstErrorRef ? getRef(firstErrorRef.path) : undefined

        return { isValid, firstErrorRef, firstErrorComponent, model }
      },
      model: (): Model => context.model
    }
  }, [context.model])

  return <ModelProviderContext.Provider
    value={context}
  >
    <Scope path="/">
      {children}
    </Scope>
  </ModelProviderContext.Provider>
}

export default memo<Props>(forwardRef<ModelProviderRef, Props>(ModelProvider), isEqual)
