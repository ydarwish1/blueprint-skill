#!/usr/bin/env node
// Renders a blueprint.json into a self-contained blueprint sheet (blueprint.html):
// front, side and top views, an exploded isometric view, a parts list and a title block,
// all drawn from the same parts so every view agrees. No dependencies, Node 18+.
//
// Usage: node render.mjs <blueprint.json> [out.html]

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';

const [, , inPath, outArg] = process.argv;
if (!inPath) {
  console.error('Usage: node render.mjs <blueprint.json> [out.html]');
  process.exit(2);
}
const outPath = outArg || join(dirname(inPath), basename(inPath).replace(/\.json$/i, '') + '.html');

let bp;
try {
  bp = JSON.parse(readFileSync(inPath, 'utf8'));
} catch (e) {
  console.error(`PROBLEM: cannot read ${inPath} as JSON: ${e.message}`);
  process.exit(1);
}

// ---------- validate ----------
const problems = [];
const warnings = [];
const SHAPES = ['box', 'cylinder', 'cone', 'sphere'];
if (!bp.title) problems.push('title is missing');
if (!bp.units) bp.units = 'mm';
if (!Array.isArray(bp.parts) || bp.parts.length === 0) problems.push('parts must be a non-empty list');
const ids = new Set();
for (const [i, p] of (bp.parts || []).entries()) {
  const at = `parts[${i}]${p && p.id ? ` (${p.id})` : ''}`;
  if (!p.id) problems.push(`${at}: id is missing`);
  else if (ids.has(p.id)) problems.push(`${at}: id is used twice`);
  else ids.add(p.id);
  if (!p.name) problems.push(`${at}: name is missing`);
  if (!SHAPES.includes(p.shape)) problems.push(`${at}: shape must be one of ${SHAPES.join(', ')}`);
  if (!Array.isArray(p.position) || p.position.length !== 3) problems.push(`${at}: position must be [x, y, z]`);
  const s = p.size || {};
  const need = { box: ['w', 'h', 'd'], cylinder: ['r', 'h'], cone: ['r1', 'r2', 'h'], sphere: ['r'] }[p.shape] || [];
  for (const k of need) {
    if (!(typeof s[k] === 'number' && s[k] >= 0)) problems.push(`${at}: size.${k} must be a number >= 0`);
  }
  if ((p.shape === 'cylinder' || p.shape === 'cone') && p.axis && !['x', 'y', 'z'].includes(p.axis)) problems.push(`${at}: axis must be x, y or z`);
  if (p.explode && (!Array.isArray(p.explode) || p.explode.length !== 3)) problems.push(`${at}: explode must be [x, y, z]`);
}
if (problems.length) {
  for (const p of problems) console.error('PROBLEM: ' + p);
  process.exit(1);
}

// ---------- geometry ----------
const AX = { x: 0, y: 1, z: 2 };
function extents(p) {
  const s = p.size;
  const [cx, cy, cz] = p.position;
  let half;
  if (p.shape === 'box') half = [s.w / 2, s.h / 2, s.d / 2];
  else if (p.shape === 'sphere') half = [s.r, s.r, s.r];
  else {
    const r = p.shape === 'cone' ? Math.max(s.r1, s.r2) : s.r;
    half = [r, r, r];
    half[AX[p.axis || 'y']] = s.h / 2;
  }
  return { min: [cx - half[0], cy - half[1], cz - half[2]], max: [cx + half[0], cy + half[1], cz + half[2]] };
}

const all = bp.parts.map(extents);
const bmin = [0, 1, 2].map((k) => Math.min(...all.map((e) => e.min[k])));
const bmax = [0, 1, 2].map((k) => Math.max(...all.map((e) => e.max[k])));
const size = [0, 1, 2].map((k) => bmax[k] - bmin[k]);
const [W, H, D] = size.map((v) => v || 1);
if (bp.overall) {
  const want = [bp.overall.w, bp.overall.h, bp.overall.d];
  ['w', 'h', 'd'].forEach((k, i) => {
    if (typeof want[i] === 'number' && want[i] > 0 && Math.abs(size[i] - want[i]) / want[i] > 0.05) {
      warnings.push(`the parts measure ${round(size[i])} ${bp.units} in ${k}, but overall.${k} says ${want[i]}: fix a part or the overall size`);
    }
  });
}

