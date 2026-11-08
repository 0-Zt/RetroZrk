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
  const GROUND1 = [[0, 600], [644, 1250], [1296, 1760], [1880, 2500], [2544, 3200], [3244, END]];
  const LEDGES1 = [
    [260, 380, 136, 'girder'], [760, 920, 128, 'roof'], [1000, 1056, 160, 'car'], [1380, 1500, 140, 'girder'], [1520, 1640, 100, 'girder'],
    [1784, 1856, 164, 'bridge'], [1900, 1960, 150, 'girder'], [1960, 2120, 112, 'roof'], [2250, 2306, 160, 'car'], [2620, 2740, 136, 'girder'],
    [2900, 2956, 160, 'car'], [2980, 3140, 128, 'roof'], [3420, 3540, 140, 'girder'],
  ];
  const SPAWNS1 = [
    { x: 300, t: 'capsule', w: 'M' }, { x: 340, t: 'rifle', y: 136 }, { x: 560, t: 'rifle', y: GY },
    { x: 840, t: 'turret', y: 156 }, { x: 880, t: 'rifle', y: 128 }, { x: 1200, t: 'capsule', w: 'S' },
    { x: 1150, t: 'rifle', y: GY }, { x: 1450, t: 'rifle', y: 140 }, { x: 1470, t: 'drones', n: 3 }, { x: 1590, t: 'rifle', y: 100 },
    { x: 1700, t: 'turret', y: 150 }, { x: 2000, t: 'capsule', w: 'L' }, { x: 2040, t: 'turret', y: 140 }, { x: 2080, t: 'rifle', y: 112 },
    { x: 2380, t: 'rifle', y: GY }, { x: 2650, t: 'capsule', w: 'F' }, { x: 2700, t: 'rifle', y: 136 }, { x: 2720, t: 'drones', n: 3 },
    { x: 3060, t: 'turret', y: 156 }, { x: 3100, t: 'rifle', y: 128 }, { x: 3150, t: 'capsule', w: 'B' }, { x: 3360, t: 'drones', n: 4 },
    { x: 3480, t: 'rifle', y: 140 }, { x: 3560, t: 'capsule', w: 'S' },
    { x: 1380, t: 'dogs', n: 2 }, { x: 1650, t: 'capsule', w: 'P' }, { x: 2560, t: 'dogs', n: 2 }, { x: 3260, t: 'dogs', n: 3 },
  ];
  // nivel 2: la fundición. Huecos con metal fundido, pasarelas, contenedores, cintas y prensas
  const GROUND2 = [[0, 520], [580, 1100], [1160, 1700], [1820, 2400], [2460, 3000], [3080, END]];
  const LEDGES2 = [
    [200, 320, 140, 'catwalk'], [420, 470, 158, 'crate'], [640, 760, 120, 'catwalk'], [860, 980, 140, 'catwalk'], [1020, 1070, 158, 'crate'],
    [1240, 1400, 130, 'catwalk'], [1480, 1530, 158, 'crate'], [1560, 1660, 110, 'catwalk'], [1690, 1830, 150, 'bridge2'],
    [1950, 2100, 128, 'catwalk'], [2200, 2250, 158, 'crate'], [2300, 2380, 140, 'catwalk'], [2560, 2700, 120, 'catwalk'],
    [2780, 2830, 158, 'crate'], [2880, 2980, 138, 'catwalk'], [3200, 3330, 132, 'catwalk'], [3420, 3540, 140, 'catwalk'],
  ];
  const SPAWNS2 = [
    { x: 250, t: 'rifle', y: 140 }, { x: 330, t: 'capsule', w: 'M' }, { x: 480, t: 'dogs', n: 2 }, { x: 700, t: 'rifle', y: 120 },
    { x: 900, t: 'turret', y: 160 }, { x: 930, t: 'rifle', y: 140 }, { x: 1150, t: 'capsule', w: 'S' }, { x: 1300, t: 'rifle', y: 130 },
    { x: 1330, t: 'drones', n: 3 }, { x: 1600, t: 'rifle', y: 110 }, { x: 1650, t: 'capsule', w: 'P' }, { x: 1760, t: 'drones', n: 3 },
    { x: 2000, t: 'rifle', y: 128 }, { x: 2050, t: 'turret', y: 160 }, { x: 2150, t: 'dogs', n: 3 }, { x: 2340, t: 'rifle', y: 140 },
    { x: 2400, t: 'capsule', w: 'L' }, { x: 2600, t: 'rifle', y: 120 }, { x: 2640, t: 'drones', n: 4 }, { x: 2900, t: 'rifle', y: 138 },
    { x: 2950, t: 'capsule', w: 'F' }, { x: 3120, t: 'dogs', n: 3 }, { x: 3250, t: 'rifle', y: 132 }, { x: 3300, t: 'turret', y: 160 },
    { x: 3480, t: 'rifle', y: 140 }, { x: 3500, t: 'capsule', w: 'B' },
  ];
  const LEVELS = [
    { name: 'CIUDAD NEÓN', theme: 'city', ground: GROUND1, ledges: LEDGES1, spawns: SPAWNS1, tank: { x: 700, end: 1192 }, walls: [936, 1128], mb: 2060, raid: 2560,
      vents: [1216, 1238, 1668, 1724, 3290, 3330, 3600], pulse: [3480, 140], belts: [], presses: [] },
    { name: 'LA FUNDICIÓN', theme: 'foundry', ground: GROUND2, ledges: LEDGES2, spawns: SPAWNS2, tank: null, walls: [], mb: null, raid: null,
      vents: [1200, 1900, 3140], pulse: [3480, 140], belts: [[600, 820, -1], [1180, 1380, 1], [2480, 2720, -1], [3100, 3300, 1]], presses: [800, 1440, 2150, 2740, 3370] },
  ];
  let GROUND = GROUND1, LEDGES = LEDGES1, SPAWNS = SPAWNS1, LV = LEVELS[0];
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


  // escenario del nivel 2: piso de planchas de acero, metal fundido en los huecos, pasarelas y contenedores
  function drawFoundry() {
    const { c, g } = mk(END, 216);
    const r = rng32(91);
    // soportes de las prensas (arriba)
    for (const x of LV.presses) { R(g, '#2a2228', x - 20, 0, 40, 34); R(g, '#3e343c', x - 20, 0, 40, 2); R(g, '#16121a', x - 20, 32, 40, 2); for (let k = 0; k < 4; k++) R(g, '#ffd23f', x - 18 + k * 10, 26, 5, 3); R(g, '#ff3b3b', x + 14, 6, 2, 2); }
    for (const [x0, x1] of GROUND) {
      R(g, '#d8c8b8', x0, GY, x1 - x0, 1); R(g, '#8a7a78', x0, GY + 1, x1 - x0, 5);
      for (let x = x0; x < x1; x += 32) { R(g, '#6a5a5a', x, GY + 1, 1, 5); R(g, '#b0a0a0', x + 3, GY + 3); R(g, '#b0a0a0', x + 28, GY + 3); }
      R(g, '#4a3a3e', x0, GY + 6, x1 - x0, 2);
      for (let y = GY + 8; y < 216; y += 6) { R(g, y % 12 ? '#2a1e24' : '#24181e', x0, y, x1 - x0, 6); for (let x = x0 + ((y >> 1) % 20); x < x1; x += 22) R(g, '#3a2a30', x, y + 1, 10, 1); }
      // tubos bajo el piso
      R(g, '#3e2c34', x0, 198, x1 - x0, 4); R(g, '#5a4048', x0, 198, x1 - x0, 1);
      // bordes con franja de peligro
      for (const ex of [x0, x1 - 6]) { if (ex <= 0 || ex >= END - 6) continue; for (let y = GY; y < 216; y += 4) R(g, (y >> 2) % 2 ? '#ffd23f' : '#16181c', ex, y, 6, 4); }
      // decoración: barriles tóxicos, carretes de cable, lámparas
      for (let x = x0 + 50; x < x1 - 40; x += 120 + ((r() * 80) | 0)) {
        if (LEDGES.some(([a, b]) => x > a - 10 && x < b + 10) || LV.presses.some((px) => Math.abs(px - x) < 30) || LV.vents.some((v) => Math.abs(v - x) < 16)) continue;
        const p = r();
        if (p < 0.4) { R(g, '#c8a828', x, GY - 14, 10, 14); R(g, '#e8c848', x, GY - 14, 3, 14); R(g, '#7a6418', x + 8, GY - 14, 2, 14); R(g, '#16181c', x + 3, GY - 9, 4, 4); R(g, '#c8a828', x + 4, GY - 8, 2, 2); }
        else if (p < 0.65) { disc(g, x + 6, GY - 7, 7, '#5a3a2a'); disc(g, x + 6, GY - 7, 5, '#2a1a12'); disc(g, x + 6, GY - 7, 2, '#8a6a4a'); }
        else { R(g, '#2a2228', x, GY - 52, 2, 52); R(g, '#2a2228', x - 4, GY - 52, 10, 3); R(g, '#ffe0a8', x - 2, GY - 49, 6, 1); glows.push([x + 1, GY - 44]); }
      }
    }
    // metal fundido en los huecos (brilla y burbujea)
    for (let i = 0; i < GROUND.length - 1; i++) {
      const x0 = GROUND[i][1], x1 = GROUND[i + 1][0];
      R(g, '#ff6a1a', x0, 196, x1 - x0, 20); R(g, '#ffb03a', x0, 196, x1 - x0, 3); R(g, '#c8320c', x0, 206, x1 - x0, 10);
      for (let x = x0; x < x1; x += 7) { R(g, '#fff0a0', x + ((x >> 2) & 3), 197, 2, 1); if (r() < 0.4) R(g, '#7a1a08', x, 202 + ((r() * 8) | 0), 4, 2); }
      fires.push([x0 + (x1 - x0) / 2, 198]);
    }
    // cintas transportadoras (galones según el sentido)
    for (const [x0, x1, d] of LV.belts) {
      R(g, '#1a1418', x0, GY - 3, x1 - x0, 4); R(g, '#3a3036', x0, GY - 3, x1 - x0, 1);
      for (let x = x0 + 4; x < x1 - 6; x += 12) { const a = d > 0 ? x : x + 4; line(g, a, GY - 2, a + 3 * d, GY - 1, '#ffd23f', 1); line(g, a + 3 * d, GY - 1, a, GY, '#ffd23f', 1); }
      for (const ex of [x0, x1 - 4]) { disc(g, ex + 2, GY - 1, 2.5, '#5a5058'); }
    }
    // pasarelas, puente colgante y contenedores
    for (const [x0, x1, y, k] of LEDGES) {
      if (k === 'crate') {
        const col = r() < 0.5 ? ['#a8452a', '#c8603a', '#6a2a1a'] : ['#2f5aa8', '#4a78c8', '#1c3a6a'];
        R(g, col[0], x0, y, x1 - x0, GY - y); R(g, col[1], x0, y, x1 - x0, 2); R(g, col[2], x0, GY - 3, x1 - x0, 3);
        for (let x = x0 + 4; x < x1 - 2; x += 5) R(g, col[2], x, y + 4, 1, GY - y - 8);
        R(g, '#16181c', x0 + 4, y + 8, 10, 4); R(g, '#e8e0c0', x0 + 5, y + 9, 8, 2);
        continue;
      }
      const below = k === 'bridge2' ? 0 : GY;
      if (below) for (const px of [x0 + 6, x1 - 8]) { R(g, '#3a3240', px, y + 6, 3, below - y - 6); R(g, '#5a5060', px, y + 6, 1, below - y - 6); }
      else for (const px of [x0 + 10, x1 - 12]) line(g, px, 0, px, y, '#4a4250', 1);
      R(g, '#8a8696', x0, y, x1 - x0, 4); R(g, '#c4c0cc', x0, y, x1 - x0, 1); R(g, '#3a3640', x0, y + 4, x1 - x0, 2);
      for (let x = x0 + 2; x < x1 - 2; x += 3) R(g, '#4a4652', x, y + 2);
      R(g, '#6a6676', x0, y - 9, x1 - x0, 1); for (let x = x0; x < x1; x += 12) R(g, '#6a6676', x, y - 9, 1, 9);
    }
    return c;
  }
  function buildLevelArt() {
    chunks.forEach((q) => q.remove()); chunks = [];
    (S.glowSprs || []).forEach((q) => q.remove()); (S.fireSprs || []).forEach((f) => f.spr.remove());
    glows = []; fires = [];
    const big = LV.theme === 'foundry' ? drawFoundry() : drawLevel();
    for (let i = 0; i < END / 512; i++) {
      const { c, g } = mk(512, 216);
      g.drawImage(big, -i * 512, 0);
      const sp = new Spr(scene, T(c), 0);
      sp.m.frustumCulled = true;
      sp.at(i * 512 + 256, 108);
      chunks.push(sp);
    }
    S.glowSprs = glows.map(([x, y]) => new Spr(scene, A.glow, 1, { transparent: true, add: true }).at(x, y));
    S.fireSprs = fires.map(([x, y], i) => ({ spr: new Spr(scene, A.fire[0], 2).at(x, y - 8), x, y, ph: i }));
    plats = GROUND.map(([x0, x1]) => ({ x0, x1, y: GY, ground: true })).concat(LEDGES.map(([x0, x1, y]) => ({ x0, x1, y, ground: false })));
    // fondo según el tema
    const th = LV.theme;
    if (S.bgTheme !== th) {
      const cv = th === 'foundry' ? [CFX.skyFoundry(), CFX.farFoundry(), CFX.midFoundry(), CFX.nearFoundry()] : [skyCanvas(), farCanvas(), midCanvas(), nearCanvas()];
      if (S.bgTheme !== undefined || th !== 'city') cv.forEach((canvas, i) => { const t = T(canvas); t.wrapS = THREE.RepeatWrapping; layers[i].m.material.map = t; layers[i].t = t; layers[i].m.material.needsUpdate = true; });
      S.bgTheme = th;
    }
    S.sun.show(th === 'city');
    scene.background = new THREE.Color(th === 'foundry' ? 0x140c12 : 0x180e3a);
  }
  function useLevel(i) {
    LV = LEVELS[i]; GROUND = LV.ground; LEDGES = LV.ledges; SPAWNS = LV.spawns; S.lv = i;
    if (S.builtLv !== i) { S.builtLv = i; buildLevelArt(); }
  }
  // cintas que arrastran y prensas que golpean el suelo
  function setupFoundry() {
    (S.presses || []).forEach((q) => { q.head.remove(); q.rod.remove(); });
    (S.chev || []).forEach((q) => q.spr.remove());
    S.presses = LV.presses.map((x, i) => ({ x, t: (i * 1.1) % 3.4, head: new Spr(scene, A.pressHead, 7), rod: new Spr(scene, A.pressRod, 6.5) }));
    S.chev = [];
  }
  function updateFoundry(dt) {
    const p = player;
    if (!S.presses) return;
    for (const [x0, x1, d] of LV.belts) {
      if (!p.dead && !p.inTank && p.ground && p.plat && p.plat.ground && p.x > x0 && p.x < x1) p.x = clamp(p.x + d * 46 * dt, S.camX + 8, S.camX + Engine.W - 8);
      for (const e of ents) if (!e.dead && (e.type === 'runner' || e.type === 'dog') && e.ground && e.plat && e.plat.ground && e.x > x0 && e.x < x1) e.x += d * 46 * dt;
    }
    for (const q of S.presses) {
      q.t = (q.t + dt) % 3.4;
      const t = q.t, vis = q.x > S.camX - 30 && q.x < S.camX + Engine.W + 30;
      let y; // borde superior del cabezal
      if (t < 1.2) y = 36;
      else if (t < 1.6) y = 36 + Math.sin(t * 60) * 1.2;
      else if (t < 1.75) y = 36 + (GY - 52) * ((t - 1.6) / 0.15);
      else if (t < 2.4) y = GY - 16;
      else y = GY - 16 - (GY - 52) * ((t - 2.4) / 1);
      y = Math.round(y);
      if (vis && t >= 1.2 && t < 1.6 && Math.random() < 0.5) parts.emit(q.x + rand(-16, 16), 34, rand(-20, 20), rand(10, 40), 0.4, 0xe8e0f0, 0x6a6070, 2, 4);
      if (vis && t >= 1.75 && !q.hitDone) { q.hitDone = true; Snd.sfx('stomp'); shake(1.8, 0.12); for (let k = 0; k < 8; k++) parts.emit(q.x + rand(-18, 18), GY - 2, rand(-80, 80), rand(-60, -20), 0.5, 0xd8c8b8, 0x4a3a3e, 2, 6); }
      if (t < 1.75) q.hitDone = false;
      q.head.at(q.x, y + 8);
      q.rod.m.scale.set(8, Math.max(1, y - 34), 1); q.rod.m.position.set(q.x, -(34 + (y - 34) / 2), 6.5);
      if (t >= 1.62 && t < 2.4) {
        const box = [q.x - 15, y, 30, GY - y];
        if (!p.dead && hit(box, playerBox())) { if (p.inTank) tankHit(); else hurtPlayer(); }
        for (const e of ents) if (!e.dead && (e.type === 'runner' || e.type === 'dog') && hit(box, entBox(e))) killEnt(e);
      }
    }
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
    A.tankP = { f: [0, 1].map((f) => T(CFX.tankP(f, false))), u: [0, 1].map((f) => T(CFX.tankP(f, true))) };
    A.tankE = [0, 1].map((f) => T(CFX.tankE(f, false))); A.tankEh = T(CFX.tankE(0, true));
    A.shellT = T(CFX.shell()); A.wall = [0, 1, 2].map((k) => T(CFX.wall(k)));
    A.bomberN = [T(CFX.bomberNear(true)), T(CFX.bomberNear(false))]; A.napalm = T(CFX.napalm());
    A.dog = [0, 1].map((f) => T(CFX.dog(f, false))); A.dogH = T(CFX.dog(0, true)); A.grate = [T(CFX.grate(false)), T(CFX.grate(true))]; A.pulseRing = T(CFX.pulseRing()); A.reticle = T(CFX.reticle()); A.pressHead = T(CFX.pressHead()); A.pressRod = T(CFX.pressRod());
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
    S.builtLv = 0; buildLevelArt();
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
      <div class="hbl" style="align-items:center"><span class="wpn" id="cw">N</span><span class="wpn2" id="cw2" hidden></span><span class="hlab" id="cwn">NORMAL</span><span class="hlab hfix" id="cfx" hidden>FIJO</span><span class="abil" id="ca" hidden><i id="cai"></i><b id="cak">G</b></span><span class="hscrap" id="cr"><i class="bolt"></i><span id="crn">0</span></span><span class="hpulse" id="cpb" hidden>P×0</span></div>
      <div class="boss" id="cb" hidden><span class="hlab" id="cbl" style="color:var(--pink)">COLOSO-07</span><div class="bar"><i id="cbb" style="width:100%"></i></div></div>
      <div class="banner" id="cbn" hidden></div>`);
    hud = { v: UI.$('#cv'), s: UI.$('#cs'), h: UI.$('#ch'), w: UI.$('#cw'), wn: UI.$('#cwn'), b: UI.$('#cb'), bb: UI.$('#cbb'), bn: UI.$('#cbn'),
      a: UI.$('#ca'), ai: UI.$('#cai'), ak: UI.$('#cak'), r: UI.$('#crn'), bl: UI.$('#cbl'), pb: UI.$('#cpb'), w2: UI.$('#cw2'), fx: UI.$('#cfx') };
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
    S.lv = free() ? Store.get('contra_startlv', 0) % LEVELS.length : 0;
    Object.assign(S, { score: 0, lives: 3, loop: 0, hi: Store.get('hi_contra', 0), nextLife: 30000, baseW: C.w, wl: up.w, scrap: 0, bombs: 0,
      ab: abOpen() ? { k: C.ab, lvl: up.a, cd: 0 } : null });
    document.body.classList.remove('inmenu', 'has-bomb');
    buildHud();
    UI.setButtons('SALTO', 'FUEGO');
    player.weapon = C.w; player.slots = [C.w, null]; player.cur = 0; S.fixT = false;
    beginStage();
    if (Engine.touch && innerHeight > innerWidth) UI.toast('GIRA EL TELÉFONO PARA VER MÁS NIVEL');
    else if (S.ab) UI.toast(`${ABIL[S.ab.k].n.toUpperCase()} LISTA · ${Engine.touch ? 'BOTÓN H' : 'TECLA V'}`);
  }
  function retry() { beginRun(); }
  function action(act) { if (act === 'barracks') { bankScrap(); openBarracks(); } }
  function bankScrap() { if (S.scrap > 0) { Store.set('contra_scrap', Store.get('contra_scrap', 0) + S.scrap); S.scrap = 0; } }
  function beginStage() {
    useLevel(S.lv || 0);
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
    setupStageExtras();
    setupPhase2();
    Object.assign(S, { camX: 0, spawnI: 0, runT: 2.5, state: 'play', t: 0, bossTrig: false, clearT: 0, introT: 2.4 });
    S.spawnList = SPAWNS.slice().sort((a, b) => a.x - b.x);
    spawnPlayer(40, true);
    player.weapon = player.weapon || S.baseW || 'N';
    banner(`MISIÓN ${S.loop * 2 + (S.lv || 0) + 1}`, `${LV.name} · AVANZA ▶`);
    Snd.play(SONGS.contra);
  }
  function spawnPlayer(x, first) {
    const p = player;
    let sx = x;
    const g = plats.find((q) => q.ground && q.x1 > x + 10);
    if (g && sx < g.x0 + 10) sx = g.x0 + 16;
    Object.assign(p, { x: sx, y: first ? GY : -20, vx: 0, vy: 0, face: 1, ground: first, fell: false, plat: first ? supportAt(sx, GY) : null, jumping: false, prone: false, aim: 'fwd',
      anim: 0, inv: first ? 0 : 2.4, barrier: 0, dead: false, deadT: 0, dropT: 0, dropPlat: null, fireT: 0, dashT: 0, dashInv: 0 });
    // al morir pierdes el arma que tenías en la mano (si era la de la cápsula); la del personaje nunca se pierde
    if (!p.slots) p.slots = [S.baseW || 'N', null];
    if (!first && p.cur === 1) p.slots[1] = null;
    if (!first) p.cur = 0;
    p.weapon = p.slots[p.cur] || p.slots[0];
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
    if (S.tb && S.tb.st === 'fight') { const t = rayBox(mx, my, dx, dy, coreBox(S.tb)); if (t !== null && t < len) hitTitan(coreBox(S.tb), W.dmg, true); }
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
    } else if (sp.t === 'dogs') { spawnDogs(sp);
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
    const pts = { runner: 100, rifle: 300, drone: 200, turret: 500, capsule: 100, wall: 200, mtank: 8000, dog: 250 }[e.type] || 100;
    addScore(pts);
    if (e.type === 'dog') {
      Snd.sfx('explode'); boomAt(e.x, e.y - 6, true); parts.burst(e.x, e.y - 8, 10, 90, 0.4, 0xd8dce8, 0x4a5262, 2, 1, 300);
    } else if (e.type === 'runner' || e.type === 'rifle') {
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
    } else if (e.type === 'wall') {
      Snd.sfx('explode'); boomAt(e.x, e.y - 30, true); shake(2, 0.2);
      for (let i = 0; i < 26; i++) parts.emit(e.x + rand(-8, 8), e.y - rand(4, 60), rand(-90, 90), rand(-160, -40), rand(0.5, 1), 0x8c88a0, 0x3a3648, 2, 1, 500);
    } else if (e.type === 'mtank') {
      Snd.sfx('boom'); flash(0.35, [1, 0.8, 0.5]); shake(4, 0.5); UI.vibrate([60, 40, 90]);
      for (let i = 0; i < 6; i++) boomAt(e.x + rand(-30, 30), e.y - rand(6, 34), i % 2 === 1);
      S.lockX = null; hud.b.hidden = true; banner('¡BLINDADO DESTRUIDO!', 'SIGUE AVANZANDO ▶'); S.alertT = 2;
    } else { Snd.sfx('explode'); boomAt(e.x, e.y, true); }
    if (!e.keepSpr) { e.spr.remove(); e.extra && e.extra.forEach((s) => s.remove()); }
    dropScrap(e.x, e.y - 10, e.type === 'mtank' ? 15 : SCRAP[e.type] || 1);
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
      case 'wall': return [e.x - 8, e.y - 62, 16, 62];
      case 'mtank': return [e.x - 34, e.y - 36, 68, 36];
      case 'dog': return [e.x - 11, e.y - 13, 22, 13];
    }
    return [0, 0, 0, 0];
  }
  function playerBox() {
    const p = player;
    if (p.inTank) return [S.tank.x - 24, GY - 30, 48, 30];
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
      if (e.kx) { if (e.type === 'runner' || e.type === 'rifle' || e.type === 'drone' || e.type === 'dog') e.x += e.kx * dt; e.kx *= Math.pow(0.002, dt); if (Math.abs(e.kx) < 3) e.kx = 0; }
      const onScreen = e.x > S.camX - 10 && e.x < S.camX + W + 10;
      if (e.type === 'wall') { e.spr.set(A.wall[e.hp > e.max * 0.6 ? 0 : e.hp > e.max * 0.3 ? 1 : 2]).tint(e.flashT > 0 ? 0xffd0d0 : 0xffffff); continue; }
      if (e.type === 'mtank') { updateMTank(e, dt); continue; }
      if (e.type === 'dog') { updateDog(e, dt); continue; }
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
    hud.b.hidden = false; hud.bl.textContent = 'COLOSO-07';
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
        startTitan();
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
    if (p.inTank && !p.dead && S.state === 'play') { tankHit(); return; }
    if (p.dead || p.inv > 0 || p.barrier > 0 || p.dashInv > 0 || S.state !== 'play') return;
    p.dead = true; p.deadT = 0; p.vx = -p.face * 55; p.vy = -230; p.ground = false; p.jumping = false; p.prone = false;
    Snd.sfx('die'); shake(3, 0.25); flash(0.3, [1, 0.3, 0.4]); UI.vibrate(80);
    parts.burst(p.x, p.y - 16, 14, 100, 0.5, 0xffffff, 0xff4f9a, 2, 1, 200, 1);
  }
  function updatePlayer(dt) {
    const p = player, I = Input.held, W = Engine.W;
    if (S.reticle && (p.dead || p.inTank)) S.reticle.show(false);
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
    if (p.inTank) { rideTank(dt); return; }
    let mx = (I.right ? 1 : 0) - (I.left ? 1 : 0);
    if (Input.pressed.select && p.slots[1]) { p.cur ^= 1; p.weapon = p.slots[p.cur]; p.fireT = Math.min(p.fireT, 0.05); Snd.sfx('move'); parts.burst(p.x, p.y - 16, 6, 50, 0.25, 0xffffff, 0xffe066, 1, 1); }
    if (Input.pressed.f) { S.fixT = !S.fixT; const fb = document.getElementById('btnFix'); if (fb) { fb.classList.toggle('lock', S.fixT); fb.setAttribute('aria-pressed', String(S.fixT)); } }
    // disparo fijo: los pies quedan plantados y las flechas solo apuntan (8 direcciones)
    S.fixed = (I.e || S.fixT) && p.ground;
    if (S.fixed) {
      if (mx) p.face = mx;
      p.prone = false;
      p.aim = I.up ? (mx ? 'dup' : 'up') : I.down ? 'ddown' : 'fwd';
      mx = 0;
    }
    if (p.ground && !S.fixed) { p.prone = I.down && mx === 0; if (p.prone) mx = 0; }
    if (mx) p.face = mx;
    if (Input.pressed.a && p.ground) {
      if (I.down && p.plat && !p.plat.ground) { p.dropPlat = p.plat; p.dropT = 0.3; p.ground = false; p.vy = 30; p.jumping = false; }
      else { p.vy = JV; p.ground = false; p.jumping = true; Snd.sfx('jump'); }
      p.prone = false;
    }
    if (S.fixed) { /* puntería ya decidida */ } else if (p.ground) p.aim = p.prone ? 'prone' : I.up ? (mx ? 'dup' : 'up') : I.down && mx ? 'ddown' : 'fwd';
    else p.aim = I.up ? (mx ? 'dup' : 'up') : I.down ? (mx ? 'ddown' : 'down') : 'fwd';
    p.vx = mx * RUN;
    if (p.dashInv > 0) p.dashInv -= dt;
    if (p.dashT > 0) { p.dashT -= dt; p.vx = p.dashV; p.vy = Math.min(p.vy, 0); dashTrail(); }
    const y0 = p.y;
    if (!p.ground && !(p.dashT > 0)) p.vy = Math.min(p.vy + G * dt, MAXF);
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.x = clamp(p.x, S.camX + 8, Math.min(END - 8, S.camX + W - 8));
    for (const e of ents) if (e.type === 'wall' && !e.dead && Math.abs(p.x - e.x) < 11 && p.y > e.y - 66) p.x = e.x + (p.x < e.x ? -11 : 11);
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
    else if (S.fixed && (p.aim === 'dup' || p.aim === 'ddown')) tex = A.hero.run[p.aim][1];
    else if (mx) tex = A.hero.run[p.aim === 'up' ? 'dup' : p.aim][Math.floor(p.anim * 11) % 6];
    else tex = A.hero.stand[p.aim === 'up' ? 'up' : 'fwd'][Math.floor(p.anim * 3) % 3];
    p.spr.set(tex).setFlip(p.face < 0);
    if (p.jumping) p.spr.at(p.x, p.y - 14); else p.spr.anchor(p.x, p.y, ANCHOR[0], ANCHOR[1]);
    p.spr.show(!(p.inv > 0 && Math.floor(p.inv * 14) % 2 === 0));
    p.aura.show(p.barrier > 0).at(p.x, p.y - 14);
    if (!S.reticle) S.reticle = new Spr(scene, A.reticle, 24, { transparent: true });
    if (S.fixed) { const v = p.aim === 'up' ? [0, -1] : p.aim === 'dup' ? [p.face * 0.71, -0.71] : p.aim === 'ddown' ? [p.face * 0.71, 0.71] : [p.face, 0]; S.reticle.show(true).at(Math.round(p.x + v[0] * 34), Math.round(p.y - 18 + v[1] * 34)); }
    else S.reticle.show(false);
    if (p.barrier > 0) p.aura.mat.opacity = 0.5 + Math.sin(p.anim * 20) * 0.4;
    // recoger medallas
    for (const it of items) {
      if (!it.medal || it.dead) continue;
      if (hit([it.x - 10, it.y - 17, 20, 18], playerBox())) {
        it.dead = true; it.spr.remove();
        Snd.sfx('powerup'); addScore(100);
        if (it.w === 'B') { p.barrier = 12; UI.toast('BARRERA · INVENCIBLE 12 s'); }
        else if (it.w === 'P') { S.bombs = Math.min(3, (S.bombs || 0) + 1); document.body.classList.add('has-bomb'); UI.toast(`BOMBA DE PULSO ×${S.bombs} · ${Engine.touch ? 'BOTÓN P' : 'TECLA Q'}`); }
        else {
          const first2 = !p.slots[1];
          p.slots[1] = it.w; p.cur = 1; p.weapon = it.w;
          UI.toast({ M: 'AMETRALLADORA', S: 'DISPERSIÓN ×5', L: 'LÁSER PERFORANTE', F: 'FUEGO EN ESPIRAL' }[it.w] + (first2 ? ` · ${Engine.touch ? 'SELECT' : 'E'} CAMBIA DE ARMA` : ''));
        }
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
      if (!used && hitTitan(bb, b.dmg, b.pierce)) used = true;
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
      if (b.kind === 'bomb' || b.kind === 'napalm') {
        b.vy = Math.min(b.vy + 500 * dt, 300); b.x += b.vx * dt; b.y += b.vy * dt;
        const s = landOn(b.x, b.y - b.vy * dt, b.y, null);
        if (s) {
          b.on = false; b.spr.show(false); boomAt(b.x, s.y - 10); Snd.sfx(b.kind === 'napalm' ? 'gboom' : 'explode'); shake(b.kind === 'napalm' ? 3 : 2, 0.15);
          if (b.kind === 'napalm' && s.ground) addFireZone(b.x, s.y);
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





  // ---------------- fase 4: el titán baja a la calle como jefe final de la misión
  // núcleo naranja del pecho = punto débil (se alcanza saltando y disparando, con granadas o con el láser). Ataques: barrido del visor (salta cuando pasa),
  // obuses del brazo-cañón, pisotón con onda por el suelo (salta) y drones de la espalda.
  const TITAN_ATK = ['sweep', 'cannon', 'stomp', 'drones', 'cannon', 'sweep', 'stomp'];
  function startTitan() {
    const W = Engine.W, hp = 80 + S.loop * 35;
    S.tb = { x: S.camX + W + 90, hp, max: hp, st: 'enter', t: 0, step: 0, atkT: 1.4, ai: 0, a: null, aT: 0, flashT: 0, dyT: 0, y: GY - 71,
      spr: new Spr(scene, A.titan[0], 5), glow: new Spr(scene, A.glow, 6, { transparent: true, add: true }), bm: new Spr(scene, A.fx.beam, 26, { transparent: true, add: true }).show(false) };
    S.tb.bm.tint(0xff3b5c);
    S.waves = [];
    Object.assign(BG, { tSt: 'wait', tT: 999 }); BG.titan.show(false); BG.beam.show(false);
    hud.bl.textContent = 'TITÁN'; hud.b.hidden = false;
    banner('¡EL TITÁN BAJA A LA CALLE!', 'DISPARA AL NÚCLEO DEL PECHO'); S.alertT = 2.6;
    Snd.sfx('alarm'); Snd.sfx('stomp');
  }
  const coreBox = (T) => [T.x + 5, T.y + 8, 22, 26];
  const titanLegs = (T) => [T.x - 30, GY - 36, 74, 36];
  const titanBody = (T) => [T.x - 34, T.y - 34, 92, 110];
  // devuelve true si el proyectil quedó usado (golpeó el núcleo o el blindaje)
  function hitTitan(box, dmg, pierce) {
    const T = S.tb;
    if (!T || T.st !== 'fight') return false;
    if (hit(box, coreBox(T))) {
      T.hp -= dmg; T.flashT = 0.06; parts.burst(box[0] + box[2] / 2, box[1] + box[3] / 2, 5, 80, 0.25, 0xffffff, 0xff8a1e, 1, 1); Snd.sfx('hit');
      if (T.hp <= 0) killTitan();
      return true;
    }
    if (hit(box, titanLegs(T))) { if (!pierce) { Snd.sfx('tink'); parts.burst(box[0] + 2, box[1] + 2, 3, 50, 0.15, 0xffffff, 0x9aa0b4, 1, 1); } return !pierce; }
    return false;
  }
  function killTitan() {
    const T = S.tb;
    T.st = 'dying'; T.dyT = 0; T.bm.show(false);
    addScore(30000); dropScrap(T.x, T.y, 40);
    Snd.sfx('boom'); flash(0.6, [1, 0.8, 0.6]); shake(6, 0.6); UI.vibrate([80, 40, 120]);
    for (const e of ents) if (!e.dead && e.type === 'drone') killEnt(e);
  }
  function updateTitan(dt) {
    const T = S.tb, p = player, W = Engine.W;
    if (!T) return;
    T.t += dt;
    if (T.flashT > 0) T.flashT -= dt;
    const fast = T.hp < T.max * 0.5 ? 0.65 : 1;
    if (T.st === 'enter') {
      T.x -= 34 * dt;
      if (Math.floor(T.t * 1.6) !== T.step) { T.step = Math.floor(T.t * 1.6); Snd.sfx('stomp'); shake(2.5, 0.2); for (let i = 0; i < 8; i++) parts.emit(T.x + rand(-20, 30), GY - 2, rand(-60, 60), rand(-60, -20), 0.6, 0x8a8478, 0x3a3640, 3, 6); }
      if (T.x <= S.camX + W - 58) { T.x = S.camX + W - 58; T.st = 'fight'; }
    } else if (T.st === 'fight') {
      if (!T.a && (T.atkT -= dt) <= 0) { T.a = TITAN_ATK[T.ai++ % TITAN_ATK.length]; T.aT = 0; T.shots = 0; }
      if (T.a) {
        T.aT += dt;
        if (T.a === 'sweep') {
          // aviso del visor 0,8 s y luego el rayo barre el suelo desde los pies del titán hacia la izquierda
          const ex = T.x + 6, ey = T.y - 43;
          if (T.aT < 0.8) { if (Math.random() < 0.5) parts.emit(ex + rand(-8, 8), ey, rand(-20, 20), rand(-20, 20), 0.2, 0xffffff, 0xff3b5c, 2, 1); if (!T.warned) { T.warned = true; Snd.sfx('beam'); } }
          else {
            const k = Math.min(1, (T.aT - 0.8) / (1.4 * fast)), ix = T.x - 40 - k * (W - 50), iy = GY - 2;
            const dx = ix - ex, dy = iy - ey, len = Math.hypot(dx, dy);
            T.bm.show(true); T.bm.m.scale.set(len, 6 + Math.sin(T.t * 50) * 2, 1); T.bm.m.position.set((ex + ix) / 2, -(ey + iy) / 2, 26); T.bm.m.rotation.z = -Math.atan2(dy, dx);
            parts.emit(ix + rand(-4, 4), iy, rand(-40, 40), rand(-90, -30), 0.4, 0xfff3c0, 0xff3b5c, 2, 1, 300);
            if (!p.dead && hit([ix - 7, GY - 18, 14, 18], playerBox())) hurtPlayer();
            if (k >= 1) { T.bm.show(false); T.a = null; T.warned = false; T.atkT = 1.3 * fast; }
          }
        } else if (T.a === 'cannon') {
          if (T.aT > 0.45 + T.shots * 0.42 * fast && T.shots < 3) {
            T.shots++;
            const sx = T.x - 67, sy = T.y + 17, vx = clamp((p.x - sx) / 0.95 + rand(-30, 30), -340, -40);
            enemyShot(sx, sy, vx, -170, 'bomb'); Snd.sfx('shotgun'); parts.burst(sx, sy, 8, 70, 0.3, 0xfff3c0, 0xff3b5c, 2, 1); shake(1.2, 0.08);
          }
          if (T.aT > 1.9) { T.a = null; T.atkT = 1.1 * fast; }
        } else if (T.a === 'stomp') {
          if (T.aT > 0.5 && !T.stomped) {
            T.stomped = true; Snd.sfx('stomp'); Snd.sfx('gboom'); shake(4, 0.35);
            S.waves.push({ x: T.x - 30, t: 0, sprs: [0, 1].map(() => new Spr(scene, A.fire[0], 23).scaleBy(2)) });
            if (T.hp < T.max * 0.5) S.waves.push({ x: T.x - 30, t: -0.55, sprs: [0, 1].map(() => new Spr(scene, A.fire[0], 23).scaleBy(2)) });
          }
          if (T.aT > 1.3) { T.a = null; T.stomped = false; T.atkT = 1.2 * fast; }
        } else if (T.a === 'drones') {
          if (T.aT > 0.3 && !T.sent) { T.sent = true; spawnEnt({ t: 'drones', n: T.hp < T.max * 0.5 ? 3 : 2 }); Snd.sfx('missile'); }
          if (T.aT > 1) { T.a = null; T.sent = false; T.atkT = 1.4 * fast; }
        }
      }
      if (!p.dead && hit(titanBody(T), playerBox())) hurtPlayer();
    } else if (T.st === 'dying') {
      T.dyT += dt;
      if ((T.boomT = (T.boomT || 0) - dt) <= 0) { T.boomT = 0.12; boomAt(T.x + rand(-40, 40), T.y + rand(-60, 60), Math.random() < 0.5); Snd.sfx('explode'); shake(3, 0.2); }
      if (T.dyT > 1.6) T.y += (T.dyT - 1.6) * 70 * dt;
      if (T.dyT > 3.4) {
        for (let i = 0; i < 8; i++) boomAt(T.x + rand(-50, 50), GY - rand(10, 120));
        Snd.sfx('boom'); flash(0.9, [1, 0.85, 0.6]); shake(6, 0.8);
        T.spr.remove(); T.glow.remove(); T.bm.remove(); S.tb = null; hud.b.hidden = true;
        S.state = 'clear'; S.clearT = 0;
        return;
      }
    }
    // ondas del pisotón: se saltan
    for (const w of S.waves) {
      w.t += dt;
      if (w.t < 0) continue;
      w.x -= 175 * dt;
      w.sprs.forEach((q, i) => q.set(A.fire[Math.floor(w.t * 14 + i) % 3]).at(Math.round(w.x + i * 10), GY - 12 - i * 4).show(true));
      if (!p.dead && p.ground && Math.abs(p.x - w.x - 5) < 11) hurtPlayer();
      if (w.x < S.camX - 30) { w.sprs.forEach((q) => q.remove()); w.dead = true; }
    }
    S.waves = S.waves.filter((w) => !w.dead);
    const walk = T.st === 'enter' ? A.titan[Math.floor(T.t * 3.2) % 4] : T.a === 'cannon' ? A.titanAtk : A.titan[T.st === 'dying' ? 1 : 0];
    T.spr.set(walk).at(Math.round(T.x + (T.st === 'dying' ? Math.sin(T.t * 40) * 1.5 : 0)), Math.round(T.y)).tint(T.flashT > 0 ? 0xffb0b0 : T.st === 'dying' ? 0xc89090 : 0xffffff);
    T.glow.at(T.x + 16, T.y - 11).show(T.st !== 'dying'); T.glow.mat.opacity = 0.5 + 0.4 * Math.sin(T.t * 6);
  }

  // ---------------- fase 2: perros robot, respiraderos de fuego y bomba de pulso
  function setupPhase2() {
    (S.vents || []).forEach((v) => { v.g.remove(); v.f.forEach((q) => q.remove()); });
    S.vents = LV.vents.map((x, i) => ({ x, t: (i * 0.7) % 3, g: new Spr(scene, A.grate[0], 3).at(x, GY + 1), f: [0, 1, 2].map(() => new Spr(scene, A.fire[0], 23).scaleBy(2).show(false)) }));
    S.bombs = Math.min(S.bombs || 0, 3);
    items.push({ medal: true, w: 'P', x: LV.pulse[0], y: LV.pulse[1], vx: 0, vy: 0, ground: true, t: 0, spr: new Spr(scene, A.mach.medal.P, 6) });
  }
  // ciclo: 1,7 s apagado · 0,6 s aviso (chispas y rejilla roja) · 1 s columna de fuego
  function updateVents(dt) {
    const p = player, W = Engine.W;
    for (const v of S.vents) {
      v.t = (v.t + dt) % 3.3;
      const warn = v.t > 1.7 && v.t < 2.3, on = v.t >= 2.3;
      v.g.set(A.grate[warn || on ? 1 : 0]);
      const vis = v.x > S.camX - 20 && v.x < S.camX + W + 20;
      if (warn && vis && Math.random() < 0.4) parts.emit(v.x + rand(-6, 6), GY - 2, rand(-10, 10), rand(-90, -40), 0.35, 0xffe08a, 0xff4a1a, 1, 1, 200);
      if (on && !v.was && vis) Snd.sfx('fireball');
      v.was = on;
      v.f.forEach((q, i) => q.show(on).set(A.fire[Math.floor(v.t * 14 + i) % 3]).at(v.x + (i === 1 ? 1 : 0), GY - 10 - i * 14));
      if (on) {
        if (Math.random() < 0.5) parts.emit(v.x + rand(-4, 4), GY - 44, rand(-6, 6), rand(-40, -20), 0.5, 0xffb347, 0x4a2a3a, 2, 1);
        if (!p.dead && hit([v.x - 7, GY - 46, 14, 46], playerBox())) { if (p.inTank) tankHit(); else hurtPlayer(); }
        for (const e of ents) if (!e.dead && (e.type === 'runner' || e.type === 'dog') && Math.abs(e.x - v.x) < 8 && Math.abs(e.y - GY) < 3) killEnt(e);
      }
    }
  }
  function spawnDogs(sp) {
    for (let i = 0; i < sp.n; i++) {
      const x = S.camX + Engine.W + 20 + i * 30;
      const pl = plats.find((q) => q.ground && x >= q.x0 && x <= q.x1);
      if (!pl) continue;
      ents.push({ type: 'dog', x, y: GY, vy: 0, face: -1, ground: true, plat: pl, hp: 2, t: rand(0, 1), st: 'sniff', flashT: 0, wait: 0.4 + i * 0.35, spr: new Spr(scene, A.dog[0], 10) });
    }
  }
  function updateDog(e, dt) {
    const p = player;
    const dx = p.x - e.x;
    if (e.st === 'sniff') { if ((e.wait -= dt) <= 0 || Math.abs(dx) < 110) { e.st = 'run'; e.face = dx < 0 ? -1 : 1; if (e.x < S.camX + Engine.W) Snd.sfx('dash'); } }
    else {
      e.x += e.face * 150 * dt;
      // salta si el jugador está arriba y cerca
      if (e.ground && Math.abs(dx) < 46 && p.y < e.y - 20) { e.ground = false; e.vy = -300; }
    }
    if (e.ground && !(e.x >= e.plat.x0 - 2 && e.x <= e.plat.x1 + 2)) { const s2 = supportAt(e.x, e.y); if (s2) e.plat = s2; else { e.ground = false; e.vy = -120; } }
    if (!e.ground) { const y0 = e.y; e.vy = Math.min(e.vy + G * dt, MAXF); e.y += e.vy * dt; if (e.vy >= 0) { const l = landOn(e.x, y0, e.y, null); if (l) { e.y = l.y; e.ground = true; e.plat = l; e.vy = 0; } } }
    const fr = e.st === 'run' ? Math.floor(e.t * 16) % 2 : Math.floor(e.t * 3) % 2;
    e.spr.set(e.flashT > 0 ? A.dogH : A.dog[fr]).setFlip(e.face > 0).at(Math.round(e.x), Math.round(e.y) - 9);
    if (!p.dead && hit(entBox(e), playerBox())) { if (p.inTank) { e.kx = (player.face || 1) * 200; killEnt(e); } else hurtPlayer(); }
    if (e.y > H + 40 || e.x < S.camX - 80 || e.x > S.camX + Engine.W + 120) { e.dead = true; e.spr.remove(); }
  }
  // bomba de pulso: limpia la pantalla (Q en teclado, botón P en pantalla)
  function usePulse() {
    if (!S.bombs || player.dead) return;
    S.bombs--;
    const W = Engine.W, cx = S.camX + W / 2;
    Snd.sfx('pulse'); flash(0.7, [0.6, 1, 0.95]); shake(4, 0.4); UI.vibrate([40, 30, 80]); S.hitstop = 0.08;
    S.pulse = { t: 0, x: player.x, y: player.y - 16 };
    for (const b of ebs) if (b.on) { b.on = false; b.spr.show(false); parts.burst(b.x, b.y, 3, 40, 0.3, 0xa0fff0, 0x22c4a0, 1, 1); }
    for (const e of ents) {
      if (e.dead || e.type === 'capsule' || e.x < S.camX - 10 || e.x > S.camX + W + 10) continue;
      e.hp -= e.type === 'mtank' ? 15 : e.type === 'wall' ? 8 : 20; e.flashT = 0.1;
      if (e.hp <= 0) killEnt(e);
    }
    if (boss.on && boss.st === 'fight') damageBoss(15);
    if (S.tb && S.tb.st === 'fight') { S.tb.hp -= 15; S.tb.flashT = 0.1; if (S.tb.hp <= 0) killTitan(); }
    document.body.classList.toggle('has-bomb', S.bombs > 0);
  }
  function updatePulse(dt) {
    const P = S.pulse;
    if (!P) { S.pulseSpr && S.pulseSpr.show(false); return; }
    P.t += dt;
    const k = P.t / 0.5;
    if (!S.pulseSpr) S.pulseSpr = new Spr(scene, A.pulseRing, 30, { transparent: true, add: true });
    S.pulseSpr.show(k < 1); S.pulseSpr.m.scale.set(66 * (0.3 + k * 9), 66 * (0.3 + k * 9), 1); S.pulseSpr.m.position.set(P.x, -P.y, 30); S.pulseSpr.mat.opacity = Math.max(0, 1 - k);
    if (k >= 1) S.pulse = null;
  }

  // ---------------- fase 1 (inspirada en Contra III): blindado, muros, tanque Magnus y bombardeo cercano
  function mkWall(x, hp) { return { type: 'wall', x, y: GY, hp, max: hp, flashT: 0, spr: new Spr(scene, A.wall[0], 8).at(x, GY - 31) }; }
  function setupStageExtras() {
    if (S.tank) S.tank.spr.remove();
    S.tank = !LV.tank ? null : { x: LV.tank.x, face: 1, hp: 6, anim: 0, fireT: 0, occupied: false, dead: false, burnT: 0, up: false, inv: 0, hint: false, spr: new Spr(scene, A.tankP.f[0], 14) };
    for (const wx of LV.walls) ents.push(mkWall(wx, 14));
    setupFoundry();
    if (S.raid) { S.raid.spr.remove(); S.raid = null; }
    (S.fireZ || []).forEach((z) => z.sprs.forEach((q) => q.remove())); S.fireZ = [];
    Object.assign(S, { mbDone: false, raidDone: false, lockX: null });
    player.inTank = false;
    clearTitan();
  }
  function hideStageExtras() {
    if (S.tank) S.tank.spr.show(false);
    if (S.raid) { S.raid.spr.remove(); S.raid = null; }
    (S.fireZ || []).forEach((z) => z.sprs.forEach((q) => q.remove())); S.fireZ = [];
    S.lockX = null;
    clearTitan();
  }
  function clearTitan() {
    if (S.tb) { S.tb.spr.remove(); S.tb.glow.remove(); S.tb.bm.remove(); S.tb = null; }
    (S.waves || []).forEach((w) => w.sprs.forEach((q) => q.remove())); S.waves = [];
    if (BG && BG.tT > 100) BG.tT = 20;
  }
  // ---- blindado de la resistencia: pasas por encima para subir, A para saltar fuera
  function updateTank(dt) {
    const k = S.tank, p = player;
    if (!k || k.gone) return;
    if (k.inv > 0) k.inv -= dt;
    if (!k.occupied && !k.dead && !k.burnT && !p.dead && !p.inTank && p.ground && Math.abs(p.x - k.x) < 14 && Math.abs(p.y - GY) < 2) {
      p.inTank = true; k.occupied = true; p.spr.show(false); p.aura.show(false); p.prone = false;
      Snd.sfx('powerup'); UI.setButtons('SALIR', 'CAÑÓN');
      UI.toast(Engine.touch ? 'BLINDADO: B DISPARA · ARRIBA APUNTA · A SALTA' : 'BLINDADO: X DISPARA · ↑ APUNTA · Z SALTA');
    }
    if (!k.hint && !k.occupied && Math.abs(p.x - k.x) < 120) { k.hint = true; UI.toast('PASA POR ENCIMA DEL BLINDADO PARA SUBIR'); }
    if (k.burnT > 0) {
      k.burnT -= dt;
      if (Math.random() < 0.6) parts.emit(k.x + rand(-18, 18), GY - 20, rand(-10, 10), rand(-60, -30), 0.5, 0xffd27a, 0xe8452c, 3, 1);
      if (k.burnT <= 0) { boomAt(k.x, GY - 16); boomAt(k.x - 14, GY - 8, true); boomAt(k.x + 14, GY - 10, true); Snd.sfx('explode'); shake(3, 0.3); k.gone = true; k.spr.show(false); return; }
    }
    const tex = A.tankP[k.up && k.occupied ? 'u' : 'f'][Math.floor(k.anim * 10) % 2];
    k.spr.set(tex).setFlip(k.face < 0).at(Math.round(k.x), GY - 18).show(!(k.inv > 0 && Math.floor(k.inv * 16) % 2));
    k.spr.tint(k.dead ? 0x55555f : k.burnT > 0 ? 0xffa070 : 0xffffff);
  }
  function rideTank(dt) {
    const p = player, k = S.tank, I = Input.held;
    const mx = (I.right ? 1 : 0) - (I.left ? 1 : 0);
    if (mx) { k.face = mx; k.anim += dt; }
    k.up = !!I.up;
    k.x = clamp(k.x + mx * 78 * dt, Math.max(LV.tank.x - 40, S.camX + 26), Math.min(LV.tank.end + 4, S.camX + Engine.W - 26));
    for (const e of ents) if (e.type === 'wall' && !e.dead && Math.abs(k.x - e.x) < 34) k.x = e.x + (k.x < e.x ? -34 : 34);
    for (const e of ents) if (!e.dead && (e.type === 'runner' || e.type === 'rifle') && Math.abs(e.x - k.x) < 26 && Math.abs(e.y - GY) < 4) { e.kx = k.face * 220; killEnt(e); shake(1, 0.08); }
    k.fireT -= dt;
    if (I.b && k.fireT <= 0) { fireShell(); k.fireT = 0.42; }
    if (p.inv > 0) p.inv -= dt;
    p.x = k.x; p.y = GY; p.ground = true; p.vy = 0; p.plat = supportAt(k.x, GY);
    if (Input.pressed.a) { exitTank(false); return; }
    if (k.x >= LV.tank.end) exitTank(true);
  }
  function exitTank(forced) {
    const p = player, k = S.tank;
    p.inTank = false; k.occupied = false; UI.setButtons('SALTO', 'FUEGO');
    Object.assign(p, { x: k.x - k.face * 4, y: GY - 24, vy: -280, ground: false, jumping: true, plat: null });
    p.inv = Math.max(p.inv, 1.2); p.spr.show(true);
    Snd.sfx('jump');
    if (forced) {
      k.burnT = 1.4; Snd.sfx('fireball');
      UI.toast('¡LLAMARADAS! EL BLINDADO NO PASA');
      for (let i = 0; i < 16; i++) parts.emit(k.x + 26 + rand(-6, 6), GY, rand(-20, 20), rand(-220, -120), 0.6, 0xfff3c0, 0xe8452c, 3, 1, 120);
    }
  }
  function tankHit() {
    const k = S.tank;
    if (k.inv > 0) return;
    k.hp--; k.inv = 0.6; Snd.sfx('tink'); shake(1.5, 0.1); parts.burst(k.x, GY - 22, 8, 80, 0.3, 0xffffff, 0xffb347, 2, 1);
    if (k.hp <= 0) { k.dead = true; exitTank(false); player.inv = 2; k.burnT = 1.0; UI.toast('¡EL BLINDADO SE INCENDIA!'); }
  }
  function fireShell() {
    const k = S.tank, q = grens.find((o) => !o.on);
    if (!q) return;
    const dx = k.up ? 0.72 : 1, dy = k.up ? -0.7 : 0;
    const bx = k.x + k.face * (k.up ? 16 : 26), by = GY - (k.up ? 32 : 22);
    Object.assign(q, { on: true, kind: 'shell', x: bx, y: by, vx: k.face * dx * 310, vy: dy * 310, t: 0, g: 80 });
    q.spr.set(A.shellT).show(true).rot(-Math.atan2(q.vy, q.vx)).at(q.x, q.y);
    S.muzzle.set(A.fx.fl.E).show(true).rot(-Math.atan2(dy, dx * k.face)).at(bx + k.face * 4, by); S.muzzleT = 0.06;
    Snd.sfx('shotgun'); shake(1.8, 0.09);
    parts.emit(k.x - k.face * 20, GY - 10, -k.face * 30, -20, 0.5, 0x8a8478, 0x3a3640, 4, 7);
  }
  // ---- tanque enemigo Magnus Mk II: entra rompiendo un muro; la cámara se queda fija hasta destruirlo
  function startMidBoss() {
    S.mbDone = true; S.lockX = S.camX;
    const W = Engine.W;
    ents.push(mkWall(S.camX + W - 22, 40));
    const hp = Math.round(46 * (1 + S.loop * 0.3));
    ents.push({ type: 'mtank', x: S.camX + W + 60, y: GY, hp, max: hp, st: 'enter', t: 0, fireT: 1.4, mgT: 2.6, mgN: 0, mgB: 0, flashT: 0, spr: new Spr(scene, A.tankE[0], 9) });
    hud.bl.textContent = 'MAGNUS MK II'; hud.b.hidden = false;
    banner('¡BLINDADO ENEMIGO!', 'DESTRÚYELO PARA AVANZAR'); S.alertT = 2.2; Snd.sfx('alarm');
  }
  function updateMTank(e, dt) {
    const p = player, W = Engine.W, L = S.lockX != null ? S.lockX : S.camX, diff = 1 + S.loop * 0.3;
    if (e.st === 'enter') {
      e.x -= 42 * dt;
      for (const w of ents) if (w.type === 'wall' && !w.dead && Math.abs(w.x - e.x) < 36) { w.hp = 0; killEnt(w); shake(3, 0.35); }
      if (Math.random() < dt * 8) parts.emit(e.x + 30, GY - 4, rand(10, 40), rand(-30, -10), 0.6, 0x8a8478, 0x3a3640, 3, 6);
      if (e.x < L + W * 0.72) e.st = 'fight';
    } else {
      e.x = clamp(e.x + Math.sin(e.t * 0.8) * 16 * dt, L + W * 0.5, L + W - 30);
      if ((e.fireT -= dt * diff) <= 0) {
        e.fireT = rand(1.8, 2.6);
        const sx = e.x - 36, sy = GY - 30, vx = clamp((p.x - sx) / 0.92, -300, -40);
        enemyShot(sx, sy, vx, -200, 'bomb');
        Snd.sfx('shotgun'); parts.burst(sx, sy, 8, 70, 0.3, 0xfff3c0, 0xff8a1e, 2, 1);
      }
      if ((e.mgT -= dt * diff) <= 0) { e.mgN = 4; e.mgT = rand(2.4, 3.2); }
      if (e.mgN > 0 && (e.mgB -= dt) <= 0) { e.mgN--; e.mgB = 0.13; enemyShot(e.x - 30, GY - 12, -200, 0); Snd.sfx('eshot'); }
    }
    e.spr.set(e.flashT > 0 ? A.tankEh : A.tankE[Math.floor(e.t * 8) % 2]).at(Math.round(e.x), GY - 21);
    if (!p.dead && e.st === 'fight' && hit(entBox(e), playerBox())) hurtPlayer();
  }
  // ---- bombardeo cercano: el avión cruza bajo y la calle se incendia; las plataformas son refugio
  function startRaid() {
    S.raidDone = true;
    S.raid = { t: 0, x: S.camX - 70, drops: [0.16, 0.33, 0.5, 0.67, 0.84].map((k) => S.camX + Engine.W * k + 20), spr: new Spr(scene, A.bomberN[0], 26).show(false) };
    banner('¡BOMBARDEO!', 'SÚBETE A UN TECHO'); S.alertT = 1.8; Snd.sfx('alarm');
  }
  function updateRaid(dt) {
    const R0 = S.raid;
    if (!R0) return;
    R0.t += dt;
    if (R0.t > 1.1) {
      if (!R0.heard) { R0.heard = true; Snd.sfx('drone'); }
      R0.x += 175 * dt;
      R0.spr.set(A.bomberN[Math.floor(R0.t * 6) % 2]).at(Math.round(R0.x), 30).show(true);
      while (R0.drops.length && R0.x >= R0.drops[0]) {
        const b = enemyShot(R0.drops.shift(), 40, 40, 30, 'napalm');
        if (b) b.spr.set(A.napalm);
      }
      if (R0.x > S.camX + Engine.W + 90) { R0.spr.remove(); S.raid = null; }
    }
  }
  function addFireZone(x, y) {
    const sprs = [-14, 0, 14].map((dx) => new Spr(scene, A.fire[0], 22).scaleBy(2));
    S.fireZ.push({ x, y, t: 0, sprs });
  }
  function updateFireZones(dt) {
    const p = player;
    for (const z of S.fireZ) {
      z.t += dt;
      const k = z.t < 3.6 ? 1 : 0;
      z.sprs.forEach((q, i) => q.set(A.fire[Math.floor(z.t * 12 + i) % 3]).at(Math.round(z.x + (i - 1) * 14), z.y - 12 - (i === 1 ? 4 : 0)).show(k > 0 || Math.floor(z.t * 14) % 2 === 0));
      if (Math.random() < dt * 10) parts.emit(z.x + rand(-20, 20), z.y - 10, rand(-8, 8), rand(-50, -20), 0.6, 0xffb347, 0x5a2a3a, 2, 1);
      if (z.t < 3.6) {
        if (!p.dead && !p.inTank && p.ground && p.plat && p.plat.ground && Math.abs(p.x - z.x) < 22) hurtPlayer();
        for (const e of ents) if (!e.dead && e.type === 'runner' && e.ground && Math.abs(e.x - z.x) < 18) killEnt(e);
      }
      if (z.t > 4.2) { z.sprs.forEach((q) => q.remove()); z.dead = true; }
    }
    S.fireZ = S.fireZ.filter((z) => !z.dead);
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
    Object.assign(q, { on: true, kind: 'gren', x: p.x + p.face * 6, y: p.y - 26, vx, vy, t: 0, g: 620 });
    q.spr.set(A.gren).show(true).at(q.x, q.y);
  }
  function grenBoom(x, y, dmg = 6, rad = 0) {
    const lv = S.ab ? S.ab.lvl : 1, R2 = rad || (lv >= 2 ? 36 : 30);
    boomAt(x, y); boomAt(x - 10, y + 2, true); boomAt(x + 10, y + 2, true);
    Snd.sfx('gboom'); shake(3, 0.25); UI.vibrate(40);
    for (const e of ents) {
      if (e.dead || e.type === 'capsule') continue;
      const bx = entBox(e), cx = bx[0] + bx[2] / 2, cy = bx[1] + bx[3] / 2;
      if (Math.hypot(cx - x, cy - y) < R2 + bx[2] / 2) { e.hp -= dmg; e.flashT = 0.08; if (e.hp <= 0) killEnt(e); }
    }
    for (const m of ebs) if (m.on && (m.kind === 'missile' || m.kind === 'bomb') && Math.hypot(m.x - x, m.y - y) < R2 + 6) { m.on = false; m.spr.show(false); }
    if (boss.on && boss.st === 'fight') { const b = bossBox(); if (x > b[0] - R2 && x < b[0] + b[2] + R2 && y > b[1] - R2 && y < b[1] + b[3] + R2) damageBoss(dmg); }
    if (S.tb && S.tb.st === 'fight') hitTitan([x - R2, y - R2, R2 * 2, R2 * 2], dmg, true);
  }
  function updateGrens(dt) {
    for (const q of grens) {
      if (!q.on) continue;
      q.t += dt;
      const y0 = q.y;
      q.vy = Math.min(q.vy + (q.g || 620) * dt, 380); q.x += q.vx * dt; q.y += q.vy * dt;
      q.spr.at(q.x, q.y).rot(q.kind === 'shell' ? -Math.atan2(q.vy, q.vx) : q.t * 14 * Math.sign(q.vx || 1));
      if (q.kind === 'shell' && Math.random() < 0.7) parts.emit(q.x - Math.sign(q.vx) * 4, q.y, 0, rand(-8, 8), 0.25, 0xffe066, 0x5a4a6a, 2, 1);
      if (q.kind === 'shell' && (q.x > S.camX + Engine.W + 20 || q.x < S.camX - 20)) { q.on = false; q.spr.show(false); continue; }
      let pop = q.t > 2.2 || q.y > H + 10;
      if (!pop && q.vy > 0 && landOn(q.x, y0, q.y, null)) pop = true;
      if (!pop) for (const e of ents) if (!e.dead && e.type !== 'capsule' && hit([q.x - 3, q.y - 3, 6, 6], entBox(e))) { pop = true; break; }
      if (!pop && boss.on && boss.st === 'fight' && hit([q.x - 3, q.y - 3, 6, 6], bossBox())) pop = true;
      if (!pop && S.tb && S.tb.st === 'fight' && hit([q.x - 3, q.y - 3, 6, 6], titanBody(S.tb))) pop = true;
      if (pop) { q.on = false; q.spr.show(false); if (q.y < H + 5) grenBoom(q.x, q.y - 4, q.kind === 'shell' ? 5 : 6, q.kind === 'shell' ? 24 : 0); }
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
    player.spr.show(false); player.aura.show(false); if (S.reticle) S.reticle.show(false);
    hideStageExtras();
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
          ${fr ? `<button class="cq-chip" id="cqlv">Partir en misión ${Store.get('contra_startlv', 0) % LEVELS.length + 1}</button>` : ''}
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
    const lvb = UI.$('#cqlv'); if (lvb) lvb.addEventListener('click', () => { Store.set('contra_startlv', (Store.get('contra_startlv', 0) + 1) % LEVELS.length); Snd.sfx('select'); renderBarracks(); });
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
      if (S.lockX != null) S.camX = Math.min(S.camX, S.lockX);
      if (!S.mbDone && LV.mb != null && S.camX >= LV.mb) startMidBoss();
      if (!S.raidDone && LV.raid != null && S.camX >= LV.raid) startRaid();
      S.camDX = S.camX - prevCam;
      while (S.spawnI < S.spawnList.length && S.spawnList[S.spawnI].x <= S.camX + W + 16) spawnEnt(S.spawnList[S.spawnI++]);
      if (!S.bossTrig && S.lockX == null) {
        S.runT -= dt;
        if (S.runT <= 0) { spawnRunner(); S.runT = rand(1.3, 2.7) / (1 + S.loop * 0.35); }
        if (S.camX >= END - W - 0.5) startBoss();
      }
      updateEnts(dt);
      updateBoss(dt);
      updateShots(dt);
      updateGrens(dt);
      updateTank(dt);
      updateRaid(dt);
      updateFireZones(dt);
      updateVents(dt);
      updatePulse(dt);
      updateTitan(dt);
      updateFoundry(dt);
      if (Input.pressed.d) usePulse();
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
      if (S.clearT > 4.5) { S.clearShown = false; if (S.lv === 0) S.lv = 1; else { S.lv = 0; S.loop++; } const w = p.weapon; beginStage(); p.weapon = w; }
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
    set('w', player.inTank ? 'T' + S.tank.hp : player.weapon, (v) => { if (v.length > 1) { hud.w.textContent = 'T'; hud.w.style.background = '#566a2c'; hud.wn.textContent = 'BLINDADO ' + '■'.repeat(S.tank.hp) + '□'.repeat(Math.max(0, 6 - S.tank.hp)); } else { hud.w.textContent = v; hud.w.style.background = WCOL[v]; hud.wn.textContent = WNAME[v]; } });
    set('r', S.scrap || 0, (v) => (hud.r.textContent = v));
    const other = player.slots && player.slots[1] && !player.inTank ? player.slots[player.cur ^ 1] : '';
    set('w2', other, (v) => { hud.w2.hidden = !v; if (v) { hud.w2.textContent = v; hud.w2.style.background = WCOL[v]; } });
    set('fx', !!S.fixed, (v) => (hud.fx.hidden = !v));
    set('pb', S.bombs || 0, (v) => { hud.pb.hidden = !v; hud.pb.textContent = 'P×' + v; document.body.classList.toggle('has-bomb', v > 0); });
    if (S.ab) {
      set('ak', S.ab.k, (v) => { hud.a.hidden = false; hud.ak.textContent = ABIL[v].k; });
      const L = ABIL[S.ab.k], frac = S.ab.cd > 0 ? 1 - S.ab.cd / L.cd[clamp(S.ab.lvl, 1, 3) - 1] : 1;
      set('af', Math.round(frac * 20), (v) => { hud.ai.style.height = v * 5 + '%'; hud.a.classList.toggle('ready', v >= 20); });
    }
    if (boss.on) set('b', Math.max(0, Math.round((boss.hp / boss.max) * 100)), (v) => (hud.bb.style.width = v + '%'));
    else if (S.tb) set('b', 't' + Math.max(0, Math.round((S.tb.hp / S.tb.max) * 100)), (v) => (hud.bb.style.width = v.slice(1) + '%'));
  }
  function gameOver() {
    S.state = 'over';
    const rec = S.score > S.hi;
    if (rec) Store.set('hi_contra', S.score);
    banner(null); hud.b.hidden = true;
    Snd.stop(); Snd.sfx('gameover');
    const got = S.scrap || 0; bankScrap();
    const C = CFX.CHARS[S.ci];
    UI.gameOver('NEÓN COMMANDO', S.score, rec, [['Soldado', `${C.n} · ${CFX.SUITS[S.si].n.toLowerCase()}`], ['Misión', String(S.loop + 1)], ['Avance', Math.min(100, Math.round((S.camX / (END - Engine.W)) * 100)) + ' %'], ['Chatarra', '+' + got]],
      [['retry', 'Reintentar'], ['barracks', 'Cuartel'], ['menu', 'Menú']], { report: true, score: fmtN(S.score) });
  }
  function exit() { if (S.state !== 'over' && S.score > (S.hi || 0)) Store.set('hi_contra', S.score); bankScrap(); Snd.bank('arcade'); document.body.classList.remove('inmenu'); }
  function warp(x) { player.x = x; player.y = -10; player.ground = false; S.camX = clamp(x - 100, 0, END - Engine.W); S.spawnI = S.spawnList.findIndex((q) => q.x > S.camX + Engine.W); if (S.spawnI < 0) S.spawnI = S.spawnList.length; }
  return { start, update, render, exit, warp, retry, action, capturesStart: () => S.state === 'select',
    peek: () => ({ S, player, ents, boss, BG, grens }), dbgGo: () => beginRun(), dbgSpawn: (sp) => spawnEnt(sp), dbgTitan: () => { S.camX = END - Engine.W; S.bossTrig = true; S.mbDone = true; S.raidDone = true; player.x = S.camX + 60; startTitan(); }, get art() { build(); return A; } };
})();

