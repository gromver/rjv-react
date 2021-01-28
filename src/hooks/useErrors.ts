import { useContext, useState, useEffect } from 'react'
import UpdaterContext from '../contexts/UpdaterContext'
import ErrorContext from '../contexts/ErrorContext'
import { ValidationErrors } from '../types'

export default function useErrors (): ValidationErrors {
  const [errors, setErrors] = useState<ValidationErrors>([])
  const errorContext = useContext(ErrorContext)
  const updater = useContext(UpdaterContext)

  if (!errorContext) {
    throw new Error('useErrors - ErrorContext must be provided')
  }

  useEffect(() => {
    return errorContext
      .subscribe((errors) => setErrors(errors))
  }, [errorContext])

  useEffect(() => {
    setErrors(errorContext.getErrors())
  }, [updater, errorContext])

  return errors
}
