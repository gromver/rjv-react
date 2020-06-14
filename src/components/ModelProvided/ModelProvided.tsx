/**
 *
 * ModelProvided
 * If model is provided - renders content, if not - nothing happens
 * Render function is supplied with the provided model
 *
 */

import React, { useContext } from 'react'
import { Model } from 'rjv'
import { ProviderContext } from '../Provider'

type Props = {
  render: (model: Model) => React.ReactNode
}

export default function ModelProvided (props: Props) {
  const { render } = props

  const providerContext = useContext(ProviderContext)

  return providerContext
    ? <>
      {render(providerContext.model)}
    </>
    : null
}
