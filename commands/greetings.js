const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: 	new SlashCommandBuilder()
		.setName('greetings')
		.setDescription('Greet the bot and it will greet you back'),
	async execute(message, ...args) {
		console.log(args);
		message.reply('Hello World!');
	},
};