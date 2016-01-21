/* @flow */
const Promise = require('./promise') // eslint-disable-line no-unused-vars
const Thenable = require('./thenable')
const next_tick = require('./next-tick')

class Deferred {
  /* ::
    promise: Thenable;
    resolve: Function;
    reject: Function;
  */
  constructor (promise /* : Promise */) {
    let called/* : boolean */ = false

    promise.thenable = new Thenable(promise)

    this.promise = promise.thenable
    this.resolve = function (x/* : any */) {
      if (!called) {
        called = true
        next_tick(function () {
          promise.state.resolve(x)
        })
      }
    }
    this.reject = function (e/* : Class<Error> */) {
      if (!called) {
        called = true
        next_tick(function () {
          promise.state.reject(e)
        })
      }
    }
  }
}

module.exports = Deferred
