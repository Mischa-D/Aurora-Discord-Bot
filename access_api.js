const dotenv = require('dotenv');
const https = require('https');

dotenv.config();

const url = `https://api.hypixel.net/skyblock/profiles?key=${process.env.HYPIXEL_API_KEY}&uuid=10449010-26d2-43f9-932f-338aedc91e4e`;

https.get(url, (res) => {
	let data = '';
	res.on('data', (chunk) => {
		data += chunk;
	});

	res.on('end', () => {
		console.log(JSON.parse(data)['profiles']);
	});

}).on('error', (err) => {
	console.log(`Error: ${err.message}`);
});
