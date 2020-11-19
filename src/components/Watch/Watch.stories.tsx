import React, { createRef, useCallback } from 'react'
import { Form, Input, Button, Row, Col } from 'antd'
import { storiesOf } from '@storybook/react'

import { FormProvider, FormProviderRef } from '../FormProvider'
import { Watch } from './index'
import { Field } from '../Field'
import { getValidationStatus } from '../../stories/helpers'
import { Scope } from '../Scope'

type Props = { path: string }

function InputField ({ path }: Props) {
  return <Field
    path={path}
    schema={{ default: '', presence: true }}
    render={(field, inputRef) => {
      return (
        <Form.Item
          label={path}
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
}

storiesOf('Watch', module)
  .add('Watch', () => {
    const providerRef = createRef<FormProviderRef>()
    const handleSubmit = useCallback(async () => {
      if (providerRef.current) {
        const res = await providerRef.current.submit()
        console.log('RESULT', res)
        if (!res.valid) {
          res.firstErrorField && res.firstErrorField.focus()
        }
      }
    }, [providerRef.current])
    return <Form style={{ maxWidth: '1000px' }}>
      <FormProvider ref={providerRef} data={{}}>
        <Row gutter={16}>
          <Col sm={12}>
            <InputField path={'/a'} />
            <InputField path={'/b'} />
            <InputField path={'/obj/a'} />
            <InputField path={'/obj/b'} />
            <InputField path={'/obj/c/d'} />
            <Button onClick={handleSubmit}>Submit</Button>
          </Col>
          <Col sm={12}>
            <h4>Watch: '/a', '/b', '/obj/*'</h4>
            <Watch
              props={['/a', '/b', '/obj/*']}
              render={(ref) => <div>
                {JSON.stringify(ref.value)}
              </div>}
            />
            <br />
            <h4>Watch: '/obj/**'</h4>
            <Watch
              props={['/obj/**']}
              render={(ref) => <div>
                {JSON.stringify(ref.ref('obj').value)}
              </div>}
            />
            <br />
            <Scope path="obj">
              <h4>Watch from scope /obj: '**', '../a'</h4>
              <Watch
                props={['**', '../a']}
                render={(ref) => <div>
                  {JSON.stringify(ref.value)}
                </div>}
              />
            </Scope>
          </Col>
        </Row>
      </FormProvider>
    </Form>
  })
