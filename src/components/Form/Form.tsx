/**
 *
 * Form - renders some UI and provides an api to interact with form
 *
 */

import React from 'react'
import { FormApi, useForm } from '../../hooks'

type FieldProps = {
  render: (form: FormApi) => React.ReactElement
}

export default function Form ({ render }: FieldProps) {
  const formApi = useForm()

  return render(formApi)
}
