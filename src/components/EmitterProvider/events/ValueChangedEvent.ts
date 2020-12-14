import BaseEvent from './BaseEvent'

export default class ValueChangedEvent extends BaseEvent {
  static TYPE = 'valueChanged' as const

  constructor () {
    super(ValueChangedEvent.TYPE)
  }
}
