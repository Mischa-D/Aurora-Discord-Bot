const getFiles = require('../get-files');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('prints a list of all available commands'),
	async execute(interaction) {
		let text = '';

		const commandFiles = getFiles('./commands');
		console.log(commandFiles);
		for (const commandFile of commandFiles) {
			const tem = '.' + commandFile;
			const command = require(tem);
			text += `**${command.data.name}** \t-\t ${command.data.description}\n\n`;
		}

		interaction.reply(`${text}`);
	},
};