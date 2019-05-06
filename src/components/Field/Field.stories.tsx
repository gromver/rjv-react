import * as React from 'react';
import { Model } from 'rjv';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';

import Field from './Field';

storiesOf('Field', module)
  .addDecorator(withInfo)
  .add('input field', () => {
    const model = new Model({ type: 'string' }, '');

    return (
      <Field
        field={model.ref()}
        render={(ref) => {
          return <input
            value={ref.value}
            onChange={(e) => ref.value = e.target.value}
          />;
        }}
      />
    );
  });
