import BaseEvent from './BaseEvent'

export default class FieldValidatedEvent extends BaseEvent {
  static TYPE = 'fieldValidated' as const

  constructor () {
    super(FieldValidatedEvent.TYPE)
  }
}
