# blueprint.json

```json
{
  "title": "Burr coffee grinder",
  "subtitle": "Home electric conical burr grinder",
  "units": "mm",
  "date": "2026-10-23",
  "overall": { "w": 144, "h": 390, "d": 200 },
  "explodeStep": 0.32,
  "parts": [
    { "id": "base", "name": "Base", "shape": "box", "size": { "w": 140, "h": 30, "d": 200 },
      "position": [0, 15, 0], "material": "die-cast aluminium, matte black", "explode": [0, -1, 0] }
  ],
  "notes": ["Burrs are the hero detail."]
}
```

## Axes

- **x** runs left to right (width), **y** bottom to top (height), **z** back to front, toward the viewer (depth).
- `position` is the **centre** of the part. Put the floor at y = 0, so a 30 tall base sits at y = 15.
- Every part should touch another part. The renderer warns about parts floating in the air.

## Fields

| Field | Required | Meaning |
|---|---|---|
| `title` | yes | shown in the header and the title block |
| `subtitle` | no | one line under the title |
| `units` | no | `mm` (default), `cm`, `m`, `in` or `ft`. One unit for the whole file |
| `overall` | no | `{w, h, d}` you expect; the renderer warns if the parts don't add up to it |
| `explodeStep` | no | how far parts move in the exploded view, as a share of the biggest overall size (default 0.35) |
| `parts` | yes | the list below, in assembly order (they are numbered in this order) |
| `notes` | no | short lines shown in the Notes box: the hero detail, how parts connect, which sizes are typical rather than measured |
| `date`, `drawnBy` | no | title block |

## A part

| Field | Required | Meaning |
|---|---|---|
| `id` | yes | short and unique: `lid`, `wall-north` |
| `name` | yes | plain words for the parts list |
| `shape` | yes | `box`, `cylinder`, `cone` or `sphere` |
| `size` | yes | box `{w, h, d}`; cylinder `{r, h}`; cone `{r1, r2, h}` (r1 at the low end of its axis, r2 at the high end; 0 for a point); sphere `{r}` |
| `axis` | cylinder, cone | `x`, `y` (default) or `z`: the direction its length runs |
| `position` | yes | centre `[x, y, z]` |
| `material` | no | material and finish, plain words |
| `qty` | no | how many identical parts (draw one, count them all) |
| `explode` | no | direction it moves in the exploded view, in steps: `[0, 1, 0]` one step up, `[0, 1.8, 0]` further up, `[1.5, 0, 0]` out to the right |

## Good habits

- 6 to 30 parts. Fewer reads as a toy, more crowds the drawing; group tiny repeated parts with `qty`.
- Order parts outside to inside, the way you'd take the thing apart.
- Explode along assembly lines: lids and tops up, bases down, side panels out, inner parts sideways so they don't hide behind the shell.
- Shapes are axis-aligned. For something angled (a lamp arm), break it into short straight sections, or note the angle in `notes` for the build step.
