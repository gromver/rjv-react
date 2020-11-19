/**
 *
 * VisibleWhen - shows children content when the data is correct
 *
 */

import React, {
  CSSProperties, ReactNode, useContext, useEffect, useMemo, useState
} from 'react'
import { types, utils, Validator } from 'rjv'
import { ScopeContext } from '../Scope'
import { ProviderContext } from '../Provider'
import { EventEmitterContext } from '../EventEmitter'
import { Listener } from 'eventemitter2'
import { ValueChangedEvent } from '../EventEmitter/events'
import { getPropsToObserveFromSchema } from '../../utils'
import ReadonlyRef from '../../refs/ReadonlyRef'

const HIDDEN_EL_STYLES: CSSProperties = {
  visibility: 'hidden',
  position: 'absolute',
  overflow: 'hidden',
  width: 0,
  height: 0,
  left: -10000,
  top: -10000
}

type Props = {
  path?: types.Path             // absolute or relative path to data, by default root '/'
  schema: types.ISchema         // schema used to check data
  children: ReactNode           // content to be shown
  // using scc visibility style and do not unmount children components
  // it is more efficient but keeps their validation state
  useVisibilityStyle?: boolean
  visibleStyles?: CSSProperties
  hiddenStyles?: CSSProperties
}

export default function VisibleWhen (
  {
    path, schema, children, useVisibilityStyle, visibleStyles = {}, hiddenStyles = HIDDEN_EL_STYLES
  }: Props
) {
  const [visible, setVisible] = useState(false)
  const providerContext = useContext(ProviderContext)
  const emitterContext = useContext(EventEmitterContext)
  const scopeContext = useContext(ScopeContext)

  const useMount = useMemo(() => !useVisibilityStyle, [])
  const ref = useMemo(() => {
    const normalizedPath = utils.resolvePath(path || '', scopeContext?.scope || '/')

    if (providerContext) {
      return new ReadonlyRef(providerContext.dataStorage, normalizedPath)
    }

    throw new Error('providerContext doesn\'t exists')
  }, [])

  const validator = useMemo(() => new Validator(schema), [])

  const watchProps = useMemo(() => getPropsToObserveFromSchema(schema, ref.path), [])

  useEffect(() => {
    if (emitterContext?.emitter) {
      const listeners: Listener[] = []

      watchProps.forEach((path) => {
        const listener = emitterContext.emitter
          .on(path, async (event) => {
            if (event instanceof ValueChangedEvent) {
              const res = await validator.validateRef(ref)

              if (res.valid) {
                setVisible(true)
              } else {
                setVisible(false)
              }
            }
          }, { objectify: true }) as Listener
        listeners.push(listener)
      })

      validator.validateRef(ref).then((res) => {
        if (res.valid) {
          setVisible(true)
        } else {
          setVisible(false)
        }
      })

      return () => {
        listeners.forEach((listener) => listener.off())
      }
    }
  }, [])

  if (useMount) {
    return visible ? <>{children}</> : null
  }

  return <div
    style={visible ? visibleStyles : hiddenStyles}
  >
    {children}
  </div>
}
