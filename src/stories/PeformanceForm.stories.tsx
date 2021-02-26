import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react'
import { types } from 'rjv'
import { storiesOf } from '@storybook/react'
import { FormProvider, Field, Form as RjvForm, ErrorMessages } from '../index'
import { Button, Form, Input } from 'antd'
import { getValidationStatus } from './helpers'

function createArrayWithNumbers (length) {
  return Array.from({ length }, (_, k) => k + 1)
}

function Logger () { console.log('render form'); return null }

const initialData = {}

const emailSchema: types.ISchema = {
  default: '',
  // validate: () => {
  //   return new Promise((r) => {
  //     setTimeout(r, 500, undefined)
  //   }) as any
  // },
  presence: true,
  format: 'email',
  errors: {
    presence: 'This is required',
    format: 'invalid email'
  }
}

storiesOf('Form', module)
  .add('Performance test', () => {

    return <PerformanceForm />
  })

function PerformanceForm () {
  const [upd, update] = useState({})
  const [visible, setVisible] = useState(false)

  useLayoutEffect(() => {
    console.time('initialRender')
    console.time('update')
  }, [])
  useEffect(() => console.timeEnd('initialRender'), [])

  useEffect(() => console.timeEnd('update'), [upd])

  return (
    <FormProvider data={initialData}>
      <h1>Rjv Form</h1>
      <Logger />
      {createArrayWithNumbers(1000).map((key) => {
        return <Field
          key={key}
          path={`email${key}`}
          schema={emailSchema}
          render={({ field, state, inputRef }) => {
            return (
              <input
                ref={inputRef}
                key={key}
                value={field.value || ''}
                onChange={(e) => field.value = e.target.value}
                style={state.isValidated && !state.isValid ? {borderColor: 'red'} : undefined}
              />
            )
          }}
        />
      })}

      <Field
        path="username"
        schema={{
          default: '',
          validate: (ref) => (ref.value === 'admin' ? true : 'Nice try!')
        }}
        render={({ field, state, inputRef }) => {
          console.log('render username')
          return (
            <>
              <input
                ref={inputRef}
                name="username"
                value={field.value || ''}
                onChange={(e) => field.value = e.target.value}
              />
              {state.isValidated && !state.isValid && <div>{field.messageDescription}</div>}
            </>
          )
        }}
      />

      {visible && <Field
        path="additionalField"
        schema={{
          type: 'string', default: '', minLength: 2, presence: true
        }}
        render={({ field, state }) => {
          return (
            <Form.Item
              label="additionalField"
              validateStatus={getValidationStatus(state)}
              help={field.messageDescription}
              required={state.isRequired}
            >
              <Input
                value={field.value}
                onChange={(e) => field.value = e.target.value}
              />
            </Form.Item>
          )
        }}
      />}

      <ErrorMessages render={(errors) => errors.length ? (<div>{errors[0].message}</div>) : null} />

      <RjvForm render={({ state, form }) => {
        const handleSubmit = useCallback(() => {
          console.time('submit')

          form.submit(
            (data) => {
              console.timeEnd('submit')
              console.log('SUBMIT RESULT:', data)
            },
            (firstErrorField) => {
              console.timeEnd('submit')
              firstErrorField.focus()
            }
          )

        }, [form])
        return (
          <Button onClick={handleSubmit} loading={state.isSubmitting}>Submit</Button>
        )
      }}
      />
      &nbsp;
      <Button onClick={() => {
        console.time('update')
        update({})
      }}>Update</Button>
      &nbsp;
      {!visible && <Button onClick={() => setVisible(true)}>Show additional</Button>}
      {visible && <Button onClick={() => setVisible(false)}>Hide additional</Button>}
    </FormProvider>
  )
}
