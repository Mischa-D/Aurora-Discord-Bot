const { REST } = require('discord.js');
const { Routes } = require('discord-api-types/v9');
const getFiles = require('./get-files');
const dotenv = require('dotenv');
dotenv.config();

const commands = [];

const commandFiles = getFiles('./commands');

for (const file of commandFiles) {
	const command = require(`${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
throw new Error('change guild ID');

/* rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
*/