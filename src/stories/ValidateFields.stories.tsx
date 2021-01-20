import React, { useRef } from 'react'
import { Form, Input } from 'antd'
import { storiesOf } from '@storybook/react'
import { getValidationStatus, ShowErrors, SubmitBtn } from './helpers'
import { FormProvider, FormApi, Field } from '../index'
import { useValidate } from '../hooks'

const initialData = {}

storiesOf('Form', module)
  .add('Validate fields - using ref', () => {
    const providerRef = useRef<FormApi>(null)

    return (
      <Form style={{ maxWidth: '400px' }}>
        <FormProvider ref={providerRef} data={initialData}>
          <ShowErrors />

          <br />

          <Field
            path="a"
            schema={{ default: '', presence: true }}
            render={(field) => {
              return (
                <Form.Item
                  label="/a"
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
            render={(field) => {
              return (
                <Form.Item
                  label="/b"
                  validateStatus={getValidationStatus(field)}
                  help={field.messageDescription || 'Must not be "admin"'}
                  required={field.state.isRequired}
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
            render={(field) => {
              return (
                <Form.Item
                  label="/c"
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

          <button onClick={() => providerRef.current?.validate('a')}>Validate /a</button>
          &nbsp;
          <button onClick={() => providerRef.current?.validate('/b')}>Validate /b</button>
          &nbsp;
          <button onClick={() => providerRef.current?.validate(['/a', 'b'])}>Validate /a and /b</button>
          &nbsp;
          <SubmitBtn />
        </FormProvider>
      </Form>
    )
  })
  .add('Validate fields - using hooks', () => {
    return (
      <Form style={{ maxWidth: '400px' }}>
        <FormProvider data={initialData}>
          <ShowErrors />

          <br />

          <Field
            path="a"
            schema={{ default: '', presence: true }}
            render={(field) => {
              return (
                <Form.Item
                  label="/a"
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
            render={(field) => {
              return (
                <Form.Item
                  label="/b"
                  validateStatus={getValidationStatus(field)}
                  help={field.messageDescription || 'Must not be "admin"'}
                  required={field.state.isRequired}
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
            render={(field) => {
              return (
                <Form.Item
                  label="/c"
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