// Parts that touch nothing else are probably floating.
function gap(a, b) {
  let g = 0;
  for (let k = 0; k < 3; k++) {
    const d = Math.max(a.min[k] - b.max[k], b.min[k] - a.max[k], 0);
    g = Math.max(g, d);
  }
  return g;
}
const tol = Math.max(W, H, D) * 0.01;
if (bp.parts.length > 1) {
  bp.parts.forEach((p, i) => {
    const touches = bp.parts.some((q, j) => j !== i && gap(all[i], all[j]) <= tol);
    if (!touches) warnings.push(`${p.id} touches no other part: it would float in the air`);
  });
}

// ---------- 2D primitives for the orthographic views ----------
// front: u = x, v = y (looking along -z); side (right): u = -z, v = y; top: u = x, v = z (z toward the viewer is down the page)
const VIEWS = {
  front: { u: 0, v: 1, dir: 2, uSign: 1 },
  side: { u: 2, v: 1, dir: 0, uSign: -1 },
  top: { u: 0, v: 2, dir: 1, uSign: 1 },
};

function orthoShapes(p, view) {
  const V = VIEWS[view];
  const c = p.position;
  const s = p.size;
  const out = [];
  const cu = c[V.u] * V.uSign;
  const cv = c[V.v];
  if (p.shape === 'box') {
    const dims = [s.w, s.h, s.d];
    out.push({ t: 'rect', cu, cv, hu: dims[V.u] / 2, hv: dims[V.v] / 2 });
  } else if (p.shape === 'sphere') {
    out.push({ t: 'circle', cu, cv, r: s.r });
  } else {
    const a = AX[p.axis || 'y'];
    const r1 = p.shape === 'cone' ? s.r1 : s.r; // radius at the low end of the axis
    const r2 = p.shape === 'cone' ? s.r2 : s.r; // radius at the high end
    if (a === V.dir) {
      out.push({ t: 'circle', cu, cv, r: Math.max(r1, r2) });
      if (Math.min(r1, r2) > 0 && r1 !== r2) out.push({ t: 'circle', cu, cv, r: Math.min(r1, r2) });
      if (p.shape === 'cylinder') out.push({ t: 'center', cu, cv, r: s.r });
    } else {
      // side-on: a trapezoid along the axis
      const alongU = a === V.u;
      let lo = -s.h / 2, hi = s.h / 2;
      let rlo = r1, rhi = r2;
      if (alongU && V.uSign < 0) { [lo, hi] = [-hi, -lo]; [rlo, rhi] = [rhi, rlo]; }
      const pts = alongU
        ? [[cu + lo, cv - rlo], [cu + hi, cv - rhi], [cu + hi, cv + rhi], [cu + lo, cv + rlo]]
        : [[cu - rlo, cv + lo], [cu - rhi, cv + hi], [cu + rhi, cv + hi], [cu + rlo, cv + lo]];
      out.push({ t: 'poly', pts });
      out.push({ t: 'axis', a: alongU ? 'u' : 'v', cu, cv, half: s.h / 2 + Math.max(r1, r2) * 0.15 });
    }
  }
  return out;
}

