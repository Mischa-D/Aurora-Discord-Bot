async function getItemStats(item) {
	const stats = {};
	const statRegexp = /^([A-Z][A-Za-z\s]+):\s\+([\d+,?\d+.?\d]+\b)/gm;
	const matches = item.lore.matchAll(statRegexp);
	for (const match of matches) {
		stats[match[1]] = Number(match[2].split(',').join(''));
	}
	return stats;
}

module.exports = getItemStats;