import { EventEmitter2, ConstructorOptions } from 'eventemitter2'
import { utils, ValidationMessage } from 'rjv'
import _extend from 'lodash/extend'

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
