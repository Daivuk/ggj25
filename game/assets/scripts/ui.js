var ui_root = create_ui("node", Vector2.ZERO);
var hovered_ui = null;
var down_ui = null;
var ui_frame_texture = getTexture("ui_bg.png");
var dragging = null;

function parent_ui(parent, ui)
{
    parent.children.push(ui);
    return ui;
}

function draw_rect(rect, color, shadow_dist)
{
    if (!shadow_dist) shadow_dist = 8;
    
    SpriteBatch.drawRectScaled9(ui_frame_texture, new Rect(rect.x + 0, rect.y + shadow_dist, rect.w, rect.h), new Vector4(16, 16, 16, 16), new Color(0, 0, 0, 0.5));
    SpriteBatch.drawRectScaled9(ui_frame_texture, rect, new Vector4(16, 16, 16, 16), color);
}

function draw_text_rect(rect, color, text, text_color)
{
    if (!text_color) text_color = Color.WHITE;
    
    SpriteBatch.drawRectScaled9(ui_frame_texture, new Rect(rect.x + 0, rect.y + 3, rect.w, rect.h), new Vector4(16, 16, 16, 16), new Color(0, 0, 0, 0.5));
    SpriteBatch.drawRectScaled9(ui_frame_texture, rect, new Vector4(16, 16, 16, 16), color);
    SpriteBatch.drawText(bubble_font, text, new Vector2(rect.x + rect.w * 0.5, rect.y + rect.h * 0.5), Vector2.CENTER, text_color);
}

function create_ui(style, pos, text, image_filename)
{
    switch (style)
    {
        case "node": return {
            rect: new Rect(pos.x, pos.y, 0, 0),
            text: text,
            bg_image: null,
            image: null,
            color: Color.WHITE,
            style: style,
            children: [],
            click_through: true,
            float_anim: Random.randNumber(10)
        }
        case "frame": return {
            rect: new Rect(pos.x, pos.y, 100, 100),
            text: text,
            bg_image: ui_frame_texture,
            image: null,
            color: Color.WHITE,
            style: style,
            children: [],
            click_through: false,
            float_anim: Random.randNumber(10)
        }
        case "label": return {
            rect: new Rect(pos.x, pos.y, 0, 0),
            text: text,
            bg_image: null,
            image: null,
            color: Color.WHITE,
            style: style,
            children: [],
            click_through: true,
            float_anim: Random.randNumber(10)
        }
        case "frammed_label": return {
            rect: new Rect(pos.x, pos.y, 100, 100),
            text: text,
            bg_image: ui_frame_texture,
            image: null,
            color: Color.WHITE,
            style: style,
            children: [],
            click_through: false,
            float_anim: Random.randNumber(10)
        }
        case "button": return {
            rect: new Rect(pos.x, pos.y, 100, 100),
            text: text,
            bg_image: ui_frame_texture,
            image: getTexture(image_filename),
            color: Color.WHITE,
            style: style,
            children: [],
            click_through: false,
            float_anim: Random.randNumber(10)
        }
        case "image": return {
            rect: new Rect(pos.x, pos.y, 64, 64),
            text: text,
            bg_image: null,
            image: getTexture(image_filename),
            color: Color.WHITE,
            style: style,
            children: [],
            click_through: true,
            float_anim: Random.randNumber(10)
        }
    }
}

function init_uis()
{
    ui_root = create_ui("node", Vector2.ZERO);
}

function update_ui(ui, pos, dt)
{
    var world_pos = new Vector2(pos.x + ui.rect.x, pos.y + ui.rect.y);
    for (var i = ui.children.length - 1; i >= 0; --i)
    {
        update_ui(ui.children[i], world_pos, dt);
    }
    ui.world_rect = new Rect(world_pos.x, world_pos.y, ui.rect.w, ui.rect.h);
    ui.float_anim += dt;
    if (!hovered_ui)
    {
        if (ui.world_rect.contains(mouse_pos))
        {
            hovered_ui = ui;
        }
    }
}

