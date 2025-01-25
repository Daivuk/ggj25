var flares = []

var FLARE_STYLE_GOOD = 1
var FLARE_STYLE_AMAZING = 2
var FLARE_STYLE_BAD = 3

function init_flares()
{
    flares = []
}

function add_flare(pos, text, color, style)
{
    var flare = {
        pos: pos,
        text: text,
        color: color,
        t: 0,
        style: style
    }
    flares.push(flare)
}

function update_flares(dt)
{
    for (var i = 0; i < flares.length; ++i)
    {
        var flare = flares[i];
        flare.t += dt * 1.25;
        if (flare.t >= 1)
        {
            flares.splice(i, 1);
            --i;
            continue;
        }
    }
}

function render_flares()
{
    for (var i = 0; i < flares.length; ++i)
    {
        var flare = flares[i];
        var t = flare.t;
        t *= t;
        var pos = flare.pos.add(new Vector2(0, t * -20));
        SpriteBatch.drawPrettyOutlinedText(bubble_font, flare.text, pos, Vector2.CENTER, flare.color, Color.BLACK, 2);
    }
}
