import React, { createContext } from 'react'
import { Model, Ref } from 'rjv'
import { SchemaCollector } from '../SchemaCollector'

export type RefStoreApi = {
  getRef: (path: string) => Ref
  setRef: (path: string, el: React.ReactElement) => void
  unsetRef: (path: string) => void
}

export type ProviderContextValue = {
  model: Model
  schemaCollector?: SchemaCollector
} & RefStoreApi

export const ProviderContext = createContext<ProviderContextValue | undefined>(undefined)

export default ProviderContext
