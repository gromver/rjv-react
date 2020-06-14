import { buildSchema } from './utils'

describe('buildSchema tests', () => {
  it('Should build proper schema #1', () => {
    const schema = buildSchema('/', { type: 'number' })
    expect(schema).toMatchObject({ type: 'number' })
  })

  it('Should build proper schema #2', () => {
    const schema = buildSchema('/foo/bar', { type: 'number' })
    expect(schema).toMatchObject({
      properties: {
        foo: {
          properties: {
            bar: { type: 'number' }
          }
        }
      }
    })
  })

  it('Should build proper schema #3', () => {
    const schema = buildSchema('/2/3', { type: 'number' })
    expect(schema).toMatchObject({
      items: {
        items: { type: 'number' }
      }
    })
  })

  it('Should build proper schema #4', () => {
    const schema = buildSchema('/foo/3', { type: 'number' })
    expect(schema).toMatchObject({
      properties: {
        foo: {
          items: { type: 'number' }
        }
      }
    })
  })
})
