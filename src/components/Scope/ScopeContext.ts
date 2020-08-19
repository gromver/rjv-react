import { types } from 'rjv'
import { createContext } from 'react'

export type ScopeContextValue = {
  scope: types.Path
}

export default createContext<ScopeContextValue | undefined>(undefined)
