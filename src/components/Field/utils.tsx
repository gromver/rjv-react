/**
 *
 * Utils
 *
 */

import assign from 'lodash/assign'
import { utils, types } from 'rjv'

/**
 * Builds json schema for the prop validation on specified path
 * @param path
 * @param schema
 */
export function buildSchema (path: types.Path, schema: types.ISchema): types.ISchema {
  const slugs = utils.pathToArray(path)

  const resSchema: types.ISchema = {}
  let leaf: types.ISchema = resSchema

  slugs.forEach((slug) => {
    if (typeof slug === 'string') {
      const propSchema = {}
      leaf.properties = {
        [slug]: propSchema
      }
      leaf = propSchema
    } else {
      const itemsSchema = {}
      leaf.items = itemsSchema
      leaf = itemsSchema
    }
  })

  assign(leaf, schema)

  return resSchema
}
