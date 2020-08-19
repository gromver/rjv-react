import merge from 'lodash/merge'
import { types } from 'rjv'

export default class SchemaCollector {
  public onInvalidated?: () => void

  private _schemas: types.ISchema[] = []
  private _isCommitted = false
  private _isTriggered = false

  get schemas (): types.ISchema[] {
    this._isCommitted = true

    return this._schemas
  }

  get mergedSchema (): types.ISchema {
    return merge({}, ...this.schemas)
  }

  invalidate () {
    this._isCommitted = true

    // only one execution
    if (this.onInvalidated && !this._isTriggered) {
      this._isTriggered = true
      this.onInvalidated()
    }
  }

  add (schema: types.ISchema) {
    if (!this._isCommitted) {
      this._schemas.push(schema)
    } else {
      this.invalidate()
    }
  }

  remove (schema: types.ISchema) {
    if (!this._isCommitted) {
      this._schemas = this._schemas.filter((item) => item !== schema)
    } else {
      this.invalidate()
    }
  }
}
