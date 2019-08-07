import * as React from 'react';
import { Model } from 'rjv';
import { Form, Input, Alert } from 'antd';
import { storiesOf } from '@storybook/react';

import Connect from './Connect';
import Field from './Field';

const VALIDATION_STATUSES = [undefined, 'validating', 'success', 'error'];

const schema = {
  properties: {
    name: { type: 'string', default: '', presence: true },
    email: { type: 'string', default: '', presence: true, format: 'email' },
  },
};

export function getValidationStatus(state): any {
  const type = state.type;

  return VALIDATION_STATUSES[type];
}

storiesOf('Form', module)
  .add('Simple Auth', () => {

    return <SimpleForm />;
  });

class SimpleForm extends React.Component<any, { model: Model }> {
  constructor (prop, ctx) {
    super(prop, ctx);

    this.state = {
      model: new Model(schema, {}),
    };
  }

  render() {
    const { model } = this.state;

    const ref = model.ref();

    return (
      <Form style={{ maxWidth: '400px' }}>
        <Connect
          model={model}
          render={() => {
            const errors = model.getRefErrors(ref).map((err, index) => (
              <p key={`err-${index}`}>
                {err.path.join('.') || '..'}: {err.message && err.message.description}
              </p>
            ));

            return errors.length
              ? <Alert type="error" message={errors} />
              : (ref.isValidated ? <Alert type="success" message="Success" /> : null);
          }}
        />

        <Field
          field={model.ref(['name'])}
          render={(ref) => {
            const state = ref.state;

            return (
              <Form.Item
                label="Name"
                validateStatus={getValidationStatus(state)}
                help={state.message && state.message.description}
                required={ref.isShouldNotBeBlank}
              >
                <Input
                  value={ref.value}
                  onChange={(e) => ref.value = e.target.value}
                />
              </Form.Item>
            );
          }}
        />

        <Field
          field={model.ref(['email'])}
          render={(ref) => {
            const state = ref.state;

            return (
              <Form.Item
                label="Email"
                validateStatus={getValidationStatus(state)}
                help={state.message && state.message.description}
                required={ref.isShouldNotBeBlank}
              >
                <Input
                  value={ref.value}
                  onChange={(e) => ref.value = e.target.value}
                />
              </Form.Item>
            );
          }}
        />

        <button
          onClick={() => ref.validate()}
        >
          Submit
        </button>
        &nbsp;
        <button
          onClick={() => this.setState({ model: new Model(schema, {}) })}
        >
          Clean
        </button>
      </Form>
    );
  }
}
