// Storybook-style characters and playroom shared by the video source pages.
const P = { pine: '#1f3a32', pineSoft: '#2f5446', sage: '#a8d5ba', sageWash: '#e6efe8', dusk: '#3d4a63', alpen: '#c0705a', alpenDeep: '#a35a45', dawn: '#e9b872', paper: '#f7f3ec', ink: '#22302b', muted: '#5b6760' };
const INK = '#2d2a26';
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (a) => '#' + a.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
const tint = (h, a) => hex(rgb(h).map((v) => v + (255 - v) * a));
const shade = (h, a) => hex(rgb(h).map((v) => v * (1 - a)));
const n = (v) => +v.toFixed(1);

const STYLES = {
  soft:   { name: 'A · Soft shapes (current)', note: 'Faceless pill-and-circle figures. Calm and abstract, so any family can see themselves in it.' },
  flat:   { name: 'B · Friendly flat characters', note: 'Simple faces, hair, and skin tones. Warm and modern, still minimal.' },
  line:   { name: 'C · Hand-drawn ink & wash', note: 'Wobbly ink outlines over soft color, handwritten type. Feels personal, like a sketchbook.' },
  story:  { name: 'D · Storybook cut-out', note: 'Big heads, rounded type, paper texture, and soft shadows. Most kid-friendly.' },
  animal: { name: 'E · Animal friends', note: 'Gentle animals instead of people. Avoids any one family "look" and feels playful.' },
};
let ST = 'flat';

// ---------- shape helpers (line style adds ink outlines and lighter fills) ----------
const isLine = () => ST === 'line';
const fc = (c) => (isLine() && c.startsWith('#') ? tint(c, 0.3) : c);
const sk = (w = 3.5) => (isLine() ? ` stroke="${INK}" stroke-width="${w}" stroke-linejoin="round"` : '');
const R = (x, y, w, h, rx, c, x2 = '') => `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${n(rx)}" fill="${fc(c)}"${sk()}${x2}/>`;
const C = (cx, cy, r, c, x2 = '') => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fc(c)}"${sk()}${x2}/>`;
const E = (cx, cy, rx, ry, c, x2 = '') => `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fc(c)}"${sk()}${x2}/>`;
const Pa = (d, c, x2 = '') => `<path d="${d}" fill="${fc(c)}"${sk()}${x2}/>`;
const Ln = (d, c, w) => (isLine() ? `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${n(w + 7)}" stroke-linecap="round"/>` : '') + `<path d="${d}" fill="none" stroke="${fc(c)}" stroke-width="${n(w)}" stroke-linecap="round"/>`;
const Ink = (d, w) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${n(w)}" stroke-linecap="round" stroke-linejoin="round"/>`;
const raw = (s) => s;

// ---------- cast ----------
const CAST = [
  { label: 'Therapist', kind: 'adult', h: 1, skin: '#f1c7a3', hair: '#6b4a32', hairStyle: 'long', shirt: '#7fae95', pants: P.dusk, dress: true, glasses: true, animal: 'bear', fur: '#9c7150', softBody: P.pineSoft, softHead: P.dusk },
  { label: 'Parent (mom)', kind: 'adult', h: 0.96, skin: '#8d5a3b', hair: '#2a1d17', hairStyle: 'curly', shirt: P.dusk, pants: '#8a93a6', animal: 'cat', fur: '#d9a46c', softBody: '#4f5a72', softHead: P.alpen },
  { label: 'Parent (dad)', kind: 'adult', h: 1.04, skin: '#e8b48f', hair: '#4a3426', hairStyle: 'short', shirt: P.pineSoft, pants: '#5a4a3c', animal: 'dog', fur: '#c9a27a', softBody: P.pine, softHead: '#7a6f86' },
  { label: 'Child (age 6)', kind: 'child', h: 0.6, skin: '#c68a5f', hair: '#2a1d17', hairStyle: 'ponytail', shirt: P.alpen, pants: P.dusk, animal: 'bunny', fur: '#eee5d8', softBody: P.dawn, softHead: P.alpen },
  { label: 'Child (age 8)', kind: 'child', h: 0.67, skin: '#f5d3b8', hair: '#c9944b', hairStyle: 'short', shirt: P.dawn, pants: '#5b7a9a', animal: 'fox', fur: '#d9824a', softBody: P.sage, softHead: P.pineSoft },
  { label: 'Teen', kind: 'teen', h: 0.88, skin: '#5c3a26', hair: '#1c1410', hairStyle: 'curlyShort', shirt: P.pine, pants: '#4a4a52', animal: 'mouse', fur: '#a9a9b3', softBody: '#7a6f86', softHead: P.dawn },
];

