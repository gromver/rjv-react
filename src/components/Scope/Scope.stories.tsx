import React from 'react'
import { Form, Input } from 'antd'
import { storiesOf } from '@storybook/react'

import { FormProvider } from '../FormProvider'
import Scope from './Scope'
import { Field } from '../Field'
import { getValidationStatus, SubmitBtn } from '../../stories/helpers'

const initialData = {
  auth: {}
}

storiesOf('Scope', module)
  .add('Simple Test', () => {

    return <SimpleForm />
  })

function SimpleForm () {
  return (
    <Form style={{ maxWidth: '400px' }}>
      <FormProvider data={initialData}>
        <Scope path="auth">
          <Field
            path="name"
            schema={{ type: 'string', default: '', presence: true }}
            render={({ field, state }) => {
              return (
                <Form.Item
                  label="Name"
                  validateStatus={getValidationStatus(state)}
                  help={field.messageDescription}
                  required={state.isRequired}
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
            render={({ field, state }) => {
              return (
                <Form.Item
                  label="Email"
                  validateStatus={getValidationStatus(state)}
                  help={field.messageDescription}
                  required={state.isRequired}
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

        <SubmitBtn />
      </FormProvider>
    </Form>
  )
}
