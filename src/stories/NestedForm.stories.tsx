import React, { useRef, createRef, useState, useMemo, useContext, useCallback } from 'react'
import { types } from 'rjv'
import { Form, Input, Alert, Button, Card } from 'antd'
import { storiesOf } from '@storybook/react'
import { getValidationStatus } from './helpers'
import {
  Provider,
  ProviderRef,
  Watch,
  Field,
  Scope,
  events,
  ProviderContext, EventEmitterContext
} from '../index'
import { EmittingRef } from '../refs'

let nodeId = 1
const initialData = { __id: nodeId }

storiesOf('Nested Form', module)
  .add('Example', () => {

    return <NestedSchemaForm />
  })

function NodeWrapper ({ children }) {
  return <Card style={{ paddingLeft: 40, marginBottom: 15, width: 500 }}>{children}</Card>
}

function renderNode (nodeRef: types.IRef) {
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
        schema={{ type: 'string', default: '', presence: true }}
      />

      <h4>Nodes:</h4>

      <br />

      <Field
        path="nodes"
        schema={{ default: [], type: 'array' }}
        render={(field) => {
          const nodesValues = field.value

          return nodesValues
            ? nodesValues.map((item, index) => renderNode(field.ref.ref(`${index}`)))
            : null
        }}
      />

      <CreateNodeForm nodeRef={nodeRef} />
    </NodeWrapper>
  </Scope>
}

function CreateNodeForm ({ nodeRef }: { nodeRef: types.IRef }) {
  const createNodeFormRef = createRef<ProviderRef>()
  const [createNodeFormKey, setCreateNodeFormKey] = useState(1)

  return <Provider key={`formKey-${createNodeFormKey}`} ref={createNodeFormRef} data={{}}>
    <Form layout="inline">
      <Field
        path="name"
        schema={{
          type: 'string', default: '', minLength: 2, presence: true
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

      <Button
        // icon="plus"
        type="primary"
        onClick={() => {
          createNodeFormRef.current && createNodeFormRef.current.submit()
            .then(({ valid, data }) => {
              if (valid) {
                const nodes = nodeRef.ref('nodes').value || []

                nodeRef.ref('nodes').value = [
                  ...nodes,
                  { __id: ++nodeId, name: data.name }
                ]

                setCreateNodeFormKey(createNodeFormKey + 1)
              }
            })
        }}
      >
        Add
      </Button>
    </Form>
  </Provider>
}

function WithRef ({ render }: any) {
  const providerContext = useContext(ProviderContext)
  const emitterContext = useContext(EventEmitterContext)
  const ref = useMemo(
    () => {
      return providerContext && emitterContext && new EmittingRef(providerContext.dataStorage, '/', emitterContext.emitter)
    },
    [providerContext]
  )

  return ref ? render(ref) : null
}

function NestedSchemaForm () {
  const providerRef = useRef<ProviderRef>(null)
  const handleSubmit = useCallback(async () => {
    if (providerRef.current) {
      const res = await providerRef.current.submit()
      console.log('RESULT', res)
      if (!res.valid) {
        res.firstErrorField && res.firstErrorField.focus()
      }
    }
  }, [providerRef.current])

  return (
    <Provider ref={providerRef} data={initialData}>
      <Watch
        on={[events.ValidatedEvent.TYPE]}
        debounce={50}
        render={() => {
          if (providerRef.current) {
            const errors = providerRef.current.getErrors()

            const entries = Object.entries(errors)

            if (entries.length) {
              return <Alert
                type="error"
                message={entries.map(([path, message]) => (
                  <p key={`err-${path}`}>
                    {path}: {message}
                  </p>
                ))}
              />
            }
          }

          return null
        }}
      />

      <WithRef render={(ref) => renderNode(ref)} />

      <button onClick={handleSubmit}>
        Submit
      </button>
    </Provider>
  )
}
