const Discord = require('discord.js');

const createEmbedTemplate = () => {
	const embed = new Discord.MessageEmbed()
		.setColor('#3837b9')
		.setTimestamp()
		.setFooter({ text: 'Lagopus#4584', iconURL: 'https://i.imgur.com/mQ4hMwD.jpeg' });

	return embed;
};

module.exports = createEmbedTemplate;