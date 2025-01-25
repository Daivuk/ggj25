var wave = create_wave();
var hurry_sound = createSoundInstance("hurry.wav")

function create_wave()
{
    return {
        number: 1,
        countdown: 60,
        spawn_rate: 1,
        spawn_delay: 1,
        score_goal: 100,
        state: "idle"
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
    wave.state = "in wave"
}

function end_wave()
{
    hurry_sound.setVolume(0);
    wave.state = "show score"
}

function update_waves(dt)
{
    switch (wave.state)
    {
        case "in wave":
        {
            wave.countdown -= dt;
            if (wave.countdown < 10)
            {
                var t = (10 - wave.countdown) / 10;
                hurry_sound.setVolume(t * 0.5);
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
    }
}
