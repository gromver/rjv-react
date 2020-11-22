import React, { useCallback, useRef, useState } from 'react'
import { Form, Input } from 'antd'
import { storiesOf } from '@storybook/react'

import { getValidationStatus, ShowErrors } from './helpers'
import { FormProvider, FormProviderRef, Field, ErrorProvider } from '../index'

storiesOf('Form', module)
  .add('Refresh Data', () => {
    const [version, setVersion] = useState(1)
    const providerRef = useRef<FormProviderRef>(null)
    const handleSubmit = useCallback(async () => {
      if (providerRef.current) {
        const res = await providerRef.current.submit()
        console.log('RESULT', res)
        if (!res.valid) {
          res.firstErrorField && res.firstErrorField.focus()
        }
      }
    }, [providerRef.current])

    return (
      <Form style={{ maxWidth: '400px' }}>
        <FormProvider ref={providerRef} data={{ version }}>
          <ErrorProvider>
            <ShowErrors />

            <br />

            <Field
              path="version"
              schema={{
                type: 'string', default: '', presence: true
              }}
              render={(field) => {
                return (
                  <Form.Item
                    label="Version"
                    validateStatus={getValidationStatus(field)}
                    help={field.messageDescription}
                    required={field.isRequired}
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
                resolveSchema: (ref) => ref.ref('/version').value > 1 ? { presence: true } : {}
              }}
              render={(field) => {
                return (
                  <Form.Item
                    label="Email"
                    validateStatus={getValidationStatus(field)}
                    help={field.messageDescription}
                    required={field.isRequired}
                  >
                    <Input
                      value={field.value}
                      onChange={(e) => field.value = e.target.value}
                    />
                  </Form.Item>
                )
              }}
            />

            <button onClick={handleSubmit}>
              Submit
            </button>
            <button onClick={() => setVersion((v) => v + 1)}>
              Change initial data
            </button>
          </ErrorProvider>
        </FormProvider>
      </Form>
    )
  })
