import React, { useState } from 'react'
import { Form as AntdForm, Input, Select } from 'antd'
import { storiesOf } from '@storybook/react'

import FormStateUpdater from './FormStateUpdater'
import { FormProvider } from '../FormProvider'
import { Form } from '../Form'
import { Field } from '../Field'
import { getValidationStatus, SubmitBtn } from '../../stories/helpers'

storiesOf('FormStateUpdater', module)
  .add('Example', () => {
    return <AntdForm style={{ maxWidth: '400px' }}>
      <FormProvider data={''}>
        <Field
          path="/"
          schema={{ default: '', presence: true, format: 'email' }}
          render={({ field, state, inputRef }) => {
            return (
              <AntdForm.Item
                label="Email"
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
              </AntdForm.Item>
            )
          }}
        />

        <FormStateUpdater debounce={0} />

        <Form render={({ state }) => (
          <SubmitBtn disabled={!state.isValid} />
        )} />
      </FormProvider>
    </AntdForm>
  })
  .add('Test dependencies', () => {
    const [format, setFormat] = useState<any>('email')

    return <AntdForm style={{ maxWidth: '400px' }}>
      <AntdForm.Item label="Select format">
        <Select value={format} onChange={setFormat}>
          <Select.Option value="email">email</Select.Option>
          <Select.Option value="url">url</Select.Option>
          <Select.Option value="ipv4">ipv4</Select.Option>
        </Select>
      </AntdForm.Item>

      <FormProvider data={''}>
        <Field
          path="/"
          schema={{ default: '', presence: true, format }}
          dependencies={[format]}
          render={({ field, state, inputRef }) => {
            return (
              <AntdForm.Item
                label={`Enter valid "${format}"`}
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
              </AntdForm.Item>
            )
          }}
        />

        <FormStateUpdater debounce={0} dependencies={[format]} />

        <Form render={({ state }) => (
          <SubmitBtn disabled={!state.isValid} />
        )} />
      </FormProvider>
    </AntdForm>
  })
