const getAPIData = require('./access-api');

async function getPrice(id, bazaartax = 0.98875) {
    // TODO: implement sell offer (instabuy price)
    try {
        const bazaarData = await getAPIData('https://api.hypixel.net/skyblock/bazaar');
        
        // item bazaar or ah? -> try bazaar, if it doesn't work do ah
            if (id in JSON.parse(bazaarData).products) {
                return JSON.parse(bazaarData).products[id].quick_status.sellPrice * bazaartax;
            }
            else {
                // fetch lbin from coflnet ah
                const lbin_info = await getAPIData(`https://sky.coflnet.com/api/item/price/${id}/bin`)
                return JSON.parse(lbin_info).lowest < 1000000 ? JSON.parse(lbin_info).lowest : JSON.parse(lbin_info).lowest * 0.99;
            }
            
    }
    // error with fetching from API
    catch (error) {
        if (error.message[0] == '!') {
            throw error;
        }
        else {
            console.error(error);
            throw new Error(`!Couldn't find an item with id '${id}'`);
        }
    }
};

module.exports = getPrice;