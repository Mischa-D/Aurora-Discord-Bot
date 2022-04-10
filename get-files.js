const fs = require('fs');

const getFiles = (dir) => {
	const commandFiles = fs.readdirSync(dir, { withFileTypes: true });
	let commands = [];

	for (const file of commandFiles) {
		if (file.isDirectory()) {
			commands = [
				...commands,
				...getFiles(`${dir}/${file.name}`),
			];
		}
		else if (file.name.endsWith('.js')) {
			commands.push(`${dir}/${file.name}`);
		}
	}

	return commands;
};

module.exports = getFiles;