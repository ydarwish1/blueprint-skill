You are a team of experts building one 3D scene together:
- an industrial designer who reads technical drawings and holds every part to its size,
- a senior 3D developer who builds fast, smooth three.js scenes (or Blender, if I ask for Blender),
- a lighting and materials artist who makes surfaces read as real,
- a conversion copywriter who writes product pages that sell vintage and collectable gear.

## The goal
Build an interactive 3D product page of a vintage 1980s box-type instant film camera (integral film, 600-type), exactly to the blueprint below.
A visitor drags the explode slider, watches a print slide out between the two steel rollers, understands in ten seconds why the photo develops in their hand, and clicks "Shop the camera".
The hero detail is the steel spread roller pair and its drive (parts 1-4: upper roller, lower roller, drive gear, ejection motor): give it the most care.

## The blueprint
I attached the blueprint drawing as an image: front, side and top views, an exploded view and a parts list. Here is the same blueprint as data. Every size is in millimetres; x is width, y is height, z is depth toward the viewer, and each position is a part's centre.

```json
{
  "title": "Vintage instant film camera",
  "subtitle": "1980s box-type integral film camera for a product page",
  "units": "mm",
  "date": "2026-10-23",
  "overall": {"w": 150, "h": 104, "d": 132},
  "explodeStep": 0.3,
  "parts": [
    {"id": "roller-upper", "name": "Upper spread roller", "shape": "cylinder", "axis": "x", "size": {"r": 4.5, "h": 104}, "position": [0, 31.5, 53], "material": "hardened steel, polished", "explode": [3.0, 0.2, 0]},
    {"id": "roller-lower", "name": "Lower spread roller", "shape": "cylinder", "axis": "x", "size": {"r": 4.5, "h": 104}, "position": [0, 22.5, 53], "material": "hardened steel, polished", "explode": [3.0, -0.3, 0]},
    {"id": "roller-gear", "name": "Roller drive gear", "shape": "cylinder", "axis": "x", "size": {"r": 6, "h": 4}, "position": [54, 22.5, 53], "material": "acetal (POM), white", "explode": [4.3, -0.3, 0]},
    {"id": "motor", "name": "Ejection motor and gears", "shape": "cylinder", "axis": "z", "size": {"r": 8, "h": 36}, "position": [62, 14, 28], "material": "DC motor, acetal gears", "explode": [2.0, -1.5, 0]},
    {"id": "body", "name": "Main body shell", "shape": "box", "size": {"w": 150, "h": 90, "d": 70}, "position": [0, 45, 13], "material": "ABS, black, leather-grain texture", "explode": null},
    {"id": "rear-upper", "name": "Rear shell, mirror bay", "shape": "box", "size": {"w": 150, "h": 62, "d": 20}, "position": [0, 31, -32], "material": "ABS, black, leather-grain texture", "explode": [0, 0, -1.1]},
    {"id": "rear-lower", "name": "Rear shell, film bay end", "shape": "box", "size": {"w": 150, "h": 30, "d": 20}, "position": [0, 15, -52], "material": "ABS, black, leather-grain texture", "explode": [0, 0, -1.1]},
    {"id": "faceplate", "name": "Front faceplate", "shape": "box", "size": {"w": 150, "h": 61, "d": 12}, "position": [0, 59.5, 54], "material": "ABS, cream, rainbow stripe decal", "explode": [0, 1.2, 1.2]},
    {"id": "film-door", "name": "Film door", "shape": "box", "size": {"w": 150, "h": 25, "d": 12}, "position": [0, 12.5, 54], "material": "ABS, black, sprung hinge", "explode": [0, -1.9, 0.4]},
    {"id": "lens", "name": "Lens and shutter barrel", "shape": "cylinder", "axis": "z", "size": {"r": 21, "h": 10}, "position": [-12, 60, 65], "material": "glass element, black ABS barrel", "explode": [0, 1.2, 2.2]},
    {"id": "electric-eye", "name": "Electric eye (light cell)", "shape": "cylinder", "axis": "z", "size": {"r": 6, "h": 3}, "position": [26, 76, 61.5], "material": "photocell under smoked acrylic", "explode": [0, 1.2, 2.0]},
    {"id": "shutter-button", "name": "Shutter button", "shape": "cylinder", "axis": "z", "size": {"r": 7, "h": 6}, "position": [56, 50, 63], "material": "ABS, gloss red", "explode": [0, 1.2, 2.0]},
    {"id": "flash", "name": "Flash housing", "shape": "box", "size": {"w": 92, "h": 14, "d": 42}, "position": [16, 97, 39], "material": "ABS, black", "explode": [0, 2.3, 0]},
    {"id": "flash-window", "name": "Flash window", "shape": "box", "size": {"w": 64, "h": 8, "d": 2}, "position": [16, 97, 61], "material": "clear Fresnel acrylic", "explode": [0, 2.3, 0.6]},
    {"id": "viewfinder", "name": "Viewfinder", "shape": "box", "size": {"w": 30, "h": 14, "d": 84}, "position": [-55, 97, 18], "material": "ABS housing, acrylic optics", "explode": [0, 2.3, 0]},
    {"id": "film-pack", "name": "Integral film pack", "shape": "box", "size": {"w": 96, "h": 22, "d": 108}, "position": [0, 17, -6], "material": "plastic cartridge, flat battery", "explode": [0, -0.9, 2.6]},
    {"id": "print", "name": "Instant print (top sheet)", "shape": "box", "size": {"w": 88, "h": 1, "d": 107}, "position": [0, 27, -6], "material": "integral film, white frame", "explode": [0, -0.2, 3.0]}
  ],
  "notes": [
    "Hero: steel spread rollers (1-4). They burst the reagent pod and spread it as the print exits.",
    "Print exits a 4 mm slot between faceplate and film door, at the roller nip.",
    "Print 88 x 107 is the real 600-film size. Body sizes are typical, not measured.",
    "Back slopes about 45 deg over the mirror; drawn as two steps.",
    "Film door hinges down to load the pack; the pack holds the battery."
  ]
}
```

