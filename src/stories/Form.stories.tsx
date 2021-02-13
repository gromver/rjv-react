import React, { useState } from 'react'
import { Form, Input, Checkbox } from 'antd'
import { storiesOf } from '@storybook/react'

import { getValidationStatus, ShowErrors, SubmitBtn } from './helpers'
import { FormProvider, Field, OptionsProvider } from '../index'

const initialData = {}

storiesOf('Form', module)
  .add('Example', () => {
    const [visible, setVisible] = useState(false)

    return (
      <Form style={{ maxWidth: '400px' }}>
        <FormProvider data={initialData}>
          <ShowErrors />

          <br />

          <Field
            path="name"
            schema={{
              type: 'string', default: '', minLength: 5, presence: true
            }}
            render={({ field, state, inputRef }) => {
              return (
                <Form.Item
                  label="name"
                  validateStatus={getValidationStatus(state)}
                  help={field.messageDescription}
                  required={state.isRequired}
                >
                  <Input
                    ref={inputRef}
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
            render={({ field, state, inputRef }) => {
              return (
                <Form.Item
                  label="email"
                  validateStatus={getValidationStatus(state)}
                  help={field.messageDescription}
                  required={state.isRequired}
                >
                  <Input
                    ref={inputRef}
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
            render={({ field, state, inputRef }) => {
              return (
                <Form.Item
                  label="test/3/nested"
                  validateStatus={getValidationStatus(state)}
                  help={field.messageDescription}
                  required={state.isRequired}
                >
                  <Input
                    ref={inputRef}
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
            render={({ field, state, inputRef }) => {
              return (
                <Form.Item
                  label="additionalField"
                  validateStatus={getValidationStatus(state)}
                  help={field.messageDescription}
                  required={state.isRequired}
                >
                  <Input
                    ref={inputRef}
                    value={field.value}
                    onChange={(e) => field.value = e.target.value}
                  />
                </Form.Item>
              )
            }}
          />}

          <SubmitBtn />
          &nbsp;
          {!visible && <button onClick={() => setVisible(true)}>Show additional</button>}
          {visible && <button onClick={() => setVisible(false)}>Hide additional</button>}
        </FormProvider>
      </Form>
    )
  })
  .add('Validate first default', () => {
    return (
      <Form style={{ maxWidth: '400px' }}>
        <FormProvider data={initialData}>
          <p>By default validateFirst=true</p>
          <ShowErrors />

          <br />

          <Field
            path="login"
            schema={{
              default: '',
              presence: true,
              minLength: 4,
              // async validation fn
              validate: (propRef) => {
                return new Promise((resolve) => {
                  // emulate async request
                  setTimeout(() => {
                    if (propRef.value === 'admin') {
                      // error
                      resolve(`Login "admin" is already in use.`)
                    }

                    // success
                    resolve(true)
                  }, 500)
                })
              }
            }}
            render={({ field, state, inputRef }) => {
              return (
                <Form.Item
                  label="Login"
                  validateStatus={getValidationStatus(state)}
                  help={field.messageDescription}
                  required={state.isRequired}
                  hasFeedback
                >
                  <Input
                    ref={inputRef}
                    value={field.value}
                    onChange={(e) => field.value = e.target.value}
                    onBlur={() => field.validate()}
                  />
                </Form.Item>
              )
            }}
          />

          <SubmitBtn />
        </FormProvider>
      </Form>
    )
  })
  .add('Validate first test', () => {
    const [validateFirst, setValidateFirst] = useState(true)

    return (
      <Form style={{ maxWidth: '400px' }}>
        <Form.Item label={'Validate first'}>
          <Checkbox checked={validateFirst} onChange={() => setValidateFirst(!validateFirst)} />
        </Form.Item>

        <OptionsProvider validateFirst={validateFirst}>
          <FormProvider data={initialData}>
            <ShowErrors />

            <br />

            <Field
              path="login"
              schema={{
                default: '',
                presence: true,
                minLength: 4,
                // async validation fn
                validate: (propRef) => {
                  return new Promise((resolve) => {
                    // emulate async request
                    setTimeout(() => {
                      if (propRef.value === 'admin') {
                        // error
                        resolve(`Login "admin" is already in use.`)
                      }

                      // success
                      resolve(true)
                    }, 500)
                  })
                }
              }}
              render={({ field, state, inputRef }) => {
                return (
                  <Form.Item
                    label="Login"
                    validateStatus={getValidationStatus(state)}
                    help={field.messageDescription}
                    required={state.isRequired}
                    hasFeedback
                  >
                    <Input
                      ref={inputRef}
                      value={field.value}
                      onChange={(e) => field.value = e.target.value}
                      onBlur={() => field.validate()}
                    />
                  </Form.Item>
                )
              }}
            />

            <SubmitBtn />
          </FormProvider>
        </OptionsProvider>
      </Form>
    )
  })
