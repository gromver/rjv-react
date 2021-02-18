/**
 *
 * Submit - a wrapper component for buttons, exposes onSubmit, onSuccess and onError events
 *
 */

import React, { useCallback } from 'react'
import { useDataRef, useForm } from '../../hooks'
import { FirstErrorField, FormApi, FormState } from '../../types'

type SubmitInfo = {
  handleSubmit: () => void
  form: FormApi
  state: FormState
}

type Props = {
  onSubmit?: (data: any) => void
  onSuccess?: (data: any) => void | Promise<void>
  onError?: (firstErrorField: FirstErrorField) => void
  focusFirstError?: boolean
  render: (submitInfo: SubmitInfo) => React.ReactElement | null
}

export default function Submit (props: Props) {
  const { onSubmit, onError, onSuccess, render, focusFirstError = true } = props

  const { form, state } = useForm()
  const rootDataRef = useDataRef('/')

  const handleSubmit = useCallback(async () => {
    const { submit } = form

    onSubmit && onSubmit(rootDataRef.value)

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

  return render({ handleSubmit, form, state })
}
