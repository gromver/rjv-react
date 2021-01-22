import { createContext } from 'react'
import { types } from 'rjv'
import { EventEmitter2 } from 'eventemitter2'
import { FieldState, IField } from '../types'

export type FieldContextValue = {
  emitter: EventEmitter2
  fields: Map<IField, FieldState>
  getFields: (path: types.Path) => IField[]
  getState: (field: IField) => FieldState
  setState: (field: IField, state: Partial<FieldState>) => void
}

export default createContext<FieldContextValue | undefined>(undefined)
