import React from 'react'
import { Button, Space, Form, Input, Select } from 'antd'
import { storiesOf } from '@storybook/react'

import { FormProvider } from '../FormProvider'
import { Field } from './index'
import { getValidationStatus, SubmitBtn } from '../../stories/helpers'
import { Scope } from '../Scope'
import { Watch } from '../Watch'

let _id = 1

storiesOf('Field', module)
  .add('Simple Field', () => {
    return <Form style={{ maxWidth: '400px' }}>
      <FormProvider data={undefined}>
        <Field
          path="/"
          schema={{ default: 'wrong email', format: 'email' }}
          render={(field, inputRef) => {
            return (
              <Form.Item
                label="Value"
                validateStatus={getValidationStatus(field)}
                help={field.messageDescription}
                required={field.state.isRequired}
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
        <SubmitBtn />
      </FormProvider>
    </Form>
  })
  .add('Field with different rules', () => {
    return <Form layout="horizontal" style={{ maxWidth: '400px' }}>
      <FormProvider data={''}>
        <Field
          path="/"
          schema={{ default: '', presence: true }}
          render={(field, inputRef) => {
            return (
              <Form.Item
                label="Value #1 (presence)"
                validateStatus={getValidationStatus(field)}
                help={field.messageDescription}
                required={field.state.isRequired}
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
                required={field.state.isRequired}
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
        <SubmitBtn />
      </FormProvider>
    </Form>
  })
  .add('Pending Field', () => {
    return <Form layout="horizontal" style={{ maxWidth: '400px' }}>
      <FormProvider data={''}>
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
                required={field.state.isRequired}
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
        <SubmitBtn />
      </FormProvider>
    </Form>
  })
  .add('ChangeSchema - isRequired', () => {
    return <Form layout="horizontal" style={{ maxWidth: '400px' }}>
      <FormProvider data={{}}>
        <Field
          path="required"
          schema={{ default: 'no', type: 'string' }}
          render={(field, inputRef) => {
            return (
              <Form.Item
                label="Email required?"
                validateStatus={getValidationStatus(field)}
                help={field.messageDescription}
                required={field.state.isRequired}
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
        <Watch props={['required']} render={(_, required) => (
          <Field
            path="email"
            schema={required === 'yes'
              ? {
                default: '',
                type: 'string',
                format: 'email',
                presence: true
              }
              : { default: '', format: 'email', type: 'string' }
            }
            render={(field, inputRef) => {
              return (
                <Form.Item
                  label="Email"
                  validateStatus={getValidationStatus(field)}
                  help={field.messageDescription}
                  required={field.state.isRequired}
                >
                  <Input
                    ref={inputRef}
                    value={field.value}
                    onFocus={() => field.markAsTouched()}
                    onChange={(e) => field.value = e.target.value}
                    onBlur={() => field.validate()}
                    readOnly={field.state.isReadonly}
                  />
                </Form.Item>
              )
            }}
          />
        )} />
        <SubmitBtn />
      </FormProvider>
    </Form>
  })
  .add('ChangeSchema - isReadonly', () => {
    return <Form layout="horizontal" style={{ maxWidth: '400px' }}>
      <FormProvider data={{}}>
        <Field
          path="readonly"
          schema={{ default: 'no', type: 'string' }}
          render={(field, inputRef) => {
            return (
              <Form.Item
                label="Field readonly?"
                validateStatus={getValidationStatus(field)}
                help={field.messageDescription}
                required={field.state.isRequired}
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
        <Watch props={['readonly']} render={(_, readonly) => (
          <Field
            path="field"
            schema={readonly === 'yes' ? {
              default: 'abc',
              type: 'string',
              readonly: true
            } : { default: '', type: 'string' }}
            render={(field, inputRef) => {
              return (
                <Form.Item
                  label="Field"
                  validateStatus={getValidationStatus(field)}
                  help={field.messageDescription}
                  required={field.state.isRequired}
                >
                  <Input
                    ref={inputRef}
                    value={field.value}
                    onFocus={() => field.markAsTouched()}
                    onChange={(e) => field.value = e.target.value}
                    onBlur={() => !field.state.isReadonly && field.validate()}
                    readOnly={field.state.isReadonly}
                    placeholder="Type here"
                  />
                </Form.Item>
              )
            }}
          />
        )} />
        <SubmitBtn />
      </FormProvider>
    </Form>
  })
  .add('Simple Form', () => {
    return (
      <div className="App">
      <FormProvider data={{}}>
        <Field
          schema={{
            default: '',
            presence: true
          }}
          path="name"
          render={(field) => (
            <div>
              <input
                value={field.value}
                onChange={(e) => (field.markAsDirty().value = e.target.value)}
                onBlur={() => field.validate()}
                placeholder="Email"
              />
              {field.state.isValidated && !field.state.isValid && field.messageDescription}
            </div>
          )}
        />
        <Field
          schema={{
            default: '',
            presence: true
          }}
          path="username"
          render={(field) => (
            <div>
              <input
                value={field.value}
                onChange={(e) => (field.markAsDirty().value = e.target.value)}
                onBlur={() => field.validate()}
                placeholder="Username"
              />
              {field.state.isValidated && !field.state.isValid && field.messageDescription}
            </div>
          )}
        />
        <SubmitBtn />
      </FormProvider>
    </div>
    )
  })
  .add('Dynamic Fields', () => {
    return (
      <FormProvider data={[]}>
        <Form>
          <Field path={'/'} schema={{ type: 'array' }} render={(field) => (
            <>
              {field.value.map((item, index) => (
                <Scope key={`k${item._id}`} path={`${index}`}>
                  <Space style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Field
                      path="name"
                      schema={{ default: '', presence: true }}
                      render={(field, inputRef) => (
                        <Form.Item
                          validateStatus={getValidationStatus(field)}
                          help={field.messageDescription}
                          required={field.state.isRequired}
                        >
                          <Input
                            ref={inputRef}
                            value={field.value}
                            onFocus={() => field.markAsTouched()}
                            onChange={(e) => field.value = e.target.value}
                            onBlur={() => field.validate()}
                            placeholder="Name"
                          />
                        </Form.Item>
                      )}
                    />
                    <Button
                      onClick={() => {
                        const newValue = [...field.value]
                        newValue.splice(index, 1)

                        field.value = newValue
                      }}
                    >Remove</Button>
                  </Space>
                </Scope>
              ))}

              <Form.Item>
                <Button type="dashed" onClick={() => field.value = [...field.value, { _id: _id++ }]}>
                  Add field
                </Button>
              </Form.Item>
            </>
          )} />
        </Form>
        <SubmitBtn />
      </FormProvider>
    )
  })