// ---------- people ----------
function fringe(r, cy) {
  return `M${n(-r * 1.04)} ${n(cy + r * 0.1)} A${n(r * 1.04)} ${n(r * 1.12)} 0 0 1 ${n(r * 1.04)} ${n(cy + r * 0.1)} Q${n(r * 0.7)} ${n(cy - r * 0.48)} ${n(r * 0.05)} ${n(cy - r * 0.4)} Q${n(-r * 0.6)} ${n(cy - r * 0.32)} ${n(-r * 1.04)} ${n(cy + r * 0.1)}Z`;
}
function hairBack(c, r, cy) {
  const h = c.hair; let s = '';
  if (c.hairStyle === 'long') s += R(-r * 1.12, cy - r * 0.3, r * 2.24, r * 2.05, r * 0.6, h) + C(0, cy - r * 0.04, r * 1.1, h);
  else if (c.hairStyle === 'curly') {
    s += C(0, cy - r * 0.05, r * 1.08, h);
    for (let a = 150; a <= 390; a += 20) { const t = a * Math.PI / 180; s += C(Math.cos(t) * r * 1.0, cy + Math.sin(t) * r * 1.0, r * 0.42, h); }
  } else if (c.hairStyle === 'ponytail') s += E(r * 1.15, cy + r * 0.25, r * 0.3, r * 0.75, h, ` transform="rotate(-18 ${n(r * 1.15)} ${n(cy + r * 0.25)})"`) + C(0, cy - r * 0.05, r * 1.06, h) + C(r * 0.95, cy - r * 0.45, r * 0.14, P.dawn);
  else if (c.hairStyle === 'curlyShort') { for (let a = 195; a <= 345; a += 21) { const t = a * Math.PI / 180; s += C(Math.cos(t) * r * 0.93, cy + Math.sin(t) * r * 0.93, r * 0.3, h); } }
  else s += C(0, cy - r * 0.06, r * 1.05, h);
  return s;
}
function hairFront(c, r, cy) {
  if (c.hairStyle === 'curlyShort') return Pa(`M${n(-r)} ${n(cy - r * 0.12)} A${n(r)} ${n(r)} 0 0 1 ${n(r)} ${n(cy - r * 0.12)} Q0 ${n(cy - r * 0.62)} ${n(-r)} ${n(cy - r * 0.12)}Z`, c.hair);
  let s = Pa(fringe(r, cy), c.hair);
  if (c.hairStyle === 'curly') for (let a = 205; a <= 335; a += 26) { const t = a * Math.PI / 180; s += C(Math.cos(t) * r * 0.72, cy + Math.sin(t) * r * 0.72, r * 0.26, c.hair); }
  return s;
}
function face(c, r, cy) {
  const story = ST === 'story';
  const ex = r * (story ? 0.38 : 0.36), ey = cy + r * (story ? 0.18 : 0.1), my = cy + r * (story ? 0.5 : 0.42);
  let s = '';
  if (c.beard) s += Pa(`M${n(-r * 0.9)} ${n(cy + r * 0.05)} Q${n(-r * 0.85)} ${n(cy + r * 1.18)} 0 ${n(cy + r * 1.15)} Q${n(r * 0.85)} ${n(cy + r * 1.18)} ${n(r * 0.9)} ${n(cy + r * 0.05)} Q${n(r * 0.55)} ${n(cy + r * 0.72)} 0 ${n(cy + r * 0.66)} Q${n(-r * 0.55)} ${n(cy + r * 0.72)} ${n(-r * 0.9)} ${n(cy + r * 0.05)}Z`, c.hair);
  if (!c.beard) s += [-1, 1].map((d) => `<ellipse cx="${n(d * r * 0.6)}" cy="${n(my - r * 0.02)}" rx="${n(r * 0.16)}" ry="${n(r * 0.1)}" fill="${P.alpen}" opacity="${story ? 0.5 : 0.35}"/>`).join('');
  s += '<g class="eyes">';
  for (const d of [-1, 1]) {
    if (story) s += `<ellipse cx="${n(d * ex)}" cy="${n(ey)}" rx="${n(r * 0.11)}" ry="${n(r * 0.14)}" fill="${INK}"/><circle cx="${n(d * ex + r * 0.035)}" cy="${n(ey - r * 0.05)}" r="${n(r * 0.04)}" fill="#fff"/>`;
    else s += `<circle cx="${n(d * ex)}" cy="${n(ey)}" r="${n(r * 0.085)}" fill="${INK}"/>`;
  }
  s += '</g>';
  s += Ink(`M${n(-r * 0.22)} ${n(my)} Q0 ${n(my + r * 0.2)} ${n(r * 0.22)} ${n(my)}`, r * 0.07);
  if (c.glasses) s += glasses(r, ex, ey);
  return s;
}
const glasses = (r, ex, ey) => `<g fill="none" stroke="${INK}" stroke-width="${n(r * 0.05)}"><circle cx="${n(-ex)}" cy="${n(ey)}" r="${n(r * 0.22)}"/><circle cx="${n(ex)}" cy="${n(ey)}" r="${n(r * 0.22)}"/><path d="M${n(-ex + r * 0.22)} ${n(ey)} H${n(ex - r * 0.22)}"/></g>`;

