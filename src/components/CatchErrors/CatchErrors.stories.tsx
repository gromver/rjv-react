import React from 'react'
import { Form, Input, Card } from 'antd'
import { storiesOf } from '@storybook/react'

import { FormProvider } from '../FormProvider'
import CatchErrors from './CatchErrors'
import { Field } from '../Field'
import { getValidationStatus, ShowErrors, SubmitBtn } from '../../stories/helpers'

type Props = { path: string }

function InputField ({ path }: Props) {
  return <Field
    path={path}
    schema={{ default: '', presence: true }}
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
            onChange={(e) => field.invalidated().value = e.target.value}
            onBlur={() => field.validate()}
          />
        </Form.Item>
      )
    }}
  />
}

storiesOf('CatchErrors', module)
  .add('Example', () => {
    return <Form style={{ maxWidth: '800px' }}>
      <FormProvider data={{}}>
        <p>Global error provider:</p>
        <ShowErrors />
        <br />
        <InputField path="name" />

        <Card>
          <CatchErrors>
            <p>Local error provider:</p>
            <ShowErrors />
            <br />
            <InputField path="foo" />
            <InputField path="a/b/c" />
          </CatchErrors>
        </Card>

        <br />
        <SubmitBtn />
      </FormProvider>
    </Form>
  })
