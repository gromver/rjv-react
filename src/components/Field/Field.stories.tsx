import React, { useRef } from 'react'
import { Button, Space, Form, Input, Select } from 'antd'
import { storiesOf } from '@storybook/react'

import { FormProvider } from '../FormProvider'
import Field from './Field'
import { Scope } from '../Scope'
import { Watch } from '../Watch'
import { getValidationStatus, SubmitBtn } from '../../stories/helpers'
import { FieldApi } from '../../types'

let _id = 1

storiesOf('Field', module)
  .add('Simple Field', () => {
    return <Form style={{ maxWidth: '400px' }}>
      <FormProvider data={undefined}>
        <Field
          path="/"
          schema={{ default: 'wrong email', format: 'email' }}
          render={({ field, state, inputRef }) => {
            return (
              <Form.Item
                label="Value"
                validateStatus={getValidationStatus(state)}
                help={field.messageDescription}
                required={state.isRequired}
                hasFeedback
              >
                <Input
                  ref={inputRef}
                  value={field.value}
                  onFocus={() => field.touched()}
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
  .add('Test ref', () => {
    const fieldRef = useRef<FieldApi>(null)

    return <Form style={{ maxWidth: '400px' }}>
      <FormProvider data={undefined}>
        <Field
          ref={fieldRef}
          path="/"
          schema={{ default: 'wrong email', format: 'email' }}
          render={({ field, state, inputRef }) => {
            return (
              <Form.Item
                label="Value"
                validateStatus={getValidationStatus(state)}
                help={field.messageDescription}
                required={state.isRequired}
                hasFeedback
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
        <Button
          onClick={() => {
            if (fieldRef.current) {
              fieldRef.current.focus()
              return fieldRef.current.validate()
            }
          }}
        >
          Validate field
        </Button>
      </FormProvider>
    </Form>
  })
  .add('Field with different rules', () => {
    return <Form layout="horizontal" style={{ maxWidth: '400px' }}>
      <FormProvider data={''}>
        <Field
          path="/"
          schema={{ default: '', presence: true }}
          render={({ field, state, inputRef }) => {
            return (
              <Form.Item
                label="Value #1 (presence)"
                validateStatus={getValidationStatus(state)}
                help={field.messageDescription}
                required={state.isRequired}
              >
                <Input
                  ref={inputRef}
                  value={field.value}
                  onFocus={() => field.touched()}
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
          render={({ field, state, inputRef }) => {
            return (
              <Form.Item
                label="Value #2 (email)"
                validateStatus={getValidationStatus(state)}
                help={field.messageDescription}
                required={state.isRequired}
              >
                <Input
                  ref={inputRef}
                  value={field.value}
                  onFocus={() => field.touched()}
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
          render={({ field, state, inputRef }) => {
            return (
              <Form.Item
                label="User name"
                validateStatus={getValidationStatus(state)}
                help={field.messageDescription || 'Must not be "admin"'}
                required={state.isRequired}
                hasFeedback
              >
                <Input
                  ref={inputRef}
                  value={field.value}
                  onFocus={() => field.touched()}
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
          render={({ field, state, inputRef }) => {
            return (
              <Form.Item
                label="Email required?"
                validateStatus={getValidationStatus(state)}
                help={field.messageDescription}
                required={state.isRequired}
              >
                <Select
                  ref={inputRef}
                  value={field.value}
                  onFocus={() => field.touched()}
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
        <Watch props={['required']} render={(required) => (
          <Field
            path="email"
            schema={{
              default: '',
              format: 'email',
              presence: required === 'yes'
            }}
            dependencies={[required]}
            render={({ field, state, inputRef }) => {
              return (
                <Form.Item
                  label="Email"
                  validateStatus={getValidationStatus(state)}
                  help={field.messageDescription}
                  required={state.isRequired}
                >
                  <Input
                    ref={inputRef}
                    value={field.value}
                    onFocus={() => field.touched()}
                    onChange={(e) => field.value = e.target.value}
                    onBlur={() => field.validate()}
                    readOnly={state.isReadonly}
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
          render={({ field, state, inputRef }) => {
            return (
              <Form.Item
                label="Field readonly?"
                validateStatus={getValidationStatus(state)}
                help={field.messageDescription}
                required={state.isRequired}
              >
                <Select
                  ref={inputRef}
                  value={field.value}
                  onFocus={() => field.touched()}
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
        <Watch props={['readonly']} render={(readonly) => (
          <Field
            path="field"
            schema={{
              default: 'abc',
              type: 'string',
              readonly: readonly === 'yes'
            }}
            dependencies={[readonly]}
            render={({ field, state, inputRef }) => {
              return (
                <Form.Item
                  label="Field"
                  validateStatus={getValidationStatus(state)}
                  help={field.messageDescription}
                  required={state.isRequired}
                >
                  <Input
                    ref={inputRef}
                    value={field.value}
                    onFocus={() => field.touched()}
                    onChange={(e) => field.value = e.target.value}
                    onBlur={() => !state.isReadonly && field.validate()}
                    readOnly={state.isReadonly}
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
          render={({ field, state }) => (
            <div>
              <input
                value={field.value}
                onChange={(e) => (field.dirty().value = e.target.value)}
                onBlur={() => field.validate()}
                placeholder="Email"
              />
              {state.isValidated && !state.isValid && field.messageDescription}
            </div>
          )}
        />
        <Field
          schema={{
            default: '',
            presence: true
          }}
          path="username"
          render={({ field, state }) => (
            <div>
              <input
                value={field.value}
                onChange={(e) => (field.dirty().value = e.target.value)}
                onBlur={() => field.validate()}
                placeholder="Username"
              />
              {state.isValidated && !state.isValid && field.messageDescription}
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
          <Field path={'/'} schema={{ type: 'array' }} render={({ field }) => (
            <>
              {field.value.map((item, index) => (
                <Scope key={`k${item._id}`} path={`${index}`}>
                  <Space style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Field
                      path="name"
                      schema={{ default: '', presence: true }}
                      render={({ field, state, inputRef }) => (
                        <Form.Item
                          validateStatus={getValidationStatus(state)}
                          help={field.messageDescription}
                          required={state.isRequired}
                        >
                          <Input
                            ref={inputRef}
                            value={field.value}
                            onFocus={() => field.touched()}
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
