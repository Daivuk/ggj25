function lerpNumber(a, b, t)
{
    return a + (b - a) * t;
}

function randomPointOnRoundedSquareEdge(size, cornerRadius)
{
    // Total length of straight edges and rounded corners
    var straightEdgeLength = size - 2 * cornerRadius;
    var arcLength = Math.PI * cornerRadius / 2; // Quarter circle
    var perimeter = 4 * (straightEdgeLength + arcLength);

    // Choose a random position along the perimeter
    var rand = Random.randNumber(perimeter);

    // Determine which segment the point falls into
    var segmentLength = straightEdgeLength + arcLength;

    // Find the side (0 = top, 1 = right, 2 = bottom, 3 = left)
    var side = Math.floor(rand / segmentLength);

    // Offset within the selected side
    var offset = rand % segmentLength;

    // Compute the point based on the segment type
    var x, y;
    if (offset < straightEdgeLength)
    {
        // Straight edge segment
        if (side === 0)
        {
            x = -size / 2 + cornerRadius + offset;
            y = -size / 2;
        }
        else if (side === 1)
        {
            x = size / 2;
            y = -size / 2 + cornerRadius + offset;
        }
        else if (side === 2)
        {
            x = size / 2 - cornerRadius - offset;
            y = size / 2;
        }
        else
        {
            x = -size / 2;
            y = size / 2 - cornerRadius - offset;
        }
    }
    else
    {
        // Arc segment
        const angleOffset = (offset - straightEdgeLength) / cornerRadius;
        if (side === 0)
        {
            x = size / 2 - cornerRadius + Math.cos(angleOffset) * cornerRadius;
            y = -size / 2 + Math.sin(angleOffset) * cornerRadius;
        }
        else if (side === 1)
        {
            x = size / 2 - Math.sin(angleOffset) * cornerRadius;
            y = size / 2 - cornerRadius + Math.cos(angleOffset) * cornerRadius;
        }
        else if (side === 2)
        {
            x = -size / 2 + cornerRadius - Math.cos(angleOffset) * cornerRadius;
            y = size / 2 - Math.sin(angleOffset) * cornerRadius;
        }
        else
        {
            x = -size / 2 + Math.sin(angleOffset) * cornerRadius;
            y = -size / 2 + cornerRadius - Math.cos(angleOffset) * cornerRadius;
        }
    }

    return new Vector2(x + size * 0.5, y + size * 0.5);
}
