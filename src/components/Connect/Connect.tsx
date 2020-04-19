/**
 *
 * Connect
 *
 */

import React, { PureComponent, ReactNode } from 'react'
import isEqual from 'lodash/isEqual'
import { events } from 'rjv'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'
import { merge } from 'rxjs/observable/merge'
import { filter } from 'rxjs/operator/filter'
import { debounceTime } from 'rxjs/operator/debounceTime'
import { ProviderContext, ProviderContextValue } from '../Provider'

export type ObserveMode =
  'any'
  | 'field'
  | 'fieldMutation'
  | 'fieldState'
  | 'validation'
  | 'validationBefore'
  | 'validationAfter'

type PropsPartial = {
  render: (...args: any[]) => ReactNode,
  observe?: string[], // should be a list of the absolute paths
  observeMode?: ObserveMode,
  debounce?: number,
  args?: any[]
}

type Props = PropsPartial & {
  providerContext?: ProviderContextValue
}

class Connect extends PureComponent<Props> {
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
      props.providerContext,
      props.observe,
      props.observeMode,
      props.debounce
    )
  }

  componentDidUpdate (prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any): void {
    if (
      this.props.providerContext !== prevProps.providerContext ||
      !isEqual(this.props.observe, prevProps.observe) ||
      this.props.debounce !== prevProps.debounce ||
      this.props.observeMode !== prevProps.observeMode
    ) {
      this.connect(
        this.props.providerContext,
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
   * @param {Ref} providerContext
   * @param {((string | number)[])[]} observe
   * @param {ObserveMode} observeMode
   * @param {number} delay
   */
  connect (providerContext, observe, observeMode, delay) {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }

    let observable: Observable<events.Event>

    // todo check shape
    if (providerContext && providerContext.model) {
      observable = providerContext.model.observable
    } else {
      throw new Error('Received invalid providerContext')
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
    const { render, providerContext } = this.props
    const args = this.props.args || []

    return render(...args, (providerContext as ProviderContextValue).model)
  }
}

export default (props: PropsPartial) => (
  <ProviderContext.Consumer>
    {(providerContext) => <Connect {...props} providerContext={providerContext} />}
  </ProviderContext.Consumer>
)