// ---------- 3D meshes for the exploded isometric view ----------
function meshFaces(p, offset) {
  const s = p.size;
  const [cx, cy, cz] = p.position.map((v, k) => v + offset[k]);
  const faces = [];
  const quad = (pts, n, kind = 'cap') => faces.push({ pts, n, kind });
  if (p.shape === 'box') {
    const hx = s.w / 2, hy = s.h / 2, hz = s.d / 2;
    const P = (sx, sy, sz) => [cx + sx * hx, cy + sy * hy, cz + sz * hz];
    quad([P(-1, -1, 1), P(1, -1, 1), P(1, 1, 1), P(-1, 1, 1)], [0, 0, 1]);
    quad([P(1, -1, -1), P(-1, -1, -1), P(-1, 1, -1), P(1, 1, -1)], [0, 0, -1]);
    quad([P(1, -1, 1), P(1, -1, -1), P(1, 1, -1), P(1, 1, 1)], [1, 0, 0]);
    quad([P(-1, -1, -1), P(-1, -1, 1), P(-1, 1, 1), P(-1, 1, -1)], [-1, 0, 0]);
    quad([P(-1, 1, 1), P(1, 1, 1), P(1, 1, -1), P(-1, 1, -1)], [0, 1, 0]);
    quad([P(-1, -1, -1), P(1, -1, -1), P(1, -1, 1), P(-1, -1, 1)], [0, -1, 0]);
  } else if (p.shape === 'sphere') {
    const lat = 10, lon = 20;
    for (let i = 0; i < lat; i++) {
      const t0 = Math.PI * (i / lat) - Math.PI / 2, t1 = Math.PI * ((i + 1) / lat) - Math.PI / 2;
      for (let j = 0; j < lon; j++) {
        const f0 = (2 * Math.PI * j) / lon, f1 = (2 * Math.PI * (j + 1)) / lon;
        const pt = (t, f) => [cx + s.r * Math.cos(t) * Math.cos(f), cy + s.r * Math.sin(t), cz + s.r * Math.cos(t) * Math.sin(f)];
        const tm = (t0 + t1) / 2, fm = (f0 + f1) / 2;
        quad([pt(t0, f0), pt(t0, f1), pt(t1, f1), pt(t1, f0)], [Math.cos(tm) * Math.cos(fm), Math.sin(tm), Math.cos(tm) * Math.sin(fm)], 'side');
      }
    }
  } else {
    const a = AX[p.axis || 'y'];
    const r1 = p.shape === 'cone' ? s.r1 : s.r;
    const r2 = p.shape === 'cone' ? s.r2 : s.r;
    const n = 28;
    const others = [0, 1, 2].filter((k) => k !== a);
    const pt = (ang, along, r) => {
      const v = [cx, cy, cz];
      v[a] += along;
      v[others[0]] += r * Math.cos(ang);
      v[others[1]] += r * Math.sin(ang);
      return v;
    };
    const h = s.h / 2;
    const slope = (r1 - r2) / (s.h || 1);
    for (let j = 0; j < n; j++) {
      const f0 = (2 * Math.PI * j) / n, f1 = (2 * Math.PI * (j + 1)) / n, fm = (f0 + f1) / 2;
      const nrm = [0, 0, 0];
      nrm[others[0]] = Math.cos(fm);
      nrm[others[1]] = Math.sin(fm);
      nrm[a] = slope;
      quad([pt(f0, -h, r1), pt(f1, -h, r1), pt(f1, h, r2), pt(f0, h, r2)], nrm, 'side');
    }
    const ring = (along, r) => Array.from({ length: n }, (_, j) => pt((2 * Math.PI * j) / n, along, r));
    const up = [0, 0, 0]; up[a] = 1;
    const down = [0, 0, 0]; down[a] = -1;
    if (r2 > 0) quad(ring(h, r2), up);
    if (r1 > 0) quad(ring(-h, r1).reverse(), down);
  }
  return faces;
}

const VIEWDIR = norm([1, 1.15, 1]);
function norm(v) { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); }
function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
const C30 = Math.cos(Math.PI / 6), S30 = Math.sin(Math.PI / 6);
const iso = ([x, y, z]) => [(x - z) * C30, (x + z) * S30 - y];

