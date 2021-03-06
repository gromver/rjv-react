import BaseEvent from './BaseEvent'

export default class RegisterFieldEvent extends BaseEvent {
  static TYPE = 'registerField' as const

  /**
   * Register field api event
   * @param field - FieldApi
   */
  constructor (public readonly field: any) {
    super(RegisterFieldEvent.TYPE)
  }
}
