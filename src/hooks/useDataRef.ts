import { useContext, useMemo } from 'react'
import { types } from 'rjv'
import EmittingRef from '../refs/EmittingRef'
import usePath from './usePath'
import FormContext from '../components/FormProvider/FormContext'
import EmitterContext from '../components/EmitterProvider/EmitterContext'

export default function useDataRef (fieldPath: types.Path): types.IRef {
  const formContext = useContext(FormContext)
  const emitterContext = useContext(EmitterContext)

  if (!formContext) {
    throw new Error('useDataRef - FormContext must be provided')
  }

  if (!emitterContext) {
    throw new Error('useDataRef - EmitterContext must be provided')
  }

  const _path = usePath(fieldPath)

  return useMemo(
    () => new EmittingRef(formContext.dataStorage, _path, emitterContext.emitter),
    [_path, formContext.dataStorage, emitterContext.emitter]
  )
}
