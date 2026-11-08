// =====================================================================
//  ART · todos los assets pixel se generan por código (sin imágenes)
// =====================================================================

// ---------- explosión compartida (7 cuadros: destello → fuego → humo con dither)
function explosionCanvases(seed = 7) {
  const r = rng32(seed), out = [];
  const S = 34, cx = 17, cy = 17;
  const blobs = (g, n, rad, br, col) => {
    for (let k = 0; k < n; k++) {
      const a = r() * 6.283, d = rad * (0.55 + r() * 0.45);
      disc(g, cx + Math.cos(a) * d, cy + Math.sin(a) * d, br * (0.7 + r() * 0.5), col);
    }
  };
  let f = mk(S, S); disc(f.g, cx, cy, 5, '#ffe45c'); disc(f.g, cx, cy, 3.5, '#ffffff'); out.push(f.c);
  f = mk(S, S); disc(f.g, cx, cy, 9.5, '#ff9a2e'); blobs(f.g, 5, 8, 3.5, '#ff9a2e'); disc(f.g, cx, cy, 7, '#ffe45c'); disc(f.g, cx - 1, cy - 1, 4, '#ffffff'); out.push(f.c);
  f = mk(S, S); disc(f.g, cx, cy, 12, '#e8452c'); blobs(f.g, 7, 11, 4, '#e8452c'); disc(f.g, cx, cy - 1, 9.5, '#ff9a2e'); blobs(f.g, 4, 7, 3, '#ff9a2e'); disc(f.g, cx - 1, cy - 2, 5.5, '#ffe45c'); disc(f.g, cx - 2, cy - 3, 2.5, '#fff7d0'); out.push(f.c);
  f = mk(S, S); disc(f.g, cx, cy, 13.5, '#7a2a3a'); blobs(f.g, 7, 12, 4.5, '#7a2a3a'); disc(f.g, cx, cy - 1, 11, '#d23a2a'); disc(f.g, cx, cy - 2, 7, '#ff8a2a'); disc(f.g, cx - 1, cy - 3, 3, '#ffd84a'); out.push(f.c);
  f = mk(S, S); disc(f.g, cx, cy - 1, 13.5, '#4e3a5a'); blobs(f.g, 7, 12, 4.5, '#4e3a5a'); disc(f.g, cx, cy - 2, 9, '#6a4a62'); disc(f.g, cx, cy - 3, 5, '#a8402e'); ditherOut(f.c, 0.2); out.push(f.c);
  f = mk(S, S); disc(f.g, cx, cy - 2, 13, '#3e3250'); blobs(f.g, 6, 12, 4, '#3e3250'); disc(f.g, cx, cy - 3, 8, '#54436a'); ditherOut(f.c, 0.5, 1, 0); out.push(f.c);
  f = mk(S, S); disc(f.g, cx, cy - 3, 12, '#33293f'); blobs(f.g, 6, 11, 3.5, '#33293f'); ditherOut(f.c, 0.78, 2, 1); out.push(f.c);
  return out;
}

// =====================================================================
//  RALLY
// =====================================================================
function rallyCar(P, f, police) {
  const { c, g } = mk(18, 18);
  g.translate(1, 1);
  const TY = '#1b1a26', TL = '#5a596f';
  for (const [x, y, w, h] of [[2, 2, 2, 4], [12, 2, 2, 4], [1, 9, 3, 4], [12, 9, 3, 4]]) {
    R(g, TY, x, y, w, h);
    for (let k = f ? 1 : 0; k < h; k += 2) R(g, TL, x, y + k, w, 1);
  }
  R(g, P.b, 5, 0, 6, 1); R(g, P.b, 4, 1, 8, 8); R(g, P.b, 3, 9, 10, 5); R(g, P.d, 4, 14, 8, 1);
  R(g, P.l, 5, 0, 1, 1); R(g, P.l, 4, 1, 1, 8); R(g, P.l, 3, 9, 1, 5);
  R(g, P.d, 11, 1, 1, 8); R(g, P.d, 12, 9, 1, 5);
  if (!police) { R(g, P.s, 7, 0, 2, 15); R(g, P.d, 3, 12, 10, 1); R(g, P.s, 7, 12, 2, 1); }
  else { R(g, P.s, 6, 0, 1, 3); R(g, P.s, 9, 0, 1, 3); R(g, P.s, 6, 11, 1, 4); R(g, P.s, 9, 11, 1, 4); }
  R(g, '#1b2240', 5, 3, 6, 3); R(g, '#3d5294', 5, 3, 6, 1); R(g, '#9be8ff', 6, 4, 2, 1);
  R(g, '#1b2240', 5, 9, 6, 2); R(g, '#3d5294', 5, 9, 6, 1);
  if (police) {
    R(g, '#e9e6f2', 5, 6, 6, 2);
    R(g, f ? '#5a1c2a' : '#ff4d5e', 5, 6, 3, 2); R(g, f ? '#58a8ff' : '#1c2a5a', 8, 6, 3, 2);
  }
  R(g, '#fff1a0', 4, 1); R(g, '#fff1a0', 11, 1);
  R(g, '#ff3d4f', 3, 13); R(g, '#ff3d4f', 12, 13);
  g.setTransform(1, 0, 0, 1, 0, 0);
  return outline(c);
}
function rallyCan(P, letter, f) {
  const { c, g } = mk(16, 18);
  g.translate(1, 1);
  R(g, P.d, 2, 0, 6, 1); R(g, P.d, 2, 1, 1, 2); R(g, P.d, 7, 1, 1, 2);
  R(g, '#8d93a3', 10, 0, 2, 3); R(g, '#d6dae4', 10, 0, 1, 1);
  R(g, P.b, 1, 3, 12, 13); R(g, P.l, 1, 3, 1, 13); R(g, P.l, 2, 3, 10, 1); R(g, P.d, 12, 4, 1, 12); R(g, P.d, 2, 15, 11, 1);
  if (letter) { R(g, P.d, 4, 6, 7, 7); glyph(g, letter, 5, 7, '#ffffff', true); }
  else { line(g, 4, 6, 9, 11, P.x); line(g, 9, 6, 4, 11, P.x); }
  R(g, '#ffffff', 2, f ? 7 : 5, 1, 2);
  g.setTransform(1, 0, 0, 1, 0, 0);
  return outline(c);
}
function rallyBarrier(f) {
  const { c, g } = mk(18, 18);
  g.translate(1, 1);
  for (let y = 5; y <= 10; y++) for (let x = 1; x <= 14; x++) R(g, ((x - y + 16) & 7) < 4 ? '#ff8a1e' : '#f4f1ea', x, y);
  R(g, '#b85a10', 1, 10, 14, 1);
  R(g, '#3a3348', 1, 11, 3, 2); R(g, '#3a3348', 12, 11, 3, 2);
  R(g, '#3a3348', 2, 3, 3, 2); R(g, '#3a3348', 11, 3, 3, 2);
  disc(g, 3.5, 3, 1.7, f ? '#ffe066' : '#7a5a12'); disc(g, 12.5, 3, 1.7, f ? '#7a5a12' : '#ffe066');
  g.setTransform(1, 0, 0, 1, 0, 0);
  return outline(c);
}
function rallySmoke(f) {
  const { c, g } = mk(22, 22);
  const cx = 11, cy = 11, r = [3, 5, 6.5, 7.5, 8.2][f];
  disc(g, cx + 1, cy + 1.2, r, '#9d97b8');
  disc(g, cx - r * 0.35, cy, r * 0.8, '#dcd6ea');
  disc(g, cx + r * 0.38, cy + r * 0.2, r * 0.74, '#dcd6ea');
  disc(g, cx, cy - r * 0.36, r * 0.76, '#e9e4f3');
  disc(g, cx - r * 0.4, cy - r * 0.42, r * 0.42, '#fbf9ff');
  if (f >= 3) ditherOut(c, f === 3 ? 0.3 : 0.62, f, 1);
  return c;
}
function starCanvas(col = '#ffe14a') {
  const { c, g } = mk(8, 8);
  R(g, col, 3, 1, 1, 5); R(g, col, 1, 3, 5, 1); R(g, '#ffffff', 3, 3);
  return outline(c);
}
function glowCanvas(rgbStr, r = 11) {
  const { c, g } = mk(r * 2 + 2, r * 2 + 2);
  const m = r + 1;
  disc(g, m, m, r, `rgba(${rgbStr},0.07)`);
  disc(g, m, m, r * 0.7, `rgba(${rgbStr},0.12)`);
  disc(g, m, m, r * 0.42, `rgba(${rgbStr},0.2)`);
  return c;
}
function buildRallyArt() {
  const P = { b: '#2f6ff2', l: '#7fb0ff', d: '#1c44a6', s: '#f2f5ff' };
  const E = { b: '#e8383d', l: '#ff8a7a', d: '#9e1d2b', s: '#1b1424' };
  const N = { b: '#e53935', l: '#ff7b6b', d: '#a51f24', x: '#ff9f90' };
  const S = { b: '#ffc531', l: '#fff09a', d: '#b8730c', x: '#ffe48a' };
  const L = { b: '#2fd27a', l: '#a6ffcf', d: '#147a45', x: '#a6ffcf' };
  const A = {
    carPc: [rallyCar(P, 0, false), rallyCar(P, 1, false)],
    carEc: [rallyCar(E, 0, true), rallyCar(E, 1, true)],
    canNc: [rallyCan(N, null, 0), rallyCan(N, null, 1)],
    canSc: [rallyCan(S, 'S', 0), rallyCan(S, 'S', 1)],
    canLc: [rallyCan(L, 'L', 0), rallyCan(L, 'L', 1)],
  };
  A.carP = A.carPc.map(T); A.carE = A.carEc.map(T);
  A.canN = A.canNc.map(T); A.canS = A.canSc.map(T); A.canL = A.canLc.map(T);
  A.barrier = [rallyBarrier(0), rallyBarrier(1)].map(T);
  A.barrierV = [rot90(rallyBarrier(0), 1), rot90(rallyBarrier(1), 1)].map(T);
  A.smoke = [0, 1, 2, 3, 4].map(rallySmoke).map(T);
  A.star = T(starCanvas());
  A.glowY = T(glowCanvas('255,214,90'));
  A.glowG = T(glowCanvas('90,255,160'));
  A.glowR = T(glowCanvas('255,110,90'));
  A.headlight = T((() => {
    const { c, g } = mk(16, 22);
    for (let y = 0; y < 22; y++) {
      const w = 3 + y * 0.55, a = 0.2 * (1 - y / 22);
      g.fillStyle = `rgba(255,240,170,${a.toFixed(3)})`;
      g.fillRect(Math.round(8 - w / 2), 21 - y, Math.round(w), 1);
    }
    return c;
  })());
  A.cloud = T((() => {
    const { c, g } = mk(160, 104);
    const r = rng32(3);
    for (let k = 0; k < 9; k++) disc(g, 30 + r() * 100, 30 + r() * 44, 16 + r() * 18, '#000');
    return mapPixels(c, (d, i, x, y) => { if (d[i + 3]) d[i + 3] = bayer(x, y) < 0.86 ? 34 : 0; });
  })());
  A.boom = explosionCanvases(11).map(T);
  return A;
}

