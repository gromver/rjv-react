/**
 *
 * ErrorMessages - shows errors using provided render fn
 */

import React from 'react'
import { ValidationErrors } from '../../types'
import { useErrors } from '../../hooks'

type Props = {
  render: (errors: ValidationErrors) => React.ReactNode
}

export default function ErrorMessages (props: Props) {
  const { render } = props

  const errors = useErrors()

  return render(errors) as any
}
