import React, { useRef, useState } from 'react'
import { Form, Input } from 'antd'
import { storiesOf } from '@storybook/react'

import { getValidationStatus, ShowErrors } from './helpers'
import { FormProvider, FormProviderRef, Field } from '../index'

const initialData = {}

storiesOf('Form', module)
  .add('Example', () => {

    return <SimpleForm />
  })

function SimpleForm () {
  const [counter, setCounter] = useState(false)
  const providerRef = useRef<FormProviderRef>(null)

  return (
    <Form style={{ maxWidth: '400px' }}>
      <FormProvider ref={providerRef} data={initialData}>
        <ShowErrors />

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
      </FormProvider>
    </Form>
  )
}
