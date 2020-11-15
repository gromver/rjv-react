import React, { useCallback } from 'react'
import { storiesOf } from '@storybook/react'
import { Form, Input } from 'antd'
import { Provider } from '../components/Provider'
import { Field } from '../components/Field'
import { getValidationStatus } from '../stories/helpers'
import useRjv from './useRjv'

const initialData = {}

function HookTest () {
  const context = useRjv()

  console.log('retrieved context', context)

  return context ? <p>Context exists</p> : <p>Context doesn't exist</p>
}

function SubmitBtn (props) {
  const rjv = useRjv()

  const handleSubmit = useCallback(async () => {
    if (rjv) {
      const {submit} = rjv

      const {valid, data, firstErrorField} = await submit()

      if (valid) {
        console.log(data)
      } else {
        console.log(firstErrorField)
        if (firstErrorField) {
          firstErrorField.focus()
        }
      }
    }
  }, [rjv])

  return <button onClick={handleSubmit}>
    {props.children}
  </button>
}

storiesOf('useRjv', module)
  .add('Provider exists', () => {
    return <Provider data={initialData}>
      <p>You should open console to see result</p>

      <HookTest />
    </Provider>
  })
  .add('Provider doesn\'t exist', () => {
    return <div>
      <p>You should open console to see result</p>

      <HookTest />
    </div>
  })
  .add('Submit function', () => {
    return <Provider data={initialData}>
      <Field
        path="name"
        schema={{
          type: 'string', default: '', minLength: 5, presence: true
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

      <SubmitBtn>Submit</SubmitBtn>
    </Provider>
  })
