var Thenable = require('./thenable')
, next_tick =  require('./next-tick')
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
				next_tick(function () {
					promise.state.resolve(x);
				});
			}
		},
		reject: function (e) {
			if (! called) {
				called = true;
				next_tick(function () {
					promise.state.reject(e);
				});
			}
		}
	};
};
