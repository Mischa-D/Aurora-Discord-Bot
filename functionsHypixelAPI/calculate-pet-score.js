async function calculatePetScore(profileData) {
	const uniquePets = {};
	profileData.profile.pets.forEach(pet => {
		// convert pet rarity to score number
		let individual_score = 0;
		switch (pet.tier) {
		case 'COMMON':
			individual_score = 1;
			break;
		case 'UNCOMMON':
			individual_score = 2;
			break;
		case 'RARE':
			individual_score = 3;
			break;
		case 'EPIC':
			individual_score = 4;
			break;
		case 'LEGENDARY':
			individual_score = 5;
			break;
		case 'MYTHIC':
			individual_score = 6;
			break;
		default:
			break;
		}

		// mythic jerry and bat count as legendary
		if (pet.heldItem == 'PET_ITEM_TOY_JERRY' || pet.heldItem == 'PET_ITEM_VAMPIRE_FANG') {
			individual_score += 1;
		}

		// find best pet of each type
		if (Object.keys(uniquePets).includes(pet.type)) {
			if (individual_score > uniquePets[pet.type]) {
				uniquePets[pet.type] = individual_score;
			}
		}
		else {
			uniquePets[pet.type] = individual_score;
		}
	});
	let totalScore = 0;
	Object.values(uniquePets).forEach(pScore => {
		totalScore += pScore;
	});
	return totalScore;
}

module.exports = calculatePetScore;