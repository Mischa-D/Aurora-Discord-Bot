const Discord = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();

const client = new Discord.Client({
	intents: ['Guilds', 'GuildMessages'],
});


client.once('ready', () => {
	console.log('Bot online');
	console.log(`serving on ${client.guilds.cache.size} servers`);
	client.guilds.cache.forEach(guild => {
		guild.fetchOwner().then((guildOwner) => {
			console.log(guild.name, guildOwner.user.username);
		});
	});

});

client.on('ready', () => {
	const handler = require('./command-handler');
	handler(client);
});

client.login(process.env.TOKEN);