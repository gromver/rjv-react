/**
 *
 * ErrorProvider - collects errors of the inner fields and provides a subscribe fn to the
 * validation state changes
 *
 */

import React, { ReactNode, useContext, useMemo } from 'react'
import { EventEmitter2, Listener } from 'eventemitter2'
import ErrorContext, {
  ErrorContextValue,
  Subscribe,
  SubscribeHandler,
  Unsubscribe
} from './ErrorContext'
import { EmitterProvider, EmitterContext, events } from '../EmitterProvider'
import { createEmitter } from '../../utils'
import FormContext from '../FormProvider/FormContext'
import { IField, FieldState, ValidationErrors } from '../FormProvider/types'

type Props = {
  emitter?: EventEmitter2,
  children: ReactNode
}

const VALIDATION_STATE_CHANGED_EVENTS = [events.FieldValidatedEvent.TYPE, events.FieldInvalidatedEvent.TYPE]

export default function ErrorProvider ({ emitter, children }: Props) {
  const emitterContext = useContext(EmitterContext)
  const formContext = useContext(FormContext)

  if (!formContext) {
    throw new Error('ErrorProvider - FormContext must be provided')
  }

  if (!emitterContext) {
    throw new Error('ErrorProvider - EmitterContext must be provided')
  }

  const { innerEmitter, context, fields } = useMemo(() => {
    const innerEmitter = emitter || createEmitter()

    const getErrors = () => {
      const res: ValidationErrors = []

      fields.forEach((field) => {
        const state = formContext.getFieldState(field) as FieldState

        if (state.isValidated && !state.isValid) {
          res.push({path: field.ref().path, message: formContext.getMessageDescription(field) as string})
        }
      })

      return res
    }

    const subscribe: Subscribe = (handler: SubscribeHandler): Unsubscribe => {
      const fieldListener: Listener = innerEmitter.on('**', (event: events.BaseEvent) => {
        if (VALIDATION_STATE_CHANGED_EVENTS.includes(event.type as any)) {
          handler(getErrors())
        }
      }, { objectify: true }) as Listener

      return () => {
        fieldListener.off()
      }
    }

    if (!emitter) {
      innerEmitter.onAny((path, event: events.BaseEvent) => {
        // register fields
        if (event instanceof events.RegisterFieldEvent) {
          fields.push(event.field)
        }

        // forward events to the upper emitter
        emitterContext.emitter.emit(path, event)
      })
    } else {
      innerEmitter.onAny((path, event: events.BaseEvent) => {
        // register fields
        if (event instanceof events.RegisterFieldEvent) {
          fields.push(event.field)
        }
      })
    }

    const context: ErrorContextValue = {
      subscribe,
      getErrors
    }

    return {
      innerEmitter,
      context,
      fields: [] as IField[]
    }
  }, [emitterContext, formContext])

  if (emitter) {
    return <ErrorContext.Provider value={context}>
      {children}
    </ErrorContext.Provider>
  }

  return <ErrorContext.Provider value={context}>
    <EmitterProvider emitter={innerEmitter}>
      {children}
    </EmitterProvider>
  </ErrorContext.Provider>
}
