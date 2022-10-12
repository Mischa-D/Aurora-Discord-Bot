const nbt = require('nbt');

async function parseItemInventoryData(itemInventory, filter = async (item) => item.id.length != 0) {
	const items = [];
	if (itemInventory != {} && itemInventory != undefined) {
		const itemData = await parseNBTPromisified(itemInventory.data || {});
		// assuming all Hypixel API NBT texts have the same inner structure
		const itemList = itemData.value.i.value.value;
		// get relevant data for each item
		await itemList.forEach(async item => {
			if (typeof item.tag != 'undefined') {
				let itemRarity;
				let itemType;
				const itemTag = item.tag.value.display.value.Lore.value.value.pop().replace(/\u00A7[0-9A-FK-OR]/ig, '').split(' ');
				const recombed = itemTag[0] == 'a';
				// recombed items will have a tag in the form of <a <rarity> <item type> a> left
				if (recombed) {
					itemRarity = itemTag[1];
					itemType = itemTag.slice(2, -1).join(' ');
				}
				else {
					itemRarity = itemTag[0];
					itemType = itemTag.slice(1).join(' ');
				}
				item.tag.value.display.value.Lore.value.value.pop();
				const itemLore = item.tag.value.display.value.Lore.value.value.join('\n').replace(/\u00A7[0-9A-FK-OR]/ig, '');
				const itemID = item.tag.value.ExtraAttributes.value.id.value;
				const newItem = { id: itemID, rarity: itemRarity, type: itemType, lore: itemLore };

				if (await filter(newItem)) {
					items.push(newItem);
				}
			}
		});
	}
	return items;
}

async function parseNBTPromisified(nbtText) {

	try {
		return await new Promise((resolve, reject) => {
			if (typeof nbtText != 'string') resolve({ 'value': { 'i': { 'value': { 'value': [] } } } });
			const buff = Buffer.from(nbtText, 'base64');
			nbt.parse(buff, (error, data) => {
				if (error) {
					reject(error);
				}
				else {
					resolve(data);
				}
			});
		});
	}
	catch (error) {
		console.log(error);
	}
}

module.exports = parseItemInventoryData;