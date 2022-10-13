const https = require('https');

async function getAPIData(url) {
	return await new Promise((resolve, reject) => {
		https.get(url, (response) => {
			let data = '';
			response.on('data', (chunk) => {
				data += chunk;
			});

			response.on('end', () => {
				if (JSON.parse(data)['success'] == false) {
					console.error(JSON.parse(data)['cause']);
					reject(new Error('Something went wrong!'));
				}
				else {
					resolve(data);
				}
			}).on('error', () => {
				console.log('Error: No valid API response');
				throw new Error('!API doesn\'t respond');
			});
		});
	});
}

module.exports = getAPIData;