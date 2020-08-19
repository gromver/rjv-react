/**
 *
 * ModelRef - subscribes to field events
 *
 */

import React, { memo } from 'react'
import { Ref } from 'rjv'
import { Connect } from '../Connect'

type Props = {
  field?: Ref
  render: (ref: Ref, register: () => void) => React.ReactNode
  register: (el: React.ReactElement) => void
}

function ModelRef (props: Props) {
  const { field, render, register } = props

  return field ? (
    <Connect
      render={render}
      model={field.model}
      observe={[field.path]}
      args={[field, register]}
      observeMode="field"
    />
  ) : null
}

export default memo<Props>(
  ModelRef,
  (prev, next) => prev.field === next.field
)
