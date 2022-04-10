const Discord = require('discord.js');
const config = require('config.json');

const client = new Discord.Client({
	intents: ['GUILDS', 'GUILD_MESSAGES'],
});


client.once('ready', () => {
	console.log('this is the only thing it does');
});

client.on('ready', () => {
	const handler = require('./command-handler');
	handler(client);
});

client.login(config.token);