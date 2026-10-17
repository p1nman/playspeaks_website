// Shared storybook-style toolkit for the v2 video source pages (needs characters.js first).
// Motion helpers, foliage (ivy, wisteria, fairy lights, the playroom tree), set pieces,
// parallax mountains, overlays (leaf sweep, vignette, grain), and the preview player.
ST = 'story';

const $ = (id) => document.getElementById(id);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t, start, dur) => clamp((t - start) / dur);
const lerp = (a, b, p) => a + (b - a) * p;
const easeOut = (x) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x) => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeBack = (x) => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const bounce = (x) => { const n1 = 7.5625, d1 = 2.75; if (x < 1 / d1) return n1 * x * x; if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + .75; if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + .9375; return n1 * (x -= 2.625 / d1) * x + .984375; };
const spring = (x) => (x >= 1 ? 1 : 1 - Math.exp(-6 * x) * Math.cos(9 * x));
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function smooth(p) {
  let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1.map(v => v.toFixed(1))} ${c2.map(v => v.toFixed(1))} ${p2.map(v => v.toFixed(1))}`;
  }
  return d;
}
function scribble(cx, cy, rx, ry, k, seed) {
  const r = rng(seed); const pts = []; let a = 0;
  for (let i = 0; i < k; i++) { a += 0.9 + r() * 1.3; const m = 0.3 + r() * 0.7; pts.push([cx + Math.cos(a) * rx * m, cy + Math.sin(a) * ry * m]); }
  return smooth(pts);
}
const bez = ([a, b, c, d], t) => { const u = 1 - t; return [0, 1].map((k) => u * u * u * a[k] + 3 * u * u * t * b[k] + 3 * u * t * t * c[k] + t * t * t * d[k]); };

// ---------- motion helpers ----------
function show(e, t, a, b, { dy = 40, dur = 0.8, out = 0.5 } = {}) {
  const pin = easeOut(prog(t, a, dur)), pout = b == null ? 0 : easeInOut(prog(t, b - out, out));
  e.style.opacity = (pin * (1 - pout)).toFixed(3);
  e.style.transform = `translateY(${((1 - pin) * dy - pout * dy * 0.5).toFixed(1)}px)`;
}
// word-by-word reveal: each word rises and un-blurs in turn
const words = (s) => s.split(/(\s+|<br>)/).map((w) => (/^\s*$/.test(w) || w === '<br>' ? w : `<span class="w">${w}</span>`)).join('');
function reveal(e, t, a, b, stagger = 0.07) {
  const ws = e._w || (e._w = [...e.querySelectorAll('.w')]);
  const po = b == null ? 0 : easeInOut(prog(t, b - 0.5, 0.5));
  ws.forEach((w, i) => {
    const p = easeOut(prog(t, a + i * stagger, 0.7));
    w.style.opacity = (p * (1 - po)).toFixed(3);
    w.style.transform = `translateY(${((1 - p) * 30 - po * 16).toFixed(1)}px)`;
    w.style.filter = p < 1 ? `blur(${((1 - p) * 8).toFixed(1)}px)` : 'none';
  });
}
function scene(e, t, a, b, fade = 0.5) {
  const o = Math.min(prog(t, a, fade), 1 - prog(t, b - fade, fade));
  e.style.display = o <= 0 ? 'none' : 'block'; e.style.opacity = o.toFixed(3);
  return o > 0;
}
// camera: keep world point (fx, fy) at screen centre, zoomed by s
const camAt = (e, fx, fy, s) => (e.style.transform = `translate(${(960 - fx * s).toFixed(1)}px, ${(540 - fy * s).toFixed(1)}px) scale(${s.toFixed(4)})`);
function cam(e, t, a, d, [fx0, fy0, s0], [fx1, fy1, s1], ease = easeInOut) {
  const p = ease(prog(t, a, d)); camAt(e, lerp(fx0, fx1, p), lerp(fy0, fy1, p), lerp(s0, s1, p));
}
function pop(id, t, a, dur = 0.8) {
  const e = $(id), p = prog(t, a, dur);
  e.style.opacity = clamp(p * 3).toFixed(3);
  e.style.transform = `translateY(${(Math.sin(t * 2.2 + a) * 4 * p).toFixed(1)}px) scale(${easeBack(p).toFixed(3)})`;
}
const rot = (id, a, [x, y]) => { const e = $(id); if (e) e.setAttribute('transform', `rotate(${a.toFixed(2)} ${x.toFixed(1)} ${y.toFixed(1)})`); };
const tilt = (id, a) => { rot(`${id}-head`, a, RIG[id].neck); rot(`${id}-hb`, a, RIG[id].neck); };
const arm = (id, side, a) => rot(`${id}-arm${side}`, a, RIG[id][`sh${side}`]);
function blink(id, t, ph) {
  const e = $(`${id}-head`).querySelector('.eyes'); if (!e) return;
  e.style.transform = ((t + ph) % 3.7) < 0.14 ? 'scaleY(0.12)' : 'none';
}
function draw(path, p) {
  const len = path._len || (path._len = path.getTotalLength());
  path.style.strokeDasharray = `${len} ${len}`; path.style.strokeDashoffset = (len * (1 - p)).toFixed(1);
}

// ---------- foliage: ivy, wisteria, fairy lights ----------
const IVY = 'M0 0 C-5 2 -11 3 -13 9 C-9 10 -8 12 -8 16 C-4 15 -2 17 0 22 C2 17 4 15 8 16 C8 12 9 10 13 9 C11 3 5 2 0 0Z';
const GREENS = ['#2f6b43', '#3b7d4f', '#4f8f5c', '#27593a', '#5d9c66', '#3f7448'];
function strand(x, y, len, r, sc = 1, white = false) {
  const ph = r() * 6, pts = [];
  for (let d = 0; d <= len; d += 22 * sc) pts.push([x + Math.sin(d / (55 * sc) + ph) * 5 * sc, y + d]);
  if (pts.length < 2) pts.push([x, y + len]);
  let s = `<path d="${smooth(pts)}" fill="none" stroke="#4a6e3f" stroke-width="${n(1.6 * sc)}"/>`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i], k = 1 - (i / pts.length) * 0.55;
    if (white) for (let j = 0; j < 3; j++) s += `<ellipse cx="${n(px + (r() - .5) * 14 * sc * k)}" cy="${n(py + (r() - .5) * 10 * sc)}" rx="${n(5.5 * sc * k)}" ry="${n(4.2 * sc * k)}" fill="${r() > .5 ? '#fdfaf3' : '#ebe4d4'}"/>`;
    else { const side = i % 2 ? 1 : -1; s += `<path d="${IVY}" fill="${GREENS[(r() * GREENS.length) | 0]}" transform="translate(${n(px)} ${n(py)}) rotate(${n(side * (30 + r() * 35))}) scale(${n((0.85 + r() * 0.55) * sc)})"/>`; }
  }
  return `<g class="sway" data-x="${n(x)}" data-y="${n(y)}" data-ph="${n(ph)}" data-amp="${n(0.8 + r() * 1.4)}">${s}</g>`;
}
const twinkle = (x, y, r, sz = 1) => `<g class="tw" data-ph="${n(r() * 20)}" data-w="${n(1.5 + r() * 2.5)}"><circle cx="${n(x)}" cy="${n(y)}" r="${n(16 * sz)}" fill="url(#twGlow)"/><circle cx="${n(x)}" cy="${n(y)}" r="${n(2.6 * sz)}" fill="#fffbe6"/></g>`;

// the playroom tree: twisted kraft-paper trunk, branches, ivy + wisteria, fairy lights
function tree({ ox, oy, k = 1, trunk = 560, maxLen = 520, seed = 5, lights = 150, spread = 720 }) {
  const r = rng(seed), top = -trunk;
  let s = `<g transform="translate(${ox} ${oy}) scale(${k})">`;
  const TAN = ['#c49e68', '#d9b98a', '#cfae7c', '#e4c999', '#d2b07f'];
  for (let j = 0; j < 5; j++) {
    const pts = [], ph = j * 1.7;
    for (let y = 40; y >= top - 10; y -= 36) { const tt = y / top; pts.push([Math.sin(y / 65 + ph) * (12 + 8 * tt) + (j - 2) * 11 * (1 - tt * 0.5), y]); }
    s += `<path d="${smooth(pts)}" fill="none" stroke="${TAN[j]}" stroke-width="${36 - j * 4}" stroke-linecap="round"/>`;
  }
  for (let i = 0; i < 55; i++) { const y = (top + 20) * r(), x = (r() - .5) * 50; s += `<path d="M${n(x)} ${n(y)} l${n((r() - .5) * 16)} ${n(-6 - r() * 12)}" stroke="#a98552" stroke-width="2.2" opacity=".5" stroke-linecap="round" fill="none"/>`; }
  const BR = [
    [[0, top], [-200, top - 40], [-420, top - 10], [-spread, top - 90]],
    [[0, top], [-120, top - 120], [-300, top - 170], [-440, top - 210]],
    [[0, top], [60, top - 140], [150, top - 190], [260, top - 220]],
    [[0, top], [220, top - 30], [460, top - 70], [spread, top - 50]],
    [[0, top + 40], [-180, top + 10], [-300, top + 30], [-530, top + 70]],
    [[0, top + 30], [200, top + 20], [330, top + 50], [550, top + 40]],
  ];
  BR.forEach((b) => { const d = `M${b[0]} C${b[1]} ${b[2]} ${b[3]}`; s += `<path d="${d}" fill="none" stroke="#cfae7c" stroke-width="24" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#e6cd9f" stroke-width="8" stroke-linecap="round" transform="translate(-3 -5)"/>`; });
  let lightsSvg = '';
  BR.forEach((b) => {
    for (let tt = 0.07; tt <= 1; tt += 0.085 + r() * 0.05) {
      const [ax, ay] = bez(b, tt);
      s += strand(ax + (r() - .5) * 20, ay, 70 + r() * (maxLen - 70) * (1 - tt * 0.3), r, 1, r() < 0.3);
    }
  });
  for (let i = 0; i < lights; i++) { const b = BR[(r() * BR.length) | 0], [ax, ay] = bez(b, r()); lightsSvg += twinkle(ax + (r() - .5) * 60, ay + r() * maxLen * 0.75, r); }
  return s + lightsSvg + '</g>';
}
// a branch of vines hanging along the top edge of the frame
function garland(seed, { maxLen = 200, lights = 40, y0 = -6 } = {}) {
  const r = rng(seed); let s = `<path d="M-40 ${y0} C400 ${y0 + 30} 800 ${y0 - 10} 1200 ${y0 + 24} S1800 ${y0} 1960 ${y0 + 16}" fill="none" stroke="#cfae7c" stroke-width="20"/>`, l = '';
  for (let x = -10; x < 1940; x += 34 + r() * 22) s += strand(x, y0 + 6 + r() * 10, 40 + r() * (maxLen - 40), r, 1, r() < 0.2);
  for (let i = 0; i < lights; i++) l += twinkle(r() * 1920, 10 + r() * maxLen * 0.7, r);
  return s + l;
}
const crane = (x, len, col, r) => `<g class="sway" data-x="${x}" data-y="0" data-ph="${n(r() * 6)}" data-amp="2.5"><path d="M${x} 0 V${len}" stroke="rgba(60,50,40,.35)" stroke-width="1.5"/><g transform="translate(${x} ${len + 6})"><path d="M-16 0 L0 -5 L16 -2 L2 5Z" fill="${col}"/><path d="M-2 -2 L-8 -16 L6 -3Z" fill="${shade(col, .15)}"/></g></g>`;

