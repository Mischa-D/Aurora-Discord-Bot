const Discord = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();

const client = new Discord.Client({
	intents: ['Guilds', 'GuildMessages'],
});


client.once('ready', () => {
	console.log('Bot online');
});

client.on('ready', () => {
	const handler = require('./command-handler');
	handler(client);
});

client.login(process.env.TOKEN);