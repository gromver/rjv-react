import { useContext, useState, useEffect, useMemo } from 'react'
import { types, utils } from 'rjv'
import { Listener } from 'eventemitter2'
import DataContext from '../contexts/DataContext'
import FieldContext from '../contexts/FieldContext'
import ScopeContext from '../contexts/ScopeContext'
import { events } from '../components/EmitterProvider'
import { ReadonlyRef } from '../refs'

export default function useWatch (...props: types.Path[]): any[] {
  const [, update] = useState<events.BaseEvent>()
  const dataContext = useContext(DataContext)
  const fieldContext = useContext(FieldContext)
  const scopeContext = useContext(ScopeContext)

  if (!fieldContext || !dataContext) {
    throw new Error('useWatch - form is not provided')
  }

  const ref = useMemo(
    () => new ReadonlyRef(dataContext.dataStorage, '/'),
    [dataContext.dataStorage]
  )

  const watchProps = useMemo(() => {
    return props.map((path) => utils.resolvePath(path, scopeContext?.scope || '/'))
  }, [props, scopeContext?.scope])

  const watchRefs = useMemo(() => {
    return watchProps.map((path) => ref.ref(path))
  }, [ref, watchProps])

  useEffect(() => {
    if (watchProps.length) {
      const listeners: Listener[] = []

      watchProps.forEach((path) => {
        const listener = fieldContext.emitter
          .on(path, (event: events.BaseEvent) => {
            if (event instanceof events.ValueChangedEvent) {
              update(event)
            }
          }, { objectify: true }) as Listener
        listeners.push(listener)
      })

      return () => {
        listeners.forEach((listener) => listener.off())
      }
    }
  }, [fieldContext.emitter, watchProps])

  return watchRefs.map((item) => item.value)
}
