var wave = create_wave();
var hurry_sound = createSoundInstance("hurry.wav")

var WAVES = [
    {
        score_goal: 100,
        spawn_rate: 1,
        normal_bubbles_chances: 10,
        green_bubbles_chances: 1,
        steel_bubbles_chances: 0
    },
    {
        score_goal: 250,
        spawn_rate: 1.2,
        normal_bubbles_chances: 10,
        green_bubbles_chances: 3,
        steel_bubbles_chances: 0
    },
    {
        score_goal: 500,
        spawn_rate: 1.5,
        normal_bubbles_chances: 40,
        green_bubbles_chances: 10,
        steel_bubbles_chances: 1
    },
    {
        score_goal: 700,
        spawn_rate: 2.5,
        normal_bubbles_chances: 40,
        green_bubbles_chances: 20,
        steel_bubbles_chances: 5
    },
    {
        score_goal: 1500,
        spawn_rate: 2.5,
        normal_bubbles_chances: 40,
        green_bubbles_chances: 30,
        steel_bubbles_chances: 10
    },
    {
        score_goal: 3000,
        spawn_rate: 2.5,
        normal_bubbles_chances: 40,
        green_bubbles_chances: 30,
        steel_bubbles_chances: 10
    },
    {
        score_goal: 4000,
        spawn_rate: 2.5,
        normal_bubbles_chances: 30,
        green_bubbles_chances: 40,
        steel_bubbles_chances: 10
    },
    {
        score_goal: 6000,
        spawn_rate: 2.5,
        normal_bubbles_chances: 20,
        green_bubbles_chances: 40,
        steel_bubbles_chances: 1
    },
    {
        score_goal: 8000,
        spawn_rate: 5,
        normal_bubbles_chances: 20,
        green_bubbles_chances: 40,
        steel_bubbles_chances: 1
    },
    {
        score_goal: 10000,
        spawn_rate: 2.5,
        normal_bubbles_chances: 0,
        green_bubbles_chances: 0,
        steel_bubbles_chances: 1
    }
]

function create_wave()
{
    return {
        number: 0,
        countdown: 60,
        spawn_rate: 1,
        spawn_delay: 1,
        score_goal: 100,
        state: "idle",
        triggered_complete_sound: false,
        state_time: 0,
        normal_bubbles_chances: 1,
        green_bubbles_chances: 0,
        steel_bubbles_chances: 0
    };
}

function init_waves()
{
    wave = create_wave();
}

function start_wave()
{
    hurry_sound.setLoop(true);
    hurry_sound.play();
    hurry_sound.setVolume(0);

    var wave_data = WAVES[wave.number];

    score = 0;
    wave.number++;
    wave.state = "in wave"
    wave.state_time = 0;
    wave.countdown = 60;
    wave.spawn_delay = 1;
    wave.triggered_complete_sound = false;

    for (var key in wave_data)
    {
        wave[key] = wave_data[key];
    }
}

function get_random_bubble_type()
{
    var norm_chances = invoke_perks("get_bubble_chances", wave.normal_bubbles_chances, "normal");
    var green_chances = invoke_perks("get_bubble_chances", wave.green_bubbles_chances, "green");
    var steel_chances = invoke_perks("get_bubble_chances", wave.steel_bubbles_chances, "steel");

    var total_chances = norm_chances + green_chances + steel_chances;
    
    var rnd = Random.getNext(total_chances);
    if (rnd < norm_chances) return "normal";
    rnd -= norm_chances;
    if (rnd < green_chances) return "green";
    return "steel";
}

function end_wave()
{
    hurry_sound.setVolume(0);

    if (score < wave.score_goal)
    {
        wave.state = "failed"
        setTimeout(function(){playSound("fail.wav")}, 300);
    }
    else if (wave.number == 9)
    {
        wave.state = "win";
        setTimeout(function(){playSound("win.wav")}, 300);
        fireworks_delay = 0.6;
        fireworks_count = 0;
    }
    else
    {
        wave.state = "show score"
    }
    wave.state_time = 0;

    // Populate store
    populate_store();
}

function update_waves(dt)
{
    wave.state_time += dt;

    switch (wave.state)
    {
        case "in wave":
        {
            wave.countdown -= dt;
            if (wave.countdown <= 10)
            {
                var t = (10 - wave.countdown) / 10;
                hurry_sound.setVolume(t * 0.5);
            }
            else
            {
                if (score >= wave.score_goal) wave.countdown = 10;
            }
            if (!wave.triggered_complete_sound)
            {
                if (wave.countdown <= 0.8)
                {
                    wave.triggered_complete_sound = true;
                    playSound("wave_completed.wav");
                }
            }
            if (wave.countdown <= 0)
            {
                wave.countdown = 0;
                end_wave();
                break;
            }
            wave.spawn_delay -= dt;
            if (wave.spawn_delay <= 0)
            {
                wave.spawn_delay = Random.randNumber((1 / wave.spawn_rate) * 2);
                spawn_bubble();
            }
            break;
        }
        case "show score":
        {
            var show_store_t = Math.min(1, wave.state_time * 3);
            frm_store.rect.y = lerpNumber(BATH_SIZE.y * 2, BATH_SIZE.y * 0.5 - 300, show_store_t);
            break;
        }
        case "hide score":
        {
            var hide_store_t = Math.min(1, wave.state_time * 3);
            frm_store.rect.y = lerpNumber(BATH_SIZE.y * 0.5 - 300, BATH_SIZE.y * 2, show_store_t);
            if (hide_store_t >= 1)
            {
                start_wave();
            }
            break;
        }
        case "failed":
        {
            var show_store_t = Math.min(1, wave.state_time * 3);
            frm_fail.rect.y = lerpNumber(BATH_SIZE.y * 2, BATH_SIZE.y * 0.5 - 150, show_store_t);
            break;
        }
        case "win":
        {
            var show_store_t = Math.min(1, wave.state_time * 3);
            frm_win.rect.y = lerpNumber(BATH_SIZE.y * 2, BATH_SIZE.y * 0.5 - 150, show_store_t);
            break;
        }
    }
}

function render_waves_overlay(dt)
{
    switch (wave.state)
    {
        case "failed":
        case "win":
        case "show score":
        {
            var fade_t = Math.min(1, wave.state_time * 3);
            SpriteBatch.drawRect(null, new Rect(0, 0, BATH_SIZE.x, BATH_SIZE.y), new Color(0, 0, 0, fade_t * 0.5));
            break;
        }
        case "hide score":
        {
            var fade_t = 1 - Math.min(1, wave.state_time * 3);
            SpriteBatch.drawRect(null, new Rect(0, 0, BATH_SIZE.x, BATH_SIZE.y), new Color(0, 0, 0, fade_t * 0.5));
            break;
        }
    }
}
