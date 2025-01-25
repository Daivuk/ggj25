var BATH_SIZE = new Vector2(1000, 1000);
var BATH_PADDING = 20;
var bath_anim = 0;

var water_texture = getTexture("water.png");
var water_shader = getShader("water.ps");

function init_bath()
{
}

function update_bath(dt)
{
    bath_anim += dt;
}

function render_bath()
{
    water_shader.setNumber("anim", bath_anim);

    SpriteBatch.begin(screen_transform, water_shader);
    SpriteBatch.drawRect(water_texture, new Rect(0, 0, BATH_SIZE.x, BATH_SIZE.y), Color.fromHexRGB(0x229bb9));
    SpriteBatch.end();
}
