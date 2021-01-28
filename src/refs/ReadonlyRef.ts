import { types, Ref, utils } from 'rjv'

/**
 * ReadonlyRef - a ref that allows only the value reading
 */
export default class ReadonlyRef extends Ref {
  setValue () {
    throw new Error(`Readonly ref doesn't allow value change, path: ${this.path}`)
  }

  ref (relPath: types.Path): ReadonlyRef {
    return new ReadonlyRef(this.storage, utils.resolvePath(relPath, this.path))
  }
}