// ---------- layout ----------
const SHEET = { w: 1600, h: 1000 };
const BOX = {
  front: { x: 40, y: 80, w: 420, h: 410, label: 'FRONT VIEW' },
  side: { x: 480, y: 80, w: 310, h: 410, label: 'RIGHT SIDE VIEW' },
  top: { x: 40, y: 520, w: 420, h: 320, label: 'TOP VIEW' },
  notes: { x: 480, y: 520, w: 310, h: 320, label: 'NOTES' },
  iso: { x: 810, y: 80, w: 750, h: 500, label: 'EXPLODED ISOMETRIC' },
  parts: { x: 810, y: 600, w: 750, h: 240, label: 'PARTS LIST' },
};
const fit = 0.72;
const s = Math.min(
  (BOX.front.w * fit) / W, (BOX.front.h * fit) / H,
  (BOX.side.w * fit) / D, (BOX.side.h * fit) / H,
  (BOX.top.w * fit) / W, (BOX.top.h * fit) / D,
);
// paper scale: the sheet is drawn as A3 landscape, 420 mm across 1600 px
const pxPerPaperMm = SHEET.w / 420;
const unitMm = { mm: 1, cm: 10, m: 1000, in: 25.4, ft: 304.8 }[bp.units] || 1;
const ratio = (unitMm * pxPerPaperMm) / s; // real mm per paper mm
const niceRatios = [1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000];
const nice = niceRatios.find((r) => r >= ratio * 0.98) || Math.round(ratio);
const scaleLabel = ratio < 1 ? `${round(1 / ratio, 1)}:1` : `1:${nice}`;

const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function round(v, d = 0) { const m = 10 ** d; return Math.round(v * m) / m; }
const fmt = (v) => `${round(v, v < 10 ? 1 : 0)}`;

let svg = [];
const add = (x) => svg.push(x);

// ---------- draw ortho views ----------
const partNo = new Map(bp.parts.map((p, i) => [p.id, i + 1]));
function drawView(name) {
  const B = BOX[name];
  const V = VIEWS[name];
  const minU = V.uSign > 0 ? bmin[V.u] : -bmax[V.u];
  const maxU = V.uSign > 0 ? bmax[V.u] : -bmin[V.u];
  const midU = (minU + maxU) / 2;
  const midV = (bmin[V.v] + bmax[V.v]) / 2;
  const ox = B.x + B.w / 2, oy = B.y + B.h / 2 + 8;
  const flipV = name !== 'top';
  const X = (u) => ox + (u - midU) * s;
  const Y = (v) => (flipV ? oy - (v - midV) * s : oy + (v - midV) * s);
  add(`<g class="view">`);
  // draw larger parts first so small details sit on top
  const order = bp.parts.map((p, i) => ({ p, e: all[i] })).sort((a, b) => vol(b.e) - vol(a.e));
  for (const { p } of order) {
    for (const g of orthoShapes(p, name)) {
      if (g.t === 'rect') add(`<rect class="ln" x="${X(g.cu - g.hu)}" y="${Math.min(Y(g.cv - g.hv), Y(g.cv + g.hv))}" width="${2 * g.hu * s}" height="${2 * g.hv * s}"/>`);
      else if (g.t === 'circle') add(`<circle class="ln" cx="${X(g.cu)}" cy="${Y(g.cv)}" r="${g.r * s}"/>`);
      else if (g.t === 'poly') add(`<polygon class="ln" points="${g.pts.map(([u, v]) => `${X(u)},${Y(v)}`).join(' ')}"/>`);
      else if (g.t === 'axis') {
        if (g.a === 'u') add(`<line class="cl" x1="${X(g.cu - g.half)}" y1="${Y(g.cv)}" x2="${X(g.cu + g.half)}" y2="${Y(g.cv)}"/>`);
        else add(`<line class="cl" x1="${X(g.cu)}" y1="${Y(g.cv - g.half)}" x2="${X(g.cu)}" y2="${Y(g.cv + g.half)}"/>`);
      } else if (g.t === 'center') {
        const r = g.r * s * 1.15;
        add(`<line class="cl" x1="${X(g.cu) - r}" y1="${Y(g.cv)}" x2="${X(g.cu) + r}" y2="${Y(g.cv)}"/><line class="cl" x1="${X(g.cu)}" y1="${Y(g.cv) - r}" x2="${X(g.cu)}" y2="${Y(g.cv) + r}"/>`);
      }
    }
  }
  // overall dimensions
  const L = X(minU), R = X(maxU);
  const Tp = Math.min(Y(bmin[V.v]), Y(bmax[V.v])), Bt = Math.max(Y(bmin[V.v]), Y(bmax[V.v]));
  dimH(L, R, Bt + 26, `${fmt(maxU - minU)}`);
  if (name !== 'top') dimV(Tp, Bt, L - 26, `${fmt(bmax[V.v] - bmin[V.v])}`);
  else dimV(Tp, Bt, L - 26, `${fmt(bmax[V.v] - bmin[V.v])}`);
  add(`</g>`);
}
function vol(e) { return (e.max[0] - e.min[0]) * (e.max[1] - e.min[1]) * (e.max[2] - e.min[2]); }
function dimH(x1, x2, y, label) {
  add(`<g class="dim"><line x1="${x1}" y1="${y - 10}" x2="${x1}" y2="${y + 4}"/><line x1="${x2}" y1="${y - 10}" x2="${x2}" y2="${y + 4}"/>` +
    `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" marker-start="url(#ar)" marker-end="url(#ar)"/>` +
    `<text x="${(x1 + x2) / 2}" y="${y - 5}" text-anchor="middle">${esc(label)}</text></g>`);
}
function dimV(y1, y2, x, label) {
  add(`<g class="dim"><line x1="${x - 4}" y1="${y1}" x2="${x + 10}" y2="${y1}"/><line x1="${x - 4}" y1="${y2}" x2="${x + 10}" y2="${y2}"/>` +
    `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" marker-start="url(#ar)" marker-end="url(#ar)"/>` +
    `<text x="${x - 6}" y="${(y1 + y2) / 2}" text-anchor="middle" transform="rotate(-90 ${x - 6} ${(y1 + y2) / 2})">${esc(label)}</text></g>`);
}

