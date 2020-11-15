import BaseEvent from './BaseEvent'

export default class ValidatedEvent extends BaseEvent {
  static TYPE = 'validated'

  constructor () {
    super(ValidatedEvent.TYPE)
  }
}
