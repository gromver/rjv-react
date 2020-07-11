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
import memoize from 'lodash/memoize'
import { Model, Ref, types } from 'rjv'
import { SchemaCollector } from '../SchemaCollector'
import { Scope } from '../Scope'

export const ProviderContext = createContext<ProviderContextValue | undefined>(undefined)

export type RefStoreApi = {
  getRef: (path: string) => Ref
  setRef: (path: string, el: React.ReactElement) => void
  unsetRef: (path: string) => void
}

export type ProviderContextValue = {
  model: Model
  schemaCollector?: SchemaCollector
} & RefStoreApi

export type ProviderRef = {
  submit: () => Promise<{
    isValid: boolean
    firstError?: Ref
    model: Model
  }>
  model: () => Model
}

type Props = {
  ref?: React.RefObject<ProviderRef | undefined>
  options?: types.IModelOptionsPartial,
  model?: Model,
  schema?: types.ISchema,
  data?: any,
  children: React.ReactNode
}

const getRefStoreApi = memoize((model: Model): RefStoreApi => {
  const refs = {}

  return {
    getRef: (path: string): Ref => refs[path],
    setRef: (path: string, el: React.ReactElement) => {
      refs[path] = el
    },
    unsetRef: (path: string) => {
      delete refs[path]
    }
  }
})

function Provider (props: Props, ref) {
  const { data, options, children } = props

  const schema = useMemo(() => props.schema, [])

  /*
   Provide initial context
   */
  const initialContext: ProviderContextValue = useMemo(() => {
    if (props.model) {
      const schema = props.model.getSchema()

      if (isEmpty(schema)) {
        const schemaCollector = new SchemaCollector()
        return { schemaCollector, model: props.model, ...getRefStoreApi(props.model) }
      }

      return { model: props.model, ...getRefStoreApi(props.model) }
    }

    if (schema) {
      const model = new Model(schema, data, options || {})

      return { model, ...getRefStoreApi(model) }
    }

    const schemaCollector = new SchemaCollector()
    const model = new Model({}, data, options || {})

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
        const model = new Model(schema, data, options || {})

        model.prepare().then(() => setContext({ model, ...getRefStoreApi(model) }))
      } else {
        const schemaCollector = new SchemaCollector()
        const model = new Model({}, data, options || {})

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
        const { model } = context
        const isValid = await model.validate()
        const firstError = isValid ? undefined : model.ref().firstError

        return { isValid, firstError, model }
      },
      model: (): Model => context.model
    }
  }, [context.model])

  return <ProviderContext.Provider
    value={context}
  >
    <Scope path="/">
      {children}
    </Scope>
  </ProviderContext.Provider>
}

export default memo<Props>(forwardRef<ProviderRef, Props>(Provider), isEqual)
