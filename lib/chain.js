module.exports = function (promise) {
	var chain = []
	;
	
	chain.flushing = false;

	chain.reject = function (nextPromise) {
		var p
		, self = promise.state
		, onRejected = nextPromise.onRejected
		;
		if (typeof onRejected === 'function') {
			p = onRejected.call(void 0, self.value);
			nextPromise.promise.state.resolve(p);
		} else {
			nextPromise.promise.state.reject(self.value);
		}
	};
	chain.resolve = function (nextPromise) {
		var p
		, self = promise.state
		, onFulfilled = nextPromise.onFulfilled
		;
		if (typeof onFulfilled === 'function') {
			p = onFulfilled.call(void 0, self.value);
			nextPromise.promise.state.resolve(p);
		} else {
			nextPromise.promise.state.resolve(self.value);
		}
	};
	chain.evaluate = function (nextPromise) {
		var self = promise.state
		try {
			if (self.state === 'rejected') {
				this.reject(nextPromise);
			} else {
				this.resolve(nextPromise);
			}
		} catch (e) {
			nextPromise.promise.state.reject(e);
		}
	};
	chain.flush = function () {
		var tmp = []
		;
		
		this.flushing = true;
		
		while(this.length) {
			while (this.length) {
				tmp[tmp.length] = this.pop();
			}
			while (tmp.length) {
				this.evaluate(tmp.pop());
			}
		}
		this.flushing = false;
	};

	chain.push = function () {
		var args = Array.prototype.slice.call(arguments)
		, self = promise.state
		;

		Array.prototype.push.apply(this, args);

		if (self.state !== 'pending') {
			if (!this.flushing) {
				this.flush();
			}
		}
	};
	
	return chain;
};
