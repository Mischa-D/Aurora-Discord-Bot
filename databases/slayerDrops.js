// TODO: maybe convert to weights so it requires less maintenance?
const drops = {
    'Zombie': {
        'Zombie_1': {
            'token_drop': {'id': 'REVENANT_FLESH', 'min': 1, 'max': 3},
            'drops': []
        },
        'Zombie_2': {
            'token_drop': {'id': 'REVENANT_FLESH', 'min': 9, 'max': 18},
            'drops': [
                [{'id': 'FOUL_FLESH', 'chance': 0.1616}],
                [{'id': 'RUNE_ZOMBIE_SLAYER', 'chance': 0.0067}],
                [{'id': 'UNDEAD_CATALYST', 'chance': 0.0202}],
                [],
                [],
                [{'id': 'REVENANT_CATALYST', 'chance': 0.0101}]
            ]
        },
        'Zombie_3': {
            'token_drop': {'id': 'REVENANT_FLESH', 'min': 30, 'max': 50},
            'drops': [
                [{'id': 'FOUL_FLESH', 'chance': 0.1608, 'min': 1, 'max': 2}],
                [{'id': 'RUNE_ZOMBIE_SLAYER', 'chance': 0.0261}],
                [{'id': 'UNDEAD_CATALYST', 'chance': 0.0201}],
                [{'id': 'ENCHANTMENT_SMITE_6', 'chance': 0.0081}],
                [{'id': 'BEHEADED_HORROR', 'chance': 0.0008}],
                [{'id': 'REVENANT_CATALYST', 'chance': 0.0101}]
            ]
        },
        'Zombie_4': {
            'token_drop': {'id': 'REVENANT_FLESH', 'min': 50, 'max': 64},
            'drops': [
                [{'id': 'FOUL_FLESH', 'chance': 0.1622, 'min': 2, 'max': 3}],
                [{'id': 'RUNE_ZOMBIE_SLAYER', 'chance': 0.0633}],
                [{'id': 'UNDEAD_CATALYST', 'chance': 0.006}],
                [{'id': 'ENCHANTMENT_SMITE_6', 'chance': 0.0081}],
                [{'id': 'BEHEADED_HORROR', 'chance': 0.0016}],
                [{'id': 'REVENANT_CATALYST', 'chance': 0.0101}, {'id': 'RUNE_SNAKE', 'chance': 0.0016}],
                [{'id': 'SCYTHE_BLADE', 'chance': 0.0006}]]
        },
        'Zombie_5': {
            'token_drop': {'id': 'REVENANT_FLESH', 'min': 63, 'max': 64},
            'drops': [
                [{'id': 'FOUL_FLESH', 'chance': 0.1377, 'min': 3, 'max': 4}],
                [{'id': 'RUNE_ZOMBIE_SLAYER', 'chance': 0.0542}],
                [{'id': 'UNDEAD_CATALYST', 'chance': 0.0169}],
                [{'id': 'ENCHANTMENT_SMITE_6', 'chance': 0.0069}],
                [{'id': 'BEHEADED_HORROR', 'chance': 0.0014}],
                [{'id': 'REVENANT_CATALYST', 'chance': 0.0086}, {'id': 'RUNE_SNAKE', 'chance': 0.0014}],
                [{'id': 'SCYTHE_BLADE', 'chance': 0.001033}, {'id': 'REVENANT_VISCERA', 'chance': 0.1377, 'min': 1, 'max': 2}, {'id': 'SHARD_OF_THE_SHREDDED', 'chance': 0.000551}, {'id': 'ENCHANTMENT_SMITE_7', 'chance': 0.000482}, {'id': 'WARDEN_HEART', 'chance': 0.000138}]]
        },
    },
    'Spider': {
        'Spider_1': {
            'token_drop': {'id': 'TARANTULA_WEB', 'min': 1, 'max': 3},
            'drops': []
        },
        'Spider_2': {
            'token_drop': {'id': 'TARANTULA_WEB', 'min': 9, 'max': 18},
            'drops': [
                [{'id': 'TOXIC_ARROW_POISON', 'chance': 0.1525, 'min': 16, 'max': 16}, {'id': 'RUNE_BITE', 'chance': 0.007}]
            ]
        },
        'Spider_3': {
            'token_drop': {'id': 'TARANTULA_WEB', 'min': 24, 'max': 48},
            'drops': [
                [{'id': 'TOXIC_ARROW_POISON', 'chance': 0.1485, 'min': 28, 'max': 30}, {'id': 'RUNE_BITE', 'chance': 0.0267}],
                [{'id': 'SPIDER_CATALYST', 'chance': 0.0206}],
                [],
                [{'id': 'ENCHANTMENT_BANE_OF_ARTHROPODS_6', 'chance': 0.0041}],
                [{'id': 'FLY_SWATTER', 'chance': 0.0008}],
                [{'id': 'TARANTULA_TALISMAN', 'chance': 0.0008}]
            ]
        },
        'Spider_4': {
            'token_drop': {'id': 'TARANTULA_WEB', 'min': 52, 'max': 64},
            'drops': [
                [{'id': 'TOXIC_ARROW_POISON', 'chance': 0.1497, 'min': 60, 'max': 64}, {'id': 'RUNE_BITE', 'chance': 0.0648}],
                [{'id': 'SPIDER_CATALYST', 'chance': 0.0062}],
                [],
                [{'id': 'ENCHANTMENT_BANE_OF_ARTHROPODS_6', 'chance': 0.0083}],
                [{'id': 'FLY_SWATTER', 'chance': 0.0017}],
                [{'id': 'TARANTULA_TALISMAN', 'chance': 0.0017}],
                [{'id': 'DIGESTED_MOSQUITO', 'chance': 0.0006}]
            ]
        },
    },
    'Wolf': {
        'Wolf_1': {
            'token_drop': {'id': 'WOLF_TOOTH', 'min': 1, 'max': 3},
            'drops': []
        },
        'Wolf_2': {
            'token_drop': {'id': 'WOLF_TOOTH', 'min': 9, 'max': 18},
            'drops': [
                [{'id': 'HAMSTER_WHEEL', 'chance': 0.1667}],
                [{'id': 'RUNE_SPIRIT', 'chance': 0.0068}]
            ]
        },
        'Wolf_3': {
            'token_drop': {'id': 'WOLF_TOOTH', 'min': 30, 'max': 50},
            'drops': [
                [{'id': 'HAMSTER_WHEEL', 'chance': 0.1645, 'min': 2, 'max': 4}],
                [{'id': 'RUNE_SPIRIT', 'chance': 0.0266}],
                [],
                [{'id': 'ENCHANTMENT_CRITICAL_6', 'chance': 0.0041}, {'id': 'FURBALL', 'chance': 0.0082}],
                [{'id': 'RED_CLAW_EGG', 'chance': 0.0004}]
            ]
        },
        'Wolf_4': {
            'token_drop': {'id': 'WOLF_TOOTH', 'min': 50, 'max': 64},
            'drops': [
                [{'id': 'HAMSTER_WHEEL', 'chance': 0.1622, 'min': 4, 'max': 5}],
                [{'id': 'RUNE_SPIRIT', 'chance': 0.0633}],
                [],
                [{'id': 'ENCHANTMENT_CRITICAL_6', 'chance': 0.0081}, {'id': 'FURBALL', 'chance': 0.0162}],
                [{'id': 'RED_CLAW_EGG', 'chance': 0.0012}],
                [{'id': 'RUNE_COUTURE', 'chance': 0.0024}],
                [{'id': 'GRIZZLY_BAIT', 'chance': 0.0006}, {'id': 'OVERFLUX_CAPACITOR', 'chance': 0.0004}]
            ]
        },
    },
    'Enderman': {
        'Enderman_1': {
            'token_drop': {'id': 'NULL_SPHERE', 'min': 2, 'max': 3},
            'drops': []
        },
        'Enderman_2': {
            'token_drop': {'id': 'NULL_SPHERE', 'min': 14, 'max': 24},
            'drops': [
                [{'id': 'TWILIGHT_ARROW_POISON', 'chance': 0.1515, 'min': 16, 'max': 16}, {'id': 'SUMMONING_EYE', 'chance': 0.0067}]
            ]
        },
        'Enderman_3': {
            'token_drop': {'id': 'NULL_SPHERE', 'min': 60, 'max': 80},
            'drops': [
                [{'id': 'TWILIGHT_ARROW_POISON', 'chance': 0.1341, 'min': 24, 'max': 32}, {'id': 'SUMMONING_EYE', 'chance': 0.006}, {'id': 'RUNE_ENDERSNAKE', 'chance': 0.0242}],
                [{'id': 'ENCHANTMENT_MANA_STEAL_1', 'chance': 0.0447}],
                [{'id': 'TRANSMISSION_TUNER', 'chance': 0.0223}],
                [{'id': 'NULL_ATOM', 'chance': 0.0373}, {'id': 'HAZMAT_ENDERMAN', 'chance': 0.0104}]
            ]
        },
        'Enderman_4': {
            'token_drop': {'id': 'NULL_SPHERE', 'min': 105, 'max': 155},
            'drops': [
                [{'id': 'TWILIGHT_ARROW_POISON', 'chance': 0.127, 'min': 60, 'max': 64}, {'id': 'SUMMONING_EYE', 'chance': 0.0056}, {'id': 'RUNE_ENDERSNAKE', 'chance': 0.0534}],
                [{'id': 'ENCHANTMENT_MANA_STEAL_1', 'chance': 0.0423}],
                [{'id': 'TRANSMISSION_TUNER', 'chance': 0.0212}],
                [{'id': 'NULL_ATOM', 'chance': 0.0494}, {'id': 'HAZMAT_ENDERMAN', 'chance': 0.0155}, {'id': 'POCKET_ESPRESSO_MACHINE', 'chance': 0.0039}],
                [{'id': 'ENCHANTMENT_SMARTY_PANTS_1', 'chance': 0.0176}, {'id': 'RUNE_DRAGON', 'chance': 0.007}, {'id': 'HANDY_BLOOD_CHALICE', 'chance': 0.0018}],
                [{'id': 'SINFUL_DICE', 'chance': 0.0046}, {'id': 'EXCEEDINGLY_RARE_ENDER_ARTIFACT_UPGRADER', 'chance': 0.0003}],
                [{'id': 'ETHERWARP_MERGER', 'chance': 0.0042}, {'id': 'PET_SKIN_ENDERMAN_SLAYER', 'chance': 0.0018}, {'id': 'JUDGEMENT_CORE', 'chance': 0.0006}, {'id': 'RUNE_ENCHANT', 'chance': 0.0005}, {'id': 'ENCHANTMENT_ENDER_SLAYER_7', 'chance': 0.0001}]
            ]
        },
    },
    'Blaze': {
        'Blaze_1':{
            'token_drop': {'id': 'DERELICT_ASHE', 'min': 2, 'max': 3},
            'drops': []
        },
        'Blaze_2':{
            'token_drop': {'id': 'DERELICT_ASHE', 'min': 12, 'max': 22},
            'drops': [
                [{'id': 'POTION_wisp_ice', 'chance': 0.0282}, {'id': 'ARROW_BUNDLE_MAGMA', 'chance': 0.0847}],
                [{'id': 'MANA_DISINTEGRATOR', 'chance': 0.0395}, {'id': 'SCORCHED_BOOKS', 'chance': 0.0226}],
                [{'id': 'KELVIN_INVERTER', 'chance': 0.0282}, {'id': 'BLAZE_ROD_DISTILLATE', 'chance': 0.0508, 'min': 2, 'max': 2}, {'id': 'GLOWSTONE_DUST_DISTILLATE', 'chance': 0.0508, 'min': 2, 'max': 2}, {'id': 'MAGMA_CREAM_DISTILLATE', 'chance': 0.0508, 'min': 2, 'max': 2}, {'id': 'NETHER_STALK_DISTILLATE', 'chance': 0.0508, 'min': 2, 'max': 2}, {'id': 'CRUDE_GABAGOOL_DISTILLATE', 'chance': 0.0282, 'min': 2, 'max': 2}]
            ]
        },
        'Blaze_3':{
            'token_drop': {'id': 'DERELICT_ASHE', 'min': 60, 'max': 80},
            'drops': [
                [{'id': 'POTION_wisp_ice', 'chance': 0.027, 'min': 2, 'max': 2}, {'id': 'ARROW_BUNDLE_MAGMA', 'chance': 0.0811}, {'id': 'RUNE_LAVATEARS', 'chance': 0.0107}],
                [{'id': 'MANA_DISINTEGRATOR', 'chance': 0.0378}, {'id': 'SCORCHED_BOOKS', 'chance': 0.0216}],
                [{'id': 'KELVIN_INVERTER', 'chance': 0.027}, {'id': 'BLAZE_ROD_DISTILLATE', 'chance': 0.0486, 'min': 6, 'max': 10}, {'id': 'GLOWSTONE_DUST_DISTILLATE', 'chance': 0.0486, 'min': 6, 'max': 10}, {'id': 'MAGMA_CREAM_DISTILLATE', 'chance': 0.0486, 'min': 6, 'max': 10}, {'id': 'NETHER_STALK_DISTILLATE', 'chance': 0.0486, 'min': 6, 'max': 10}, {'id': 'CRUDE_GABAGOOL_DISTILLATE', 'chance': 0.027, 'min': 6, 'max': 10}],
                [{'id': 'SCORCHED_POWER_CRYSTAL', 'chance': 0.0324}, {'id': 'ARCHFIEND_DICE', 'chance': 0.0108}]
            ]
        },
        'Blaze_4':{
            'token_drop': {'id': 'DERELICT_ASHE', 'min': 110, 'max': 155},
            'drops': [
                [{'id': 'POTION_wisp_ice', 'chance': 0.0254, 'min': 5, 'max': 5}, {'id': 'ARROW_BUNDLE_MAGMA', 'chance': 0.0762}, {'id': 'RUNE_LAVATEARS', 'chance': 0.0224}],
                [{'id': 'MANA_DISINTEGRATOR', 'chance': 0.0356}, {'id': 'SCORCHED_BOOKS', 'chance': 0.0203}],
                [{'id': 'KELVIN_INVERTER', 'chance': 0.0254}, {'id': 'BLAZE_ROD_DISTILLATE', 'chance': 0.0457, 'min': 16, 'max': 24}, {'id': 'GLOWSTONE_DUST_DISTILLATE', 'chance': 0.0457, 'min': 16, 'max': 24}, {'id': 'MAGMA_CREAM_DISTILLATE', 'chance': 0.0457, 'min': 16, 'max': 24}, {'id': 'NETHER_STALK_DISTILLATE', 'chance': 0.0457, 'min': 16, 'max': 24}, {'id': 'CRUDE_GABAGOOL_DISTILLATE', 'chance': 0.0254, 'min': 16, 'max': 24}],
                [{'id': 'SCORCHED_POWER_CRYSTAL', 'chance': 0.0305}, {'id': 'ARCHFIEND_DICE', 'chance': 0.0102}],
                [{'id': 'ENCHANTMENT_FIRE_ASPECT_3', 'chance': 0.0127}, {'id': 'RUNE_FIERY_BURST', 'chance': 0.002}, {'id': 'FLAWED_OPAL_GEM', 'chance': 0.0279, 'min': 240, 'max': 400}],
                [{'id': 'ENCHANTMENT_ULTIMATE_REITERATE_1', 'chance': 0.0178}],
                [{'id': 'HIGH_CLASS_ARCHFIEND_DICE', 'chance': 0.0025}, {'id': 'WILSON_ENGINEERING_PLANS', 'chance': 0.0009}, {'id': 'SUBZERO_INVERTER', 'chance': 0.0009}]
            ]
        },
    },
    // TODO: Include Vampire slayer
    'Vampire':{}
};

module.exports = drops;