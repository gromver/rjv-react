import React, { useRef } from 'react'
import { Model, Ref } from 'rjv'
import { Form, Input, Alert } from 'antd'
import { storiesOf } from '@storybook/react'

import { ModelProvider, ModelProviderRef } from '../ModelProvider'
import { OptionsProvider } from '../OptionsProvider'
import { Subscribe } from '../Subscribe'
import { Field } from '../Field'

// --- helpers ---
export function getValidationStatus (ref: Ref) {
  if (ref.isValidating) {
    return 'validating'
  }

  if (ref.isValid) {
    return 'success'
  }

  if (ref.isInvalid) {
    return 'error'
  }

  return undefined
}

export function getMessage (ref) {
  if (ref.isValidated) {
    return ref.messageDescription || ''
  }

  return ''
}

const schema = {
  properties: {
    name: { type: 'string', default: '', presence: true },
    email: { type: 'string', default: '', presence: true, format: 'email' }
  }
}

const initialData = {}

storiesOf('OptionsProvider', module)
  .add('Custom errors', () => {

    return <OptionsProvider
      options={{
        validator: {
          errors: {
            presence: 'should not be empty'
          }
        }
      }}
    >
      <TestForm />
    </OptionsProvider>
  })

function TestForm () {
  const formRef = useRef<ModelProviderRef>()

  return (
    <Form style={{ maxWidth: '400px' }}>
      <ModelProvider
        ref={formRef}
        data={initialData}
        schema={schema}
        options={{
          validator: {
            errors: {
              format: 'wrong email'
            }
          }
        }}
      >
        <Subscribe
          render={(model: Model) => {
            const ref = model.ref()
            const errors = ref.errors.map((err, index) => (
              <p key={`err-${index}`}>
                {err.path || '..'}: {err.message && err.message.description}
              </p>
            ))

            return errors.length && ref.isValidated
              ? <Alert type="error" message={errors} />
              : (ref.isValidated ? <Alert type="success" message="Success" /> : null)
          }}
        />

        <Field
          path="name"
          // _schema={{
          //   type: 'string', default: '', minLength: 5, presence: true
          // }}
          render={(ref) => {
            const message = getMessage(ref)

            return (
              <Form.Item
                label="Name"
                validateStatus={getValidationStatus(ref)}
                help={message}
                required={ref.isShouldNotBeBlank}
              >
                <Input
                  value={ref.getValue()}
                  onChange={(e) => ref.setValue(e.target.value)}
                />
              </Form.Item>
            )
          }}
        />

        <Field
          path="email"
          render={(ref) => {
            const message = getMessage(ref)

            return (
              <Form.Item
                label="Email"
                validateStatus={getValidationStatus(ref)}
                help={message}
                required={ref.isShouldNotBeBlank}
              >
                <Input
                  value={ref.getValue()}
                  onChange={(e) => ref.setValue(e.target.value)}
                />
              </Form.Item>
            )
          }}
        />

        <button
          onClick={() => {
            console.log('formRef.current', (formRef.current as any).model())
            formRef.current && formRef.current.submit()
          }}
        >
          Submit
        </button>
      </ModelProvider>
    </Form>
  )
}
