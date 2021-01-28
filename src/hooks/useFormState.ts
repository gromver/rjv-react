import { useContext } from 'react'
import FormStateContext from '../contexts/FormStateContext'
import { FormState } from '../types'

export default function useFormState (): FormState {
  const formState = useContext(FormStateContext)

  if (!formState) {
    throw new Error('useFormState - form is not provided')
  }

  return formState
}
