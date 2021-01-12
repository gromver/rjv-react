import React from 'react'
import { storiesOf } from '@storybook/react'
import { Form, Input } from 'antd'
import ErrorMessages from './ErrorMessages'
import { FormProvider, ValidationErrors } from '../FormProvider'
import { Field } from '../Field'
import { ErrorProvider } from '../ErrorProvider'
import { getValidationStatus } from '../../stories/helpers'

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
          required={field.state.isRequired}
          hasFeedback
        >
          <Input
            ref={inputRef}
            value={field.value}
            onFocus={() => field.markAsTouched()}
            onChange={(e) => field.markAsPristine().value = e.target.value}
            onBlur={() => field.validate()}
          />
        </Form.Item>
      )
    }}
  />
}

function renderErrors (errors: ValidationErrors) {
  return errors.map(({path, message}) => <p key={path}><strong>{path}</strong> - {message}</p>)
}

storiesOf('ErrorMessages', module)
  .add('ErrorMessages', () => {
    return <FormProvider data={initialData}>
      <ErrorProvider>
        <InputField path="a" />
        <ErrorProvider>
          <InputField path="b/c" />
          <ErrorMessages render={renderErrors} />
        </ErrorProvider>
        <br />
        <ErrorMessages render={renderErrors} />
      </ErrorProvider>
    </FormProvider>
  })