function animalHead(c, r, cy) {
  const f = c.fur, light = tint(f, 0.65), pink = '#f0b4a4'; let s = '';
  const ears = { bear: [0.72, 0.36], mouse: [0.82, 0.48] };
  if (ears[c.animal]) { const [d, er] = ears[c.animal]; for (const k of [-1, 1]) s += C(k * r * d, cy - r * d, r * er, f) + C(k * r * d, cy - r * d, r * er * 0.5, c.animal === 'mouse' ? pink : light); }
  if (c.animal === 'cat' || c.animal === 'fox') {
    const big = c.animal === 'fox' ? 1.15 : 1;
    for (const k of [-1, 1]) {
      s += Pa(`M${n(k * r * 0.95)} ${n(cy - r * 0.15)} L${n(k * r * 0.8)} ${n(cy - r * 1.3 * big)} L${n(k * r * 0.12)} ${n(cy - r * 0.85)}Z`, f);
      s += Pa(`M${n(k * r * 0.78)} ${n(cy - r * 0.4)} L${n(k * r * 0.72)} ${n(cy - r * 1.05 * big)} L${n(k * r * 0.35)} ${n(cy - r * 0.8)}Z`, c.animal === 'fox' ? '#4a3329' : pink);
    }
  }
  if (c.animal === 'bunny') for (const k of [-1, 1]) s += E(k * r * 0.4, cy - r * 1.35, r * 0.26, r * 0.78, f) + E(k * r * 0.4, cy - r * 1.3, r * 0.12, r * 0.56, pink);
  s += C(0, cy, r, f);
  if (c.animal === 'fox') s += Pa(`M${n(-r * 0.98)} ${n(cy + r * 0.1)} Q${n(-r * 0.4)} ${n(cy + r * 1.05)} 0 ${n(cy + r * 0.98)} Q${n(r * 0.4)} ${n(cy + r * 1.05)} ${n(r * 0.98)} ${n(cy + r * 0.1)} Q${n(r * 0.4)} ${n(cy + r * 0.3)} 0 ${n(cy + r * 0.15)} Q${n(-r * 0.4)} ${n(cy + r * 0.3)} ${n(-r * 0.98)} ${n(cy + r * 0.1)}Z`, '#fbf3e8');
  else s += E(0, cy + r * 0.42, r * 0.42, r * 0.3, light);
  if (c.animal === 'dog') for (const k of [-1, 1]) s += E(k * r * 0.98, cy + r * 0.12, r * 0.3, r * 0.66, shade(f, 0.3), ` transform="rotate(${k * 16} ${n(k * r * 0.98)} ${n(cy + r * 0.12)})"`);
  const ex = r * 0.36, ey = cy + r * 0.02;
  for (const k of [-1, 1]) s += `<circle cx="${n(k * ex)}" cy="${n(ey)}" r="${n(r * 0.09)}" fill="${INK}"/><circle cx="${n(k * ex + r * 0.03)}" cy="${n(ey - r * 0.03)}" r="${n(r * 0.03)}" fill="#fff"/>`;
  s += `<ellipse cx="0" cy="${n(cy + r * 0.3)}" rx="${n(r * 0.13)}" ry="${n(r * 0.09)}" fill="${INK}"/>`;
  s += Ink(`M${n(-r * 0.15)} ${n(cy + r * 0.47)} Q${n(-r * 0.07)} ${n(cy + r * 0.57)} 0 ${n(cy + r * 0.45)} Q${n(r * 0.07)} ${n(cy + r * 0.57)} ${n(r * 0.15)} ${n(cy + r * 0.47)}`, r * 0.05);
  if (c.animal !== 'fox') s += [-1, 1].map((k) => `<ellipse cx="${n(k * r * 0.62)}" cy="${n(cy + r * 0.3)}" rx="${n(r * 0.13)}" ry="${n(r * 0.08)}" fill="${P.alpen}" opacity=".35"/>`).join('');
  if (c.glasses) s += glasses(r, ex, ey);
  return s;
}

