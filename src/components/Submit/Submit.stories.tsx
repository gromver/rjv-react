import React from 'react'
import { storiesOf } from '@storybook/react'
import { Button, Form, Input } from 'antd'

import Submit from './Submit'
import { Provider } from '../Provider'
import { Field } from '../Field'
import { getMessage, getValidationStatus } from '../stories/utils'

const initialData = {}

function RequiredField () {
  return <Field
    path="name"
    schema={{
      type: 'string', default: '', minLength: 2, presence: true
    }}
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
}

storiesOf('SubmitBtn', module)
  .add('Test buttons', () => {
    return <Provider data={initialData}>
      <p>You should open console to see events</p>

      <br />

      <Form style={{ width: 400 }}>
        <RequiredField />

        <p>Active buttons</p>

        <Submit
          onSubmit={(model) => console.log('onSubmit', model)}
          onSuccess={(model) => console.log('onSuccess', model)}
          onError={(model, firstError) => console.log('onError', model, firstError)}
        >
          <button>submit</button>
        </Submit>

        <Submit
          onSubmit={(model) => console.log('onSubmit', model)}
          onSuccess={(model) => console.log('onSuccess', model)}
          onError={(model, firstError) => console.log('onError', model, firstError)}
        >
          <Button>Ant submit</Button>
        </Submit>

        <br />
        <br />

        <p>Disabled buttons</p>

        <Submit
          onSubmit={(model) => console.log('onSubmit', model)}
          onSuccess={(model) => console.log('onSuccess', model)}
          onError={(model, firstError) => console.log('onError', model, firstError)}
        >
          <button disabled>submit</button>
        </Submit>

        <Submit
          onSubmit={(model) => console.log('onSubmit', model)}
          onSuccess={(model) => console.log('onSuccess', model)}
          onError={(model, firstError) => console.log('onError', model, firstError)}
        >
          <Button disabled>Ant submit</Button>
        </Submit>
      </Form>
    </Provider>
  })
