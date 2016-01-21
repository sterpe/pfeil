/* @flow */

const Promise = require("./src/promise")
const Deferred = require("./src/deferred") // eslint-disable-line no-unused-vars
const Thenable = require("./src/thenable") // eslint-disable-line no-unused-vars
const isArray /* : ((x: any) => boolean) */ = require("lodash.isarray")

module.exports = {
  "foo": function (promise /* : Thenable | Array<Thenable> */) /* : Thenable */ {
    const deferred = this.defer()

    if (isArray(promise)) {
    }
    return deferred.promise
  },
  "defer": function () /* : Deferred */ {
    return new Promise().deferred
  }
}
