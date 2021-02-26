import React, { useState } from 'react'
import { Form as AntdForm, Input, Button, Card } from 'antd'
import { storiesOf } from '@storybook/react'
import { getValidationStatus, SubmitBtn, ShowErrors } from './helpers'
import {
  FormProvider,
  Watch,
  Field,
  Scope,
  Submit,
  FormStateUpdater
} from '../index'
import { FieldApi } from '../types'
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
        render={({ field, state, inputRef }) => {
          return (
            <AntdForm.Item
              label="Name"
              validateStatus={getValidationStatus(state)}
              help={field.messageDescription}
              required={state.isRequired}
            >
              <Input
                ref={inputRef}
                value={field.value}
                onChange={(e) => field.value = e.target.value}
                onBlur={() => field.validate()}
              />
            </AntdForm.Item>
          )
        }}
        schema={{ type: 'string', default: '', presence: true, minLength: 2 }}
      />

      <h4>Nodes:</h4>

      <br />

      <Field
        path="nodes"
        schema={{ default: [], type: 'array' }}
        render={({ field, state }) => {
          const nodesValues = field.value

          return <>
            {nodesValues
              ? nodesValues.map((item, index) => renderNode(`${field.dataRef.path}/${index}`, nodesValues[index]))
              : null}

            <CreateNodeForm nodesField={field} />
          </>
        }}
      />
    </NodeWrapper>
  </Scope>
}

function CreateNodeForm ({ nodesField }: { nodesField: FieldApi }) {
  const [data, setData] = useState({})
  return <FormProvider data={data}>
    <AntdForm layout="inline">
      <Field
        path="new"
        schema={{
          type: 'string', default: '', presence: true, minLength: 2
        }}
        render={({ field, state, inputRef }) => {
          return (
            <AntdForm.Item
              label="New node name"
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

      <Submit
        onSuccess={(data) => {
          const nodes = nodesField.value || []

          nodesField.value = [
            ...nodes,
            { __id: ++nodeId, name: data.new }
          ]

          setData({})
        }}
        render={({ handleSubmit, state }) => <Button onClick={handleSubmit} disabled={!state.isValid}>Add</Button>}
      />
    </AntdForm>
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
