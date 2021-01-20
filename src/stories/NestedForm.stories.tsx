import React from 'react'
import { Form, Input, Button, Card } from 'antd'
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
import { useDataRef } from '../hooks'

let nodeId = 1
const initialData = { __id: nodeId }

storiesOf('Nested Form', module)
  .add('Example', () => {

    return <NestedSchemaForm />
  })

function NodeWrapper ({ children }) {
  return <Card style={{ paddingLeft: 40, marginBottom: 15, width: 500 }}>{children}</Card>
}

function renderNode (path: string, value: any) {
  return <Scope
    key={`key_${value.__id}`}
    path={path}
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
              required={field.state.isRequired}
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

          return <>
            {nodesValues
              ? nodesValues.map((item, index) => renderNode(`${field.ref.path}/${index}`, nodesValues[index]))
              : null}

            <CreateNodeForm nodesField={field} />
          </>
        }}
      />
    </NodeWrapper>
  </Scope>
}

function CreateNodeForm ({ nodesField }: { nodesField: FieldApi }) {
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
              required={field.state.isRequired}
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
      />

      <Submit
        onSuccess={(data) => {
          const nodes = nodesField.value || []

          nodesField.value = [
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
      <ShowErrors />

      <Watch
        props={[]}
        render={() => {
          const dataRef = useDataRef('/')

          return renderNode('/', dataRef.value)
        }}
      />
      <SubmitBtn />
    </FormProvider>
  )
}