// ---------- playroom set pieces ----------
function chair(cx, by) {
  const id = `ch${cx}`;
  const body = `M${cx - 165} ${by} C${cx - 182} ${by - 150} ${cx - 150} ${by - 236} ${cx - 64} ${by - 250} L${cx + 64} ${by - 250} C${cx + 150} ${by - 236} ${cx + 182} ${by - 150} ${cx + 165} ${by}Z`;
  let s = `<ellipse cx="${cx}" cy="${by + 4}" rx="200" ry="22" fill="rgba(40,30,20,.22)"/><clipPath id="${id}"><path d="${body}"/></clipPath><path d="${body}" fill="#5c6372"/><g clip-path="url(#${id})">`;
  for (let x = cx - 180; x < cx + 180; x += 19) s += `<path d="M${x} ${by - 260} Q${x + 4} ${by - 120} ${x} ${by}" stroke="#4d5361" stroke-width="7" fill="none"/>`;
  s += `</g>`;
  for (const k of [-1, 1]) s += `<ellipse cx="${cx + k * 128}" cy="${by - 105}" rx="56" ry="104" fill="#666d7c"/><path d="M${cx + k * 128} ${by - 200} V${by - 10} M${cx + k * 110} ${by - 195} V${by - 18} M${cx + k * 146} ${by - 195} V${by - 18}" stroke="#575e6c" stroke-width="6"/>`;
  s += `<ellipse cx="${cx}" cy="${by - 62}" rx="104" ry="56" fill="#535967"/>`;
  s += `<rect x="${cx - 72}" y="${by - 226}" width="144" height="124" rx="10" fill="#232c45"/><text x="${cx - 56}" y="${by - 192}" font-family="Fredoka" font-weight="600" font-size="24" fill="#fff">PLAY:</text>`;
  for (let i = 0; i < 4; i++) s += `<rect x="${cx - 56}" y="${by - 178 + i * 16}" width="${[104, 96, 110, 70][i]}" height="5" rx="2" fill="rgba(255,255,255,.7)"/>`;
  // blue dragon plush on top
  const dx = cx - 10, dy = by - 252;
  s += `<path d="M${dx - 40} ${dy - 20} L${dx - 10} ${dy - 58} L${dx + 18} ${dy - 22}Z" fill="#d9b14a"/><ellipse cx="${dx}" cy="${dy}" rx="72" ry="30" fill="#6d8fd6"/><ellipse cx="${dx + 6}" cy="${dy + 10}" rx="48" ry="14" fill="#9fb8e8"/>`;
  for (let i = 0; i < 4; i++) s += `<path d="M${dx - 40 + i * 22} ${dy - 26} l9 -16 l9 16Z" fill="#58a6a0"/>`;
  s += `<path d="M${dx + 64} ${dy + 4} q40 -6 48 18 q-24 -6 -46 0Z" fill="#6d8fd6"/><circle cx="${dx - 70}" cy="${dy - 12}" r="28" fill="#6d8fd6"/><circle cx="${dx - 80}" cy="${dy - 16}" r="4.5" fill="${INK}"/><ellipse cx="${dx - 92}" cy="${dy - 4}" rx="12" ry="9" fill="#9fb8e8"/>`;
  return s;
}
function rugQ([tl, tr, br, bl], cols, rows) {
  const at = (u, v) => [0, 1].map((k) => lerp(lerp(tl[k], tr[k], u), lerp(bl[k], br[k], u), v));
  let s = '';
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const q = [at(i / cols, j / rows), at((i + 1) / cols, j / rows), at((i + 1) / cols, (j + 1) / rows), at(i / cols, (j + 1) / rows)];
    s += `<path d="M${q.map((p) => p.map(n).join(' ')).join(' L')}Z" fill="${(i + j) % 2 ? '#f3efe6' : '#7f9cc4'}"/>`;
  }
  return s;
}
function shelf(x, y) {
  let s = `<g stroke="#3b3431" stroke-width="7" fill="none"><path d="M${x} ${y} V${y + 290} M${x + 260} ${y} V${y + 290}"/>${[0, 95, 190, 285].map((d) => `<path d="M${x} ${y + d} H${x + 260}"/>`).join('')}</g>`;
  const r = rng(9), books = ['#c0705a', '#e9b872', '#3d4a63', '#7f9cc4', '#2f5446', '#a35a45', '#d9b14a', '#6fa37d'];
  let bx = x + 10; while (bx < x + 245) { const w = 12 + r() * 12, h = 58 + r() * 26; s += `<rect x="${n(bx)}" y="${n(y - h)}" width="${n(w)}" height="${n(h)}" rx="2" fill="${books[(r() * 8) | 0]}"/>`; bx += w + 2; }
  for (const d of [95, 190, 285]) for (let i = 0; i < 9; i++) {
    const mx = x + 18 + i * 27, c = books[(r() * 8) | 0], my = y + d;
    s += r() < .5 ? `<circle cx="${mx}" cy="${my - 12}" r="9" fill="${c}"/><rect x="${mx - 6}" y="${my - 6}" width="12" height="6" fill="${shade(c, .2)}"/>` : `<path d="M${mx - 10} ${my} L${mx} ${my - 24} L${mx + 10} ${my}Z" fill="${c}"/>`;
  }
  return s;
}

