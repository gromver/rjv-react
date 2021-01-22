import { createContext } from 'react'
import { types } from 'rjv'

export type DataContextValue = {
  dataStorage: types.IStorage
  initialDataStorage: types.IStorage
}

export default createContext<DataContextValue | undefined>(undefined)
