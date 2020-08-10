import React from 'react'
import { types } from 'rjv'
import { Form, Select } from 'antd'
import { storiesOf } from '@storybook/react'

import { ModelProvider } from '../ModelProvider'
import { Field } from '../Field'
import { getMessage, getValidationStatus } from '../stories/utils'
import { IfRefsProvided } from './index'

const schema: types.ISchema = {
  properties: {
    condition1: {
      type: 'string',
      default: 'empty',
      presence: true
    },
    condition2: {
      type: 'string',
      default: 'empty',
      presence: true
    }
  },
  applySchemas: [
    {
      if: { properties: { condition1: { const: 'foo' } } },
      then: {
        properties: {
          foo1: { type: 'string', default: '', presence: true }
        }
      }
    },
    {
      if: { properties: { condition1: { const: 'bar' } } },
      then: {
        properties: {
          bar1: { type: 'string', default: '', presence: true }
        }
      }
    },
    {
      if: { properties: { condition2: { const: 'foo' } } },
      then: {
        properties: {
          foo2: { type: 'string', default: '', presence: true }
        }
      }
    },
    {
      if: { properties: { condition2: { const: 'bar' } } },
      then: {
        properties: {
          bar2: { type: 'string', default: '', presence: true }
        }
      }
    }
  ]
}

const initialData = {
  foo1: 'foo1',
  bar1: 'bar1',
  foo2: 'foo2',
  bar2: 'bar2'
}

storiesOf('RefsProvided', module)
  .add('Should render when model refs exist', () => {

    return <SimpleForm />
  })

function SimpleForm () {
  return (
    <Form style={{ maxWidth: '400px' }}>
      <ModelProvider data={initialData} schema={schema}>
        <Field
          path="condition1"
          render={(ref) => {
            const message = getMessage(ref)

            return (
              <Form.Item
                label="Condition #1"
                validateStatus={getValidationStatus(ref)}
                help={message}
                required={ref.isShouldNotBeBlank}
              >
                <Select
                  value={ref.getValue()}
                  onChange={(value) => {
                    ref.setValue(value)
                    ref.prepare()
                  }}
                >
                  <Select.Option value="empty">empty</Select.Option>
                  <Select.Option value="foo">foo</Select.Option>
                  <Select.Option value="bar">bar</Select.Option>
                </Select>
              </Form.Item>
            )
          }}
        />

        <Field
          path="condition2"
          render={(ref) => {
            const message = getMessage(ref)

            return (
              <Form.Item
                label="Condition #2"
                validateStatus={getValidationStatus(ref)}
                help={message}
                required={ref.isShouldNotBeBlank}
              >
                <Select
                  value={ref.getValue()}
                  onChange={(value) => {
                    ref.setValue(value)
                    ref.prepare()
                  }}
                >
                  <Select.Option value="empty">empty</Select.Option>
                  <Select.Option value="foo">foo</Select.Option>
                  <Select.Option value="bar">bar</Select.Option>
                </Select>
              </Form.Item>
            )
          }}
        />

        <Form.Item>
          <IfRefsProvided paths={['foo1']} render={(ref) => ref.value} />
        </Form.Item>
        <Form.Item>
          <IfRefsProvided paths={['bar1']} render={(ref) => ref.value} />
        </Form.Item>
        <Form.Item>
          <IfRefsProvided paths={['foo2']} render={(ref) => ref.value} />
        </Form.Item>
        <Form.Item>
          <IfRefsProvided paths={['bar2']} render={(ref) => ref.value} />
        </Form.Item>
        <Form.Item>
          <IfRefsProvided
            paths={['foo1', 'foo2']}
            render={(ref1, ref2) => `${ref1.value} + ${ref2.value}`}
          />
        </Form.Item>
        <Form.Item>
          <IfRefsProvided
            paths={['bar1', 'bar2']}
            render={(ref1, ref2) => `${ref1.value} + ${ref2.value}`}
          />
        </Form.Item>
      </ModelProvider>
    </Form>
  )
}
