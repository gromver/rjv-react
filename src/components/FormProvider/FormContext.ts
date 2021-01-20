import { createContext } from 'react'
import { types } from 'rjv'
import { EventEmitter2 } from 'eventemitter2'
import { SubmitFormFn, ValidationErrors, FieldState, IField } from './types'
import { OptionsContextValue } from '../OptionsProvider/OptionsContext'

export type FormContextValue = {
  dataStorage: types.IStorage
  initialDataStorage: types.IStorage
  emitter: EventEmitter2
  options: OptionsContextValue
  submit: SubmitFormFn
  validate: (path: types.Path | types.Path[]) => Promise<void>
  getDataRef: (path?: types.Path) => types.IRef
  getField: (path: types.Path) => IField | undefined
  getErrors: () => ValidationErrors
  getFieldState: (field: IField) => FieldState
  setFieldState: (field: IField, state: Partial<FieldState>) => void
  getMessageDescription: (field: IField) => string | undefined
}

export default createContext<FormContextValue | undefined>(undefined)