// ---------- mountains with parallax, rays, mist, birds ----------
const RIDGES = [
  ['#7a6f86', 'M0 640 L180 520 L330 590 L520 430 L700 560 L860 470 L1040 580 L1220 420 L1400 540 L1580 460 L1760 560 L1920 500 V1080 H0Z'],
  ['#4f5a72', 'M0 720 L200 600 L380 690 L600 560 L780 660 L960 590 L1160 700 L1360 580 L1560 680 L1760 600 L1920 660 V1080 H0Z'],
  ['#2f5446', 'M0 820 L240 700 L440 800 L660 710 L880 820 L1100 730 L1320 830 L1540 740 L1760 820 L1920 770 V1080 H0Z'],
  ['#1f3a32', 'M0 920 L300 840 L560 910 L820 850 L1080 930 L1360 860 L1640 930 L1920 880 V1080 H0Z'],
];
function mountains(id, extra = '', sx = 1380, sy = 520) {
  let rays = '';
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, b = a + 0.09; rays += `<path d="M0 0 L${n(Math.cos(a) * 1500)} ${n(Math.sin(a) * 1500)} L${n(Math.cos(b) * 1500)} ${n(Math.sin(b) * 1500)}Z" fill="#fff3cf" opacity=".09"/>`; }
  let s = `<rect width="1920" height="1080" fill="url(#mSky)"/><rect id="${id}sky2" width="1920" height="1080" fill="url(#mSky2)" opacity="0"/>
    <g id="${id}sun"><g transform="translate(${sx} ${sy})"><g id="${id}rays" filter="url(#soft)">${rays}</g></g><circle cx="${sx}" cy="${sy}" r="320" fill="url(#mGlow)"/><circle cx="${sx}" cy="${sy}" r="74" fill="#f8e3b6"/></g>
    <g id="${id}birds">${[0, 1, 2].map((i) => `<path id="${id}bird${i}" d="M-16 0 Q-8 -9 0 0 Q8 -9 16 0" fill="none" stroke="#3a3446" stroke-width="3.5" stroke-linecap="round"/>`).join('')}</g>`;
  RIDGES.forEach(([f, d], i) => {
    s += `<g id="${id}r${i}" style="transform-origin:960px 1080px"><path d="${d}" fill="${f}" filter="url(#ridge)"/>${i === 0 ? '<path d="M520 430 L560 462 L520 470 L485 455Z M1220 420 L1262 452 L1222 462 L1188 446Z" fill="#e8a58a" opacity=".55"/>' : ''}</g>`;
    if (i < 3) s += `<ellipse id="${id}mist${i}" cx="960" cy="${[600, 690, 790][i]}" rx="1100" ry="46" fill="#fff" opacity="${[.22, .16, .12][i]}" filter="url(#mist)"/>`;
  });
  return s + extra;
}
function animateMountains(id, t, t0, dur) {
  for (let i = 0; i < 4; i++) {
    const rise = id === 'm1' ? (1 - easeOut(prog(t, 0.1 + i * 0.25, 2))) * (160 + i * 60) : 0;
    $(`${id}r${i}`).style.transform = `translate(${(-(t - t0) * (1 + i * 4)).toFixed(1)}px, ${rise.toFixed(1)}px) scale(1.12, 1)`;
  }
  for (let i = 0; i < 3; i++) $(`${id}mist${i}`).setAttribute('transform', `translate(${(Math.sin((t - t0) * 0.25 + i * 2) * 120 + (t - t0) * (12 - i * 3)).toFixed(1)} 0)`);
  $(`${id}rays`).setAttribute('transform', `rotate(${((t - t0) * 3).toFixed(2)})`);
  for (let i = 0; i < 3; i++) {
    const x = -120 + (t - t0 - i * 0.5) * (150 + i * 20), y = 260 + i * 46 + Math.sin(t * 1.3 + i) * 14;
    $(`${id}bird${i}`).setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(0.9 - i * 0.15).toFixed(2)} ${(0.35 + 0.65 * Math.abs(Math.sin(t * 7 + i * 1.3))).toFixed(2)})`);
  }
}

const SH = ' filter="url(#drop)"';
const pg = (id, c, x, y, H, pose) => `<g transform="translate(${x} ${y})"${SH}><g id="${id}" class="pop">${person(c, H, pose, id)}</g></g>`;
const svgW = (inner, id = '', bg = BG.story) => `<svg${id ? ` id="${id}"` : ''} width="1920" height="1080" viewBox="0 0 1920 1080">${bg ? `<rect width="1920" height="1080" fill="${bg}"/>` : ''}${inner}</svg>`;
const motes = (id, n0, seed, box) => { const r = rng(seed); let s = `<g id="${id}">`; for (let i = 0; i < n0; i++) s += `<circle cx="${n(box[0] + r() * box[2])}" cy="${n(box[1] + r() * box[3])}" r="${n(1.5 + r() * 2.5)}" fill="#fff6d8" data-ph="${n(r() * 6)}"/>`; return s + '</g>'; };

const STORY_DEFS = `<svg width="0" height="0" style="position:absolute">${DEFS}<defs>
  <filter id="ridge" x="-5%" y="-20%" width="110%" height="140%"><feDropShadow dx="0" dy="-5" stdDeviation="6" flood-color="#1a1410" flood-opacity=".3"/></filter>
  <filter id="mist" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="28"/></filter>
  <filter id="soft"><feGaussianBlur stdDeviation="10"/></filter>
  <linearGradient id="mSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#27304a"/><stop offset=".45" stop-color="#4a5470"/><stop offset=".8" stop-color="#d9a270"/><stop offset="1" stop-color="#e9b872"/></linearGradient>
  <linearGradient id="mSky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5d79a6"/><stop offset=".5" stop-color="#9fb0c8"/><stop offset=".85" stop-color="#f1c98e"/><stop offset="1" stop-color="#f6d9a0"/></linearGradient>
  <radialGradient id="mGlow"><stop offset="0" stop-color="#f6dca8" stop-opacity=".9"/><stop offset="1" stop-color="#f6dca8" stop-opacity="0"/></radialGradient>
  <radialGradient id="twGlow"><stop offset="0" stop-color="#fff3b8" stop-opacity=".95"/><stop offset=".35" stop-color="#ffe08a" stop-opacity=".35"/><stop offset="1" stop-color="#ffe08a" stop-opacity="0"/></radialGradient>
  <radialGradient id="lamp"><stop offset="0" stop-color="#ffd98a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>
  <radialGradient id="warm"><stop offset="0" stop-color="#ffe7b0" stop-opacity=".6"/><stop offset="1" stop-color="#ffe7b0" stop-opacity="0"/></radialGradient>
  <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efe6d6"/><stop offset="1" stop-color="#f7f1e6"/></linearGradient>
