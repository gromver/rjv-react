/**
 *
 * Connect
 *
 */

import { PureComponent, ReactNode } from 'react'
import isEqual from 'lodash/isEqual'
import { events, Model } from 'rjv'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'
import { merge } from 'rxjs/observable/merge'
import { filter } from 'rxjs/operator/filter'
import { debounceTime } from 'rxjs/operator/debounceTime'

export type ObserveMode =
  'any'
  | 'field'
  | 'fieldMutation'
  | 'fieldState'
  | 'validation'
  | 'validationBefore'
  | 'validationAfter'

type Props = {
  render: (...args: any[]) => ReactNode,
  model: Model,
  observe?: string[], // should be a list of the absolute paths
  observeMode?: ObserveMode,
  debounce?: number,
  args?: any[]
}

export default class Connect extends PureComponent<Props> {
  static TICK = 33

  static defaultProps = {
    debounce: Connect.TICK,
    observe: [],
    observeMode: 'all'
  }

  private subscription: Subscription

  constructor (props: Props) {
    super(props)

    this.connect(
      props.model,
      props.observe,
      props.observeMode,
      props.debounce
    )
  }

  componentDidUpdate (prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any): void {
    if (
      this.props.model !== prevProps.model ||
      !isEqual(this.props.observe, prevProps.observe) ||
      this.props.debounce !== prevProps.debounce ||
      this.props.observeMode !== prevProps.observeMode
    ) {
      this.connect(
        this.props.model,
        this.props.observe,
        this.props.observeMode,
        this.props.debounce
      )
    }
  }

  componentWillUnmount () {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  /**
   * Connect to the target
   * @param {Model} model
   * @param {string[]} observe
   * @param {ObserveMode} observeMode
   * @param {number} delay
   */
  connect (model, observe, observeMode, delay) {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }

    let observable: Observable<events.Event>

    if (model instanceof Model) {
      observable = model.observable
    } else {
      throw new Error('Connect - Rjv model should be provided')
    }

    if (observeMode === 'field') {
      observable = filter.call(
        observable,
        (event) => event instanceof events.ChangeRefStateEvent || event instanceof events.ChangeRefValueEvent
      )
    } else if (observeMode === 'fieldMutation') {
      observable = filter.call(
        observable,
        (event) => event instanceof events.ChangeRefValueEvent
      )
    } else if (observeMode === 'fieldState') {
      observable = filter.call(
        observable,
        (event) => event instanceof events.ChangeRefStateEvent
      )
    } else if (observeMode === 'validation') {
      observable = filter.call(
        observable,
        (event) => event instanceof events.BeforeValidationEvent || event instanceof events.AfterValidationEvent
      )
    } else if (observeMode === 'validationAfter') {
      observable = filter.call(
        observable,
        (event) => event instanceof events.AfterValidationEvent
      )
    } else if (observeMode === 'validationBefore') {
      observable = filter.call(
        observable,
        (event) => event instanceof events.BeforeValidationEvent
      )
    }

    if (observe.length) {
      observable = filter.call(
        observable,
        (event) => !!observe.find((attr) => attr === event.path)
      )
    }

    if (delay) {
      observable = merge(
        filter.call(observable, (event) => event instanceof events.ChangeRefValueEvent),
        debounceTime.call(
          filter.call(observable, (event) => !(event instanceof events.ChangeRefValueEvent)),
          delay
        )
      )
    }

    this.subscription = observable.subscribe(() => this.forceUpdate())
  }

  render () {
    const { render, model } = this.props
    const args = this.props.args || []

    return render(...args, model)
  }
}
