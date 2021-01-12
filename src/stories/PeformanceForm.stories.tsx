import React, { useState, useEffect, useLayoutEffect } from 'react'
import { storiesOf } from '@storybook/react'
import { FormProvider, Field, Submit, ErrorMessages } from '../index'
import { Form, Input } from 'antd'
import { getValidationStatus } from './helpers'

function createArrayWithNumbers (length) {
  return Array.from({ length }, (_, k) => k + 1)
}

function Logger () { console.log('render form'); return null }

const initialData = {}

const emailSchema = {
  default: '',
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

  const onSubmit = (values) => {
    console.log('submit', values)
  }

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
          render={(field, inputRef) => {
            return (
              <input
                ref={inputRef}
                key={key}
                value={field.value || ''}
                onChange={(e) => field.value = e.target.value}
                style={field.state.isValidated && !field.state.isValid ? {borderColor: 'red'} : undefined}
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
        render={(field, inputRef) => {
          console.log('render username')
          return (
            <>
              <input
                ref={inputRef}
                name="username"
                value={field.value || ''}
                onChange={(e) => field.value = e.target.value}
              />
              {field.state.isValidated && !field.state.isValid && <div>{field.messageDescription}</div>}
            </>
          )
        }}
      />

      {visible && <Field
        path="additionalField"
        schema={{
          type: 'string', default: '', minLength: 2, presence: true
        }}
        render={(field) => {
          return (
            <Form.Item
              label="additionalField"
              validateStatus={getValidationStatus(field)}
              help={field.messageDescription}
              required={field.state.isRequired}
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

      <Submit
        onSubmit={(d) => {
          console.time('submit')
          onSubmit(d)
        }}
        onError={(firstErrorField) => { console.timeEnd('submit'); firstErrorField.focus() }}
        render={(handleSubmit) => <button type="submit" onClick={handleSubmit}>Submit</button>}
      />

      <button onClick={() => {
        console.time('update')
        update({})
      }}>Update</button>
      &nbsp;
      {!visible && <button onClick={() => setVisible(true)}>Show additional</button>}
      {visible && <button onClick={() => setVisible(false)}>Hide additional</button>}
    </FormProvider>
  )
}