// =====================================================================
//  RUN & GUN — comando y enemigos (rig pixel por partes)
// =====================================================================
const HERO = {
  skin: '#f2a970', skinD: '#c47848', hair: '#3a2418', band: '#e43d3a', bandD: '#9e2530', vest: '#4f8a35', vestL: '#86c654', vestD: '#355f24',
  strap: '#8b5a2b', pants: '#3a5cb0', pantsD: '#26397a', boot: '#6b4428', bootD: '#3a2416', sole: '#1d120b', belt: '#2b2230', buckle: '#ffd04a',
  gun: '#69728a', gunL: '#b4bdd2', gunD: '#363b4a', eye: '#1b1020',
};
const GRUNT = {
  skin: '#c9d1de', skinD: '#8c95a8', hair: '#3d4659', band: '#ff3b5c', bandD: '#8a1730', vest: '#6c7a8c', vestL: '#9fb0c4', vestD: '#465264',
  strap: '#2c3242', pants: '#3d4250', pantsD: '#2a2e3a', boot: '#262a34', bootD: '#16181f', sole: '#0d0e12', belt: '#1a1c24', buckle: '#ff3b5c',
  gun: '#5a5f70', gunL: '#9aa0b4', gunD: '#2e3140', eye: '#ff3b5c', helmet: true,
};
// poses de pierna [rodillaX, rodillaY, pieX, pieY] relativas a la cadera (ciclo de carrera de 6 cuadros)
const RUN_LEG = [[3, 6, 5, 12], [2, 7, 1, 13], [0, 7, -3, 13], [-2, 6, -6, 11], [0, 5, -3, 9], [4, 4, 3, 9]];
const STAND_F = [1, 7, 2, 13], STAND_B = [-1, 7, -2, 13];
const JUMP_LEG_F = [4, 4, 5, 9], JUMP_LEG_B = [-1, 5, -3, 10];
// bocas de cañón relativas al ancla (pies) por puntería
const MUZZLE = { fwd: [15, -21], up: [4.5, -41], dup: [14, -32], ddown: [13, -9], prone: [21, -5] };
const ANCHOR = [18, 41];

