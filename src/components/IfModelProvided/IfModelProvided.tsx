/**
 *
 * ModelProvided
 * If model is provided - renders content, if not - nothing happens
 * Render function is supplied with the provided model
 *
 */

import React, { useContext } from 'react'
import { Model } from 'rjv'
import { ModelProviderContext } from '../ModelProvider'

type Props = {
  render: (model: Model) => React.ReactNode
}

export default function IfModelProvided (props: Props) {
  const { render } = props

  const modelProviderContext = useContext(ModelProviderContext)

  return modelProviderContext
    ? <>
      {render(modelProviderContext.model)}
    </>
    : null
}
