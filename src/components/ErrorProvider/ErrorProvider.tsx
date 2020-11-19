/**
 *
 * VisibleWhen - shows children content when the data is correct
 *
 */

import React, { ReactNode, useContext, useMemo } from 'react'
import ErrorProviderContext, {
  ErrorProviderContextValue,
  Subscribe,
  SubscribeHandler,
  Unsubscribe
} from './ErrorProviderContext'
import { EventEmitter, EventEmitterContext } from '../EventEmitter'
import { Listener } from 'eventemitter2'
import * as events from '../EventEmitter/events'
import { createEmitter } from '../../utils'
import { FieldApi } from '../Field'
import { RegisterFieldEvent, UnregisterFieldEvent } from '../EventEmitter/events'

type Props = {
  children: ReactNode
}

export default function ErrorProvider ({ children }: Props) {
  const emitterContext = useContext(EventEmitterContext)

  const { emitter, context, fields } = useMemo(() => {
    const emitter = createEmitter()

    const getErrors = () => {
      const res = {}

      fields.forEach((field) => {
        if (field.state.isValidated && !field.state.isValid) {
          res[field.ref.path] = field.messageDescription
        }
      })

      return res
    }

    const subscribe: Subscribe = (handler: SubscribeHandler): Unsubscribe => {
      const listener: Listener = emitter.on('**', (event) => {
        if (event instanceof events.ValidatedEvent) {
          handler(getErrors())
        }
      }, { objectify: true }) as Listener

      return () => listener.off()
    }

    if (emitterContext) {
      emitter.onAny((path, event: events.BaseEvent) => {
        if (event instanceof RegisterFieldEvent) {
          fields.push(event.field)
        }
        if (event instanceof UnregisterFieldEvent) {
          const i = fields.indexOf(event.field)
          if (i !== -1) {
            fields.splice(i, 1)
          }
        }

        emitterContext.emitter.emit(path, event)
      })
    }

    const context: ErrorProviderContextValue = {
      subscribe,
      getErrors
    }

    return {
      emitter,
      context,
      fields: [] as FieldApi[]
    }
  }, [])

  return <ErrorProviderContext.Provider value={context}>
    <EventEmitter emitter={emitter}>
      {children}
    </EventEmitter>
  </ErrorProviderContext.Provider>
}
