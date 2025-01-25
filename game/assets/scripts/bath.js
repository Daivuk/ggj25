var BATH_SIZE = new Vector2(1000, 1000);
var BATH_PADDING = 20;

function init_bath()
{
}

function update_bath(dt)
{
}

function render_bath()
{
    SpriteBatch.drawRect(null, new Rect(0, 0, BATH_SIZE), Color.fromHexRGB(0x229bb9)/*.mul(new Color(0.65))*/);
}
