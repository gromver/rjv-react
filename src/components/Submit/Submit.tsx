/**
 *
 * Submit - a wrapper component for buttons, exposes onSubmit, onSuccess and onError events
 *
 */

import React, { useCallback } from 'react'
import { useForm } from '../../hooks'
import { FirstErrorField, FormState } from '../../types'

type Props = {
  onSubmit?: (data: any) => void
  onSuccess?: (data: any) => void | Promise<void>
  onError?: (firstErrorField: FirstErrorField) => void
  focusFirstError?: boolean
  render: (handleSubmit: () => void, formState: FormState) => React.ReactElement | null
}

export default function Submit (props: Props) {
  const { onSubmit, onError, onSuccess, render, focusFirstError = true } = props

  const { form, state } = useForm()

  const handleSubmit = useCallback(async () => {
    const { submit, getDataRef } = form

    onSubmit && onSubmit(getDataRef().value)

    submit(
      onSuccess,
      (firstErrorField) => {
        if (focusFirstError) {
          firstErrorField.focus()
        }

        onError && onError(firstErrorField)
      }
    )

  }, [form, onSubmit, onSuccess, onError, focusFirstError])

  return render(handleSubmit, state)
}
