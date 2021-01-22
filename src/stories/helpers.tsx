import React, { useCallback, useContext } from 'react'
import { Alert, Button } from 'antd'
import FormContext from '../contexts/FormContext'
import FormStateContext from '../contexts/FormStateContext'
import { FieldApi } from '../components/Field'
import { useErrors } from '../hooks'

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
  const errors = useErrors()

  if (errors.length) {
    return <Alert
      type="error"
      message={errors.map(({path, message}) => (
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
  const formContext = useContext(FormContext)
  const formStateContext = useContext(FormStateContext)

  const handleSubmit = useCallback(async () => {
    if (formContext) {
      formContext.submit(
        (data) => {
          console.log('SUBMIT RESULT:', data)
        },
        (firstErrorField) => {
          firstErrorField.focus()
        }
      )
    }
  }, [formContext])

  return <Button onClick={handleSubmit} loading={formStateContext?.isSubmitting}>Submit</Button>
}
