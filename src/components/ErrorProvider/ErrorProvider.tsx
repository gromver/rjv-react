/**
 *
 * ErrorProvider - collects errors of the inner fields and provides a subscribe fn to the
 * validation state changes
 *
 */

import React, { ReactNode, useContext, useMemo } from 'react'
import { Listener } from 'eventemitter2'
import ErrorContext, {
  ErrorContextValue,
  Subscribe,
  SubscribeHandler,
  Unsubscribe
} from './ErrorContext'
import { EmitterProvider, EmitterContext, events } from '../EmitterProvider'
import { createEmitter } from '../../utils'
import { FieldApi } from '../Field'
import { ValidationErrors } from '../FormProvider/types'

type Props = {
  children: ReactNode
}

const VALIDATION_STATE_CHANGED_EVENTS = [events.ValidatedEvent.TYPE, events.InvalidatedEvent.TYPE]

export default function ErrorProvider ({ children }: Props) {
  const emitterContext = useContext(EmitterContext)

  const { emitter, context, fields } = useMemo(() => {
    const emitter = createEmitter()

    const getErrors = () => {
      const res: ValidationErrors = []

      fields.forEach((field) => {
        if (field.state.isValidated && !field.state.isValid) {
          res.push({path: field.ref.path, message: field.messageDescription as any})
        }
      })

      return res
    }

    const subscribe: Subscribe = (handler: SubscribeHandler): Unsubscribe => {
      const listener: Listener = emitter.on('**', (event: events.BaseEvent) => {
        if (VALIDATION_STATE_CHANGED_EVENTS.includes(event.type as any)) {
          handler(getErrors())
        }
      }, { objectify: true }) as Listener

      return () => listener.off()
    }

    if (emitterContext) {
      emitter.onAny((path, event: events.BaseEvent) => {
        if (event instanceof events.RegisterFieldEvent) {
          fields.push(event.field)
        }
        if (event instanceof events.UnregisterFieldEvent) {
          const i = fields.indexOf(event.field)
          if (i !== -1) {
            fields.splice(i, 1)
          }
        }

        emitterContext.emitter.emit(path, event)
      })
    }

    const context: ErrorContextValue = {
      subscribe,
      getErrors
    }

    return {
      emitter,
      context,
      fields: [] as FieldApi[]
    }
  }, [emitterContext])

  return <ErrorContext.Provider value={context}>
    <EmitterProvider emitter={emitter}>
      {children}
    </EmitterProvider>
  </ErrorContext.Provider>
}