</defs></svg>`;

const fallLeaves = (id, k, seed) => { const r = rng(seed); let s = ''; for (let i = 0; i < k; i++) s += `<path id="${id}${i}" d="${IVY}" fill="${GREENS[(r() * 6) | 0]}" data-x="${n(r() < .5 ? r() * 380 : 1560 + r() * 360)}" data-ph="${n(r() * 10)}" data-sp="${n(50 + r() * 50)}"/>`; return s; };

// leaf-sweep transition, vignette, paper grain (append after the scenes)
function storyOverlays() {
  const rl = rng(99); let leafFx = '', s = '';
  for (let i = 0; i < 260; i++) {
    const white = rl() < 0.15;
    leafFx += `<path class="lf" d="${IVY}" fill="${white ? '#f6f1e6' : GREENS[(rl() * 6) | 0]}" data-x="${n(2000 + rl() * 1500)}" data-y="${n(-150 + rl() * 1380)}" data-s="${n(4 + rl() * 4)}" data-r="${n(rl() * 360)}" data-d="${n(rl() < .5 ? -1 : 1)}" data-v="${n(rl())}"/>`;
  }
  s += `<svg class="overlay" id="leafFx" width="1920" height="1080" style="display:none">${leafFx}</svg>`;
  s += `<svg class="overlay" width="1920" height="1080" style="pointer-events:none"><radialGradient id="vig" cx="50%" cy="50%" r="75%"><stop offset=".55" stop-color="#1a1208" stop-opacity="0"/><stop offset="1" stop-color="#1a1208" stop-opacity=".32"/></radialGradient><rect width="1920" height="1080" fill="url(#vig)"/></svg>`;
  s += `<svg class="overlay" width="1920" height="1080" style="mix-blend-mode:multiply;pointer-events:none"><filter id="grainO"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="1920" height="1080" filter="url(#grainO)" opacity=".1"/></svg>`;
  return s;
}

// cache swaying foliage, twinkling lights, and sweep leaves once the stage is built
let SW = [], TW = [], LF = [];
function initStory() {
  SW = [...document.querySelectorAll('.sway')].map((e) => ({ e, sc: e.closest('.scene'), x: +e.dataset.x, y: +e.dataset.y, ph: +e.dataset.ph, amp: +e.dataset.amp }));
  TW = [...document.querySelectorAll('.tw')].map((e) => ({ e, sc: e.closest('.scene'), ph: +e.dataset.ph, w: +e.dataset.w }));
  LF = [...document.querySelectorAll('#leafFx .lf')].map((e) => ({ e, x: +e.dataset.x, y: +e.dataset.y, s: +e.dataset.s, r: +e.dataset.r, d: +e.dataset.d, v: +e.dataset.v }));
}

function ambient(t) {
  for (const s of SW) if (s.sc.style.display !== 'none') s.e.setAttribute('transform', `rotate(${(Math.sin(t * 0.9 + s.ph) * s.amp).toFixed(2)} ${s.x} ${s.y})`);
  for (const s of TW) if (s.sc.style.display !== 'none') s.e.style.opacity = (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.w + s.ph)) ** 2).toFixed(3);
}
function leafSweep(t, a, dur = 1.6) {
  const p = prog(t, a, dur), fx = $('leafFx');
  if (p <= 0 || p >= 1) return false;
  fx.style.display = 'block';
  for (const l of LF) {
    const x = l.x - p * (3500 + l.v * 400), y = l.y + Math.sin(p * 6 + l.v * 8) * 40 + p * 120 * (l.v - .5);
    l.e.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(l.r + p * 300 * l.d).toFixed(1)}) scale(${l.s})`);
  }
  return true;
}

