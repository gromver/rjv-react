import { ValidationMessage } from 'rjv'

export type DescriptionResolverFn = (message: ValidationMessage) => string
