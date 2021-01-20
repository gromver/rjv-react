import React, { useRef, useState } from 'react'
import { Form, Input } from 'antd'
import { storiesOf } from '@storybook/react'

import { getValidationStatus, ShowErrors } from './helpers'
import { FormProvider, FormApi, Field } from '../index'

const initialData = {}

storiesOf('Form', module)
  .add('Example', () => {

    return <SimpleForm />
  })

function SimpleForm () {
  const [visible, setVisible] = useState(false)
  const providerRef = useRef<FormApi>(null)

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
                label="name"
                validateStatus={getValidationStatus(field)}
                help={field.messageDescription}
                required={field.state.isRequired}
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
                label="email"
                validateStatus={getValidationStatus(field)}
                help={field.messageDescription}
                required={field.state.isRequired}
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
          path="test/3/nested"
          schema={{
            type: 'string', default: '', minLength: 5, presence: true, format: 'email'
          }}
          render={(field) => {
            return (
              <Form.Item
                label="test/3/nested"
                validateStatus={getValidationStatus(field)}
                help={field.messageDescription}
                required={field.state.isRequired}
              >
                <Input
                  value={field.value}
                  onChange={(e) => field.value = e.target.value}
                />
              </Form.Item>
            )
          }}
        />

        {visible && <Field
          path="additionalField"
          schema={{
            type: 'string', default: '', minLength: 2, presence: true
          }}
          render={(field) => {
            return (
              <Form.Item
                label="additionalField"
                validateStatus={getValidationStatus(field)}
                help={field.messageDescription}
                required={field.state.isRequired}
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
        &nbsp;
        {!visible && <button onClick={() => setVisible(true)}>Show additional</button>}
        {visible && <button onClick={() => setVisible(false)}>Hide additional</button>}
      </FormProvider>
    </Form>
  )
}