// RIG[id] holds joint positions (local coords) for characters drawn with an id, so pages can animate arms and heads.
const RIG = {};
function person(c, H, pose, id) {
  const gid = (k) => (id ? ` id="${id}-${k}"` : '');
  const shadow = `<ellipse cx="0" cy="2" rx="${n(H * 0.2)}" ry="${n(H * 0.03)}" fill="rgba(34,48,43,.12)"/>`;
  if (ST === 'soft') {
    const kid = c.kind === 'child';
    const hr = H * (kid ? 0.177 : 0.157), bw = H * (kid ? 0.39 : 0.35), bh = H * (kid ? 0.61 : 0.66);
    return shadow + R(-bw / 2, -bh, bw, bh, bw * 0.48, c.softBody) + C(0, -bh - H * 0.025 - hr, hr, c.softHead);
  }
  const kid = c.kind === 'child', teen = c.kind === 'teen', story = ST === 'story', animal = ST === 'animal';
  const r = H * (kid ? 0.115 : teen ? 0.092 : 0.085) * (story ? 1.45 : 1);
  const legLen = H * (kid ? 0.34 : 0.43) * (story ? 0.8 : 1);
  const cy = -H + r, tTop = cy + r * 1.12, tBot = -legLen;
  const tw = r * (kid ? 1.8 : 2.1) / (story ? 1.3 : 1);
  const skin = animal ? c.fur : c.skin;
  let s = shadow;
  const lw = tw * 0.36, gap = tw * 0.07, legTop = tBot - r * 0.3;
  s += R(-gap / 2 - lw, legTop, lw, -legTop - r * 0.12, lw * 0.45, c.pants) + R(gap / 2, legTop, lw, -legTop - r * 0.12, lw * 0.45, c.pants);
  s += E(-gap / 2 - lw * 0.55, -r * 0.12, lw * 0.66, r * 0.17, '#3b3330') + E(gap / 2 + lw * 0.55, -r * 0.12, lw * 0.66, r * 0.17, '#3b3330');
  if (!animal) s += `<g${gid('hb')}>${hairBack(c, r, cy)}</g>`;
  s += R(-r * 0.22, cy + r * 0.6, r * 0.44, r * 0.7, r * 0.1, skin);
  const tb = c.dress ? tBot + legLen * 0.5 : tBot + r * 0.05, fl = c.dress ? tw * 0.16 : 0, qq = r * 0.42;
  s += Pa(`M${n(-tw / 2 - fl)} ${n(tb)} L${n(-tw / 2)} ${n(tTop + qq)} Q${n(-tw / 2)} ${n(tTop)} ${n(-tw / 2 + qq)} ${n(tTop)} L${n(tw / 2 - qq)} ${n(tTop)} Q${n(tw / 2)} ${n(tTop)} ${n(tw / 2)} ${n(tTop + qq)} L${n(tw / 2 + fl)} ${n(tb)}Z`, c.shirt);
  const aw = r * 0.46, sh = tTop + r * 0.32;
  const arm = (k, [ex, ey]) => Ln(`M${n(k * (tw / 2 - r * 0.18))} ${n(sh)} Q${n(k * (tw / 2 + r * 0.3))} ${n((sh + ey) / 2)} ${n(ex)} ${n(ey)}`, c.shirt, aw) + C(ex, ey, r * 0.25, skin);
  const rest = (k) => [k * (tw / 2 + r * 0.28), tBot + r * 0.1];
  const right = pose === 'reach' ? [tw / 2 + r * 1.5, tBot - r * 0.4] : pose === 'wave' ? [tw / 2 + r * 0.9, cy - r * 0.1] : rest(1);
  s += `<g${gid('armL')}>${arm(-1, rest(-1))}</g><g${gid('armR')}>${arm(1, right)}`;
  if (pose === 'reach') s += R(right[0] - r * 0.1, right[1] - r * 1.15, r * 1.05, r * 1.05, 5, P.sage);
  s += '</g>';
  if (id) RIG[id] = { shL: [-(tw / 2 - r * 0.18), sh], shR: [tw / 2 - r * 0.18, sh], neck: [0, cy + r * 0.95], r };
  s += `<g${gid('head')}>`;
  if (animal) s += animalHead(c, r, cy);
  else s += C(-r * 0.97, cy + r * 0.1, r * 0.2, skin) + C(r * 0.97, cy + r * 0.1, r * 0.2, skin) + C(0, cy, r, skin) + hairFront(c, r, cy) + face(c, r, cy);
  return s + '</g>';
}
const fx = () => (ST === 'line' ? ' filter="url(#wob)"' : ST === 'story' ? ' filter="url(#drop)"' : '');
const place = (c, x, y, H, pose) => `<g transform="translate(${x} ${y})"${fx()}>${person(c, H, pose)}</g>`;

