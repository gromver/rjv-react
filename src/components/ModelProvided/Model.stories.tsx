import React from 'react'
import { storiesOf } from '@storybook/react'

import { Provider } from '../Provider'
import ModelProvided from './ModelProvided'

const MESSAGE = 'Hello World!'
const initialData = { message: MESSAGE }

storiesOf('ModelProvided', module)
  .add('Model exists', () => {
    return <Provider data={initialData}>
      <p>Should render - {MESSAGE}</p>

      <ModelProvided render={(model) => <strong>{model.ref('message').value}</strong>} />
    </Provider>
  })
  .add('Model doesn\'t exist', () => {
    return <>
      <p>Should render nothing</p>

      <ModelProvided render={(model) => <strong>{model.ref('message').value}</strong>} />
    </>
  })
