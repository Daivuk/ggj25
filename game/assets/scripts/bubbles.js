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
    return {
        pos: pos,
        radius: 5,
        stress: 0,
        life: 1,
        t: 0,
        shaking: false,
        shaking_t: 0,
        burst_timer: 0,
        score: 0
    };
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

function spawn_bubble()
{
    // Find a free spot
    for (var i = 0; i < 100; ++i)
    {
        var pos = Random.randVector2(BATH_SIZE);
        if (get_bubble_at(pos)) continue;
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
            bubble.score = -10;
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

function burst_bubble(bubble)
{
    bubbles.splice(bubbles.indexOf(bubble), 1);
    add_burst(bubble.pos, bubble.radius);
    score += bubble.score;

    if (bubble.score > 0)
    {
        if (bubble.score >= 10)
            add_flare(bubble.pos, "+" + bubble.score, Color.fromHexRGB(0x23d245), FLARE_STYLE_AMAZING);
        else
            add_flare(bubble.pos, "+" + bubble.score, Color.fromHexRGB(0x23d245), FLARE_STYLE_GOOD);
    }
    else if (bubble.score < 0)
        add_flare(bubble.pos, bubble.score, Color.fromHexRGB(0xe43113), FLARE_STYLE_BAD);

    playSoundCue("pop.cue", 1);

    // Burst neighbors
    for (var i = 0; i < bubbles.length; ++i)
    {
        var other_bubble = bubbles[i];
        var dist = bubble.radius + other_bubble.radius;
        if (Vector2.distance(bubble.pos, other_bubble.pos) < dist + 5)
        {
            if (other_bubble.burst_timer == 0)
            {
                other_bubble.burst_timer = Random.randNumber(.09, .11);
                other_bubble.score = bubble.score * 2;
            }
        }
    }
}

function poke_bubble(bubble)
{
    bubble.life--;
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
        PrimitiveBatch.draw(pos.add(new Vector2(cos_theta * radius, sin_theta * radius)), Color.WHITE, edge_uvs);

        cos_theta = Math.cos(next_angle);
        sin_theta = Math.sin(next_angle);
        PrimitiveBatch.draw(pos.add(new Vector2(cos_theta * radius, sin_theta * radius)), Color.WHITE, edge_uvs);

        PrimitiveBatch.draw(pos, Color.WHITE, center_uvs);
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
