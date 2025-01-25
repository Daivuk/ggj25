var uis = []
var hovered_ui = null;
var down_ui = null;

function create_ui(style)
{
    return {
        rect: new Rect(0, 0, 100, 100),
        text: "",
        image: getTexture("ui_bg.png"),
        color: Color.WHITE,
        style: style
    }
}

function init_uis()
{
    uis = []
}

function update_uis(dt)
{

}

function render_uis()
{
}
