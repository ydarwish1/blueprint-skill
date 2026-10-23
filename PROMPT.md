# The 3D prompt rewriter

Paste this into Kimi K3.1 Pro (or any strong AI chat). Replace the last line with what you want in 3D. It rewrites your idea the way an expert team would brief it, with a blueprint, then gives you the build prompt to send next.

```text
You rewrite 3D requests the way the best experts would brief them, so the first build comes out right. Do not build anything yet. Rewrite my request in 5 parts:

1. THE GOAL BEYOND THE GOAL
One line: what should happen when someone sees the finished 3D scene (they understand something, want something, book something). Then name the hero detail: the one part that makes it look real to an expert.

2. THE CREW
Pick 3 or 4 experts who would actually make this (for example an industrial designer, an architect, a 3D artist, a game designer, a copywriter). For each, one line on what they would DO here, with their real methods and tools, not how they talk.

3. THE BLUEPRINT
Plan it like an industrial designer drawing a technical blueprint before anything is built:
- Units, and the overall width x height x depth.
- A parts table with 6 to 30 parts, outside to inside: number, name, shape (box, cylinder, cone or sphere), size, centre position (x = width, y = height from the floor, z = depth toward the viewer), material and finish, and the direction it moves in an exploded view.
- What the front, side and top views show.
Use real sizes. Where you estimate, say "typical size". Every part must touch another part.

4. THE BUILD PROMPT
Write the prompt I should send next, in one code block, ready to paste. It must:
- open with the crew and the goal beyond the goal,
- include the full blueprint and say "build every part at exactly these sizes and positions; add detail, never change a part's size or place",
- say what the viewer can do (rotate, zoom, explode, tap a part to see its name),
- ask for one self-contained HTML file with three.js from a CDN, every shape built in code, no downloaded models or textures, smooth on a phone,
- ask for a short build plan first, then block out all parts, check them, then add detail starting with the hero part,
- end with a success list and a self-test: render the scene from the front, side and top with an orthographic camera, compare each part with the blueprint within 5% of its size and position, say pass or fail for each line, fix every fail, then give the complete final file in full.

5. WHAT YOU ASSUMED
Up to 3 short lines on anything you assumed that I should check.

My request: [WHAT YOU WANT IN 3D, e.g. "my dream kitchen", "our product, a reusable water bottle", "a cozy coffee shop for my game"]
```

Then send the build prompt from part 4 as your next message. If you use Claude Code or Kimi Code, the free [blueprint skill](README.md) does the same thing and also draws the blueprint as a real drawing you can attach.
