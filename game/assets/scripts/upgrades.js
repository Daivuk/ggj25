var upgrades = create_upgrades();

function create_upgrades()
{
    return {
        max_bubble_radius: 75,
        bubble_grow_speed: 10,
        slows_down_pow: 2
    }
}

function init_upgrades()
{
    upgrades = create_upgrades();
}
