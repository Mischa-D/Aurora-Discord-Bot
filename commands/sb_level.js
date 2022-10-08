const { SlashCommandBuilder } = require('@discordjs/builders');
const createEmbedTemplate = require('../create-embed-template');
const calcXp = require('../functionsHypixelAPI/calculate-skill-level');
const fetchSkyblockProfile = require('../functionsHypixelAPI/fetch-skyblock-profile');
const calculatePetScore = require('../functionsHypixelAPI/calculate-pet-score');
const getInventoryData = require('../functionsHypixelAPI/parse-nbt');
const lvl50Skills = require('../databases/lvl50Skills');

const AMOUNT_SKYBLOCK_COLLECTIONS = 67;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sb_level')
		.setDescription('calculates a lower estimate of a players skyblock level')
		.addStringOption(option => option.setName('minecraft-name').setDescription('your IGN'))
		.addStringOption(option => option.setName('profile-name').setDescription('the name of your profile')),
	async execute(interaction) {
		// get uuid based on inputted minecraft name
		const name = interaction.options.getString('minecraft-name');
		// const name = 'LagopusPolar';
		// const profileFruit = 'Apple';
		const profileFruit = interaction.options.getString('profile-name');

		let profileData;
		try {
			profileData = await fetchSkyblockProfile(name, profileFruit);

		}
		catch (error) {
			console.error(error);
			console.log(profileData);
			await interaction.reply({ content: 'There was an error while executing this command!\n' + error.message, ephemeral: true });
		}

		const skyblockXP = { 'Skills': 0, 'Slayer': 0, 'Dungeons': 0, 'Collections': 0, 'Minions': 0, 'Mining': 0,
			'Magical Power': 0, 'Trophy Fishing': 0, 'Pet Score': 0, 'Fairy Souls': 0, 'Melody\'s Harp': 0 };


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
		for (let i = 1; i < Object.keys(dungeonData.dungeon_types.catacombs.milestone_completions).length || 0; i++) {
			milestone_completions.push(dungeonData.dungeon_types.catacombs.milestone_completions[i]);
		}
		for (let j = 0; j < Object.keys(dungeonData.dungeon_types.master_catacombs.milestone_completions).length || 0; j++) {
			milestone_completions[j] += dungeonData.dungeon_types.master_catacombs.milestone_completions[j + 1];
		}
		// check which milestones were reached and add xp
		for (let k = 0; k < milestone_completions.length; k++) {
			const milestone = calcXp(milestone_completions[k], k < 3 ? milestonesLow : (k == 3 ? milestonesMid : milestonesHigh));
			skyblockXP['Dungeons'] += Math.min(milestone, 3) * 15 + Math.max(milestone - 3, 0) * 25;
		}
		/** ################### MINING ################################ */
		const miningData = profileData.profile.mining_core;
		const xpPerHotmLevel = [35, 45, 60, 75, 90, 110, 130];
		const hotmXpPerLevel = require('../databases/hotmExpPerLevel');
		const hotmLevel = calcXp(miningData.experience, hotmXpPerLevel);
		for (let k = 0; k < hotmLevel; k++) {
			skyblockXP['Mining'] += xpPerHotmLevel[k];
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
		const accessories = await getInventoryData(profileData.profile.talisman_bag);
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
		Object.keys(profileData.profile.harp_quest).forEach(song_stat => {
			const temp = song_stat.split('_');
			// check for entries of type "song_<song_name>_perfect_completions",
			// since value always > 0
			if (temp.pop() == 'completions' && temp.pop() == 'perfect') {
				perfect_scores += 1;
			}
		});
		let sum = 0;
		for (let i = 0; i < perfect_scores; i++) {
			sum += xpPerSong[i];
		}
		skyblockXP['Melody\'s Harp'] += sum;


		// output
		const embed = createEmbedTemplate();
		embed.setTitle(`${name}'s minimum SkyBlock Level on ${profileData.profileName}`);
		embed.setDescription('Calculations dont include: Bestiary, Museum, Bank upgrades, comission milestones, dragons slain, dojo, kuudra and arachne tiers');


		let totalXP = 0;
		Object.keys(skyblockXP).forEach(xpCriteria => {
			embed.addField(`SkyBlock Level from ${xpCriteria}`, `${skyblockXP[xpCriteria] / 100}`);
			totalXP += skyblockXP[xpCriteria];
		});
		embed.addField(`\`Total SkyBlock Level: ${totalXP / 100}\``, '\u200B');

		interaction.reply({ embeds: [embed] });
	},
};