var res = Renderer.getResolution()
var camera = {
    pos: new Vector2(0, 0),
    zoom: 1.0
}
var bubble_font = getFont("bubble.fnt");
var mouse_pos = new Vector2(0, 0);
var screen_transform = new Matrix();
var score = 0;
var fireworks_delay = 0.6;
var fireworks_count = 0;

// Preload assets
getSound("bad_score.wav");
getSound("button.wav");
getSound("buy.wav");
getSound("good_score.wav");
getSound("hurry.wav");
getSound("pop0.wav");
getSound("pop1.wav");
getSound("pop2.wav");
getSound("pop3.wav");
getSound("pop4.wav");
getSound("pop5.wav");
getSound("squeeze2.wav");
getSound("squeeze3.wav");
getSound("squeeze4.wav");
getSound("squeeze5.wav");
getSound("squeeze6.wav");
getSound("squeeze7.wav");
getSound("wave_completed.wav");
getSound("ding0.wav");
getSound("ding1.wav");
getSound("ding2.wav");
getSound("fail.wav");
getSound("win.wav");
getSound("firework.wav");

Input.setMouseIcon("needle.png", 0, 64);

init_uis();
init_upgrades()
init_particles();
init_waves()
init_bath()
init_bubbles()
init_bursts();
init_flares();
init_perks();
init_store();

var game_state = "main_menu";
create_main_menu_uis();

function create_main_menu_uis()
{
    // Title logo
    var logo_pos = new Vector2(240, 120);

    parent_ui(ui_root, create_ui("image", new Vector2(logo_pos.x + 0, logo_pos.y + 0), null, "title_b1.png")).floaty = true;
    parent_ui(ui_root, create_ui("image", new Vector2(logo_pos.x + 90, logo_pos.y + 45), null, "title_u1.png")).floaty = true;
    parent_ui(ui_root, create_ui("image", new Vector2(logo_pos.x + 180, logo_pos.y - 5), null, "title_b2.png")).floaty = true;
    parent_ui(ui_root, create_ui("image", new Vector2(logo_pos.x + 280, logo_pos.y - 20), null, "title_b3.png")).floaty = true;
    parent_ui(ui_root, create_ui("image", new Vector2(logo_pos.x + 355, logo_pos.y - 24), null, "title_l.png")).floaty = true;
    parent_ui(ui_root, create_ui("image", new Vector2(logo_pos.x + 450, logo_pos.y + 10), null, "title_e.png")).floaty = true;

    var burst_pos = logo_pos.add(new Vector2(200, 200));
    parent_ui(ui_root, create_ui("image", new Vector2(burst_pos.x + 0, burst_pos.y + 0), null, "title_b4.png")).floaty = true;
    parent_ui(ui_root, create_ui("image", new Vector2(burst_pos.x + 75, burst_pos.y + 25), null, "title_u2.png")).floaty = true;
    parent_ui(ui_root, create_ui("image", new Vector2(burst_pos.x + 130, burst_pos.y + 20), null, "title_r.png")).floaty = true;
    parent_ui(ui_root, create_ui("image", new Vector2(burst_pos.x + 170, burst_pos.y + 20), null, "title_s.png")).floaty = true;
    parent_ui(ui_root, create_ui("image", new Vector2(burst_pos.x + 220, burst_pos.y - 5), null, "title_t.png")).floaty = true;


    var frm_menu = parent_ui(ui_root, create_ui("frame", new Vector2(BATH_SIZE.x * 0.5 - 200, BATH_SIZE.y * 0.5 + 0)));
    frm_menu.rect.w = 400
    frm_menu.rect.h = 300
    frm_menu.color = Color.fromHexRGB(0xf6e9c7);

    // Title
    parent_ui(frm_menu, create_ui("label", new Vector2(200, 32), "Main Menu")).outline = true

    var play_button = parent_ui(frm_menu, create_ui("button", new Vector2(100, 120), "Play"))
    play_button.color = Color.fromHexRGB(0x012f3b)
    play_button.rect.w = 200;
    play_button.rect.h = 32;
    play_button.on_click = function(ui)
    {
        playSound("button.wav");
        game_state = "game"
        init_uis();
        create_game_uis();
        start_wave();
    }

    var quit_btn = parent_ui(frm_menu, create_ui("button", new Vector2(100, 180), "Quit"))
    quit_btn.color = Color.fromHexRGB(0x012f3b)
    quit_btn.rect.w = 200;
    quit_btn.rect.h = 32;
    quit_btn.on_click = function(ui)
    {
        playSound("button.wav");
        setTimeout(function()
        {
            quit();
        }, 100);
    }
}

