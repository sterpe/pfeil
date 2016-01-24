/* @flow */

const Promise = require('./src/promise')
const Deferred = require('./src/deferred') // eslint-disable-line no-unused-vars
const Thenable = require('./src/thenable') // eslint-disable-line no-unused-vars

/* ::
  type F = {
    done: Array<boolean>,
    value: Array<any>,
    error: Array<number>
  }
*/

const memoize = function (promise/* : Thenable */, flags/* : F */, test/* : Function */) {
  const i /* : number */ = flags.done.length
  const flag /* : boolean */ = false

  const setFlag = function () {
    flags.done[i] = !flag
    test()
  }

  flags.done[i] = flag

  promise.then(function (x) {
    flags.value[i] = x
    flags.error[i] = 0
    setFlag()
    return x
  }, function (e) {
    flags.value[i] = e
    flags.error[i] = 1
    setFlag()
    throw e
  })
}
module.exports = {
  'when': function (promise/* : Array<Thenable> */) /* : Thenable */ {
    const deferred = this.defer()
    const flags = {
      done: [],
      value: [],
      error: []
    }
    let i = 0

    function testFlags () {
      let i = 0
      for (; i < flags.done.length; ++i) {
        if (!flags.done[i]) {
          return
        }
      }
      for (i = 0; i < flags.error.length; ++i) {
        if (flags.error[i]) {
          return deferred.reject(flags.value[i])
        }
      }
      deferred.resolve(flags.value)
    }

    for (; i < promise.length; i++) {
      memoize(promise[i], flags, testFlags)
    }

    testFlags()

    return deferred.promise
  },
  'defer': function () /* : Deferred */ {
    return new Promise().deferred
  }
}
