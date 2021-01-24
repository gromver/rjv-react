import React, { useState } from 'react'
import { Form, Input } from 'antd'
import { storiesOf } from '@storybook/react'

import { getValidationStatus, ShowErrors, SubmitBtn } from './helpers'
import { FormProvider, Field, ErrorProvider } from '../index'

storiesOf('Form', module)
  .add('Refresh Data', () => {
    const [data, setData] = useState({})

    return (
      <Form style={{ maxWidth: '400px' }}>
        <FormProvider data={data}>
          <ErrorProvider>
            <ShowErrors />

            <br />

            <Field
              path="name"
              schema={{
                type: 'string', default: '', presence: true
              }}
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
                      onBlur={() => field.validate()}
                    />
                  </Form.Item>
                )
              }}
            />

            <Field
              path="email"
              schema={{
                type: 'string',
                format: 'email',
                resolveSchema: (ref) => ref.ref('/name').value ? { presence: true } : {}
              }}
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
                      onBlur={() => field.validate()}
                    />
                  </Form.Item>
                )
              }}
            />

            <SubmitBtn />
            <button onClick={() => setData({})}>
              Refresh Form
            </button>
          </ErrorProvider>
        </FormProvider>
      </Form>
    )
  })
