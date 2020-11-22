import React, { useContext, useEffect, useState } from 'react'
import { FieldApi } from '../components/Field'
import { ValidationErrors } from '../components/FormProvider'
import ErrorProviderContext from '../components/ErrorProvider/ErrorProviderContext'
import { Alert } from 'antd'

/**
 * Extracts validation status for the Antd's Form.Item component
 * @param field
 */
export function getValidationStatus (field: FieldApi) {
  if (field.state.isValidating) {
    return 'validating'
  }

  if (field.state.isValidated) {
    if (field.state.isValid) {
      return field.state.message ? 'warning' : 'success'
    }

    if (!field.state.isValid) {
      return 'error'
    }
  }

  return undefined
}

export function ShowErrors () {
  const [errors, setErrors] = useState<ValidationErrors>([])
  const errorProviderContext = useContext(ErrorProviderContext)

  useEffect(() => {
    if (errorProviderContext) {
      // return errorProviderContext
      //   .subscribe((errors) => setErrors(errors))
      return errorProviderContext
        .subscribe((errors) => {
          console.log('errrrors', errors)
          setErrors(errors)
        })
    }
  }, [errorProviderContext])

  if (errors.length) {
    return <Alert
      type="error"
      message={errors.map(([path, message]) => (
        <p key={`err-${path}`}>
          {path}: {message}
        </p>
      ))}
    />
  }

  return null
}
