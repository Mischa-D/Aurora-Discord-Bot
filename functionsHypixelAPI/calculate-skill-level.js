const SkillXpPerLevel = require('../databases/skillExpPerLevel');

function getLevel(xpAmount) {
	let xpAtLevel = 0;
	for (let i = 0; i < SkillXpPerLevel.length; i++) {
		xpAtLevel += SkillXpPerLevel[i];
		if (xpAtLevel > xpAmount) return i;
	}
	return SkillXpPerLevel.length;
}

module.exports = getLevel;