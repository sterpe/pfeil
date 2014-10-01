module.exports = function Thenable(promise) {
	var Promise = promise["__proto__"].constructor;
	this.then = function(onFulfilled, onRejected) {
		var nextPromise = new Promise()
		;
		promise.chain.push({
			onFulfilled: onFulfilled,
			onRejected: onRejected,
			promise: nextPromise
		});
		return nextPromise.thenable;
	};
};
