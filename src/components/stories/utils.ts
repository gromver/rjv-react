import { Ref } from 'rjv'

export function getValidationStatus (ref: Ref) {
  if (ref.isValidating) {
    return 'validating'
  }

  if (ref.isValid) {
    return 'success'
  }

  if (ref.isInvalid) {
    return 'error'
  }

  return undefined
}

export function getMessage (ref) {
  const { state } = ref
  let message = ''

  if (ref.isValidated) {
    message = state.message && state.message.description
  }

  return message
}
