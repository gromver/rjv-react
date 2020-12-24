import { useContext, useState, useEffect } from 'react'
import { ValidationErrors } from '../components/FormProvider'
import { ErrorContext } from '../components/ErrorProvider'

export default function useErrors (): ValidationErrors {
  const [errors, setErrors] = useState<ValidationErrors>([])
  const errorContext = useContext(ErrorContext)

  useEffect(() => {
    if (errorContext) {
      return errorContext
        .subscribe((errors) => setErrors(errors))
    }
  }, [errorContext])

  return errors
}
