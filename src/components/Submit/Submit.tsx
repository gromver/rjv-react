/**
 *
 * Submit - a wrapper component for buttons, exposes onSubmit, onSuccess and onError events
 *
 */

import React, { useCallback, useState } from 'react'
import { useForm } from '../../hooks'
import { FirstErrorField } from '../../types'

type Props = {
  onSubmit?: (data: any) => void
  onSuccess?: (data: any) => void | Promise<void>
  onError?: (firstErrorField: FirstErrorField) => void
  focusFirstError?: boolean
  render: (handleSubmit: () => void, submitting: boolean) => React.ReactElement | null
}

export default function Submit (props: Props) {
  const [submitting, setSubmitting] = useState(false)
  const { onSubmit, onError, onSuccess, render, focusFirstError = true } = props

  const formApi = useForm()

  const handleSubmit = useCallback(async () => {
    setSubmitting(true)

    const { submit, getDataRef } = formApi

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

    setSubmitting(false)
  }, [formApi, onSubmit, onSuccess, onError, focusFirstError])

  return render(handleSubmit, submitting)
}
