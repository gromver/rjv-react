import React, { useRef } from 'react'
import { Form as AntdForm, Button, Space, Form, Input } from 'antd'
import { storiesOf } from '@storybook/react'
import FieldArray from './FieldArray'
import { FormProvider } from '../FormProvider'
import { Field } from '../Field'
import { Scope } from '../Scope'
import { getValidationStatus, SubmitBtn } from '../../stories/helpers'
import { FieldArrayInfo } from '../../hooks/useFieldArray'

storiesOf('FieldArray', module)
  .add('Dynamic Fields', () => {
    const fieldsRef = useRef<FieldArrayInfo>(null)
    return (
      <FormProvider data={[]}>
        <Form>
          <FieldArray ref={fieldsRef} path={'/'} render={({ items, fields }) => (
            <>
              {items.map(({ key, path }, index) => (
                <Scope key={key} path={path}>
                  <Space style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Field
                      path="name"
                      schema={{ default: '', presence: true, minLength: 2 }}
                      render={({ field, state, inputRef }) => (
                        <Form.Item
                          validateStatus={getValidationStatus(state)}
                          help={field.messageDescription}
                          required={state.isRequired}
                        >
                          <Input
                            ref={inputRef}
                            value={field.value}
                            onFocus={() => field.touched()}
                            onChange={(e) => field.value = e.target.value}
                            onBlur={() => field.validate()}
                            placeholder="Name"
                            autoFocus
                          />
                        </Form.Item>
                      )}
                    />
                    <Button
                      onClick={() => fields.remove(index)}
                    >Remove</Button>
                  </Space>
                </Scope>
              ))}

              <h4>Using Api</h4>

              <Form.Item>
                <Button type="dashed" onClick={() => fields.prepend({})}>
                  Prepend field
                </Button>
                &nbsp;
                <Button type="dashed" onClick={() => fields.append({})}>
                  Append field
                </Button>
                &nbsp;
                <Button type="dashed" onClick={() => fields.insert(1, {})}>
                  Insert field at index = 1
                </Button>
                &nbsp;
                <Button type="dashed" onClick={() => fields.swap(0, 2)}>
                  Swap 1st and 3th fields
                </Button>
                &nbsp;
                <Button type="dashed" onClick={() => fields.move(0, 2)}>
                  Move 1st field to 3th
                </Button>
                &nbsp;
                <Button type="dashed" onClick={() => fields.clear()}>
                  Clear
                </Button>
              </Form.Item>

              <h4>Using Ref</h4>

              <Form.Item>
                <Button type="dashed" onClick={() => fieldsRef.current?.fields.prepend({})}>
                  Prepend field
                </Button>
                &nbsp;
                <Button type="dashed" onClick={() => fieldsRef.current?.fields.append({})}>
                  Append field
                </Button>
                &nbsp;
                <Button type="dashed" onClick={() => fieldsRef.current?.fields.insert(1, {})}>
                  Insert field at index = 1
                </Button>
                &nbsp;
                <Button type="dashed" onClick={() => fieldsRef.current?.fields.swap(0, 2)}>
                  Swap 1st and 3th fields
                </Button>
                &nbsp;
                <Button type="dashed" onClick={() => fieldsRef.current?.fields.move(0, 2)}>
                  Move 1st field to 3th
                </Button>
                &nbsp;
                <Button type="dashed" onClick={() => fieldsRef.current?.fields.clear()}>
                  Clear
                </Button>
              </Form.Item>

              <Field
                path="/"
                schema={{ minItems: 1 }}
                render={({ field, state }) => {
                  const invalid = state.isValidated && !state.isValid
                  return <AntdForm.Item
                    validateStatus={invalid ? 'error' : 'success'}
                    help={invalid && field.messageDescription}
                  >
                    <Button
                      type="dashed"
                      onClick={() => { fields.append({}); return field.validate() }}
                    >
                      Add field and validate
                    </Button>
                  </AntdForm.Item>
                }}
              />
            </>
          )} />
        </Form>
        <SubmitBtn />
      </FormProvider>
    )
  })
