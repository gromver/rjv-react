import { useContext, useEffect, useMemo, useState } from 'react'
import { types } from 'rjv'
import { Listener } from 'eventemitter2'
import DataContext from '../contexts/DataContext'
import EmitterContext from '../contexts/EmitterContext'
import EmittingRef from '../refs/EmittingRef'
import FieldContext from '../contexts/FieldContext'
import usePath from './usePath'
import { events } from '../components/EmitterProvider'

type SetValueFn = (value: any) => void

export default function useProperty<T extends any> (fieldPath: types.Path): [any, SetValueFn] {
  const [, update] = useState<events.BaseEvent>()
  const dataContext = useContext(DataContext)
  const emitterContext = useContext(EmitterContext)
  const fieldContext = useContext(FieldContext)

  if (!dataContext || !emitterContext || !fieldContext) {
    throw new Error('useProperty - form is not provided')
  }

  const path = usePath(fieldPath)

  const ref = useMemo(
    () => new EmittingRef(dataContext.dataStorage, path, emitterContext.emitter),
    [path, dataContext.dataStorage, emitterContext.emitter]
  )

  useEffect(() => {
    const listener = fieldContext.emitter
      .on(path, (event: events.BaseEvent) => {
        if (event instanceof events.FieldValueChangedEvent) {
          update(event)
        }
      }, { objectify: true }) as Listener

    return () => {
      listener.off()
    }
  }, [fieldContext.emitter, path])

  return [ref.value, (v) => ref.setValue(v)]
}