function hLeg(g, P, hx, hy, p, back) {
  const pc = back ? P.pantsD : P.pants, bc = back ? P.bootD : P.boot;
  const kx = hx + p[0], ky = hy + p[1], fx = hx + p[2], fy = hy + p[3];
  line(g, hx, hy, kx, ky, pc, 3);
  line(g, kx, ky, fx, fy - 2, pc, 3);
  R(g, bc, fx - 1, fy - 2, 4, 2); R(g, bc, fx + 3, fy - 1, 1, 1); R(g, P.sole, fx - 1, fy, 5, 1);
}
function hTorso(g, P, b) {
  R(g, P.vest, 10, 9 + b, 8, 9); R(g, P.vestD, 10, 9 + b, 2, 9); R(g, P.vestL, 16, 10 + b, 2, 7); R(g, P.vest, 11, 8 + b, 6, 1);
  if (!P.helmet) for (let i = 0; i < 7; i++) R(g, P.strap, 11 + i, 9 + b + i);
  else { R(g, P.vestL, 12, 11 + b, 4, 1); R(g, P.vestD, 12, 14 + b, 4, 1); }
  R(g, P.belt, 10, 17 + b, 8, 2); R(g, P.buckle, 15, 17 + b, 2, 1);
}
function hHead(g, P, b, tf) {
  if (P.helmet) {
    R(g, P.skin, 12, 3 + b, 6, 5); R(g, P.skinD, 12, 3 + b, 1, 5);
    R(g, P.hair, 11, 1 + b, 7, 3); R(g, P.hair, 11, 4 + b, 2, 3); R(g, '#66728a', 12, 1 + b, 5, 1);
    R(g, P.band, 14, 4 + b, 4, 1); R(g, '#ffd0da', 17, 4 + b, 1, 1);
    R(g, P.skinD, 13, 8 + b, 3, 1);
    return;
  }
  R(g, P.skin, 12, 2 + b, 6, 6); R(g, P.skinD, 12, 2 + b, 1, 6); R(g, P.skinD, 13, 7 + b, 2, 1);
  R(g, P.hair, 11, 1 + b, 6, 2); R(g, P.hair, 11, 3 + b, 2, 4);
  R(g, P.band, 11, 3 + b, 7, 1); R(g, P.bandD, 11, 3 + b, 1, 1);
  R(g, P.eye, 16, 4 + b); R(g, P.skinD, 17, 6 + b);
  R(g, P.skinD, 13, 8 + b, 3, 1);
  const T1 = [[[10, 3], [9, 3], [8, 4], [7, 4]], [[10, 3], [9, 2], [8, 2], [7, 3]], [[10, 3], [9, 3], [8, 3], [7, 2]]][tf % 3];
  const T2 = [[[10, 4], [9, 5], [8, 5]], [[10, 4], [9, 4], [8, 5]], [[10, 4], [9, 5], [8, 6]]][tf % 3];
  for (const [x, y] of T1) R(g, P.band, x, y + b);
  for (const [x, y] of T2) R(g, P.bandD, x, y + b);
}
function hArms(g, P, b, aim) {
  const y = b;
  if (aim === 'fwd') {
    R(g, P.gunD, 12, 12 + y, 4, 2);
    R(g, P.gun, 16, 11 + y, 9, 2); R(g, P.gunL, 16, 11 + y, 9, 1); R(g, P.gunD, 25, 11 + y, 4, 1); R(g, P.gunD, 20, 13 + y, 2, 2);
    R(g, P.skinD, 22, 13 + y, 2, 1);
    R(g, P.skin, 15, 10 + y, 2, 3); R(g, P.skin, 16, 12 + y, 3, 2);
  } else if (aim === 'up') {
    R(g, P.skinD, 19, 4 + y, 2, 6);
    R(g, P.gun, 18, -5 + y, 2, 13); R(g, P.gunL, 18, -5 + y, 1, 13); R(g, P.gunD, 18, -8 + y, 1, 3); R(g, P.gunD, 20, 1 + y, 2, 2);
    R(g, P.skin, 15, 9 + y, 2, 2); R(g, P.skin, 16, 5 + y, 2, 4); R(g, P.skin, 17, 4 + y, 2, 2);
  } else if (aim === 'dup') {
    line(g, 15, 13 + y, 24, 4 + y, P.gun, 2); line(g, 16, 12 + y, 24, 4 + y, P.gunL, 1); line(g, 24, 4 + y, 27, 1 + y, P.gunD, 1);
    R(g, P.gunD, 19, 10 + y, 2, 2);
    R(g, P.skin, 15, 10 + y, 2, 2); R(g, P.skin, 17, 9 + y, 2, 2); R(g, P.skin, 19, 8 + y, 2, 2);
  } else if (aim === 'ddown') {
    line(g, 14, 10 + y, 23, 19 + y, P.gun, 2); line(g, 15, 10 + y, 23, 18 + y, P.gunL, 1); line(g, 23, 19 + y, 26, 22 + y, P.gunD, 1);
    R(g, P.skin, 15, 10 + y, 2, 2); R(g, P.skin, 16, 12 + y, 2, 2); R(g, P.skin, 18, 13 + y, 2, 2);
  } else if (aim === 'flail') {
    line(g, 15, 10 + y, 19, 4 + y, P.skin, 2); line(g, 12, 10 + y, 9, 4 + y, P.skinD, 2);
  }
}
function hProne(g, P, withGun = true) {
  R(g, P.pantsD, 0, 28, 11, 2); R(g, P.pants, 0, 26, 11, 3);
  R(g, P.boot, -3, 26, 3, 3); R(g, P.sole, -4, 26, 1, 4); R(g, P.bootD, -3, 29, 3, 1);
  R(g, P.belt, 10, 25, 2, 5);
  R(g, P.vest, 12, 24, 9, 6); R(g, P.vestL, 12, 24, 9, 1); R(g, P.vestD, 12, 29, 9, 1);
  R(g, P.skin, 21, 23, 6, 6); R(g, P.hair, 21, 22, 5, 2); R(g, P.band, 21, 24, 6, 1); R(g, P.eye, 25, 25); R(g, P.skinD, 21, 27, 1, 2);
  R(g, P.band, 18, 23, 3, 1); R(g, P.bandD, 17, 24, 2, 1);
  if (withGun) { R(g, P.gun, 24, 27, 8, 2); R(g, P.gunL, 24, 27, 8, 1); R(g, P.gunD, 32, 27, 3, 1); R(g, P.skin, 23, 28, 2, 2); R(g, P.skin, 27, 29, 2, 1); }
}
// dibuja una pose completa en un lienzo 40x42 (ancla de pies en 18,41)
function heroPose(P, o) {
  const { c, g } = mk(40, 42);
  g.translate(4, 9);
  if (o.prone) { hProne(g, P, !o.dead); g.setTransform(1, 0, 0, 1, 0, 0); return outline(c); }
  const b = o.bob || 0;
  const lf = o.legF || STAND_F, lb = o.legB || STAND_B;
  hLeg(g, P, 12, 18, lb, true);
  if (o.swing !== undefined) {
    const sx = o.swing;
    line(g, 12, 10 + b, 12 - sx, 15 + b, P.vestD, 2);
    R(g, P.skinD, 12 - sx, 16 + b, 2, 2);
  }
  hLeg(g, P, 15, 18, lf, false);
  hTorso(g, P, b);
  hHead(g, P, b, o.tf || 0);
  if (o.swing !== undefined) {
    const sx = o.swing;
    line(g, 15, 10 + b, 15 + sx, 15 + b, P.vestL, 2);
    R(g, P.skin, 15 + sx, 16 + b, 2, 2);
  } else hArms(g, P, b, o.aim || 'fwd');
  g.setTransform(1, 0, 0, 1, 0, 0);
  return outline(c);
}
function heroBall(P, k) {
  const { c, g } = mk(24, 24);
  const cx = 12, cy = 12, r = 7.5;
  for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy, d = Math.hypot(dx, dy);
    if (d > r) continue;
    const a = Math.atan2(dy, dx);
    let col;
    if (a < -Math.PI / 2) col = P.vest;
    else if (a < 0) col = d > 3.5 ? (a < -1.25 && a > -1.65 && d > 5 ? P.band : P.skin) : P.vestD;
    else if (a < Math.PI / 2) col = P.pants;
    else col = d > 5 ? P.boot : P.pantsD;
    if (d > r - 1.3 && dx + dy > 2) col = a < 0 ? P.vestD : P.pantsD;
    if (d < 2) col = P.gunD;
    R(g, col, x, y);
  }
  R(g, P.eye, 15, 8);
  return outline(rot90(c, k));
}
function buildHeroArt() {
  const P = HERO, A = { run: {}, stand: {}, air: {} };
  for (const aim of ['fwd', 'dup', 'ddown']) {
    A.run[aim] = RUN_LEG.map((lf, f) => heroPose(P, { legF: lf, legB: RUN_LEG[(f + 3) % 6], aim, bob: f === 1 || f === 4 ? 1 : 0, tf: f % 3 }));
  }
  for (const aim of ['fwd', 'up']) A.stand[aim] = [0, 1, 2].map((tf) => heroPose(P, { aim, tf, bob: tf === 1 ? 1 : 0 }));
  for (const aim of ['fwd', 'up', 'dup', 'ddown']) A.air[aim] = heroPose(P, { aim, legF: JUMP_LEG_F, legB: JUMP_LEG_B, tf: 1 });
  A.prone = heroPose(P, { prone: true });
  A.ball = [0, 1, 2, 3].map((k) => heroBall(P, k));
  A.hurt = heroPose(P, { aim: 'flail', legF: [3, 5, 5, 11], legB: [-3, 5, -5, 11], tf: 2 });
  A.dead = heroPose(P, { prone: true, dead: true });
  // convertir a texturas
  const tx = (o) => (o instanceof HTMLCanvasElement ? T(o) : Array.isArray(o) ? o.map(tx) : Object.fromEntries(Object.entries(o).map(([k, v]) => [k, tx(v)])));
  return tx(A);
}
function buildGruntArt() {
  const P = GRUNT, A = {};
  const swing = [3, 1, -1, -3, -1, 1];
  A.run = RUN_LEG.map((lf, f) => heroPose(P, { legF: lf, legB: RUN_LEG[(f + 3) % 6], swing: swing[f], bob: f === 1 || f === 4 ? 1 : 0 }));
  A.aim = {};
  for (const aim of ['fwd', 'dup', 'ddown']) A.aim[aim] = heroPose(P, { aim });
  A.fall = heroPose(P, { legF: JUMP_LEG_F, legB: JUMP_LEG_B, swing: 3 });
  A.hurt = heroPose(P, { aim: 'flail', legF: [3, 5, 5, 11], legB: [-3, 5, -5, 11] });
  const flat = (o) => (o instanceof HTMLCanvasElement ? T(o) : Array.isArray(o) ? o.map(flat) : Object.fromEntries(Object.entries(o).map(([k, v]) => [k, flat(v)])));
  const out = flat(A);
  out.aimW = Object.fromEntries(Object.entries(A.aim).map(([k, v]) => [k, T(whiten(v, '#ffe0ea'))]));
  return out;
}

