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
  render: (ref: Ref) => React.ReactNode
}

function ModelRef (props: Props) {
  const { field, render } = props

  return field ? (
    <Connect
      render={render}
      observe={[field.path]}
      args={[field]}
      observeMode="field"
    />
  ) : null
}

export default memo<Props>(ModelRef)