// ---------- draw exploded iso ----------
function drawIso() {
  const B = BOX.iso;
  const step = Math.max(W, H, D) * (bp.explodeStep || 0.35);
  const items = bp.parts.map((p, i) => {
    const off = (p.explode || [0, 0, 0]).map((v) => v * step);
    return { p, i, off, faces: meshFaces(p, off) };
  });
  const faces = [];
  for (const it of items) for (const f of it.faces) {
    if (dot(f.n, VIEWDIR) <= 0) continue;
    const c = f.pts.reduce((a, q) => [a[0] + q[0], a[1] + q[1], a[2] + q[2]], [0, 0, 0]).map((v) => v / f.pts.length);
    faces.push({ ...f, depth: dot(c, VIEWDIR), shade: dot(norm(f.n), norm([0.4, 1, 0.6])) });
  }
  faces.sort((a, b) => a.depth - b.depth);
  const pts2 = faces.flatMap((f) => f.pts.map(iso));
  const minX = Math.min(...pts2.map((q) => q[0])), maxX = Math.max(...pts2.map((q) => q[0]));
  const minY = Math.min(...pts2.map((q) => q[1])), maxY = Math.max(...pts2.map((q) => q[1]));
  const k = Math.min((B.w * 0.78) / (maxX - minX || 1), (B.h * 0.78) / (maxY - minY || 1));
  const ox = B.x + B.w / 2 - ((minX + maxX) / 2) * k, oy = B.y + B.h / 2 + 10 - ((minY + maxY) / 2) * k;
  const P = (q) => { const [x, y] = iso(q); return [ox + x * k, oy + y * k]; };
  add('<g class="iso">');
  for (const f of faces) {
    const a = 0.05 + Math.max(0, f.shade) * 0.16;
    const cls = f.kind === 'side' ? 'fs' : 'fc';
    add(`<polygon class="${cls}" style="fill:rgba(255,255,255,${a.toFixed(3)})" points="${f.pts.map(P).map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}"/>`);
  }
  // explode lines and balloons
  const placed = [];
  for (const it of items) {
    const c0 = it.p.position;
    const c1 = c0.map((v, kk) => v + it.off[kk]);
    if (it.off.some((v) => v !== 0)) {
      const [x0, y0] = P(c0), [x1, y1] = P(c1);
      add(`<line class="ex" x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}"/>`);
    }
    const [bx, by] = P(c1);
    // push the balloon out to the right or left of the drawing, away from other balloons
    const side = bx > B.x + B.w / 2 ? 1 : -1;
    let lx = bx + side * (60 + (it.i % 3) * 18), ly = by - 30;
    while (placed.some(([px, py]) => Math.hypot(px - lx, py - ly) < 30)) ly -= 30;
    lx = Math.min(Math.max(lx, B.x + 20), B.x + B.w - 20);
    ly = Math.min(Math.max(ly, B.y + 30), B.y + B.h - 20);
    placed.push([lx, ly]);
    add(`<line class="ld" x1="${bx}" y1="${by}" x2="${lx}" y2="${ly}"/><circle class="dot" cx="${bx}" cy="${by}" r="2.5"/>` +
      `<circle class="bal" cx="${lx}" cy="${ly}" r="12"/><text class="baln" x="${lx}" y="${ly + 4}" text-anchor="middle">${it.i + 1}</text>`);
  }
  add('</g>');
}

