/**
 *
 * Watch - a component subscribes to data values changes
 *
 */

import {
  ReactElement, useContext, useEffect, useMemo, useState
} from 'react'
import { Ref, types, utils } from 'rjv'
import { ScopeContext } from '../Scope'
import { ProviderContext } from '../Provider'
import { EventEmitterContext } from '../EventEmitter'
import { Listener } from 'eventemitter2'
import { BaseEvent, ValueChangedEvent } from '../EventEmitter/events'

type Props = {
  on: types.Path[]
  render: (ref: Ref) => ReactElement
}

export default function Watch ({ render, on }: Props) {
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

  useEffect(() => {
    if (emitterContext?.emitter) {
      const listeners: Listener[] = []

      watchProps.forEach((path) => {
        const listener = emitterContext.emitter
          .on(path, (event) => {
            if (event instanceof ValueChangedEvent) {
              update(event)
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
