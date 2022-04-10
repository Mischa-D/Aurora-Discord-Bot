const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const getFiles = require('./get-files');
const { clientId, guildId, token } = require('./config.json');

const commands = [];

const commandFiles = getFiles('./commands');

for (const file of commandFiles) {
	const command = require(`${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);