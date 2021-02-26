/**
 *
 * Form - renders some UI and provides an api to interact with form
 *
 */

import React from 'react'
import useForm, { FormInfo } from '../../hooks/useForm'

type FormProps = {
  render: (form: FormInfo) => React.ReactElement | null
}

export default function Form ({ render }: FormProps) {
  const formInfo = useForm()

  return render(formInfo)
}