var lbl_wave;
var lbl_countdown;
var lbl_score;
var lbl_goal;
var store_slots = [];
var perk_slots = [];
var frm_store;
var passive_slots = [];
var frm_fail;
var frm_win;

function create_game_uis()
{
    // Left HUD UI
    lbl_wave = parent_ui(ui_root, create_ui("label", new Vector2(-150, 16), "Wave 0"));
    lbl_countdown = parent_ui(ui_root, create_ui("label", new Vector2(-150, 46), "Countdown 0"));
    lbl_score = parent_ui(ui_root, create_ui("label", new Vector2(-150, 76), "Score 0"));
    lbl_goal = parent_ui(ui_root, create_ui("label", new Vector2(-150, 106), "Goal 0"));

    // Perks
    perk_slots = [
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

    // Passives
    passive_slots = [];
    {
        var needle_passive_ui = parent_ui(ui_root, create_ui("image", new Vector2(BATH_SIZE.x + 50, 16 + 96 * 5), null, "perks.png"));
        needle_passive_ui.rect.w = 76;
        needle_passive_ui.rect.h = 76;
        needle_passive_ui.click_through = false;
        needle_passive_ui.perk = get_passive("Needle").perk;
        needle_passive_ui.image_uvs = needle_passive_ui.perk.icon_uvs;
        needle_passive_ui.tooltip = render_perk_toolkit;

        parent_ui(needle_passive_ui, create_ui("label", new Vector2(64, 64), "0")).outline = true;
        passive_slots.push(needle_passive_ui);
    }

    //--- Store UI
    store_slots = [];
    {
        // Frame
        frm_store = parent_ui(ui_root, create_ui("frame", new Vector2(BATH_SIZE.x * 0.5 - 200, BATH_SIZE.y * 2)));
        frm_store.rect.w = 400
        frm_store.rect.h = 600
        frm_store.color = Color.fromHexRGB(0xf6e9c7);

        // Title
        var lbl_title = parent_ui(frm_store, create_ui("label", new Vector2(200, 32), "Upgrades"));
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

    //--- Fail UI
    {
        frm_fail = parent_ui(ui_root, create_ui("frame", new Vector2(BATH_SIZE.x * 0.5 - 200, BATH_SIZE.y * 2)));
        frm_fail.rect.w = 400
        frm_fail.rect.h = 300
        frm_fail.color = Color.fromHexRGB(0xf6e9c7);

        // Title
        var lbl_title = parent_ui(frm_fail, create_ui("label", new Vector2(200, 34), "^000Game Over"));
        var lbl_title = parent_ui(frm_fail, create_ui("label", new Vector2(200, 32), "^821Game Over"));
        // lbl_title.outline = true;
            
        var play_button = parent_ui(frm_fail, create_ui("button", new Vector2(100, 120), "Play Again"))
        play_button.color = Color.fromHexRGB(0x012f3b)
        play_button.rect.w = 200;
        play_button.rect.h = 32;
        play_button.on_click = function(ui)
        {
            playSound("button.wav");
            game_state = "game"
                        
            init_uis();
            init_upgrades()
            init_particles();
            init_waves()
            init_bath()
            init_bubbles()
            init_bursts();
            init_flares();
            init_perks();
            init_store();

            create_game_uis();
            create_wave();
            start_wave();
        }

        var quit_btn = parent_ui(frm_fail, create_ui("button", new Vector2(100, 180), "Quit"))
        quit_btn.color = Color.fromHexRGB(0x012f3b)
        quit_btn.rect.w = 200;
        quit_btn.rect.h = 32;
        quit_btn.on_click = function(ui)
        {
            playSound("button.wav");
            setTimeout(function()
            {
                quit();
            }, 100);
        }
    }

    //--- Success UI
    {
        frm_win = parent_ui(ui_root, create_ui("frame", new Vector2(BATH_SIZE.x * 0.5 - 250, BATH_SIZE.y * 2)));
        frm_win.rect.w = 500
        frm_win.rect.h = 320
        frm_win.color = Color.fromHexRGB(0xf6e9c7);

        // Title
        var lbl_title = parent_ui(frm_win, create_ui("label", new Vector2(250, 34), "^000YOU WIN !!!"));
        var lbl_title = parent_ui(frm_win, create_ui("label", new Vector2(250, 32), "^285YOU WIN !!!"));
        // lbl_title.outline = true;

        var lbl_subtitle = parent_ui(frm_win, create_ui("label", new Vector2(250, 80), "You completed all waves!"));
        lbl_subtitle.outline = true;
            
        var play_button = parent_ui(frm_win, create_ui("button", new Vector2(150, 140), "Play Again"))
        play_button.color = Color.fromHexRGB(0x012f3b)
        play_button.rect.w = 200;
        play_button.rect.h = 32;
        play_button.on_click = function(ui)
        {
            playSound("button.wav");
            game_state = "game"
                        
            init_uis();
            init_upgrades()
            init_particles();
            init_waves()
            init_bath()
            init_bubbles()
            init_bursts();
            init_flares();
            init_perks();
            init_store();

            create_game_uis();
            create_wave();
            start_wave();
        }

        var quit_btn = parent_ui(frm_win, create_ui("button", new Vector2(150, 200), "Quit"))
        quit_btn.color = Color.fromHexRGB(0x012f3b)
        quit_btn.rect.w = 200;
        quit_btn.rect.h = 32;
        quit_btn.on_click = function(ui)
        {
            playSound("button.wav");
            setTimeout(function()
            {
                quit();
            }, 100);
        }
    }

    // {
    //     var hackPerk = get_perk("Self-discipline")
    //     var perk_slot = perk_slots[0];
        
    //     perk_slot.perk = hackPerk;
    //     perk_slot.image_uvs = perk_slot.perk.icon_uvs;
    //     perk_slot.image = perks_texture;

    //     playSound("buy.wav");
    // }
}

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
    update_particles(dt);
    update_uis(dt);
    if (game_state == "game")
    {
        update_waves(dt)
    }
    update_bath(dt);
    udpate_bubbles(dt)
    update_bursts(dt)
    update_flares(dt);

    if (game_state == "game")
    {
        if (wave.state == "in wave")
        {
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

        lbl_wave.text = "Wave ^986" + wave.number;
        lbl_countdown.text = "Countdown ^986" + Math.ceil(wave.countdown);
        lbl_score.text = "Score ^986" + score;
        lbl_goal.text = "Goal ^986" + wave.score_goal;

        // Update passive levels
        for (var i = 0; i < passive_slots.length; ++i)
        {
            var passive_slot = passive_slots[i];
            passive_slot.children[0].text = "" + get_passive(passive_slot.perk.name).level;
        }
    // {
    //     var needle_passive_ui = parent_ui(ui_root, create_ui("image", new Vector2(BATH_SIZE.x + 50, 16 + 96 * 5), null, "perks.png"));
    //     needle_passive_ui.rect.w = 76;
    //     needle_passive_ui.rect.h = 76;
    //     needle_passive_ui.click_through = false;
    //     needle_passive_ui.perk = get_passive("Needle").perk;
    //     needle_passive_ui.image_uvs = needle_passive_ui.perk.icon_uvs;
    //     needle_passive_ui.tooltip = render_perk_toolkit;

    //     parent_ui(needle_passive_ui, create_ui("label", new Vector2(64, 64), "0")).outline = true;
    //     passive_slots.push(needle_passive_ui);
    // }

        if (wave.state == "win")
        {
            fireworks_delay -= dt;
            if (fireworks_delay <= 0 && fireworks_count < 10)
            {
                ++fireworks_count;
                fireworks_delay = 0.6;
                var pos = Random.randVector2(new Vector2(0, 50), new Vector2(BATH_SIZE.x, BATH_SIZE.y - 150));
                for (var i = 0; i < 100; ++i)
                {
                    add_particle(Random.randCircleEdge(pos, 75), Random.randColor().add(new Color(0.5)));
                }
                playSound("firework.wav", 1, 0, Random.randNumber(1.0, 1.2));
            }
        }
    }
}

function render()
{
    Renderer.clear(Color.BLACK);

    update_camera();

    render_bath();
    render_bubbles()

    SpriteBatch.begin(screen_transform);
    render_bursts();
    SpriteBatch.end();

    render_flares();

    SpriteBatch.begin(screen_transform);
    render_waves_overlay();
    render_uis();
    render_tooltip();
    render_particles();
    SpriteBatch.end();
}

function renderUI()
{
}
