import React from 'react'
import { storiesOf } from '@storybook/react'

import { ModelProvider } from '../ModelProvider'
import IfModelProvided from './IfModelProvided'

const MESSAGE = 'Hello World!'
const initialData = { message: MESSAGE }

storiesOf('ModelProvided', module)
  .add('Model exists', () => {
    return <ModelProvider data={initialData}>
      <p>Should render - {MESSAGE}</p>

      <IfModelProvided render={(model) => <strong>{model.ref('message').value}</strong>} />
    </ModelProvider>
  })
  .add('Model doesn\'t exist', () => {
    return <>
      <p>Should render nothing</p>

      <IfModelProvided render={(model) => <strong>{model.ref('message').value}</strong>} />
    </>
  })
