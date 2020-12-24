import { createContext } from 'react'
import { ValidationErrors } from '../FormProvider'

export type SubscribeHandler = (errors: ValidationErrors) => void
export type Unsubscribe = () => void
export type Subscribe = (handler: SubscribeHandler) => Unsubscribe

export type ErrorContextValue = {
  subscribe: Subscribe
  getErrors: () => ValidationErrors
}

export default createContext<ErrorContextValue | undefined>(undefined)
