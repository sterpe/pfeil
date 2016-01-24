/* @flow */

const Promise = require('./promise') // eslint-disable-line no-unused-vars
const Thenable = require('./thenable')

module.exports = function (promise/* : Promise */, x/* : any */)/* : void */ {
  const onFulfilled = function (y) {
    if (!called) {
      called = true
      promise.state.resolve(y)
    }
  }
  const onRejected = function (r) {
    if (!called) {
      called = true
      promise.state.reject(r)
    }
  }

  let called = false
  let then

  if (promise.thenable === x) {
    promise.state.reject(new TypeError())
    return
  }
  if (x instanceof Thenable) {
    x['then'](onFulfilled, onRejected)
    return
  }
  if ((typeof x === 'object' && x !== null) ||
      typeof x === 'function'
  ) {
    try {
      then = x['then']
      if (typeof then === 'function') {
        then.call(x, onFulfilled, onRejected)
      } else {
        promise.state.fulfill(x)
      }
    } catch (e) {
      if (!called) {
        called = true
        promise.state.reject(e)
      }
    }
    return
  }
  promise.state.fulfill(x)
}
