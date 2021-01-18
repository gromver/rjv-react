import React, { useRef } from 'react'
import { Button, Space, Form, Input } from 'antd'
import { storiesOf } from '@storybook/react'
import { getValidationStatus, SubmitBtn } from '../../stories/helpers'
import { FormProvider } from '../FormProvider'
import { FieldArray, FieldArrayRef } from './index'
import { Field } from '../Field'
import { Scope } from '../Scope'

storiesOf('FieldArray', module)
  .add('Dynamic Fields', () => {
    const fieldsRef = useRef<FieldArrayRef>(null)
    return (
      <FormProvider data={[]}>
        <Form>
          <FieldArray ref={fieldsRef} path={'/'} render={(items, field) => (
            <>
              {items.map(({ key, path }, index) => (
                <Scope key={key} path={path}>
                  <Space style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Field
                      path="name"
                      schema={{ default: '', presence: true }}
                      render={(field, inputRef) => (
                        <Form.Item
                          validateStatus={getValidationStatus(field)}
                          help={field.messageDescription}
                          required={field.state.isRequired}
                        >
                          <Input
                            ref={inputRef}
                            value={field.value}
                            onFocus={() => field.markAsTouched()}
                            onChange={(e) => field.value = e.target.value}
                            onBlur={() => field.validate()}
                            placeholder="Name"
                            autoFocus
                          />
                        </Form.Item>
                      )}
                    />
                    <Button
                      onClick={() => field.remove(index)}
                    >Remove</Button>
                  </Space>
                </Scope>
              ))}

              <h4>Using Api</h4>

              <Form.Item>
                <Button type="dashed" onClick={() => field.prepend({})}>
                  Prepend field
                </Button>
                &nbsp;
                <Button type="dashed" onClick={() => field.append({})}>
                  Append field
                </Button>
                &nbsp;
                <Button type="dashed" onClick={() => field.insert(1, {})}>
                  Insert field at index = 1
                </Button>
                &nbsp;
                <Button type="dashed" onClick={() => field.swap(0, 2)}>
                  Swap 1st and 3th fields
                </Button>
                &nbsp;
                <Button type="dashed" onClick={() => field.move(0, 2)}>
                  Move 1st field to 3th
                </Button>
              </Form.Item>

              <h4>Using Ref</h4>

              <Form.Item>
                <Button type="dashed" onClick={() => fieldsRef.current?.prepend({})}>
                  Prepend field
                </Button>
                &nbsp;
                <Button type="dashed" onClick={() => fieldsRef.current?.append({})}>
                  Append field
                </Button>
                &nbsp;
                <Button type="dashed" onClick={() => fieldsRef.current?.insert(1, {})}>
                  Insert field at index = 1
                </Button>
                &nbsp;
                <Button type="dashed" onClick={() => fieldsRef.current?.swap(0, 2)}>
                  Swap 1st and 3th fields
                </Button>
                &nbsp;
                <Button type="dashed" onClick={() => fieldsRef.current?.move(0, 2)}>
                  Move 1st field to 3th
                </Button>
              </Form.Item>
            </>
          )} />
        </Form>
        <SubmitBtn />
      </FormProvider>
    )
  })
