const calcXp = require('./calculate-skill-level');
const getInventoryData = require('../functionsHypixelAPI/parse-nbt');
const getStats = require('../functionsHypixelAPI/getStatsFromLore');

async function getMiningStats(profileData) {
	console.log('accumulating mining stats...');
	let speed = 0;
	let fortune = 0;
	let pristine = 0;

	// get mining fortune from mining level
	const miningLevel = calcXp(profileData['profile']['experience_skill_mining']);
	fortune += miningLevel * 4;

	// get hotm mining stats
	const hotmData = profileData['profile']['mining_core']['nodes'];
	fortune += sumStatsHotm('fortune', hotmData);
	speed += sumStatsHotm('speed', hotmData);

	// sum mining stats of best mining gear in posession
	const bestGear = await findBestMiningGear(profileData);
	Object.keys(bestGear).forEach(itemType => {
		if (bestGear[itemType] != {}) {
			fortune += bestGear[itemType].stats['Mining Fortune'];
			speed += bestGear[itemType].stats['Mining Speed'];
			pristine += bestGear[itemType].stats['Pristine'];
		}
	});

	console.log(speed, fortune, pristine);

	return { 'Mining speed': speed, 'Mining fortune': fortune, 'Pristine': pristine };
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


async function findBestMiningGear(profileData) {
	console.log('crawling inventories for mining gear');
	// accumulate mining gear
	const inventories = await getInventoryData(profileData.profile.ender_chest_contents || {}, isMiningGear);
	inventories.push(... await getInventoryData(profileData.profile.inv_contents || {}, isMiningGear));
	Object.keys(profileData.profile.backpack_contents || {}).forEach(async backpack => {
		const backpackContent = await getInventoryData(profileData.profile.backpack_contents[backpack], isMiningGear);
		inventories.push(...backpackContent);
	});
	inventories.push(... await getInventoryData(profileData.profile.personal_vault_contents || {}, isMiningGear));
	inventories.push(...await getInventoryData(profileData.profile.wardrobe_contents, isMiningGear));
	inventories.push(...await getInventoryData(profileData.profile.equippment_contents, isMiningGear));


	// find best gear out of all mining related gear
	const bestGear = { 'PICKAXE': {}, 'HELMET': {}, 'CHESTPLATE': {}, 'LEGGINGS': {}, 'BOOTS': {},
		'GLOVES': {}, 'BELT':{}, 'CLOAK': {}, 'NECKLACE': {} };
	inventories.forEach(async (item) => {
		const miningStats = { 'Mining Speed': 0, 'Mining Fortune': 0, 'Pristine': 0 };
		const itemStats = await getStats(item);
		miningStats['Mining Speed'] = itemStats['Mining Speed'] || 0;
		miningStats['Mining Fortune'] = itemStats['Mining Fortune'] || 0;
		miningStats['Pristine'] = itemStats['Pristine'] || 0;
		item['stats'] = miningStats;

		if (hasBetterMiningStats(miningStats, bestGear[item.type]['stats'] ||
		{ 'Mining Speed': 0, 'Mining Fortune': 0, 'Pristine': 0 })) {
			bestGear[item.type] = item;
		}
	});
	return bestGear;
}


// return wether <item> has any mining stats
async function isMiningGear(item) {
	if (['GAUNTLET', 'PICKAXE', 'DRILL'].includes(item.type)) {
		item.type = 'PICKAXE';
		return true;
	}
	else if (['HELMET', 'CHESTPLATE', 'LEGGINGS', 'BOOTS'].includes(item.type)) {
		// check for mining speed (all mining armors have mining speed)
		return Object.keys(await getStats(item)).includes('Mining Speed');
	}
	else if (['GLOVES', 'BELT', 'CLOAK', 'BRACELET', 'NECKLACE'].includes(item.type)) {
		// check for mining fortune (equipment can only have mining fortune)
		if (item.type == 'BRACELET') {
			item.type = 'GLOVEs';
		}
		return Object.keys(await getStats(item)).includes('Mining Fortune');

	}
	return false;
}


// return if <cmpItemStats> make more money from mining than <prevItemstats>
function hasBetterMiningStats(cmpItemStats, prevItemStats) {

	// estimate how good an item with certain stats is
	// TODO: Get a stat formula thats a better heuristic
	if (cmpItemStats['Mining Fortune'] * 2 + cmpItemStats['Mining Speed'] + cmpItemStats['Pristine'] * 80
	>= prevItemStats['Mining Fortune'] * 2 + prevItemStats['Mining Speed'] + prevItemStats['Pristine'] * 80) {
		return true;
	}
	return false;
}

module.exports = getMiningStats;