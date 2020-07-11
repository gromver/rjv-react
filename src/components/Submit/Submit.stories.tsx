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
    render={(ref, register) => {
      const message = getMessage(ref)

      return (
        <Form.Item
          label="Name"
          validateStatus={getValidationStatus(ref)}
          help={message}
          required={ref.isShouldNotBeBlank}
        >
          <Input
            ref={register}
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

        <p>focusFirstError = true (default)</p>

        <Submit
          onSubmit={(model) => console.log('onSubmit', model)}
          onSuccess={(data, model) => console.log('onSuccess', data, model)}
          onError={(firstError, model) => console.log('onError', firstError, model)}
          render={(handleSubmit) => <button onClick={handleSubmit}>submit</button>}
        />

        <Submit
          onSubmit={(model) => console.log('onSubmit', model)}
          onSuccess={(data, model) => console.log('onSuccess', data, model)}
          onError={(firstError, model) => console.log('onError', firstError, model)}
          render={(handleSubmit) => <Button onClick={handleSubmit}>Ant submit</Button>}
        />

        <br />
        <br />

        <p>focusFirstError = false</p>

        <Submit
          onSubmit={(model) => console.log('onSubmit', model)}
          onSuccess={(data, model) => console.log('onSuccess', data, model)}
          onError={(firstError, model) => console.log('onError', firstError, model)}
          render={(handleSubmit) => <button onClick={handleSubmit}>submit</button>}
          focusFirstError={false}
        />

        <Submit
          onSubmit={(model) => console.log('onSubmit', model)}
          onSuccess={(data, model) => console.log('onSuccess', data, model)}
          onError={(firstError, model) => console.log('onError', firstError, model)}
          render={(handleSubmit) => <Button onClick={handleSubmit}>Ant submit</Button>}
          focusFirstError={false}
        />
      </Form>
    </Provider>
  })
