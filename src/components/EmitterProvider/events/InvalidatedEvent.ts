import BaseEvent from './BaseEvent'

export default class InvalidatedEvent extends BaseEvent {
  static TYPE = 'invalidated' as const

  constructor () {
    super(InvalidatedEvent.TYPE)
  }
}
