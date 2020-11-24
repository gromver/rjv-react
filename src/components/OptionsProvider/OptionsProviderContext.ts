import { createContext } from 'react'
import { types } from 'rjv'
import { DescriptionResolverFn } from './types'

export type OptionsProviderContextValue = {
  validatorOptions: Partial<types.IValidatorOptions>
  descriptionResolver: DescriptionResolverFn
}

export default createContext<OptionsProviderContextValue | undefined>(undefined)
