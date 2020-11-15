import { utils, types } from 'rjv'

export default class Ref implements types.IRef {
  readonly route: types.Route

  /**
   * Create Ref
   * @param _storage
   * @param path - should be absolut
   */
  constructor (private readonly _storage: types.IStorage, public readonly path: types.Path) {
    // todo check if path is absolut
    this.route = utils.pathToArray(path)
  }

  get value (): any {
    return this._storage.get(this.route)
  }

  set value (value: any) {
    this._storage.set(this.route, value)
  }

  getValue (): any {
    return this.value
  }

  checkDataType (dataType: string): boolean {
    const value = this.value

    return utils.checkDataType(dataType as any, value)
  }

  /**
   * Helper - creates undefined validation result
   * @param metadata
   */
  createUndefinedResult (metadata = {}): any {
    return metadata
  }

  /**
   * Helper - creates success validation result
   * @param message
   * @param metadata
   */
  createSuccessResult (message?: any, metadata = {})
    : any {
    return {
      ...metadata,
      message,
      valid: true
    }
  }

  /**
   * Helper - creates error validation result
   * @param message
   * @param metadata
   */
  createErrorResult (message: any, metadata = {})
    : any {
    return {
      ...metadata,
      message,
      valid: false
    }
  }

  ref (relPath: types.Path): types.IRef {
    return new Ref(this._storage, utils.resolvePath(relPath, this.path))
  }
}
