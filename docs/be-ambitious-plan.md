# How this skill was planned (be-ambitious)

Written with RoboNuggets' be-ambitious skill on the request: "a prompt that rewrites any 3D idea the way an expert would, so Kimi K3.1 builds it right."

**The goal beyond the goal:** people get a 3D build that looks right on the first try, from any idea, without ever learning to write a 3D prompt.

**Types that fit:** Altitude (the prompt serves an outcome), Depth (3D has real experts with real instruments) and Range (a good 3D scene needs several fields). Speed skipped.

**Altitude ladder**
1. Rewrite one prompt so it reads like an expert brief.
2. Plan before building: a blueprint with every part's size and position, so the model builds to a plan, not a guess.
3. Close the loop: the model renders its build from the blueprint's front, side and top views and compares, part by part, before it says done.

**Depth (Felix's four questions)**
1. A top industrial designer draws the thing before anyone models it: orthographic views, an exploded assembly and a bill of materials.
2. The rawest material: the real dimensions and how the thing is actually assembled, not a mood description.
3. Methods and tools: orthographic projection, a parts hierarchy with sizes, explode directions along assembly lines, one shared data file that every view is drawn from.
4. The outside judge: the blueprint itself. Front, side and top renders of the build must match it within 5%.

**Range (the crew)**
- Industrial designer: splits the thing into real parts with real sizes.
- Technical illustrator: draws the blueprint and picks explode directions.
- 3D developer: builds it in three.js to the plan.
- Lighting and materials artist: makes surfaces read as real.
- One field for the purpose: a copywriter for a product page, an architect for a house, a game designer for an asset.

**What it needs:** Node.js to draw the blueprint (already in every Claude Code install) and a model that accepts images (Kimi K3.1 Pro does).
