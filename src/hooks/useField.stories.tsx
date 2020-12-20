import React, { useCallback } from 'react'
import { storiesOf } from '@storybook/react'
import { Form, Input } from 'antd'
import { FormProvider } from '../components/FormProvider'
import { Scope } from '../components/Scope'
import { Field } from '../components/Field'
import { Watch } from '../components/Watch'
import { getValidationStatus } from '../stories/helpers'
import useField from './useField'

const initialData = {}

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
            onChange={(e) => field.value = e.target.value}
            onBlur={() => field.validate()}
          />
        </Form.Item>
      )
    }}
  />
}

storiesOf('useField', module)
  .add('Get field value', () => {
    return <FormProvider data={initialData}>
      <InputField path="foo/bar" />

      <Watch
        props={['**']}
        render={() => {
          const field = useField('foo/bar')

          return <div>Value: {field!.value}</div>
        }}
      />
    </FormProvider>
  })
  .add('Get field value with scope', () => {
    return <FormProvider data={initialData}>
      <InputField path="foo/bar" />

      <Scope path="foo">
        <Watch
          props={['bar']}
          render={() => {
            const field = useField('bar')

            return <div>Value: {field!.value}</div>
          }}
        />
      </Scope>
    </FormProvider>
  })
