/**
 *
 * Connect
 *
 */

import * as React from 'react';
import { Model, events } from 'rjv';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { merge } from 'rxjs/observable/merge';
import { filter } from 'rxjs/operator/filter';
import { debounceTime } from 'rxjs/operator/debounceTime';

const isEqual = require('lodash.isequal');

type Props = {
  render: (...args: any[]) => React.ReactElement | null,
  model: Model,
  observe?: (string | number)[][],
  debounce?: number,
  args?: any[],
};

class Connect extends React.PureComponent<Props> {
  static TICK = 33;

  static defaultProps = {
    debounce: Connect.TICK,
    observe: [],
    args: [],
  };

  private subscription: Subscription;

  constructor(props) {
    super(props);

    this.connect(
      props.model,
      props.observe,
      props.debounce,
    );
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any): void {
    if (
      this.props.model !== prevProps.model ||
      !isEqual(this.props.observe, prevProps.observe) ||
      this.props.debounce !== prevProps.debounce
    ) {
      this.connect(
        this.props.model,
        this.props.observe,
        this.props.debounce,
      );
    }
  }

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Connect to the target
   * @param {Ref} model
   * @param {((string | number)[])[]} observe
   * @param {number} delay
   */
  connect(model, observe, delay) {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    let observable: Observable<events.Event>;

    if (model instanceof Model) {
      observable = model.observable;
    } else {
      throw new Error('Connect::model property must be an instance of Model');
    }

    if (observe.length) {
      observable = filter.call(
        observable,
        (event) => !!observe.find((attr) => isEqual(attr, event.path)),
      );
    }

    if (delay) {
      observable = merge(
        filter.call(observable, (event) => event instanceof events.ChangeRefValueEvent),
        debounceTime.call(
          filter.call(observable, (event) => !(event instanceof events.ChangeRefValueEvent)),
          delay,
        ),
      );
    }

    this.subscription = observable.subscribe(() => this.forceUpdate());
  }

  render() {
    const { render, args } = this.props;

    return render(...args as []);
  }
}

export default Connect;
