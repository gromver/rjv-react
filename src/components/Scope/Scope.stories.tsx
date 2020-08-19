import React, { useRef } from 'react'
import { Model, Ref } from 'rjv'
import { Form, Input, Alert } from 'antd'
import { storiesOf } from '@storybook/react'

import { ModelProvider, ModelProviderRef } from '../ModelProvider'
import { Subscribe } from '../Subscribe'
import { Field } from '../Field'
import { Scope } from '../Scope'

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
  const { state } = ref
  let message = ''

  if (ref.isValidated) {
    message = state.message && state.message.description
  }

  return message
}

const schema = {
  properties: {
    auth: {
      properties: {
        name: { type: 'string', default: '', presence: true },
        email: { type: 'string', default: '', presence: true, format: 'email' }
      }
    }
  }
}

const initialData = {
  auth: {}
}

storiesOf('Scope', module)
  .add('Simple Test', () => {

    return <SimpleForm />
  })

function SimpleForm () {
  const formRef = useRef<ModelProviderRef>()

  return (
    <Form style={{ maxWidth: '400px' }}>
      <ModelProvider ref={formRef} data={initialData} schema={schema}>
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

        <Scope path="auth">
          <Field
            path="name"
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
        </Scope>

        <button
          onClick={() => {
            formRef.current && formRef.current.submit()
          }}
        >
          Submit
        </button>
      </ModelProvider>
    </Form>
  )
}
