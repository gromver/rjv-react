import { useContext, useState, useEffect } from 'react'
import { ValidationErrors, UpdaterContext } from '../components/FormProvider'
import { ErrorContext } from '../components/ErrorProvider'

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
