/**
 *
 * Watch - re-renders content when the certain fields are changed
 *
 */

import { ReactElement } from 'react'
import { types } from 'rjv'
import useWatch from '../../hooks/useWatch'

type Props = {
  props: types.Path[]
  render: (...values: any[]) => ReactElement | null
}

/**
 * Watch
 * @param render
 * @param props
 * @constructor
 */
export default function Watch ({ render, props }: Props) {
  const args = useWatch(...props)

  return render(...args)
}
