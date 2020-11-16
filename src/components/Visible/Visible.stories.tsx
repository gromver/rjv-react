import React from 'react'
import { Form, Input, Select, Row, Col } from 'antd'
import { storiesOf } from '@storybook/react'

import { Provider } from '../Provider'
import { Visible } from './index'
import { Field } from '../Field'
import { getValidationStatus } from '../../stories/helpers'

storiesOf('Visible', module)
  .add('Simple', () => {
    return <Form style={{ maxWidth: '800px' }}>
      <Provider data={{ selector: 'yes' }}>
        <Row gutter={16}>
          <Col sm={12}>
            <h4>Validate whole data</h4>

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
            <Visible
              schema={{
                properties: {
                  selector: { const: 'yes' }
                }
              }}
            >
              Visible!
            </Visible>
          </Col>
          <Col sm={12}>
            <h4>Validate certain prop</h4>

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
            <Visible
              path="selector"
              schema={{ const: 'yes' }}
            >
              Visible!
            </Visible>
          </Col>
        </Row>
      </Provider>
    </Form>
  })
  .add('Advanced - useVisibilityStyle=false', () => {
    return <Form style={{ maxWidth: '400px' }}>
      <Provider data={{ selector: 'yes' }}>
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
        <Visible
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
        </Visible>
        <p>Footer</p>
      </Provider>
    </Form>
  })
  .add('Advanced - useVisibilityStyle=true', () => {
    return <Form style={{ maxWidth: '400px' }}>
      <Provider data={{ selector: 'yes' }}>
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
        <Visible
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
        </Visible>
        <p>Footer</p>
      </Provider>
    </Form>
  })
