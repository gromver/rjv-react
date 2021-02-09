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
import useFieldArray, { FieldArrayInfo } from '../../hooks/useFieldArray'

type FieldArrayProps = {
  render: (fieldArrayInfo: { items: FieldArrayItem[], fields: FieldArrayApi }) => React.ReactElement | null
  path: types.Path
}

function FieldArray ({ render, path }: FieldArrayProps, elRef: React.Ref<FieldArrayInfo>) {
  const fieldArrayInfo = useFieldArray(path)

  useImperativeHandle(elRef, () => fieldArrayInfo)

  return render(fieldArrayInfo)
}

export default forwardRef<FieldArrayInfo, FieldArrayProps>(FieldArray)
