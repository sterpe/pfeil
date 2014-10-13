!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.pfeil=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Promise = require('./lib/promise')
, window = require('./lib/window')
;

module.exports = function () {
	return new Promise().deferred;
};

if (window) {
	window["pfeil"] = {
		"defer": module.exports
	};
}

},{"./lib/promise":6,"./lib/window":9}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
var Thenable = require('./thenable')
, next_tick =  require('./next-tick')
, deferred
;

module.exports = function (promise) {
	var called = false
	;

	promise.thenable = new Thenable(promise);

	return {
		"promise": promise.thenable,
		"resolve": function (x) {
			if (!called) {
				called = true;
				next_tick(function () {
					promise.state.resolve(x);
				});
			}
		},
		"reject": function (e) {
			if (! called) {
				called = true;
				next_tick(function () {
					promise.state.reject(e);
				});
			}
		}
	};
};

},{"./next-tick":4,"./thenable":8}],4:[function(require,module,exports){
module.exports = require('asap');

},{"asap":10}],5:[function(require,module,exports){
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

},{"./thenable":8}],6:[function(require,module,exports){
var Deferred = require('./deferred')
, State = require('./state')
, Chain = require('./chain')
;
function Promise() {
	this.deferred = new Deferred(this);
	this.state = new State(this);
	this.chain = new Chain(this);
}
module.exports = Promise

},{"./chain":2,"./deferred":3,"./state":7}],7:[function(require,module,exports){
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

},{"./proc":5}],8:[function(require,module,exports){
module.exports = function Thenable(promise) {
	var Promise = promise["__proto__"].constructor;
	this["then"] = function(onFulfilled, onRejected) {
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

},{}],9:[function(require,module,exports){
module.exports = 'undefined' !== typeof window ? window : void 0;

},{}],10:[function(require,module,exports){

// Use the fastest possible means to execute a task in a future turn
// of the event loop.

// linked list of tasks (single, with head node)
var head = {task: void 0, next: null};
var tail = head;
var flushing = false;
var requestFlush = void 0;
var isNodeJS = false;

function flush() {
    /* jshint loopfunc: true */

    while (head.next) {
        head = head.next;
        var task = head.task;
        head.task = void 0;
        var domain = head.domain;

        if (domain) {
            head.domain = void 0;
            domain.enter();
        }

        try {
            task();

        } catch (e) {
            if (isNodeJS) {
                // In node, uncaught exceptions are considered fatal errors.
                // Re-throw them synchronously to interrupt flushing!

                // Ensure continuation if the uncaught exception is suppressed
                // listening "uncaughtException" events (as domains does).
                // Continue in next event to avoid tick recursion.
                if (domain) {
                    domain.exit();
                }
                setTimeout(flush, 0);
                if (domain) {
                    domain.enter();
                }

                throw e;

            } else {
                // In browsers, uncaught exceptions are not fatal.
                // Re-throw them asynchronously to avoid slow-downs.
                setTimeout(function() {
                   throw e;
                }, 0);
            }
        }

        if (domain) {
            domain.exit();
        }
    }

    flushing = false;
}

if (typeof process !== "undefined" && process.nextTick) {
    // Node.js before 0.9. Note that some fake-Node environments, like the
    // Mocha test runner, introduce a `process` global without a `nextTick`.
    isNodeJS = true;

    requestFlush = function () {
        process.nextTick(flush);
    };

} else if (typeof setImmediate === "function") {
    // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
    if (typeof window !== "undefined") {
        requestFlush = setImmediate.bind(window, flush);
    } else {
        requestFlush = function () {
            setImmediate(flush);
        };
    }

} else if (typeof MessageChannel !== "undefined") {
    // modern browsers
    // http://www.nonblocking.io/2011/06/windownexttick.html
    var channel = new MessageChannel();
    channel.port1.onmessage = flush;
    requestFlush = function () {
        channel.port2.postMessage(0);
    };

} else {
    // old browsers
    requestFlush = function () {
        setTimeout(flush, 0);
    };
}

function asap(task) {
    tail = tail.next = {
        task: task,
        domain: isNodeJS && process.domain,
        next: null
    };

    if (!flushing) {
        flushing = true;
        requestFlush();
    }
};

module.exports = asap;


},{}]},{},[1])(1)
});