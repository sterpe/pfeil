var Thenable = require('./thenable')
;
module.exports = function (promise, x) {
	var then
	, called = false
	, onFulfilled = function (y) {
		if (!called) {
			called = true;
			promise.state.resolve(y);
		}
	}
	, onRejected = function (r) {
		if (!called) {
			called = true;
			promise.state.reject(r);
		}
	}
	;
	if (promise.thenable === x) {
		promise.state.reject(new TypeError());
		return;
	}
	if (x instanceof Thenable) {
		x["then"](onFulfilled, onRejected);
		return;
	}
	if ((typeof x === 'object' && x !== null) ||
			typeof x === 'function'
	) {
		try {
			then = x["then"];
			if (typeof then === 'function') {
				then.call(x, onFulfilled, onRejected);
			} else {
				promise.state.fulfill(x);
			}
		} catch (e) {
			if (!called) {
				called = true;
				promise.state.reject(e);
			}

		}
		return;
	}
	promise.state.fulfill(x);
};
