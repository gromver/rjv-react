import React from 'react'
import { Form, Input, Card } from 'antd'
import { storiesOf } from '@storybook/react'

import { FormProvider } from '../FormProvider'
import { ErrorProvider } from './index'
import { Field } from '../Field'
import { getValidationStatus, ShowErrors, SubmitBtn } from '../../stories/helpers'

type Props = { path: string }

function InputField ({ path }: Props) {
  return <Field
    path={path}
    schema={{ default: '', presence: true }}
    render={(field, inputRef) => {
      return (
        <Form.Item
          label={path}
          validateStatus={getValidationStatus(field)}
          help={field.messageDescription}
          required={field.state.isRequired}
          hasFeedback
        >
          <Input
            ref={inputRef}
            value={field.value}
            onFocus={() => field.markAsTouched()}
            onChange={(e) => field.markAsInvalidated().value = e.target.value}
            onBlur={() => field.validate()}
          />
        </Form.Item>
      )
    }}
  />
}

storiesOf('ErrorProvider', module)
  .add('Example', () => {
    return <Form style={{ maxWidth: '800px' }}>
      <FormProvider data={{}}>
        <p>Global error provider:</p>
        <ShowErrors />
        <br />
        <InputField path="name" />

        <Card>
          <ErrorProvider>
            <p>Local error provider:</p>
            <ShowErrors />
            <br />
            <InputField path="foo" />
            <InputField path="a/b/c" />
          </ErrorProvider>
        </Card>

        <br />
        <SubmitBtn />
      </FormProvider>
    </Form>
  })
