import React, { useCallback } from 'react'
import { storiesOf } from '@storybook/react'
import { Form, Input } from 'antd'
import { ModelProvider } from '../components/ModelProvider'
import { Field } from '../components/Field'
import { getMessage, getValidationStatus } from '../stories/utils'
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

      const {isValid, firstErrorComponent, model} = await submit()

      if (isValid) {
        console.log(model.data)
      } else {
        console.log(firstErrorComponent)
        if (firstErrorComponent && firstErrorComponent.focus) {
          // focus first error control
          firstErrorComponent.focus()
        }
      }
    }
  }, [rjv])

  return <button onClick={handleSubmit}>
    {props.children}
  </button>
}

storiesOf('useRjv', module)
  .add('Model provided', () => {
    return <ModelProvider data={initialData}>
      <p>You should open console to see result</p>

      <HookTest />
    </ModelProvider>
  })
  .add('Model not provided', () => {
    return <div>
      <p>You should open console to see result</p>

      <HookTest />
    </div>
  })
  .add('Submit function', () => {
    return <ModelProvider data={initialData}>
      <Field
        path="name"
        schema={{
          type: 'string', default: '', minLength: 5, presence: true
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

      <SubmitBtn>Submit</SubmitBtn>
    </ModelProvider>
  })
