/**
 *
 * FieldArray - a component to deal with an array of fields.
 *
 */

import React, {
  forwardRef,
  useImperativeHandle
} from 'react'
import { types } from 'rjv'
import { FieldArrayItem, FieldArrayApi } from '../../types'
import useFieldArray from '../../hooks/useFieldArray'

type FieldArrayInfo = {
  items: FieldArrayItem[]
  fields: FieldArrayApi
}

type FieldArrayProps = {
  render: (fieldArrayInfo: FieldArrayInfo) => React.ReactElement | null
  path: types.Path
}

function FieldArray ({ render, path }: FieldArrayProps, elRef: React.Ref<FieldArrayApi>) {
  const fieldArrayInfo = useFieldArray(path)

  useImperativeHandle(elRef, () => fieldArrayInfo.fields)

  return render(fieldArrayInfo)
}

export default forwardRef<FieldArrayApi, FieldArrayProps>(FieldArray)
