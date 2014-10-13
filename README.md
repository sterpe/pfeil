pfeil
=====

A decently fastish, minimalistic [Promises/A+]( https://promisesaplus.com/) implementation in under 4Kb.

###API###

####pfeil.defer()####

Returns a `deferred` object, comprised of a `promise` and `resolve`/`reject` methods that operate on that promise.

####{deferred}.resolve(value)####

Resolve `{deferred}.promise` with `value`.

####{deferred}.reject(reason)####

Reject `{deferred}.promise` with `reason`.

####{deferred}.promise.then(onFulfilled, onRejected)####

Add `onFulfilled`/`onRejected` handlers that will be called when the promise resolves.

These should take the form: `function (x|e) {}` where x|e is either the promise's value or rejection reason.

That's basically it.  Promises/A+ compliant.
