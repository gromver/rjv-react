import BaseEvent from './BaseEvent'

export default class FieldInvalidatedEvent extends BaseEvent {
  static TYPE = 'fieldInvalidated' as const

  constructor () {
    super(FieldInvalidatedEvent.TYPE)
  }
}
