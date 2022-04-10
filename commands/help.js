const getFiles = require('../get-files');

module.exports = {
	name: 'help',
	description: 'prints a list of all available commands',
	execute(message) {
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