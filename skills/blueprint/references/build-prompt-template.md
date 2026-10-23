# Build prompt template

Fill every bracket and paste the whole `blueprint.json` where it says. Keep the section titles.

```text
You are a team of experts building one 3D scene together:
- an industrial designer who reads technical drawings and holds every part to its size,
- a senior 3D developer who builds fast, smooth three.js scenes (or Blender, if I ask for Blender),
- a lighting and materials artist who makes surfaces read as real,
- [ONE MORE EXPERT THAT FITS, e.g. a conversion copywriter for a product page / an architect for a house / a game designer for a game asset].

## The goal
Build [WHAT, e.g. an interactive 3D product page / a 3D walk-through / a game-ready model] of [THE THING], exactly to the blueprint below.
[THE GOAL BEYOND THE GOAL, e.g. A buyer should understand in 10 seconds why the steel burrs make better coffee, and click "Shop the grinder".]
The hero detail is [HERO PART]: give it the most care.

## The blueprint
I attached the blueprint drawing as an image: front, side and top views, an exploded view and a parts list. Here is the same blueprint as data. Every size is in [UNITS]; x is width, y is height, z is depth toward the viewer, and each position is a part's centre.

[PASTE blueprint.json HERE]

Build every part with these sizes and positions. Add realistic detail on top (bevels, knurling, screws, seams, labels), but never change a part's overall size or place.

## The scene
- [WHAT THE VIEWER CAN DO, e.g. drag to rotate, scroll to zoom, a slider that explodes the parts exactly along the blueprint's explode directions, tap a part to see its name and material]
- [LIGHT AND MOOD, e.g. soft studio light, gentle shadows, warm morning kitchen]
- [THE PAGE AROUND IT, if any: headline, one button with a link]
- One self-contained HTML file, three.js from a CDN with an import map, every shape built in code, no downloaded models or textures, no console errors, smooth on a phone.

## How to build it
1. Read the blueprint and write a short build plan: parts in order, materials, camera, lights.
2. Block out every part as its plain shape at its exact size and position.
3. Check it against the blueprint (see the success list) before adding detail.
4. Add detail, starting with [HERO PART], then materials and lighting.
5. Add the interactions and the page.
6. Run the success list and fix every failure.

## Success list
- [ ] Front, side and top: render the scene with an orthographic camera from the front, the right side and the top, framed like the blueprint views. Every part's outline matches the blueprint within 5% of its size and position.
- [ ] Overall size matches the blueprint's overall width, height and depth within 2%.
- [ ] The exploded view moves each part along its blueprint direction, and no parts overlap when exploded.
- [ ] [HERO PART] shows its key detail clearly from the default camera.
- [ ] Every interaction works with touch and with a mouse.
- [ ] No console errors, and it loads in a few seconds.

## Self-test
Do the front, side and top check yourself: render those three views and compare them with the blueprint, part by part, and say pass or fail for each line of the success list. Fix every fail and check again. Then give me the complete final file in full, never "the rest stays the same".
```