Build every part with these sizes and positions. Add realistic detail on top (bevels, knurling, screws, seams, labels), but never change a part's overall size or place.

## The scene
- Drag to rotate, scroll or pinch to zoom, and a slider that explodes the parts exactly along the blueprint's explode directions (0 = assembled, 1 = the blueprint's exploded view). Tap or click a part to see its name and material from the blueprint. A "Take a photo" button plays the ejection: the motor spins, both rollers turn in opposite directions, and part 17 (the print) slides forward out of the 4 mm slot at the roller nip, then its image fades in from grey over a few seconds.
- Soft studio light from the upper left, a warm fill, gentle contact shadows on a pale warm-grey sweep. Black leather-grain body, cream faceplate with a thin rainbow stripe, gloss red shutter button, polished steel rollers that catch a crisp highlight.
- The page around it: headline "The photo that develops in your hand", one line under it, and one button "Shop the camera" linking to #shop.
- One self-contained HTML file, three.js from a CDN with an import map, every shape built in code, no downloaded models or textures, no console errors, smooth on a phone.

## How to build it
1. Read the blueprint and write a short build plan: parts in order, materials, camera, lights.
2. Block out every part as its plain shape at its exact size and position.
3. Check it against the blueprint (see the success list) before adding detail.
4. Add detail, starting with the steel spread rollers and their drive gear and motor, then materials and lighting.
5. Add the interactions and the page.
6. Run the success list and fix every failure.

## Success list
- [ ] Front, side and top: render the scene with an orthographic camera from the front, the right side and the top, framed like the blueprint views. Every part's outline matches the blueprint within 5% of its size and position.
- [ ] Overall size matches the blueprint's overall width, height and depth within 2%.
- [ ] The exploded view moves each part along its blueprint direction, and no parts overlap when exploded.
- [ ] The steel spread rollers show their key detail clearly from the default camera: two polished rollers meeting at the nip behind the slot, with the drive gear on the right-hand end.
- [ ] Every interaction works with touch and with a mouse.
- [ ] No console errors, and it loads in a few seconds.

## Self-test
Do the front, side and top check yourself: render those three views and compare them with the blueprint, part by part, and say pass or fail for each line of the success list. Fix every fail and check again. Then give me the complete final file in full, never "the rest stays the same".
