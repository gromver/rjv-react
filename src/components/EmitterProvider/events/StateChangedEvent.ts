import BaseEvent from './BaseEvent'

export default class StateChangedEvent extends BaseEvent {
  static TYPE = 'stateChanged' as const

  constructor () {
    super(StateChangedEvent.TYPE)
  }
}
