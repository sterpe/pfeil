!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.pfeil=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

var Promise = _dereq_('./src/promise');
var Deferred = _dereq_('./src/deferred');
var Thenable = _dereq_('./src/thenable');
var isArray /* : Function */ = _dereq_('lodash.isarray');

module.exports = {
  "when": function when(promise /* : Thenable | Array<Thenable> */) /* : Thenable */{
    var deferred = this.defer();

    return deferred.promise;
  },
  "defer": function defer() /* : Deferred */{
    return new Promise().deferred;
  }
};

},{"./src/deferred":6,"./src/promise":9,"./src/thenable":11,"lodash.isarray":3}],2:[function(_dereq_,module,exports){

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


},{}],3:[function(_dereq_,module,exports){
/**
 * lodash 4.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @type Function
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

module.exports = isArray;

},{}],4:[function(_dereq_,module,exports){
/* eslint-disable no-unused-vars */
'use strict';
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

module.exports = Object.assign || function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (Object.getOwnPropertySymbols) {
			symbols = Object.getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],5:[function(_dereq_,module,exports){
'use strict';

/* ::
	type Chain = ({
		flushing: boolean,
		reject: Function,
		resolve: Function,
		evaluate: Function,
		flush: Function,
		push: Function
	} & Array<Promise>)
*/
var assign = _dereq_('object-assign');
var Promise = _dereq_('./promise');

function ChainFactory(promise /* : Promise */) /* : Chain */{
	return assign([], {
		flushing: false,

		reject: function reject(nextPromise) {
			var p,
			    self = promise.state,
			    onRejected = nextPromise.onRejected;

			if (typeof onRejected === 'function') {
				p = onRejected.call(void 0, self.value);
				nextPromise.promise.state.resolve(p);
			} else {
				nextPromise.promise.state.reject(self.value);
			}
		},
		resolve: function resolve(nextPromise) {
			var p,
			    self = promise.state,
			    onFulfilled = nextPromise.onFulfilled;

			if (typeof onFulfilled === 'function') {
				p = onFulfilled.call(void 0, self.value);
				nextPromise.promise.state.resolve(p);
			} else {
				nextPromise.promise.state.resolve(self.value);
			}
		},
		evaluate: function evaluate(nextPromise) {
			var self = promise.state;
			try {
				if (self.state === 'rejected') {
					this.reject(nextPromise);
				} else {
					this.resolve(nextPromise);
				}
			} catch (e) {
				nextPromise.promise.state.reject(e);
			}
		},
		flush: function flush() {
			var tmp = [];

			this.flushing = true;

			while (this.length) {
				while (this.length) {
					tmp[tmp.length] = this.pop();
				}
				while (tmp.length) {
					this.evaluate(tmp.pop());
				}
			}
			this.flushing = false;
		},

		push: function push() {
			var args = Array.prototype.slice.call(arguments),
			    self = promise.state;

			Array.prototype.push.apply(this, args);

			if (self.state !== 'pending') {
				if (!this.flushing) {
					this.flush();
				}
			}
			return this.length;
		}

	});
}

module.exports = ChainFactory;

},{"./promise":9,"object-assign":4}],6:[function(_dereq_,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Promise = _dereq_('./promise');
var Thenable = _dereq_('./thenable');
var next_tick = _dereq_('./next-tick');

var Deferred =
/* ::
	promise: Thenable;
	resolve: Function;
	reject: Function;
*/
function Deferred(promise /* : Promise */) {
	_classCallCheck(this, Deferred);

	var called /* : boolean */ = false;

	promise.thenable = new Thenable(promise);

	this.promise = promise.thenable;
	this.resolve = function (x /* : any */) {
		if (!called) {
			called = true;
			next_tick(function () {
				promise.state.resolve(x);
			});
		}
	};
	this.reject = function (e /* : Class<Error> */) {
		if (!called) {
			called = true;
			next_tick(function () {
				promise.state.reject(e);
			});
		}
	};
};

module.exports = Deferred;

// module.exports = function (promise) {
// 	var called = false
// 	;
//
// 	promise.thenable = new Thenable(promise);
//
// 	return {
// 		"promise": promise.thenable,
// 		"resolve": function (x) {
// 			if (!called) {
// 				called = true;
// 				next_tick(function () {
// 					promise.state.resolve(x);
// 				});
// 			}
// 		},
// 		"reject": function (e) {
// 			if (! called) {
// 				called = true;
// 				next_tick(function () {
// 					promise.state.reject(e);
// 				});
// 			}
// 		}
// 	};
// };

},{"./next-tick":7,"./promise":9,"./thenable":11}],7:[function(_dereq_,module,exports){
'use strict';

module.exports = _dereq_('asap');

},{"asap":2}],8:[function(_dereq_,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var Promise = _dereq_('./promise');
var Thenable = _dereq_('./thenable');

module.exports = function (promise /* : Promise */, x /* : any */) /* : void */{
	var onFulfilled = function onFulfilled(y) {
		if (!called) {
			called = true;
			promise.state.resolve(y);
		}
	};
	var onRejected = function onRejected(r) {
		if (!called) {
			called = true;
			promise.state.reject(r);
		}
	};

	var called = false;
	var then = undefined;

	if (promise.thenable === x) {
		promise.state.reject(new TypeError());
		return;
	}
	if (x instanceof Thenable) {
		x["then"](onFulfilled, onRejected);
		return;
	}
	if ((typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'object' && x !== null || typeof x === 'function') {
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

},{"./promise":9,"./thenable":11}],9:[function(_dereq_,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* ::
  type Chain = ({
    flushing: boolean,
    reject: Function,
    resolve: Function,
    evaluate: Function,
    flush: Function,
    push: Function
  } & Array<Promise>)
*/
var Deferred = _dereq_('./deferred');
var State = _dereq_('./state');
var ChainFactory = _dereq_('./chain');
var Thenable = _dereq_('./thenable');

var Promise =
/* :: 
  deferred: Deferred;
  state: State;
  chain: Chain;
  thenable: Thenable;
*/
function Promise() {
  _classCallCheck(this, Promise);

  this.deferred = new Deferred(this);
  this.state = new State(this);
  this.chain = ChainFactory(this);
};

module.exports = Promise;

},{"./chain":5,"./deferred":6,"./state":10,"./thenable":11}],10:[function(_dereq_,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Promise = _dereq_('./promise');
var proc = _dereq_('./proc');

var State = function () {
	/* ::
 	promise: Promise;
 	value: any;
 	state: string;
 */

	function State(promise /* : Promise */) {
		_classCallCheck(this, State);

		this.promise = promise;
		this.value = undefined;
		this.state = 'pending';
	}

	_createClass(State, [{
		key: 'resolve',
		value: function resolve(x /* : any */) /* : void */{
			proc(this.promise, x);
		}
	}, {
		key: 'fulfill',
		value: function fulfill(x /* : any */) /* : void */{
			this.state = 'fulfilled';
			this.value = x;
			this.promise.chain.flush();
		}
	}, {
		key: 'reject',
		value: function reject(e /* : any */) /* : void */{
			this.state = 'rejected';
			this.value = e;
			this.promise.chain.flush();
		}
	}]);

	return State;
}();

module.exports = State;

},{"./proc":8,"./promise":9}],11:[function(_dereq_,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Promise = _dereq_('./promise');

var Thenable =
/* ::
	then: Function;
*/
function Thenable(promise /* : Promise */) {
	_classCallCheck(this, Thenable);

	this.then = function (onFulfilled /* : Function */, onRejected /* : Function */) /* : Thenable */{
		var Promise = _dereq_('./promise');
		var next = new Promise();

		promise.chain.push({
			onFulfilled: onFulfilled,
			onRejected: onRejected,
			promise: next
		});

		return next.thenable;
	};
};

module.exports = Thenable;

},{"./promise":9}]},{},[1])(1)
});