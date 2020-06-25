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
import { filter } from 'rxjs/operators/filter'
import { debounceTime } from 'rxjs/operators/debounceTime'

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
      observable = observable.pipe(
        filter(
          (event) => event instanceof events.ChangeRefStateEvent || event instanceof events.ChangeRefValueEvent
        )
      )
    } else if (observeMode === 'fieldMutation') {
      observable = observable.pipe(
        filter(
          (event) => event instanceof events.ChangeRefValueEvent
        )
      )
    } else if (observeMode === 'fieldState') {
      observable = observable.pipe(
        filter(
          (event) => event instanceof events.ChangeRefStateEvent
        )
      )
    } else if (observeMode === 'validation') {
      observable = observable.pipe(
        filter(
          (event) => event instanceof events.BeforeValidationEvent || event instanceof events.AfterValidationEvent
        )
      )
    } else if (observeMode === 'validationAfter') {
      observable = observable.pipe(
        filter(
          (event) => event instanceof events.AfterValidationEvent
        )
      )
    } else if (observeMode === 'validationBefore') {
      observable = observable.pipe(
        filter(
          (event) => event instanceof events.BeforeValidationEvent
        )
      )
    }

    if (observe.length) {
      observable = observable.pipe(
        filter(
          (event) => !!observe.find((attr) => attr === (event as any).path)
        )
      )
    }

    if (delay) {
      observable = merge(
        observable.pipe(
          filter((event) => event instanceof events.ChangeRefValueEvent)
        ),
        observable.pipe(
          filter((event) => !(event instanceof events.ChangeRefValueEvent)),
          debounceTime(
            delay
          )
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
