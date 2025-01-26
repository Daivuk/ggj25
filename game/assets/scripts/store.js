function init_store()
{
}

function populate_store()
{
    store_slots[0].perk = null;
    store_slots[1].perk = null;
    store_slots[2].perk = null;

    // store_slots[0].perk = get_perk("Needle");
    // store_slots[1].perk = get_perk("Tip");
    // store_slots[2].perk = get_perk("Proximity");

    var available_perks = []
    for (var i = 0; i < PERKS.length; ++i)
    {
        var perk = PERKS[i];
        // If it's an upgrade, check that we don't already have the max level
        if (perk.upgrade)
        {
            var passive = get_passive(perk.name);
            if (!passive) continue; // We start with level 0 of everything
            if (passive.level < perk.levels.length - 1)
            {
                available_perks.push(perk);
            }
            continue;
        }
        available_perks.push(perk);
    }

    // Distribute the perks by rarity
    var rarities = [[],[],[],[]];
    var upgrades = [];
    for (var i = 0; i < available_perks.length; ++i)
    {
        var perk = available_perks[i];
        if (perk.upgrade)
        {
            upgrades.push(perk);
        }
        else
        {
            rarities[perk.rarity].push(perk);
        }
    }

    for (var i = 0; i < 3; ++i)
    {
        var store_slot = store_slots[i];
        if ((Random.randBool(0.5) && upgrades.length) > 0 ||
            (rarities[RARITY_COMMON].length == 0 && rarities[RARITY_UNCOMMON].length == 0 && rarities[RARITY_RARE].length == 0 && rarities[RARITY_LEGENDARY].length == 0))
        {
            store_slot.perk = upgrades.splice(Random.getNext(upgrades.length), 1)[0];
        }
        else if (Random.randBool(0.7) && rarities[RARITY_COMMON].length > 0 ||
            (rarities[RARITY_UNCOMMON].length == 0 && rarities[RARITY_RARE].length == 0 && rarities[RARITY_LEGENDARY].length == 0))
        {
            store_slot.perk = rarities[RARITY_COMMON].splice(Random.getNext(rarities[RARITY_COMMON].length), 1)[0];
        }
        else if (Random.randBool(0.83) && rarities[RARITY_UNCOMMON].length > 0 ||
            (rarities[RARITY_RARE].length == 0 && rarities[RARITY_LEGENDARY].length == 0))
        {
            store_slot.perk = rarities[RARITY_UNCOMMON].splice(Random.getNext(rarities[RARITY_UNCOMMON].length), 1)[0];
        }
        else if (Random.randBool(0.9) && rarities[RARITY_RARE].length > 0 ||
            (rarities[RARITY_LEGENDARY].length == 0))
        {
            store_slot.perk = rarities[RARITY_RARE].splice(Random.getNext(rarities[RARITY_RARE].length), 1)[0];
        }
        else if (rarities[RARITY_LEGENDARY].length > 0)
        {
            store_slot.perk = rarities[RARITY_LEGENDARY].splice(Random.getNext(rarities[RARITY_LEGENDARY].length), 1)[0];
        }
        else
        {
            // No more to put in store! (Is that even possible?)
            print("ERROR: No more item to fill store");
            return;
        }

        store_slot.image_uvs = store_slot.perk.icon_uvs;
        store_slot.image = perks_texture;
        store_slot.children[0].text = "^001" + store_slot.perk.name;
    }
}

function chose_story_perk(ui)
{
    if (wave.state != "show score") return;

    if (ui.perk.upgrade)
    {
        var passive = get_passive(ui.perk.name);
        if (passive)
        {
            passive.level++;
            wave.state = "hide score"
            wave.state_time = 0;
            playSound("buy.wav");
            return;
        }

        // Shouldn't happen
        playSound("bad_score.wav");
        return;
    }
    else
    {
        for (var i = 0; i < perk_slots.length; ++i)
        {
            var perk_slot = perk_slots[i];
            if (!perk_slot.perk)
            {
                perk_slot.perk = ui.perk;
                perk_slot.image_uvs = perk_slot.perk.icon_uvs;
                perk_slot.image = perks_texture;
                for (var j = 0; j < 75; ++j)
                {
                    var pos = new Vector2(perk_slot.world_rect.x - 5, perk_slot.world_rect.y).add(randomPointOnRoundedSquareEdge(perk_slot.rect.w + 10, 7));
                    add_particle(pos, Random.randColor(Color.fromHexRGB(0xf5deb3), Color.fromHexRGB(0xed8848)));
                }
                wave.state = "hide score"
                wave.state_time = 0;
                playSound("buy.wav");
                return;
            }
        }

        // Error! No more room
        playSound("bad_score.wav");
        return;
    }
}
