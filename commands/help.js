const getFiles = require('../get-files');
const embedTemplate = require('../create-embed-template');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('prints a list of all available commands'),
	async execute(interaction) {
		const embed = embedTemplate();
		embed.setTitle('Available commands');

		const commandFiles = getFiles('./commands');
		for (const commandFile of commandFiles) {
			const tem = '.' + commandFile;
			const command = require(tem);
			// print out options
			let title = '';
			for (const option of command.data.options) {
				title += ` [${option.name}] `;
			}
			embed.addField(`/${command.data.name} ${title}`, `${command.data.description}`);
		}

		interaction.reply({ embeds: [embed] });
	},
};