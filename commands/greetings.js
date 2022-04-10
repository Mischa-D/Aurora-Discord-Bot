module.exports = {
	name: 'greetings',
	description: 'Greet the bot and it will greet you back',
	execute(message, ...args) {
		console.log(args);
		message.reply('Hello World!');
	},
};