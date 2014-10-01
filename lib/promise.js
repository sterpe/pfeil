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
