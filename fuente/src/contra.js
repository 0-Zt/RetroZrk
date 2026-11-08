// =====================================================================
//  JUEGO 2 · NEÓN COMMANDO — run & gun horizontal en una ciudad al atardecer
//  Mecánicas: disparo en 8 direcciones, salto en giro (bola), cuerpo a tierra,
//  bajar de plataformas (abajo + salto), cápsulas voladoras con armas
//  M (ametralladora) S (dispersión ×5) L (láser perforante) F (fuego en espiral)
//  B (barrera), muerte de un golpe y vuelta al arma normal, jefe helicóptero.
// =====================================================================
const Contra = (() => {
  const GY = 184, END = 4096, G = 820, RUN = 82, JV = -318, MAXF = 430;
  let A = null, scene = null, parts = null, built = false;
  let layers = [], chunks = [], plats = [], fires = [], glows = [], beams = [];
  let player = null, pbs = [], ebs = [], ents = [], items = [], booms = [], boss = null;
  let BG = null, grens = [], bgParts = null;
  const S = {};
  let hud = {}, hc = {};
  const fmtN = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // ---------------- nivel
  const GROUND = [[0, 600], [644, 1250], [1296, 1760], [1880, 2500], [2544, 3200], [3244, END]];
  const LEDGES = [
    [260, 380, 136, 'girder'], [760, 920, 128, 'roof'], [1000, 1056, 160, 'car'], [1380, 1500, 140, 'girder'], [1520, 1640, 100, 'girder'],
    [1784, 1856, 164, 'bridge'], [1900, 1960, 150, 'girder'], [1960, 2120, 112, 'roof'], [2250, 2306, 160, 'car'], [2620, 2740, 136, 'girder'],
    [2900, 2956, 160, 'car'], [2980, 3140, 128, 'roof'], [3420, 3540, 140, 'girder'],
  ];
  const SPAWNS = [
    { x: 300, t: 'capsule', w: 'M' }, { x: 340, t: 'rifle', y: 136 }, { x: 560, t: 'rifle', y: GY },
    { x: 840, t: 'turret', y: 156 }, { x: 880, t: 'rifle', y: 128 }, { x: 1200, t: 'capsule', w: 'S' },
    { x: 1150, t: 'rifle', y: GY }, { x: 1450, t: 'rifle', y: 140 }, { x: 1470, t: 'drones', n: 3 }, { x: 1590, t: 'rifle', y: 100 },
    { x: 1700, t: 'turret', y: 150 }, { x: 2000, t: 'capsule', w: 'L' }, { x: 2040, t: 'turret', y: 140 }, { x: 2080, t: 'rifle', y: 112 },
    { x: 2380, t: 'rifle', y: GY }, { x: 2650, t: 'capsule', w: 'F' }, { x: 2700, t: 'rifle', y: 136 }, { x: 2720, t: 'drones', n: 3 },
    { x: 3060, t: 'turret', y: 156 }, { x: 3100, t: 'rifle', y: 128 }, { x: 3150, t: 'capsule', w: 'B' }, { x: 3360, t: 'drones', n: 4 },
    { x: 3480, t: 'rifle', y: 140 }, { x: 3560, t: 'capsule', w: 'S' },
  ];
  const WEAP = {
    N: { speed: 270, rate: 0.17, max: 4, dmg: 1, sfx: 'shoot' },
    M: { speed: 320, rate: 0.085, max: 9, dmg: 1, sfx: 'mgun' },
    S: { speed: 240, rate: 0.24, max: 15, dmg: 1, sfx: 'spread', spread: [-0.3, -0.15, 0, 0.15, 0.3] },
    L: { rate: 0.3, dmg: 3, sfx: 'laser', beam: 5, col: 0xff4f9a },
    F: { speed: 185, rate: 0.22, max: 6, dmg: 2, sfx: 'fireball', spiral: true },
    // armas de base de cada personaje (suben con mejoras en el cuartel)
    R: { speed: 340, rate: 0.14, max: 5, dmg: 1, sfx: 'rifle' },
    E: { speed: 300, rate: 0.36, max: 15, dmg: 1, sfx: 'shotgun', spread: [-0.17, 0, 0.17], life: 0.26 },
    V: { rate: 0.3, dmg: 2, sfx: 'vlaser', beam: 3, col: 0x4fe3ff },
  };
  const WUP = {
    R: [{}, { rate: 0.11, max: 6 }, { rate: 0.09, max: 7, dmg: 2 }],
    E: [{}, { spread: [-0.22, -0.07, 0.07, 0.22] }, { spread: [-0.26, -0.13, 0, 0.13, 0.26], life: 0.38, rate: 0.32 }],
    V: [{}, { rate: 0.24 }, { rate: 0.22, dmg: 3 }],
  };
  const wstat = (w) => (w === S.baseW && WUP[w] ? Object.assign({}, WEAP[w], WUP[w][(S.wl || 1) - 1]) : WEAP[w]);
  const WCOL = { N: '#6a6488', R: '#4f8a35', E: '#ff8a1e', V: '#1fa6d6', M: '#e23a43', S: '#ff7a1a', L: '#1fa6d6', F: '#d43a8a' };
  const WNAME = { N: 'NORMAL', R: 'RIFLE', E: 'ESCOPETA', V: 'LÁSER', M: 'AMETRALLA', S: 'DISPERSIÓN', L: 'LÁSER', F: 'FUEGO' };
  // habilidades: [espera en s, potencia] por nivel 1..3
  const ABIL = {
    gren: { n: 'Granada', k: 'G', cd: [6, 4.5, 3.5] },
    wall: { n: 'Barrera', k: 'B', cd: [11, 10, 9], dur: [2.5, 3.5, 4.5] },
    dash: { n: 'Impulso', k: 'I', cd: [3, 2.2, 1.8] },
  };
  const SCRAP = { runner: 1, rifle: 2, drone: 2, turret: 4, capsule: 1 };
  // sensación de cada arma: fogonazo, temblor [fuerza, tiempo], retroceso, vainas, empuje al enemigo, pausa al matar, color de chispas
  const FEEL = {
    N: { shake: [0.3, 0.04], knock: 40, casing: 1, spark: 0xffe066 },
    R: { shake: [0.5, 0.05], knock: 55, casing: 1, spark: 0xfff0a0 },
    M: { shake: [0.4, 0.04], knock: 35, casing: 1, spark: 0xff9a5a },
    E: { shake: [2.2, 0.1], kick: 2.5, knock: 150, casing: 2, spark: 0xffb347, stop: 0.04 },
    S: { shake: [1.2, 0.07], knock: 70, spark: 0xff7a1a },
    V: { shake: [1, 0.06], knock: 90, spark: 0x9ff3ff, stop: 0.03 },
    L: { shake: [1.8, 0.09], knock: 130, spark: 0xff9ac8, stop: 0.045 },
    F: { shake: [0.8, 0.06], knock: 60, spark: 0xff7a1a },
  };

  // ---------------- arte del escenario
  function skyCanvas() {
    const { c, g } = mk(64, 216);
    const stops = [[0, [22, 12, 54]], [36, [48, 22, 92]], [72, [112, 40, 120]], [102, [200, 70, 118]], [132, [244, 122, 90]], [160, [255, 170, 100]], [216, [240, 130, 96]]];
    const at = (y) => {
      for (let i = 0; i < stops.length - 1; i++) {
        const [y0, c0] = stops[i], [y1, c1] = stops[i + 1];
        if (y <= y1) { const t = (y - y0) / (y1 - y0); return c0.map((v, k) => v + (c1[k] - v) * t); }
      }
      return stops[stops.length - 1][1];
    };
    // gradiente posterizado con tramado ordenado (bandas retro)
    for (let y = 0; y < 216; y++) for (let x = 0; x < 64; x++) {
      const col = at(y), q = 18, d = bayer(x, y) * q;
      g.fillStyle = `rgb(${Math.floor((col[0] + d) / q) * q},${Math.floor((col[1] + d) / q) * q},${Math.floor((col[2] + d) / q) * q})`;
      g.fillRect(x, y, 1, 1);
    }
    const r = rng32(5);
    for (let k = 0; k < 14; k++) R(g, r() < 0.3 ? '#ffffff' : '#c9b8ff', (r() * 64) | 0, (r() * 46) | 0);
    return c;
  }
  function sunCanvas() {
    const { c, g } = mk(80, 80);
    const cx = 40, cy = 40, r = 36;
    for (let y = 0; y < 80; y++) {
      const t = y / 80;
      const col = `rgb(255,${Math.round(230 - t * 150)},${Math.round(90 + t * 70)})`;
      for (let x = 0; x < 80; x++) {
        const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
        if (dx * dx + dy * dy > r * r) continue;
        if (y > 40 && (y - 40) % 8 < Math.min(5, 1 + (y - 40) / 8)) continue;
        R(g, col, x, y);
      }
    }
    return c;
  }
  function beamCanvas() {
    const { c, g } = mk(26, 170);
    for (let y = 0; y < 170; y++) {
      const w = 2 + (170 - y) * 0.14, a = 0.16 * (y / 170);
      g.fillStyle = `rgba(255,236,190,${a.toFixed(3)})`;
      g.fillRect(Math.round(13 - w / 2), y, Math.round(w), 1);
    }
    return c;
  }
  function farCanvas() {
    const { c, g } = mk(320, 112);
    const r = rng32(21);
    let x = 0;
    while (x < 320) {
      const w = 14 + ((r() * 22) | 0), h = 30 + ((r() * 70) | 0);
      R(g, '#4b2a6e', x, 112 - h, w, h);
      R(g, '#5c3683', x, 112 - h, 1, h);
      if (r() < 0.4) R(g, '#4b2a6e', x + (w >> 1), 112 - h - 8, 1, 8);
      if (r() < 0.25) { R(g, '#4b2a6e', x + 3, 112 - h - 4, w - 6, 4); }
      for (let k = 0; k < 6; k++) if (r() < 0.5) R(g, r() < 0.5 ? '#ff9ac8' : '#ffd08a', x + 2 + ((r() * (w - 4)) | 0), 112 - h + 4 + ((r() * (h - 8)) | 0));
      x += w + ((r() * 3) | 0);
    }
    return c;
  }
  function midCanvas() {
    const { c, g } = mk(384, 112);
    const r = rng32(33);
    let x = 0;
    while (x < 384) {
      const w = 30 + ((r() * 40) | 0), h = 34 + ((r() * 62) | 0), top = 112 - h;
      R(g, '#271f4a', x, top, w, h);
      R(g, '#3a2f68', x, top, w, 2); R(g, '#3a2f68', x, top, 2, h); R(g, '#1b1536', x + w - 2, top, 2, h);
      for (let wy = top + 8; wy < 108; wy += 10) for (let wx = x + 5; wx < x + w - 6; wx += 7) {
        const p = r();
        const col = p < 0.32 ? '#ffd36b' : p < 0.42 ? '#7fe3ff' : p < 0.47 ? '#ff7ab8' : '#1a1530';
        R(g, col, wx, wy, 3, 5);
        if (col !== '#1a1530') R(g, 'rgba(0,0,0,0.25)', wx, wy + 3, 3, 2);
      }
      const roof = r();
      if (roof < 0.3) { R(g, '#3a2f68', x + 6, top - 10, 10, 10); R(g, '#271f4a', x + 7, top - 3, 8, 3); R(g, '#271f4a', x + 8, top - 14, 1, 4); R(g, '#271f4a', x + 13, top - 14, 1, 4); }
      else if (roof < 0.55) { R(g, '#271f4a', x + (w >> 1), top - 22, 1, 22); R(g, '#ff3b5c', x + (w >> 1), top - 23, 1, 1); }
      else if (roof < 0.75) {
        const sw = Math.min(w - 8, 26);
        R(g, '#120e24', x + 4, top - 12, sw, 10); R(g, '#ff4f9a', x + 4, top - 12, sw, 1); R(g, '#ff4f9a', x + 4, top - 3, sw, 1);
        for (let k = 0; k < sw - 4; k += 4) R(g, k % 8 ? '#4fe3ff' : '#ff4f9a', x + 6 + k, top - 9, 2, 4);
      }
      x += w + 6 + ((r() * 18) | 0);
    }
    // franja baja continua: casas, rejas y luces de calle
    for (let bx = 0; bx < 384; bx += 16 + ((r() * 10) | 0)) { const bh = 10 + ((r() * 10) | 0); R(g, '#211a40', bx, 112 - bh, 18, bh); R(g, '#2e2558', bx, 112 - bh, 18, 1); if (r() < 0.6) R(g, r() < 0.5 ? '#ffd36b' : '#ff7ab8', bx + 4 + ((r() * 10) | 0), 112 - bh + 4, 2, 2); }
    R(g, '#1a1434', 0, 104, 384, 8);
    for (let k = 0; k < 384; k += 5) R(g, '#2e2558', k, 101, 1, 3);
    return c;
  }
  function nearCanvas() {
    const { c, g } = mk(256, 80);
    R(g, '#1d1638', 0, 8, 256, 12); R(g, '#2b2250', 0, 8, 256, 2); R(g, '#140f28', 0, 19, 256, 1);
    for (let x = 0; x < 256; x += 8) { R(g, '#2b2250', x, 2, 1, 6); }
    R(g, '#2b2250', 0, 2, 256, 1);
    for (const px of [40, 168]) {
      R(g, '#1d1638', px, 20, 16, 60); R(g, '#2b2250', px, 20, 2, 60); R(g, '#140f28', px + 14, 20, 2, 60);
      poly(g, [[px - 10, 20], [px + 26, 20], [px + 16, 30], [px, 30]], '#1d1638');
    }
    for (let x = 4; x < 256; x += 32) { R(g, '#ff4f9a', x, 13, 3, 1); }
    return c;
  }
  function fireFrames() {
    return [0, 1, 2].map((f) => {
      const { c, g } = mk(14, 18);
      const r = rng32(90 + f);
      const h = [14, 16, 13][f];
      for (let y = 0; y < h; y++) {
        const t = y / h, w = Math.max(1, Math.round((1 - t) * 10 * (0.7 + r() * 0.5)));
        const x0 = 7 - (w >> 1) + Math.round(Math.sin(y * 0.9 + f * 2) * 1.2);
        R(g, t > 0.65 ? '#e8452c' : '#ff9a2e', x0, 17 - y, w, 1);
        if (t < 0.5 && w > 3) R(g, '#ffe066', x0 + 1, 17 - y, w - 2, 1);
        if (t < 0.25 && w > 5) R(g, '#fff7d0', x0 + 2, 17 - y, w - 4, 1);
      }
      return T(c);
    });
  }
  // escenario de primer plano (calle, vigas, edificios, autos) → canvas grande cortado en trozos
  function drawLevel() {
    const { c, g } = mk(END, 216);
    const r = rng32(77);
    // edificios (fachadas detrás del plano de juego)
    for (const [x0, x1, y, k] of LEDGES) {
      if (k !== 'roof') continue;
      R(g, '#3a3358', x0, y, x1 - x0, GY - y);
      R(g, '#4b4370', x0, y, 3, GY - y); R(g, '#29233f', x1 - 3, y, 3, GY - y);
      for (let wy = y + 12; wy < GY - 14; wy += 16) for (let wx = x0 + 10; wx < x1 - 14; wx += 14) {
        const p = r();
        const col = p < 0.35 ? '#ffd36b' : p < 0.5 ? '#7fe3ff' : '#1a1530';
        R(g, '#241d3e', wx - 1, wy - 1, 8, 10); R(g, col, wx, wy, 6, 8);
        if (col !== '#1a1530') { R(g, col === '#ffd36b' ? '#e8a84a' : '#3fb6d8', wx, wy + 4, 6, 4); R(g, '#ffffff', wx + 1, wy + 1, 1, 2); }
        else R(g, '#3a3158', wx + 4, wy + 1, 1, 3);
      }
      R(g, '#8c87a8', x0 - 2, y, x1 - x0 + 4, 5); R(g, '#c4bfdc', x0 - 2, y, x1 - x0 + 4, 1); R(g, '#5a5478', x0 - 2, y + 5, x1 - x0 + 4, 1);
      R(g, '#6e6888', x0 + 14, y - 8, 12, 8); R(g, '#9a95b5', x0 + 14, y - 8, 12, 1); R(g, '#3a3358', x0 + 17, y - 5, 6, 2);
      R(g, '#3a3358', x1 - 24, y - 16, 1, 16); R(g, '#ff3b5c', x1 - 24, y - 17);
      // letrero de neón
      const word = pick(['BAR', 'HOTEL', 'NEON', 'CAFE', '24H']);
      const sx = x0 + 12, sy = y + 18;
      R(g, '#120e24', sx - 3, sy - 3, word.length * 8 + 4, 15);
      g.save(); g.translate(sx, sy); g.scale(2, 2);
      for (let i = 0; i < word.length; i++) glyph(g, word[i], i * 4, 0, i % 2 ? '#4fe3ff' : '#ff4f9a');
      g.restore();
    }
    // calle
    for (const [x0, x1] of GROUND) {
      R(g, '#cfc9de', x0, GY, x1 - x0, 1);
      R(g, '#a8a2bc', x0, GY + 1, x1 - x0, 4);
      for (let x = x0 + 8; x < x1; x += 24) R(g, '#8c86a2', x, GY + 1, 1, 4);
      R(g, '#6e6888', x0, GY + 5, x1 - x0, 1);
      R(g, '#4a4462', x0, GY + 6, x1 - x0, 2);
      for (let y = GY + 8; y < 216; y += 4) {
        R(g, '#2c2340', x0, y, x1 - x0, 4);
        const off = ((y - GY) >> 2) & 1 ? 6 : 0;
        for (let x = x0 + off; x < x1; x += 12) {
          R(g, '#4a3a5c', x, y, Math.min(11, x1 - x), 3);
          R(g, '#574670', x, y, Math.min(11, x1 - x), 1);
        }
      }
      g.fillStyle = 'rgba(8,4,20,0.35)'; g.fillRect(x0, 204, x1 - x0, 12);
      for (const ex of [x0, x1 - 3]) { if (ex <= 0 || ex >= END - 3) continue; R(g, '#241c34', ex, GY, 3, 216 - GY); for (let k = 0; k < 6; k++) R(g, '#5a4f72', ex + ((r() * 3) | 0), GY + 3 + ((r() * 26) | 0)); }
      // farolas, hidrantes, barriles, sacos
      for (let x = x0 + 60; x < x1 - 30; x += 140 + ((r() * 90) | 0)) {
        if (LEDGES.some(([a, b, , k]) => k === 'roof' && x > a - 8 && x < b + 8)) continue;
        const p = r();
        if (p < 0.45) {
          R(g, '#2c2540', x, GY - 58, 2, 58); R(g, '#4a4166', x, GY - 58, 1, 58);
          R(g, '#2c2540', x, GY - 58, 12, 2); R(g, '#3a3358', x + 8, GY - 57, 6, 3); R(g, '#ffe9a8', x + 9, GY - 54, 4, 1);
          R(g, '#2c2540', x - 2, GY - 4, 6, 4);
          glows.push([x + 11, GY - 50]);
        } else if (p < 0.62) {
          R(g, '#c8323a', x, GY - 9, 6, 9); R(g, '#e85a5a', x, GY - 9, 2, 9); R(g, '#c8323a', x - 1, GY - 6, 8, 2); R(g, '#7a1a22', x + 1, GY - 11, 4, 2);
        } else if (p < 0.8) {
          for (let k = 0; k < 2; k++) {
            const bx = x + k * 11;
            R(g, '#a8452a', bx, GY - 14, 10, 14); R(g, '#d8663a', bx, GY - 14, 3, 14); R(g, '#6a2a1a', bx + 8, GY - 14, 2, 14);
            for (let s = 0; s < 10; s += 4) R(g, '#ffcc33', bx + s, GY - 9, 2, 3);
            R(g, '#3a1a12', bx, GY - 14, 10, 1);
          }
          if (r() < 0.5) fires.push([x + 5, GY - 14]);
        } else {
          for (let k = 0; k < 4; k++) { ellipse(g, x + k * 7 + 3, GY - 3, 4, 3, '#b8a57a'); ellipse(g, x + k * 7 + 2, GY - 4, 2, 1, '#d8c79a'); }
          for (let k = 0; k < 3; k++) { ellipse(g, x + k * 7 + 7, GY - 8, 4, 3, '#a8956a'); ellipse(g, x + k * 7 + 6, GY - 9, 2, 1, '#d8c79a'); }
        }
      }
    }
    // agua en los huecos
    for (let i = 0; i < GROUND.length - 1; i++) {
      const x0 = GROUND[i][1], x1 = GROUND[i + 1][0];
      R(g, '#162b55', x0, 202, x1 - x0, 14);
      for (let x = x0; x < x1; x += 6) R(g, '#3f6fb0', x + ((x >> 3) & 3), 203 + ((x >> 2) & 1) * 3, 3, 1);
    }
    // vigas, puentes y autos
    for (const [x0, x1, y, k] of LEDGES) {
      if (k === 'girder' || k === 'bridge') {
        const below = k === 'bridge' ? 204 : GY;
        for (const px of [x0 + 6, x1 - 8]) { R(g, '#2c3448', px, y + 12, 3, below - y - 12); R(g, '#3d4a66', px, y + 12, 1, below - y - 12); }
        R(g, '#7b93b8', x0, y, x1 - x0, 5); R(g, '#b3c8e8', x0, y, x1 - x0, 1); R(g, '#3d4a66', x0, y + 4, x1 - x0, 1);
        for (let x = x0 + 3; x < x1 - 2; x += 6) R(g, '#2c3650', x, y + 2);
        R(g, '#4a5878', x0, y + 11, x1 - x0, 2);
        for (let x = x0; x < x1 - 6; x += 12) { line(g, x, y + 5, x + 6, y + 11, '#3a4560', 1); line(g, x + 6, y + 11, x + 12, y + 5, '#3a4560', 1); }
      } else if (k === 'car') {
        const bx = x0;
        R(g, '#7a3a2f', bx + 2, y + 10, 52, 12); R(g, '#a8572f', bx + 2, y + 10, 52, 2); R(g, '#4a2420', bx + 2, y + 20, 52, 2);
        poly(g, [[bx + 12, y + 10], [bx + 18, y], [bx + 40, y], [bx + 46, y + 10]], '#6a3228');
        R(g, '#8a4434', bx + 18, y, 22, 1);
        poly(g, [[bx + 15, y + 9], [bx + 19, y + 2], [bx + 27, y + 2], [bx + 27, y + 9]], '#1b1424');
        poly(g, [[bx + 30, y + 2], [bx + 39, y + 2], [bx + 43, y + 9], [bx + 30, y + 9]], '#1b1424');
        R(g, '#9fd9ff', bx + 20, y + 3, 2, 1); R(g, '#9fd9ff', bx + 33, y + 4, 1, 2);
        for (let k2 = 0; k2 < 8; k2++) R(g, '#c8743a', bx + 4 + ((r() * 48) | 0), y + 12 + ((r() * 7) | 0));
        for (const wx of [bx + 12, bx + 44]) { disc(g, wx, y + 22, 5, '#1b1a24'); disc(g, wx, y + 22, 2.2, '#6a6880'); }
        R(g, '#1b1a24', bx, GY - 1, 56, 1);
        R(g, '#3a1a12', bx + 49, y + 12, 5, 3);
        fires.push([bx + 48, y + 8]);
      }
    }
    return c;
  }

  // ---------------- construcción
  function build() {
    if (built) return;
    built = true;
    A = {
      hero: CFX.hero(0, 0), grunt: buildGruntArt(), mach: buildMachineArt(), shot: buildShotArt(), boss: buildBossArt(),
      boom: explosionCanvases(23).map(T), fire: fireFrames(), glow: T(glowCanvas('255,190,110', 7)), aura: T(glowCanvas('255,226,90', 16)),
    };
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x180e3a);
    const mkLayer = (canvas, z, factor, top, rep = true) => {
      const t = T(canvas);
      if (rep) { t.wrapS = THREE.RepeatWrapping; }
      const mat = new THREE.MeshBasicMaterial({ map: t, transparent: false, alphaTest: 0.5 });
      const m = new THREE.Mesh(QUAD, mat);
      m.frustumCulled = false; m.position.z = z;
      scene.add(m);
      layers.push({ m, t, factor, top, h: canvas.height, w: canvas.width, rep });
    };
    mkLayer(skyCanvas(), -90, 0, 0);
    S.sun = new Spr(scene, T(sunCanvas()), -85);
    for (let i = 0; i < 2; i++) {
      const pivot = new THREE.Group(); pivot.position.z = -80; scene.add(pivot);
      const sp = new Spr(pivot, T(beamCanvas()), 0, { transparent: true, add: true });
      sp.m.position.y = 85;
      beams.push({ pivot, ph: i * 2.1, x: i ? 0.72 : 0.28 });
    }
    mkLayer(farCanvas(), -70, 0.1, 175 - 112);
    // fondo vivo: bombarderos, hongo, edificio que cae y el titán (entre el horizonte y la ciudad media)
    A.titan = [0, 1, 2, 3].map((f) => T(CFX.titan(f, false))); A.titanAtk = T(CFX.titan(1, true));
    A.mush = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => T(CFX.mushroom(k)));
    A.bomber = [T(CFX.bomber(true)), T(CFX.bomber(false))];
    A.gren = T(CFX.grenade()); A.scrap = [0, 1, 2].map((k) => T(CFX.scrap(k)));
    { const f = CFX.weaponFx(); A.fx = { tracer: T(f.tracer), tracerM: T(f.tracerM), pellet: T(f.pellet), beam: T(f.beam), fl: Object.fromEntries(Object.entries(f.fl).map(([k, v]) => [k, T(v)])) }; }
    BG = {
      titan: new Spr(scene, A.titan[0], -66, { transparent: true }).show(false),
      beam: new Spr(scene, T(CFX.beam()), -65.5, { transparent: true, add: true }).show(false),
      tower: new Spr(scene, T(CFX.tower(9)), -67, { transparent: true }).show(false),
      mush: new Spr(scene, A.mush[0], -68, { transparent: true }).scaleBy(2).show(false),
      ring: new Spr(scene, T(ringCanvas('#ffd8a8', 30)), -67.5, { transparent: true, add: true }).show(false),
      bombers: [0, 1, 2].map(() => new Spr(scene, A.bomber[0], -76).show(false)),
      tT: 6, tSt: 'wait', bT: 14, bSt: 'wait',
    };
    BG.titan.tint('#d8c4e8');
    bgParts = new Particles(scene, 260, -64);
    mkLayer(midCanvas(), -60, 0.3, 193 - 112);
    mkLayer(nearCanvas(), -50, 0.55, 196 - 80);
    const big = drawLevel();
    for (let i = 0; i < END / 512; i++) {
      const { c, g } = mk(512, 216);
      g.drawImage(big, -i * 512, 0);
      const s = new Spr(scene, T(c), 0);
      s.m.frustumCulled = true;
      s.at(i * 512 + 256, 108);
      chunks.push(s);
    }
    for (const [x, y] of glows) new Spr(scene, A.glow, 1, { transparent: true, add: true }).at(x, y);
    S.fireSprs = fires.map(([x, y], i) => ({ spr: new Spr(scene, A.fire[0], 2).at(x, y - 8), x, y, ph: i }));
    plats = GROUND.map(([x0, x1]) => ({ x0, x1, y: GY, ground: true })).concat(LEDGES.map(([x0, x1, y]) => ({ x0, x1, y, ground: false })));
    parts = new Particles(scene, 900, 30);
    player = { spr: new Spr(scene, A.hero.stand.fwd[0], 15), aura: new Spr(scene, A.aura, 14, { transparent: true, add: true }) };
    for (let i = 0; i < 26; i++) pbs.push({ spr: new Spr(scene, A.shot.pb, 20).show(false), on: false });
    for (let i = 0; i < 50; i++) ebs.push({ spr: new Spr(scene, A.shot.eb[0], 21).show(false), on: false });
    for (let i = 0; i < 18; i++) booms.push({ spr: new Spr(scene, A.boom[0], 35).show(false), on: false });
    for (let i = 0; i < 4; i++) grens.push({ spr: new Spr(scene, A.gren, 19).show(false), on: false });
    S.muzzle = new Spr(scene, A.fx.fl.R, 17, { transparent: true, add: true }).show(false);
    for (let i = 0; i < 4; i++) S.beams = (S.beams || []).concat([{ glow: new Spr(scene, A.fx.beam, 18, { transparent: true, add: true }).show(false), core: new Spr(scene, A.fx.beam, 18.5, { transparent: true, add: true }).show(false), t: 0, on: false }]);
    boss = { spr: new Spr(scene, A.boss.body[0], 12).show(false), rotor: new Spr(scene, A.boss.rotor[0], 13, { transparent: true }).show(false), on: false };
  }

  // ---------------- física de plataformas
  function landOn(x, y0, y1, skip) {
    let best = null;
    for (const p of plats) {
      if (p === skip || x < p.x0 - 3 || x > p.x1 + 3) continue;
      if (y0 <= p.y + 0.5 && y1 >= p.y && (!best || p.y < best.y)) best = p;
    }
    return best;
  }
  function supportAt(x, y) {
    for (const p of plats) if (x >= p.x0 - 3 && x <= p.x1 + 3 && Math.abs(p.y - y) < 1) return p;
    return null;
  }
  const hit = (a, b) => a[0] < b[0] + b[2] && a[0] + a[2] > b[0] && a[1] < b[1] + b[3] && a[1] + a[3] > b[1];

  // ---------------- inicio / reinicio
  function buildHud() {
    UI.setHud(`
      <div class="hrow">
        <div class="hcol"><span class="hlab">1P</span><div class="lives pinkl" id="cv"></div></div>
        <div class="hcol" style="align-items:center"><span class="hlab">PUNTOS</span><span class="hval" id="cs">000000</span></div>
        <div class="hcol" style="align-items:flex-end"><span class="hlab">REC</span><span class="hval cyan" id="ch">000000</span></div>
      </div>
      <div class="hbl" style="align-items:center"><span class="wpn" id="cw">N</span><span class="hlab" id="cwn">NORMAL</span><span class="abil" id="ca" hidden><i id="cai"></i><b id="cak">G</b></span><span class="hscrap" id="cr"><i class="bolt"></i><span id="crn">0</span></span></div>
      <div class="boss" id="cb" hidden><span class="hlab" style="color:var(--pink)">COLOSO-07</span><div class="bar"><i id="cbb" style="width:100%"></i></div></div>
      <div class="banner" id="cbn" hidden></div>`);
    hud = { v: UI.$('#cv'), s: UI.$('#cs'), h: UI.$('#ch'), w: UI.$('#cw'), wn: UI.$('#cwn'), b: UI.$('#cb'), bb: UI.$('#cbb'), bn: UI.$('#cbn'),
      a: UI.$('#ca'), ai: UI.$('#cai'), ak: UI.$('#cak'), r: UI.$('#crn') };
    hc = {};
  }
  function banner(t, sub) {
    if (!hud.bn) return;
    if (!t) { hud.bn.hidden = true; return; }
    hud.bn.hidden = false;
    hud.bn.innerHTML = `${t}${sub ? `<small>${sub}</small>` : ''}`;
  }
  function start() {
    Snd.bank('contra');
    build();
    const sv = Store.get('contra_sel', { c: 0, s: 0 });
    S.ci = clamp(sv.c | 0, 0, CFX.CHARS.length - 1); S.si = clamp(sv.s | 0, 0, CFX.SUITS.length - 1); S.row = 4;
    S.hi = Store.get('hi_contra', 0); S.camX = 0; S.t = 0;
    openBarracks();
  }
  function beginRun() {
    const C = CFX.CHARS[S.ci], up = upOf(S.ci);
    if (!suitOwned(S.si)) S.si = 0;
    Store.set('contra_sel', { c: S.ci, s: S.si });
    A.hero = CFX.hero(S.ci, S.si);
    Object.assign(S, { score: 0, lives: 3, loop: 0, hi: Store.get('hi_contra', 0), nextLife: 30000, baseW: C.w, wl: up.w, scrap: 0,
      ab: abOpen() ? { k: C.ab, lvl: up.a, cd: 0 } : null });
    document.body.classList.remove('inmenu');
    buildHud();
    UI.setButtons('SALTO', 'FUEGO');
    player.weapon = C.w;
    beginStage();
    if (Engine.touch && innerHeight > innerWidth) UI.toast('GIRA EL TELÉFONO PARA VER MÁS NIVEL');
    else if (S.ab) UI.toast(`${ABIL[S.ab.k].n.toUpperCase()} LISTA · ${Engine.touch ? 'BOTÓN H' : 'TECLA V'}`);
  }
  function retry() { beginRun(); }
  function action(act) { if (act === 'barracks') { bankScrap(); openBarracks(); } }
  function bankScrap() { if (S.scrap > 0) { Store.set('contra_scrap', Store.get('contra_scrap', 0) + S.scrap); S.scrap = 0; } }
  function beginStage() {
    for (const e of ents) e.spr && e.spr.remove();
    for (const e of ents) e.extra && e.extra.forEach((s) => s.remove());
    ents = [];
    for (const it of items) it.spr.remove();
    items = [];
    pbs.forEach((b) => { b.on = false; b.spr.show(false); });
    ebs.forEach((b) => { b.on = false; b.spr.show(false); });
    booms.forEach((b) => { b.on = false; b.spr.show(false); });
    parts.clear();
    boss.on = false; boss.spr.show(false); boss.rotor.show(false);
    grens.forEach((q) => { q.on = false; q.spr.show(false); });
    Object.assign(S, { camX: 0, spawnI: 0, runT: 2.5, state: 'play', t: 0, bossTrig: false, clearT: 0, introT: 2.4 });
    S.spawnList = SPAWNS.slice().sort((a, b) => a.x - b.x);
    spawnPlayer(40, true);
    player.weapon = player.weapon || S.baseW || 'N';
    banner(`MISIÓN ${S.loop + 1}`, 'CIUDAD NEÓN · AVANZA ▶');
    Snd.play(SONGS.contra);
  }
  function spawnPlayer(x, first) {
    const p = player;
    let sx = x;
    const g = plats.find((q) => q.ground && q.x1 > x + 10);
    if (g && sx < g.x0 + 10) sx = g.x0 + 16;
    Object.assign(p, { x: sx, y: first ? GY : -20, vx: 0, vy: 0, face: 1, ground: first, fell: false, plat: first ? supportAt(sx, GY) : null, jumping: false, prone: false, aim: 'fwd',
      anim: 0, inv: first ? 0 : 2.4, barrier: 0, dead: false, deadT: 0, dropT: 0, dropPlat: null, fireT: 0, weapon: S.baseW || 'N', dashT: 0, dashInv: 0 });
    p.spr.show(true);
  }

  // ---------------- disparos
  function firePlayer() {
    const p = player, W = wstat(p.weapon);
    const live = pbs.filter((b) => b.on).length;
    if (live + (W.spread ? W.spread.length : 1) > W.max + (W.spread ? 4 : 0)) return;
    const f = p.face;
    let dx, dy;
    switch (p.aim) {
      case 'up': dx = 0; dy = -1; break;
      case 'down': dx = 0; dy = 1; break;
      case 'dup': dx = f * 0.7071; dy = -0.7071; break;
      case 'ddown': dx = f * 0.7071; dy = 0.7071; break;
      default: dx = f; dy = 0;
    }
    let mx, my;
    if (p.jumping) { mx = p.x + dx * 10; my = p.y - 14 + dy * 10; }
    else if (!p.ground && p.aim === 'down') { mx = p.x; my = p.y - 4; }
    else { const m = MUZZLE[p.aim === 'down' ? 'ddown' : p.aim]; mx = p.x + m[0] * f; my = p.y + m[1]; }
    if (W.beam) { fireBeam(mx, my, dx, dy, W); shotFeel(p.weapon, mx, my, dx, dy); Snd.sfx(W.sfx); return; }
    const angs = W.spread || [0];
    for (const da of angs) {
      const b = pbs.find((q) => !q.on);
      if (!b) break;
      const ca = Math.cos(da), sa = Math.sin(da);
      const sp = W.speed * (p.weapon === 'E' ? rand(0.85, 1.12) : 1), vx = (dx * ca - dy * sa) * sp, vy = (dx * sa + dy * ca) * sp;
      Object.assign(b, { on: true, x: mx, y: my, bx: mx, by: my, vx, vy, t: 0, w: p.weapon, dmg: W.dmg, pierce: !!W.pierce, hits: W.pierce ? new Set() : null, dx, dy, life: W.life || 0 });
      let tex = A.fx.tracer, turn = true;
      if (p.weapon === 'M') tex = A.fx.tracerM;
      if (p.weapon === 'E') { tex = A.fx.pellet; turn = false; }
      if (p.weapon === 'S') { tex = A.shot.sp1; turn = false; }
      if (p.weapon === 'F') { tex = A.shot.fire[0]; turn = false; }
      b.spr.set(tex).show(true).rot(turn ? -Math.atan2(vy, vx) : 0).at(mx, my);
    }
    shotFeel(p.weapon, mx, my, dx, dy);
    Snd.sfx(W.sfx);
  }
  // fogonazo, temblor, retroceso, vainas que saltan y chispa en la boca del cañón
  function shotFeel(w, mx, my, dx, dy) {
    const p = player, F = FEEL[w] || FEEL.N;
    S.muzzle.set(A.fx.fl[w] || A.fx.fl.R).show(true).rot(-Math.atan2(dy, dx)).at(mx + dx * 4, my + dy * 4); S.muzzleT = 0.05;
    if (F.shake) shake(F.shake[0], F.shake[1]);
    if (F.kick && p.ground && !p.prone) p.x = clamp(p.x - p.face * F.kick, S.camX + 8, END - 8);
    if (F.casing) parts.emit(p.x + p.face * 2, p.y - 22, -p.face * rand(25, 55), rand(-140, -90), 0.7, F.casing === 2 ? 0xd83a2a : 0xe8b84a, F.casing === 2 ? 0x7a1a12 : 0x8a6a2a, F.casing === 2 ? 2 : 1, 1, 520);
    parts.emit(mx, my, dx * 20, dy * 20, 0.08, 0xffffff, F.spark, 3, 1);
  }
  // rayo instantáneo (láser): atraviesa todo lo que encuentra hasta el borde de la pantalla
  function rayBox(ox, oy, dx, dy, b) {
    let t0 = 0, t1 = 1e9;
    for (const [o, d, lo, hi] of [[ox, dx, b[0], b[0] + b[2]], [oy, dy, b[1], b[1] + b[3]]]) {
      if (Math.abs(d) < 1e-6) { if (o < lo || o > hi) return null; continue; }
      let a = (lo - o) / d, c = (hi - o) / d; if (a > c) [a, c] = [c, a];
      t0 = Math.max(t0, a); t1 = Math.min(t1, c); if (t0 > t1) return null;
    }
    return t0;
  }
  function fireBeam(mx, my, dx, dy, W) {
    const F = FEEL[player.weapon] || FEEL.V;
    let len = 1e9;
    if (dx > 0) len = Math.min(len, (S.camX + Engine.W + 8 - mx) / dx); else if (dx < 0) len = Math.min(len, (S.camX - 8 - mx) / dx);
    if (dy > 0) len = Math.min(len, (H + 8 - my) / dy); else if (dy < 0) len = Math.min(len, (-8 - my) / dy);
    let killed = false;
    for (const e of ents) {
      if (e.dead || (e.type === 'drone' && e.t < 0)) continue;
      const t = rayBox(mx, my, dx, dy, entBox(e));
      if (t === null || t > len) continue;
      e.hp -= W.dmg; e.flashT = 0.08; e.kx = (e.kx || 0) + Math.sign(dx || player.face) * F.knock;
      parts.burst(mx + dx * t, my + dy * t, 6, 90, 0.25, 0xffffff, F.spark, 2, 1);
      if (e.hp <= 0) { killEnt(e); killed = true; } else Snd.sfx(e.type === 'runner' || e.type === 'rifle' ? 'hit' : 'tink');
    }
    for (const m of ebs) if (m.on && m.kind === 'missile' && rayBox(mx, my, dx, dy, [m.x - 6, m.y - 4, 12, 8]) !== null) { m.on = false; m.spr.show(false); boomAt(m.x, m.y, true); Snd.sfx('explode'); addScore(50); }
    if (boss.on && boss.st === 'fight') { const t = rayBox(mx, my, dx, dy, bossBox()); if (t !== null && t < len) { damageBoss(W.dmg); parts.burst(mx + dx * t, my + dy * t, 6, 90, 0.25, 0xffffff, F.spark, 2, 1); } }
    if (killed && F.stop) S.hitstop = F.stop;
    const bm = S.beams.find((q) => !q.on) || S.beams[0];
    Object.assign(bm, { on: true, t: 0, w: W.beam, len, ang: -Math.atan2(dy, dx), cx: mx + dx * len / 2, cy: my + dy * len / 2 });
    bm.glow.tint(W.col).show(true); bm.core.show(true);
    placeBeam(bm, 1);
  }
  function placeBeam(bm, k) {
    for (const [s, w] of [[bm.glow, bm.w * 2.4 * k], [bm.core, Math.max(1, bm.w * 0.7 * k)]]) {
      s.m.scale.set(bm.len, w, 1); s.m.position.x = bm.cx; s.m.position.y = -bm.cy; s.m.rotation.z = bm.ang;
    }
  }
  function updateBeams(dt) {
    if (S.muzzleT > 0 && (S.muzzleT -= dt) <= 0) S.muzzle.show(false);
    for (const bm of S.beams) {
      if (!bm.on) continue;
      bm.t += dt;
      const k = 1 - bm.t / 0.14;
      if (k <= 0) { bm.on = false; bm.glow.show(false); bm.core.show(false); continue; }
      bm.glow.mat.opacity = k; bm.core.mat.opacity = Math.min(1, k * 1.6);
      placeBeam(bm, 0.6 + 0.4 * k);
    }
  }
  function enemyShot(x, y, vx, vy, kind = 'b') {
    const b = ebs.find((q) => !q.on);
    if (!b) return null;
    Object.assign(b, { on: true, x, y, vx, vy, t: 0, kind, hp: 1 });
    b.spr.set(kind === 'bomb' ? A.shot.bomb : kind === 'missile' ? A.shot.missile : A.shot.eb[0]).show(true).rot(0).at(x, y);
    return b;
  }
  function boomAt(x, y, small) {
    const b = booms.find((q) => !q.on);
    if (b) { b.on = true; b.t = 0; b.x = x; b.y = y; b.fps = small ? 26 : 18; b.spr.set(A.boom[0]).show(true).at(x, y); }
    parts.burst(x, y, small ? 8 : 16, small ? 90 : 140, 0.6, 0xffe066, 0xe8452c, 2, 1, 260, 1.5);
  }

  // ---------------- enemigos
  function spawnEnt(sp) {
    const W = Engine.W;
    if (sp.t === 'rifle') {
      ents.push({ type: 'rifle', x: sp.x, y: sp.y, hp: 2, face: -1, aim: 'fwd', fireT: rand(0.6, 1.4), burst: 0, burstT: 0, flashT: 0, spr: new Spr(scene, A.grunt.aim.fwd, 10) });
    } else if (sp.t === 'turret') {
      const e = { type: 'turret', x: sp.x, y: sp.y, hp: 10, dir: 8, turnT: 0, fireT: 1.2, flashT: 0, spr: new Spr(scene, A.mach.plate, 9).at(sp.x, sp.y) };
      e.barrel = new Spr(scene, A.mach.barrel[8], 9.5).at(sp.x, sp.y);
      e.cap = new Spr(scene, A.mach.cap, 9.8).at(sp.x, sp.y);
      e.extra = [e.barrel, e.cap];
      ents.push(e);
    } else if (sp.t === 'drones') {
      for (let i = 0; i < sp.n; i++) ents.push({ type: 'drone', x: S.camX + W + 20 + i * 34, y: 40 + i * 14, by: 40 + i * 14, hp: 2, t: -i * 0.4, st: 'cruise', diveT: rand(0.8, 1.8) + i * 0.3, flashT: 0, spr: new Spr(scene, A.mach.drone[0], 11) });
    } else if (sp.t === 'capsule') {
      ents.push({ type: 'capsule', x: S.camX - 20, y: 66, hp: 1, t: 0, w: sp.w, spr: new Spr(scene, A.mach.capsule[0], 11) });
    }
  }
  function spawnRunner() {
    const W = Engine.W, fromLeft = S.camX > 60 && Math.random() < 0.18;
    const x = fromLeft ? S.camX - 14 : S.camX + W + 14;
    // superficie: piso o plataforma más alta en esa x
    const cands = plats.filter((p) => x >= p.x0 && x <= p.x1);
    if (!cands.length) return;
    const p = cands[(Math.random() * cands.length) | 0];
    ents.push({ type: 'runner', x, y: p.y, vy: 0, face: fromLeft ? 1 : -1, ground: true, plat: p, hp: 1, t: Math.random(), spr: new Spr(scene, A.grunt.run[0], 10) });
  }
  function killEnt(e, cause) {
    e.dead = true;
    const pts = { runner: 100, rifle: 300, drone: 200, turret: 500, capsule: 100 }[e.type] || 100;
    addScore(pts);
    if (e.type === 'runner' || e.type === 'rifle') {
      Snd.sfx('hit');
      items.push({ corpse: true, x: e.x, y: e.y, vx: e.kx ? Math.sign(e.kx) * (50 + Math.min(170, Math.abs(e.kx))) : (e.face || -1) * -40, vy: e.kx && Math.abs(e.kx) > 120 ? -210 : -170, t: 0, spr: new Spr(scene, A.grunt.hurt, 10).setFlip(e.face < 0) });
      parts.burst(e.x, e.y - 14, 6, 60, 0.35, 0xffffff, 0xff4f9a, 1, 1);
    } else if (e.type === 'turret') {
      Snd.sfx('explode'); boomAt(e.x, e.y); boomAt(e.x + 6, e.y - 8, true); shake(3, 0.3);
      e.spr.set(A.mach.plateDead); e.barrel.show(false); e.cap.show(false);
      e.keepSpr = true;
    } else if (e.type === 'capsule') {
      Snd.sfx('explode'); boomAt(e.x, e.y, true);
      items.push({ medal: true, w: e.w, x: e.x, y: e.y, vx: 26, vy: -170, ground: false, t: 0, spr: new Spr(scene, A.mach.medal[e.w], 6) });
    } else { Snd.sfx('explode'); boomAt(e.x, e.y, true); }
    if (!e.keepSpr) { e.spr.remove(); e.extra && e.extra.forEach((s) => s.remove()); }
    dropScrap(e.x, e.y - 10, SCRAP[e.type] || 1);
  }
  function dropScrap(x, y, n) {
    for (let i = 0; i < n; i++) items.push({ scrap: true, x, y, vx: rand(-60, 60), vy: rand(-190, -110), t: 0, spr: new Spr(scene, A.scrap[(Math.random() * 3) | 0], 16) });
  }
  function entBox(e) {
    switch (e.type) {
      case 'runner': case 'rifle': return [e.x - 5, e.y - 27, 10, 27];
      case 'turret': return [e.x - 12, e.y - 12, 24, 24];
      case 'drone': return [e.x - 10, e.y - 6, 20, 12];
      case 'capsule': return [e.x - 11, e.y - 6, 22, 12];
    }
    return [0, 0, 0, 0];
  }
  function playerBox() {
    const p = player;
    if (p.prone) return [p.x - 4 + p.face * 4, p.y - 9, 16, 9];
    if (p.jumping) return [p.x - 7, p.y - 21, 14, 14];
    return [p.x - 4, p.y - 27, 8, 27];
  }
  const aimVec = (aim, f) => (aim === 'dup' ? [f * 0.7071, -0.7071] : aim === 'ddown' ? [f * 0.7071, 0.7071] : [f, 0]);
  function updateEnts(dt) {
    const p = player, W = Engine.W, diff = 1 + S.loop * 0.3;
    for (const e of ents) {
      if (e.dead) continue;
      e.t = (e.t || 0) + dt;
      if (e.flashT > 0) e.flashT -= dt;
      if (e.kx) { if (e.type !== 'turret' && e.type !== 'capsule') e.x += e.kx * dt; e.kx *= Math.pow(0.002, dt); if (Math.abs(e.kx) < 3) e.kx = 0; }
      const onScreen = e.x > S.camX - 10 && e.x < S.camX + W + 10;
      if (e.type === 'runner') {
        e.x += e.face * 74 * dt;
        if (e.ground) {
          if (!(e.x >= e.plat.x0 - 2 && e.x <= e.plat.x1 + 2)) {
            const s = supportAt(e.x, e.y);
            if (s) e.plat = s; else { e.ground = false; e.vy = Math.random() < 0.45 ? -230 : 0; }
          }
        } else {
          const y0 = e.y;
          e.vy = Math.min(e.vy + G * dt, MAXF); e.y += e.vy * dt;
          if (e.vy >= 0) { const l = landOn(e.x, y0, e.y, null); if (l) { e.y = l.y; e.ground = true; e.plat = l; e.vy = 0; } }
        }
        e.spr.set(e.ground ? A.grunt.run[Math.floor(e.t * 12) % 6] : A.grunt.fall).setFlip(e.face < 0).anchor(e.x, e.y, ANCHOR[0], ANCHOR[1]);
        if (e.y > H + 40 || e.x < S.camX - 60 || e.x > S.camX + W + 80) { e.dead = true; e.spr.remove(); }
      } else if (e.type === 'rifle') {
        const dx = p.x - e.x, dy = (p.y - 14) - (e.y - 20);
        e.face = dx < 0 ? -1 : 1;
        e.aim = dy < -30 && Math.abs(dy) > Math.abs(dx) * 0.4 ? 'dup' : dy > 28 && Math.abs(dy) > Math.abs(dx) * 0.4 ? 'ddown' : 'fwd';
        if (onScreen && !p.dead) {
          e.fireT -= dt * diff;
          if (e.fireT <= 0 && e.burst <= 0) { e.burst = 1 + ((Math.random() * (2 + S.loop)) | 0); e.burstT = 0; e.fireT = rand(1.5, 2.4); }
          if (e.burst > 0 && (e.burstT -= dt) <= 0) {
            e.burst--; e.burstT = 0.2;
            const m = MUZZLE[e.aim], [vx, vy] = aimVec(e.aim, e.face);
            enemyShot(e.x + m[0] * e.face, e.y + m[1], vx * 115 * diff, vy * 115 * diff);
            Snd.sfx('eshot');
          }
        }
        e.spr.set(e.flashT > 0 ? A.grunt.aimW[e.aim] : A.grunt.aim[e.aim]).setFlip(e.face < 0).anchor(e.x, e.y, ANCHOR[0], ANCHOR[1]);
        if (e.x < S.camX - 60) { e.dead = true; e.spr.remove(); }
      } else if (e.type === 'turret') {
        const want = (Math.round((Math.atan2(p.y - 16 - e.y, p.x - e.x) / (Math.PI / 8))) + 16) % 16;
        if ((e.turnT -= dt) <= 0 && want !== e.dir) { const d = (want - e.dir + 16) % 16; e.dir = (e.dir + (d < 8 ? 1 : 15)) % 16; e.turnT = 0.11; }
        if (onScreen && !p.dead) {
          e.fireT -= dt * diff;
          if (e.fireT <= 0 && Math.abs(((want - e.dir + 24) % 16) - 8) >= 7) {
            e.fireT = 1.5;
            const a = (e.dir * Math.PI) / 8;
            enemyShot(e.x + Math.cos(a) * 15, e.y + Math.sin(a) * 15, Math.cos(a) * 110 * diff, Math.sin(a) * 110 * diff);
            Snd.sfx('eshot');
          }
        }
        e.barrel.set(A.mach.barrel[e.dir]).at(e.x, e.y);
        e.cap.set(e.flashT > 0 ? A.mach.capW : A.mach.cap);
        if (e.x < S.camX - 60) { e.dead = true; e.spr.remove(); e.extra.forEach((s) => s.remove()); }
      } else if (e.type === 'drone') {
        if (e.t < 0) { e.spr.show(false); continue; }
        e.spr.show(true);
        if (e.st === 'cruise') {
          e.x -= 52 * dt; e.y = e.by + Math.sin(e.t * 3.2) * 12;
          if (e.t > e.diveT && e.x < S.camX + W - 20) {
            e.st = 'dive'; const a = Math.atan2(p.y - 18 - e.y, p.x - e.x); e.vx = Math.cos(a) * 125 * diff; e.vy = Math.sin(a) * 125 * diff; e.diveT = e.t;
            enemyShot(e.x, e.y + 4, Math.cos(a) * 120, Math.sin(a) * 120); Snd.sfx('eshot');
          }
        } else if (e.st === 'dive') {
          e.x += e.vx * dt; e.y += e.vy * dt;
          if (e.t - e.diveT > 0.75 || e.y > GY - 26) { e.st = 'leave'; e.vy = -110; e.vx = -60; }
        } else { e.x += e.vx * dt; e.y += e.vy * dt; }
        e.spr.set(e.flashT > 0 ? A.mach.droneW : A.mach.drone[Math.floor(e.t * 20) & 1]).at(e.x, e.y);
        if (e.y < -30 || e.x < S.camX - 40) { e.dead = true; e.spr.remove(); }
      } else if (e.type === 'capsule') {
        e.x += (S.camX > 0 ? 70 : 64) * dt + (S.camDX || 0);
        e.y = 66 + Math.sin(e.t * 2.4) * 20;
        e.spr.set(A.mach.capsule[Math.floor(e.t * 8) & 1]).at(e.x, e.y);
        if (e.x > S.camX + W + 30) { e.dead = true; e.spr.remove(); }
      }
      // contacto con el jugador
      if (!e.dead && e.type !== 'capsule' && e.type !== 'turret' && !p.dead && hit(entBox(e), playerBox())) hurtPlayer();
    }
    ents = ents.filter((e) => !e.dead || e.keepSpr);
  }

  // ---------------- jefe
  function startBoss() {
    S.bossTrig = true;
    const W = Engine.W;
    Object.assign(boss, { on: true, st: 'enter', hp: 150 + S.loop * 60, max: 150 + S.loop * 60, x: S.camX + W + 90, y: 60, t: 0, pt: 1.2, pat: 0, flashT: 0, tx: S.camX + W * 0.66, phase: 1, dyT: 0, smokeT: 0 });
    boss.spr.show(true); boss.rotor.show(true);
    hud.b.hidden = false;
    Snd.play(SONGS.boss); Snd.sfx('alarm');
    banner('¡ALERTA!', 'HELICÓPTERO COLOSO-07');
    S.alertT = 2;
  }
  function updateBoss(dt) {
    const b = boss, p = player, W = Engine.W;
    if (!b.on) return;
    b.t += dt;
    if (b.flashT > 0) b.flashT -= dt;
    const L = S.camX + 60, Rr = S.camX + W - 60;
    if (b.st === 'enter') {
      b.x += (b.tx - b.x) * Math.min(1, dt * 1.6);
      if (Math.abs(b.x - b.tx) < 2) { b.st = 'fight'; b.pt = 0.8; }
    } else if (b.st === 'fight') {
      b.y = 58 + Math.sin(b.t * 1.7) * 7;
      b.x += (b.tx - b.x) * Math.min(1, dt * (b.pat === 1 ? 1.1 : 2));
      if (b.phase === 1 && b.hp < b.max * 0.5) { b.phase = 2; Snd.sfx('alarm'); UI.toast('¡EL COLOSO ESTÁ DAÑADO!'); }
      if (b.phase === 2 && (b.smokeT -= dt) <= 0) { b.smokeT = 0.05; parts.emit(b.x + 20 + rand(-6, 6), b.y - 14, rand(20, 40), rand(-30, -10), 1.1, 0x5a4a6a, 0x221a30, 2, 4, 0, 0.5); }
      b.pt -= dt;
      const sp = b.phase === 2 ? 1.35 : 1;
      if (b.pt <= 0) {
        const pats = b.phase === 2 ? [0, 1, 2, 3] : [0, 1, 2];
        b.pat = pats[(pats.indexOf(b.pat) + 1) % pats.length];
        b.k = 0; b.kt = 0;
        if (b.pat === 1) b.tx = b.x > (L + Rr) / 2 ? L + 30 : Rr - 10;
        b.pt = (b.pat === 1 ? 2.4 : 2.0) / sp;
      }
      b.kt -= dt;
      if (b.kt <= 0) {
        const gx = b.x + A.boss.gun[0], gy = b.y + A.boss.gun[1];
        if (b.pat === 0 && b.k < 3) {
          const a = Math.atan2(p.y - 14 - gy, p.x - gx);
          for (const da of [-0.17, 0, 0.17]) enemyShot(gx, gy, Math.cos(a + da) * 125 * sp, Math.sin(a + da) * 125 * sp);
          Snd.sfx('eshot'); b.k++; b.kt = 0.3 / sp;
        } else if (b.pat === 1 && b.k < 6) {
          const pod = A.boss.pods[b.k % 2];
          enemyShot(b.x + pod[0], b.y + pod[1], 0, 40, 'bomb'); b.k++; b.kt = 0.32 / sp;
        } else if (b.pat === 2 && b.k < (b.phase === 2 ? 3 : 2)) {
          const pod = A.boss.pods[b.k % 2];
          const m = enemyShot(b.x + pod[0], b.y + pod[1], 40, -130, 'missile');
          if (m) { m.hp = 1; m.ang = -Math.PI / 2; }
          Snd.sfx('missile'); b.k++; b.kt = 0.45;
        } else if (b.pat === 3 && b.k < 2) {
          for (let i = -3; i <= 3; i++) { const a = Math.PI / 2 + i * 0.28; enemyShot(gx + 10, gy, Math.cos(a) * 110, Math.sin(a) * 110); }
          Snd.sfx('spread'); b.k++; b.kt = 0.5;
        }
      }
    } else if (b.st === 'dying') {
      b.dyT += dt;
      b.x += Math.sin(b.t * 40) * 0.6;
      if ((b.boomT = (b.boomT || 0) - dt) <= 0) { b.boomT = 0.11; boomAt(b.x + rand(-46, 28), b.y + rand(-16, 12), Math.random() < 0.5); Snd.sfx('explode'); shake(3, 0.2); }
      if (b.dyT > 2.2) { b.y += (b.dyT - 2.2) * 160 * dt; b.spr.rot(-(b.dyT - 2.2) * 0.4); }
      if (b.dyT > 3.2) {
        b.on = false; b.spr.show(false); b.rotor.show(false); b.spr.rot(0);
        for (let i = 0; i < 6; i++) boomAt(b.x + rand(-40, 30), b.y + rand(-20, 10));
        Snd.sfx('boom'); flash(0.9, [1, 0.85, 0.6]); shake(6, 0.8);
        hud.b.hidden = true;
        S.state = 'clear'; S.clearT = 0;
      }
    }
    if (b.on) {
      const body = b.flashT > 0 ? A.boss.bodyW : (b.phase === 2 ? A.boss.bodyHurt : A.boss.body)[Math.floor(b.t * 16) & 1];
      b.spr.set(body).at(b.x, b.y);
      b.rotor.set(A.boss.rotor[[0, 1, 2, 1][Math.floor(b.t * 30) % 4]]).at(b.x - 2, b.y - 27);
      if (b.st === 'fight' && !p.dead && hit(bossBox(), playerBox())) hurtPlayer();
    }
  }
  const bossBox = () => [boss.x - 48, boss.y - 14, 74, 26];
  function damageBoss(n) {
    if (boss.st !== 'fight') return;
    boss.hp -= n; boss.flashT = 0.05;
    if (boss.hp <= 0) { boss.st = 'dying'; boss.dyT = 0; addScore(20000); Snd.sfx('boom'); flash(0.4); dropScrap(boss.x || S.camX + Engine.W * 0.7, 90, 30); }
  }

  // ---------------- jugador
  function hurtPlayer() {
    const p = player;
    if (p.dead || p.inv > 0 || p.barrier > 0 || p.dashInv > 0 || S.state !== 'play') return;
    p.dead = true; p.deadT = 0; p.vx = -p.face * 55; p.vy = -230; p.ground = false; p.jumping = false; p.prone = false;
    Snd.sfx('die'); shake(3, 0.25); flash(0.3, [1, 0.3, 0.4]); UI.vibrate(80);
    parts.burst(p.x, p.y - 16, 14, 100, 0.5, 0xffffff, 0xff4f9a, 2, 1, 200, 1);
  }
  function updatePlayer(dt) {
    const p = player, I = Input.held, W = Engine.W;
    if (p.dead) {
      p.deadT += dt;
      p.aura.show(false);
      if (p.fell) p.spr.show(false);
      else if (!p.ground) {
        const y0 = p.y;
        p.vy = Math.min(p.vy + G * dt, MAXF); p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.vy > 0) { const l = landOn(p.x, y0, p.y, null); if (l) { p.y = l.y; p.ground = true; } }
      }
      if (!p.fell) p.spr.set(p.ground ? A.hero.dead : A.hero.hurt).setFlip(p.face < 0).anchor(p.x, p.y, ANCHOR[0], ANCHOR[1]).show(p.deadT < 1.2 || Math.floor(p.deadT * 12) % 2 === 0);
      if (p.deadT > 1.7) {
        S.lives--;
        if (S.lives <= 0) { gameOver(); return; }
        spawnPlayer(S.camX + 40, false);
      }
      return;
    }
    let mx = (I.right ? 1 : 0) - (I.left ? 1 : 0);
    if (p.ground) { p.prone = I.down && mx === 0; if (p.prone) mx = 0; }
    if (mx) p.face = mx;
    if (Input.pressed.a && p.ground) {
      if (I.down && p.plat && !p.plat.ground) { p.dropPlat = p.plat; p.dropT = 0.3; p.ground = false; p.vy = 30; p.jumping = false; }
      else { p.vy = JV; p.ground = false; p.jumping = true; Snd.sfx('jump'); }
      p.prone = false;
    }
    if (p.ground) p.aim = p.prone ? 'prone' : I.up ? (mx ? 'dup' : 'up') : I.down && mx ? 'ddown' : 'fwd';
    else p.aim = I.up ? (mx ? 'dup' : 'up') : I.down ? (mx ? 'ddown' : 'down') : 'fwd';
    p.vx = mx * RUN;
    if (p.dashInv > 0) p.dashInv -= dt;
    if (p.dashT > 0) { p.dashT -= dt; p.vx = p.dashV; p.vy = Math.min(p.vy, 0); dashTrail(); }
    const y0 = p.y;
    if (!p.ground && !(p.dashT > 0)) p.vy = Math.min(p.vy + G * dt, MAXF);
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.x = clamp(p.x, S.camX + 8, Math.min(END - 8, S.camX + W - 8));
    if (p.dropT > 0) p.dropT -= dt;
    if (!p.ground && p.vy >= 0) {
      const l = landOn(p.x, y0, p.y, p.dropT > 0 ? p.dropPlat : null);
      if (l) { p.y = l.y; p.vy = 0; p.ground = true; p.jumping = false; p.plat = l; if (y0 < l.y - 6) parts.burst(p.x, p.y, 5, 30, 0.3, 0xd8d2e8, 0x6e6888, 1, 1, 0, 3); }
    }
    if (p.ground && p.plat && !(p.x >= p.plat.x0 - 3 && p.x <= p.plat.x1 + 3)) {
      const s = supportAt(p.x, p.y);
      if (s) p.plat = s; else { p.ground = false; p.vy = 0; p.jumping = false; }
    }
    if (p.y > H + 30) {
      p.dead = true; p.fell = true; p.deadT = 0.3; p.vx = 0; p.vy = 0; p.spr.show(false); p.aura.show(false);
      Snd.sfx('die'); shake(2, 0.2); UI.vibrate(80);
      return;
    }
    p.fireT -= dt;
    if (I.b && p.fireT <= 0) { firePlayer(); p.fireT = wstat(p.weapon).rate; }
    useAbility(dt);
    if (p.inv > 0) p.inv -= dt;
    if (p.barrier > 0) p.barrier -= dt;
    // animación
    p.anim += dt;
    let tex;
    if (p.jumping) tex = A.hero.ball[Math.floor(p.anim * 16) % 4];
    else if (!p.ground) tex = A.hero.air[p.aim === 'down' ? 'ddown' : p.aim === 'prone' ? 'fwd' : p.aim];
    else if (p.prone) tex = A.hero.prone;
    else if (mx) tex = A.hero.run[p.aim === 'up' ? 'dup' : p.aim][Math.floor(p.anim * 11) % 6];
    else tex = A.hero.stand[p.aim === 'up' ? 'up' : 'fwd'][Math.floor(p.anim * 3) % 3];
    p.spr.set(tex).setFlip(p.face < 0);
    if (p.jumping) p.spr.at(p.x, p.y - 14); else p.spr.anchor(p.x, p.y, ANCHOR[0], ANCHOR[1]);
    p.spr.show(!(p.inv > 0 && Math.floor(p.inv * 14) % 2 === 0));
    p.aura.show(p.barrier > 0).at(p.x, p.y - 14);
    if (p.barrier > 0) p.aura.mat.opacity = 0.5 + Math.sin(p.anim * 20) * 0.4;
    // recoger medallas
    for (const it of items) {
      if (!it.medal || it.dead) continue;
      if (hit([it.x - 10, it.y - 17, 20, 18], playerBox())) {
        it.dead = true; it.spr.remove();
        Snd.sfx('powerup'); addScore(100);
        if (it.w === 'B') { p.barrier = 12; UI.toast('BARRERA · INVENCIBLE 12 s'); }
        else { p.weapon = it.w; UI.toast({ M: 'AMETRALLADORA', S: 'DISPERSIÓN ×5', L: 'LÁSER PERFORANTE', F: 'FUEGO EN ESPIRAL' }[it.w]); }
        parts.burst(p.x, p.y - 16, 16, 90, 0.5, 0xffe066, 0xff4f9a, 2, 1);
      }
    }
  }

  // ---------------- proyectiles
  function updateShots(dt) {
    const W = Engine.W, p = player;
    for (const b of pbs) {
      if (!b.on) continue;
      b.t += dt;
      if (b.w === 'F') {
        b.bx += b.vx * dt; b.by += b.vy * dt;
        const ph = b.t * 15, r = 7, px = -b.dy, py = b.dx;
        b.x = b.bx + (Math.cos(ph) - 1) * r * b.dx * 0.6 + Math.sin(ph) * r * px;
        b.y = b.by + (Math.cos(ph) - 1) * r * b.dy * 0.6 + Math.sin(ph) * r * py;
        b.spr.set(A.shot.fire[Math.floor(b.t * 18) & 1]);
      } else { b.x += b.vx * dt; b.y += b.vy * dt; }
      if (b.w === 'S' && b.t > 0.12) b.spr.set(A.shot.sp2);
      if (b.life && b.t > b.life) { b.on = false; b.spr.show(false); parts.emit(b.x, b.y, 0, 0, 0.1, 0xffe066, 0xff8a1e, 2, 1); continue; }
      b.spr.at(b.x, b.y);
      if (b.x < S.camX - 16 || b.x > S.camX + W + 16 || b.y < -16 || b.y > H + 16) { b.on = false; b.spr.show(false); continue; }
      const bb = b.w === 'L' || b.w === 'V' ? [b.x - 7, b.y - 7, 14, 14] : [b.x - 3, b.y - 3, 6, 6];
      let used = false;
      for (const e of ents) {
        if (e.dead || (b.hits && b.hits.has(e))) continue;
        if (e.type === 'drone' && e.t < 0) continue;
        if (!hit(bb, entBox(e))) continue;
        const F = FEEL[b.w] || FEEL.N;
        e.hp -= b.dmg; e.flashT = 0.06; e.kx = (e.kx || 0) + Math.sign(b.vx || 1) * F.knock;
        parts.burst(b.x, b.y, 5, 80, 0.22, 0xffffff, F.spark, 1, 1);
        if (e.hp <= 0) { killEnt(e); if (F.stop) S.hitstop = F.stop; } else Snd.sfx(e.type === 'runner' || e.type === 'rifle' ? 'hit' : 'tink');
        if (b.pierce) b.hits.add(e); else { used = true; break; }
      }
      if (!used) for (const m of ebs) {
        if (!m.on || m.kind !== 'missile') continue;
        if (hit(bb, [m.x - 6, m.y - 4, 12, 8])) { m.on = false; m.spr.show(false); boomAt(m.x, m.y, true); Snd.sfx('explode'); addScore(50); if (!b.pierce) { used = true; break; } }
      }
      if (!used && boss.on && boss.st === 'fight' && hit(bb, bossBox())) {
        if (!(b.hits && b.hits.has(boss))) {
          damageBoss(b.dmg);
          parts.burst(b.x, b.y, 4, 80, 0.2, 0xffffff, 0xff9a2e, 1, 1);
          Snd.sfx('tink');
          if (b.pierce) b.hits.add(boss); else used = true;
        }
      }
      if (used) { b.on = false; b.spr.show(false); }
    }
    for (const b of ebs) {
      if (!b.on) continue;
      b.t += dt;
      if (b.kind === 'bomb') {
        b.vy = Math.min(b.vy + 500 * dt, 300); b.x += b.vx * dt; b.y += b.vy * dt;
        const s = landOn(b.x, b.y - b.vy * dt, b.y, null);
        if (s) {
          b.on = false; b.spr.show(false); boomAt(b.x, s.y - 10); Snd.sfx('explode'); shake(2, 0.15);
          for (const dx of [-8, 8]) { const f = enemyShot(b.x + dx, s.y - 6, dx * 9, -60); if (f) f.kind = 'spark'; }
          if (!player.dead && Math.abs(player.x - b.x) < 18 && Math.abs(player.y - s.y) < 20) hurtPlayer();
          continue;
        }
        b.spr.at(b.x, b.y);
      } else if (b.kind === 'missile') {
        if (b.t > 0.45) {
          const want = Math.atan2(p.y - 16 - b.y, p.x - b.x);
          let d = want - b.ang;
          while (d > Math.PI) d -= Math.PI * 2;
          while (d < -Math.PI) d += Math.PI * 2;
          b.ang += clamp(d, -2.4 * dt, 2.4 * dt);
          const sp = Math.min(150, 60 + b.t * 90);
          b.vx = Math.cos(b.ang) * sp; b.vy = Math.sin(b.ang) * sp;
        } else { b.vy += 260 * dt; b.ang = Math.atan2(b.vy, b.vx); }
        b.x += b.vx * dt; b.y += b.vy * dt;
        b.spr.at(b.x, b.y).rot(-b.ang);
        if (Math.random() < 0.8) parts.emit(b.x - Math.cos(b.ang) * 7, b.y - Math.sin(b.ang) * 7, rand(-10, 10), rand(-10, 10), 0.35, 0xffe066, 0x5a4a6a, 2, 1);
        if (b.t > 4 || b.y > GY - 2) { b.on = false; b.spr.show(false); boomAt(b.x, b.y, true); Snd.sfx('explode'); continue; }
      } else {
        if (b.kind === 'spark') b.vy += 300 * dt;
        b.x += b.vx * dt; b.y += b.vy * dt;
        b.spr.set(A.shot.eb[Math.floor(b.t * 12) & 1]).at(b.x, b.y);
      }
      if (b.x < S.camX - 20 || b.x > S.camX + W + 20 || b.y < -30 || b.y > H + 10) { b.on = false; b.spr.show(false); continue; }
      if (!player.dead && hit([b.x - 2, b.y - 2, 4, 4], playerBox())) {
        if (player.barrier > 0) { b.on = false; b.spr.show(false); parts.burst(b.x, b.y, 5, 60, 0.25, 0xffe066, 0xffffff, 1, 1); }
        else if (player.inv <= 0 && !(player.dashInv > 0)) { b.on = false; b.spr.show(false); hurtPlayer(); }
      }
    }
  }
  function updateItems(dt) {
    for (const it of items) {
      if (it.dead) continue;
      it.t += dt;
      if (it.corpse) {
        it.vy += G * dt; it.x += it.vx * dt; it.y += it.vy * dt;
        it.spr.anchor(it.x, it.y, ANCHOR[0], ANCHOR[1]).show(Math.floor(it.t * 16) % 2 === 0);
        if (it.t > 0.55) { it.dead = true; it.spr.remove(); parts.burst(it.x, it.y - 14, 8, 50, 0.4, 0xff4f9a, 0x3a1a3a, 2, 1); }
      } else if (it.scrap) {
        const p = player;
        if (it.t < 0.35 || p.dead) { it.vy += 600 * dt; it.x += it.vx * dt; it.y += it.vy * dt; const l = it.vy > 0 && landOn(it.x, it.y - it.vy * dt, it.y, null); if (l) { it.y = l.y - 3; it.vy = -it.vy * 0.4; it.vx *= 0.6; } }
        else { const dx = p.x - it.x, dy = p.y - 16 - it.y, d = Math.hypot(dx, dy) || 1, sp = 120 + it.t * 260; it.x += (dx / d) * sp * dt; it.y += (dy / d) * sp * dt;
          if (d < 9) { it.dead = true; it.spr.remove(); S.scrap = (S.scrap || 0) + 1; Snd.sfx('chink', { rate: 1 + Math.min(S.scrap % 12, 11) * 0.02 }); continue; } }
        if (it.t > 6 || it.y > H + 20) { it.dead = true; it.spr.remove(); continue; }
        it.spr.at(it.x, it.y);
      } else if (it.medal) {
        if (!it.ground) {
          const y0 = it.y;
          it.vy = Math.min(it.vy + 520 * dt, 260); it.x += it.vx * dt; it.y += it.vy * dt;
          if (it.vy > 0) { const l = landOn(it.x, y0, it.y, null); if (l) { it.y = l.y - 1; if (it.vy > 120) it.vy = -it.vy * 0.35; else { it.ground = true; it.vx = 0; } } }
          if (it.y > H + 20) { it.dead = true; it.spr.remove(); continue; }
        }
        it.spr.at(it.x, it.y - 8 + (it.ground ? Math.round(Math.sin(it.t * 5)) : 0));
        if (it.x < S.camX - 30) { it.dead = true; it.spr.remove(); }
      }
    }
    items = items.filter((it) => !it.dead);
    for (const b of booms) {
      if (!b.on) continue;
      b.t += dt;
      const f = Math.floor(b.t * b.fps);
      if (f >= A.boom.length) { b.on = false; b.spr.show(false); } else b.spr.set(A.boom[f]).at(b.x, b.y - f * 0.6);
    }
  }


  // ---------------- habilidades: granada, barrera e impulso (se abren al cumplir la misión 1)
  function useAbility(dt) {
    const ab = S.ab, p = player;
    if (!ab) return;
    if (ab.cd > 0) ab.cd -= dt;
    if (!Input.pressed.c || ab.cd > 0 || p.dead) return;
    const L = ABIL[ab.k], lv = clamp(ab.lvl, 1, 3);
    ab.cd = L.cd[lv - 1];
    if (ab.k === 'gren') {
      const up = Input.held.up;
      throwGrenade(p.face * (up ? 70 : 140), up ? -300 : -210);
      if (lv >= 3) throwGrenade(p.face * (up ? 120 : 200), up ? -260 : -170);
      Snd.sfx('throw');
    } else if (ab.k === 'wall') {
      p.barrier = Math.max(p.barrier, L.dur[lv - 1]);
      Snd.sfx('barrier'); parts.burst(p.x, p.y - 16, 14, 80, 0.4, 0xffe27a, 0xffffff, 2, 1);
    } else if (ab.k === 'dash') {
      p.dashT = 0.17; p.dashV = p.face * 430; p.dashInv = 0.42; p.dashHit = new Set();
      Snd.sfx('dash');
    }
  }
  function dashTrail() {
    const p = player;
    parts.emit(p.x - p.face * 6, p.y - 16 + rand(-8, 8), -p.face * 30, 0, 0.25, 0x9ff3ff, 0x1f8aa8, 3, 1);
    if (S.ab && S.ab.lvl >= 3) for (const e of ents) {
      if (e.dead || p.dashHit.has(e) || e.type === 'capsule') continue;
      if (!hit(entBox(e), playerBox())) continue;
      p.dashHit.add(e); e.hp -= 3; e.flashT = 0.06; if (e.hp <= 0) killEnt(e); else Snd.sfx('tink');
    }
  }
  function throwGrenade(vx, vy) {
    const q = grens.find((o) => !o.on), p = player;
    if (!q) return;
    Object.assign(q, { on: true, x: p.x + p.face * 6, y: p.y - 26, vx, vy, t: 0 });
    q.spr.show(true).at(q.x, q.y);
  }
  function grenBoom(x, y) {
    const lv = S.ab ? S.ab.lvl : 1, R2 = lv >= 2 ? 36 : 30;
    boomAt(x, y); boomAt(x - 10, y + 2, true); boomAt(x + 10, y + 2, true);
    Snd.sfx('gboom'); shake(3, 0.25); UI.vibrate(40);
    for (const e of ents) {
      if (e.dead || e.type === 'capsule') continue;
      const bx = entBox(e), cx = bx[0] + bx[2] / 2, cy = bx[1] + bx[3] / 2;
      if (Math.hypot(cx - x, cy - y) < R2 + bx[2] / 2) { e.hp -= 6; e.flashT = 0.08; if (e.hp <= 0) killEnt(e); }
    }
    for (const m of ebs) if (m.on && (m.kind === 'missile' || m.kind === 'bomb') && Math.hypot(m.x - x, m.y - y) < R2 + 6) { m.on = false; m.spr.show(false); }
    if (boss.on && boss.st === 'fight') { const b = bossBox(); if (x > b[0] - R2 && x < b[0] + b[2] + R2 && y > b[1] - R2 && y < b[1] + b[3] + R2) damageBoss(6); }
  }
  function updateGrens(dt) {
    for (const q of grens) {
      if (!q.on) continue;
      q.t += dt;
      const y0 = q.y;
      q.vy = Math.min(q.vy + 620 * dt, 380); q.x += q.vx * dt; q.y += q.vy * dt;
      q.spr.at(q.x, q.y).rot(q.t * 14 * Math.sign(q.vx || 1));
      let pop = q.t > 2.2 || q.y > H + 10;
      if (!pop && q.vy > 0 && landOn(q.x, y0, q.y, null)) pop = true;
      if (!pop) for (const e of ents) if (!e.dead && e.type !== 'capsule' && hit([q.x - 3, q.y - 3, 6, 6], entBox(e))) { pop = true; break; }
      if (!pop && boss.on && boss.st === 'fight' && hit([q.x - 3, q.y - 3, 6, 6], bossBox())) pop = true;
      if (pop) { q.on = false; q.spr.show(false); if (q.y < H + 5) grenBoom(q.x, q.y - 4); }
    }
  }

  // ---------------- cuartel: elegir personaje, mejorar arma y habilidad, cambiar traje
  const UPC = { w: [150, 400], a: [200, 500] };   // costo para subir a nivel 2 y a nivel 3
  const free = () => Store.get('contra_free', true);
  const upOf = (ci) => Object.assign({ w: 1, a: 1 }, Store.get('contra_up', {})[CFX.CHARS[ci].id] || {});
  const setUp = (ci, k, v) => { const u = Store.get('contra_up', {}), id = CFX.CHARS[ci].id; u[id] = Object.assign(upOf(ci), { [k]: v }); Store.set('contra_up', u); };
  const suitOwned = (si) => si === 0 || free() || !!Store.get('contra_suits', {})[CFX.SUITS[si].id];
  const abOpen = () => free() || Store.get('contra_clear', false);
  const pipsH = (lv) => `<i class="pips" aria-label="Nivel ${lv} de 3">${[1, 2, 3].map((k) => `<b class="${k <= lv ? 'on' : ''}"></b>`).join('')}</i>`;
  const boltH = (n) => `<span class="cq-cost"><i class="bolt"></i>${fmtN(n)}</span>`;
  function openBarracks() {
    S.state = 'select';
    for (const e of ents) { e.spr && e.spr.remove(); e.extra && e.extra.forEach((x) => x.remove()); }
    ents = []; items.forEach((it) => it.spr.remove()); items = [];
    pbs.forEach((b) => { b.on = false; b.spr.show(false); }); ebs.forEach((b) => { b.on = false; b.spr.show(false); });
    grens.forEach((q) => { q.on = false; q.spr.show(false); });
    boss.on = false; boss.spr.show(false); boss.rotor.show(false);
    player.spr.show(false); player.aura.show(false);
    S.camX = 0;
    document.body.classList.add('inmenu');
    UI.setButtons('ELEGIR', 'MENÚ');
    Snd.play(SONGS.contra);
    renderBarracks();
  }
  function renderBarracks() {
    const ci = S.ci, si = S.si, C = CFX.CHARS[ci], up = upOf(ci), bank = Store.get('contra_scrap', 0), su = CFX.SUITS[si];
    const fr = free(), abOk = abOpen();
    const wBtn = up.w >= 3 && !fr ? '<span class="cq-max">Al máximo</span>' : `<button class="cq-up" data-up="w">${fr ? `Probar nivel ${up.w % 3 + 1}` : `Mejorar ${boltH(UPC.w[up.w - 1])}`}</button>`;
    const aBtn = !abOk ? '<span class="cq-max">Se abre al cumplir la misión 1</span>'
      : up.a >= 3 && !fr ? '<span class="cq-max">Al máximo</span>' : `<button class="cq-up" data-up="a">${fr ? `Probar nivel ${up.a % 3 + 1}` : `Mejorar ${boltH(UPC.a[up.a - 1])}`}</button>`;
    const sBtn = suitOwned(si) ? '' : `<button class="cq-up" data-up="s">Comprar ${boltH(su.price)}</button>`;
    const desc = [`${C.role}. ${C.n} empieza con ${C.wn.toLowerCase()} y su habilidad es ${C.abn.toLowerCase()}.`, C.wd, abOk ? C.abd : 'La habilidad se gana al cumplir la misión 1 por primera vez.', suitOwned(si) ? `Traje ${su.n.toLowerCase()}.` : 'Este traje se compra una vez y sirve para los tres.', 'Tu personaje, tu arma y tu traje van contigo.'][S.row];
    UI.setHud(`
      <div class="hud-ui cuartel" id="cq">
        <div class="cq-top"><b class="cq-title">Cuartel</b>
          <span class="cq-bank" aria-label="Chatarra"><i class="bolt"></i>${fmtN(bank)}</span>
          <button class="cq-chip${fr ? ' on' : ''}" id="cqfree" aria-pressed="${fr}">${fr ? 'Prueba: todo abierto' : 'Modo prueba'}</button></div>
        <div class="cq-lockers" data-row="0" role="radiogroup" aria-label="Personaje">
          ${CFX.CHARS.map((c, i) => `<button class="locker${i === ci ? ' on' : ''}" data-ci="${i}" role="radio" aria-checked="${i === ci}"><span class="tag">${c.n}</span><img src="${CFX.portrait(i, i === ci ? si : 0)}" alt="${c.n}"><small>${c.role}</small></button>`).join('')}
        </div>
        <div class="cq-panel">
          <div class="cq-row" data-row="1"><span class="cq-k">Arma</span><b>${C.wn}</b>${pipsH(up.w)}${wBtn}</div>
          <div class="cq-row${abOk ? '' : ' off'}" data-row="2"><span class="cq-k">Habilidad</span><b>${C.abn}</b>${abOk ? pipsH(up.a) : '<i class="pips"></i>'}${aBtn}</div>
          <div class="cq-row" data-row="3"><span class="cq-k">Traje</span><span class="cq-suit"><button class="cq-arr" data-sd="-1" aria-label="Traje anterior">◀</button><b>${su.n}</b><button class="cq-arr" data-sd="1" aria-label="Traje siguiente">▶</button></span>${sBtn}</div>
          <p class="cq-desc">${desc}</p>
          <button class="cq-go" data-row="4">A la misión</button>
        </div>
      </div>`);
    const root = UI.$('#cq');
    root.querySelectorAll('[data-row]').forEach((el) => el.classList.toggle('sel', +el.dataset.row === S.row));
    root.querySelectorAll('.locker').forEach((b) => b.addEventListener('click', () => { Snd.unlock(); S.row = 0; pickChar(+b.dataset.ci); }));
    root.querySelectorAll('.cq-up').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); Snd.unlock(); S.row = { w: 1, a: 2, s: 3 }[b.dataset.up]; buyUp(b.dataset.up); }));
    root.querySelectorAll('.cq-arr').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); S.row = 3; cycleSuit(+b.dataset.sd); }));
    root.querySelectorAll('.cq-row').forEach((b) => b.addEventListener('click', () => { S.row = +b.dataset.row; Snd.sfx('move'); renderBarracks(); }));
    UI.$('.cq-go').addEventListener('click', () => { Snd.unlock(); goMission(); });
    UI.$('#cqfree').addEventListener('click', () => { Store.set('contra_free', !free()); Snd.sfx('select'); renderBarracks(); });
  }
  function pickChar(i) { S.ci = (i + CFX.CHARS.length) % CFX.CHARS.length; if (!suitOwned(S.si)) S.si = 0; Snd.sfx('move'); renderBarracks(); }
  function cycleSuit(d) { S.si = (S.si + d + CFX.SUITS.length) % CFX.SUITS.length; Snd.sfx('move'); renderBarracks(); }
  function buyUp(k) {
    const up = upOf(S.ci), fr = free();
    if (k === 's') {
      const su = CFX.SUITS[S.si];
      if (suitOwned(S.si)) return;
      const bank = Store.get('contra_scrap', 0);
      if (bank < su.price) { Snd.sfx('deny'); UI.toast(`TE FALTAN ${su.price - bank} DE CHATARRA`); return; }
      Store.set('contra_scrap', bank - su.price); const o = Store.get('contra_suits', {}); o[su.id] = true; Store.set('contra_suits', o);
      Snd.sfx('buy'); renderBarracks(); return;
    }
    if (k === 'a' && !abOpen()) { Snd.sfx('deny'); UI.toast('SE ABRE AL CUMPLIR LA MISIÓN 1'); return; }
    const lv = up[k];
    if (fr) { setUp(S.ci, k, lv % 3 + 1); Snd.sfx('select'); renderBarracks(); return; }
    if (lv >= 3) return;
    const cost = UPC[k][lv - 1], bank = Store.get('contra_scrap', 0);
    if (bank < cost) { Snd.sfx('deny'); UI.toast(`TE FALTAN ${cost - bank} DE CHATARRA`); return; }
    Store.set('contra_scrap', bank - cost); setUp(S.ci, k, lv + 1);
    Snd.sfx('buy'); renderBarracks();
  }
  function goMission() {
    if (!suitOwned(S.si)) { Snd.sfx('deny'); UI.toast('ESE TRAJE AÚN NO ES TUYO'); return; }
    Snd.sfx('start'); beginRun();
  }
  function updateBarracks(dt) {
    if (Input.pressed.up) { S.row = (S.row + 4) % 5; Snd.sfx('move'); renderBarracks(); }
    else if (Input.pressed.down) { S.row = (S.row + 1) % 5; Snd.sfx('move'); renderBarracks(); }
    else if (Input.pressed.left || Input.pressed.right) {
      const d = Input.pressed.left ? -1 : 1;
      if (S.row === 0 || S.row === 4) pickChar(S.ci + d); else if (S.row === 3) cycleSuit(d);
    } else if (Input.pressed.a || Input.pressed.start) {
      if (S.row === 1) buyUp('w'); else if (S.row === 2) buyUp('a'); else if (S.row === 3 && !suitOwned(S.si)) buyUp('s');
      else if (S.row === 0) { S.row = 4; Snd.sfx('move'); renderBarracks(); } else goMission();
    } else if (Input.pressed.b) toMenu();
  }

  // ---------------- fondo vivo: el titán derriba un edificio y se pierde en la niebla; bombardeos a lo lejos
  function updateBg(dt) {
    const B = BG;
    // titán
    if (B.tSt === 'wait') B.tT -= dt;
    if (B.tSt === 'wait' && B.tT <= 0) {
      const pz = S.camX * 0.15;
      Object.assign(B, { tSt: 'walk', tx: pz + Engine.W + 90, ta: 0, tf: 0, tT: 0, towerX: pz + Engine.W * rand(0.12, 0.3), towerY: 0, towerDown: false });
      B.tower.show(true).rot(0); B.titan.show(true); B.titan.mat.opacity = 0;
      Snd.sfx('stomp');
    }
    if (B.tSt !== 'wait') {
      B.tT += dt;
      if (B.tSt === 'walk') {
        B.tx -= 9 * dt; B.ta = Math.min(1, B.ta + dt * 0.5);
        if (Math.floor(B.tT * 1.6) !== B.tf) { B.tf = Math.floor(B.tT * 1.6); if (B.tf % 2 === 0) { Snd.sfx('stomp'); if (S.state === 'play') shake(0.8, 0.12); } }
        if (B.tx < B.towerX + 150) { B.tSt = 'aim'; B.tT = 0; }
      } else if (B.tSt === 'aim') {
        if (B.tT > 0.8 && !B.fired) { B.fired = true; Snd.sfx('beam'); }
        if (B.tT > 2.2) { B.tSt = 'fall'; B.tT = 0; B.fired = false; Snd.sfx('collapse'); }
      } else if (B.tSt === 'fall') {
        B.towerY = Math.min(70, B.tT * B.tT * 18);
        const twx = S.camX + B.towerX - S.camX * 0.15;
        for (let k = 0; k < 3; k++) bgParts.emit(twx + rand(-18, 18), 128 + rand(-6, 6), rand(-14, 14), rand(-16, -4), rand(1.4, 2.4), 0x8a6a8e, 0x3a2a52, 3, 6, -2, 0.4);
        if (Math.random() < dt * 12) bgParts.emit(twx + rand(-10, 10), 140 - B.towerY * 0.2, 0, rand(-20, -8), 0.6, 0xffb347, 0xe8452c, 2, 1);
        if (B.tT > 2.6) { B.tSt = 'leave'; B.tT = 0; B.tower.show(false); }
      } else if (B.tSt === 'leave') {
        B.tx -= 7 * dt; B.ta = Math.max(0, 1 - B.tT / 5);
        if (Math.floor(B.tT * 1.4) !== B.tf) { B.tf = Math.floor(B.tT * 1.4); }
        if (B.tT > 5) { B.tSt = 'wait'; B.tT = rand(30, 45); B.titan.show(false); }
      }
    }
    // bombardeo
    if (B.bSt === 'wait') B.bT -= dt;
    if (B.bSt === 'wait' && B.bT <= 0) { Object.assign(B, { bSt: 'fly', bx: Engine.W + 20, bT: 0, mx: Engine.W * rand(0.15, 0.85) }); B.bombers.forEach((b) => b.show(true)); Snd.sfx('drone'); }
    if (B.bSt === 'fly') {
      B.bT += dt; B.bx -= 70 * dt;
      if (B.bx < B.mx && !B.dropped) { B.dropped = true; B.boomT = 1.1; }
      if (B.bx < -80) { B.bombers.forEach((b) => b.show(false)); B.bSt = 'wait'; B.bT = rand(18, 28); B.dropped = false; }
    }
    if (B.boomT > 0 && (B.boomT -= dt) <= 0) {
      B.mT = 0.001; B.mush.show(true); B.ring.show(true);
      Engine.flash = Math.max(Engine.flash, 0.35); Engine.flashCol = [1, 0.8, 0.55];
      Snd.sfx('farboom'); B.shakeT = 0.6;
    }
    if (B.shakeT > 0 && (B.shakeT -= dt) <= 0 && S.state === 'play') shake(2.5, 0.35);
    if (B.mT > 0) { B.mT += dt; if (B.mT > 7) { B.mT = 0; B.mush.show(false); } }
    bgParts.update(dt);
  }
  function renderBg(cx) {
    const B = BG, W = Engine.W, px = cx * 0.15;
    if (B.tSt !== 'wait') {
      const tx = cx + B.tx - px, twx = cx + B.towerX - px;
      const atk = B.tSt === 'aim' && B.tT > 0.5;
      B.titan.set(atk ? A.titanAtk : A.titan[B.tf % 4]).at(Math.round(tx), 108);
      B.titan.mat.opacity = B.ta * 0.92;
      const fire = B.tSt === 'aim' && B.tT > 0.8 && B.tT < 2.2;
      B.beam.show(fire);
      if (fire) { const gx = tx - 67, len = Math.max(10, gx - twx); B.beam.m.scale.set(-len, 9 * (0.7 + 0.3 * Math.sin(B.tT * 40)), 1); B.beam.m.position.set(Math.round(gx - len / 2), -83, -65.5); }
      if (B.tower.m.visible) B.tower.at(Math.round(twx), 112 + B.towerY).rot(B.towerY * 0.004);
    }
    if (B.bSt === 'fly') B.bombers.forEach((b, i) => b.set(A.bomber[Math.floor(performance.now() / 300 + i) % 2]).at(Math.round(cx + B.bx + i * 22), 26 + (i % 2) * 7));
    if (B.mT > 0) {
      const k = Math.min(7, Math.floor(B.mT * 1.8));
      B.mush.set(A.mush[k]).at(Math.round(cx + B.mx), 82);
      B.mush.mat.opacity = B.mT < 5 ? 1 : Math.max(0, 1 - (B.mT - 5) / 2);
      const rr = Math.min(1, B.mT / 1.2);
      B.ring.m.scale.set(64 * (0.3 + rr * 2.4), 20 * (0.3 + rr * 2.4), 1); B.ring.m.position.set(cx + B.mx, -172, -67.5);
      B.ring.mat.opacity = Math.max(0, 0.8 - rr * 0.8); B.ring.show(rr < 1);
    }
    bgParts.sync();
  }

  // ---------------- ciclo principal
  function addScore(n) {
    S.score += n;
    if (S.score >= S.nextLife) { S.nextLife += 50000; S.lives = Math.min(S.lives + 1, 9); Snd.sfx('oneup'); UI.toast('¡VIDA EXTRA!'); }
  }
  function update(dt) {
    S.t += dt;
    const W = Engine.W, p = player;
    updateBg(dt);
    if (S.state === 'select') { updateBarracks(dt); for (const f of S.fireSprs) f.spr.set(A.fire[Math.floor(S.t * 10 + f.ph) % 3]); parts.update(dt); return; }
    if (S.introT > 0 && (S.introT -= dt) <= 0) banner(null);
    if (S.alertT > 0 && (S.alertT -= dt) <= 0) banner(null);
    if (S.state === 'play') {
      if (S.hitstop > 0) { S.hitstop -= dt; return; }
      updateBeams(dt);
      updatePlayer(dt);
      if (S.state !== 'play') return;
      const prevCam = S.camX;
      if (!p.dead) S.camX = clamp(Math.max(S.camX, p.x - W * 0.42), 0, END - W);
      S.camDX = S.camX - prevCam;
      while (S.spawnI < S.spawnList.length && S.spawnList[S.spawnI].x <= S.camX + W + 16) spawnEnt(S.spawnList[S.spawnI++]);
      if (!S.bossTrig) {
        S.runT -= dt;
        if (S.runT <= 0) { spawnRunner(); S.runT = rand(1.3, 2.7) / (1 + S.loop * 0.35); }
        if (S.camX >= END - W - 0.5) startBoss();
      }
      updateEnts(dt);
      updateBoss(dt);
      updateShots(dt);
      updateGrens(dt);
    } else if (S.state === 'clear') {
      S.clearT += dt;
      updateBoss(dt);
      if (S.clearT > 0.8 && !S.clearShown) {
        S.clearShown = true;
        Snd.stop(); Snd.sfx('clear');
        const bonus = 10000 + S.lives * 2000;
        addScore(bonus);
        S.scrap = (S.scrap || 0) + 20; bankScrap();
        if (!Store.get('contra_clear', false)) { Store.set('contra_clear', true); if (!S.ab) { const C = CFX.CHARS[S.ci]; S.ab = { k: C.ab, lvl: upOf(S.ci).a, cd: 0 }; } UI.toast(`¡HABILIDAD ABIERTA: ${ABIL[S.ab.k].n.toUpperCase()}!`); }
        banner('¡MISIÓN CUMPLIDA!', `BONO +${bonus}`);
      }
      if (S.clearT > 4.5) { S.clearShown = false; S.loop++; const w = p.weapon; beginStage(); p.weapon = w; }
    }
    updateItems(dt);
    for (const f of S.fireSprs) f.spr.set(A.fire[Math.floor(S.t * 10 + f.ph) % 3]);
    if (Math.random() < dt * 6) parts.emit(S.camX + rand(0, W), H + 2, rand(-8, 8), rand(-38, -16), rand(2, 4), 0xffb347, 0x6a2a4a, 1, 1, -4, 0.2);
    parts.update(dt);
  }
  function render() {
    const W = Engine.W, cx = S.camX;
    for (const L of layers) {
      L.m.scale.set(W, L.h, 1);
      L.m.position.set(cx + W / 2, -(L.top + L.h / 2), L.m.position.z);
      if (L.rep) { L.t.repeat.x = W / L.w; L.t.offset.x = (Math.round(cx * L.factor) % L.w) / L.w; }
    }
    S.sun.at(cx + W * 0.64 - cx * 0.02, 100);
    const t = performance.now() / 1000;
    beams.forEach((b) => { b.pivot.position.set(Math.round(cx + W * b.x - cx * 0.04), -176, -80); b.pivot.rotation.z = Math.sin(t * 0.5 + b.ph) * 0.45; });
    renderBg(cx);
    parts.sync();
    setCam(cx, 0);
    renderScene(scene);
    if (S.state !== 'select') drawHud();
  }
  function drawHud() {
    const set = (k, v, fn) => { if (hc[k] !== v) { hc[k] = v; fn(v); } };
    set('s', S.score, (v) => (hud.s.textContent = pad6(v)));
    set('h', Math.max(S.hi, S.score), (v) => (hud.h.textContent = pad6(v)));
    set('v', S.lives, (v) => (hud.v.innerHTML = '<b></b>'.repeat(Math.max(0, v - 1))));
    set('w', player.weapon, (v) => { hud.w.textContent = v; hud.w.style.background = WCOL[v]; hud.wn.textContent = WNAME[v]; });
    set('r', S.scrap || 0, (v) => (hud.r.textContent = v));
    if (S.ab) {
      set('ak', S.ab.k, (v) => { hud.a.hidden = false; hud.ak.textContent = ABIL[v].k; });
      const L = ABIL[S.ab.k], frac = S.ab.cd > 0 ? 1 - S.ab.cd / L.cd[clamp(S.ab.lvl, 1, 3) - 1] : 1;
      set('af', Math.round(frac * 20), (v) => { hud.ai.style.height = v * 5 + '%'; hud.a.classList.toggle('ready', v >= 20); });
    }
    if (boss.on) set('b', Math.max(0, Math.round((boss.hp / boss.max) * 100)), (v) => (hud.bb.style.width = v + '%'));
  }
  function gameOver() {
    S.state = 'over';
    const rec = S.score > S.hi;
    if (rec) Store.set('hi_contra', S.score);
    banner(null); hud.b.hidden = true;
    Snd.stop(); Snd.sfx('gameover');
    const got = S.scrap || 0; bankScrap();
    UI.gameOver('NEÓN COMMANDO', S.score, rec, [['Misión', S.loop + 1], ['Avance', Math.min(100, Math.round((S.camX / (END - Engine.W)) * 100)) + '%'], ['Chatarra', '+' + got]],
      [['retry', 'REINTENTAR'], ['barracks', 'CUARTEL'], ['menu', 'MENÚ']]);
  }
  function exit() { if (S.state !== 'over' && S.score > (S.hi || 0)) Store.set('hi_contra', S.score); bankScrap(); Snd.bank('arcade'); document.body.classList.remove('inmenu'); }
  function warp(x) { player.x = x; player.y = -10; player.ground = false; S.camX = clamp(x - 100, 0, END - Engine.W); S.spawnI = S.spawnList.findIndex((q) => q.x > S.camX + Engine.W); if (S.spawnI < 0) S.spawnI = S.spawnList.length; }
  return { start, update, render, exit, warp, retry, action, capturesStart: () => S.state === 'select',
    peek: () => ({ S, player, ents, boss, BG, grens }), dbgGo: () => beginRun(), get art() { build(); return A; } };
})();

