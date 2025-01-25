var upgrades = create_upgrades();

function create_upgrades()
{
    return {
        max_bubble_radius: 75,
        bubble_grow_speed: 10,
        slows_down_pow: 2,
        passives: [
            {
                level: 0,
                perk: get_perk("Needle")
            }
        ]
    }
}

function get_passive(name)
{
    for (var i = 0; i < upgrades.passives.length; ++i)
    {
        var passive = upgrades.passives[i];
        if (passive.perk.name == name) return passive;
    }
    return null;
}

function init_upgrades()
{
    upgrades = create_upgrades();
}
