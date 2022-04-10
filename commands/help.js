const getFiles = require('../get-files');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('prints a list of all available commands'),
	async execute(message) {
		let text = '';

		const commandFiles = getFiles('./commands');
		console.log(commandFiles);
		for (const command of commandFiles) {
			const tem = '.' + command;
			const commandFile = require(tem);
			text += `**${commandFile.name}** \t-\t ${commandFile.description}\n\n`;
		}

		message.reply(`${text}`);
	},
};