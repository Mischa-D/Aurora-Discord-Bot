const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mt')
		.setDescription('Get the amount of ticks needed to mine a block type with different mining speeds'),
	async execute(message, ...args) {
		const mt = require('./mining_times');

		mt.execute(message, ...args);
	},
};