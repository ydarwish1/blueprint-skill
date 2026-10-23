# Build prompt: burr coffee grinder

Paste this into Kimi K3.1 Pro and attach `blueprint.png`. Replace [YOUR LINK].

```text
You are a team of experts building one 3D scene together:
- an industrial designer who reads technical drawings and holds every part to its size,
- a senior 3D developer who builds fast, smooth three.js scenes (or Blender, if I ask for Blender),
- a lighting and materials artist who makes surfaces read as real,
- a conversion copywriter who writes short, plain lines that sell..

## The goal
Build an interactive 3D product page of a home electric burr coffee grinder, exactly to the blueprint below.
A buyer should understand in 10 seconds why the steel burrs make better coffee, and click "Shop the grinder".
The hero detail is the conical steel burrs (part 4): give it the most care.

## The blueprint
I attached the blueprint drawing as an image: front, side and top views, an exploded view and a parts list. Here is the same blueprint as data. Every size is in millimetres; x is width, y is height, z is depth toward the viewer, and each position is a part's centre.

{
  "title": "Burr coffee grinder",
  "subtitle": "Home electric conical burr grinder, 15 grind settings",
  "units": "mm",
  "date": "2026-10-23",
  "overall": { "w": 144, "h": 390, "d": 200 },
  "explodeStep": 0.32,
  "parts": [
    { "id": "base", "name": "Base", "shape": "box", "size": { "w": 140, "h": 30, "d": 200 }, "position": [0, 15, 0], "material": "die-cast aluminium, matte black", "explode": [0, -1, 0] },
    { "id": "body", "name": "Body shell", "shape": "cylinder", "axis": "y", "size": { "r": 60, "h": 220 }, "position": [0, 140, -20], "material": "brushed steel", "explode": [0, 0, -1.4] },
    { "id": "motor", "name": "DC motor", "shape": "cylinder", "axis": "y", "size": { "r": 40, "h": 100 }, "position": [0, 120, -20], "material": "steel can, copper coil", "explode": [1.6, 0, 0] },
    { "id": "burrs", "name": "Conical steel burrs", "shape": "cone", "axis": "y", "size": { "r1": 30, "r2": 18, "h": 40 }, "position": [0, 220, -20], "material": "hardened steel, polished", "explode": [-1.6, 0, 0] },
    { "id": "dial", "name": "Grind dial", "shape": "cylinder", "axis": "y", "size": { "r": 64, "h": 18 }, "position": [0, 259, -20], "material": "aluminium, knurled edge", "explode": [0, 0.5, 0] },
    { "id": "hopper", "name": "Bean hopper", "shape": "cone", "axis": "y", "size": { "r1": 50, "r2": 70, "h": 90 }, "position": [0, 313, -20], "material": "smoked clear plastic", "explode": [0, 1.1, 0] },
    { "id": "lid", "name": "Hopper lid", "shape": "cylinder", "axis": "y", "size": { "r": 72, "h": 12 }, "position": [0, 364, -20], "material": "smoked clear plastic", "explode": [0, 1.7, 0] },
    { "id": "knob", "name": "Lid knob", "shape": "sphere", "size": { "r": 10 }, "position": [0, 380, -20], "material": "walnut", "explode": [0, 1.7, 0] },
    { "id": "spout", "name": "Grounds chute", "shape": "box", "size": { "w": 30, "h": 20, "d": 30 }, "position": [0, 120, 55], "material": "stainless steel", "explode": [0, 0, 0.8] },
    { "id": "cup", "name": "Grounds cup", "shape": "box", "size": { "w": 90, "h": 70, "d": 70 }, "position": [0, 65, 65], "material": "clear plastic, steel rim", "explode": [0, 0, 1.6] }
  ],
  "notes": [
    "Burrs (part 4) are the hero detail: same grind size every cup.",
    "Motor sits inside the body shell, under the burrs.",
    "Dial turns the outer burr ring up or down to change grind size.",
    "Sizes are typical for a home grinder, not taken from one brand."
  ]
}

Build every part with these sizes and positions. Add realistic detail on top (bevels, knurling, screws, seams, labels), but never change a part's overall size or place.

## The scene
- Drag to rotate, scroll to zoom, a slider that explodes the parts exactly along the blueprint's explode directions, tap a part to see its name and material
- Soft studio light, gentle shadows, warm morning kitchen mood
- Headline "Cafe-level coffee, the same every morning." and one button, "Shop the grinder" ([YOUR LINK])
- One self-contained HTML file, three.js from a CDN with an import map, every shape built in code, no downloaded models or textures, no console errors, smooth on a phone.

## How to build it
1. Read the blueprint and write a short build plan: parts in order, materials, camera, lights.
2. Block out every part as its plain shape at its exact size and position.
3. Check it against the blueprint (see the success list) before adding detail.
4. Add detail, starting with the conical steel burrs (part 4), then materials and lighting.
5. Add the interactions and the page.
6. Run the success list and fix every failure.

## Success list
- [ ] Front, side and top: render the scene with an orthographic camera from the front, the right side and the top, framed like the blueprint views. Every part's outline matches the blueprint within 5% of its size and position.
- [ ] Overall size matches the blueprint's overall width, height and depth within 2%.
- [ ] The exploded view moves each part along its blueprint direction, and no parts overlap when exploded.
- [ ] the conical steel burrs (part 4) shows its key detail clearly from the default camera.
- [ ] Every interaction works with touch and with a mouse.
- [ ] No console errors, and it loads in a few seconds.

## Self-test
Do the front, side and top check yourself: render those three views and compare them with the blueprint, part by part, and say pass or fail for each line of the success list. Fix every fail and check again. Then give me the complete final file in full, never "the rest stays the same".
```
