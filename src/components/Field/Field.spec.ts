import _isEqualWith from 'lodash/isEqualWith'
import { schemaEqualCustomizer } from './Field'

describe('schemaEqualCustomizer tests', () => {
  it ('Should be true #1', () => {
    const s1 = { foo: 'bar' }
    const s2 = { foo: 'bar' }
    expect(_isEqualWith(s1, s2, schemaEqualCustomizer)).toBe(true)
  })

  it ('Should be true #2', () => {
    const s1 = { foo: () => { return } }
    const s2 = { foo: () => { return } }
    expect(_isEqualWith(s1, s2, schemaEqualCustomizer)).toBe(true)
  })

  it ('Should be true #3', () => {
    const s1 = { properties: { foo: () => { return } } }
    const s2 = { properties: { foo: () => { return } } }
    expect(_isEqualWith(s1, s2, schemaEqualCustomizer)).toBe(true)
  })

  it ('Should be false #1', () => {
    const s1 = { foo: () => { return 1 } }
    const s2 = { foo: () => { return } }
    expect(_isEqualWith(s1, s2, schemaEqualCustomizer)).toBe(false)
  })
})
