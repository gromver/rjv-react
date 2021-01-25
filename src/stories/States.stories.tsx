import React, { useState } from 'react'
import { Form, Input, Row, Col, Button } from 'antd'
import { storiesOf } from '@storybook/react'

import { getValidationStatus } from './helpers'
import { FormProvider, Field, Form as RjvForm, FormStateUpdater, Submit } from '../index'

storiesOf('Form', module)
  .add('Test states', () => {
    const [initialData, setInitialData] = useState({})

    return (
      <FormProvider data={initialData}>
        <Row gutter={16}>
          <Col sm={12}>
            <Field
              path="name"
              schema={{
                type: 'string', default: '', minLength: 5, presence: true
              }}
              render={({ field, state }) => {
                return (
                  <Form.Item
                    label="name"
                    validateStatus={getValidationStatus(state)}
                    help={field.messageDescription}
                    required={state.isRequired}
                  >
                    <Input
                      value={field.value}
                      onFocus={() => field.touched()}
                      onChange={(e) => {
                        field.dirty().value = e.target.value
                        return field.validate()
                      }}
                    />
                  </Form.Item>
                )
              }}
            />

            <Field
              path="email"
              schema={{ type: 'string', presence: true, format: 'email' }}
              render={({ field, state }) => {
                return (
                  <Form.Item
                    label="email"
                    validateStatus={getValidationStatus(state)}
                    help={field.messageDescription}
                    required={state.isRequired}
                  >
                    <Input
                      value={field.value}
                      onFocus={() => field.touched()}
                      onChange={(e) => {
                        field.value = e.target.value
                        return field.validate()
                      }}
                    />
                  </Form.Item>
                )
              }}
            />

            <FormStateUpdater />

            <Submit
              onSuccess={(data) => console.log('SUBMIT RESULT', data)}
              render={(handleSubmit, formState) => (
                <Button onClick={handleSubmit} disabled={!formState.isValid}>Submit</Button>
              )}
            />
          </Col>
          <Col sm={12}>
            <h3>Form state</h3>
            <RjvForm
              render={({ state }) => {
                console.log('render form state')
                return (
                  <pre>{JSON.stringify(state, null, '\t')}</pre>
                )
              }}
            />
            <div>
              <Button onClick={() => setInitialData({})}>Set invalid initial data</Button>
              &nbsp;
              <Button
                onClick={() => setInitialData({
                  name: 'marcus',
                  email: 'example@mail.com'
                })}
              >
                Set valid initial data
              </Button>
            </div>
          </Col>
        </Row>
      </FormProvider>
    )
  })
