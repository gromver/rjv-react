/**
 *
 * Field
 *
 */

import * as React from 'react';

import { Ref } from 'rjv';
import Connect from '../Connect';

type Props = {
  render: (ref: Ref) => React.ReactElement,
  field: Ref,
  depends?: (string | number)[][],
};

class Field extends React.PureComponent<Props> {
  static defaultProps = {
    depends: [],
  };

  render() {
    const { render, depends, field } = this.props;

    return (
      <Connect
        render={render}
        model={field.model}
        observe={[field.path, ...depends as []]}
        args={[field]}
      />
    );
  }
}

export default Field;
