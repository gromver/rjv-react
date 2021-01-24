import React from 'react'
import { Form, Input, Row, Col } from 'antd'
import { storiesOf } from '@storybook/react'

import { getValidationStatus, SubmitBtn } from './helpers'
import { FormProvider, Field, Form as RjvForm } from '../index'

const initialData = {}

storiesOf('Form', module)
  .add('Test states', () => {

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
                        field.value = e.target.value
                        return field.validate()
                      }}
                      // onChange={(e) => field.dirty().value = e.target.value}
                      // onBlur={() => field.validate()}
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

            <SubmitBtn />
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
          </Col>
        </Row>
      </FormProvider>
    )
  })
