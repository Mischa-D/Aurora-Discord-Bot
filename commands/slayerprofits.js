// input: Slayer type, boss level, magic find, looting, aatrox slashed pricing, aatrox more magic find, aatrox more slayer xp
// get: Slayer Level
// database: slayer type: boss level : [{drop_name, drop_requirement}]
//                  OR:   [[level 0 drops], [level 1 drops], ... [level 9 drops]]
// TODO: check chances of top end drops ingame
const { SlashCommandBuilder } = require('discord.js');
const createEmbedTemplate = require('../create-embed-template');
const getAPIData = require('../functionsHypixelAPI/access-api');
const formatValue = require('../formatValue');
const getPrice = require('../functionsHypixelAPI/get-price');

const SlayerDrops = require('../databases/slayerDrops');

const SlayerCosts = [2000, 7500, 20000, 50000, 100000]

const TAXMULTIPLIER = 0.98875

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slayerprofits')
        .setDescription('Average profit per boss of given type, difficulty and slayer level (default = 9).')
        .addStringOption(option => option.setName('type').setDescription('The type of slayer boss').setRequired(true)
            .addChoices(
                { name: 'Revenant Horror', value: 'Zombie' },
                { name: 'Tarantula Broodfather', value: 'Spider' },
                { name: 'Sven Packmaster', value: 'Wolf' },
                { name: 'Voidgloom Seraph', value: 'Enderman' },
                { name: 'Inferno Demonlord', value: 'Blaze' }
        ))
        .addIntegerOption(option => option.setName('tier').setDescription('The tier of the boss you will fight').setRequired(true))
        .addIntegerOption(option => option.setName('magic_find').setDescription('The magic find you can get on the slayer boss').setRequired(true))
        .addIntegerOption(option => option.setName('looting').setDescription('The level of looting on the weapon you use to kill the boss').setRequired(true))
        .addIntegerOption(option => option.setName('level').setDescription('Your Slayer Level of the selected Slayer type'))
        .addBooleanOption(option => option.setName('half_cost').setDescription('Aatrox perk Slashed Pricing active?'))
        .addBooleanOption(option => option.setName('magic_find_boost').setDescription('Aatrox perk Pathfinder active?'))
        .addBooleanOption(option => option.setName('xp_buff').setDescription('Aatrox perk Slayer XP Buff active?')),

    async execute(interaction) {
        const slayer_type = interaction.options.getString('type');
        const slayer_tier = interaction.options.getInteger('tier');
        const slayer_boss = slayer_type + '_' + slayer_tier;
        let slayer_level;
        const magic_find = interaction.options.getBoolean('magic_find_boost') ? interaction.options.getInteger('magic_find') * 1.2 : interaction.options.getInteger('magic_find');
        const looting_level = interaction.options.getInteger('looting');
        const slayer_cost = interaction.options.getBoolean('half_cost') ? SlayerCosts[slayer_tier - 1] / 2 : SlayerCosts[slayer_tier - 1];
        
        // assume max slayer level if no level specified
        if (interaction.options.getInteger('level')) {
            slayer_level = interaction.options.getInteger('level');
        } else {
            slayer_level = 9;
        }

        // get list of all possible drops (slayer type, tier, level requirement)
        const token_drop = SlayerDrops[slayer_type][slayer_boss].token_drop;
        const drops = SlayerDrops[slayer_type][slayer_boss].drops;
        let possible_drops = []
        for (let i = 0; i < Math.min(slayer_level, drops.length); i++) {
            possible_drops = possible_drops.concat(drops[i])
        }
        console.log(possible_drops);

        // get more time to respond
        interaction.deferReply();

        // get price (bazaar/ah) using hypixel api for bz and sky.coflnet api for ah
        // TODO: implement sell offer (instabuy price)
        try {
            token_drop_price = getPrice(token_drop.id);
            for(const drop of possible_drops) {
                drop.value = getPrice(drop.id);
                
                // if min/max amounts are specified, take average roll
                if ('min' in drop) {
                    drop.value = (await drop.value) * (drop.min + drop.max) / 2;
                }
                console.log(drop);
            }
		}
        // error with fetching from API
		catch (error) {
			if (error.message[0] == '!') {
				throw error;
			}
			else {
				console.error(error);
			}
		}

        // calculate expected value from value and chance
        // Looting OFF for normal drops
        for(const drop of possible_drops) {
            drop.expected = (await drop.value) * drop.chance;
            // filter out those drops marked as occasional. (official wiki says magic find applies for every drop but those)
            // the highest non occasional was ~6.98% and the lowest occasional was ~7.6%
            if (drop.chance < 0.075) {
                drop.expected *= 1 + (magic_find / 100)
            }
        }

        // TODO: figure out a way to handle rng meter
        // Rng meter: (2/chance) * 1000 = required xp

        // TODO: fix runes (currently takes cheapest offer, even if its a stack of runes)

        // PRINT/DISPLAY
        // expected average profit/loss per boss
        // guaranteed profit per boss (token drops)
        // TODO: worst case profit/loss (until rngmeter is full)
        const embed = createEmbedTemplate();
        embed.setTitle(`Expected profit for Slayer Boss ${slayer_type} T${slayer_tier}`);
        embed.setDescription('auction data retrieved from [sky.coflnet](https://sky.coflnet.com/data)');
        let dropSummary = '';
        let dropSum = 0;
        possible_drops.sort((a, b) => b.expected - a.expected);
        possible_drops.slice(0, 7).forEach(drop => {
            dropSummary += '- ' + drop.id + `  \`${formatValue(drop.expected)}\`\n`;
            dropSum += drop.expected;
        });
        const guaranteedProfit = await token_drop_price * ((token_drop.min + token_drop.max) / 2) * (1 + looting_level * 0.15);
        dropSum += guaranteedProfit;
        embed.addFields(
            {name: 'Inputs', value: `Slayer Level ${slayer_level}\nMagic Find ${interaction.options.getBoolean('magic_find_boost') ? magic_find / 1.2 : magic_find}\nLooting Level ${looting_level}`},
            {name: 'Guaranteed drops:', value: `${token_drop.id}  \`${formatValue(guaranteedProfit)}\``},
            {name: `Expected Coins by drop:`, value: dropSummary + '\n...'},
            {name: 'Profit:', value: formatValue(dropSum - slayer_cost)}
        );
        await interaction.editReply({ embeds: [embed] });
    },
};
