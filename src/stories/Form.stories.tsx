import React, { useRef, useState } from 'react'
import { Form, Input, Alert } from 'antd'
import { storiesOf } from '@storybook/react'

import { getValidationStatus } from './helpers'
import { Provider, Field, ProviderRef, Watch, events } from '../index'

const initialData = {}

storiesOf('Form', module)
  .add('Example', () => {

    return <SimpleForm />
  })

function SimpleForm () {
  const [counter, setCounter] = useState(false)
  const providerRef = useRef<ProviderRef>(null)

  return (
    <Form style={{ maxWidth: '400px' }}>
      <Provider ref={providerRef} data={initialData}>
        <Watch
          props={['**']}
          events={[events.ValidatedEvent.TYPE]}
          debounce={50}
          render={() => {
            console.log('rerender only on ValidatedEvent')
            if (providerRef.current) {
              const errors = providerRef.current.getErrors()

              const entries = Object.entries(errors)

              if (entries.length) {
                return <Alert
                  type="error"
                  message={entries.map(([path, message]) => (
                    <p key={`err-${path}`}>
                      {path}: {message}
                    </p>
                  ))}
                />
              }
            }

            return null
          }}
        />

        <br />

        <Field
          path="name"
          schema={{
            type: 'string', default: '', minLength: 5, presence: true
          }}
          render={(field) => {
            return (
              <Form.Item
                label="Name"
                validateStatus={getValidationStatus(field)}
                help={field.messageDescription}
                required={field.isRequired}
              >
                <Input
                  value={field.value}
                  onChange={(e) => field.value = e.target.value}
                  onBlur={() => field.validate()}
                />
              </Form.Item>
            )
          }}
        />

        <Field
          path="email"
          schema={{ type: 'string', presence: true, format: 'email' }}
          render={(field) => {
            return (
              <Form.Item
                label="Email"
                validateStatus={getValidationStatus(field)}
                help={field.messageDescription}
                required={field.isRequired}
              >
                <Input
                  value={field.value}
                  onChange={(e) => field.value = e.target.value}
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
          render={(field) => {
            return (
              <Form.Item
                label="Dynamic"
                validateStatus={getValidationStatus(field)}
                help={field.messageDescription}
                required={field.isRequired}
              >
                <Input
                  value={field.value}
                  onChange={(e) => field.value = e.target.value}
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
          render={(field) => {
            return (
              <Form.Item
                label="Some Field"
                validateStatus={getValidationStatus(field)}
                help={field.messageDescription}
                required={field.isRequired}
              >
                <Input
                  value={field.value}
                  onChange={(e) => field.value = e.target.value}
                />
              </Form.Item>
            )
          }}
        />}

        <button
          onClick={() => {
            providerRef.current && providerRef.current.submit()
              .then((res) => console.log('RES', res))
          }}
        >
          Submit
        </button>
        <button onClick={() => setCounter(true)}>Show control</button>
        <button onClick={() => setCounter(false)}>Hide control</button>
      </Provider>
    </Form>
  )
}
