const { spawn } = require('child_process');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mining_times')
		.setDescription('Get the amount of ticks needed to mine a block type with different mining speeds')
		.addStringOption(option => option.setName('block').setDescription('Block Type or Block Hardness').setRequired(true)),
	async execute(interaction) {
		const block = interaction.options.getString('block');
		console.log(block);
		const child_python = spawn('python', ['./commands/mining_clusters.py', `${block}`]);
		child_python.stdout.on('data', (data) => {
			interaction.reply(`${data}`);
		});
		child_python.stderr.on('data', (data) => {
			console.log(`${data}`);
		});
		child_python.on('close', (code) => {
			if (code == 6) {
				interaction.reply(`Couldn't find a block with that name!\n 
				Make sure you spelled it correctly and try filling out 
				spaces with underscores.`);
			}
			else if (code != 0) {
				interaction.reply('Uh oh! Something went wrong.');
			}
		});
	},
};