const { SlashCommandBuilder } = require('@discordjs/builders');
const dotenv = require('dotenv');
const https = require('https');
const mojangAPI = require('mojang-api');

const embedTemplate = require('../create-embed-template');

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
		try {
			mojangAPI.nameToUuid(name, getResponse);
		}
		// TODO: why the hell does mojangAPI call cb.error for some errors and throws an error for others,
		// but never uses the <err> parameter they require?
		catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!' + error.message, ephemeral: true });
		}

		// get response and print it to console
		function getResponse(err, res) {
			const url = `https://api.hypixel.net/skyblock/profiles?key=${process.env.HYPIXEL_API_KEY}&uuid=${res[0].id}`;

			https.get(url, (response) => {
				let data = '';
				response.on('data', (chunk) => {
					data += chunk;
				});

				response.on('end', () => {
					const profileFruit = interaction.options.getString('profile-name');
					let profileNumber = 0;
					for (const [index, profile] of JSON.parse(data)['profiles'].entries()) {
						if (profile['cute_name'] != profileFruit) continue;
						profileNumber = index;
					}
					const text = (JSON.parse(data)['profiles'][profileNumber]['members'][res[0].id]['mining_core']['nodes']);
					const embed = embedTemplate();
					embed.setTitle(`${name}'s Heart of the Mountain on profile ${JSON.parse(data)['profiles'][profileNumber]['cute_name']}`);
					embed.setDescription('as a worse version of the /mining command of the skyhelper bot this will not be a final feature. It rather serves as a first test command for using the Hypixel skyblock API.');
					let perks = '';
					Object.keys(text).forEach((key) => {
						perks += `**${key}** \t ${text[key]} \n`;
					});
					embed.addField('Perks', perks);

					interaction.reply({ embeds: [embed] });
				});

			}).on('error', (err) => {
				console.log(`Error: ${err.message}`);
			});
		}
	},
};
