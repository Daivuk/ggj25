var RARITY_COMMON = 0;
var RARITY_UNCOMMON = 1;
var RARITY_RARE = 2;
var RARITY_LEGENDARY = 3;

var RARITY_COLORS = [
    Color.fromHexRGB(0xd6f4e9).mul(new Color(0.5, 0.5, 0.5, 1)),
    Color.fromHexRGB(0x45e98d),
    Color.fromHexRGB(0xe43113),
    Color.fromHexRGB(0xf2e487),
];

var RARITY_TEXTS = [
    "Common",
    "Uncommon",
    "Rare",
    "Legendary"
];

var COL_POSITIVE = "^285"
var perks_texture = getTexture("perks.png");

function init_perks()
{
}

function get_perk_uvs(index)
{
    var row = Math.floor(index / 8);
    var col = index % 8;
    return new Vector4(
        col / 8,
        row / 8,
        (col + 1) / 8,
        (row + 1) / 8
    );
}

var PERKS = [
    //--- COMMON
    {
        name: "Tip",
        description: "Add " + COL_POSITIVE + "2^999 points per scoring",
        rarity: RARITY_COMMON,
        icon_uvs: get_perk_uvs(1),
        on_score: function(score)
        {
            return score + 2
        }
    },
    {
        name: "Pointy",
        description: "Add " + COL_POSITIVE + "2^999 damage to needle",
        rarity: RARITY_COMMON,
        icon_uvs: get_perk_uvs(0),
        on_poke: function(damage)
        {
            return damage + 2
        }
    },

    //--- UNCOMMON
    {
        name: "Long Arm",
        description: "Increase neighbor bursts distance by " + COL_POSITIVE + "25%",
        rarity: RARITY_UNCOMMON,
        icon_uvs: get_perk_uvs(2),
        get_burst_dist: function(distance)
        {
            return distance * 1.25;
        }
    },

    //--- RARE
    {
        name: "Proximity",
        description: "Bubbles spawn close to other bubbles",
        rarity: RARITY_RARE,
        icon_uvs: get_perk_uvs(3),
        get_spawn_range: function(range)
        {
            return 150;
        }
    },

    //--- LEGENDARY
    {
        name: "Self-discipline",
        description: "Bubbles score when bursting by themselves",
        rarity: RARITY_LEGENDARY,
        icon_uvs: get_perk_uvs(5),
        should_self_burst_score: function(should_score)
        {
            return true;
        }
    },

    //--- UPGRADES
    {
        name: "Needle",
        upgrade: true,
        icon_uvs: get_perk_uvs(4),
        levels: [
            {
                on_poke: function(damage, bubble)
                {
                    if (bubble.is_steel) return 0;
                    return damage
                }
            },
            {
                description: "Needle does " + COL_POSITIVE + "50%^999 more damage",
                on_poke: function(damage, bubble)
                {
                    if (bubble.is_steel) return 0;
                    return damage * 1.5
                }
            },
            {
                description: "Needle does " + COL_POSITIVE + "50%^999 more damage",
                on_poke: function(damage, bubble)
                {
                    if (bubble.is_steel) return 0;
                    return damage * 1.5 * 1.5
                }
            },
            {
                description: "Needle can pierce steel bubbles",
                on_poke: function(damage, bubble)
                {
                    return damage * 1.5 * 1.5
                }
            },
            {
                description: "Needle does " + COL_POSITIVE + "100%^999 more damage",
                on_poke: function(damage, bubble)
                {
                    if (bubble.is_steel) return 0;
                    return damage * 1.5 * 1.5 * 2.0
                }
            }
        ]
    }
]

function get_perk(name)
{
    for (var i = 0; i < PERKS.length; ++i)
    {
        var perk = PERKS[i];
        if (perk.name == name) return perk;
    }
    return null;
}

function invoke_perks(fnName, param, arg1)
{
    // Perks
    for (var i = 0; i < perk_slots.length; ++i)
    {
        var img_perk = perk_slots[i];
        var perk = img_perk.perk;
        if (perk && perk.hasOwnProperty(fnName))
        {
            param = perk[fnName](param, arg1);
        }
    }

    // Passives (Bad name, they are all passives)
    for (var i = 0; i < upgrades.passives.length; ++i)
    {
        var passive = upgrades.passives[i];
        var perk = passive.perk.levels[passive.level];
        if (perk.hasOwnProperty(fnName))
        {
            param = perk[fnName](param, arg1);
        }
    }

    return param;
}
