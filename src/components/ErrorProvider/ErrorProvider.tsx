/**
 *
 * ErrorProvider - collects errors of the inner fields and provides a subscribe fn to the
 * validation state changes
 *
 */

import React, { ReactNode, useContext, useMemo } from 'react'
import { Listener } from 'eventemitter2'
import ErrorProviderContext, {
  ErrorProviderContextValue,
  Subscribe,
  SubscribeHandler,
  Unsubscribe
} from './ErrorProviderContext'
import { EmitterProvider, EmitterProviderContext, events } from '../EmitterProvider'
import { createEmitter } from '../../utils'
import { FieldApi } from '../Field'
import { ValidationErrors } from '../FormProvider'

type Props = {
  children: ReactNode
}

export default function ErrorProvider ({ children }: Props) {
  const emitterContext = useContext(EmitterProviderContext)

  const { emitter, context, fields } = useMemo(() => {
    const emitter = createEmitter()

    const getErrors = () => {
      const res: ValidationErrors = []

      fields.forEach((field) => {
        if (field.state.isValidated && !field.state.isValid) {
          res.push([field.ref.path, field.messageDescription as any])
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
    <EmitterProvider emitter={emitter}>
      {children}
    </EmitterProvider>
  </ErrorProviderContext.Provider>
}
