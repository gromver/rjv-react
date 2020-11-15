import React from 'react'
import { storiesOf } from '@storybook/react'
import { Button, Form, Input } from 'antd'

import Submit from './Submit'
import { Provider } from '../Provider'
import { Field } from '../Field'
import { getValidationStatus } from '../../stories/helpers'

const initialData = {}

function RequiredField () {
  return <Field
    path="name"
    schema={{
      type: 'string', default: '', minLength: 2, presence: true
    }}
    render={(field, inputRef) => {
      return (
        <Form.Item
          label="Name"
          validateStatus={getValidationStatus(field)}
          help={field.messageDescription}
          required={field.isRequired}
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
}

storiesOf('SubmitBtn', module)
  .add('Test buttons', () => {
    return <Provider data={initialData}>
      <p>You should open console to see events</p>

      <br />

      <Form style={{ width: 400 }}>
        <RequiredField />

        <p>focusFirstError = true (default)</p>

        <Submit
          onSubmit={(data) => console.log('onSubmit', data)}
          onSuccess={(data) => console.log('onSuccess', data)}
          onError={(firstError) => console.log('onError', firstError)}
          render={(handleSubmit) => <button onClick={handleSubmit}>submit</button>}
        />

        <Submit
          onSubmit={(data) => console.log('onSubmit', data)}
          onSuccess={(data) => console.log('onSuccess', data)}
          onError={(firstError) => console.log('onError', firstError)}
          render={(handleSubmit) => <Button onClick={handleSubmit}>Ant submit</Button>}
        />

        <br />
        <br />

        <p>focusFirstError = false</p>

        <Submit
          onSubmit={(data) => console.log('onSubmit', data)}
          onSuccess={(data) => console.log('onSuccess', data)}
          onError={(firstError) => console.log('onError', firstError)}
          render={(handleSubmit) => <button onClick={handleSubmit}>submit</button>}
          focusFirstError={false}
        />

        <Submit
          onSubmit={(data) => console.log('onSubmit', data)}
          onSuccess={(data) => console.log('onSuccess', data)}
          onError={(firstError) => console.log('onError', firstError)}
          render={(handleSubmit) => <Button onClick={handleSubmit}>Ant submit</Button>}
          focusFirstError={false}
        />
      </Form>
    </Provider>
  })
