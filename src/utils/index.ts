import { EventEmitter2, ConstructorOptions } from 'eventemitter2'
import { utils, types, ValidationMessage } from 'rjv'
import _extend from 'lodash/extend'
import _assign from 'lodash/assign'
import _isObject from 'lodash/isObject'

const DEFAULT_EMITTER_OPTIONS: ConstructorOptions = {
  // set this to `true` to use wildcards
  wildcard: true,

  // the delimiter used to segment namespaces
  delimiter: '/',

  // set this to `true` if you want to emit the newListener event
  newListener: false,

  // set this to `true` if you want to emit the removeListener event
  removeListener: false,

  // the maximum amount of listeners that can be assigned to an event
  maxListeners: 10,

  // show event name in memory leak message when more than maximum amount of listeners is assigned
  verboseMemoryLeak: false,

  // disable throwing uncaughtException if an error event is emitted and it has no listeners
  ignoreErrors: false
}

export const createEmitter = (options: Partial<ConstructorOptions> = {}) => new EventEmitter2(
  _extend(
    {},
    DEFAULT_EMITTER_OPTIONS,
    options
  ))

export function descriptionResolver (message: ValidationMessage): string | any {
  if (typeof message.description === 'string') {
    return utils.injectVarsToString(message.description, message.bindings)
  }

  return message.description
}

const META_KEYWORDS = [
  'default', 'filter', 'error', 'warning', 'errors', 'warnings', 'removeAdditional'
]

function addPropToPath (path: types.Path, propName: string | number): string {
  return path === '/' ? `/${propName}` : `${path}/${propName}`
}

export function getPropsToObserveFromSchema (schema: types.ISchema, from: types.Path, to: types.Path = ''): string[] {
  const res: types.Path[] = []

  function extract (_schema: types.ISchema, curPath: types.Path) {
    if (!_isObject(_schema)) {
      console.log('getPropsToObserveFromSchema:extract - given schema is not an object')
      return
    }

    if (curPath === to) {
      return
    }

    let pushed = false

    Object.entries(_schema).forEach(([keyword, value]) => {
      if (keyword === 'properties') {
        Object.entries(value).forEach(([propName, propSchema]) => {
          extract(propSchema as types.ISchema, addPropToPath(curPath, propName))
        })
      } else if (keyword === 'items') {
        if (Array.isArray(value)) {
          value.forEach((itemSchema, index) => {
            extract(itemSchema, addPropToPath(curPath, index))
          })
        } else {
          extract(value, `${curPath}/*`)
        }
      } else if (!META_KEYWORDS.includes(keyword)) {
        if (!pushed) {
          res.push(curPath)
          pushed = true
        }
      }
    })
  }

  extract(schema, from)

  return res
}

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

  _assign(leaf, schema)

  return resSchema
}
