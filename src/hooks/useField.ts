import { useContext } from 'react'
import { types } from 'rjv'
import { FormContext, IField } from '../components/FormProvider'
import usePath from './usePath'

export default function useField (fieldPath: types.Path): IField | undefined {
  const formContext = useContext(FormContext)

  if (!formContext) {
    throw new Error('useField - FormContext must be provided')
  }

  const path = usePath(fieldPath)

  return formContext.getField(path)
}
