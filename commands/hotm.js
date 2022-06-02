const { SlashCommandBuilder } = require('@discordjs/builders');
const dotenv = require('dotenv');

const embedTemplate = require('../create-embed-template');
const profileData = require('../get-profile-data');

dotenv.config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hotm')
		.setDescription('WIP command, I will build on this later')
		.addStringOption(option => option.setName('minecraft-name').setDescription('your IGN'))
		.addStringOption(option => option.setName('profile-name').setDescription('the name of your profile')),
	async execute(interaction) {
		const embed = embedTemplate();
		const name = interaction.options.getString('minecraft-name');
		let profile, cute_name;

		try {
			profile, cute_name = profileData(name, interaction.options.getString('profile-name'));
		}
		catch (err) {
			console.error(err);
			embed.setTitle('Something went wrong!');
			embed.setDescription(err.message);
			interaction.reply({ embeds: [embed] });
		}

		const text = profile['mining_core']['nodes'];
		embed.setTitle(`${name}'s Heart of the Mountain on profile ${cute_name}`);
		embed.setDescription('as a worse version of the /mining command of the skyhelper bot this will not be a final feature. It rather serves as a first test command for using the Hypixel skyblock API.');
		let perks = '';
		Object.keys(text).forEach((key) => {
			perks += `**${key}** \t ${text[key]} \n`;
		});
		embed.addField('Perks', perks);

		interaction.reply({ embeds: [embed] });
	},
};
