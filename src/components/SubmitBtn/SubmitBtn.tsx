/**
 *
 * SubmitBtn
 * A wrapper component for buttons, exposes onSubmit, onSuccess and onError events
 *
 */

import React, { useCallback, useMemo } from 'react'
import { Model, Ref } from 'rjv'
import { ProviderContext, ProviderContextValue } from '../Provider'

type PropsPartial = {
  onSubmit?: (model: Model) => void
  onSuccess?: (model: Model) => void
  onError?: (model: Model, firstError: Ref) => void
  children: React.ReactNode
}
type Props = PropsPartial & {
  providerContext?: ProviderContextValue
}

function SubmitBtn (props: Props) {
  const { onSubmit, onError, onSuccess, ...restProps } = props

  const providerContext = useMemo(() => {
    // todo check shape
    if (!props.providerContext) {
      throw new Error('Received invalid providerContext')
    }

    return props.providerContext
  }, [props.providerContext])

  const handleSubmit = useCallback(async () => {
    const { model } = providerContext

    onSubmit && onSubmit(model)

    const isValid = await model.validate()

    if (isValid) {
      onSuccess && onSuccess(model)
    } else {
      onError && onError(model, model.ref().firstError as Ref)
    }
  }, [providerContext])

  return <span {...restProps} onClick={handleSubmit} />
}

export default (props: PropsPartial) => (
  <ProviderContext.Consumer>
    {(providerContext) => (
      <SubmitBtn
        {...props}
        providerContext={providerContext}
      />
    )}
  </ProviderContext.Consumer>
)
