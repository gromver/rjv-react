import { createContext } from 'react'
import { EventEmitter2 } from 'eventemitter2'

export type EmitterProviderContextValue = {
  emitter: EventEmitter2
}

export default createContext<EmitterProviderContextValue | undefined>(undefined)
