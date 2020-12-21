import React from 'react'
import { storiesOf } from '@storybook/react'
import { Form, Input } from 'antd'
import { FormProvider } from '../components/FormProvider'
import { Field } from '../components/Field'
import { getValidationStatus } from '../stories/helpers'
import useErrors from './useErrors'
import { ErrorProvider } from '../components/ErrorProvider'

const initialData = {}

type Props = { path: string }

function InputField ({ path }: Props) {
  return <Field
    path={path}
    schema={{ default: '', presence: true, format: 'email' }}
    render={(field, inputRef) => {
      return (
        <Form.Item
          label={path}
          validateStatus={getValidationStatus(field)}
          help={field.messageDescription}
          required={field.isRequired}
          hasFeedback
        >
          <Input
            ref={inputRef}
            value={field.value}
            onFocus={() => field.markAsTouched()}
            onChange={(e) => field.value = e.target.value}
            onBlur={() => field.validate()}
          />
        </Form.Item>
      )
    }}
  />
}

function ShowErrors () {
  const errors = useErrors()

  return errors.map(([path, message]) => <p key={path}><strong>{path}</strong> - {message}</p>) as any
}

storiesOf('useErrors', module)
  .add('useErrors', () => {
    return <FormProvider data={initialData}>
      <ErrorProvider>
        <InputField path="a" />
        <ErrorProvider>
          <InputField path="b/c" />
          <ShowErrors />
        </ErrorProvider>
        <br />
        <ShowErrors />
      </ErrorProvider>
    </FormProvider>
  })
