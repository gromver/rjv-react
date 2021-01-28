import { createContext } from 'react'
import { FormState } from '../types'

export default createContext<FormState | undefined>(undefined)
