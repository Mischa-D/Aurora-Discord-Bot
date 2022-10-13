const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: 	new SlashCommandBuilder()
		.setName('greetings')
		.setDescription('Greet the bot and it will greet you back'),
	async execute(message, ...args) {
		console.log('successful ping');
		message.reply('Hello World!');
	},
};