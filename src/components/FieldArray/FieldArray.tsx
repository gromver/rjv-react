/**
 *
 * FieldArray - a component to deal with an array of fields.
 *
 */

import React, {
  useContext,
  useMemo,
  useState,
  useImperativeHandle,
  forwardRef
} from 'react'
import { utils, types } from 'rjv'
import EmitterContext from '../../contexts/EmitterContext'
import DataContext from '../../contexts/DataContext'
import { EmittingRef } from '../../refs'
import { addPropToPath, isArrayHasIndex } from '../../utils'
import usePath from '../../hooks/usePath'

export type FieldArrayApi = {
  append: (value: any) => void
  prepend: (value: any) => void
  remove: (index: number) => void
  clear: () => void
  insert: (index: number, value: any) => void
  swap: (indexA: number, indexB: number) => void
  move: (from: number, to: number) => void
}

export type FieldArrayRef = FieldArrayApi

type FieldItem = { key: string, path: types.Path }

type FieldArrayProps = {
  render: (items: FieldItem[], fields: FieldArrayApi) => React.ReactElement
  path: types.Path
}

let _id = 1

function FieldArray ({ render, path }: FieldArrayProps, elRef: React.Ref<FieldArrayRef>) {
  const dataContext = useContext(DataContext)
  const emitterContext = useContext(EmitterContext)

  if (!dataContext || !emitterContext) {
    throw new Error('FieldArray - form is not provided')
  }

  const _path = usePath(path)

  const ref = useMemo(
    () => new EmittingRef(dataContext.dataStorage, _path, emitterContext.emitter),
    [dataContext.dataStorage, emitterContext.emitter, _path]
  )

  if (ref.value === undefined) {
    dataContext.dataStorage.set(utils.pathToArray(_path), [])
  }

  if (!Array.isArray(ref.value)) {
    throw new Error('FieldArray - the field\'s value must be an array')
  }

  const [items, setItems] = useState<FieldItem[]>(() => ref.value.map((value, index) => ({ key: `id_${_id++}`, path: addPropToPath(_path, index) })))

  const fieldArrayApi: FieldArrayApi = useMemo(() => ({
    append: (value) => {
      const curValues = ref.value

      ref.value = [...curValues, value]

      setItems([...items, { key: `id_${_id++}`, path: addPropToPath(_path, items.length) }])
    },
    prepend: (value) => {
      const curValues = ref.value

      ref.value = [value, ...curValues]

      setItems([
        { key: `id_${_id++}`, path: addPropToPath(_path, 0) },
        ...(items.map((item, index) => {
          item.path = addPropToPath(_path, index + 1)

          return item
        }))
      ])
    },
    remove: (index) => {
      if (isArrayHasIndex(items, index)) {
        const newValues = [...ref.value]
        newValues.splice(index, 1)
        ref.value = newValues

        const newItems = [...items]
        newItems.splice(index, 1)

        for (let i = index; i < newItems.length; i++) {
          newItems[i].path = addPropToPath(_path, i)
        }

        setItems(newItems)
      }
    },
    clear: () => {
      ref.value = []
      setItems([])
    },
    insert: (index, value) => {
      if (isArrayHasIndex(items, index)) {
        const newValues = [...ref.value]
        newValues.splice(index, 0, value)
        ref.value = newValues

        const newItems = [...items]
        newItems.splice(index, 0, { key: `id_${_id++}`, path: addPropToPath(_path, index) })

        for (let i = index + 1; i < newItems.length; i++) {
          newItems[i].path = addPropToPath(_path, i)
        }

        setItems(newItems)
      }
    },
    swap: (indexA, indexB) => {
      if (indexA !== indexB && isArrayHasIndex(items, indexA) && isArrayHasIndex(items, indexB)) {
        const newValues = [...ref.value]
        const valueA = newValues[indexA]
        newValues[indexA] = newValues[indexB]
        newValues[indexB] = valueA

        ref.value = newValues

        const newItems = [...items]
        const itemA = newItems[indexA]
        const itemB = newItems[indexB]
        itemA.path = addPropToPath(_path, indexB)
        itemB.path = addPropToPath(_path, indexA)
        newItems[indexA] = itemB
        newItems[indexB] = itemA

        setItems(newItems)
      }
    },
    move: (from, to) => {
      if (isArrayHasIndex(items, from) && isArrayHasIndex(items, to)) {
        const newValues = [...ref.value]
        newValues.splice(to, 0, newValues.splice(from, 1)[0])

        ref.value = newValues

        const newItems = [...items]
        newItems.splice(to, 0, newItems.splice(from, 1)[0])
        for (let i = 0; i < newItems.length; i++) {
          newItems[i].path = addPropToPath(_path, i)
        }

        setItems(newItems)
      }
    }
  }), [_path, items])

  useImperativeHandle(elRef, () => fieldArrayApi)

  return render(items, fieldArrayApi)
}

export default forwardRef<FieldArrayRef, FieldArrayProps>(FieldArray)
