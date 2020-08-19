import React, { useRef, useState } from 'react'
import { Model } from 'rjv'
import { Form, Input, Alert } from 'antd'
import { storiesOf } from '@storybook/react'

import { ModelProvider, ModelProviderRef } from '../ModelProvider'
import { Subscribe } from '../Subscribe'
import { Field } from '../Field'
import { getMessage, getValidationStatus } from './utils'

const initialData = {}

storiesOf('Form', module)
  .add('Misc', () => {

    return <SimpleForm />
  })

function SimpleForm () {
  const [counter, setCounter] = useState(false)
  const formRef = useRef<ModelProviderRef>()

  return (
    <Form style={{ maxWidth: '400px' }}>
      <ModelProvider ref={formRef} data={initialData} /* schema={schema} */>
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
          path="name"
          schema={{
            type: 'string', default: '', minLength: 5, presence: true
          }}
          render={(ref) => {
            const message = getMessage(ref)

            return (
              <Form.Item
                label="Name"
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

        <Field
          path="email"
          render={(ref) => {
            const message = getMessage(ref)

            return (
              <Form.Item
                label="Email"
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

        <Field
          path="test/3/dynamic"
          schema={{
            type: 'string', default: '', minLength: 5, presence: true, format: 'email'
          }}
          render={(ref) => {
            const message = getMessage(ref)

            return (
              <Form.Item
                label="Dynamic"
                validateStatus={getValidationStatus(ref)}
                help={message}
                required={ref.isShouldNotBeBlank}
              >
                <Input
                  value={ref.getValue()}
                  onChange={(e) => ref.setValue(e.target.value)}
                  onBlur={() => ref.ref('../..').validate()}
                />
              </Form.Item>
            )
          }}
        />

        {counter && <Field
          path="someField"
          schema={{
            type: 'string', default: '', minLength: 2, presence: true
          }}
          render={(ref) => {
            const message = getMessage(ref)

            return (
              <Form.Item
                label="Some Field"
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
        />}

        <button
          onClick={() => {
            formRef.current && formRef.current.submit()
          }}
        >
          Submit
        </button>
        <button onClick={() => setCounter(true)}>Show control</button>
        <button onClick={() => setCounter(false)}>Hide control</button>
      </ModelProvider>
    </Form>
  )
}
