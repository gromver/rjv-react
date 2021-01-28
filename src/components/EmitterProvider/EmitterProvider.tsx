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
import EmitterContext, { EmitterContextValue } from '../../contexts/EmitterContext'
import { createEmitter } from '../../utils'

export type EmitterProviderRef = {
  emitter: EventEmitter2
}

type Props = {
  children: React.ReactNode,
  emitter?: EventEmitter2
}

function EmitterProvider (props: Props, ref: React.Ref<EmitterProviderRef>) {
  const { children, emitter } = props

  const context = useMemo<EmitterContextValue>(() => ({
    emitter: emitter || createEmitter()
  }), [emitter])  // recreate context

  useImperativeHandle(ref, () => {
    return context
  }, [context])

  return (
    <EmitterContext.Provider value={context}>
      {children}
    </EmitterContext.Provider>
  )
}

export default forwardRef<EmitterProviderRef, Props>(EmitterProvider)
