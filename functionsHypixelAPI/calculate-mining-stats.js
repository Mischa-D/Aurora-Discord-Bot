const calcXp = require('./calculate-skill-level');
const fetchSkyblockProfile = require('./fetch-skyblock-profile');

async function getMiningStats(name, profile = null) {
	let speed = 0;
	let fortune = 0;
	let pristine = 0;
	let profileData;
	try {
		profileData = await fetchSkyblockProfile(name, profile);

	}
	catch (error) {
		console.error(error);
	}

	const miningLevel = calcXp(profileData['profile']['experience_skill_mining']);
	fortune += miningLevel * 4;
	const hotmData = profileData['profile']['mining_core']['nodes'];

	fortune += sumStatsHotm('fortune', hotmData);
	speed += sumStatsHotm('speed', hotmData);

	console.log(speed, fortune, pristine);

	return (speed, fortune, pristine);
}

// summarizes the gained stats from HotM of one mining stat (for asnchronous execution of all 3 at the same time ig??)
// TODO: Look at situational perks (professional/gemstones will be default, skymall can be included)
function sumStatsHotm(stat, hotmData) {
	let perks;
	let statSum = 0;

	switch (stat) {
	case 'speed':
		// note: professional gives + 50 at level 1
		perks = { 'mining_speed': 20, 'mining_madness': 50, 'professional': 5, 'mining_speed_2': 40 };
		break;
	case 'fortune':
		// note: fortunate gives + 20 at level 1
		perks = { 'mining_fortune': 5, 'mining_madness': 50, 'fortunate': 4, 'mining_fortune_2': 5 };
		break;

	default:
		return 0;
	}

	try {
		Object.keys(hotmData).forEach((perk) => {
			if (perk in perks) {
				statSum += hotmData[perk] * perks[perk];
				if (perk == 'professional') statSum += 50;
				if (perk == 'fortunate') statSum += 20;
			}
		});
	}
	catch (err) {
		console.error(err);
	}

	return statSum;
}

getMiningStats();