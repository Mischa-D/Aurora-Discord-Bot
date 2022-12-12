const { SlashCommandBuilder } = require('discord.js');
const createEmbedTemplate = require('../create-embed-template');
const fetchProfile = require('../functionsHypixelAPI/fetch-skyblock-profile');
const calcStats = require('../functionsHypixelAPI/calculate-mining-stats');
const getAPIData = require('../functionsHypixelAPI/access-api');

const { 'ores': { 'gemstones': gemstones } } = require('../databases/blockData');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mining_profits')
		.setDescription('calculates how much you would earn per hour from NPC selling gemstones under optimal conditions')
		.addSubcommand(subcommand => subcommand.setName('profile').setDescription('automatically fetch mining stats')
			.addStringOption(option => option.setName('name').setDescription('your IGN'))
			.addStringOption(option => option.setName('profile').setDescription('the name of your profile'))
			.addBooleanOption(option => option.setName('bal').setDescription('specify if you want to use bal, else scatha will be used'))
			.addBooleanOption(option => option.setName('blue_cheese').setDescription('use blue cheese goblin omelet?'))
			.addStringOption(option => option.setName('block').setDescription('type of gemstone you want to mine')
				.addChoices(
					{ name: 'Ruby', value: 'Ruby' },
					{ name: 'Jade', value: 'Jade' },
					{ name: 'Sapphire', value: 'Sapphire' },
					{ name: 'Amethyst', value: 'Amethyst' },
					{ name: 'Amber', value: 'Amber' },
					{ name: 'Topaz', value: 'Topaz' },
					{ name: 'Opal', value: 'Opal' },
					{ name: 'Jasper', value: 'Jasper' },
				)))
		.addSubcommand(subcommand => subcommand.setName('manual').setDescription('put in mining stats yourself')
			.addIntegerOption(option => option.setName('speed').setDescription('mining speed shown in your stats + professional').setRequired(true))
			.addIntegerOption(option => option.setName('fortune').setDescription('mining fortune shown in your stats + jungle amulet and fortunate').setRequired(true))
			.addNumberOption(option => option.setName('pristine').setDescription('pristine as shown in your stats').setRequired(true))
			.addBooleanOption(option => option.setName('blue_cheese').setDescription('use blue cheese goblin omelet?'))
			.addStringOption(option => option.setName('block').setDescription('type of gemstone you want to mine')
				.addChoices(
					{ name: 'Ruby', value: 'Ruby' },
					{ name: 'Jade', value: 'Jade' },
					{ name: 'Sapphire', value: 'Sapphire' },
					{ name: 'Amethyst', value: 'Amethyst' },
					{ name: 'Amber', value: 'Amber' },
					{ name: 'Topaz', value: 'Topaz' },
					{ name: 'Opal', value: 'Opal' },
					{ name: 'Jasper', value: 'Jasper' },
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

		const blockName = interaction.options.getString('block') || 'Jade';
		const block_hardness = gemstones[blockName];
		// calculate ticks needed per block with respect to the softcap of 4 ticks
		// TODO: instabreaking
		let ticks_per_block = Math.max(block_hardness * 30 / mining_speed, 4);
		let ticks_mining_speed_boost = Math.max(block_hardness * 30 / (mining_speed * 4), 4);
		let duration_mining_speed_boost = 20;

		// use upgraded mining speed boost from blue cheese goblin omelette
		if (interaction.options.getBoolean('blue_cheese')) {
			ticks_mining_speed_boost = Math.max(block_hardness * 30 / (mining_speed * 5), 4);
			duration_mining_speed_boost = 25;
		}

		// add 4 ticks to account for human response time and ping
		ticks_per_block = Number(ticks_per_block.toFixed(0)) + 4;
		ticks_mining_speed_boost = Number(ticks_mining_speed_boost.toFixed(0)) + 2;

		// calculate stats
		const blocks = ((20 * 3600) / (ticks_per_block * ((120 - duration_mining_speed_boost) / 120) + (ticks_mining_speed_boost * duration_mining_speed_boost / 120))).toFixed(0);
		const base_drops = (blocks * 4.5).toFixed(0);
		const fortune_drops = (1 + mining_fortune / 100) * base_drops;
		const pristine_drops = 80 * fortune_drops * (pristine / 100);
		const total = pristine_drops + (1 - pristine / 100) * fortune_drops;

		// calculate (instant) sell price, assuming tax = 1.125% (account upgrade bazaar flipper I (free))
		const id = 'FINE_' + blockName.toUpperCase() + '_GEM';
		let sellPrice;
		try {
			const bazaarData = await getAPIData('https://api.hypixel.net/skyblock/bazaar');
			sellPrice = Math.max(19200, JSON.parse(bazaarData).products[id].quick_status.sellPrice * 0.98875) / 1000000;
			console.log(sellPrice);
		}
		catch (error) {
			if (error.message[0] == '!') {
				throw error;
			}
			else {
				console.error(error);
				throw new Error(`!Couldn't find an item with id '${id}'`);
			}
		}


		// output
		const embed = createEmbedTemplate();
		embed.setTitle('Mining Profits');
		embed.setDescription('This doesnt work with instabreaking yet, works with any gemstone block (defaults to jade)\n Automatically selects more profitable sell option (NPC/Bazaar).');

		let text = '';
		text += `\t - mine \`${blocks}\` blocks\n`;
		text += `\t - assuming the average base drop from blocks is 4.5: have \`${blocks * 4.5}\` chances to activate Pristine\n`;
		text += `\t - get \`${(fortune_drops / (80 * 80)).toFixed(1)}\` Fine Gemstones if there was no Pristine\n`;
		text += `\t - get \`${(pristine_drops / (80 * 80)).toFixed(1)}\` Fine Gemstones from Pristine alone\n`;
		text += `\t - get a total of \`${(total / (80 * 80)).toFixed(1)}\` Fine Gemstones\n\n`;

		embed.addFields(
			{ name: 'Stats', value: `Mining speed  \`${mining_speed}\`\nMining fortune \`${mining_fortune}\`\nPristine       \`${pristine}\`` },
			{ name: 'Block', value: `${blockName} (Hardness \`${block_hardness}\`)` },
			{ name: 'In 1h you could:', value: text },
			{ name: `**worth ${(total * (sellPrice || 0.0192) / (80 * 80)).toFixed(2)}M when sold to ${sellPrice > 0.0192 ? 'Bazaar' : 'the NPC'}!**`, value: '\u200B' },
		);

		await interaction.reply({ embeds: [embed] });
	},
};