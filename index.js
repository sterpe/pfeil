var Promise = require('./lib/promise')
;

module.exports = {
	"defer": function () {
		return new Promise().deferred;
	}
};
