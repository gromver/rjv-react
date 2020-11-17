import { utils, types, Ref } from 'rjv'

type TrackingRefsMap = {
  [propPath: string]: boolean
}

export default class TrackingRef extends Ref {
  /**
   * Create Ref
   * @param storage
   * @param path - should be absolute
   * @param map
   */
  constructor (
    storage: types.IStorage,
    path: types.Path,
    private readonly map: TrackingRefsMap = {}
  ) {
    super(storage, path)
  }

  ref (relPath: types.Path): TrackingRef {
    const resolvedPath = utils.resolvePath(relPath, this.path)
    this.map[resolvedPath] = true

    return new TrackingRef(this.storage, resolvedPath, this.map)
  }

  get propsToTrack (): string[] {
    return Object.keys(this.map)
  }
}
