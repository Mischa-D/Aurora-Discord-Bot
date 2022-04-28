const { SlashCommandBuilder } = require('@discordjs/builders');
const createEmbedTemplate = require('../create-embed-template');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mining_profits')
		.setDescription('calculates how much you would earn per hour from NPC selling gemstones under optimal conditions')
		.addIntegerOption(option => option.setName('mining_speed').setDescription('mining speed shown in your stats + professional').setRequired(true))
		.addIntegerOption(option => option.setName('mining_fortune').setDescription('mining fortune shown in your stats + jungle amulet and fortunate').setRequired(true))
		.addNumberOption(option => option.setName('pristine').setDescription('pristine as shown in your stats').setRequired(true)),
	async execute(interaction) {
		// should be replaced by variable values later, (value of jade for testing)
		const block_hardness = 3200;
		const pristine = interaction.options.getNumber('pristine');
		const mining_speed = interaction.options.getInteger('mining_speed');
		const mining_fortune = interaction.options.getInteger('mining_fortune');

		// calculate ticks needed per block with respect to the softcap of 4 ticks
		// TODO: instabreaking
		let ticks_per_block = Math.max(block_hardness * 30 / mining_speed, 4);
		let ticks_mining_speed_boost = Math.max(block_hardness * 30 / (mining_speed * 4), 4);

		// add 4 ticks to account for human response time and ping
		ticks_per_block = Number(ticks_per_block.toFixed(0)) + 4;
		ticks_mining_speed_boost = Number(ticks_mining_speed_boost.toFixed(0)) + 3;

		// calculate stats
		const blocks = ((20 * 3600) / ((ticks_per_block * 100 / 120) + (ticks_mining_speed_boost * 20 / 120))).toFixed(0);
		const base_drops = (blocks * 4.5).toFixed(0);
		const fortune_drops = (1 + mining_fortune / 100) * base_drops;
		const pristine_drops = 80 * fortune_drops * (pristine / 100);
		const total = pristine_drops + (1 - pristine / 100) * fortune_drops;

		// output
		const embed = createEmbedTemplate();
		embed.setTitle('Mining Profits');
		embed.setDescription('This doesnt work with instabreaking yet, values represent jade (or other gemstones with the same breaking power) when sold to NPC\n');

		let text = '';
		text += `\t - mine ${blocks} blocks\n`;
		text += `\t - assuming the average base drop from blocks is 4.5: have ${blocks * 4.5} chances to activate Pristine\n`;
		text += `\t - get ${(fortune_drops / (80 * 80)).toFixed(1)} Fine Gemstones if there was no Pristine\n`;
		text += `\t - get ${(pristine_drops / (80 * 80)).toFixed(1)} Fine Gemstones from Pristine alone\n`;
		text += `\t - get a total of ${(total / (80 * 80)).toFixed(1)} Fine Gemstones\n\n`;
		embed.addFields(
			{ name: 'In 1h you could:', value: text },
			{ name: `**worth ${(total * 0.0192 / (80 * 80)).toFixed(2)}M when sold to the NPC!**`, value: '\u200B' }
		);

		interaction.reply({ embeds: [embed] });
	},
};