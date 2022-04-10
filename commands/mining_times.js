const { spawn } = require('child_process');

module.exports = {
	name: 'mining_times',
	description: 'Get the amount of ticks needed to mine blocks with different mining speeds',
	execute(message, ...args) {
		console.log(args);
		const child_python = spawn('python', ['./commands/mining_clusters.py', `${args[0]}`]);
		child_python.stdout.on('data', (data) => {
			message.reply(`${data}`);
		});
		child_python.stderr.on('data', (data) => {
			console.log(`${data}`);
		});
		child_python.on('close', (code) => {
			if (code == 6) {
				message.reply(`Couldn't find a block with that name!\n 
				Make sure you spelled it correctly and try filling out 
				spaces with underscores.`);
			}
			else if (code != 0) {
				message.reply('Uh oh! Something went wrong.');
			}
		});
	},
};