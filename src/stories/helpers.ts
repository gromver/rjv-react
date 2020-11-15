import { FieldApi } from '../components/Field'

export function getValidationStatus (field: FieldApi) {
  if (field.state.isValidating) {
    return 'validating'
  }

  if (field.state.isValidated) {
    if (field.state.isValid) {
      return field.state.message ? 'warning' : 'success'
    }

    if (!field.state.isValid) {
      return 'error'
    }
  }

  return undefined
}
