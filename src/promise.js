/* @flow */
/* ::
  type Chain = ({
    flushing: boolean,
    reject: Function,
    resolve: Function,
    evaluate: Function,
    flush: Function,
    push: Function
  } & Array<Promise>)
*/
const Deferred = require('./deferred')
const State = require('./state')
const ChainFactory = require('./chain')
const Thenable = require('./thenable') // eslint-disable-line no-unused-vars

class Promise {
  /* ::
    deferred: Deferred;
    state: State;
    chain: Chain;
    thenable: Thenable;
  */
  constructor () {
    this.deferred = new Deferred(this)
    this.state = new State(this)
    this.chain = ChainFactory(this)
  }
}

module.exports = Promise
