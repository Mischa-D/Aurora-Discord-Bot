const { hypixel_api_key } = require('./config.json');
const https = require('https');

const url = `https://api.hypixel.net/skyblock/profiles?key=${hypixel_api_key}&uuid=10449010-26d2-43f9-932f-338aedc91e4e`;


https.get(url, (res) => {
	let data = '';
	res.on('data', (chunk) => {
		data += chunk;
	});

	res.on('end', () => {
		console.log(JSON.parse(data));
	});

}).on('error', (err) => {
	console.log(`Error: ${err.message}`);
});
