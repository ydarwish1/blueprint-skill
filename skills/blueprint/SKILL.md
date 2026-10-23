---
name: blueprint
description: Turns any 3D idea (a product, a machine, a room, a building, a whole scene) into a real technical blueprint first - front, side and top views, an exploded view, a parts list with sizes and materials - then writes the expert build prompt that has Kimi K3.1 Pro (or any strong model) build the 3D scene from that blueprint and check its build against it. Use when the user says "/blueprint", "blueprint", "make a blueprint", "plan this in 3D", "3D model of", "build this in 3D", "3D scene", "exploded view", or wants a better first try at a 3D build.
---

# Blueprint

Kimi K3.1 Pro can build 3D from "a text brief, sketch, or reference image" (Moonshot's words). A one-line brief makes it guess the shape, the sizes and how the parts fit. A blueprint removes the guessing: the model builds to a plan, the way a real workshop does. This skill draws that plan, then writes the brief that makes the model build to it and prove it did.

Everything a run makes goes in one folder named after the idea (for example `blueprints/coffee-grinder/`):

| File | What it is |
|---|---|
| `blueprint.json` | the plan: every part, its shape, size, position, material and how it moves out in the exploded view |
| `blueprint.html` | the drawing, rendered from the plan by `scripts/render.mjs`: front, side and top views, exploded view, parts list, title block, and a Download PNG button |
| `build-prompt.md` | the expert brief to paste into Kimi (or any model), with the blueprint inside it |

## Rules

1. **Real sizes or honest estimates.** Use the real dimensions when you know them or can look them up. Otherwise use standard sizes for that kind of thing and say "typical size" in the notes. Never present a guess as a measurement.
2. **Draw from parts, never freehand.** All views come from `blueprint.json` through `scripts/render.mjs`, so the front, side, top and exploded views always agree. If a view looks wrong, fix the part in the JSON and render again.
3. **Build to the blueprint, judged by the blueprint.** The build prompt always ends with an outside check: the model renders its scene from the same front, side and top angles and compares them with the blueprint. "Looks good" is not a pass.
4. **One idea, done deep.** Don't add extra products, rooms or features the user didn't ask for. Ambition goes into the detail and the check, not the size.

## Workflow

### 1. Get the idea

What should exist in 3D, and what is it for (a product page, a pitch, a game asset, a house listing, a lesson)? If either is unclear, ask once, in one line. Otherwise state your assumptions in one line and go.

### 2. Aim higher (one minute, not an essay)

Write two lines in your reply:
- **The goal beyond the goal:** what should happen when someone sees the finished scene ("a buyer understands why these burrs make better coffee and clicks buy").
- **The hero detail:** the one part that makes it real to an expert eye. It gets the most parts, the first note and the first balloon.

### 3. Design it like an industrial designer

Write `blueprint.json` following [references/spec.md](references/spec.md). Think the way the experts would:

- **Industrial designer:** split the thing into how it is really built: 6 to 30 parts, outside to inside, each a box, cylinder, cone or sphere. Combine primitives for complex shapes (a mug is a cylinder plus a box handle). Real proportions first: overall size, then each part relative to it.
- **Technical illustrator:** choose explode directions so every part pulls away along the way it is assembled (lids up, panels out, inner parts sideways), and nothing ends up on top of another part.
- **For spaces** (a room, a house, a shop): walls, floors, doors and furniture are boxes; use metres or millimetres consistently; leave door gaps in walls by splitting a wall into two boxes.

### 4. Render and check the drawing

```bash
node <this skill's folder>/scripts/render.mjs blueprints/<name>/blueprint.json
```

It writes `blueprint.html` next to the JSON. Fix every `PROBLEM` line (the JSON is invalid) and every `WARNING` (a part floats, or the overall size doesn't match the parts) and render again. Then look at it: open the HTML, or take a screenshot if you can, and check that the three views agree with each other and with how the real thing looks. Fix and re-render until it reads at a glance.

### 5. Write the build prompt

Fill [references/build-prompt-template.md](references/build-prompt-template.md) into `build-prompt.md`: the expert crew, the goal beyond the goal, the full `blueprint.json`, the scene and interaction the user wants, and the success list that checks the build against the blueprint views.

### 6. Hand it over

Reply with:
1. The two lines from step 2 and the path to `blueprint.html`.
2. How to build it, 3 lines:
   - Open `blueprint.html` and press **Download PNG**.
   - In Kimi (kimi.ai, Kimi Work or Kimi Code), pick **Kimi K3.1 Pro**, paste `build-prompt.md` and attach the PNG.
   - Open the page it builds. If a check fails, paste that line back and ask it to fix only that.

**Already running inside Kimi Code (or another agent that can build)?** Ask "Want me to build it now?" If yes, follow `build-prompt.md` yourself, then run its checks before you say it's done.

## Credits

Step 2 follows Felix Rieseberg's ideas on ambition (felixrieseberg.com), as packaged in RoboNuggets' be-ambitious skill. Made by Amel Solutions. MIT licence.
