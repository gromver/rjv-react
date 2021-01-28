import { useContext, useMemo } from 'react'
import { types } from 'rjv'
import DataContext from '../contexts/DataContext'
import EmitterContext from '../contexts/EmitterContext'
import EmittingRef from '../refs/EmittingRef'
import usePath from './usePath'

export default function useDataRef (fieldPath: types.Path): types.IRef {
  const dataContext = useContext(DataContext)
  const emitterContext = useContext(EmitterContext)

  if (!dataContext || !emitterContext) {
    throw new Error('useDataRef - form is not provided')
  }

  const _path = usePath(fieldPath)

  return useMemo(
    () => new EmittingRef(dataContext.dataStorage, _path, emitterContext.emitter),
    [_path, dataContext.dataStorage, emitterContext.emitter]
  )
}
