const Discord = require('discord.js');
const token = require('./config.json');

const client = new Discord.Client({
	intents: ['GUILDS', 'GUILD_MESSAGES'],
});


client.once('ready', () => {
	console.log('Bot online');
});

client.on('ready', () => {
	const handler = require('./command-handler');
	handler(client);
});

client.login(token.token);