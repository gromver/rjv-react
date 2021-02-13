import React from 'react'
import { Form, Input } from 'antd'
import { storiesOf } from '@storybook/react'
import { getValidationStatus, ShowErrors, SubmitBtn } from './helpers'
import { FormProvider, Field, Form as RjvForm } from '../index'
import { useValidate } from '../hooks'

const initialData = {}

storiesOf('Form', module)
  .add('Validate fields - Form', () => {
    return (
      <Form style={{ maxWidth: '400px' }}>
        <FormProvider data={initialData}>
          <ShowErrors />

          <br />

          <Field
            path="a"
            schema={{ default: '', presence: true }}
            render={({ field, state }) => {
              return (
                <Form.Item
                  label="/a"
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
            path="b"
            schema={{
              type: 'string',
              presence: true,
              validate: async (ref) => {
                const value = ref.value

                return new Promise<string | undefined>((r) => {
                  setTimeout(r, 500, value === 'admin' ? 'admin already exists' : undefined)
                })
              }
            }}
            render={({ field, state }) => {
              return (
                <Form.Item
                  label="/b"
                  validateStatus={getValidationStatus(state)}
                  help={field.messageDescription || 'Must not be "admin"'}
                  required={state.isRequired}
                  hasFeedback
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
            path="c"
            schema={{ default: '', presence: true }}
            render={({ field, state }) => {
              return (
                <Form.Item
                  label="/c"
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

          <RjvForm
            render={({ form }) => (
              <>
                <button onClick={() => form.validateFields('a')}>Validate /a</button>
                &nbsp;
                <button onClick={() => form.validateFields('/b')}>Validate /b</button>
                &nbsp;
                <button onClick={() => form.validateFields(['/a', 'b'])}>Validate /a and /b</button>
              </>
            )}
          />
          &nbsp;
          <SubmitBtn />
        </FormProvider>
      </Form>
    )
  })
  .add('Validate fields - useForm', () => {
    return (
      <Form style={{ maxWidth: '400px' }}>
        <FormProvider data={initialData}>
          <ShowErrors />

          <br />

          <Field
            path="a"
            schema={{ default: '', presence: true }}
            render={({ field, state }) => {
              return (
                <Form.Item
                  label="/a"
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
            path="b"
            schema={{
              type: 'string',
              presence: true,
              validate: async (ref) => {
                const value = ref.value

                return new Promise<string | undefined>((r) => {
                  setTimeout(r, 500, value === 'admin' ? 'admin already exists' : undefined)
                })
              }
            }}
            render={({ field, state }) => {
              return (
                <Form.Item
                  label="/b"
                  validateStatus={getValidationStatus(state)}
                  help={field.messageDescription || 'Must not be "admin"'}
                  required={state.isRequired}
                  hasFeedback
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
            path="c"
            schema={{ default: '', presence: true }}
            render={({ field, state }) => {
              return (
                <Form.Item
                  label="/c"
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

          <ValidateButton onClick={(validate) => validate('a')}>Validate /a</ValidateButton>
          &nbsp;
          <ValidateButton onClick={(validate) => validate('/b')}>Validate /b</ValidateButton>
          &nbsp;
          <ValidateButton onClick={(validate) => validate(['/a', 'b'])}>Validate /a and /b</ValidateButton>
          &nbsp;
          <SubmitBtn />
        </FormProvider>
      </Form>
    )
  })

function ValidateButton (props: { onClick: (validateFn: (path: string | string[]) => Promise<void>) => void, children: React.ReactNode }) {
  const validateFn = useValidate()

  return <button onClick={() => props.onClick(validateFn)}>{props.children}</button>
}
