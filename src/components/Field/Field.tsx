/**
 *
 * Field - renders field and provides an api to interact with data and state
 *
 */

import React, { forwardRef, useImperativeHandle } from 'react'
import { types } from 'rjv'
import useField, { FieldInfo } from '../../hooks/useField'
import { FieldApi } from '../../types'

type FieldProps = {
  render: (fieldInfo: FieldInfo) => React.ReactElement | null
  path: types.Path
  schema: types.ISchema
  dependencies?: any[]
}

function Field ({ render, path, schema, dependencies }: FieldProps, ref) {
  const fieldInfo = useField(path, schema, dependencies)

  useImperativeHandle(ref, () => fieldInfo.field)

  return render(fieldInfo)
}

export default forwardRef<FieldApi, FieldProps>(Field)
