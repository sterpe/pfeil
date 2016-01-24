/* @flow */
const Promise = require('./promise') // eslint-disable-line no-unused-vars

class Thenable {
  /* ::
    then: (onFulfilled: Function, onRejected: Function) => Thenable;
  */
  constructor (promise /* : Promise */) {
    this.then = function (onFulfilled/* : Function */, onRejected /* : Function */) /* : Thenable */ {
      const Promise = require('./promise')
      const next = new Promise()

      promise.chain.push({
        onFulfilled,
        onRejected,
        promise: next
      })

      return next.thenable
    }
  }
}

module.exports = Thenable
