/**
 *
 * Field - renders field and provides an api to interact with data and state
 *
 */

import React from 'react'
import { types } from 'rjv'
import useField, { FieldInfo } from '../../hooks/useField'

type FieldProps = {
  render: (fieldInfo: FieldInfo) => React.ReactElement
  path: types.Path
  schema: types.ISchema
}

export default function Field ({render, path, schema}: FieldProps) {
  const fieldInfo = useField(path, schema)

  return render(fieldInfo)
}
