const calcXp = require('./calculate-skill-level');
const getInventoryData = require('../functionsHypixelAPI/parse-nbt');
const getStats = require('../functionsHypixelAPI/getStatsFromLore');
const petXpPerLevel = require('../databases/petExpPerLevel');

async function getMiningStats(profileData, bal = false) {
	console.log('accumulating mining stats...');
	let speed = 0;
	let fortune = 0;
	let pristine = 0;

	// sum mining stats of best mining gear in posession
	const bestGear = await findBestMiningGear(profileData);
	Object.keys(bestGear).forEach(itemType => {
		const bestGearStats = bestGear[itemType].stats || { 'Mining Fortune': 0, 'Mining Speed': 0, 'Pristine': 0 };
		fortune += bestGearStats['Mining Fortune'];
		speed += bestGearStats['Mining Speed'];
		pristine += bestGearStats['Pristine'];
	});

	// get mining related accessories
	// HACK: Counts duplicate accessories
	const miningAccessories = await getInventoryData(profileData.profile.talisman_bag || {}, (item) => ['JUNGLE', 'TITANIUM', 'POWER', 'MINERAL'].includes(item.id.split('_')[0]));
	let stats;
	miningAccessories.forEach(accessory => {
		if (accessory.id.split('_')[0] == 'JUNGLE') {
			fortune += 10;
		}
		else if (accessory.id.split('_')[0] == 'TITANIUM') {
			switch (accessory.id.split('_')[1]) {
			case 'TALISMAN':
				speed += 15;
				break;
			case 'RING':
				speed += 30;
				break;
			case 'ARTIFACT':
				speed += 45;
				break;
			case 'RELIC':
				speed += 60;
				break;

			default:
				break;
			}
		}
		else if (accessory.id == 'MINERAL_TALISMAN') {
			fortune += 3;
		}
		else {
			stats = getStats(accessory);
		}
	});
	stats = await stats || { 'Mining Fortune': 0, 'Mining Speed': 0, 'Pristine': 0 };
	speed += stats['Mining Speed'] || 0;
	fortune += stats['Mining Fortune'] || 0;
	pristine += stats['Pristine'] || 0;

	// get mining stats from potions/temporary effects
	if ((profileData.profile.temp_stat_buffs || []).filter(cake => cake.key == 'cake_mining_fortune')) fortune += 5;

	const spelunker = profileData.profile.active_effects.filter(effect => effect.effect == 'spelunker');
	const haste = profileData.profile.active_effects.filter(effect => effect.effect == 'haste');
	fortune += spelunker.length > 0 ? spelunker[0].level * 5 : 0;
	speed += haste.length > 0 ? haste[0].level * 50 : 0;

	// get mining fortune from mining level
	const miningLevel = calcXp(profileData['profile']['experience_skill_mining']);
	fortune += miningLevel * 4;

	// get mining stats from pet
	const petType = bal ? 'BAL' : 'SCATHA';
	const petSelection = profileData.profile.pets.filter(pet => pet.type == petType);
	// find best pet of specified type
	const petStats = { 'Mining Speed': 0, 'Mining Fortune': 0, 'Level': 0 };
	petSelection.forEach(pet => {
		// for bal pets only legendary tier is relevant
		if (bal) {
			if (pet.tier == 'LEGENDARY') {
				petStats.Level = Math.max(calcXp(pet.exp, petXpPerLevel['LEGENDARY']), petStats.Level);
				if (pet.heldItem == 'PET_ITEM_QUICK_CLAW') {
					petStats['Mining Speed'] = Math.floor(petStats.Level / 2);
					petStats['Mining Fortune'] = Math.floor(petStats.Level / 2);
				}
			}
		}
		// find best rarity pet for scathas
		else {
			let score;
			switch (pet.tier) {
			case 'RARE':
				score = 3;
				break;
			case 'EPIC':
				score = 4;
				break;
			case 'LEGENDARY':
				score = 5;
				break;

			default:
				break;
			}
			const level = calcXp(pet.exp, petXpPerLevel[Object.keys(petXpPerLevel)[score - 1]]);
			let petSpeed = level;
			let petFortune = level * (score > 3 ? 1.25 : 1);
			// check for quick claw
			if (pet.heldItem == 'PET_ITEM_QUICK_CLAW') {
				petSpeed += Math.floor(level / 2);
				petFortune += Math.floor(level / 2);
			}
			petStats['Mining Speed'] = Math.max(petSpeed, petStats['Mining Speed']);
			petStats['Mining Fortune'] = Math.max(petFortune, petStats['Mining Fortune']);
		}
	});
	speed += petStats['Mining Speed'];
	fortune += petStats['Mining Fortune'];

	if (bal) {
		speed *= 1 + petStats.Level * 0.0015;
		fortune *= 1 + petStats.Level * 0.0015;
	}


	// get hotm mining stats
	const hotmData = profileData['profile']['mining_core']['nodes'];
	fortune += sumStatsHotm('fortune', hotmData);
	speed += sumStatsHotm('speed', hotmData);

	console.log('stats calculated:', speed, fortune, pristine);

	return { 'Mining Speed': Math.round(speed), 'Mining Fortune': Math.round(fortune), 'Pristine': pristine };
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
	inventories.push(...await getInventoryData(profileData.profile.inv_armor, isMiningGear));
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