// ---------- torreta, dron, cápsula, medallas
function buildMachineArt() {
  const A = {};
  { // placa de torreta
    const { c, g } = mk(30, 30);
    R(g, '#262a3a', 1, 1, 28, 28); R(g, '#3a3f55', 2, 2, 26, 26);
    R(g, '#5b627e', 2, 2, 26, 2); R(g, '#5b627e', 2, 2, 2, 26); R(g, '#1d2030', 2, 26, 26, 2); R(g, '#1d2030', 26, 2, 2, 26);
    for (const [x, y] of [[5, 5], [23, 5], [5, 23], [23, 23]]) { R(g, '#9aa1bd', x, y, 2, 2); R(g, '#1d2030', x + 1, y + 1); }
    for (let i = 0; i < 26; i += 4) { R(g, '#ffcc33', 2 + i, 2, 2, 1); }
    disc(g, 15, 15, 9.5, '#141726'); disc(g, 15, 15, 8.5, '#22263a');
    A.plate = T(outline(c));
    A.plateDead = T(darken(c, 0.45));
  }
  { const { c, g } = mk(16, 16); disc(g, 8, 8, 6, '#5d6584'); disc(g, 7.4, 7.4, 4.6, '#7c85a8'); disc(g, 6.4, 6.4, 2, '#b8c0dc'); R(g, '#ff3355', 8, 9, 2, 2); A.cap = T(outline(c)); A.capW = T(whiten(outline(c), '#ffd6e2')); }
  A.barrel = [];
  for (let i = 0; i < 16; i++) {
    const { c, g } = mk(36, 36);
    const a = (i * Math.PI) / 8, ex = 18 + Math.cos(a) * 14, ey = 18 + Math.sin(a) * 14;
    line(g, 18, 18, ex, ey, '#3e4458', 4); line(g, 18, 18, ex, ey, '#7a83a0', 2);
    disc(g, ex, ey, 2, '#1c1f2c');
    A.barrel.push(T(outline(c)));
  }
  A.drone = [0, 1].map((f) => {
    const { c, g } = mk(28, 20);
    R(g, '#2d2a40', 3, 6, 22, 2);
    if (f === 0) { R(g, '#d6d6ee', 0, 4, 9, 1); R(g, '#d6d6ee', 19, 4, 9, 1); } else { R(g, '#a9a9cc', 2, 3, 5, 1); R(g, '#a9a9cc', 21, 3, 5, 1); }
    R(g, '#2d2a40', 4, 4, 1, 3); R(g, '#2d2a40', 23, 4, 1, 3);
    ellipse(g, 14, 10, 8.5, 5.5, '#4a4566'); ellipse(g, 14, 8.6, 7, 3.6, '#6f6896'); ellipse(g, 12, 7.6, 3, 1.4, '#a59fd0');
    R(g, '#2d2a40', 7, 13, 14, 2);
    disc(g, 8, 10, 2.3, '#ff3355'); R(g, '#ffd0da', 7, 9);
    R(g, '#5fe0ff', 13, 15, 2, f ? 2 : 1);
    return outline(c);
  });
  A.droneW = T(whiten(A.drone[0], '#ffe0ea'));
  A.drone = A.drone.map(T);
  A.capsule = [0, 1].map((f) => {
    const { c, g } = mk(30, 20);
    const wy = f ? 16 : 2, wd = f ? -3 : 3;
    poly(g, [[10, 8], [1, wy], [4, wy + wd], [11, 12]], '#ffb52e');
    poly(g, [[20, 8], [29, wy], [26, wy + wd], [19, 12]], '#ffb52e');
    line(g, 10, 10, 3, wy + wd / 2, '#c46a12'); line(g, 20, 10, 27, wy + wd / 2, '#c46a12');
    ellipse(g, 15, 10, 7, 4.6, '#8a93a8'); ellipse(g, 15, 9, 6, 3.2, '#d4dae6'); ellipse(g, 13, 7.8, 3, 1.2, '#ffffff');
    R(g, '#5d6578', 8, 11, 14, 1); disc(g, 15, 10, 1.9, '#ff3b3b');
    return outline(c);
  }).map(T);
  A.medal = {};
  for (const L of ['M', 'S', 'L', 'F', 'B']) {
    const { c, g } = mk(24, 18);
    poly(g, [[11, 6], [1, 2], [3, 6], [1, 9], [4, 12], [11, 12]], '#d9dee8');
    poly(g, [[13, 6], [23, 2], [21, 6], [23, 9], [20, 12], [13, 12]], '#d9dee8');
    line(g, 3, 5, 10, 8, '#8a93a8'); line(g, 3, 9, 10, 10, '#8a93a8'); line(g, 21, 5, 14, 8, '#8a93a8'); line(g, 21, 9, 14, 10, '#8a93a8');
    const col = { M: '#e23a43', S: '#ff7a1a', L: '#1fa6d6', F: '#d43a8a', B: '#e2b31a' }[L];
    disc(g, 12, 9, 6, '#1d1424'); disc(g, 11.6, 8.6, 5.5, col); disc(g, 10.4, 7.4, 1.8, 'rgba(255,255,255,0.55)');
    glyph(g, L, 10, 7, '#ffffff', true);
    A.medal[L] = T(outline(c));
  }
  return A;
}

// ---------- proyectiles
function buildShotArt() {
  const A = {};
  const ball = (s, r1, c1, r2, c2) => { const { c, g } = mk(s, s); disc(g, s / 2, s / 2, r1, c1); disc(g, s / 2, s / 2, r2, c2); return T(c); };
  A.pb = ball(6, 2.6, '#ffd23f', 1.5, '#ffffff');
  A.sp1 = ball(6, 2.6, '#ff5a36', 1.4, '#ffe0b0');
  A.sp2 = ball(8, 3.6, '#ff4a2a', 2.1, '#ffd0a0');
  A.fire = [ball(10, 4.4, '#d62a1a', 3.2, '#ff7a1a'), ball(10, 4.0, '#ff5a1a', 2.6, '#ffe066')];
  A.eb = [ball(6, 2.7, '#ff4f9a', 1.5, '#ffffff'), ball(6, 2.7, '#ffffff', 1.5, '#ff4f9a')];
  A.laser = {};
  for (const deg of [0, 45, 90, 135]) {
    const { c, g } = mk(24, 24);
    const a = (deg * Math.PI) / 180, dx = Math.cos(a), dy = -Math.sin(a);
    line(g, 12 - dx * 9, 12 - dy * 9, 12 + dx * 9, 12 + dy * 9, '#2fb8ff', 3);
    line(g, 12 - dx * 8, 12 - dy * 8, 12 + dx * 9, 12 + dy * 9, '#c8f6ff', 1);
    A.laser[deg] = T(c);
  }
  { const { c, g } = mk(10, 14); ellipse(g, 5, 8, 3.6, 4.8, '#2a2f40'); ellipse(g, 4.2, 7, 1.6, 2.4, '#5a6178'); R(g, '#ff3b3b', 2, 10, 6, 1); R(g, '#3d4358', 2, 0, 6, 3); R(g, '#3d4358', 4, 3, 2, 2); A.bomb = T(outline(c)); }
  { const { c, g } = mk(16, 8); R(g, '#c8cfdc', 3, 2, 10, 4); R(g, '#eef2f8', 3, 2, 10, 1); R(g, '#8a93a8', 3, 5, 10, 1); poly(g, [[13, 2], [16, 4], [13, 6]], '#ff3b3b'); R(g, '#4b5168', 1, 1, 3, 2); R(g, '#4b5168', 1, 5, 3, 2); A.missile = T(outline(c)); }
  return A;
}

// ---------- jefe: helicóptero artillado "COLOSO-07"
function buildBossArt() {
  const A = {};
  const body = (tf, hurt) => {
    const { c, g } = mk(124, 58);
    g.translate(2, 4);
    const M = hurt ? '#5a3a4a' : '#3d4b66', L = hurt ? '#7a4a5c' : '#5c7097', D = hurt ? '#3a2232' : '#273149';
    poly(g, [[84, 20], [112, 22], [112, 27], [84, 30]], '#34405a');
    R(g, '#4c5c80', 86, 22, 24, 1);
    for (let x = 98; x < 112; x += 4) R(g, '#ffcc33', x, 23, 2, 4);
    poly(g, [[104, 22], [110, 6], [117, 6], [115, 28]], '#2f3a52'); R(g, '#4c5c80', 110, 7, 6, 1);
    if (tf === 0) R(g, '#c0c8d8', 112, 2, 2, 26); else R(g, '#c0c8d8', 106, 16, 14, 2);
    disc(g, 113, 17, 2, '#1c2233');
    poly(g, [[10, 26], [16, 18], [30, 14], [70, 14], [84, 18], [86, 32], [76, 40], [24, 40], [14, 36]], M);
    poly(g, [[18, 18], [30, 15], [70, 15], [82, 19], [70, 21], [28, 21]], L);
    poly(g, [[16, 35], [84, 32], [76, 40], [24, 40]], D);
    poly(g, [[12, 26], [17, 19], [30, 16], [34, 16], [34, 27], [14, 28]], '#2a1030');
    line(g, 17, 19, 30, 16, '#ff6f96', 1);
    R(g, '#ff3b6b', 18, 22, 14, 2); R(g, '#ffd0dc', 28, 22, 3, 1);
    poly(g, [[40, 14], [44, 8], [72, 8], [76, 14]], '#2f3a52'); R(g, '#4c5c80', 45, 9, 26, 1);
    for (let x = 46; x < 54; x += 2) R(g, '#161b28', x, 10, 1, 4);
    R(g, '#1c2233', 72, 9, 6, 4); R(g, '#ff8a3a', 76, 10, 2, 2);
    R(g, '#232a3c', 56, 3, 4, 6); R(g, '#5c6680', 53, 2, 10, 2);
    poly(g, [[40, 30], [72, 30], [74, 33], [38, 33]], '#2a3348');
    R(g, '#4b5876', 42, 33, 12, 5); R(g, '#4b5876', 58, 33, 12, 5); R(g, '#6a7aa0', 42, 33, 12, 1); R(g, '#6a7aa0', 58, 33, 12, 1);
    for (let y = 34; y < 37; y += 2) { R(g, '#ff3b3b', 41, y); R(g, '#ff3b3b', 57, y); }
    R(g, '#232a3c', 16, 38, 10, 5); R(g, '#4b5168', 4, 40, 13, 2); R(g, '#8a92ae', 4, 40, 13, 1);
    R(g, D, 44, 20, 16, 1); R(g, D, 44, 20, 1, 12); R(g, D, 59, 20, 1, 12); R(g, D, 44, 31, 16, 1);
    for (let x = 36; x < 82; x += 6) R(g, '#7c8db4', x, 26);
    glyph(g, '0', 64, 23, '#ffcc33'); glyph(g, '7', 68, 23, '#ffcc33');
    R(g, '#3dff8a', 84, 31); R(g, '#ff3b3b', 11, 27);
    g.setTransform(1, 0, 0, 1, 0, 0);
    return outline(c);
  };
  A.body = [T(body(0, false)), T(body(1, false))];
  A.bodyHurt = [T(body(0, true)), T(body(1, true))];
  A.bodyW = T(whiten(body(0, false), '#ffd6e2'));
  A.rotor = [1, 0.62, 0.3].map((k) => {
    const { c, g } = mk(132, 6);
    const half = 64 * k;
    R(g, 'rgba(210,216,232,0.85)', Math.round(66 - half), 2, Math.round(half * 2), 2);
    R(g, 'rgba(255,255,255,0.9)', Math.round(66 - half), 2, 4, 1);
    R(g, 'rgba(255,255,255,0.9)', Math.round(66 + half - 4), 2, 4, 1);
    R(g, '#3a4258', 63, 1, 6, 4);
    return T(c);
  });
  // ancla: el centro del canvas. Puntos útiles relativos al centro (62,29):
  A.gun = [4 + 2 - 62, 41 + 4 - 29];
  A.pods = [[44 + 2 - 62, 38 + 4 - 29], [60 + 2 - 62, 38 + 4 - 29]];
  return A;
}

