import BaseEvent from './BaseEvent'

export default class FieldStateChangedEvent extends BaseEvent {
  static TYPE = 'fieldStateChanged' as const

  constructor () {
    super(FieldStateChangedEvent.TYPE)
  }
}
