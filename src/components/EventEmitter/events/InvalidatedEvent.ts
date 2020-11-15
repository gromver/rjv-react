import BaseEvent from './BaseEvent'

export default class InvalidatedEvent extends BaseEvent {
  static TYPE = 'invalidated'

  constructor () {
    super(InvalidatedEvent.TYPE)
  }
}