// =====================================================================
//  RALLY · autos seleccionables (diseños propios inspirados en estilos de época)
// =====================================================================
function carWheels(g, f, list) {
  for (const [x, y, w, h] of list) {
    R(g, '#1b1a26', x, y, w, h);
    for (let k = f ? 1 : 0; k < h; k += 2) R(g, '#5a596f', x, y + k, w, 1);
  }
}
const CAR_DRAW = {
  // rally clásico: franja central y alerón
  bolido(g, P, f) {
    carWheels(g, f, [[2, 2, 2, 4], [12, 2, 2, 4], [1, 9, 3, 4], [12, 9, 3, 4]]);
    R(g, P.b, 5, 0, 6, 1); R(g, P.b, 4, 1, 8, 8); R(g, P.b, 3, 9, 10, 5); R(g, P.d, 4, 14, 8, 1);
    R(g, P.l, 5, 0, 1, 1); R(g, P.l, 4, 1, 1, 8); R(g, P.l, 3, 9, 1, 5); R(g, P.d, 11, 1, 1, 8); R(g, P.d, 12, 9, 1, 5);
    R(g, P.s, 7, 0, 2, 15); R(g, P.d, 3, 12, 10, 1); R(g, P.s, 7, 12, 2, 1);
    R(g, '#1b2240', 5, 3, 6, 3); R(g, '#3d5294', 5, 3, 6, 1); R(g, '#9be8ff', 6, 4, 2, 1);
    R(g, '#1b2240', 5, 9, 6, 2); R(g, '#3d5294', 5, 9, 6, 1);
    R(g, '#fff1a0', 4, 1); R(g, '#fff1a0', 11, 1); R(g, '#ff3d4f', 3, 13); R(g, '#ff3d4f', 12, 13);
  },
  // coupé turbo de los 90: carrocería cuadrada, capó con rejillas, alerón ancho y barra de luz trasera
  rayo(g, P, f) {
    carWheels(g, f, [[2, 2, 2, 4], [12, 2, 2, 4], [2, 10, 2, 4], [12, 10, 2, 4]]);
    R(g, P.b, 4, 0, 8, 1); R(g, P.b, 3, 1, 10, 14); R(g, P.d, 3, 15, 10, 1);
    R(g, P.l, 3, 1, 1, 14); R(g, P.d, 12, 1, 1, 14);
    R(g, P.d, 5, 2, 1, 2); R(g, P.d, 10, 2, 1, 2); R(g, P.l, 7, 1, 2, 3);
    R(g, '#1b2240', 4, 5, 8, 2); R(g, '#3d5294', 4, 5, 8, 1); R(g, '#9be8ff', 5, 5, 2, 1);
    R(g, P.l, 4, 7, 1, 3);
    R(g, '#1b2240', 5, 10, 6, 1);
    R(g, P.d, 2, 13, 12, 1); R(g, P.d, 2, 12, 1, 2); R(g, P.d, 13, 12, 1, 2); R(g, P.s, 6, 13, 4, 1);
    R(g, '#fff1a0', 4, 1, 2, 1); R(g, '#fff1a0', 10, 1, 2, 1);
    R(g, '#ff3355', 4, 15, 8, 1);
  },
  // roadster de los 60: descapotable, guardabarros curvos, dos franjas finas, asientos a la vista
  roadster(g, P, f) {
    carWheels(g, f, [[2, 2, 2, 4], [12, 2, 2, 4], [1, 10, 2, 4], [13, 10, 2, 4]]);
    R(g, P.b, 6, 0, 4, 1); R(g, P.b, 5, 1, 6, 1); R(g, P.b, 4, 2, 8, 4); R(g, P.b, 3, 2, 1, 3); R(g, P.b, 12, 2, 1, 3);
    R(g, P.b, 4, 6, 8, 3);
    R(g, P.b, 3, 9, 10, 4); R(g, P.b, 2, 10, 1, 3); R(g, P.b, 13, 10, 1, 3);
    R(g, P.b, 4, 13, 8, 2); R(g, P.b, 5, 15, 6, 1);
    R(g, P.l, 4, 2, 1, 4); R(g, P.l, 3, 9, 1, 4); R(g, P.d, 11, 2, 1, 4); R(g, P.d, 12, 9, 1, 4);
    R(g, P.s, 6, 0, 1, 6); R(g, P.s, 9, 0, 1, 6); R(g, P.s, 6, 12, 1, 4); R(g, P.s, 9, 12, 1, 4);
    R(g, '#9be8ff', 5, 6, 6, 1);
    R(g, '#2a1a1a', 5, 7, 6, 3); R(g, '#7a4a3a', 5, 8, 2, 2); R(g, '#7a4a3a', 9, 8, 2, 2);
    R(g, P.b, 5, 10, 2, 2); R(g, P.b, 9, 10, 2, 2); R(g, P.l, 5, 10); R(g, P.l, 9, 10);
    R(g, '#1b1a26', 7, 0, 2, 1);
    R(g, '#fff1a0', 5, 1); R(g, '#fff1a0', 10, 1); R(g, '#ff3d4f', 5, 15); R(g, '#ff3d4f', 10, 15);
  },
  // muscle de los 70: ancho, toma de aire en el capó, techo de vinilo negro, cromados
  muscle(g, P, f) {
    carWheels(g, f, [[1, 2, 2, 4], [13, 2, 2, 4], [1, 10, 3, 4], [12, 10, 3, 4]]);
    R(g, '#c8cfdc', 3, 0, 10, 1);
    R(g, P.b, 3, 1, 10, 14); R(g, P.l, 3, 1, 1, 14); R(g, P.d, 12, 1, 1, 14);
    R(g, P.s, 4, 2, 1, 11); R(g, P.s, 11, 2, 1, 11);
    R(g, P.d, 6, 2, 4, 3); R(g, '#1b1a26', 7, 2, 2, 1);
    R(g, '#1b2240', 4, 7, 8, 1); R(g, '#9be8ff', 5, 7, 2, 1);
    R(g, '#1b1a26', 4, 8, 8, 3); R(g, '#3a3a4c', 4, 8, 1, 3);
    R(g, '#1b2240', 5, 11, 6, 1);
    R(g, '#c8cfdc', 3, 15, 10, 1); R(g, '#ff3d4f', 4, 15, 2, 1); R(g, '#ff3d4f', 10, 15, 2, 1);
    R(g, '#fff1a0', 4, 1); R(g, '#fff1a0', 11, 1);
  },
  // citycar redondito con techo bicolor
  pulga(g, P, f) {
    carWheels(g, f, [[3, 3, 2, 3], [11, 3, 2, 3], [3, 10, 2, 3], [11, 10, 2, 3]]);
    R(g, P.b, 5, 2, 6, 1); R(g, P.b, 4, 3, 8, 10); R(g, P.b, 5, 13, 6, 1);
    R(g, P.l, 4, 3, 1, 10); R(g, P.d, 11, 3, 1, 10);
    R(g, P.b, 3, 5); R(g, P.b, 12, 5);
    R(g, '#1b2240', 5, 5, 6, 1); R(g, '#9be8ff', 6, 5, 2, 1);
    R(g, P.s, 5, 6, 6, 5); R(g, 'rgba(0,0,0,0.18)', 5, 10, 6, 1);
    R(g, '#1b2240', 5, 11, 6, 1);
    R(g, '#fff1a0', 5, 3); R(g, '#fff1a0', 10, 3); R(g, '#ff3d4f', 5, 13); R(g, '#ff3d4f', 10, 13);
  },
};
function playerCarCanvas(id, P, f) {
  const { c, g } = mk(18, 18);
  g.translate(1, 1);
  CAR_DRAW[id](g, P, f);
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (P.fx) paintFx(c, P);
  return outline(c);
}
// pinturas especiales: se aplican sobre los pixeles de carrocería (b, l, d)
function paintFx(c, P) {
  const body = [P.b, P.l, P.d].map(rgb), r = rng32(77);
  return mapPixels(c, (d, i, x, y) => {
    if (!d[i + 3]) return;
    const k = body.findIndex(([a, b, cc]) => d[i] === a && d[i + 1] === b && d[i + 2] === cc);
    if (k < 0) return;
    let col = null;
    if (P.fx === 'flames') {
      const edge = 5 + Math.round(2.4 * Math.sin(x * 1.5) + 1.2 * Math.sin(x * 0.7 + 1));
      col = y < edge - 2 ? '#ffe14a' : y < edge ? '#ff8a1e' : y < edge + 2 ? '#e8383d' : null;
    } else if (P.fx === 'chrome') {
      const v = (x + y) % 8;
      col = v < 2 ? '#ffffff' : v === 2 ? '#e8eef6' : v === 6 ? '#8a94a8' : null;
    } else if (P.fx === 'galaxy') {
      const q = r();
      col = q < 0.1 ? '#ffffff' : q < 0.18 ? '#ff9ae0' : ((x * 3 + y * 5) % 11) < 2 ? '#3a2a8a' : null;
    } else if (P.fx === 'gold') {
      col = k === 0 && (x + y * 2) % 9 === 0 ? '#fff6c0' : null;
    } else if (P.fx === 'neon') {
      col = k === 0 && (x + y) % 6 === 0 ? '#ff4f9a' : null;
    }
    if (col) { const [a, b, cc] = rgb(col); d[i] = a; d[i + 1] = b; d[i + 2] = cc; }
  });
}
// luz de neón bajo el auto (blanca; se tiñe con el color elegido)
function underglowCanvas() {
  const { c, g } = mk(26, 30);
  const x0 = 9, x1 = 16, y0 = 8, y1 = 21;
  for (let y = 0; y < 30; y++) for (let x = 0; x < 26; x++) {
    const dx = Math.max(x0 - x, 0, x - x1), dy = Math.max(y0 - y, 0, y - y1), d = Math.hypot(dx, dy);
    let a = Math.max(0, 1 - d / 7);
    a = Math.round(a * a * 3) / 3;
    if (a <= 0) continue;
    g.fillStyle = `rgba(255,255,255,${(a * 0.5).toFixed(3)})`;
    g.fillRect(x, y, 1, 1);
  }
  return c;
}
function planeCanvas() {
  const { c, g } = mk(20, 20);
  g.translate(2, 2);
  R(g, '#c8d0dc', 1, 6, 14, 2); R(g, '#c8d0dc', 3, 8, 10, 1);
  R(g, '#c8d0dc', 5, 13, 6, 1); R(g, '#c8d0dc', 6, 14, 4, 1);
  R(g, '#e8ecf4', 7, 1, 2, 14); R(g, '#ffffff', 7, 1, 1, 13);
  R(g, '#4fe3ff', 7, 2, 2, 1); R(g, '#ff4f9a', 7, 7, 2, 2); R(g, '#ff4f9a', 1, 6, 1, 1); R(g, '#ff4f9a', 14, 6, 1, 1);
  g.setTransform(1, 0, 0, 1, 0, 0);
  return outline(c);
}
function markerCanvas(col) {
  const { c, g } = mk(12, 12);
  disc(g, 6, 6, 4.6, col); disc(g, 6, 6, 3, '#120d20'); disc(g, 6, 6, 1.7, col);
  return outline(c);
}
function ringCanvas(col, r) {
  const { c, g } = mk(r * 2 + 4, r * 2 + 4);
  const m = r + 2;
  disc(g, m, m, r, col); disc(g, m, m, r - 1.2, 'rgba(0,0,0,0)');
  g.globalCompositeOperation = 'destination-out'; disc(g, m, m, r - 1.2, '#000'); g.globalCompositeOperation = 'source-over';
  return c;
}
function turntableCanvas(r, phase) {
  const { c, g } = mk(r * 2 + 4, r * 2 + 4);
  const m = r + 2;
  disc(g, m + 2, m + 3, r, 'rgba(0,0,0,0.45)');
  disc(g, m, m, r, '#5b5e68'); disc(g, m, m, r - 2, '#2b2c32'); disc(g, m, m, r - 5, '#36373e');
  for (let k = r - 9; k > 6; k -= 6) { disc(g, m, m, k, '#2f3036'); disc(g, m, m, k - 1, '#36373e'); }
  const n = 20;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, x = m + Math.cos(a) * (r - 1), y = m + Math.sin(a) * (r - 1);
    const on = (i + phase) % 2 === 0;
    R(g, on ? (i % 4 < 2 ? '#f2c12e' : '#f4f4ee') : '#45464e', x - 1, y - 1, 2, 2);
  }
  return c;
}
function garageBgCanvas() {
  // taller de barrio: muro de bloques, cortina metálica, tableros de herramientas,
  // tubos fluorescentes, neumáticos, tambor de aceite y piso de cemento con líneas amarillas
  const { c, g } = mk(512, 216);
  const r = rng32(44);
  R(g, '#3b3c44', 0, 0, 512, 66);
  for (let y = 0; y < 66; y += 8) {
    R(g, '#33343b', 0, y, 512, 1);
    for (let x = (y / 8) % 2 ? 0 : 12; x < 512; x += 24) R(g, '#33343b', x, y, 1, 8);
  }
  for (let k = 0; k < 40; k++) R(g, 'rgba(0,0,0,0.12)', r() * 512, r() * 64, 1 + r() * 3, 1);
  // cortina metálica a medio subir
  R(g, '#25262c', 184, 4, 144, 62); R(g, '#5d606b', 184, 4, 144, 30);
  for (let y = 6; y < 34; y += 3) R(g, '#4a4c56', 184, y, 144, 1);
  R(g, '#7b7e8a', 184, 33, 144, 2); R(g, '#16171b', 184, 35, 144, 1);
  R(g, '#2c2d34', 180, 2, 4, 64); R(g, '#2c2d34', 328, 2, 4, 64);
  // tubos fluorescentes (luz fría, sin neón de colores)
  const tube = (x, y, w) => { R(g, '#2a2b31', x - 2, y - 2, w + 4, 5); R(g, '#e9f1ee', x, y, w, 2); R(g, '#ffffff', x + 3, y, w - 6, 1); R(g, 'rgba(233,241,238,0.08)', x - 10, y + 3, w + 20, 6); };
  tube(206, 0, 100);
  // tablero perforado con herramientas
  const board = (x0, w) => {
    R(g, '#8a6f4e', x0, 24, w, 32); R(g, '#76603f', x0, 54, w, 2);
    for (let y = 27; y < 54; y += 4) for (let x = x0 + 3; x < x0 + w - 2; x += 4) R(g, '#6d583b', x, y, 1, 1);
  };
  board(30, 104); board(380, 100);
  const wr = (x, l) => { R(g, '#b8bcc6', x, 30, 2, l); R(g, '#b8bcc6', x - 1, 29, 4, 2); R(g, '#8e929c', x, 30 + l - 1, 2, 1); };
  for (let i = 0; i < 6; i++) wr(38 + i * 8, 10 + i * 2);
  R(g, '#d8342c', 94, 30, 4, 12); R(g, '#202126', 94, 42, 4, 8);       // destornillador
  R(g, '#d8342c', 104, 30, 3, 10); R(g, '#202126', 104, 40, 3, 9);
  R(g, '#f2c12e', 114, 31, 12, 7); R(g, '#202126', 118, 38, 4, 10);   // taladro
  for (let i = 0; i < 4; i++) { const x = 392 + i * 14; disc(g, x + 2, 34, 3, '#b8bcc6'); disc(g, x + 2, 34, 1.5, '#8a6f4e'); R(g, '#b8bcc6', x + 1, 37, 3, 10); }
  R(g, '#2a5aa8', 450, 30, 22, 16); R(g, '#e9ecf2', 452, 32, 18, 2); R(g, '#e9ecf2', 452, 36, 12, 1); R(g, '#e9ecf2', 452, 39, 15, 1); // cartel azul
  // zócalo y franja de seguridad
  R(g, '#23242a', 0, 66, 512, 2);
  for (let x = -8; x < 512; x += 12) { g.fillStyle = '#f2c12e'; g.beginPath(); g.moveTo(x, 68); g.lineTo(x + 6, 68); g.lineTo(x + 2, 72); g.lineTo(x - 4, 72); g.fill(); }
  R(g, '#1a1b1f', 0, 68, 512, 0); R(g, '#16171b', 0, 72, 512, 1);
  // piso de cemento con juntas, manchas de aceite y líneas de estacionamiento
  R(g, '#4a4b52', 0, 73, 512, 143);
  for (let y = 73; y < 216; y += 36) R(g, '#3f4047', 0, y, 512, 1);
  for (let x = 0; x < 512; x += 64) R(g, '#3f4047', x, 73, 1, 143);
  for (let k = 0; k < 900; k++) R(g, r() < 0.5 ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.04)', r() * 512, 73 + r() * 143, 1, 1);
  for (let k = 0; k < 8; k++) ellipse(g, 20 + r() * 470, 100 + r() * 100, 6 + r() * 12, 3 + r() * 4, 'rgba(10,10,14,0.28)');
  for (const x of [118, 386]) { R(g, '#d9b13a', x, 96, 2, 120); }
  R(g, '#d9b13a', 118, 96, 16, 2); R(g, '#d9b13a', 372, 96, 16, 2);
  // neumáticos apilados y tambor de aceite
  for (let i = 0; i < 3; i++) { ellipse(g, 26, 92 - i * 8, 15, 5, '#18191d'); ellipse(g, 26, 91 - i * 8, 13, 4, '#26272c'); ellipse(g, 26, 91 - i * 8, 6, 2, '#18191d'); }
  R(g, '#b0322a', 478, 70, 20, 26); R(g, '#d8342c', 480, 70, 3, 26); R(g, '#7e231d', 478, 78, 20, 1); R(g, '#7e231d', 478, 88, 20, 1); ellipse(g, 488, 70, 10, 3, '#c23a30');
  return c;
}

