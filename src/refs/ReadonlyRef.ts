import { types, Ref, utils } from 'rjv'

export default class ReadonlyRef extends Ref {
  setValue (/* value: any */) {
    throw new Error(`Readonly ref doesn't allow value change, path: ${this.path}`)
  }

  // get value (): any {
  //   return this.storage.get(this.route)
  // }

  ref (relPath: types.Path): ReadonlyRef {
    return new ReadonlyRef(this.storage, utils.resolvePath(relPath, this.path))
  }
}
