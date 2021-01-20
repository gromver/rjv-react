/**
 *
 * Submit - a wrapper component for buttons, exposes onSubmit, onSuccess and onError events
 *
 */

import React, { useCallback, useContext } from 'react'
import { FormContext, FirstErrorField } from '../FormProvider'

type Props = {
  onSubmit?: (data: any) => void
  onSuccess?: (data: any) => void
  onError?: (firstErrorField: FirstErrorField) => void
  focusFirstError?: boolean
  render: (handleSubmit: () => void) => React.ReactElement | null
}

export default function Submit (props: Props) {
  const { onSubmit, onError, onSuccess, render, focusFirstError = true } = props

  const formContext = useContext(FormContext)

  const handleSubmit = useCallback(async () => {
    if (formContext) {
      const { submit, getDataRef } = formContext

      onSubmit && onSubmit(getDataRef().value)

      const { valid, data, firstErrorField } = await submit()

      if (valid) {
        onSuccess && onSuccess(data)
      } else {
        if (firstErrorField) {
          if (focusFirstError) {
            firstErrorField.focus()
          }

          onError && onError(firstErrorField)
        }
      }
    }
  }, [formContext, onSubmit, onSuccess, onError, focusFirstError])

  return render(handleSubmit)
}
