import get from 'lodash/get'
import set from 'lodash/set'
import { types } from 'rjv'

export default class Storage implements types.IStorage {
  constructor (private data?: any) {}

  get (route: types.Route): any {
    return route.length ? get(this.data, route) : this.data
  }

  set (route: types.Route, value: any) {
    if (route.length) {
      set(this.data, route, value)
    } else {
      this.data = value
    }
  }
}
