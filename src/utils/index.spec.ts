import { types } from 'rjv'
import { getPropsToObserveFromSchema, buildSchema } from './index'

describe('getPropsToObserveFromSchema tests', () => {
  it('Should return valid result #1', () => {
    const schema: types.ISchema = {
      properties: {
        foo: { default: '' },
        bar: { presence: true, properties: { a: { type: 'string' } } },
        car: { presence: true }
      }
    }
    expect(getPropsToObserveFromSchema(schema, '/', '/bar'))
      .toEqual(['/car'])
    expect(getPropsToObserveFromSchema(schema, '/', '/car'))
      .toEqual(['/bar', '/bar/a'])
    expect(getPropsToObserveFromSchema(schema, '/', '/foo'))
      .toEqual(['/bar', '/bar/a', '/car'])
  })

  it('Should return valid result #2', () => {
    const schema: types.ISchema = {
      properties: {
        foo: { items: [{ presence: true }, { default: '' }] },
        bar: { presence: true, properties: { a: { type: 'string' } } },
        car: { items: { presence: true } }
      }
    }
    expect(getPropsToObserveFromSchema(schema, '/', '/bar'))
      .toEqual(['/foo/0', '/car/*'])
    expect(getPropsToObserveFromSchema(schema, '/', '/car'))
      .toEqual(['/foo/0','/bar', '/bar/a'])
    expect(getPropsToObserveFromSchema(schema, '/', '/foo'))
      .toEqual(['/bar', '/bar/a', '/car/*'])
  })
})

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

class A {
  getValue (): string {
    return 'A'
  }

  get value (): string {
    return this.getValue()
  }
}
class B extends A {
  getValue (): string {
    return 'B'
  }
}

describe('getter test', () => {
  it ('should work?', () => {
    expect((new A()).value).toBe('A')
    expect((new B()).value).toBe('B')
  })
})
