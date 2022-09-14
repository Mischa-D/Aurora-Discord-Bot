const dotenv = require('dotenv');
const https = require('https');

const mojangAPI = require('mojang-promise-api');
const api = new mojangAPI();

dotenv.config();

module.exports = fetchSkyblockProfile;

// returns a specific or chosen by choose-profile.js profile of the inputted player in the form
// {'profileName': <profile name>, 'profile': <data of the requested player on that profile>}
async function fetchSkyblockProfile(name, fruit = null) {

	// fetch uuid of given MC account
	// const uuid will have format {id: <uuid>, name: <IGN>}
	let uuid = await api.nameToUuid(name);
	console.log(uuid);
	uuid = uuid[0];
	console.log(`fetched uuid ${uuid.id} belonging to account ${uuid.name}`);

	// get HypixelAPI data of that player
	const url = `https://api.hypixel.net/skyblock/profiles?key=${process.env.HYPIXEL_API_KEY}&uuid=${uuid.id}`;
	const data = await getAPIData(url);

	// choose the right skyblock profile
	const profileIndex = await chooseProfile(JSON.parse(data), fruit);
	const ret = { 'profileName':JSON.parse(data)['profiles'][profileIndex]['cute_name'], 'profile': JSON.parse(data)['profiles'][profileIndex]['members'][uuid.id] };
	console.log(ret['profileName']);

	return ret;
}

async function getAPIData(url) {
	try {
		return await new Promise((resolve, reject) => {
			https.get(url, (response) => {
				let data = '';
				response.on('data', (chunk) => {
					data += chunk;
				});

				response.on('end', () => {
					if (JSON.parse(data)['success'] == false) {
						console.error(JSON.parse(data)['cause']);
						reject(new Error('Something went wrong!'));
					}
					else if (JSON.parse(data)['success'] == true && JSON.parse(data)['profiles'] == null) {
						console.error('Player hasnt played skyblock');
						reject(new Error('That player has no Skyblock profiles'));
					}
					else {
						resolve(data);
					}
				}).on('error', () => {
					console.log('Error: No valid API response');
				});
			});
		});
	}
	catch (error) {
		// TODO: How do I get this error to be catched in hotm.js?
		console.log(error);
	}
}


// finds the profile with name <fruit> if given, else chooses a profile based on a certain metric
// currently it simply takes the first profile in the array
// TODO: better metric
async function chooseProfile(profileData, fruit = null) {
	let profileNumber = 0;

	for (const [index, profile] of profileData['profiles'].entries()) {
		if (typeof fruit === 'string' && profile['cute_name'].toUpperCase() != fruit.toUpperCase()) continue;
		else if (typeof fruit === typeof null && profile['last_save'] < profileData['profiles'][profileNumber]['last_save']) continue;
		profileNumber = index;
	}
	return profileNumber;
}