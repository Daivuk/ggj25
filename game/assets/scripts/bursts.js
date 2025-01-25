var bursts = []
var burst_texture = getTexture("burst.png")

function init_bursts()
{
    bursts = []
}

function add_burst(pos, radius)
{
    var burst = {
        pos: pos,
        radius: radius,
        t: 0,
        angle: Random.getNext(360)
    };
    bursts.push(burst);
}

function update_bursts(dt)
{
    for (var i = 0; i < bursts.length; ++i)
    {
        var burst = bursts[i];
        burst.t += 15 * dt;
        if (burst.t >= 1)
        {
            bursts.splice(i, 1);
            --i;
        }
    }
}

function render_bursts()
{
    for (var i = 0; i < bursts.length; ++i)
    {
        var burst = bursts[i];
        var scale = (1 + burst.t) * 0.5 * burst.radius / 64;
        var alpha = 1 - burst.t;
        SpriteBatch.drawSprite(burst_texture, burst.pos, new Color(alpha), burst.angle, scale);
    }
}
