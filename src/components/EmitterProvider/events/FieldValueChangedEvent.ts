import BaseEvent from './BaseEvent'

export default class FieldValueChangedEvent extends BaseEvent {
  static TYPE = 'fieldValueChanged' as const

  constructor () {
    super(FieldValueChangedEvent.TYPE)
  }
}
