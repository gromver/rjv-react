import React, { createContext } from 'react'
import { Model } from 'rjv'
import { SchemaCollector } from '../SchemaCollector'

export type RefStoreApi = {
  getRef: (path: string) => React.ReactElement | undefined
  setRef: (path: string, el: React.ReactElement) => void
  unsetRef: (path: string) => void
}

export type ModelProviderContextValue = {
  model: Model
  schemaCollector?: SchemaCollector
} & RefStoreApi

export default createContext<ModelProviderContextValue | undefined>(undefined)
