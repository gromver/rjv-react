import { createContext } from 'react'
import { types } from 'rjv'
import { EventEmitter2 } from 'eventemitter2'
import { SubmitFormFn, ValidationErrors, IFieldState, IField } from './types'
import { OptionsContextValue } from '../OptionsProvider/OptionsContext'

export type FormContextValue = {
  dataStorage: types.IStorage
  initialDataStorage: types.IStorage
  emitter: EventEmitter2
  options: OptionsContextValue
  submit: SubmitFormFn
  getData: () => any
  getField: (path: types.Path) => IField | undefined
  getErrors: () => ValidationErrors
  getFieldState: (field: IField) => IFieldState
  setFieldState: (field: IField, state: Partial<IFieldState>) => void
  getMessageDescription: (field: IField) => string | undefined
}

export default createContext<FormContextValue | undefined>(undefined)
