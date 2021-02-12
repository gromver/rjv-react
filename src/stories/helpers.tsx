import React, { useCallback, useContext } from 'react'
import { Alert, Button } from 'antd'
import { ButtonProps } from 'antd/es/button'
import FormContext from '../contexts/FormContext'
import FormStateContext from '../contexts/FormStateContext'
import { useErrors } from '../hooks'
import { FieldState } from '../types'

/**
 * Extracts validation status for the Antd's Form.Item component
 * @param state
 */
export function getValidationStatus (state: FieldState) {
  if (state.isValidating) {
    return 'validating'
  }

  if (state.isValidated) {
    if (state.isValid) {
      return state.message ? 'warning' : 'success'
    }

    if (!state.isValid) {
      return 'error'
    }
  }

  return undefined
}

/**
 * A react component - shows errors caught by CatchErrors
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
export function SubmitBtn ({ children, ...props }: ButtonProps) {
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

  return <Button onClick={handleSubmit} loading={formStateContext?.isSubmitting} {...props}>
    {children || 'Submit'}
  </Button>
}
