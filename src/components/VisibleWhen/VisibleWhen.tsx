/**
 *
 * VisibleWhen - shows children content when the data is correct
 *
 */

import React, {
  CSSProperties, ReactNode, useContext, useEffect, useMemo, useState
} from 'react'
import { types, Validator } from 'rjv'
import { Listener } from 'eventemitter2'
import { FormContext } from '../FormProvider'
import { EmitterProvider, EmitterContext, events } from '../EmitterProvider'
import { getPropsToObserveFromSchema, createEmitter } from '../../utils'
import ReadonlyRef from '../../refs/ReadonlyRef'
import usePath from '../../hooks/usePath'

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
  // using css visibility style and do not unmount children components
  // it is more efficient but keeps their validation state
  useVisibilityStyle?: boolean
  visibleStyles?: CSSProperties
  hiddenStyles?: CSSProperties
}

/**
 * VisibleWhen
 * @param path
 * @param schema
 * @param children
 * @param useVisibilityStyle
 * @param visibleStyles
 * @param hiddenStyles
 * @constructor
 */
export default function VisibleWhen (
  {
    path, schema, children, useVisibilityStyle, visibleStyles = {}, hiddenStyles = HIDDEN_EL_STYLES
  }: Props
) {
  const [visible, setVisible] = useState(false)
  const formContext = useContext(FormContext)
  const emitterContext = useContext(EmitterContext)

  const useMount = useMemo(() => !useVisibilityStyle, [])

  const _path = usePath(path ?? '')

  if (!formContext) {
    throw new Error('VisibleWhen - FormContext must be provided')
  }

  const ref = useMemo(
    () => new ReadonlyRef(formContext.dataStorage, _path),
    [_path, formContext!.dataStorage]
  )

  const validator = useMemo(() => new Validator(schema), [schema])

  const watchProps = useMemo(() => getPropsToObserveFromSchema(schema, _path), [_path])

  const innerEmitter = useMemo(() => {
    if (!useMount) {
      const emitter = createEmitter()

      if (emitterContext && visible) {
        // forward events
        emitter.onAny((path, event: events.BaseEvent) => emitterContext.emitter.emit(path, event))
      }

      return emitter
    }
  }, [useMount, emitterContext, visible])

  useEffect(() => {
    if (emitterContext?.emitter) {
      const listeners: Listener[] = []

      watchProps.forEach((path) => {
        const listener = emitterContext.emitter
          .on(path, async (event) => {
            if (event instanceof events.ValueChangedEvent) {
              const res = await validator.validateRef(ref)

              setVisible(res.valid)
            }
          }, { objectify: true }) as Listener
        listeners.push(listener)
      })

      validator.validateRef(ref).then((res) => {
        setVisible(res.valid)
      })

      return () => {
        listeners.forEach((listener) => listener.off())
      }
    }
  }, [emitterContext, innerEmitter, ref, watchProps, validator])

  if (useMount) {
    return visible ? children as any : null
  }

  return <EmitterProvider emitter={innerEmitter}>
    <div
      style={visible ? visibleStyles : hiddenStyles}
    >
      {children}
    </div>
  </EmitterProvider>
}
