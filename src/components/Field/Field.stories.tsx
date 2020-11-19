import React, { createRef, useCallback } from 'react'
import { Form, Input, Button, Select } from 'antd'
import { storiesOf } from '@storybook/react'

import { FormProvider, FormProviderRef } from '../FormProvider'
import { Field } from './index'
import { getValidationStatus } from '../../stories/helpers'

storiesOf('Field', module)
  .add('Simple Field', () => {
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
    return <Form style={{ maxWidth: '400px' }}>
      <FormProvider ref={providerRef} data={undefined}>
        <Field
          path="/"
          schema={{ default: 'wrong email', format: 'email' }}
          render={(field, inputRef) => {
            return (
              <Form.Item
                label="Value"
                validateStatus={getValidationStatus(field)}
                help={field.messageDescription}
                required={field.isRequired}
                hasFeedback
              >
                <Input
                  ref={inputRef}
                  value={field.value}
                  onFocus={() => field.markAsTouched()}
                  onChange={(e) => field.value = e.target.value}
                  onBlur={() => field.validate()}
                />
              </Form.Item>
            )
          }}
        />
        <Button onClick={handleSubmit}>Submit</Button>
      </FormProvider>
    </Form>
  })
  .add('Same fields', () => {
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
    return <Form layout="horizontal" style={{ maxWidth: '400px' }}>
      <FormProvider ref={providerRef} data={''}>
        <Field
          path="/"
          schema={{ default: '', presence: true }}
          render={(field, inputRef) => {
            return (
              <Form.Item
                label="Value #1 (presence)"
                validateStatus={getValidationStatus(field)}
                help={field.messageDescription}
                required={field.isRequired}
              >
                <Input
                  ref={inputRef}
                  value={field.value}
                  onFocus={() => field.markAsTouched()}
                  onChange={(e) => field.value = e.target.value}
                  onBlur={() => field.validate()}
                />
              </Form.Item>
            )
          }}
        />
        <Field
          path="/"
          schema={{ default: '', if: { presence: true }, then: { format: 'email' } }}
          render={(field, inputRef) => {
            return (
              <Form.Item
                label="Value #2 (email)"
                validateStatus={getValidationStatus(field)}
                help={field.messageDescription}
                required={field.isRequired}
              >
                <Input
                  ref={inputRef}
                  value={field.value}
                  onFocus={() => field.markAsTouched()}
                  onChange={(e) => field.value = e.target.value}
                  onBlur={() => field.validate()}
                />
              </Form.Item>
            )
          }}
        />
        <Button onClick={handleSubmit}>Submit</Button>
      </FormProvider>
    </Form>
  })
  .add('Pending Field', () => {
    const providerRef = createRef<FormProviderRef>()
    const handleSubmit = useCallback(async () => {
      if (providerRef.current) {
        const res = await providerRef.current.submit()

        if (!res.valid) {
          res.firstErrorField && res.firstErrorField.focus()
        }
      }
    }, [providerRef.current])
    return <Form layout="horizontal" style={{ maxWidth: '400px' }}>
      <FormProvider ref={providerRef} data={''}>
        <Field
          path="/"
          schema={{
            default: '',
            presence: true,
            validate: (ref) => {
              const value = ref.value

              return new Promise((res) => setTimeout(res, 1000, value !== 'admin'))
            }
          }}
          render={(field, inputRef) => {
            return (
              <Form.Item
                label="User name"
                validateStatus={getValidationStatus(field)}
                help={field.messageDescription || 'Should not be "admin"'}
                required={field.isRequired}
                hasFeedback
              >
                <Input
                  ref={inputRef}
                  value={field.value}
                  onFocus={() => field.markAsTouched()}
                  onChange={(e) => field.value = e.target.value}
                  onBlur={() => field.validate()}
                />
              </Form.Item>
            )
          }}
        />
        <Button onClick={handleSubmit}>Submit</Button>
      </FormProvider>
    </Form>
  })
  .add('ResolveSchema', () => {
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
    return <Form layout="horizontal" style={{ maxWidth: '400px' }}>
      <FormProvider ref={providerRef} data={{}}>
        <Field
          path="required"
          schema={{ default: 'no', type: 'string' }}
          render={(field, inputRef) => {
            return (
              <Form.Item
                label="Email required?"
                validateStatus={getValidationStatus(field)}
                help={field.messageDescription}
                required={field.isRequired}
              >
                <Select
                  ref={inputRef}
                  value={field.value}
                  onFocus={() => field.markAsTouched()}
                  onChange={(value) => field.value = value}
                  onBlur={() => field.validate()}
                >
                  <Select.Option value="noo">Noo</Select.Option>
                  <Select.Option value="no">No</Select.Option>
                  <Select.Option value="yes">Yes</Select.Option>
                </Select>
              </Form.Item>
            )
          }}
        />
        <Field
          path="email"
          schema={{
            default: '',
            type: 'string',
            resolveSchema: (ref) => {
              if (ref.ref('../required').value === 'yes') {
                return { presence: true }
              }

              return {}
            },
            if: { presence: true },
            then: { format: 'email' }
          }}
          render={(field, inputRef) => {
            return (
              <Form.Item
                label="Email"
                validateStatus={getValidationStatus(field)}
                help={field.messageDescription}
                required={field.isRequired}
              >
                <Input
                  ref={inputRef}
                  value={field.value}
                  onFocus={() => field.markAsTouched()}
                  onChange={(e) => field.value = e.target.value}
                  onBlur={() => field.validate()}
                />
              </Form.Item>
            )
          }}
        />
        <Button onClick={handleSubmit}>Submit</Button>
      </FormProvider>
    </Form>
  })
