const { Collection } = require('discord.js');
const getFiles = require('./get-files');

module.exports = (client) => {
	client.commands = new Collection();

	const commandFiles = getFiles('./commands');
	console.log(commandFiles);
	for (const commandFile of commandFiles) {
		const command = require(commandFile);
		client.commands.set(command.data.name, command);
	}

	console.log(client.commands);

	client.on('interactionCreate', async interaction => {
		if (!interaction.isCommand()) return;

		const command = client.commands.get(interaction.commandName);

		if (!command) return;

		try {
			console.log(`User ${interaction.user} used command ${interaction.commandName}`);
			await command.execute(interaction);
		}
		catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	});
};