/**
 *
 * EmitterProvider - an event emitter provider
 *
 */

import React, {
  forwardRef,
  useImperativeHandle,
  useMemo
} from 'react'
import { EventEmitter2 } from 'eventemitter2'
import EventEmitterContext, { EmitterProviderContextValue } from './EmitterProviderContext'
import { createEmitter } from '../../utils'

export type EmitterProviderRef = {
  emitter: EventEmitter2
}

type Props = {
  children: React.ReactNode,
  emitter?: EventEmitter2
}

function EmitterProvider (props: Props, ref) {
  const { children, emitter } = props

  const context = useMemo<EmitterProviderContextValue>(() => ({
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

export default forwardRef<EmitterProviderRef, Props>(EmitterProvider)
