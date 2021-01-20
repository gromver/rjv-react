import React, { useCallback, useRef } from 'react'
import { Form, Input } from 'antd'
import { storiesOf } from '@storybook/react'

import { FormProvider, FormApi } from '../FormProvider'
import Scope from './Scope'
import { Field } from '../Field'
import { getValidationStatus } from '../../stories/helpers'

const initialData = {
  auth: {}
}

storiesOf('Scope', module)
  .add('Simple Test', () => {

    return <SimpleForm />
  })

function SimpleForm () {
  const providerRef = useRef<FormApi>(null)
  const handleSubmit = useCallback(async () => {
    if (providerRef.current) {
      const res = await providerRef.current.submit()

      if (!res.valid) {
        res.firstErrorField && res.firstErrorField.focus()
      } else {
        console.log('DATA', res.data)
      }
    }
  }, [providerRef.current])

  return (
    <Form style={{ maxWidth: '400px' }}>
      <FormProvider ref={providerRef} data={initialData}>
        <Scope path="auth">
          <Field
            path="name"
            schema={{ type: 'string', default: '', presence: true }}
            render={(field) => {
              return (
                <Form.Item
                  label="Name"
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
            path="email"
            schema={{ type: 'string', default: '', presence: true, format: 'email' }}
            render={(field) => {
              return (
                <Form.Item
                  label="Email"
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
        </Scope>

        <button onClick={handleSubmit}>
          Submit
        </button>
      </FormProvider>
    </Form>
  )
}
