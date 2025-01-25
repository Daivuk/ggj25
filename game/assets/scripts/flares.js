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
    switch (style)
    {
        case FLARE_STYLE_AMAZING:
            playSound("good_score.wav", 0.5);
            break;
        case FLARE_STYLE_BAD:
            playSound("bad_score.wav", 0.5);
            break;
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
        var pos = flare.pos;
        var angle = 0;
        var scale = 1;

        switch (flare.style)
        {
            case FLARE_STYLE_GOOD:
            {
                t = 1 - Math.pow(1 - t, 3);
                pos = flare.pos.add(new Vector2(0, t * -30));
                break;
            }
            case FLARE_STYLE_AMAZING:
            {
                if (t < .5)
                {
                    t *= 2;
                    t = 1 - Math.pow(1 - t, 3);
                    scale = 1 + (.5 * t);
                }
                else
                {
                    scale = 1.5;
                }
                break;
            }
            case FLARE_STYLE_BAD:
            {
                var inv_t = 1 - t;
                angle = Math.sin(t * 30) * 20 * inv_t;
                break;
            }
        }

        // Ya... onut still doesnt support transformed text. So I have to draw a batch for each with a custom matrix
        SpriteBatch.begin(
            Matrix.createRotationZ(angle).mul(
            Matrix.createScale(scale).mul(
            screen_transform).mul(
            Matrix.createTranslation(pos.mul(camera.zoom))
        )));
        SpriteBatch.drawPrettyOutlinedText(bubble_font, flare.text, Vector2.ZERO, Vector2.CENTER, flare.color, Color.BLACK, 2);
        SpriteBatch.end();
    }
}
