import React from 'react'
import { storiesOf } from '@storybook/react'
import { Form, Input } from 'antd'
import ErrorMessages from './ErrorMessages'
import { FormProvider } from '../FormProvider'
import { Field } from '../Field'
import { CatchErrors } from '../CatchErrors'
import { ValidationErrors } from '../../types'
import { getValidationStatus } from '../../stories/helpers'

const initialData = {}

type Props = { path: string }

function InputField ({ path }: Props) {
  return <Field
    path={path}
    schema={{ default: '', presence: true, format: 'email' }}
    render={({ field, state, inputRef }) => {
      return (
        <Form.Item
          label={path}
          validateStatus={getValidationStatus(state)}
          help={field.messageDescription}
          required={state.isRequired}
          hasFeedback
        >
          <Input
            ref={inputRef}
            value={field.value}
            onFocus={() => field.touched()}
            onChange={(e) => field.pristine().value = e.target.value}
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
      <CatchErrors>
        <InputField path="a" />
        <CatchErrors>
          <InputField path="b/c" />
          <ErrorMessages render={renderErrors} />
        </CatchErrors>
        <br />
        <ErrorMessages render={renderErrors} />
      </CatchErrors>
    </FormProvider>
  })