function update_uis(dt)
{
    hovered_ui = null;
    update_ui(ui_root, Vector2.ZERO, dt);

    if (Input.isJustDown(Key.MOUSE_1))
    {
        if (hovered_ui)
        {
            down_ui = hovered_ui;
            if (down_ui.can_drag) dragging = down_ui;
        }
    }
    else if (Input.isJustUp(Key.MOUSE_1))
    {
        if (dragging)
        {
            if (hovered_ui == garbage)
            {
                dragging.perk = null;
                dragging.image = null;
            }
            else if (hovered_ui != down_ui && hovered_ui && hovered_ui.can_drag)
            {
                var perk = dragging.perk;
                var uvs = dragging.image_uvs;
                var image = dragging.image;
                dragging.perk = hovered_ui.perk;
                dragging.image_uvs = hovered_ui.image_uvs;
                dragging.image = hovered_ui.image;
                hovered_ui.perk = perk;
                hovered_ui.image_uvs = uvs;
                hovered_ui.image = image;
            }
            dragging = null;
        }
        else if (down_ui && hovered_ui == down_ui)
        {
            if (down_ui.on_click) down_ui.on_click(down_ui);
        }
        down_ui = null;
    }
}

function render_ui(ui, pos)
{
    var world_pos = new Vector2(pos.x + ui.rect.x, pos.y + ui.rect.y);
    var center = new Vector2(
        world_pos.x + ui.rect.w * 0.5,
        world_pos.y + ui.rect.h * 0.5
    );

    if (ui.floaty)
    {
        center.y += Math.sin(ui.float_anim * 0.5) * 10;
    }

    if (ui.bg_image)
    {
        var rect = new Rect(pos.x + ui.rect.x, pos.y + ui.rect.y, ui.rect.w, ui.rect.h);
        if (ui.style == "button" && hovered_ui == ui)
        {
            rect = rect.grow(4);
        }
        var shadow_dist = 8;
        var color_mult = new Color(1, 1, 1, 1);
        if (ui.style == "button" && down_ui == ui)
        {
            shadow_dist -= 4;
            rect.y += 4;
            center.y += 4;
            color_mult = new Color(0.5, 0.5, 0.5, 1);
        }
        SpriteBatch.drawRectScaled9(ui.bg_image, new Rect(rect.x + 0, rect.y + shadow_dist, rect.w, rect.h), new Vector4(16, 16, 16, 16), new Color(0, 0, 0, 0.5));
        SpriteBatch.drawRectScaled9(ui.bg_image, rect, new Vector4(16, 16, 16, 16), ui.color.mul(color_mult));
    }
    if (ui.image)
    {
        if (ui.image_uvs)
            SpriteBatch.drawSpriteWithUVs(ui.image, center, ui.image_uvs, ui.color, 0, 1, Vector2.CENTER);
        else
            SpriteBatch.drawSprite(ui.image, center, ui.color, 0, 1, Vector2.CENTER);
    }
    if (ui.text)
    {
        if (ui.outline)
            SpriteBatch.drawPrettyOutlinedText(bubble_font, ui.text, center, Vector2.CENTER, Color.WHITE, Color.BLACK, 2);
        else
            SpriteBatch.drawText(bubble_font, ui.text, center, Vector2.CENTER, Color.WHITE);
    }
    for (var i = 0; i < ui.children.length; ++i)
    {
        var child = ui.children[i];
        render_ui(child, world_pos);
    }
}

function render_uis()
{
    render_ui(ui_root, Vector2.ZERO);

    if (dragging && dragging.image)
    {
        if (dragging.image_uvs)
            SpriteBatch.drawSpriteWithUVs(dragging.image, mouse_pos, dragging.image_uvs, dragging.color, 0, 1, Vector2.CENTER);
        else
            SpriteBatch.drawSprite(dragging.image, mouse_pos, dragging.color, 0, 1, Vector2.CENTER);
    }
}
