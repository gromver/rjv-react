import { createContext } from 'react'
import { ValidationErrors } from '../FormProvider'

export type SubscribeHandler = (errors: ValidationErrors) => void
export type Unsubscribe = () => void
export type Subscribe = (handler: SubscribeHandler) => Unsubscribe

export type ErrorProviderContextValue = {
  subscribe: Subscribe
  getErrors: () => ValidationErrors
}

export default createContext<ErrorProviderContextValue | undefined>(undefined)