// fonts + preview player (skipped when recording); call after renderAt is defined
function startPlayer() {
  window.renderAt = renderAt;
  window.fontsReady = Promise.all(['500 100px Fredoka', '600 100px Fredoka'].map((f) => document.fonts.load(f))).then(() => document.fonts.ready);

  // ---------- preview player (skipped when recording) ----------
  if (location.search.includes('render')) {
    document.body.classList.add('render');
    renderAt(0);
  } else {
    const stage = $('stage');
    const fit = () => { const k = Math.min(innerWidth / 1920, (innerHeight - 44) / 1080); stage.style.transform = `scale(${k})`; };
    addEventListener('resize', fit); fit();
    let t0 = performance.now(), paused = false, at = 0;
    const bar = $('bar'), pp = $('pp');
    pp.onclick = () => { paused = !paused; pp.textContent = paused ? 'Play' : 'Pause'; t0 = performance.now() - at * 1000; };
    addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); pp.onclick(); } });
    bar.oninput = () => { at = +bar.value; t0 = performance.now() - at * 1000; renderAt(at); };
    window.fontsReady.then(() => requestAnimationFrame(function loop(now) {
      if (!paused) { at = ((now - t0) / 1000) % DURATION; bar.value = at; }
      $('clock').textContent = at.toFixed(1) + 's';
      renderAt(at);
      requestAnimationFrame(loop);
    }));
  }
}
