import BaseEvent from './BaseEvent'

export default class ValidatedEvent extends BaseEvent {
  static TYPE = 'validated' as const

  constructor () {
    super(ValidatedEvent.TYPE)
  }
}
