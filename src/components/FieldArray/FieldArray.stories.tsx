import React, { useRef } from 'react'
import { Form as AntdForm, Button, Space, Input, Alert } from 'antd'
import { storiesOf } from '@storybook/react'
import FieldArray from './FieldArray'
import { FormProvider } from '../FormProvider'
import { Field } from '../Field'
import { Form } from '../Form'
import { Scope } from '../Scope'
import { getValidationStatus, SubmitBtn } from '../../stories/helpers'
import { FieldArrayInfo } from '../../hooks/useFieldArray'
import { FieldArrayApi, FormApi } from '../../types'

storiesOf('FieldArray', module)
  .add('Api test', () => {
    const fieldsRef = useRef<FieldArrayApi>(null)
    return (
      <FormProvider data={[]}>
        <AntdForm>
          <FieldArray ref={fieldsRef} path={'/'} render={({ items, fields }) => (
            <>
              {items.map(({ key, path }, index) => (
                <Scope key={key} path={path}>
                  <Space style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Field
                      path="name"
                      schema={{ default: '', presence: true, minLength: 2 }}
                      render={({ field, state, inputRef }) => (
                        <AntdForm.Item
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
                        </AntdForm.Item>
                      )}
                    />
                    <Button
                      onClick={() => fields.remove(index)}
                    >Remove</Button>
                  </Space>
                </Scope>
              ))}

              <h4>Using Api</h4>

              <AntdForm.Item>
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
              </AntdForm.Item>

              <h4>Using Ref</h4>

              <AntdForm.Item>
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
                &nbsp;
                <Button type="dashed" onClick={() => fieldsRef.current?.clear()}>
                  Clear
                </Button>
              </AntdForm.Item>

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
        </AntdForm>
        <SubmitBtn />
      </FormProvider>
    )
  })
  .add('Dynamic form', () => {
    const formRef = useRef<FormApi>(null)
    const fieldsRef = useRef<FieldArrayApi>(null)

    return (
      <FormProvider ref={formRef} data={[]}>
        <AntdForm>
          <h3>The form must have at least 2 items</h3>

          <br />

          <FieldArray
            ref={fieldsRef}
            path={'/'}
            render={({ items, fields }) => (
              <>
                {items.map(({ key, path }, index) => (
                  <Scope key={key} path={path}>
                    <Space style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Field
                        path="name"
                        schema={{ default: '', presence: true, minLength: 2 }}
                        render={({ field, state, inputRef }) => (
                          <AntdForm.Item
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
                          </AntdForm.Item>
                        )}
                      />

                      <Form
                        render={({ form }) => {
                          return <Button
                            onClick={() => { fields.remove(index); return form.syncFields('/') }}
                          >
                            Remove
                          </Button>
                        }}
                      />
                    </Space>
                  </Scope>
                ))}

                <Form
                  render={({ form }) => {
                    return <Button
                      type="dashed"
                      onClick={() => { fields.append({}); return form.syncFields('/') }}
                    >
                      Add field and validate
                    </Button>
                  }}
                />
              </>
            )}
          />
          &nbsp;
          <Button
            type="dashed"
            onClick={() => { fieldsRef.current?.append({}); return formRef.current?.syncFields('/') }}
          >
            Add field and validate (using refs)
          </Button>
        </AntdForm>

        <br />

        <Field
          path="/"
          schema={{ minItems: 2 }}
          render={({ field, state }) => {
            const invalid = state.isValidated && !state.isValid
            return invalid ?
              <AntdForm.Item>
                <Alert type="error" message={field.messageDescription} />
              </AntdForm.Item>
              : null
          }}
        />

        <SubmitBtn />
      </FormProvider>
    )
  })
