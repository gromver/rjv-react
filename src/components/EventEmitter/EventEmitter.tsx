/**
 *
 * EventBus - an event bus provider
 *
 */

import React, {
  forwardRef,
  useImperativeHandle,
  useMemo
} from 'react'
import { EventEmitter2 } from 'eventemitter2'
import EventEmitterContext, { EventEmitterContextValue } from './EventEmitterContext'
import { createEmitter } from '../../utils'

export type EventEmitterRef = {
  emitter: EventEmitter2
}

type Props = {
  children: React.ReactNode,
  emitter?: EventEmitter2
}

function EventEmitter (props: Props, ref) {
  const { children, emitter } = props

  const context = useMemo<EventEmitterContextValue>(() => ({
    emitter: emitter || createEmitter()
  }), [])

  useImperativeHandle(ref, () => {
    return {
      emitter: context.emitter
    }
  }, [context.emitter])

  return (
    <EventEmitterContext.Provider value={context}>
      {children}
    </EventEmitterContext.Provider>
  )
}

export default forwardRef<EventEmitterRef, Props>(EventEmitter)
