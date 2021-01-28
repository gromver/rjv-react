import React from 'react'
import { storiesOf } from '@storybook/react'
import { Form, Input } from 'antd'
import { FormProvider } from '../components/FormProvider'
import { Field } from '../components/Field'
import { getValidationStatus } from '../stories/helpers'
import useErrors from './useErrors'
import { CatchErrors } from '../components/CatchErrors'

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

  return errors.map(({path, message}) => <p key={path}><strong>{path}</strong> - {message}</p>) as any
}

storiesOf('useErrors', module)
  .add('useErrors', () => {
    return <FormProvider data={initialData}>
      <CatchErrors>
        <InputField path="a" />
        <CatchErrors>
          <InputField path="b/c" />
          <ShowErrors />
        </CatchErrors>
        <br />
        <ShowErrors />
      </CatchErrors>
    </FormProvider>
  })
