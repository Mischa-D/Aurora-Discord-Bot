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

	client.on('interactionCreate', async interaction => {
		if (!interaction.isCommand()) return;

		const command = client.commands.get(interaction.commandName);

		if (!command) return;

		try {
			console.log('--------');
			console.log(`User ${interaction.user.tag} used command ${interaction.commandName}`);
			await command.execute(interaction);
		}
		catch (error) {
			console.error(error);
			if (error.message[0] == '!') {
				await interaction.reply({ content: error.message.slice(1), ephemeral: true });
			}
			else {
				await interaction.reply({ content: 'Uh Oh! Something went wrong.', ephemeral: true });
			}
		}
	});
};