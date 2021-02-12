/**
 *
 * Field - renders field and provides an api to interact with data and state
 *
 */

import React from 'react'
import { types } from 'rjv'
import useField, { FieldInfo } from '../../hooks/useField'

type FieldProps = {
  render: (fieldInfo: FieldInfo) => React.ReactElement | null
  path: types.Path
  schema: types.ISchema
  dependencies?: any[]
}

export default function Field ({ render, path, schema, dependencies }: FieldProps) {
  const fieldInfo = useField(path, schema, dependencies)

  return render(fieldInfo)
}
