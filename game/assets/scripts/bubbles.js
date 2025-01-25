var bubbles = []

function init_bubbles()
{
    bubbles = []
}

function point_inside_bubble(bubble, pos)
{
    var dist = Vector2.distance(bubble.pos, pos);
    return dist < bubble.radius;
}

function get_bubble_at(pos)
{
    for (var i = 0; i < bubbles.length; ++i)
    {
        var bubble = bubbles[i];
        if (point_inside_bubble(bubble, pos))
            return bubble;
    }
    return null;
}

function create_bubble(pos)
{
    var bubble = {
        pos: pos,
        radius: 5,
        stress: 0,
        life: 1,
        t: 0,
        shaking: false,
        shaking_t: 0,
        burst_timer: 0,
        score: 0,
        color: Color.WHITE
    };
    var type = get_random_bubble_type();
    switch (type)
    {
        case "green":
        {
            bubble.color = Color.fromHexRGB(0x23d25b);
            bubble.life = 3;
            break;
        }
        case "steel":
        {
            bubble.is_steel = true;
            break;
        }
    }
    return bubble;
}

function get_bubble_t(bubble)
{
    var t = (1 - Math.pow(1 - bubble.t, upgrades.slows_down_pow));
    t = Math.min(t, 1);
    t = Math.max(t, 0);
    return t;
}

var BUBBLE_SCORE_TABLE = [0, 0, 0, 0, 0, 1, 1, 2, 4, 10];

function calc_bubble_score(bubble)
{
    var t = get_bubble_t(bubble);
    var idx = Math.min(9, Math.floor(t * 10));
    return BUBBLE_SCORE_TABLE[idx];
}

function has_bubble_in_range(pos, range)
{
    range *= range;
    for (var i = 0; i < bubbles.length; ++i)
    {
        var bubble = bubbles[i];
        var dist = Vector2.distanceSquared(bubble.pos, pos);
        if (dist <= range)
            return true;
    }
    return false;
}

function spawn_bubble()
{
    var spawn_distance = BATH_SIZE.length();
    spawn_distance = invoke_perks("get_spawn_range", spawn_distance);

    // Find a free spot
    for (var i = 0; i < 100; ++i)
    {
        var pos = Random.randVector2(BATH_SIZE);
        if (get_bubble_at(pos)) continue;
        if (bubbles.length > 0 && !has_bubble_in_range(pos, spawn_distance)) continue;
        var bubble = create_bubble(pos);
        bubbles.push(bubble);
        return bubble;
    }
    return null;
}

function update_bubble(bubble, dt)
{
    if (bubble.burst_timer > 0)
    {
        bubble.burst_timer -= dt;
        if (bubble.burst_timer <= 0)
        {
            burst_bubble(bubble);
            return false;
        }
    }

    bubble.t += dt * (upgrades.bubble_grow_speed / upgrades.max_bubble_radius);
    if (bubble.t > 1)
    {
        bubble.t = 1;
        if (!bubble.shaking)
        {
            bubble.shaking = true;
        }
    }
    if (bubble.shaking)
    {
        bubble.shaking_t += dt;
        if (bubble.shaking_t > 0.5)
        {
            bubble.score = 0;//-10;
            burst_bubble(bubble);
            return false;
        }
    }
    bubble.radius = upgrades.max_bubble_radius * get_bubble_t(bubble);

    // Push itself away from other bubbles
    bubble.stress = 0;
    for (var i = 0; i < bubbles.length; ++i)
    {
        var other_bubble = bubbles[i];
        if (bubble == other_bubble) continue;

        var sizes = bubble.radius + other_bubble.radius;
        var dist_sqr = Vector2.distanceSquared(bubble.pos, other_bubble.pos);
        if (dist_sqr < sizes * sizes)
        {
            var dist = Math.sqrt(dist_sqr);
            bubble.stress += 1 - (dist / sizes);
            var dir = bubble.pos.sub(other_bubble.pos);
            bubble.pos = bubble.pos.add(dir.mul(dt));
        }
    }

    // Push against edges of the bath
    if (bubble.pos.x - bubble.radius < 0) bubble.pos.x = bubble.radius;
    if (bubble.pos.y - bubble.radius < 0) bubble.pos.y = bubble.radius;
    if (bubble.pos.x + bubble.radius > BATH_SIZE.x) bubble.pos.x = BATH_SIZE.x - bubble.radius;
    if (bubble.pos.y + bubble.radius > BATH_SIZE.y) bubble.pos.y = BATH_SIZE.y - bubble.radius;

    if (bubble.stress > 0.35)
    {
        bubble.shaking = true
    }

    return true;
}

