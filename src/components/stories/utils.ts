import { Ref } from 'rjv'

export function getValidationStatus (ref: Ref) {
  if (ref.isValidating) {
    return 'validating'
  }

  if (ref.isValid) {
    return ref.message ? 'warning' : 'success'
  }

  if (ref.isInvalid) {
    return 'error'
  }

  return undefined
}

export function getMessage (ref) {
  return ref.isValidated ? ref.messageDescription : undefined
}
