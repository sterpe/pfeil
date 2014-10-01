var Promise = require('./lib/promise')
;
module.exports = function () {
	return new Promise().deferred;
};
