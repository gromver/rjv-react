import { types } from 'rjv'
import { createContext } from 'react'

export type ScopeContextValue = {
  scope: types.Path
}

export const ScopeContext = createContext<ScopeContextValue | undefined>(undefined)

export default ScopeContext
