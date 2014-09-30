function proc(promise, x) {
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
		x.then(onFulfilled, onRejected);
		return;
	}
	if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
		try {
			then = x.then;
			if (typeof then === 'function') {
				then.call(x, onFulfilled, onRejected);
			} else {
				promise.state.fulfill(x)	;
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
}

function State(promise) {
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
}

function Thenable(promise) {
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
}

function Deferred(promise) {
	var called = false
	;
	return {
		promise: promise.thenable,
		resolve: function (x) {
			if (!called) {
				called = true;
			setTimeout(function () {
				promise.state.resolve(x);
			}, 0);
			}
		},
		reject: function (e) {
			if (! called) {
				called = true;
			setTimeout(function () {
				promise.state.reject(e);
			});
			}
		}
	};
}

function Chain(promise) {
	var chain = []
	, self = promise.state
	;
	
	chain.flushing = false;

	chain.flush = function () {
		var tmp = []
		, next
		, onRejected
		, onFulfilled
		,p
		;
		this.flushing = true;
		while (this.length) {
			while (this.length) {
				tmp[tmp.length] = this.pop();
			}
			while (tmp.length) {
				next = tmp.pop();
				onRejected = next.onRejected;
				onFulfilled = next.onFulfilled;
				try {
					if (self.state === 'rejected') {
						if (typeof onRejected === 'function') {
							p = onRejected.call(void 0, self.value);
							next.promise.state.resolve(p);
						} else {
							next.promise.state.reject(self.value);
						}
					} else {
						if (typeof onFulfilled === 'function') {
							p = onFulfilled.call(void 0, self.value);
							next.promise.state.resolve(p);
						} else {
							next.promise.state.resolve(self.value);
						}
					}
				} catch (e) {
					next.promise.state.reject(e);
				}
			}
		}
		this.flushing = false;
	};

	chain.push = function () {
		var args = Array.prototype.slice.call(arguments);

		Array.prototype.push.apply(this, args);

		if (self.state !== 'pending') {
			if (!this.flushing) {
				this.flush();
			}
		}
	};
	
	return chain;
}

function Promise() {
	this.thenable = new Thenable(this);
	this.deferred = new Deferred(this);
	this.state = new State(this);
	this.chain = new Chain(this);
}

module.exports = function () {
	return new Promise().deferred;
};
