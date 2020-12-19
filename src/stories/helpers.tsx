import React, { useCallback, useContext, useEffect, useState } from 'react'
import { FieldApi } from '../components/Field'
import { ValidationErrors, FormProviderContext } from '../components/FormProvider'
import ErrorProviderContext from '../components/ErrorProvider/ErrorProviderContext'
import { Alert, Button } from 'antd'

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

/**
 * A react component - shows errors caught by ErrorProvider
 * @constructor
 */
export function ShowErrors () {
  const [errors, setErrors] = useState<ValidationErrors>([])
  const errorProviderContext = useContext(ErrorProviderContext)

  useEffect(() => {
    if (errorProviderContext) {
      return errorProviderContext
        .subscribe((errors) => setErrors(errors))
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

/**
 * A react component - submits form, logging the result of submission
 * and tries to focus invalid field, if data is not valid
 * @constructor
 */
export function SubmitBtn () {
  const providerContext = useContext(FormProviderContext)
  const handleSubmit = useCallback(async () => {
    if (providerContext) {
      const res = await providerContext.submit()

      console.log('SUBMIT RESULT:', res)

      if (!res.valid) {
        res.firstErrorField && res.firstErrorField.focus()
      }
    }
  }, [providerContext])

  return <Button onClick={handleSubmit}>Submit</Button>
}
