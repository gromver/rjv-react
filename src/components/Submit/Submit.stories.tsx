import React, { useCallback, useState } from 'react'
import { storiesOf } from '@storybook/react'
import { Button, Form, Input } from 'antd'

import Submit from './Submit'
import { FormProvider } from '../FormProvider'
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
          required={field.state.isRequired}
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

storiesOf('Submit', module)
  .add('Test buttons', () => {
    return <FormProvider data={initialData}>
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
    </FormProvider>
  })
  .add('Test callbacks', () => {
    const [counter, setCounter] = useState(0)
    const handleCounter = useCallback(() => setCounter(counter + 1),[counter])

    return <FormProvider data={initialData}>
      <p>You should open console to see events</p>

      <br />

      <Form style={{ width: 400 }}>
        <RequiredField />

        <div>
          Count: {counter} <button onClick={handleCounter}>+ 1</button>
        </div>

        <br />

        <Submit
          onSubmit={(data) => console.log('onSubmit', data, counter)}
          onSuccess={(data) => console.log('onSuccess', data, counter)}
          onError={(firstError) => console.log('onError', firstError, counter)}
          render={(handleSubmit) => <button onClick={handleSubmit}>submit</button>}
        />
      </Form>
    </FormProvider>
  })
