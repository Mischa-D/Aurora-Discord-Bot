module.exports = chooseProfile;

// finds the profile with name <fruit> if given, else chooses a profile based on a certain metric
// currently it simply takes the first profile in the array
// TODO: better metric
async function chooseProfile(profileData, fruit = null) {
	let profileNumber = 0;

	for (const [index, profile] of profileData['profiles'].entries()) {
		if (typeof fruit === 'string' && profile['cute_name'].toUpperCase() != fruit.toUpperCase()) continue;
		profileNumber = index;
	}
	return profileNumber;
}