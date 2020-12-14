import BaseEvent from './BaseEvent'

export default class UnregisterFieldEvent extends BaseEvent {
  static TYPE = 'unregisterField' as const

  /**
   * Unregister field api event
   * @param field - FieldApi
   */
  constructor (public readonly field: any) {
    super(UnregisterFieldEvent.TYPE)
  }
}
