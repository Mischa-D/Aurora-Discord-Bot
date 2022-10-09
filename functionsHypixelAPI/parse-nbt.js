const nbt = require('nbt');

async function parseItemInventoryData(itemInventory) {
	const items = [];
	if (itemInventory == '') {
		return items;
	}
	const itemData = await parseNBTPromisified(itemInventory.data);
	// assuming all Hypixel API NBT texts have the same inner structure
	const itemList = itemData.value.i.value.value;
	// get relevant data for each item
	itemList.forEach(item => {
		if (typeof item.tag != 'undefined') {
			let itemRarity = item.tag.value.display.value.Lore.value.value.pop().replace(/\u00A7[0-9A-FK-OR]/ig, '').split(' ');
			// recombed items will have a tag in the form of <a <rarity> <item type> a> left
			itemRarity[0] == 'a' ? itemRarity = itemRarity[1] : itemRarity = itemRarity[0];
			item.tag.value.display.value.Lore.value.value.pop();
			const itemLore = item.tag.value.display.value.Lore.value.value.join('\n').replace(/\u00A7[0-9A-FK-OR]/ig, '');
			const itemID = item.tag.value.ExtraAttributes.value.id.value;
			items.push({ id: itemID, rarity: itemRarity, lore: itemLore });
		}
	});
	return items;
}

async function parseNBTPromisified(nbtText) {
	try {
		return await new Promise((resolve, reject) => {
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