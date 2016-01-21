/* @flow */

const Promise = require('./src/promise')
const Deferred = require('./src/deferred') // eslint-disable-line no-unused-vars
const Thenable = require('./src/thenable') // eslint-disable-line no-unused-vars
const isArray /* : ((x: any) => boolean) */ = require('lodash.isarray')

module.exports = {
  'when': function (promise /* : Thenable | Array<Thenable> */) /* : Thenable */ {
    const deferred = this.defer()

    return deferred.promise
  },
  'defer': function () /* : Deferred */ {
    return new Promise().deferred
  }
}
