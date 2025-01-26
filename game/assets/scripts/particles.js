var particles = []

function init_particles()
{
    particles = []
}

function add_particle(pos, color)
{
    var particle = {
        pos: pos,
        dir: Random.randCircleEdge(Vector2.ZERO, 1),
        color: color,
        t: 1
    };
    particles.push(particle)
    return particle
}

function update_particles(dt)
{
    for (var i = 0; i < particles.length; ++i)
    {
        var particle = particles[i];
        particle.t -= dt * 2.0;
        if (particle.t <= 0)
        {
            particles.splice(i, 1);
            --i;
            continue;
        }
        particle.pos = particle.pos.add(particle.dir.mul(particle.t * 25 * dt));
    }
}

function render_particles()
{
    for (var i = 0; i < particles.length; ++i)
    {
        var particle = particles[i];
        SpriteBatch.drawSprite(null, particle.pos, particle.color.mul(new Color(particle.t)), 0, 5, Vector2.CENTER);
    }
}