function udpate_bubbles(dt)
{
    if (wave.state == "show score")
    {
        for (var i = 0; i < bubbles.length; ++i)
        {
            var bubble = bubbles[i];
            bubble.radius -= dt * 50;
            if (bubble.radius <= 0)
            {
                bubbles.splice(i, 1);
                --i;
                continue;
            }
        }
    }
    else
    {
        for (var i = 0; i < bubbles.length; ++i)
        {
            var bubble = bubbles[i];
            if (!update_bubble(bubble, dt))
            {
                --i;
                continue;
            }
        }
    }
}

function burst_bubble(bubble)
{
    bubbles.splice(bubbles.indexOf(bubble), 1);
    add_burst(bubble.pos, bubble.radius);
    var scoring = invoke_perks("on_score", bubble.score);
    score += scoring;

    if (scoring > 0)
    {
        if (scoring >= 10)
            add_flare(bubble.pos, "+" + scoring, Color.fromHexRGB(0x23d245), FLARE_STYLE_AMAZING);
        else
            add_flare(bubble.pos, "+" + scoring, Color.fromHexRGB(0x23d245), FLARE_STYLE_GOOD);
    }
    else if (scoring < 0)
        add_flare(bubble.pos, "" + scoring, Color.fromHexRGB(0xe43113), FLARE_STYLE_BAD);

    playSoundCue("pop.cue", 1);

    // Burst neighbors
    for (var i = 0; i < bubbles.length; ++i)
    {
        var other_bubble = bubbles[i];
        if (other_bubble.burst_timer == 0)
        {
            var burst_dist = invoke_perks("get_burst_dist", bubble.radius + other_bubble.radius);
            if (Vector2.distance(bubble.pos, other_bubble.pos) < burst_dist + 5)
            {
                other_bubble.burst_timer = Random.randNumber(.09, .11);
                other_bubble.score = Math.ceil(get_bubble_t(other_bubble) * bubble.score * 2);
            }
        }
    }
}

function poke_bubble(bubble)
{
    bubble.life = Math.max(0, bubble.life - invoke_perks("on_poke", 1, bubble));
    if (bubble.life <= 0)
    {
        bubble.score = calc_bubble_score(bubble);
        burst_bubble(bubble);
    }
}

function render_bubble(bubble)
{
    var pos = bubble.pos.add(new Vector2(Math.sin(bubble.shaking_t * 50) * 3, 0));

    var radius = bubble.radius;
    var edge_uvs = new Vector2(1 / 256, 0);
    var center_uvs = new Vector2(Math.min(radius / 190, 0.99), 0);
    var sides = 8 + Math.floor(radius / 2);
    for (var i = 0; i < sides; ++i)
    {
        var t = i / sides;
        edge_uvs.y = t;
        center_uvs.y = t;

        var angle = t * Math.PI * 2;
        var next_angle = ((i + 1) / sides) * Math.PI * 2;

        var cos_theta = Math.cos(angle);
        var sin_theta = Math.sin(angle);
        PrimitiveBatch.draw(pos.add(new Vector2(cos_theta * radius, sin_theta * radius)), bubble.color, edge_uvs);

        cos_theta = Math.cos(next_angle);
        sin_theta = Math.sin(next_angle);
        PrimitiveBatch.draw(pos.add(new Vector2(cos_theta * radius, sin_theta * radius)), bubble.color, edge_uvs);

        PrimitiveBatch.draw(pos, bubble.color, center_uvs);
    }
}

function render_bubbles()
{
    for (var i = 0; i < bubbles.length; ++i)
    {
        var bubble = bubbles[i];
        render_bubble(bubble);
    } 
}
