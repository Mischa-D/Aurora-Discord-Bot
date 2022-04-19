const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mining_profits')
		.setDescription('calculates how much you would earn per hour from NPC selling gemstones under optimal conditions')
		.addIntegerOption(option => option.setName('mining_speed').setDescription('mining speed shown in your stats + professional').setRequired(true))
		.addIntegerOption(option => option.setName('mining_fortune').setDescription('mining fortune shown in your stats + jungle amulet and fortunate').setRequired(true))
		.addNumberOption(option => option.setName('pristine').setDescription('pristine as shown in your stats').setRequired(true)),
	async execute(interaction) {
		let text = '';
		text += 'This doesnt work with instabreaking yet, values represent jade (or other gemstones with the same breaking power) when sold to NPC\n';
		text += 'Also mining speed boosts arent taken into account yet.\n';

		// should be replaced by variable values later, (value of jade for testing)
		const block_hardness = 3200;
		const pristine = interaction.options.getNumber('pristine');
		const mining_speed = interaction.options.getInteger('mining_speed');
		const mining_fortune = interaction.options.getInteger('mining_fortune');

		const ticks_per_block = (block_hardness * 30 / mining_speed).toFixed(0);

		// calculate stats
		const blocks = (20 * 3600 / ticks_per_block).toFixed(0);
		const base_drops = (blocks * 4.5).toFixed(0);
		const fortune_drops = (1 + mining_fortune / 100) * base_drops;
		const pristine_drops = 80 * fortune_drops * (pristine / 100);
		const total = pristine_drops + (1 - pristine / 100) * fortune_drops;

		// output
		text += '**In 1h you could:**\n\n';
		text += `\t - mine ${blocks} blocks\n`;
		text += `\t - assuming the average base drop from blocks is 4.5: have ${blocks * 4.5} chances to activate Pristine\n`;
		text += `\t - get ${(fortune_drops / (80 * 80)).toFixed(1)} Fine Gemstones if there was no Pristine\n`;
		text += `\t - get ${(pristine_drops / (80 * 80)).toFixed(1)} Fine Gemstones from Pristine alone\n`;
		text += `\t - get a total of ${(total / (80 * 80)).toFixed(1)} Fine Gemstones\n\n`;
		text += `**worth ${(total * 0.0192 / (80 * 80)).toFixed(2)}M when sold to the NPC!**`;

		interaction.reply(text);
	},
};