import { OptionsContextValue } from '../OptionsProvider'
import {
  DEFAULT_DESCRIPTION_RESOLVER,
  DEFAULT_VALIDATOR_OPTIONS
} from '../OptionsProvider/OptionsProvider'

export const DEFAULT_OPTIONS: OptionsContextValue = {
  validatorOptions: DEFAULT_VALIDATOR_OPTIONS,
  descriptionResolver: DEFAULT_DESCRIPTION_RESOLVER
}
