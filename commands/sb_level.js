const { SlashCommandBuilder } = require('@discordjs/builders');
const createEmbedTemplate = require('../create-embed-template');
const calcXp = require('../functionsHypixelAPI/calculate-skill-level');
const fetchSkyblockProfile = require('../functionsHypixelAPI/fetch-skyblock-profile');
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
		//const name = interaction.options.getString('minecraft-name');
		const name = 'LagopusPolar';
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
			'Fairy Souls': 0 };


		/** ################### SKILLS ################################# */
		// calculate Level for all non-cosmetic skills
		const skills = ['farming', 'mining', 'combat', 'foraging', 'fishing', 'enchanting', 'alchemy', 'carpentry', 'taming'];
		skills.forEach(element => {
			const skill = 'experience_skill_' + element;
			let skillLevel = calcXp(profileData['profile'][skill]);

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
		const slayerData = profileData['profile']['slayer_bosses'];
		Object.keys(slayerData).forEach(slayer => {
			// calculate slayer lvl
			const slayerLvl = Object.keys(slayerData[slayer]['claimed_levels']).length;
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
		const dungeonData = profileData['profile']['dungeons'];
		// calculate Catacombs Level
		const cataxpPerLevel = require('../databases/cataExpPerLevel');
		const cataLevel = calcXp(
			dungeonData['dungeon_types']['catacombs']['experience'],
			cataxpPerLevel);

		if (cataLevel > 39) {
			skyblockXP['Dungeons'] += 780 + (cataLevel - 39) * 40;
		}
		else {
			skyblockXP['Dungeons'] += cataLevel * 20;
		}

		// calculate Class Levels
		Object.keys(dungeonData['player_classes']).forEach(cataClass => {
			skyblockXP['Dungeons'] += calcXp(dungeonData['player_classes'][cataClass]['experience'], cataxpPerLevel) * 4;
		});


		/** ################### MINING ################################ */
		const miningData = profileData['profile']['mining_core'];
		const xpPerHotmLevel = [35, 45, 60, 75, 90, 110, 130];
		const hotmXpPerLevel = require('../databases/hotmExpPerLevel');
		const hotmLevel = calcXp(miningData['experience'], hotmXpPerLevel);
		console.log(hotmLevel);
		for (let k = 0; k < hotmLevel; k++) {
			skyblockXP['Mining'] += xpPerHotmLevel[k];
		}


		/** ################### COLLECTIONS ############################# */
		skyblockXP['Collections'] = (profileData['profile']['unlocked_coll_tiers'].length
		- AMOUNT_SKYBLOCK_COLLECTIONS) * 4;


		/** ################### COLLECTIONS ############################# */
		// TODO: Red sand minion?
		const xpPerMinionTier = [1, 1, 1, 1, 1, 1, 2, 3, 4, 6, 12, 24];
		profileData['profile']['crafted_generators'].forEach(minion => {
			const tier = minion.split('_').pop();
			skyblockXP['Minions'] += xpPerMinionTier[tier - 1];
		});


		/** ################### FAIRY SOULS ############################# */
		skyblockXP['Fairy Souls'] = Math.floor(profileData['profile']['fairy_souls_collected'] / 5) * 10;


		// output
		const embed = createEmbedTemplate();
		embed.setTitle(`${name}'s minimum SkyBlock Level on ${profileData['profileName']}`);
		embed.setDescription('Calculations include: Skills, Slayers, Cata Level, Class Level, Fairy souls, Collections, Minions, Heart of the Mountain');


		let totalXP = 0;
		Object.keys(skyblockXP).forEach(xpCriteria => {
			embed.addField(`SkyBlock Level from ${xpCriteria}`, `${skyblockXP[xpCriteria] / 100}`);
			totalXP += skyblockXP[xpCriteria];
		});
		embed.addField(`\`Total SkyBlock Level: ${totalXP / 100}\``, '\u200B');

		interaction.reply({ embeds: [embed] });
	},
};