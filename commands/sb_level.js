const { SlashCommandBuilder } = require('@discordjs/builders');
const createEmbedTemplate = require('../create-embed-template');
const calcXp = require('../functionsHypixelAPI/calculate-skill-level');
const fetchSkyblockProfile = require('../functionsHypixelAPI/fetch-skyblock-profile');
const calculatePetScore = require('../functionsHypixelAPI/calculate-pet-score');
const getInventoryData = require('../functionsHypixelAPI/parse-nbt');

const lvl50Skills = require('../databases/lvl50Skills');
const BESTIARYBOSSES = require('../databases/bestiaryBosses');
const MAXSBXP = require('../databases/maxSbXPvalues');
const maxSbXp = require('../databases/maxSbXPvalues');

const AMOUNT_SKYBLOCK_COLLECTIONS = 67;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sb_level')
		.setDescription('calculates a lower estimate of a players skyblock level')
		.addStringOption(option => option.setName('minecraft-name').setDescription('your IGN'))
		.addStringOption(option => option.setName('profile-name').setDescription('the name of your profile')),
	async execute(interaction) {
		const profileData = await fetchSkyblockProfile(interaction);

		const skyblockXP = { 'Skills': 0, 'Bestiary/Boss Kills': 0, 'Slayer': 0, 'Dungeons': 0, 'Collections': 0, 'Minions': 0,
			'Mining': 0, 'Magical Power': 0, 'Trophy Fishing': 0, 'Pet Score': 0, 'Fairy Souls': 0, 'Melody\'s Harp': 0,
			'Dojo': 0 };


		/** ################### SKILLS ################################# */
		// calculate Level for all non-cosmetic skills
		const skills = ['farming', 'mining', 'combat', 'foraging', 'fishing', 'enchanting', 'alchemy', 'carpentry', 'taming'];
		skills.forEach(element => {
			const skill = 'experience_skill_' + element;
			let skillLevel = calcXp(profileData.profile[skill]);

			// ignore overflow xp (max value of calcXp is 60)
			if (lvl50Skills.includes(element)) {
				skillLevel = Math.min(skillLevel, 50);
			}
			if (skillLevel > 50) {
				skyblockXP['Skills'] += 700 + (skillLevel - 50) * 30;
			}
			else if (skillLevel > 25) {
				skyblockXP['Skills'] += 200 + (skillLevel - 25) * 20;
			}
			else if (skillLevel > 10) {
				skyblockXP['Skills'] += 50 + (skillLevel - 10) * 10;
			}
			else {
				skyblockXP['Skills'] += skillLevel * 5;
			}
		});


		/** ################### BESTIARY ################################# */
		let bestiaryTiers = 0;
		Object.keys(profileData.profile.bestiary).forEach(entry => {
			const entryTags = entry.split('_');
			// + 1 level for every 100,000 kills over 100,000
			const KillsPerLevel = [10, 15, 75, 150, 250, 500, 1500, 2500, 5000, 15000, 25000, 50000];

			// + 1 level for every 100 kills over 200
			const bossKillsPerLevel = [2, 3, 5, 10, 10, 10, 10, 25, 25, 50, 50];

			// check if entry is single entry or family
			if (entryTags[0] == 'kills' && entryTags[1] == 'family') {
				let kills = profileData.profile.bestiary[entry];
				let startLinScaling = 100000;
				let linScaling = 100000;
				let levelSheet = KillsPerLevel;

				// determine if entry is boss entry, use different parameters
				if (BESTIARYBOSSES.includes(entryTags.slice(2).join('_'))) {
					startLinScaling = 200;
					linScaling = 100;
					levelSheet = bossKillsPerLevel;
				}
				// bestiary level cap for private island mobs
				else if (['zombie', 'skeleton', 'spider', 'slime', 'witch', 'enderman_private'].includes(entryTags.slice(2).join('_'))) {
					kills = Math.min(kills, 500);
				}
				bestiaryTiers += Math.floor(Math.max(kills - startLinScaling, 0) / linScaling) +
				calcXp(Math.min(kills, startLinScaling), levelSheet);
			}

			// check if entry is arachne or dragon type kills
			else if (entryTags[0] == 'kills') {
				if (entryTags[1] == 'arachne') {
					if (entryTags[2] == '500') {
						skyblockXP['Bestiary/Boss Kills'] += 40;
					}
					else if (entryTags[2] == '300') {
						skyblockXP['Bestiary/Boss Kills'] += 20;
					}
				}
				else if (entryTags[2] == 'dragon') {
					if (entryTags[1] == 'superior') {
						skyblockXP['Bestiary/Boss Kills'] += 50;
					}
					else {
						skyblockXP['Bestiary/Boss Kills'] += 25;
					}
				}
			}
		});
		skyblockXP['Bestiary/Boss Kills'] += bestiaryTiers + Math.floor(bestiaryTiers / 10) * 2;

		// KUUDRA
		const netherData = profileData.profile.nether_island_player_data || {};
		for (let i = 0; i < Object.keys(netherData.kuudra_completed_tiers || {}).length; i++) {
			skyblockXP['Bestiary/Boss Kills'] += (i + 1) * 20;
		}


		/** ################### SLAYER ################################# */
		// calculate Skyblock xp from all slayers
		const slayerData = profileData.profile.slayer_bosses;
		Object.keys(slayerData).forEach(slayer => {
			// calculate slayer lvl
			const slayerLvl = Object.keys(slayerData[slayer].claimed_levels).length;
			const xpPerLevelSlayer = [15, 25, 35, 50, 75, 100, 125, 150, 150];
			for (let i = 0; i < slayerLvl; i++) {
				skyblockXP['Slayer'] += xpPerLevelSlayer[i];
			}

			// calculate slayer bosses slain
			const slayerTierSlain = Object.keys(slayerData[slayer]).length - 2;
			const xpPerSlayerTier = [25, 25, 50, 50, 75];
			for (let j = 0; j < slayerTierSlain; j++) {
				skyblockXP['Slayer'] += xpPerSlayerTier[j];
			}
		});


		/** ################### DUNGEONS ############################# */
		const dungeonData = profileData.profile.dungeons;
		// calculate Catacombs Level
		const cataxpPerLevel = require('../databases/cataExpPerLevel');
		const cataLevel = calcXp(
			dungeonData.dungeon_types.catacombs.experience,
			cataxpPerLevel);

		if (cataLevel > 39) {
			skyblockXP['Dungeons'] += 780 + (cataLevel - 39) * 40;
		}
		else {
			skyblockXP['Dungeons'] += cataLevel * 20;
		}

		// calculate Class Levels
		Object.keys(dungeonData['player_classes']).forEach(cataClass => {
			skyblockXP['Dungeons'] += calcXp(dungeonData.player_classes[cataClass].experience, cataxpPerLevel) * 4;
		});

		// determine xp for completed floors
		const higestFloorNormal = dungeonData.dungeon_types.catacombs.highest_tier_completed + 1 || 0;
		skyblockXP['Dungeons'] += Math.max(higestFloorNormal - 5, 0) * 30 + Math.min(higestFloorNormal, 5) * 20;
		const highestFloorMaster = dungeonData.dungeon_types.master_catacombs.highest_tier_completed || 0;
		skyblockXP['Dungeons'] += highestFloorMaster * 50;

		// get dungeon boss collection xp
		const milestone_completions = [];
		const milestonesLow = [25, 25, 50, 50, 100, 750];
		const milestonesMid = [50, 50, 50, 100, 150, 600];
		const milestonesHigh = [50, 50, 50, 100, 250, 250, 250];
		// accumulate completions from catacombs and master mode
		for (let i = 1; i < Object.keys(dungeonData.dungeon_types.catacombs.milestone_completions || {}).length; i++) {
			milestone_completions.push(dungeonData.dungeon_types.catacombs.milestone_completions[i]);
		}
		for (let j = 0; j < Object.keys(dungeonData.dungeon_types.master_catacombs.milestone_completions || {}).length; j++) {
			milestone_completions[j] += dungeonData.dungeon_types.master_catacombs.milestone_completions[j + 1];
		}
		// check which milestones were reached and add xp
		for (let k = 0; k < milestone_completions.length; k++) {
			const milestone = calcXp(milestone_completions[k], k < 3 ? milestonesLow : (k == 3 ? milestonesMid : milestonesHigh));
			skyblockXP['Dungeons'] += Math.min(milestone, 3) * 15 + Math.max(milestone - 3, 0) * 25;
		}
		/** ################### MINING ################################ */
		// hotm level
		const miningData = profileData.profile.mining_core;
		const xpAtHotmLevel = [35, 80, 140, 215, 305, 415, 545];
		const hotmXpPerLevel = require('../databases/hotmExpPerLevel');
		const hotmLevel = miningData.experience ? calcXp(miningData.experience, hotmXpPerLevel) : 0;
		skyblockXP['Mining'] += xpAtHotmLevel[hotmLevel - 1] || 0;

		// commission milestones
		let i = 1;
		const xpPerCommissionMilestone = [20, 30, 30, 50, 50, 75];
		while (profileData.profile.tutorial.includes(`commission_milestone_reward_skyblock_xp_tier_${i}`)) {
			skyblockXP['Mining'] += xpPerCommissionMilestone[i - 1];
			i++;
		}


		/** ################### COLLECTIONS ############################# */
		const collectionData = profileData.profile.unlocked_coll_tiers || [];
		skyblockXP['Collections'] = Math.max((collectionData.length
		- AMOUNT_SKYBLOCK_COLLECTIONS) * 4, 0);


		/** ################### COLLECTIONS ############################# */
		// TODO: Red sand minion?
		const xpPerMinionTier = [1, 1, 1, 1, 1, 1, 2, 3, 4, 6, 12, 24];
		if (Object.keys(profileData.profile).includes('crafted_generators')) {
			profileData.profile.crafted_generators.forEach(minion => {
				const tier = minion.split('_').pop();
				skyblockXP['Minions'] += xpPerMinionTier[tier - 1];
			});
		}


		/** ################### Magical Power ########################## */
		const accessories = await getInventoryData(profileData.profile.talisman_bag || '');
		accessories.forEach(accessory => {
			let mp = 0;
			switch (accessory.rarity) {
			case 'SPEICAL':
			case 'COMMON':
				mp = 3;
				break;
			// HACK for wrong parsing of very special rarity
			case 'VERY':
			case 'UNCOMMON':
				mp = 5;
				break;
			case 'RARE':
				mp = 8;
				break;
			case 'EPIC':
				mp = 12;
				break;
			case 'LEGENDARY':
				mp = 16;
				break;
			case 'MYTHIC':
				mp = 22;
				break;

			default:
				break;
			}
			if (accessory.id == 'HEGEMONY_ARTIFACT') {
				mp *= 2;
			}
			skyblockXP['Magical Power'] += mp;
		});

		/** ################### TROPHY FISHING ########################## */
		const trophyFishingData = profileData.profile.trophy_fish || [''];
		Object.keys(trophyFishingData).forEach(fish => {
			const fishTier = fish.split('_').pop();
			switch (fishTier) {
			case 'bronze':
				skyblockXP['Trophy Fishing'] += 4;
				break;
			case 'silver':
				skyblockXP['Trophy Fishing'] += 8;
				break;
			case 'gold':
				skyblockXP['Trophy Fishing'] += 16;
				break;
			case 'diamond':
				skyblockXP['Trophy Fishing'] += 32;
				break;
			default:
				break;
			}
		});


		/** ################### PET SCORE ############################# */
		skyblockXP['Pet Score'] = await calculatePetScore(profileData) * 3;


		/** ################### FAIRY SOULS ############################# */
		skyblockXP['Fairy Souls'] = Math.floor(profileData.profile.fairy_souls_collected / 5) * 10;


		/** ################### MELODY'S HARP ############################# */
		let perfect_scores = 0;
		const xpPerSong = [5, 5, 5, 10, 10, 10, 15, 15, 15, 25, 25, 35, 35];
		Object.keys(profileData.profile.harp_quest || {}).forEach(song_stat => {
			const temp = song_stat.split('_');
			// check for entries of type "song_<song_name>_perfect_completions",
			// since value always > 0
			if (temp.pop() == 'completions' && temp.pop() == 'perfect') {
				perfect_scores += 1;
			}
		});
		let sum = 0;
		for (let l = 0; l < perfect_scores; l++) {
			sum += xpPerSong[l];
		}
		skyblockXP['Melody\'s Harp'] += sum;


		/** ################### DOJO ############################# */
		Object.keys(netherData.dojo || {}).forEach(challengeStat => {
			// filter for challenge points
			if (challengeStat.split('_')[1] == 'points') {
				const points = Math.min(profileData.profile.nether_island_player_data.dojo[challengeStat], 1000);
				skyblockXP['Dojo'] += Math.floor(points / 200) * 10;
			}
		});


		// output
		const embed = createEmbedTemplate();
		embed.setTitle(`${profileData.userName}'s minimum SkyBlock Level on ${profileData.profileName}`);
		embed.setDescription('Calculations dont include: Museum, Bank upgrades and powder');


		let totalXP = 0;
		const skyblockXPArray = Object.entries(skyblockXP);
		skyblockXPArray.sort((a, b) => b[1] - a[1]);
		skyblockXPArray.forEach(xpCriteria => {
			embed.addField(`SkyBlock Level from ${xpCriteria[0]}`, `${xpCriteria[1] / 100} / ${maxSbXp[xpCriteria[0]] / 100} `);
			totalXP += xpCriteria[1];
		});
		embed.addField(`\`Total SkyBlock Level: ${totalXP / 100}\``, '\u200B');

		await interaction.reply({ embeds: [embed] });
	},
};