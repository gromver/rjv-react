/**
 *
 * Provider
 *
 */

import React, { memo } from 'react'
import { types } from 'rjv'
import OptionsProviderContext from './OptionsProviderContext'

type Props = {
  options?: types.IModelOptionsPartial,
  children: React.ReactNode
}

function OptionsProvider (props: Props) {
  const { options = {}, children } = props

  return <OptionsProviderContext.Provider value={options}>
    {children}
  </OptionsProviderContext.Provider>
}

export default memo<Props>(OptionsProvider)
