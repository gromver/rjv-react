import { createContext } from 'react'
import { EventEmitter2 } from 'eventemitter2'

export type EventEmitterContextValue = {
  emitter: EventEmitter2
}

export default createContext<EventEmitterContextValue | undefined>(undefined)
