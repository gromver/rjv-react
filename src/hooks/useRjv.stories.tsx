import React from 'react'
import { storiesOf } from '@storybook/react'
// import { Button, Form, Input } from 'antd'
//
// import Submit from './Submit'
import { Provider } from '../components/Provider'
import useRjv from './useRjv'
// import { Field } from '../Field'
// import { getMessage, getValidationStatus } from '../stories/utils'

const initialData = {}

function HookTest () {
  const context = useRjv()

  console.log('retrieved context', context)

  return context ? <p>Context exists</p> : <p>Context doesn't exist</p>
}

storiesOf('useRjv', module)
  .add('Model provided', () => {
    return <Provider data={initialData}>
      <p>You should open console to see result</p>

      <HookTest />
    </Provider>
  })
  .add('Model not provided', () => {
    return <div>
      <p>You should open console to see result</p>

      <HookTest />
    </div>
  })