// ---------- frames, parts list, notes, title block ----------
function frame(B) {
  add(`<rect class="fr" x="${B.x}" y="${B.y}" width="${B.w}" height="${B.h}"/>` +
    `<text class="lbl" x="${B.x + 10}" y="${B.y + 20}">${esc(B.label)}</text>`);
}
function partsList() {
  const B = BOX.parts;
  const cols = [
    { k: 'NO', w: 40 }, { k: 'PART', w: 210 }, { k: 'QTY', w: 45 }, { k: 'MATERIAL / FINISH', w: 260 }, { k: `SIZE (${bp.units.toUpperCase()})`, w: 195 },
  ];
  const n = bp.parts.length;
  const avail = B.h - 56;
  // shrink rows (down to a readable minimum) so long parts lists still fit
  const rowH = Math.max(10.5, Math.min(17, avail / n));
  const font = Math.max(9, Math.min(12, rowH * 0.72));
  let maxRows = Math.floor(avail / rowH);
  const overflow = n > maxRows;
  if (overflow) maxRows -= 1; // keep a row free for the "+ N more" line
  let x = B.x + 10;
  const y0 = B.y + 42;
  for (const c of cols) { add(`<text class="th" x="${x}" y="${y0}">${esc(c.k)}</text>`); c.x = x; x += c.w; }
  add(`<line class="thin" x1="${B.x + 8}" y1="${y0 + 5}" x2="${B.x + B.w - 8}" y2="${y0 + 5}"/>`);
  const charW = font * 0.6;
  bp.parts.slice(0, maxRows).forEach((p, i) => {
    const y = y0 + 5 + rowH * (i + 1) - 2;
    const sz = p.size;
    const sizeTxt = p.shape === 'box' ? `${fmt(sz.w)} x ${fmt(sz.h)} x ${fmt(sz.d)}` : p.shape === 'sphere' ? `D ${fmt(sz.r * 2)}` : p.shape === 'cone' ? `D ${fmt(sz.r1 * 2)}/${fmt(sz.r2 * 2)} x ${fmt(sz.h)}` : `D ${fmt(sz.r * 2)} x ${fmt(sz.h)}`;
    const cells = [String(i + 1), p.name, String(p.qty || 1), p.material || '', sizeTxt];
    cells.forEach((t, j) => add(`<text class="td" style="font-size:${font.toFixed(1)}px" x="${cols[j].x}" y="${y}">${esc(clip(t, Math.floor((cols[j].w - 8) / charW)))}</text>`));
  });
  if (overflow) {
    const y = y0 + 5 + rowH * (maxRows + 1) - 2;
    add(`<text class="td" style="font-size:${font.toFixed(1)}px" x="${B.x + 10}" y="${y}">+ ${n - maxRows} more parts in blueprint.json</text>`);
  }
}
function clip(t, n) { t = String(t); return t.length > n ? t.slice(0, n - 1) + '…' : t; }
function notes() {
  const B = BOX.notes;
  const lines = [...(bp.notes || [])];
  lines.unshift(`ALL SIZES IN ${bp.units.toUpperCase()}. OVERALL ${fmt(W)} W x ${fmt(H)} H x ${fmt(D)} D.`);
  let y = B.y + 46;
  const wrap = Math.floor((B.w - 30) / 7.4);
  lines.forEach((l, i) => {
    const words = `${i + 1}. ${l}`.toUpperCase().split(' ');
    let line = '';
    for (const w of words) {
      if ((line + ' ' + w).trim().length > wrap) { add(`<text class="nt" x="${B.x + 12}" y="${y}">${esc(line.trim())}</text>`); y += 16; line = '   ' + w; }
      else line += ' ' + w;
    }
    add(`<text class="nt" x="${B.x + 12}" y="${y}">${esc(line.trim())}</text>`);
    y += 22;
  });
}
function titleBlock() {
  const x = 810, y = 858, w = 750, h = 112;
  add(`<rect class="fr" x="${x}" y="${y}" width="${w}" height="${h}"/>`);
  add(`<line class="thin" x1="${x + 470}" y1="${y}" x2="${x + 470}" y2="${y + h}"/>`);
  add(`<line class="thin" x1="${x + 470}" y1="${y + 56}" x2="${x + w}" y2="${y + 56}"/>`);
  add(`<line class="thin" x1="${x + 610}" y1="${y}" x2="${x + 610}" y2="${y + h}"/>`);
  add(`<text class="tsm" x="${x + 12}" y="${y + 20}">TITLE</text>`);
  add(`<text class="ttl" x="${x + 12}" y="${y + 56}">${esc(clip(bp.title.toUpperCase(), 30))}</text>`);
  if (bp.subtitle) add(`<text class="tsub" x="${x + 12}" y="${y + 84}">${esc(clip(bp.subtitle, 60))}</text>`);
  const cell = (cx, cy, k, v) => add(`<text class="tsm" x="${cx}" y="${cy}">${k}</text><text class="tval" x="${cx}" y="${cy + 24}">${esc(v)}</text>`);
  cell(x + 482, y + 20, 'SCALE', scaleLabel);
  cell(x + 622, y + 20, 'UNITS', bp.units.toUpperCase());
  cell(x + 482, y + 76, 'DATE', bp.date || new Date().toISOString().slice(0, 10));
  cell(x + 622, y + 76, 'SHEET', '1 / 1');
  add(`<text class="tsm" x="${x + 12}" y="${y + h - 10}">DRAWN BY ${esc((bp.drawnBy || 'BLUEPRINT SKILL').toUpperCase())}</text>`);
}

