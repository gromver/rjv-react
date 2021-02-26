import React, { useRef } from 'react'
import { Button, Form, Input } from 'antd'
import { storiesOf } from '@storybook/react'

import { FormProvider } from '../FormProvider'
import { Field } from '../Field'
import { getValidationStatus } from '../../stories/helpers'
import { FormApi } from '../../types'

storiesOf('FormProvider', module)
  .add('Test ref', () => {
    const formRef = useRef<FormApi>(null)

    return <Form style={{ maxWidth: '400px' }}>
      <FormProvider data={undefined} ref={formRef}>
        <Field
          path="/"
          schema={{ default: 'wrong email', format: 'email' }}
          render={({ field, state, inputRef }) => {
            return (
              <Form.Item
                label="Value"
                validateStatus={getValidationStatus(state)}
                help={field.messageDescription}
                required={state.isRequired}
                hasFeedback
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
        <Button
          onClick={() => {
            formRef.current?.submit(
              (data) => {
                console.log('Data submitted:', data)
              },
              (firstErrorField) => firstErrorField.focus()
            )
          }}
        >
          Submit
        </Button>
      </FormProvider>
    </Form>
  })
