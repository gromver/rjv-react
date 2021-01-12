/**
 *
 * Watch - re-renders content when desired events of the certain field are acquired
 *
 */

import {
  ReactElement, useContext, useEffect, useMemo, useState
} from 'react'
import _debounce from 'lodash/debounce'
import { types, utils } from 'rjv'
import { Listener } from 'eventemitter2'
import { ScopeContext } from '../Scope'
import { FormContext } from '../FormProvider'
import { events } from '../EmitterProvider'
import { ReadonlyRef } from '../../refs'

const allowedEvents = [
  events.ValueChangedEvent.TYPE,
  events.FieldInvalidatedEvent.TYPE,
  events.FieldValidatedEvent.TYPE,
  events.RegisterFieldEvent.TYPE,
  events.UnregisterFieldEvent.TYPE
] as const

type EventTypeList = typeof allowedEvents[number][]

type WatchRenderFn = (
  ...args: any
  // getValue: (path?: types.Path) => any
) => ReactElement | null

type Props = {
  props: types.Path[]     // an empty array do not subscribes to events - just provides a root Ref
  events?: EventTypeList  // an empty array allows tracking all types of events
  debounce?: number
  render: WatchRenderFn
}

const DEFAULT_EVENT_TYPES: EventTypeList = [events.ValueChangedEvent.TYPE]

/**
 * Watch
 * @param render
 * @param props
 * @param events
 * @param debounce
 * @constructor
 */
export default function Watch ({ render, props, events = DEFAULT_EVENT_TYPES, debounce = 0 }: Props) {
  const [, update] = useState<events.BaseEvent>()
  const formContext = useContext(FormContext)
  // const emitterContext = useContext(EmitterContext)
  const scopeContext = useContext(ScopeContext)

  if (!formContext) {
    throw new Error('Watch - FormContext must be provided')
  }

  // if (!emitterContext) {
  //   throw new Error('Watch - EmitterContext must be provided')
  // }

  const ref = useMemo(() => new ReadonlyRef(formContext.dataStorage, '/'), [formContext.dataStorage])

  // const getField = useMemo(() => {
  //   if (formContext) {
  //     return (fieldPath: types.Path = ''): IField | undefined => {
  //       const path = scopeContext
  //       ? utils.resolvePath(fieldPath, scopeContext.scope)
  //       : utils.resolvePath(fieldPath, '/')
  //
  //       return formContext.getField(path)
  //     }
  //   }
  //
  //   throw new Error('formContext doesn\'t exists')
  // }, [formContext])

  // const getRef = useMemo(() => {
  //   return (fieldPath: types.Path = ''): ReadonlyRef => {
  //     const path = scopeContext
  //     ? utils.resolvePath(fieldPath, scopeContext.scope)
  //     : utils.resolvePath(fieldPath, '/')
  //
  //     return ref.ref(path)
  //   }
  // }, [ref])

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
  }, [])

  const watchRefs = useMemo(() => {
    return watchProps.map((path) => ref.ref(path))
  }, [ref])

  const watchEvents: string[] = useMemo(() => {
    return events
  }, [])

  const handleUpdate = useMemo(() => {
    return debounce > 0 ? _debounce(update, debounce) : update
  }, [])

  useEffect(() => {
    if (watchProps.length) {
      const listeners: Listener[] = []

      watchProps.forEach((path) => {
        const listener = formContext.emitter
          .on(path, (event: events.BaseEvent) => {
            if (watchEvents.length) {
              watchEvents.includes(event.type) && handleUpdate(event)
            } else {
              handleUpdate(event)
            }
          }, { objectify: true }) as Listener
        listeners.push(listener)
      })

      return () => {
        listeners.forEach((listener) => listener.off())
      }
    }
  }, [formContext.emitter, watchProps])

  const args = watchRefs.map((item) => item.value)

  return render(...args, getValue)
}
