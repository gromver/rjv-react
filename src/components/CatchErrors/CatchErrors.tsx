/**
 *
 * CatchErrors - collects errors of the inner fields and provides a subscribe fn to the
 * validation state changes
 *
 */

import React, { ReactNode, useContext, useMemo } from 'react'
import { EventEmitter2, Listener } from 'eventemitter2'
import { EmitterProvider, events } from '../EmitterProvider'
import ErrorContext, {
  ErrorContextValue,
  Subscribe,
  SubscribeHandler,
  Unsubscribe
} from '../../contexts/ErrorContext'
import FieldContext from '../../contexts/FieldContext'
import OptionsContext from '../../contexts/OptionsContext'
import EmitterContext from '../../contexts/EmitterContext'
import { IField, ValidationErrors } from '../../types'
import { createEmitter } from '../../utils'

type CatchErrorsProps = {
  emitter?: EventEmitter2,
  children: ReactNode
}

const VALIDATION_STATE_CHANGED_EVENTS = [events.FieldValidatedEvent.TYPE, events.FieldInvalidatedEvent.TYPE]

export default function CatchErrors ({ emitter, children }: CatchErrorsProps) {
  const emitterContext = useContext(EmitterContext)
  const fieldsContext = useContext(FieldContext)
  const optionsContext = useContext(OptionsContext)

  if (!fieldsContext || !optionsContext || !emitterContext) {
    throw new Error('CatchErrors - form is not provided')
  }

  const innerEmitter = useMemo(() => emitter || createEmitter(), [emitter, emitterContext.emitter])

  const fields: IField[] = useMemo(() => [], [innerEmitter])

  const context: ErrorContextValue = useMemo(() => {
    const getErrors = () => {
      const res: ValidationErrors = []

      fields.forEach((field) => {
        const state = fieldsContext.getState(field)

        if (state.isValidated && !state.isValid) {
          res.push({path: field.ref().path, message: optionsContext.descriptionResolver(state.message as any)})
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

    return {
      subscribe,
      getErrors
    }
  }, [innerEmitter, emitterContext.emitter, fieldsContext, optionsContext])

  if (emitter) {
    return <ErrorContext.Provider value={context}>
      {children}
    </ErrorContext.Provider>
  }

  return (
    <ErrorContext.Provider value={context}>
      <EmitterProvider emitter={innerEmitter}>
        {children}
      </EmitterProvider>
    </ErrorContext.Provider>
  )
}
