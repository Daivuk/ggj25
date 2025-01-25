var res = Renderer.getResolution()
var camera = {
    pos: new Vector2(0, 0),
    zoom: 1.0
}
var bubble_font = getFont("bubble.fnt");
var mouse_pos = new Vector2(0, 0);
var screen_transform = new Matrix();
var score = 0;

init_uis();
init_upgrades()
init_waves()
init_bath()
init_bubbles()
init_bursts();
init_flares();
start_wave();

function update_camera()
{
    res = Renderer.getResolution()
    var desired_h = BATH_SIZE.y + BATH_PADDING * 2;
    camera.zoom = res.y / desired_h;

    screen_transform = Matrix.create2DTranslationZoom(camera.pos, camera.zoom).mul(
        Matrix.createTranslation(new Vector3(-BATH_SIZE.x * 0.5 * camera.zoom, -BATH_SIZE.y * 0.5 * camera.zoom, 0)));
    var inv = screen_transform.invert();
    mouse_pos = new Vector2(new Vector3(Input.getMousePos()).transform(inv));
}

function update(dt)
{
    update_camera();
    update_uis(dt);
    update_waves(dt)
    update_bath(dt);
    udpate_bubbles(dt)
    update_bursts(dt)
    update_flares(dt);

    // Pop bubble
    if (Input.isJustDown(Key.MOUSE_1))
    {
        var bubble = get_bubble_at(mouse_pos);
        if (bubble)
        {
            poke_bubble(bubble);
        }
    }
}

function render()
{
    Renderer.clear(Color.BLACK);

    update_camera();

    render_bath();

    PrimitiveBatch.begin(PrimitiveMode.TRIANGLE_LIST, getTexture("bubble.png"), screen_transform);
    render_bubbles()
    PrimitiveBatch.end();

    SpriteBatch.begin(screen_transform);
    render_bursts();
    SpriteBatch.end();
    render_flares();

    SpriteBatch.begin(screen_transform);
    render_uis();
    SpriteBatch.drawText(bubble_font, "Wave " + wave.number, new Vector2(-8, 10), Vector2.TOP_RIGHT);
    SpriteBatch.drawText(bubble_font, "Countdown " + Math.ceil(wave.countdown), new Vector2(-8, 40), Vector2.TOP_RIGHT);
    SpriteBatch.drawText(bubble_font, "Score " + score, new Vector2(-8, 70), Vector2.TOP_RIGHT);
    SpriteBatch.drawText(bubble_font, "Goal " + wave.score_goal, new Vector2(-8, 100), Vector2.TOP_RIGHT);
    SpriteBatch.end();
}

function renderUI()
{
}
