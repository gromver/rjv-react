import React, { createRef, useCallback, useContext, useEffect, useState } from 'react'
import { Form, Input, Card, Button, Alert } from 'antd'
import { storiesOf } from '@storybook/react'

import { FormProvider, FormProviderRef, ValidationErrors } from '../FormProvider'
import { ErrorProvider } from './index'
import { Field } from '../Field'
import { getValidationStatus } from '../../stories/helpers'
import ErrorProviderContext from './ErrorProviderContext'

type Props = { path: string }

function InputField ({ path }: Props) {
  return <Field
    path={path}
    schema={{ default: '', presence: true }}
    render={(field, inputRef) => {
      return (
        <Form.Item
          label={path}
          validateStatus={getValidationStatus(field)}
          help={field.messageDescription}
          required={field.isRequired}
          hasFeedback
        >
          <Input
            ref={inputRef}
            value={field.value}
            onFocus={() => field.markAsTouched()}
            onChange={(e) => field.markAsInvalidated().value = e.target.value}
            onBlur={() => field.validate()}
          />
        </Form.Item>
      )
    }}
  />
}

function ShowErrors () {
  const [errors, setErrors] = useState<ValidationErrors>([])
  const errorProviderContext = useContext(ErrorProviderContext)

  useEffect(() => {
    if (errorProviderContext) {
      return errorProviderContext
        .subscribe((errors) => setErrors(errors))
    }
  }, [errorProviderContext])

  if (errors.length) {
    return <Alert
      type="error"
      message={errors.map(([path, message]) => (
        <p key={`err-${path}`}>
          {path}: {message}
        </p>
      ))}
    />
  }

  return null
}

storiesOf('ErrorProvider', module)
  .add('Example', () => {
    const providerRef = createRef<FormProviderRef>()
    const handleSubmit = useCallback(async () => {
      if (providerRef.current) {
        const res = await providerRef.current.submit()
        console.log('RESULT', res)
        if (!res.valid) {
          res.firstErrorField && res.firstErrorField.focus()
        }
      }
    }, [providerRef.current])

    return <Form style={{ maxWidth: '800px' }}>
      <FormProvider ref={providerRef} data={{}}>
        <ErrorProvider>
          <p>Global error provider:</p>
          <ShowErrors />
          <br />
          <InputField path="name" />

          <Card>
            <ErrorProvider>
              <p>Local error provider:</p>
              <ShowErrors />
              <br />
              <InputField path="foo" />
              <InputField path="a/b/c" />
            </ErrorProvider>
          </Card>
        </ErrorProvider>

        <br />
        <Button onClick={handleSubmit}>Submit</Button>
      </FormProvider>
    </Form>
  })
