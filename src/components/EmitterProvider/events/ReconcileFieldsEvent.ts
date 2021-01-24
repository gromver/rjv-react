import BaseEvent from './BaseEvent'

export default class ReconcileFieldsEvent extends BaseEvent {
  static TYPE = 'reconcileFields' as const

  /**
   * Reconcile fields
   */
  constructor () {
    super(ReconcileFieldsEvent.TYPE)
  }
}
