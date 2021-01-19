import { useContext, useState, useEffect, useMemo } from 'react'
import { types, utils } from 'rjv'
import { FormContext } from '../components/FormProvider'
import { events } from '../components/EmitterProvider'
import { ScopeContext } from '../components/Scope'
import { ReadonlyRef } from '../refs'
import { Listener } from 'eventemitter2'

export default function useWatch (...props: types.Path[]): [getValue: (path: types.Path) => any, ...values: any[]] {
  const [, update] = useState<events.BaseEvent>()
  const formContext = useContext(FormContext)
  const scopeContext = useContext(ScopeContext)

  if (!formContext) {
    throw new Error('useWatch - FormContext must be provided')
  }

  const ref = useMemo(() => new ReadonlyRef(formContext.dataStorage, '/'), [formContext.dataStorage])

  const getValue = useMemo(() => {
    return (fieldPath: types.Path): any => {
      const path = scopeContext
        ? utils.resolvePath(fieldPath, scopeContext.scope)
        : utils.resolvePath(fieldPath, '/')

      return ref.ref(path).value
    }
  }, [ref])

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
        const listener = formContext.emitter
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
  }, [formContext.emitter, watchProps])

  return [getValue, ...watchRefs.map((item) => item.value)]
}
