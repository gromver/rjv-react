import { createContext } from 'react'

export type ErrorsMap = { [path: string]: string }
export type SubscribeHandler = (errors: ErrorsMap) => void
export type Unsubscribe = () => void
export type Subscribe = (handler: SubscribeHandler) => Unsubscribe

export type ErrorProviderContextValue = {
  subscribe: Subscribe
  getErrors: () => ErrorsMap
}

export default createContext<ErrorProviderContextValue | undefined>(undefined)
