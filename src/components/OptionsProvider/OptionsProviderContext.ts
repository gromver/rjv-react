import { createContext } from 'react'
import { types } from 'rjv'

export type OptionsProviderContextValue = types.IModelOptionsPartial

export default createContext<OptionsProviderContextValue>({})
