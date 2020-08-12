import React, { useRef } from 'react'
import { Model, types } from 'rjv'
import { Form, Input, Alert, Select } from 'antd'
import { storiesOf } from '@storybook/react'

import { ModelProvider, ModelProviderRef } from '../ModelProvider'
import { Subscribe } from '../Subscribe'
import { Field } from '../Field'
import { Submit } from '../Submit'
import { getMessage, getValidationStatus } from '../stories/utils'

const schema: types.ISchema = {
  properties: {
    condition: {
      type: 'string',
      default: 'empty',
      presence: true,
      dependencies: ['../foo', '../bar']
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
  .add('Simple Field', () => {

    return <Form style={{ maxWidth: '400px' }}>
      <ModelProvider data={''} schema={{ presence: true }}>
        <Field
          path="/"
          render={(ref) => {
            const message = getMessage(ref)

            return (
              <Form.Item
                label="Value"
                validateStatus={getValidationStatus(ref)}
                help={message}
                required={ref.isShouldNotBeBlank}
              >
                <Input
                  value={ref.getValue()}
                  onFocus={() => ref.markAsTouched()}
                  onChange={(e) => ref.markAsDirty().markAsChanged().setValue(e.target.value)}
                  onBlur={() => ref.validate()}
                />
              </Form.Item>
            )
          }}
        />
      </ModelProvider>
    </Form>
  })
  .add('Safe Field - Schema driven', () => {
    return <Form style={{ maxWidth: '400px' }}>
      <ModelProvider
        data={{}}
        schema={
          {
            properties: {
              foo: {
                default: '',
                presence: true,
                validate: () => new Promise((res) => setTimeout(() => res({}), 500))
              }
            }
          }
        }
      >
        <Field
          path="foo"
          render={(ref) => {
            const message = getMessage(ref)

            return (
              <Form.Item
                label="Value"
                validateStatus={getValidationStatus(ref)}
                help={message || 'Should appear after 500ms'}
                required={ref.isShouldNotBeBlank}
              >
                <Input
                  value={ref.getValue()}
                  onFocus={() => ref.markAsTouched()}
                  onChange={(e) => ref.markAsDirty().markAsChanged().setValue(e.target.value)}
                  onBlur={() => ref.validate()}
                />
              </Form.Item>
            )
          }}
        />
      </ModelProvider>
    </Form>
  })
  .add('Safe Field - UI driven', () => {
    return <Form style={{ maxWidth: '400px' }}>
      <ModelProvider data={{}}>
        <Field
          path="foo"
          schema={{
            default: '',
            presence: true,
            validate: () => new Promise((res) => setTimeout(() => res({}), 500))
          }}
          render={(ref) => {
            const message = getMessage(ref)

            return (
              <Form.Item
                label="Value"
                validateStatus={getValidationStatus(ref)}
                help={message || 'Should appear after 500ms'}
                required={ref.isShouldNotBeBlank}
              >
                <Input
                  value={ref.getValue()}
                  onFocus={() => ref.markAsTouched()}
                  onChange={(e) => ref.markAsDirty().markAsChanged().setValue(e.target.value)}
                  onBlur={() => ref.validate()}
                />
              </Form.Item>
            )
          }}
        />
      </ModelProvider>
    </Form>
  })
  .add('Static schema - conditional form test', () => {

    return <StaticSchemaForm />
  })
  .add('Dynamic schema - conditional form test', () => {

    return <DynamicSchemaForm />
  })

function StaticSchemaForm () {
  const formRef = useRef<ModelProviderRef>()

  return (
    <Form style={{ maxWidth: '400px' }}>
      <ModelProvider ref={formRef} data={initialData} schema={schema}>
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
                    ref.validate()
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
      </ModelProvider>
    </Form>
  )
}

function DynamicSchemaForm () {
  const formRef = useRef<ModelProviderRef>()

  return (
    <Form style={{ maxWidth: '400px' }}>
      <ModelProvider ref={formRef} data={initialData}>
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
          render={(ref, register) => {
            const message = getMessage(ref)

            return (
              <Form.Item
                label="Condition"
                validateStatus={getValidationStatus(ref)}
                help={message}
                required={ref.isShouldNotBeBlank}
              >
                <Select
                  ref={register}
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
              render={(ref, register) => {
                const message = getMessage(ref)

                return (
                  <Form.Item
                    label="Foo"
                    validateStatus={getValidationStatus(ref)}
                    help={message}
                    required={ref.isShouldNotBeBlank}
                  >
                    <Input
                      ref={register}
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
              render={(ref, register) => {
                const message = getMessage(ref)

                return (
                  <Form.Item
                    label="Bar"
                    validateStatus={getValidationStatus(ref)}
                    help={message}
                    required={ref.isShouldNotBeBlank}
                  >
                    <Input
                      ref={register}
                      value={ref.getValue()}
                      onChange={(e) => ref.setValue(e.target.value)}
                    />
                  </Form.Item>
                )
              }}
            />
          )}
        />

        <Submit
          render={(handleSubmit) => (
            <button
              onClick={handleSubmit}
            >
              Submit
            </button>
          )}
        />

      </ModelProvider>
    </Form>
  )
}
