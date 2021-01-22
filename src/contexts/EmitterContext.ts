import { createContext } from 'react'
import { EventEmitter2 } from 'eventemitter2'

export type EmitterContextValue = {
  emitter: EventEmitter2
}

export default createContext<EmitterContextValue | undefined>(undefined)
