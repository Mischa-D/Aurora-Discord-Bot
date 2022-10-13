const { SlashCommandBuilder } = require('discord.js');
const createEmbedTemplate = require('../create-embed-template');
const fetchProfile = require('../functionsHypixelAPI/fetch-skyblock-profile');
const calcStats = require('../functionsHypixelAPI/calculate-mining-stats');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mining_profits')
		.setDescription('calculates how much you would earn per hour from NPC selling gemstones under optimal conditions')
		.addSubcommand(subcommand => subcommand.setName('profile').setDescription('automatically fetch mining stats')
			.addStringOption(option => option.setName('name').setDescription('your IGN'))
			.addStringOption(option => option.setName('profile').setDescription('the name of your profile'))
			.addBooleanOption(option => option.setName('bal').setDescription('specify if you want to use bal, else scatha will be used'))
			.addIntegerOption(option => option.setName('block').setDescription('type of gemstone you want to mine')
				.addChoices(
					{ name: 'Ruby', value: 2500 },
					{ name: 'Jade', value: 3200 },
					{ name: 'Sapphire', value: 3200 },
					{ name: 'Amethyst', value: 3200 },
					{ name: 'Amber', value: 3200 },
					{ name: 'Topaz', value: 4000 },
					{ name: 'Opal', value: 4000 },
					{ name: 'Jasper', value: 5000 },
				)))
		.addSubcommand(subcommand => subcommand.setName('manual').setDescription('put in mining stats yourself')
			.addIntegerOption(option => option.setName('speed').setDescription('mining speed shown in your stats + professional').setRequired(true))
			.addIntegerOption(option => option.setName('fortune').setDescription('mining fortune shown in your stats + jungle amulet and fortunate').setRequired(true))
			.addNumberOption(option => option.setName('pristine').setDescription('pristine as shown in your stats').setRequired(true))
			.addIntegerOption(option => option.setName('block').setDescription('type of gemstone you want to mine')
				.addChoices(
					{ name: 'Ruby', value: 2500 },
					{ name: 'Jade', value: 3200 },
					{ name: 'Sapphire', value: 3200 },
					{ name: 'Amethyst', value: 3200 },
					{ name: 'Amber', value: 3200 },
					{ name: 'Topaz', value: 4000 },
					{ name: 'Opal', value: 4000 },
					{ name: 'Jasper', value: 5000 },
				))),

	async execute(interaction) {
		let mining_speed;
		let mining_fortune;
		let pristine;
		if (interaction.options.getSubcommand() == 'profile') {
			const profileData = await fetchProfile(interaction);
			const stats = await calcStats(profileData, interaction.options.getBoolean('bal') || false);
			mining_speed = stats['Mining Speed'];
			mining_fortune = stats['Mining Fortune'];
			pristine = stats['Pristine'];
		}
		else {
			// should be replaced by variable values later, (value of jade for testing)
			pristine = interaction.options.getNumber('pristine');
			mining_speed = interaction.options.getInteger('speed');
			mining_fortune = interaction.options.getInteger('fortune');
		}

		const block_hardness = 3200;
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
		text += `\t - mine \`${blocks}\` blocks\n`;
		text += `\t - assuming the average base drop from blocks is 4.5: have \`${blocks * 4.5}\` chances to activate Pristine\n`;
		text += `\t - get \`${(fortune_drops / (80 * 80)).toFixed(1)}\` Fine Gemstones if there was no Pristine\n`;
		text += `\t - get \`${(pristine_drops / (80 * 80)).toFixed(1)}\` Fine Gemstones from Pristine alone\n`;
		text += `\t - get a total of \`${(total / (80 * 80)).toFixed(1)}\` Fine Gemstones\n\n`;
		embed.addFields(
			{ name: 'Stats', value: `Mining speed  \`${mining_speed}\`\nMining fortune \`${mining_fortune}\`\nPristine       \`${pristine}\`` },
			{ name: 'In 1h you could:', value: text },
			{ name: `**worth ${(total * 0.0192 / (80 * 80)).toFixed(2)}M when sold to the NPC!**`, value: '\u200B' },
		);

		await interaction.reply({ embeds: [embed] });
	},
};