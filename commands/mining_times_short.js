module.exports = {
	name: 'mt',
	description: 'Get the amount of ticks needed to mine blocks with different mining speeds',
	execute(message, ...args) {
		const mt = require('./mining_times');

		mt.execute(message, ...args);
	},
};