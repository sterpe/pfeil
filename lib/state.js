var proc = require('./proc')
;

module.exports = function (promise) {
	return {
		promise: promise,
		value: undefined,
		state: 'pending',
		resolve: function (x) {
			proc(this.promise, x);
		},
		fulfill: function (x) {
			this.state = 'fulfilled';
			this.value = x;
			this.promise.chain.flush();
		},
		reject: function (e) {
			this.state = 'rejected';
			this.value = e;
			this.promise.chain.flush();
		}
	};
};