// =====================================================================
//  BANDERAS (24×16) con ondeo de 3 cuadros
// =====================================================================
const FLAG_DRAW = {
  CL(g) {
    R(g, '#ffffff', 0, 0, 24, 8); R(g, '#d52b1e', 0, 8, 24, 8); R(g, '#0039a6', 0, 0, 8, 8);
    for (const [x, y] of [[3, 1], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [2, 3], [3, 3], [4, 3], [2, 4], [4, 4], [1, 5], [5, 5]]) R(g, '#ffffff', x + 1, y, 1, 1);
  },
  AR(g) {
    R(g, '#74acdf', 0, 0, 24, 5); R(g, '#ffffff', 0, 5, 24, 6); R(g, '#74acdf', 0, 11, 24, 5);
    for (const [x, y] of [[12, 5], [12, 10], [9, 8], [14, 8], [10, 6], [14, 6], [10, 9], [14, 9]]) R(g, '#e8a40e', x, y, 1, 1);
    disc(g, 12, 8, 1.8, '#f6b40e');
  },
  MX(g) {
    R(g, '#006847', 0, 0, 8, 16); R(g, '#ffffff', 8, 0, 8, 16); R(g, '#ce1126', 16, 0, 8, 16);
    R(g, '#8a5a2a', 11, 6, 3, 3); R(g, '#5a3a1a', 12, 5, 1, 1); R(g, '#3a8a3a', 10, 9, 1, 1); R(g, '#3a8a3a', 14, 9, 1, 1); R(g, '#3a8a3a', 11, 10, 3, 1);
  },
  US(g) {
    for (let y = 0; y < 16; y += 2) R(g, (y / 2) % 2 ? '#ffffff' : '#b22234', 0, y, 24, 2);
    R(g, '#3c3b6e', 0, 0, 11, 8);
    for (let y = 1; y < 8; y += 2) for (let x = 1 + ((y >> 1) & 1); x < 11; x += 2) R(g, '#ffffff', x, y, 1, 1);
  },
  UK(g) {
    R(g, '#012169', 0, 0, 24, 16);
    for (let x = 0; x < 24; x++) {
      const y1 = Math.round((x * 15) / 23), y2 = 15 - y1;
      R(g, '#ffffff', x, y1 - 1, 1, 3); R(g, '#ffffff', x, y2 - 1, 1, 3);
      R(g, '#c8102e', x, x < 12 ? y1 : y1 + 1, 1, 1); R(g, '#c8102e', x, x < 12 ? y2 - 1 : y2, 1, 1);
    }
    R(g, '#ffffff', 9, 0, 6, 16); R(g, '#ffffff', 0, 5, 24, 6);
    R(g, '#c8102e', 10, 0, 4, 16); R(g, '#c8102e', 0, 6, 24, 4);
  },
  JP(g) {
    R(g, '#ffffff', 0, 0, 24, 16); disc(g, 12, 8, 4.6, '#bc002d');
  },
};
function flagField(code) {
  const { c, g } = mk(24, 16);
  FLAG_DRAW[code](g);
  return c;
}
// asta con bandera ondeando (ancla en la base del asta: 4,37)
function flagPoleCanvas(code, phase) {
  const field = flagField(code);
  const fd = field.getContext('2d').getImageData(0, 0, 24, 16).data;
  const { c, g } = mk(32, 40);
  ellipse(g, 6, 37, 5, 2, 'rgba(0,0,0,0.35)');
  R(g, '#4a4458', 1, 35, 6, 3); R(g, '#6e6888', 1, 35, 6, 1);
  R(g, '#8a8aa0', 3, 3, 2, 33); R(g, '#d6d6e4', 3, 3, 1, 33);
  disc(g, 4, 2, 1.8, '#ffd23f');
  for (let x = 0; x < 24; x++) {
    const w = Math.sin(x * 0.42 - phase * 2.1);
    const dy = Math.round(w * 1.2 * Math.min(1, x / 5));
    const k = 1 - 0.16 * Math.max(0, -Math.cos(x * 0.42 - phase * 2.1)) * Math.min(1, x / 4);
    for (let y = 0; y < 16; y++) {
      const i = (y * 24 + x) * 4;
      g.fillStyle = `rgb(${Math.round(fd[i] * k)},${Math.round(fd[i + 1] * k)},${Math.round(fd[i + 2] * k)})`;
      g.fillRect(5 + x, 4 + y + dy, 1, 1);
    }
  }
  return outline(c);
}

