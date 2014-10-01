var Thenable = require('./thenable.js')
, tick = setTimeout
, deferred
;

module.exports = function (promise) {
	var called = false
	;

	promise.thenable = new Thenable(promise);

	return {
		promise: promise.thenable,
		resolve: function (x) {
			if (!called) {
				called = true;
				tick(function () {
					promise.state.resolve(x);
				}, 0);
			}
		},
		reject: function (e) {
			if (! called) {
				called = true;
				tick(function () {
					promise.state.reject(e);
				});
			}
		}
	};
};
