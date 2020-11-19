/**
 *
 * Watch - a component subscribes to data values changes
 *
 */

import {
  ReactElement, useContext, useEffect, useMemo, useState
} from 'react'
import _debounce from 'lodash/debounce'
import { Ref, types, utils } from 'rjv'
import { ScopeContext } from '../Scope'
import { ProviderContext } from '../Provider'
import { EventEmitterContext } from '../EventEmitter'
import { Listener } from 'eventemitter2'
import { BaseEvent, ValueChangedEvent } from '../EventEmitter/events'

const DEFAULT_EVENT_TYPES = [ValueChangedEvent.TYPE]

type Props = {
  on: types.Path[]
  eventTypes?: string[]
  debounce?: number
  render: (ref: Ref) => ReactElement | null
}

export default function Watch ({ render, on, eventTypes = DEFAULT_EVENT_TYPES, debounce = 0 }: Props) {
  const [, update] = useState<BaseEvent>()
  const providerContext = useContext(ProviderContext)
  const emitterContext = useContext(EventEmitterContext)
  const scopeContext = useContext(ScopeContext)

  const ref = useMemo(() => {
    if (providerContext) {
      return new Ref(providerContext.dataStorage, '/')
    }

    throw new Error('providerContext doesn\'t exists')
  }, [providerContext])

  const watchProps = useMemo(() => {
    return on.map((path) => utils.resolvePath(path, scopeContext?.scope || '/'))
  }, [])

  const watchEvents: string[] = useMemo(() => {
    return eventTypes
  }, [])

  const handleUpdate = useMemo(() => {
    return debounce > 0 ? _debounce(update, debounce) : update
  }, [])

  useEffect(() => {
    if (emitterContext?.emitter) {
      const listeners: Listener[] = []

      watchProps.forEach((path) => {
        const listener = emitterContext.emitter
          .on(path, (event: BaseEvent) => {
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