// grid + border
add(`<rect x="0" y="0" width="${SHEET.w}" height="${SHEET.h}" fill="#0d3a6e"/>`);
add(`<rect x="0" y="0" width="${SHEET.w}" height="${SHEET.h}" fill="url(#g1)"/><rect x="0" y="0" width="${SHEET.w}" height="${SHEET.h}" fill="url(#g2)"/>`);
add(`<rect class="bd" x="18" y="18" width="${SHEET.w - 36}" height="${SHEET.h - 36}"/><rect class="thin" x="26" y="26" width="${SHEET.w - 52}" height="${SHEET.h - 52}"/>`);
add(`<text class="hdr" x="40" y="60">${esc(bp.title.toUpperCase())}</text>`);
add(`<text class="hdr2" x="${SHEET.w - 40}" y="60" text-anchor="end">${esc((bp.subtitle || '').toUpperCase())}</text>`);
for (const k of Object.keys(BOX)) frame(BOX[k]);
drawView('front');
drawView('side');
drawView('top');
notes();
drawIso();
partsList();
titleBlock();

const css = `
.ln{fill:rgba(255,255,255,.035);stroke:#e8f3ff;stroke-width:1.3;stroke-linejoin:round}
.cl{stroke:#9fd0ff;stroke-width:.8;stroke-dasharray:14 4 3 4}
.dim line{stroke:#bfe1ff;stroke-width:.8}.dim text{fill:#e8f3ff;font-size:12px}
.fr{fill:none;stroke:#cfe6ff;stroke-width:1.2}.bd{fill:none;stroke:#e8f3ff;stroke-width:2.2}
.thin{fill:none;stroke:#9fc8ef;stroke-width:.7}
.lbl{fill:#cfe6ff;font-size:12px;letter-spacing:2px}
.fs{stroke:#e8f3ff;stroke-opacity:.18;stroke-width:.6}.fc{stroke:#e8f3ff;stroke-width:1.1;stroke-linejoin:round}
.ex{stroke:#9fd0ff;stroke-width:.8;stroke-dasharray:4 4}.ld{stroke:#e8f3ff;stroke-width:.7}
.dot{fill:#e8f3ff}.bal{fill:#0d3a6e;stroke:#e8f3ff;stroke-width:1.2}.baln{fill:#fff;font-size:12px;font-weight:700}
.th{fill:#cfe6ff;font-size:11px;letter-spacing:1px}.td{fill:#f2f8ff;font-size:12px}
.nt{fill:#e8f3ff;font-size:11.5px}
.hdr{fill:#fff;font-size:22px;letter-spacing:4px;font-weight:700}.hdr2{fill:#cfe6ff;font-size:13px;letter-spacing:2px}
.tsm{fill:#9fc8ef;font-size:10px;letter-spacing:2px}.ttl{fill:#fff;font-size:24px;font-weight:700;letter-spacing:2px}
.tsub{fill:#e8f3ff;font-size:12px}.tval{fill:#fff;font-size:16px;font-weight:700}
text{font-family:"Courier New",Courier,ui-monospace,monospace}`;

