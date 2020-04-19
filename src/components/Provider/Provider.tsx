/**
 *
 * Provider
 *
 */

import React, {
  createContext,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  memo
} from 'react'
import isEqual from 'lodash/isEqual'
import isEmpty from 'lodash/isEmpty'
import { Model, types } from 'rjv'
import { SchemaCollector } from '../SchemaCollector'

export const ProviderContext = createContext<ProviderContextValue | undefined>(undefined)

export type ProviderContextValue = {
  model: Model
  schemaCollector?: SchemaCollector
}

export type ProviderRef = {
  submit: () => void
}

type Props = {
  ref?: any, // React.RefObject<RjvRef> | undefined
  options?: types.IModelOptionsPartial,
  model?: Model,
  schema?: types.ISchema,
  data: any,
  children: React.ReactNode
}

function Provider (props: Props, ref) {
  const { data, options, children } = props

  const schema = useMemo(() => props.schema, [])

  /*
   Provide initial context
   */
  const initialContext = useMemo(() => {
    if (props.model) {
      const schema = props.model.getSchema()

      if (isEmpty(schema)) {
        const schemaCollector = new SchemaCollector()
        return { schemaCollector, model: props.model }
      }

      return { model: props.model }
    }

    if (schema) {
      const model = new Model(schema, data, options || {})

      return { model }
    }

    const schemaCollector = new SchemaCollector()
    const model = new Model({}, data, options || {})

    return { schemaCollector, model }
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
          schemaCollector: new SchemaCollector()
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
        const model = new Model(schema, data, options || {})

        model.prepare().then(() => setContext({ model }))
      } else {
        const schemaCollector = new SchemaCollector()
        const model = new Model({}, data, options || {})

        model.prepare().then(() => setContext({ schemaCollector, model }))
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
          .then(() => setContext({ schemaCollector, model }))
      }

      model
        .prepare()
        .then(() => setContext({ model }))
    }
  }, [props.model])

  useImperativeHandle(ref, () => {
    return {
      submit: async () => {
        const isValid = await context.model.validate()
        const firstError = isValid ? undefined : context.model.ref().firstError

        return { isValid, firstError }
      },
      model: (): Model => context.model
    }
  }, [context])

  return <ProviderContext.Provider
    value={context}
  >
    {children}
  </ProviderContext.Provider>
}

export default memo<Props>(forwardRef<ProviderRef, Props>(Provider), isEqual)
