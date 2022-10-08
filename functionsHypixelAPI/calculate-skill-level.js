const SkillXpPerLevel = require('../databases/skillExpPerLevel');

function getLevel(xpAmount, levelSheet = SkillXpPerLevel) {
	if (typeof xpAmount != 'number') {
		return 0;
	}
	let xpAtLevel = 0;
	for (let i = 0; i < levelSheet.length; i++) {
		xpAtLevel += levelSheet[i];
		if (xpAtLevel > xpAmount) return i;
	}
	return levelSheet.length;
}

module.exports = getLevel;