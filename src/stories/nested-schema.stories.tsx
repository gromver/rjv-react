import React, { useMemo, useRef, createRef, useState } from 'react'
import { Model, Ref, types } from 'rjv'
import { Form, Input, Alert, Button, Card } from 'antd'
import { storiesOf } from '@storybook/react'

import { ModelProvider, ModelProviderRef } from '../components/ModelProvider'
import { Subscribe } from '../components/Subscribe'
import { Field } from '../components/Field'
import { Scope } from '../components/Scope'
import { getMessage, getValidationStatus } from './utils'

const schema: types.ISchema = {
  properties: {
    name: { type: 'string', default: '', presence: true },
    nodes: {
      items: {
        resolveSchema: () => Promise.resolve(schema)
      }
    }
  }
}

let nodeId = 1
const initialData = { __id: nodeId }

storiesOf('Nested Form', module)
  .add('Using schema', () => {

    return <NestedSchemaForm />
  })

function NodeWrapper ({ children }) {
  return <Card style={{ paddingLeft: 40, marginBottom: 15, width: 500 }}>{children}</Card>
}

function renderNode (nodeRef: Ref) {
  return <Scope
    key={`key_${nodeRef.value.__id}`}
    path={nodeRef.path}
  >
    <NodeWrapper>
      <Field
        path="name"
        render={(ref) => {
          const message = getMessage(ref)

          return (
            <Form.Item
              label="Name"
              validateStatus={getValidationStatus(ref)}
              help={message}
              required={ref.isShouldNotBeBlank}
            >
              <Input
                value={ref.getValue()}
                onChange={(e) => ref.setValue(e.target.value)}
              />
            </Form.Item>
          )
        }}
      />

      <h4>Nodes:</h4>

      <br />

      <Field
        path="nodes"
        render={(ref) => {
          const nodesValues = ref.value

          return nodesValues
            ? nodesValues.map((item, index) => renderNode(ref.ref(`${index}`)))
            : null
        }}
      />

      <CreateNodeForm nodeRef={nodeRef} />
    </NodeWrapper>
  </Scope>
}

function CreateNodeForm ({ nodeRef }: { nodeRef: Ref }) {
  const createNodeFormRef = createRef<ModelProviderRef>()
  const [createNodeFormKey, setCreateNodeFormKey] = useState(1)

  return <ModelProvider key={`formKey-${createNodeFormKey}`} ref={createNodeFormRef} data={{}}>
    <Form layout="inline">
      <Field
        path="name"
        schema={{
          type: 'string', default: '', minLength: 2, presence: true
        }}
        render={(ref) => {
          const message = getMessage(ref)

          return (
            <Form.Item
              label="New node name"
              validateStatus={getValidationStatus(ref)}
              help={message}
              required={ref.isShouldNotBeBlank}
            >
              <Input
                value={ref.getValue()}
                onChange={(e) => ref.setValue(e.target.value)}
              />
            </Form.Item>
          )
        }}
      />

      <Button
        icon="plus"
        type="primary"
        onClick={() => {
          createNodeFormRef.current && createNodeFormRef.current.submit()
            .then(({ isValid, model }) => {
              if (isValid) {
                const nodes = nodeRef.ref('nodes').value || []

                nodeRef.ref('nodes').value = [
                  ...nodes,
                  { __id: ++nodeId, name: model.ref('name').value }
                ]

                setCreateNodeFormKey(createNodeFormKey + 1)
              }
            })
        }}
      >
        Add
      </Button>
    </Form>
  </ModelProvider>
}

function NestedSchemaForm () {
  const formRef = useRef<ModelProviderRef>()
  const model = useMemo(() => new Model(schema, initialData), [])

  return (
    <ModelProvider ref={formRef} model={model}>
      <Subscribe
        render={(model: Model) => {
          const ref = model.ref()
          const errors = ref.errors.map((err, index) => (
            <p key={`err-${index}`}>
              {err.path || '..'}: {err.message && err.message.description}
            </p>
          ))

          return errors.length && ref.isValidated
            ? <Alert type="error" message={errors} />
            : (ref.isValidated ? <Alert type="success" message="Success" /> : null)
        }}
      />

      {renderNode(model.ref())}

      <button
        onClick={() => {
          formRef.current && formRef.current.submit()
        }}
      >
        Submit
      </button>
    </ModelProvider>
  )
}
