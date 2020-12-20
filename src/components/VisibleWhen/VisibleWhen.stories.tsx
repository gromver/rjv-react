import React from 'react'
import { Form, Input, Select, Row, Col } from 'antd'
import { storiesOf } from '@storybook/react'

import { FormProvider } from '../FormProvider'
import { VisibleWhen } from './index'
import { Field } from '../Field'
import { getValidationStatus } from '../../stories/helpers'

storiesOf('Visible', module)
  .add('Simple', () => {
    return <Form style={{ maxWidth: '800px' }}>
      <FormProvider data={{}}>
        <Row gutter={16}>
          <Col sm={12}>
            <h4>Validate whole data</h4>

            <Field
              path={'selector'}
              schema={{ default: 'yes', presence: true }}
              render={(field, inputRef) => {
                return (
                  <Form.Item
                    label={'Select is visible'}
                    validateStatus={getValidationStatus(field)}
                    help={field.messageDescription}
                    required={field.isRequired}
                    hasFeedback
                  >
                    <Select
                      ref={inputRef}
                      value={field.value}
                      onFocus={() => field.markAsTouched()}
                      onChange={(value) => field.value = value}
                      onBlur={() => field.validate()}
                    >
                      <Select.Option value="no">No</Select.Option>
                      <Select.Option value="yes">Yes</Select.Option>
                    </Select>
                  </Form.Item>
                )
              }}
            />
            <VisibleWhen
              schema={{
                properties: {
                  selector: { const: 'yes' }
                }
              }}
            >
              Visible!
            </VisibleWhen>
          </Col>
          <Col sm={12}>
            <h4>Validate certain prop</h4>

            <Field
              path={'selector'}
              schema={{ default: 'yes', presence: true }}
              render={(field, inputRef) => {
                return (
                  <Form.Item
                    label={'Select is visible'}
                    validateStatus={getValidationStatus(field)}
                    help={field.messageDescription}
                    required={field.isRequired}
                    hasFeedback
                  >
                    <Select
                      ref={inputRef}
                      value={field.value}
                      onFocus={() => field.markAsTouched()}
                      onChange={(value) => field.value = value}
                      onBlur={() => field.validate()}
                    >
                      <Select.Option value="no">No</Select.Option>
                      <Select.Option value="yes">Yes</Select.Option>
                    </Select>
                  </Form.Item>
                )
              }}
            />
            <VisibleWhen
              path="selector"
              schema={{ const: 'yes' }}
            >
              Visible!
            </VisibleWhen>
          </Col>
        </Row>
      </FormProvider>
    </Form>
  })
  .add('Advanced - useVisibilityStyle=false', () => {
    return <Form style={{ maxWidth: '400px' }}>
      <FormProvider data={{ selector: 'yes' }}>
        <Field
          path={'selector'}
          schema={{ presence: true }}
          render={(field, inputRef) => {
            return (
              <Form.Item
                label={'Select is visible'}
                validateStatus={getValidationStatus(field)}
                help={field.messageDescription}
                required={field.isRequired}
                hasFeedback
              >
                <Select
                  ref={inputRef}
                  value={field.value}
                  onFocus={() => field.markAsTouched()}
                  onChange={(value) => field.value = value}
                  onBlur={() => field.validate()}
                >
                  <Select.Option value="no">No</Select.Option>
                  <Select.Option value="yes">Yes</Select.Option>
                </Select>
              </Form.Item>
            )
          }}
        />
        <VisibleWhen
          path="selector"
          schema={{ const: 'yes' }}
        >
          <Field
            path="email"
            schema={{ default: '', format: 'email', presence: true }}
            render={(field, inputRef) => {
              return (
                <Form.Item
                  label="Email"
                  validateStatus={getValidationStatus(field)}
                  help={field.messageDescription}
                  required={field.isRequired}
                  hasFeedback
                >
                  <Input
                    ref={inputRef}
                    value={field.value}
                    onFocus={() => field.markAsTouched()}
                    onChange={(e) => field.value = e.target.value}
                    onBlur={() => field.validate()}
                  />
                </Form.Item>
              )
            }}
          />
        </VisibleWhen>
        <p>Footer</p>
      </FormProvider>
    </Form>
  })
  .add('Advanced - useVisibilityStyle=true', () => {
    return <Form style={{ maxWidth: '400px' }}>
      <FormProvider data={{ selector: 'yes' }}>
        <Field
          path={'selector'}
          schema={{ presence: true }}
          render={(field, inputRef) => {
            return (
              <Form.Item
                label={'Select is visible'}
                validateStatus={getValidationStatus(field)}
                help={field.messageDescription}
                required={field.isRequired}
                hasFeedback
              >
                <Select
                  ref={inputRef}
                  value={field.value}
                  onFocus={() => field.markAsTouched()}
                  onChange={(value) => field.value = value}
                  onBlur={() => field.validate()}
                >
                  <Select.Option value="no">No</Select.Option>
                  <Select.Option value="yes">Yes</Select.Option>
                </Select>
              </Form.Item>
            )
          }}
        />
        <VisibleWhen
          path="selector"
          schema={{ const: 'yes' }}
          useVisibilityStyle
        >
          <Field
            path="email"
            schema={{ default: '', format: 'email', presence: true }}
            render={(field, inputRef) => {
              return (
                <Form.Item
                  label="Email"
                  validateStatus={getValidationStatus(field)}
                  help={field.messageDescription}
                  required={field.isRequired}
                  hasFeedback
                >
                  <Input
                    ref={inputRef}
                    value={field.value}
                    onFocus={() => field.markAsTouched()}
                    onChange={(e) => field.value = e.target.value}
                    onBlur={() => field.validate()}
                  />
                </Form.Item>
              )
            }}
          />
        </VisibleWhen>
        <p>Footer</p>
      </FormProvider>
    </Form>
  })