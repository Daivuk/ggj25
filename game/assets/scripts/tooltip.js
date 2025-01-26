function render_tooltip()
{
    if (hovered_ui)
    {
        if (hovered_ui.tooltip)
        {
            hovered_ui.tooltip(hovered_ui);
        }
    }
}

function render_garbage_tooltip(ui)
{
    var rect = new Rect(ui.world_rect.x + ui.world_rect.w + 16, ui.world_rect.y - 200, 300, 270);
    var x_center = rect.x + rect.w * 0.5;
    draw_rect(rect, Color.fromHexRGB(0x012f3b));
    SpriteBatch.drawText(bubble_font, "^821Garbage can", new Vector2(x_center, rect.y + 24), Vector2.CENTER);
    SpriteBatch.drawText(bubble_font, "Drag perk here to delete it", new Vector2(x_center, rect.y + 60), Vector2.TOP, Color.WHITE, 250);
}

function render_perk_toolkit(ui)
{
    if (!ui.perk) return;

    var rect = new Rect(ui.world_rect.x + ui.world_rect.w + 16, ui.world_rect.y, 300, 270);
    var x_center = rect.x + rect.w * 0.5;

    draw_rect(rect, Color.fromHexRGB(0x012f3b));

    SpriteBatch.drawText(bubble_font, ui.perk.name, new Vector2(x_center, rect.y + 24), Vector2.CENTER);
    if (ui.perk.upgrade)
    {
        SpriteBatch.drawText(bubble_font, "Next upgrade:", new Vector2(x_center, rect.y + 60), Vector2.CENTER, Color.fromHexRGB(0xe43113));
        var level = 0;
        var passive = get_passive(ui.perk.name);
        if (passive)
        {
            level = passive.level + 1;
        }
        SpriteBatch.drawText(bubble_font, ui.perk.levels[level].description, new Vector2(x_center, rect.y + 130), Vector2.TOP, Color.WHITE, 250);
    }
    else
    {
        draw_text_rect(new Rect(x_center - 100, rect.y + 60, 200, 32), RARITY_COLORS[ui.perk.rarity], RARITY_TEXTS[ui.perk.rarity]);
        SpriteBatch.drawText(bubble_font, ui.perk.description, new Vector2(x_center, rect.y + 130), Vector2.TOP, Color.WHITE, 250);
    }
}
