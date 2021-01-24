import { utils, types, Ref } from 'rjv'
import { EventEmitter2 } from 'eventemitter2'
import { FieldValueChangedEvent } from '../components/EmitterProvider/events'

/**
 * EmittingRef - a ref that emits ValueChangedEvent on the value changes
 */
export default class EmittingRef extends Ref {
  /**
   * Create Ref
   * @param storage
   * @param path - should be absolute
   * @param emitter
   */
  constructor (
    storage: types.IStorage,
    path: types.Path,
    private readonly emitter: EventEmitter2
  ) {
    super(storage, path)
  }

  setValue (value: any) {
    super.setValue(value)

    this.emitter.emit(this.path, new FieldValueChangedEvent())
  }

  ref (relPath: types.Path): EmittingRef {
    return new EmittingRef(this.storage, utils.resolvePath(relPath, this.path), this.emitter)
  }
}
