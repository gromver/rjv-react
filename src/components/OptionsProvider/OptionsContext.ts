import { createContext } from 'react'
import { types } from 'rjv'
import { DescriptionResolverFn } from './types'

export type OptionsContextValue = {
  validatorOptions: Partial<types.IValidatorOptions>
  descriptionResolver: DescriptionResolverFn
}

export default createContext<OptionsContextValue | undefined>(undefined)
