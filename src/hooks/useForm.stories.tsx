import React, { useCallback } from 'react'
import { storiesOf } from '@storybook/react'
import { Form, Button, Input } from 'antd'
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
  const { state, form } = useForm()

  const handleSubmit = useCallback(() => {
    const { submit } = form

    submit(
      (data) => {
        console.log('SUBMIT RESULT:', data)
      },
      (firstErrorField) => {
        firstErrorField.focus()
      }
    )
  }, [form])

  return <Button onClick={handleSubmit} loading={state.isSubmitting}>
    {props.children}
  </Button>
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
        render={({ field, state, inputRef }) => {
          return (
            <Form.Item
              label="Name"
              validateStatus={getValidationStatus(state)}
              help={field.messageDescription}
              required={state.isRequired}
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
