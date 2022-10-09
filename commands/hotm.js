const { SlashCommandBuilder } = require('@discordjs/builders');
const dotenv = require('dotenv');

const embedTemplate = require('../create-embed-template');
const fetchSkyblockProfile = require('../functionsHypixelAPI/fetch-skyblock-profile');

dotenv.config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hotm')
		.setDescription('WIP command, I will build on this later')
		.addStringOption(option => option.setName('minecraft-name').setDescription('your IGN'))
		.addStringOption(option => option.setName('profile-name').setDescription('the name of your profile')),
	async execute(interaction) {
		// get uuid based on inputted minecraft name
		const name = interaction.options.getString('minecraft-name');
		const profileFruit = interaction.options.getString('profile-name');

		let profileData;
		try {
			profileData = await fetchSkyblockProfile(name, profileFruit);

		}
		catch (error) {
			console.error(error);
			console.log(profileData);
		}

		if (profileData == null) {
			throw new Error('That player has never played skyblock before.');
		}
		const text = (profileData['profile']['mining_core']['nodes']);
		const embed = embedTemplate();
		embed.setTitle(`${name}'s Heart of the Mountain on profile ${profileData['profileName']}`);
		embed.setDescription('as a worse version of the /mining command of the skyhelper bot this will not be a final feature. It rather serves as a first test command for using the Hypixel skyblock API.');
		let perks = '';
		try {
			Object.keys(text).forEach((key) => {
				perks += `**${key}** \t ${text[key]} \n`;
			});
			embed.addField('Perks', perks);
		}
		catch (err) {
			if (err instanceof RangeError) {
				embed.addField('Perks', 'no active perks');
			}
			else {
				console.error(err);
			}
		}

		await interaction.reply({ embeds: [embed] });
	},
};
