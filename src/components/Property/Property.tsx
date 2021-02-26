/**
 *
 * Property - renders some UI and provides an api to get / set data property
 *
 */

import React from 'react'
import useProperty from '../../hooks/useProperty'
import { types } from 'rjv'

type PropertyProps = {
  render: (value: any, setValue: (value: any) => void) => React.ReactElement | null
  path: types.Path
}

export default function Property ({ render, path }: PropertyProps) {
  const property = useProperty(path)

  return render(...property)
}
