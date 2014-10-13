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
