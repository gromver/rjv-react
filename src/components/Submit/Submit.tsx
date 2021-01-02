/**
 *
 * Submit - a wrapper component for buttons, exposes onSubmit, onSuccess and onError events
 *
 */

import React, { useCallback, useContext } from 'react'
import { FormContext } from '../FormProvider'
import { FieldApi } from '../Field'

type Props = {
  onSubmit?: (data: any) => void
  onSuccess?: (data: any) => void
  onError?: (firstErrorField: FieldApi) => void
  focusFirstError?: boolean
  render: (handleSubmit: () => void) => React.ReactElement | null
}

export default function Submit (props: Props) {
  const { onSubmit, onError, onSuccess, render, focusFirstError = true } = props

  const formContext = useContext(FormContext)

  const handleSubmit = useCallback(async () => {
    if (formContext) {
      const { submit, getData } = formContext

      onSubmit && onSubmit(getData())

      const { valid, data, firstErrorField } = await submit()

      if (valid) {
        onSuccess && onSuccess(data)
      } else {
        if (firstErrorField) {
          if (focusFirstError) {
            firstErrorField.focus()
          }

          onError && onError(firstErrorField as FieldApi)
        }
      }
    }
  }, [formContext, onSubmit, onSuccess, onError, focusFirstError])

  return render(handleSubmit)
}
