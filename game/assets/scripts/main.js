var res = Renderer.getResolution()
var camera = {
    pos: new Vector2(0, 0),
    zoom: 1.0
}
var bubble_font = getFont("bubble.fnt");
var mouse_pos = new Vector2(0, 0);
var screen_transform = new Matrix();
var score = 0;

Input.setMouseIcon("needle.png", 0, 64);

init_uis();
init_upgrades()
init_waves()
init_bath()
init_bubbles()
init_bursts();
init_flares();
init_perks();
init_store();

// Left HUD UI
var lbl_wave = parent_ui(ui_root, create_ui("label", new Vector2(-150, 16), "Wave 0"));
var lbl_countdown = parent_ui(ui_root, create_ui("label", new Vector2(-150, 46), "Countdown 0"));
var lbl_score = parent_ui(ui_root, create_ui("label", new Vector2(-150, 76), "Score 0"));
var lbl_goal = parent_ui(ui_root, create_ui("label", new Vector2(-150, 106), "Goal 0"));

// Perks
var perk_slots = [
    parent_ui(ui_root, create_ui("frame", new Vector2(BATH_SIZE.x + 50, 16))),
    parent_ui(ui_root, create_ui("frame", new Vector2(BATH_SIZE.x + 50, 16 + 96))),
    parent_ui(ui_root, create_ui("frame", new Vector2(BATH_SIZE.x + 50, 16 + 96 * 2))),
    parent_ui(ui_root, create_ui("frame", new Vector2(BATH_SIZE.x + 50, 16 + 96 * 3))),
]

for (var i = 0; i < perk_slots.length; ++i)
{
    var perk_slot = perk_slots[i];
    perk_slot.rect.w = 76;
    perk_slot.rect.h = 76;
    perk_slot.bg_image = getTexture("ui_slot_bg.png");
    perk_slot.perk = null;
    perk_slot.tooltip = render_perk_toolkit;
}

//--- Store UI
var store_slots = [];
{
    // Frame
    var frm_store = parent_ui(ui_root, create_ui("frame", new Vector2(BATH_SIZE.x * 0.5 - 200, BATH_SIZE.y * 2)));
    frm_store.rect.w = 400
    frm_store.rect.h = 600
    frm_store.color = Color.fromHexRGB(0xf6e9c7);

    // Title
    var lbl_title = parent_ui(frm_store, create_ui("label", new Vector2(200, 20), "Upgrades"));
    lbl_title.outline = true;

    for (var i = 0; i < 3; ++i)
    {
        var perk_slot = parent_ui(frm_store, create_ui("button", new Vector2(200 - 32, 150 + i * 150)));
        perk_slot.rect.w = 76;
        perk_slot.rect.h = 76;
        perk_slot.bg_image = getTexture("ui_slot_bg.png");
        perk_slot.perk = null;
        perk_slot.tooltip = render_perk_toolkit;
        perk_slot.on_click = chose_story_perk;
        store_slots.push(perk_slot);

        parent_ui(perk_slot, create_ui("label", new Vector2(perk_slot.rect.w * 0.5, -24), "^001PerkName"));
    }
}

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
    if (wave.state == "in wave")
    {
        if (Input.isJustDown(Key.MOUSE_1))
        {
            var bubble = get_bubble_at(mouse_pos);
            if (bubble)
            {
                poke_bubble(bubble);
            }
        }
    }

    lbl_wave.text = "Wave ^986" + wave.number;
    lbl_countdown.text = "Countdown ^986" + Math.ceil(wave.countdown);
    lbl_score.text = "Score ^986" + score;
    lbl_goal.text = "Goal ^986" + wave.score_goal;
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

    render_waves_overlay();

    SpriteBatch.begin(screen_transform);
    render_uis();
    render_tooltip();
    SpriteBatch.end();
}

function renderUI()
{
}
