import React, { useRef } from 'react'
import { Model } from 'rjv'
import { Form, Input, Alert, Select } from 'antd'
import { storiesOf } from '@storybook/react'

import { Provider, ProviderRef } from '../Provider'
import { Subscribe } from '../Subscribe'
import { Field } from '../Field'
import { getMessage, getValidationStatus } from '../stories/utils'

const initialData = {}

storiesOf('Field', module)
  .add('SchemaRef - conditional form test', () => {

    return <SimpleForm />
  })

function SimpleForm () {
  const formRef = useRef<ProviderRef>()

  return (
    <Form style={{ maxWidth: '400px' }}>
      <Provider ref={formRef} data={initialData}>
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
          schema={{
            type: 'string',
            default: 'empty',
            presence: true
          }}
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

        <Subscribe
          to={['condition']}
          render={(conditionRef) => (
            conditionRef.value === 'foo' && <Field
              path="foo"
              schema={{ type: 'string', default: '', presence: true }}
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
            />
          )}
        />

        <Subscribe
          to={['condition']}
          render={(conditionRef) => (
            conditionRef.value === 'bar' && <Field
              path="bar"
              schema={{ type: 'string', default: '', presence: true }}
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
            />
          )}
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
