import * as React from 'react';
import { Model, Ref, stateTypes } from 'rjv';
import Connect from './Connect';
import { create } from 'react-test-renderer';

describe('Connect tests', () => {
  it('Should render the correct sequence of states (case 1)', async () => {
    const model = new Model(
      {
        type: 'string',
      },
      'foo',
    );
    const rootRef = model.ref();
    const renderer = jest.fn((ref: Ref) => {
      return ref.state.type as any;
    });

    create(
      <Connect
        model={model}
        render={renderer}
        args={[rootRef]}
        debounce={0}
      />,
    );

    await rootRef.validate();

    expect(renderer).toHaveBeenCalledTimes(3);
    expect(renderer.mock.results[0])
      .toMatchObject({ type: 'return', value: stateTypes.PRISTINE });
    expect(renderer.mock.results[1])
      .toMatchObject({ type: 'return', value: stateTypes.VALIDATING });
    expect(renderer.mock.results[2])
      .toMatchObject({ type: 'return', value: stateTypes.SUCCESS });
    expect(renderer.mock.results[3])
      .toBeUndefined();
  });

  it('Should render the correct sequence of states (case 2)', async () => {
    const model = new Model(
      {
        type: 'string',
      },
      'foo',
    );
    const rootRef = model.ref();
    const renderer = jest.fn((ref: Ref) => {
      return ref.state.type as any;
    });

    create(
      <Connect
        model={model}
        render={renderer}
        args={[rootRef]}
        debounce={33}
      />,
    );

    await rootRef.validate();

    await new Promise((r) => setTimeout(r, 50));

    expect(renderer).toHaveBeenCalledTimes(2);

    expect(renderer.mock.results[0])
      .toMatchObject({ type: 'return', value: stateTypes.PRISTINE });
    expect(renderer.mock.results[1])
      .toMatchObject({ type: 'return', value: stateTypes.SUCCESS });
    expect(renderer.mock.results[2])
      .toBeUndefined();
  });

  it('Should render the correct sequence of states (case 3)', async () => {
    const model = new Model(
      {
        type: 'string',
        validate: (ref) => {
          return new Promise((res) => {
            setTimeout(res, 50, ref.createSuccessResult());
          });
        },
      },
      'foo',
    );
    const rootRef = model.ref();
    const renderer = jest.fn((ref: Ref) => {
      return ref.state.type as any;
    });

    create(
      <Connect
        model={model}
        render={renderer}
        args={[rootRef]}
        debounce={33}
      />,
    );

    await rootRef.validate();

    await new Promise((r) => setTimeout(r, 50));

    expect(renderer).toHaveBeenCalledTimes(3);

    expect(renderer.mock.results[0])
      .toMatchObject({ type: 'return', value: stateTypes.PRISTINE });
    expect(renderer.mock.results[1])
      .toMatchObject({ type: 'return', value: stateTypes.VALIDATING });
    expect(renderer.mock.results[2])
      .toMatchObject({ type: 'return', value: stateTypes.SUCCESS });
    expect(renderer.mock.results[3])
      .toBeUndefined();
  });
});
