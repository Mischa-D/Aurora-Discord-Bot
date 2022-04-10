const getFiles = require('./get-files');

module.exports = (client) => {
	const commands = {};
	const prefix = '&';

	const commandFiles = getFiles('./commands');
	console.log(commandFiles);
	for (const command of commandFiles) {
		const commandFile = require(command);
		commands[commandFile.name.toLowerCase()] = commandFile;
	}

	console.log(commands);

	client.on('messageCreate', message => {
		if (!message.content.startsWith(prefix) || message.author.bot) return;

		const args = message.content.slice(prefix.length).split(/ +/);
		const command = args.shift().toLowerCase();

		if (!commands[command]) return;

		commands[command].execute(message, ...args);
	});
};