import React, { useCallback } from 'react'
import { storiesOf } from '@storybook/react'
import { Form, Input } from 'antd'
import { FormProvider } from '../components/FormProvider'
import { Field } from '../components/Field'
import { getValidationStatus } from '../stories/helpers'
import useForm from './useForm'

const initialData = {}

function HookTest () {
  const context = useForm()

  console.log('retrieved context', context)

  return context ? <p>Context exists</p> : <p>Context doesn't exist</p>
}

function SubmitBtn (props) {
  const formApi = useForm()

  const handleSubmit = useCallback(async () => {
    if (formApi) {
      const {submit} = formApi

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
  }, [formApi])

  return <button onClick={handleSubmit}>
    {props.children}
  </button>
}

storiesOf('useForm', module)
  .add('Provider exists', () => {
    return <FormProvider data={initialData}>
      <p>You should open console to see result</p>

      <HookTest />
    </FormProvider>
  })
  .add('Provider doesn\'t exist', () => {
    return <div>
      <p>You should open console to see result</p>

      <HookTest />
    </div>
  })
  .add('Submit function', () => {
    return <FormProvider data={initialData}>
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
    </FormProvider>
  })