const svgDoc = `<svg id="sheet" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SHEET.w} ${SHEET.h}" width="${SHEET.w}" height="${SHEET.h}">
<defs>
<pattern id="g1" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="1"/></pattern>
<pattern id="g2" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M100 0H0V100" fill="none" stroke="rgba(255,255,255,.11)" stroke-width="1"/></pattern>
<marker id="ar" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1L10 5L0 9z" fill="#e8f3ff"/></marker>
<style>${css}</style>
</defs>
${svg.join('\n')}
</svg>`;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Blueprint: ${esc(bp.title)}</title>
<style>
body{margin:0;background:#081f3d;color:#e8f3ff;font-family:"Courier New",monospace}
.bar{display:flex;gap:10px;align-items:center;justify-content:space-between;padding:10px 16px}
button{background:#0d3a6e;color:#fff;border:1px solid #9fc8ef;border-radius:6px;padding:8px 14px;font:inherit;cursor:pointer}
.wrap{padding:0 16px 16px}svg{width:100%;height:auto;display:block;box-shadow:0 8px 40px rgba(0,0,0,.45)}
</style></head><body>
<div class="bar"><span>BLUEPRINT · ${esc(bp.title)}</span><button id="png">Download PNG</button></div>
<div class="wrap">${svgDoc}</div>
<script>
document.getElementById('png').onclick = () => {
  const svg = document.getElementById('sheet');
  const data = new XMLSerializer().serializeToString(svg);
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas'); c.width = ${SHEET.w * 2}; c.height = ${SHEET.h * 2};
    const g = c.getContext('2d'); g.drawImage(img, 0, 0, c.width, c.height);
    const a = document.createElement('a'); a.download = ${JSON.stringify((bp.slug || bp.title).toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-blueprint.png')};
    a.href = c.toDataURL('image/png'); a.click();
  };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(data);
};
</script></body></html>`;

writeFileSync(outPath, html);
for (const w of warnings) console.log('WARNING: ' + w);
console.log(`Wrote ${outPath}: ${bp.parts.length} parts, overall ${fmt(W)} x ${fmt(H)} x ${fmt(D)} ${bp.units}, scale ${scaleLabel}`);
