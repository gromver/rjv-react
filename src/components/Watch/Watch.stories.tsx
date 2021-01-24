import React, { useState } from 'react'
import { Form, Input, Row, Col, Select } from 'antd'
import { storiesOf } from '@storybook/react'
import { FormProvider } from '../FormProvider'
import { Watch } from './index'
import { Field } from '../Field'
import { getValidationStatus, SubmitBtn } from '../../stories/helpers'
import { Scope } from '../Scope'
import { useDataRef } from '../../hooks'

type Props = { path: string }

function InputField ({ path }: Props) {
  return <Field
    path={path}
    schema={{ default: '', presence: true }}
    render={({ field, state, inputRef }) => {
      return (
        <Form.Item
          label={path}
          validateStatus={getValidationStatus(state)}
          help={field.messageDescription}
          required={state.isRequired}
          hasFeedback
        >
          <Input
            ref={inputRef}
            value={field.value}
            onFocus={() => field.touched()}
            onChange={(e) => field.value = e.target.value}
            onBlur={() => field.validate()}
          />
        </Form.Item>
      )
    }}
  />
}

storiesOf('Watch', module)
  .add('Overview', () => {
    return <Form style={{ maxWidth: '1000px' }}>
      <FormProvider data={{}}>
        <Row gutter={16}>
          <Col sm={12}>
            <InputField path={'/a'} />
            <InputField path={'/b'} />
            <InputField path={'/obj/a'} />
            <InputField path={'/obj/b'} />
            <InputField path={'/obj/c/d'} />
            <SubmitBtn />
          </Col>
          <Col sm={12}>
            <h4>Watch: '/a', '/b', '/obj/*'</h4>
            <Watch
              props={['/a', '/b', '/obj/*']}
              render={(a, b) => {
                const objRef = useDataRef('obj')

                return (
                  <div>
                    /a - {JSON.stringify(a)}
                    <br />
                    /b - {JSON.stringify(b)}
                    <br />
                    /obj - {JSON.stringify(objRef.value)}
                  </div>
                )
              }}
            />
            <br />
            <h4>Watch: '/obj/**'</h4>
            <Watch
              props={['/obj/**']}
              render={() => {
                const objRef = useDataRef('/obj')

                return (
                  <div>
                    /obj - {JSON.stringify(objRef.value)}
                  </div>
                )
              }}
            />
            <br />
            <Scope path="obj">
              <h4>Watch from scope /obj: '**', '../a'</h4>
              <Watch
                props={['../a', '**']}
                render={(a) => {
                  const objRef = useDataRef('')

                  return (
                    <div>
                      /obj - {JSON.stringify(objRef.value)}
                      <br />
                      /a - {JSON.stringify(a)}
                    </div>
                  )
                }}
              />
            </Scope>
          </Col>
        </Row>
      </FormProvider>
    </Form>
  })
  .add('Change path', () => {
    const [initialData] = useState({})
    const [path, setPath] = useState<any>('a')

    return <Form style={{ maxWidth: '1000px' }}>
      <FormProvider data={initialData}>
        <Row gutter={16}>
          <Col sm={12}>
            <InputField path={'/a'} />
            <InputField path={'/b'} />
          </Col>
          <Col sm={12}>
            <Form.Item label="Select path">
              <Select value={path} onChange={setPath}>
                <Select.Option value={'a'}>/a</Select.Option>
                <Select.Option value={'b'}>/b</Select.Option>
              </Select>
            </Form.Item>
            <Watch
              props={[path]}
              render={(value) => (
                <div>
                  {JSON.stringify(value)}
                </div>
              )}
            />
          </Col>
        </Row>
      </FormProvider>
    </Form>
  })
  .add('Change scope', () => {
    const [initialData] = useState({})
    const [path, setPath] = useState<any>('a')

    return <Form style={{ maxWidth: '1000px' }}>
      <FormProvider data={initialData}>
        <Row gutter={16}>
          <Col sm={12}>
            <InputField path={'/a'} />
            <InputField path={'/b'} />
          </Col>
          <Col sm={12}>
            <Form.Item label="Select path">
              <Select value={path} onChange={setPath}>
                <Select.Option value={'a'}>/a</Select.Option>
                <Select.Option value={'b'}>/b</Select.Option>
              </Select>
            </Form.Item>
            <Scope path={path}>
              <Watch
                props={['']}
                render={(value) => (
                  <div>
                    {JSON.stringify(value)}
                  </div>
                )}
              />
            </Scope>
          </Col>
        </Row>
      </FormProvider>
    </Form>
  })