// =====================================================================
//  RALLY · ítems, tráfico civil, peatones y semáforos
// =====================================================================
CAR_DRAW.sedan = (g, P, f) => {
  carWheels(g, f, [[2, 2, 2, 4], [12, 2, 2, 4], [2, 10, 2, 4], [12, 10, 2, 4]]);
  R(g, P.b, 4, 0, 8, 1); R(g, P.b, 3, 1, 10, 14); R(g, P.d, 4, 15, 8, 1);
  R(g, P.l, 3, 1, 1, 14); R(g, P.d, 12, 1, 1, 14);
  R(g, '#1b2240', 4, 4, 8, 2); R(g, '#9be8ff', 5, 4, 2, 1);
  R(g, P.s, 4, 6, 8, 4); R(g, 'rgba(0,0,0,0.15)', 4, 9, 8, 1);
  R(g, '#1b2240', 4, 10, 8, 2);
  R(g, '#fff1a0', 4, 1); R(g, '#fff1a0', 11, 1); R(g, '#ff3d4f', 4, 15); R(g, '#ff3d4f', 11, 15);
};
CAR_DRAW.taxi = (g, P, f) => {
  CAR_DRAW.sedan(g, P, f);
  R(g, '#1b1a26', 6, 7, 4, 2); R(g, f ? '#fff6a0' : '#ffd23f', 6, 7, 4, 1);
};
function civCanvas(kind, P, f) {
  if (kind !== 'bus') return playerCarCanvas(kind === 'convertible' ? 'roadster' : kind === 'taxi' ? 'taxi' : 'sedan', P, f);
  const { c, g } = mk(18, 28);
  g.translate(1, 1);
  carWheels(g, f, [[1, 3, 2, 4], [13, 3, 2, 4], [1, 18, 2, 4], [13, 18, 2, 4]]);
  R(g, P.b, 2, 0, 12, 26); R(g, P.l, 2, 0, 1, 26); R(g, P.d, 13, 0, 1, 26);
  R(g, '#1b2240', 3, 1, 10, 2); R(g, '#9be8ff', 4, 1, 3, 1);
  R(g, P.s, 4, 4, 8, 19);
  for (let y = 6; y < 22; y += 4) R(g, P.d, 4, y, 8, 1);
  R(g, '#ff3d4f', 3, 25); R(g, '#ff3d4f', 12, 25); R(g, '#fff1a0', 3, 0); R(g, '#fff1a0', 12, 0);
  g.setTransform(1, 0, 0, 1, 0, 0);
  return outline(c);
}
function itemBoxCanvas(f) {
  const { c, g } = mk(18, 18);
  g.translate(1, 1);
  R(g, '#2a2070', 1, 3, 14, 12); R(g, '#4a3ab8', 1, 3, 13, 11); R(g, '#7a6ae8', 1, 1, 14, 3); R(g, '#a99cff', 2, 1, 12, 1);
  R(g, '#2a2070', 14, 3, 1, 12);
  g.save(); g.translate(5, 5); g.scale(2, 2); glyph(g, '?', 0, 0, f ? '#ffffff' : '#ffe14a'); g.restore();
  R(g, '#ffffff', 2, 4, 1, 2);
  g.setTransform(1, 0, 0, 1, 0, 0);
  return outline(c);
}
function slickCanvas(seed) {
  const { c, g } = mk(18, 14);
  const r = rng32(seed);
  for (let k = 0; k < 6; k++) ellipse(g, 5 + r() * 8, 4 + r() * 6, 3 + r() * 3, 2 + r() * 2, '#15131f');
  for (let k = 0; k < 7; k++) R(g, pick(['#5a3a8a', '#2a6a7a', '#7a6a2a', '#3a2a5a']), 4 + ((r() * 10) | 0), 3 + ((r() * 8) | 0), 2, 1);
  return c;
}
function pedCanvas(shirt, f) {
  const { c, g } = mk(8, 10);
  R(g, '#2a1a12', 3, 1, 2, 1); R(g, '#f2b88a', 3, 2, 2, 2);
  R(g, shirt, 2, 4, 4, 3);
  R(g, '#2a2a3a', f ? 2 : 3, 7, 1, 2); R(g, '#2a2a3a', f ? 5 : 4, 7, 1, 2);
  return outline(c);
}
function tlightCanvas(green) {
  const { c, g } = mk(6, 12);
  R(g, '#3a3a48', 2, 5, 1, 7); R(g, '#1b1a26', 1, 0, 4, 6);
  R(g, green ? '#3a1414' : '#ff3b3b', 2, 1, 2, 2); R(g, green ? '#5fff7a' : '#143a1c', 2, 3, 2, 2);
  return c;
}
// íconos de ítems para el HUD (12x12)
function itemIconCanvas(kind) {
  const { c, g } = mk(14, 14);
  g.translate(1, 1);
  if (kind === 'nitro') {
    R(g, '#8d93a3', 5, 0, 2, 2); R(g, '#d6dae4', 5, 0, 1, 1);
    R(g, '#2f6ff2', 3, 2, 6, 7); R(g, '#7fb0ff', 3, 2, 1, 7); R(g, '#1c44a6', 8, 2, 1, 7);
    R(g, '#ffffff', 5, 4, 2, 1); R(g, '#ffffff', 5, 6, 2, 1);
    R(g, '#ffe14a', 4, 9, 4, 1); R(g, '#ff8a1e', 4, 10, 4, 1); R(g, '#ff8a1e', 5, 11, 2, 1);
  } else if (kind === 'iman') {
    R(g, '#e8383d', 1, 1, 3, 7); R(g, '#e8383d', 8, 1, 3, 7); R(g, '#e8383d', 2, 8, 8, 3); R(g, '#9e1d2b', 4, 7, 4, 2);
    R(g, '#ff8a7a', 1, 1, 1, 7); R(g, '#d6dae4', 1, 0, 3, 2); R(g, '#d6dae4', 8, 0, 3, 2);
  } else if (kind === 'escudo') {
    poly(g, [[1, 1], [11, 1], [11, 6], [6, 11], [1, 6]], '#2fa8d8');
    poly(g, [[3, 2], [9, 2], [9, 6], [6, 9], [3, 6]], '#5ff2ff');
    R(g, '#ffffff', 4, 3, 2, 3); R(g, '#1c6a8a', 6, 2, 1, 7);
  } else if (kind === 'aceite') {
    disc(g, 6, 7, 4, '#1b1a26'); poly(g, [[6, 0], [9, 6], [3, 6]], '#1b1a26');
    R(g, '#7a5ac8', 4, 6, 1, 2); R(g, '#4fe3ff', 5, 9, 2, 1); R(g, '#ffffff', 4, 5);
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  return outline(c);
}
// anillo del escudo (blanco, se tiñe)
function shieldCanvas() {
  const { c, g } = mk(28, 28);
  for (let y = 0; y < 28; y++) for (let x = 0; x < 28; x++) {
    const d = Math.hypot(x + 0.5 - 14, y + 0.5 - 14);
    if (d > 12.4 && d < 13.6) R(g, '#ffffff', x, y);
    else if (d > 10 && d <= 12.4 && bayer(x, y) < 0.3) R(g, 'rgba(255,255,255,0.6)', x, y);
  }
  return c;
}
// helicóptero policial visto desde arriba (sin aspas; las aspas van aparte y giran)
function heliCanvas() {
  const { c, g } = mk(22, 34);
  g.translate(1, 1);
  R(g, '#1b1a26', 9, 18, 2, 12); R(g, '#3a3a4c', 9, 18, 1, 12);
  R(g, '#1b1a26', 5, 28, 10, 2); R(g, '#e8383d', 5, 28, 2, 2); R(g, '#e8383d', 13, 28, 2, 2);
  ellipse(g, 10, 11, 6, 9, '#2a2a3c'); ellipse(g, 9.5, 10.5, 5, 8, '#e8e6f0'); R(g, '#2a2a3c', 4, 12, 13, 2);
  ellipse(g, 10, 5, 3.6, 3, '#4fa8e8'); R(g, '#b8e8ff', 8, 3, 2, 1);
  R(g, '#5a596f', 2, 6, 1, 12); R(g, '#5a596f', 17, 6, 1, 12);
  R(g, '#ff3b5c', 7, 15, 2, 1); R(g, '#3b8cff', 11, 15, 2, 1);
  g.setTransform(1, 0, 0, 1, 0, 0);
  return outline(c);
}
function rotorCanvas() {
  const { c, g } = mk(40, 40);
  g.globalAlpha = 0.85;
  line(g, 3, 20, 37, 20, '#c8c4d8', 2); line(g, 20, 3, 20, 37, '#c8c4d8', 2);
  g.globalAlpha = 1;
  disc(g, 20, 20, 2.2, '#3a3a4c');
  return c;
}
// foco del helicóptero sobre el suelo (blanco, se dibuja con mezcla aditiva)
function spotCanvas(r) {
  const { c, g } = mk(r * 2 + 2, r * 2 + 2);
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
    const d = Math.hypot(x + 0.5 - r - 1, y + 0.5 - r - 1) / r;
    if (d > 1) continue;
    const a = d > 0.9 ? 0.5 : d > 0.7 ? (bayer(x, y) < 0.6 ? 0.32 : 0.2) : 0.26;
    g.fillStyle = `rgba(255,250,215,${a})`; g.fillRect(x, y, 1, 1);
  }
  return c;
}
// meta de la persecución: bandera a cuadros sobre la calle
function goalCanvas(f) {
  const { c, g } = mk(16, 26);
  ellipse(g, 6, 24, 5, 1.6, 'rgba(0,0,0,0.35)');
  R(g, '#d6d6e4', 2, 2, 1, 22);
  for (let y = 0; y < 8; y++) for (let x = 0; x < 11; x++) {
    const w = Math.round(Math.sin(x * 0.7 + f * 1.6) * 0.8);
    R(g, ((x >> 1) + (y >> 1)) & 1 ? '#1b1a26' : '#ffffff', 3 + x, 2 + y + w);
  }
  disc(g, 2.5, 1.5, 1.4, '#ffd23f');
  return outline(c);
}
// flecha de borde de pantalla (blanca, se tiñe); apunta hacia arriba
function arrowCanvas() {
  const { c, g } = mk(13, 13);
  poly(g, [[6.5, 0.5], [12.5, 9.5], [8.5, 9.5], [8.5, 12.5], [4.5, 12.5], [4.5, 9.5], [0.5, 9.5]], '#ffffff');
  return outline(c, '#000000');
}
// librea de cada tipo de patrulla
const POLICE_LIVERY = [
  { b: '#e8383d', l: '#ff8a7a', d: '#9e1d2b', s: '#1b1424' },   // perseguidor
  { b: '#ff7a1e', l: '#ffb070', d: '#b0480c', s: '#1b1424' },   // cortador
  { b: '#28a08c', l: '#6ae0c8', d: '#14685a', s: '#1b1424' },   // vigilante
  { b: '#8a4ae8', l: '#b88aff', d: '#55289a', s: '#1b1424' },   // errático
];

