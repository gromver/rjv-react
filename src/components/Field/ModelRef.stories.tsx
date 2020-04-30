import React, { useRef } from 'react'
import { Model, types } from 'rjv'
import { Form, Input, Alert, Select } from 'antd'
import { storiesOf } from '@storybook/react'

import { Provider, ProviderRef } from '../Provider'
import { Subscribe } from '../Subscribe'
import { Field } from '../Field'
import { getMessage, getValidationStatus } from '../stories/utils'

const schema: types.ISchema = {
  properties: {
    condition: {
      type: 'string',
      default: 'empty',
      presence: true
    }
  },
  applySchemas: [
    {
      if: { properties: { condition: { const: 'foo' } } },
      then: {
        properties: {
          foo: { type: 'string', default: '', presence: true }
        }
      }
    },
    {
      if: { properties: { condition: { const: 'bar' } } },
      then: {
        properties: {
          bar: { type: 'string', default: '', presence: true }
        }
      }
    }
  ]
}

const initialData = {}

storiesOf('Field', module)
  .add('ModelRef - conditional (safe mode) form test', () => {

    return <SimpleForm />
  })

function SimpleForm () {
  const formRef = useRef<ProviderRef>()

  return (
    <Form style={{ maxWidth: '400px' }}>
      <Provider ref={formRef} data={initialData} schema={schema}>
        <Subscribe
          render={(model: Model) => {
            const ref = model.ref()
            const errors = ref.errors.map((err, index) => (
              <p key={`err-${index}`}>
                {err.path || '..'}: {err.message && err.message.description}
              </p>
            ))

            return errors.length && ref.isValidated
              ? <Alert type="error" message={errors} />
              : (ref.isValidated ? <Alert type="success" message="Success" /> : null)
          }}
        />

        <Field
          path="condition"
          render={(ref) => {
            const message = getMessage(ref)

            return (
              <Form.Item
                label="Condition"
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
          path="foo"
          render={(ref) => {
            const message = getMessage(ref)

            return (
              <Form.Item
                label="Foo"
                validateStatus={getValidationStatus(ref)}
                help={message}
                required={ref.isShouldNotBeBlank}
              >
                <Input
                  value={ref.getValue()}
                  onChange={(e) => ref.setValue(e.target.value)}
                />
              </Form.Item>
            )
          }}
          safe
        />

        <Field
          path="bar"
          render={(ref) => {
            const message = getMessage(ref)

            return (
              <Form.Item
                label="Bar"
                validateStatus={getValidationStatus(ref)}
                help={message}
                required={ref.isShouldNotBeBlank}
              >
                <Input
                  value={ref.getValue()}
                  onChange={(e) => ref.setValue(e.target.value)}
                />
              </Form.Item>
            )
          }}
          safe
        />

        <button
          onClick={() => {
            formRef.current && formRef.current.submit()
          }}
        >
          Submit
        </button>
      </Provider>
    </Form>
  )
}
