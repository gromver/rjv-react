import React from 'react'
import { types } from 'rjv'
import { Form, Input, Alert, Button, Card } from 'antd'
import { storiesOf } from '@storybook/react'
import { getValidationStatus, SubmitBtn, ShowErrors } from './helpers'
import {
  FormProvider,
  Watch,
  Field,
  Scope,
  Submit
} from '../index'
import { FieldApi } from '../components/Field'
import { ErrorProvider } from '../components/ErrorProvider'

let nodeId = 1
const initialData = { __id: nodeId }

storiesOf('Nested Form', module)
  .add('Example', () => {

    return <NestedSchemaForm />
  })

function NodeWrapper ({ children }) {
  return <Card style={{ paddingLeft: 40, marginBottom: 15, width: 500 }}>{children}</Card>
}

function renderNode (nodeRef: types.IRef, getField: (path?: string) => FieldApi | undefined) {
  return <Scope
    key={`key_${nodeRef.value.__id}`}
    path={nodeRef.path}
  >
    <NodeWrapper>
      <Field
        path="name"
        render={(field, inputRef) => {
          return (
            <Form.Item
              label="Name"
              validateStatus={getValidationStatus(field)}
              help={field.messageDescription}
              required={field.isRequired}
            >
              <Input
                ref={inputRef}
                value={field.value}
                onChange={(e) => field.value = e.target.value}
                onBlur={() => field.validate()}
              />
            </Form.Item>
          )
        }}
        schema={{ type: 'string', default: '', presence: true, minLength: 2 }}
      />

      <h4>Nodes:</h4>

      <br />

      <Field
        path="nodes"
        schema={{ default: [], type: 'array' }}
        render={(field) => {
          const nodesValues = field.value

          return nodesValues
            ? nodesValues.map((item, index) => renderNode(field.ref.ref(`${index}`), getField))
            : null
        }}
      />

      <CreateNodeForm nodeRef={nodeRef} getField={getField} />
    </NodeWrapper>
  </Scope>
}

function CreateNodeForm ({ nodeRef, getField }: { nodeRef: types.IRef, getField: any }) {
  return <FormProvider data={{}}>
    <Form layout="inline">
      <Field
        path="new"
        schema={{
          type: 'string', default: '', presence: true, minLength: 2
        }}
        render={(field, inputRef) => {
          return (
            <Form.Item
              label="New node name"
              validateStatus={getValidationStatus(field)}
              help={field.messageDescription}
              required={field.isRequired}
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

      <Submit
        onSuccess={(data) => {
          const subNodesField = getField(nodeRef.ref('nodes').path)
          const nodes = subNodesField.value || []

          subNodesField.value = [
            ...nodes,
            { __id: ++nodeId, name: data.new }
          ]
        }}
        render={(handleSubmit) => <Button onClick={handleSubmit}>Add</Button>}
      />
    </Form>
  </FormProvider>
}

function NestedSchemaForm () {
  return (
    <FormProvider data={initialData}>
      <ErrorProvider>
        <ShowErrors />

        <Watch props={[]} render={(getRef, getField) => renderNode(getRef('/'), getField)} />

        <SubmitBtn />
      </ErrorProvider>
    </FormProvider>
  )
}
