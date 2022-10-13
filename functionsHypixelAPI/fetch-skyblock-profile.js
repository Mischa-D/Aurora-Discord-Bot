const dotenv = require('dotenv');

const mojangAPI = require('mojang-promise-api');
const api = new mojangAPI();
const getAPIData = require('../functionsHypixelAPI/access-api');

dotenv.config();

module.exports = fetchSkyblockProfile;

// returns a specific or chosen by choose-profile.js profile of the inputted player in the form
// {'userName': <player Name>, 'profileName': <profile name>, 'profile': <data of the requested player on that profile>}
async function fetchSkyblockProfile(interaction) {
	// use inputted name or discord nickname if not provided
	const user = await interaction.guild.members.fetch(interaction.user);
	const name = interaction.options.getString('name') || user.nickname;
	const fruit = interaction.options.getString('profile') || null;

	// fetch uuid of given MC account
	// uuid will have format {id: <uuid>, name: <IGN>}
	try {
		let uuid = await api.nameToUuid(name);
		uuid = uuid[0];
		console.log(`fetched uuid ${uuid.id} belonging to account ${uuid.name}`);

		// get HypixelAPI data of that player
		const url = `https://api.hypixel.net/skyblock/profiles?key=${process.env.HYPIXEL_API_KEY}&uuid=${uuid.id}`;
		const data = await getAPIData(url);
		if (JSON.parse(data)['profiles'] == null) {
			throw new Error('!That player has no Skyblock profiles');
		}

		// choose the right skyblock profile
		const profileIndex = await chooseProfile(JSON.parse(data), uuid.id, fruit);
		const ret = { 'userName': name, 'profileName':JSON.parse(data)['profiles'][profileIndex]['cute_name'], 'profile': JSON.parse(data)['profiles'][profileIndex]['members'][uuid.id] };
		console.log(`selected Profile ${ret['profileName']}`);

		return ret;
	}
	catch (error) {
		if (error.message[0] == '!') {
			throw error;
		}
		else {
			console.error(error);
			throw new Error(`!Couldn't find a user with the name '${name}'`);
		}
	}
}


// finds the profile with name <fruit> if given, else chooses a profile based on a certain metric
// get profile with highest skill xp sum
async function chooseProfile(profileData, player, fruit = null) {
	let profileNumber = 0;

	for (const [index, profile] of profileData['profiles'].entries()) {
		if (typeof fruit === 'string' && profile['cute_name'].toUpperCase() != fruit.toUpperCase()) continue;
		else if (!(await moarSkillz(profile.members[player], profileData['profiles'][profileNumber].members[player]))) continue;
		profileNumber = index;
	}
	return profileNumber;
}

// return true if <compare> has more total skill xp than <previousBest>
async function moarSkillz(compare, previousBest) {
	let compareValue = 0;
	const skills = ['farming', 'mining', 'combat', 'foraging', 'fishing', 'enchanting', 'alchemy', 'carpentry', 'taming'];
	skills.forEach(element => {
		const skill = 'experience_skill_' + element;
		compareValue += compare[skill] || 0 - previousBest[skill] || 0;
	});
	return compareValue > 0;
}