/**
 *
 * FormStateUpdater - updates isValid state of the form when data is changed
 *
 */

import { useCallback, useContext, useEffect, useMemo } from 'react'
import _debounce from 'lodash/debounce'
import { events } from '../EmitterProvider'
import FieldContext from '../../contexts/FieldContext'
import FormContext from '../../contexts/FormContext'

type Props = {
  debounce?: number
}

/**
 * FormStateUpdater
 * @param debounce
 * @constructor
 */
export default function FormStateUpdater ({ debounce = 300 }: Props) {
  const formContext = useContext(FormContext)
  const fieldContext = useContext(FieldContext)

  if (!formContext || !fieldContext) {
    throw new Error('FormStateUpdater - form is not provided')
  }

  const triggerUpdate = useMemo(() => {
    return debounce > 0
      ? _debounce(formContext.sync, debounce, { leading: true })
      : formContext.sync
  }, [debounce, formContext])

  const handleUpdate = useCallback((path: string, event: events.BaseEvent) => {
    if (event instanceof events.FieldValueChangedEvent) {
      triggerUpdate()
    }
  }, [formContext, triggerUpdate])

  useEffect(() => {
    fieldContext.emitter.onAny(handleUpdate)

    triggerUpdate()

    return () => {
      fieldContext.emitter.offAny(handleUpdate)
    }
  }, [fieldContext.emitter, handleUpdate, triggerUpdate])

  return null
}