const DEFS = `<defs>
  <filter id="wob" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="6"/></filter>
  <filter id="drop" x="-25%" y="-25%" width="150%" height="160%"><feDropShadow dx="0" dy="7" stdDeviation="6" flood-color="#3a2a1a" flood-opacity=".25"/></filter>
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a5470"/><stop offset=".7" stop-color="#d9a270"/><stop offset="1" stop-color="#e9b872"/></linearGradient>
  <clipPath id="roomClip"><rect x="960" y="170" width="880" height="800" rx="36"/></clipPath>
</defs>`;
const BG = { soft: P.paper, flat: P.paper, line: '#fbf6ec', story: '#f1e6d2', animal: '#f3efe4' };
const FONTS = {
  soft:   ['font:800 34px Nunito Sans;letter-spacing:.2em;text-transform:uppercase', 'font:600 84px/1.12 Cormorant Garamond'],
  flat:   ['font:800 34px Nunito Sans;letter-spacing:.2em;text-transform:uppercase', 'font:600 84px/1.12 Cormorant Garamond'],
  line:   ['font:700 58px Caveat', `font:600 96px/1.02 Caveat;color:${INK}`],
  story:  ['font:600 36px Fredoka;letter-spacing:.12em;text-transform:uppercase', 'font:500 72px/1.18 Fredoka'],
  animal: ['font:600 40px Fredoka;letter-spacing:.06em', 'font:700 70px/1.18 Nunito Sans'],
};

function room(blocks = true) {
  let s = `<g clip-path="url(#roomClip)">`;
  s += R(960, 170, 880, 800, 0, ST === 'story' ? '#fff6e8' : '#fffdf9') + R(960, 770, 880, 220, 0, '#dccbad');
  // window with the mountains
  s += `<rect x="1270" y="230" width="250" height="180" rx="10" fill="url(#sky)"${sk()}/>`;
  s += Pa('M1270 410 L1320 345 L1360 375 L1410 320 L1470 375 L1520 350 V410Z', '#4f5a72') + Pa('M1270 410 L1335 378 L1395 398 L1455 370 L1520 392 V410Z', P.pineSoft);
  s += C(1460, 300, 20, '#f8e3b6');
  s += `<path d="M1395 230 V410 M1270 320 H1520" stroke="${ST === 'line' ? INK : '#fffdf9'}" stroke-width="8"/>`;
  // tree with leaves
  s += Ln('M1080 775 C1060 650 1105 560 1072 430 C1052 340 1090 270 1078 205', '#c9a36b', 34);
  [[1030, 250, 52], [1090, 215, 60], [1150, 255, 50], [1055, 310, 46], [1125, 310, 48]].forEach(([x, y, r], i) => (s += C(x, y, r, i % 2 ? '#4f8a62' : '#6fa37d')));
  // rug
  for (let r = 0; r < 3; r++) for (let c = 0; c < 10; c++) s += `<rect x="${1180 + c * 58}" y="${820 + r * 58}" width="58" height="58" fill="${(r + c) % 2 ? '#fffdf9' : fc(P.dusk)}"/>`;
  // shelf
  s += `<g fill="none" stroke="${ST === 'line' ? INK : '#7a5a3c'}" stroke-width="10"><rect x="1680" y="470" width="150" height="300" rx="6"/><path d="M1680 570 H1830 M1680 670 H1830"/></g>`;
  s += R(1700, 520, 40, 45, 4, P.alpen) + C(1785, 540, 25, P.dawn) + Pa('M1700 665 L1735 615 L1770 665Z', P.sage) + R(1780, 620, 36, 45, 4, P.dusk) + R(1702, 700, 110, 62, 6, P.pineSoft);
  // block tower
  if (blocks) s += R(1400, 861, 44, 44, 5, P.alpen) + R(1404, 817, 44, 44, 5, P.dawn);
  s += `</g><rect x="960" y="170" width="880" height="800" rx="36" fill="none" stroke="${ST === 'line' ? INK : 'rgba(34,48,43,.08)'}" stroke-width="${ST === 'line' ? 4 : 3}"/>`;
  return s;
}

