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
const assign = require('object-assign')
const Promise = require('./promise') // eslint-disable-line no-unused-vars

function ChainFactory (promise/* : Promise */)/* : Chain */ {
  return assign([], {
    flushing: false,

    reject: function (nextPromise/* : Promise */) {
      const onRejected = nextPromise.onRejected
      const self = promise.state

      let p

      if (typeof onRejected === 'function') {
        p = onRejected.call(void 0, self.value) // eslint-disable-line no-useless-call
        nextPromise.promise.state.resolve(p)
      } else {
        nextPromise.promise.state.reject(self.value)
      }
    },
    resolve: function (nextPromise/* : Promise */) {
      const onFulfilled = nextPromise.onFulfilled
      const self = promise.state

      let p

      if (typeof onFulfilled === 'function') {
        p = onFulfilled.call(void 0, self.value) // eslint-disable-line no-useless-call
        nextPromise.promise.state.resolve(p)
      } else {
        nextPromise.promise.state.resolve(self.value)
      }
    },
    evaluate: function (nextPromise/* : Promise */) {
      const self = promise.state
      try {
        if (self.state === 'rejected') {
          this.reject(nextPromise/* : Promise */)
        } else {
          this.resolve(nextPromise/* : Promise */)
        }
      } catch (e) {
        nextPromise.promise.state.reject(e)
      }
    },
    flush: function () {
      const tmp = []

      this.flushing = true

      while (this.length) {
        while (this.length) {
          tmp[tmp.length] = this.pop()
        }
        while (tmp.length) {
          this.evaluate(tmp.pop())
        }
      }
      this.flushing = false
    },

    push: function (element/* : any */)/* : number */ {
      const args = Array.prototype.slice.call(arguments)
      const self = promise.state

      Array.prototype.push.apply(this, args)

      if (self.state !== 'pending') {
        if (!this.flushing) {
          this.flush()
        }
      }
      return this.length
    }

  })
}

module.exports = ChainFactory
