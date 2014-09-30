function proc(promise, x) {
	if (promise.thenable === x) {
		promise.state.reject(new TypeError());
		return;
	}
	if (x instanceof Thenable) {
		x.then(function (x) {
			promise.state.resolve(x);
		}, function (e) {
			promise.state.reject(e);
		});
		return;
	}
	if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
		var then
		, called = false
		;
		try {
			then = x.then;
			if (typeof then === 'function') {
				then.call(x, function (y) {
					if (!called) {
						called = true;
						promise.state.resolve(y);
					}
				}, function (r) {	
					if (!called) {
						called = true;
						promise.state.reject(r);
					}
				});
			} else {
				promise.state.fulfill(x);
			}
		} catch (e) {
			if (called) {
			} else {
				called = true;
				promise.state.reject(e);
			}

		}
		return;
	}
	promise.state.fulfill(x);
}
function Promise() {
	this.thenable = new Thenable(this);
	this.deferred = new Deferred(this);
	this.chain = new Chain(this);
	this.state = new State(this);
}
function Defer() {
	return new Promise().deferred;
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
			this.resolveChain();
		},
		reject: function (e) {
			this.state = 'rejected';
			this.value = e;
			this.resolveChain();
		},
		resolveChain: function () {
			var tmp = [];
			this.promise.chain.flushing = true;
			while (this.promise.chain.length) {
				while (this.promise.chain.length) {
					tmp[tmp.length] =
						this.promise.chain.pop();
				}
				while (tmp.length) {
				var next = tmp.pop();
				try {
					if (this.state === 'rejected') {
						if (typeof next.onRejected === 'function') {
							var p = next.onRejected.call(void 0, this.value);
							next.nextPromise.state.resolve(p);
						} else {
							next.nextPromise.state.reject(this.value);
						}
					} else {
						if (typeof next.onFulfilled === 'function') {
							p = next.onFulfilled.call(void 0, this.value);
							next.nextPromise.state.resolve(p);
						} else {
							next.nextPromise.state.resolve(this.value);
						}
					}
					} catch (e) {
						next.nextPromise.state.reject(e);
					}
				}
			}
			this.promise.chain.flushing = false;
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
			nextPromise: nextPromise
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
	var chain = [];
	
	chain.push = function () {
		var args = Array.prototype.slice.call(arguments);

		Array.prototype.push.apply(this, args);
		if (promise.state.state !== 'pending') {
			if (promise.chain.flushing) {
			} else {
			promise.state.resolveChain();
			}
		}
	};
	
	return chain;
}
module.exports = Defer;
