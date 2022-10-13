const { SlashCommandBuilder } = require('discord.js');
const dotenv = require('dotenv');

const embedTemplate = require('../create-embed-template');
const fetchSkyblockProfile = require('../functionsHypixelAPI/fetch-skyblock-profile');

const getMiningStats = require('../functionsHypixelAPI/calculate-mining-stats');

dotenv.config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hotm')
		.setDescription('WIP command, I will build on this later')
		.addStringOption(option => option.setName('name').setDescription('your IGN'))
		.addStringOption(option => option.setName('profile').setDescription('the name of your profile')),
	async execute(interaction) {
		const profileData = await fetchSkyblockProfile(interaction);

		let stats = getMiningStats(profileData);

		const text = (profileData['profile']['mining_core']['nodes']);
		const embed = embedTemplate();
		embed.setTitle(`${profileData.userName}'s Heart of the Mountain on profile ${profileData['profileName']}`);
		embed.setDescription('as a worse version of the /mining command of the skyhelper bot this will not be a final feature. It rather serves as a first test command for using the Hypixel skyblock API.');
		let perks = '';
		try {
			Object.keys(text).forEach((key) => {
				perks += `**${key}** \t ${text[key]} \n`;
			});
			embed.addFields({ name: 'Perks', value: perks });
		}
		catch (err) {
			if (err instanceof RangeError) {
				embed.addFields({ name: 'Perks', value: 'no active perks' });
			}
			else {
				console.error(err);
			}
		}
		stats = await stats;
		console.log(stats);
		embed.addFields({ name: 'Stats', value: `Mining speed: ${stats['Mining Speed']}, Mining fortune: ${stats['Mining Fortune']}, Pristine: ${stats['Pristine']}` });


		await interaction.reply({ embeds: [embed] });
	},
};
