/* @flow */

const Promise = require('./src/promise')
const Deferred = require('./src/deferred') // eslint-disable-line no-unused-vars
const Thenable = require('./src/thenable') // eslint-disable-line no-unused-vars

module.exports = {
  'defer': function () /* : Deferred */ {
    return new Promise().deferred
  }
}
