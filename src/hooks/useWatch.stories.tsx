import React, { useState } from 'react'
import { Form, Input, Row, Col, Select } from 'antd'
import { storiesOf } from '@storybook/react'
import { getValidationStatus, SubmitBtn } from '../stories/helpers'
import { FormProvider } from '../components/FormProvider'
import { Field } from '../components/Field'
import { Scope } from '../components/Scope'
import useWatch from './useWatch'

type WatcherProps = {
  props: string[]
  render: (...args: any[]) => React.ReactElement
}

function Watcher ({ props, render }: WatcherProps) {
  const values = useWatch(...props)

  return render(...values)
}

type InputFieldProps = { path: string }

function InputField ({ path }: InputFieldProps) {
  return <Field
    path={path}
    schema={{ default: '', presence: true }}
    render={(field, inputRef) => {
      return (
        <Form.Item
          label={path}
          validateStatus={getValidationStatus(field)}
          help={field.messageDescription}
          required={field.state.isRequired}
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
}

storiesOf('useWatch', module)
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
            <Watcher
              props={['/a', '/b', '/obj/*']}
              render={(getValue, a, b) => <div>
                /a - {JSON.stringify(a)}
                <br />
                /b - {JSON.stringify(b)}
                <br />
                /obj - {JSON.stringify(getValue('obj'))}
              </div>}
            />
            <br />
            <h4>Watch: '/obj/**'</h4>
            <Watcher
              props={['/obj/**']}
              render={(getValue) => <div>
                /obj - {JSON.stringify(getValue('/obj'))}
              </div>}
            />
            <br />
            <Scope path="obj">
              <h4>Watch from scope /obj: '**', '../a'</h4>
              <Watcher
                props={['../a', '**']}
                render={(getValue, a) => <div>
                  /obj - {JSON.stringify(getValue(''))}
                  <br />
                  /a - {JSON.stringify(a)}
                </div>}
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
            <Watcher
              props={[path]}
              render={(getValue, value) => (
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
              <Watcher
                props={['']}
                render={(getValue, value) => (
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
