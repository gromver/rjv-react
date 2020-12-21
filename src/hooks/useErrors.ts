import { useContext, useState, useEffect } from 'react'
import { ValidationErrors } from '../components/FormProvider'
import { ErrorProviderContext } from '../components/ErrorProvider'

export default function useErrors (): ValidationErrors {
  const [errors, setErrors] = useState<ValidationErrors>([])
  const errorProviderContext = useContext(ErrorProviderContext)

  useEffect(() => {
    if (errorProviderContext) {
      return errorProviderContext
        .subscribe((errors) => setErrors(errors))
    }
  }, [errorProviderContext])

  return errors
}
