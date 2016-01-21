/* @flow */
const Promise = require('./promise') // eslint-disable-line no-unused-vars
const proc = require('./proc')

class State {
  /* ::
    promise: Promise;
    value: any;
    state: string;
  */
  constructor (promise /* : Promise */) {
    this.promise = promise
    this.value = undefined
    this.state = 'pending'
  }
  resolve (x /* : any */) /* : void */ {
    proc(this.promise, x)
  }
  fulfill (x /* : any */) /* : void */ {
    this.state = 'fulfilled'
    this.value = x
    this.promise.chain.flush()
  }
  reject (e /* : any */) /* : void */ {
    this.state = 'rejected'
    this.value = e
    this.promise.chain.flush()
  }
}

module.exports = State
