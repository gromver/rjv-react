import BaseEvent from './BaseEvent'

export default class ValueChangedEvent extends BaseEvent {
  static TYPE = 'valueChanged'

  constructor () {
    super(ValueChangedEvent.TYPE)
  }
}
