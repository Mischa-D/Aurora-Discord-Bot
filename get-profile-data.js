const dotenv = require('dotenv');
const https = require('https');
const mojangAPI = require('mojang-api');

dotenv.config();

module.exports = (name, profile_name) => {
	// get uuid based on inputted minecraft name
	try {
		mojangAPI.nameToUuid(name, getResponse);
	}
	// TODO: why the hell does mojangAPI call cb.error for some errors and throws an error for others,
	// but never uses the <err> parameter they require?
	catch (error) {
		console.error(error);
		throw new Error('couldn\'t find a player with that name');
	}

	// get response
	function getResponse(err, res) {
		const url = `https://api.hypixel.net/skyblock/profiles?key=${process.env.HYPIXEL_API_KEY}&uuid=${res[0].id}`;

		https.get(url, (response) => {
			let data = '';
			response.on('data', (chunk) => {
				data += chunk;
			});

			response.on('end', () => {
				const profileFruit = profile_name;
				if (JSON.parse(data)['profiles'] == null) {
					throw new Error(`Player ${name} doesn't have any Skyblock profiles`);
				}
				for (const [, profile] of JSON.parse(data)['profiles'].entries()) {
					if (profile['cute_name'] != profileFruit) continue;
					return (profile['members'][res[0].id], profileFruit);
				}
			});

		}).on('error', (err) => {
			console.log(`Error: ${err.message}`);
		});
	}
};
