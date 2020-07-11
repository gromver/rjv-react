/**
 *
 * Submit
 * A wrapper component for buttons, exposes onSubmit, onSuccess and onError events
 *
 */

import React, { useCallback, useMemo } from 'react'
import { Model, Ref } from 'rjv'
import { ProviderContext, ProviderContextValue } from '../Provider'

type PropsPartial = {
  onSubmit?: (model: Model) => void
  onSuccess?: (data: any, model: Model) => void
  onError?: (firstError: Ref, model: Model) => void
  focusFirstError?: boolean
  render: (handleSubmit: () => void) => React.ReactElement | null
}
type Props = PropsPartial & {
  providerContext?: ProviderContextValue
}

function Submit (props: Props) {
  const { onSubmit, onError, onSuccess, render, focusFirstError = true } = props

  const providerContext = useMemo(() => {
    // todo check shape
    if (!props.providerContext) {
      throw new Error('Received invalid providerContext')
    }

    return props.providerContext
  }, [props.providerContext])

  const handleSubmit = useCallback(async () => {
    const { model, getRef } = providerContext

    onSubmit && onSubmit(model)

    const isValid = await model.validate()

    if (isValid) {
      onSuccess && onSuccess(model.data, model)
    } else {
      const errorRef = model.ref().firstError as Ref

      if (focusFirstError) {
        const errorComponent = getRef(errorRef.path)

        if ((errorComponent as any).focus && typeof (errorComponent as any).focus === 'function') {
          (errorComponent as any).focus()
        }
      }

      onError && onError(errorRef, model)
    }
  }, [providerContext])

  return render(handleSubmit)
}

export default (props: PropsPartial) => (
  <ProviderContext.Consumer>
    {(providerContext) => (
      <Submit
        {...props}
        providerContext={providerContext}
      />
    )}
  </ProviderContext.Consumer>
)
