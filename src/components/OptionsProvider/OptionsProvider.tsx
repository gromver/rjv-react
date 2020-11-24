/**
 *
 * OptionsProvider - an options provider
 *
 */

import React, { useMemo } from 'react'
import { types } from 'rjv'
import OptionsProviderContext, { OptionsProviderContextValue } from './OptionsProviderContext'
import { DescriptionResolverFn } from './types'

export const DEFAULT_VALIDATOR_OPTIONS: Partial<types.IValidatorOptions> = {
  coerceTypes: false,
  removeAdditional: false
}

export const DEFAULT_DESCRIPTION_RESOLVER: DescriptionResolverFn = (message) => message.toString()

type Props = {
  coerceTypes?: boolean;
  removeAdditional?: boolean;
  errors?: {
    [keywordName: string]: any;
  };
  warnings?: {
    [keywordName: string]: any;
  };
  keywords?: types.IKeyword[];
  descriptionResolver?: DescriptionResolverFn
  children: React.ReactNode
}

export default function OptionsProvider (props: Props) {
  const {
    descriptionResolver, children, ...restProps
  } = props

  const validatorOptions = useMemo(
    (): Partial<types.IValidatorOptions> => {
      return { ...DEFAULT_VALIDATOR_OPTIONS, ...restProps }
    },
    [
      restProps.coerceTypes, restProps.removeAdditional, restProps.errors, restProps.warnings, restProps.keywords
    ]
  )

  const context = useMemo<OptionsProviderContextValue>(() => ({
    validatorOptions,
    descriptionResolver: descriptionResolver || DEFAULT_DESCRIPTION_RESOLVER
  }), [validatorOptions, descriptionResolver])

  return <OptionsProviderContext.Provider value={context}>
    {children}
  </OptionsProviderContext.Provider>
}
