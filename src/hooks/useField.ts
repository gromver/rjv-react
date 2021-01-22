import { useContext } from 'react'
import { types } from 'rjv'
import FieldContext from '../contexts/FieldContext'
import usePath from './usePath'
import { IField } from '../types'

export default function useField (fieldPath: types.Path): IField[] | undefined {
  const fieldContext = useContext(FieldContext)

  if (!fieldContext) {
    throw new Error('useField - form is not provided')
  }

  const path = usePath(fieldPath)

  return fieldContext.getFields(path)
}
