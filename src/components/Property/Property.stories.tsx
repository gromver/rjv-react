import React from 'react'
import { Form, Input } from 'antd'
import { storiesOf } from '@storybook/react'

import { FormProvider } from '../FormProvider'
import Property from './Property'
import { Watch } from '../Watch'
import { useDataRef } from '../../hooks'

type Props = { path: string }

function InputField ({ path }: Props) {
  return <Property
    path={path}
    render={(value, setValue) => {
      return (
        <Form.Item label={path}>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </Form.Item>
      )
    }}
  />
}

storiesOf('Property', module)
  .add('Example', () => {
    return <Form style={{ maxWidth: '800px' }}>
      <FormProvider data={{}}>
        <InputField path="foo" />
        <InputField path="bar" />

        <h4>Values</h4>

        <Watch
          props={['**']}
          render={() => {
            const dataRef = useDataRef('/')

            return <pre>{JSON.stringify(dataRef.value, null, '\t')}</pre>
          }}
        />
      </FormProvider>
    </Form>
  })
