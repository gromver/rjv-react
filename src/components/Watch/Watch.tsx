/**
 *
 * Watch - a component subscribes to data values changes
 *
 */

import {
  ReactElement, useContext, useEffect, useMemo, useState
} from 'react'
import _debounce from 'lodash/debounce'
import { types, utils } from 'rjv'
import { Listener } from 'eventemitter2'
import { ScopeContext } from '../Scope'
import { ProviderContext } from '../Provider'
import { EventEmitterContext, events } from '../EventEmitter'
import { EmittingRef } from '../../refs'

const DEFAULT_EVENT_TYPES = [events.ValueChangedEvent.TYPE]

type Props = {
  props: types.Path[]   // an empty array do not subscribes to events - just provides a root Ref
  events?: string[]     // an empty array allows tracking all types of events
  debounce?: number
  render: (ref: EmittingRef) => ReactElement | null
}

export default function Watch ({ render, props, events = DEFAULT_EVENT_TYPES, debounce = 0 }: Props) {
  const [, update] = useState<events.BaseEvent>()
  const providerContext = useContext(ProviderContext)
  const emitterContext = useContext(EventEmitterContext)
  const scopeContext = useContext(ScopeContext)

  const ref = useMemo(() => {
    if (providerContext && emitterContext) {
      return new EmittingRef(providerContext.dataStorage, '/', emitterContext.emitter)
    }

    throw new Error('providerContext doesn\'t exists')
  }, [providerContext])

  const watchProps = useMemo(() => {
    return props.map((path) => utils.resolvePath(path, scopeContext?.scope || '/'))
  }, [])

  const watchEvents: string[] = useMemo(() => {
    return events
  }, [])

  const handleUpdate = useMemo(() => {
    return debounce > 0 ? _debounce(update, debounce) : update
  }, [])

  useEffect(() => {
    if (emitterContext?.emitter && watchProps.length) {
      const listeners: Listener[] = []

      watchProps.forEach((path) => {
        const listener = emitterContext.emitter
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
  }, [])

  return render(ref)
}
