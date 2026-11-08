// =====================================================================
//  NEÓN COMMANDO · arte nuevo: el fondo vivo (titán mecánico, edificio que
//  se derrumba, bombarderos, hongo de explosión), granada, chatarra y los
//  tres personajes con sus cuatro trajes (cambio de paleta sobre el mismo rig).
// =====================================================================
const CFX = (() => {
  // ---------- titán: silueta gigante a media distancia, mira a la izquierda
  // f = cuadro de caminata 0..3; atk = brazo-cañón levantado
  function titan(f, atk) {
    const { c, g } = mk(140, 152);
    const B = '#34285e', M = '#433574', L = '#5e4c9c', D = '#261d48', K = '#1c1538', LIT = '#ffb070', EYE = '#ff3b5c';
    const ox = 88, bob = f % 2 ? 1 : 0, st = [-7, 0, 7, 0][f];
    // piernas (la de atrás más oscura)
    const leg = (side, s, col, colL) => {
      const hx = ox + side, hy = 94 + bob, kx = hx + s * 0.55, ky = 120, fx = hx + s, fy = 147;
      line(g, hx, hy, kx, ky, col, 11); line(g, kx, ky, fx, fy - 4, col, 9);
      disc(g, kx, ky, 6, colL); disc(g, kx, ky, 3, K);
      R(g, col, fx - 11, fy - 6, 20, 7); R(g, colL, fx - 11, fy - 6, 20, 1); R(g, K, fx - 11, fy, 20, 1);
    };
    leg(10, -st, D, B); leg(-10, st, B, L);
    // pelvis y cintura
    R(g, D, ox - 20, 84 + bob, 40, 12); R(g, M, ox - 20, 84 + bob, 40, 2);
    // torso trapezoidal con placas
    poly(g, [[ox - 30, 38 + bob], [ox + 28, 38 + bob], [ox + 20, 88 + bob], [ox - 22, 88 + bob]], B);
    poly(g, [[ox - 30, 38 + bob], [ox - 22, 38 + bob], [ox - 16, 88 + bob], [ox - 22, 88 + bob]], L);
    for (let y = 50; y < 84; y += 9) R(g, D, ox - 18, y + bob, 34, 1);
    for (const [x, y] of [[-12, 46], [8, 46], [-8, 72], [12, 72], [2, 80]]) R(g, LIT, ox + x, y + bob, 2, 1);
    // núcleo del pecho
    disc(g, ox - 2, 60 + bob, 7, K); disc(g, ox - 2, 60 + bob, 5, '#ff7a1a'); disc(g, ox - 2, 60 + bob, 2.5, '#ffe08a');
    // brazo de atrás
    const sw = [4, 0, -4, 0][f];
    line(g, ox + 26, 46 + bob, ox + 32 + sw, 92 + bob, D, 9); R(g, D, ox + 26 + sw, 90 + bob, 12, 10);
    // hombreras
    disc(g, ox + 24, 44 + bob, 12, M); disc(g, ox + 22, 42 + bob, 10, B);
    // cabeza con visor
    R(g, B, ox - 14, 20 + bob, 26, 18); R(g, L, ox - 14, 20 + bob, 26, 2); R(g, D, ox + 8, 22 + bob, 4, 16);
    R(g, K, ox - 15, 27 + bob, 22, 5); R(g, EYE, ox - 14, 28 + bob, 18, 2); R(g, '#ffd0da', ox - 13, 28 + bob, 4, 1);
    line(g, ox + 6, 20 + bob, ox + 10, 4 + bob, D, 2); R(g, f % 2 ? EYE : '#ffd0da', ox + 9, 2 + bob, 3, 3);
    // brazo de adelante: colgando o levantado como cañón
    disc(g, ox - 28, 44 + bob, 13, M); disc(g, ox - 30, 42 + bob, 10, L); R(g, K, ox - 38, 46 + bob, 16, 1);
    if (atk) {
      line(g, ox - 32, 48 + bob, ox - 70, 52 + bob, B, 10);
      R(g, D, ox - 82, 46 + bob, 16, 13); R(g, L, ox - 82, 46 + bob, 16, 2); R(g, K, ox - 84, 50 + bob, 3, 5); R(g, EYE, ox - 85, 51 + bob, 2, 3);
    } else {
      line(g, ox - 32, 50 + bob, ox - 36 - sw, 96 + bob, B, 10);
      R(g, D, ox - 44 - sw, 94 + bob, 14, 12); R(g, M, ox - 44 - sw, 94 + bob, 14, 2);
      for (let k = 0; k < 3; k++) R(g, K, ox - 42 - sw + k * 4, 104 + bob, 2, 4);
    }
    return c;
  }
  // rayo del cañón (aditivo)
  function beam() {
    const { c, g } = mk(160, 9);
    for (let x = 0; x < 160; x++) {
      const a = Math.min(1, x / 12);
      g.fillStyle = `rgba(255,59,92,${(0.35 * a).toFixed(3)})`; g.fillRect(x, 0, 1, 9);
      g.fillStyle = `rgba(255,140,170,${(0.7 * a).toFixed(3)})`; g.fillRect(x, 2, 1, 5);
      g.fillStyle = `rgba(255,240,245,${(0.95 * a).toFixed(3)})`; g.fillRect(x, 3, 1, 3);
    }
    return c;
  }
  // edificio lejano que se puede derrumbar (mismo tono que el horizonte)
  function tower(seed) {
    const { c, g } = mk(34, 96);
    const r = rng32(seed);
    R(g, '#43275f', 2, 10, 30, 86); R(g, '#57347c', 2, 10, 2, 86); R(g, '#36204e', 29, 10, 3, 86);
    R(g, '#43275f', 8, 2, 18, 8); R(g, '#43275f', 16, 0, 1, 2); R(g, '#ff3b5c', 16, 0);
    for (let y = 16; y < 92; y += 6) for (let x = 6; x < 28; x += 5) if (r() < 0.45) R(g, r() < 0.6 ? '#ffd08a' : '#ff9ac8', x, y, 2, 3);
    return c;
  }
  // bombardero lejano (14×6) con luz que parpadea
  function bomber(on) {
    const { c, g } = mk(16, 7);
    R(g, '#1e1636', 1, 3, 14, 2); R(g, '#1e1636', 5, 0, 4, 7); R(g, '#1e1636', 12, 1, 2, 3);
    if (on) R(g, '#ff3b5c', 0, 3);
    return c;
  }
  // hongo de explosión en 8 etapas: bola de fuego → columna → humo
  function mushroom(k) {
    const { c, g } = mk(72, 96);
    const t = k / 7, base = 94;
    const fire = ['#fff3c0', '#ffd27a', '#ff9a3c', '#e8552c'], smoke = ['#8a6a8e', '#6c4f78', '#4e3a62'];
    const hot = Math.max(0, 1 - t * 1.6);
    const capY = base - 18 - t * 58, capR = 8 + t * 20, stemW = 4 + t * 6;
    // columna
    for (let y = capY; y < base; y += 2) {
      const w = stemW * (0.7 + 0.3 * Math.sin(y * 0.4));
      R(g, hot > 0.4 ? fire[2] : smoke[1], 36 - w / 2, y, w, 2);
      if (hot > 0.2) R(g, fire[1], 36 - w / 4, y, w / 2, 2);
    }
    // base que se expande sobre el suelo
    ellipse(g, 36, base - 2, 10 + t * 24, 3 + t * 3, hot > 0.3 ? fire[3] : smoke[2]);
    // casquete: varios discos
    const puffs = [[0, 0, 1], [-0.7, 0.25, 0.7], [0.7, 0.25, 0.7], [-0.35, -0.35, 0.65], [0.35, -0.35, 0.65]];
    for (const [dx, dy, s] of puffs) disc(g, 36 + dx * capR, capY + dy * capR, capR * s, hot > 0.5 ? fire[2] : smoke[0]);
    for (const [dx, dy, s] of puffs) disc(g, 36 + dx * capR, capY + dy * capR + capR * 0.25, capR * s * 0.7, hot > 0.25 ? fire[1] : smoke[1]);
    if (hot > 0) disc(g, 36, capY + capR * 0.35, capR * 0.45 * (0.5 + hot), fire[0]);
    // anillo de condensación
    if (t > 0.3) ellipse(g, 36, capY + capR * 0.9, capR * 1.25, 2, 'rgba(255,220,200,0.35)');
    return c;
  }
  // granada y chatarra
  function grenade() {
    const { c, g } = mk(7, 8);
    disc(g, 3.5, 4.5, 3, '#4a5a2a'); R(g, '#6e8240', 2, 2, 2, 2); R(g, '#2a3218', 1, 5, 5, 1);
    R(g, '#9aa0b4', 3, 0, 2, 2); R(g, '#ffd04a', 5, 1);
    return outline(c);
  }
  function scrap(k) {
    const { c, g } = mk(7, 7);
    if (k === 0) { disc(g, 3.5, 3.5, 3, '#8a90a2'); disc(g, 3.5, 3.5, 1.2, '#2e3140'); R(g, '#d8dce8', 2, 1, 2, 1); }
    else if (k === 1) { R(g, '#8a90a2', 1, 2, 5, 3); R(g, '#d8dce8', 1, 2, 5, 1); R(g, '#5a5f70', 3, 0, 1, 7); }
    else { poly(g, [[1, 1], [6, 2], [5, 6], [0, 5]], '#a8763a'); R(g, '#e0a860', 1, 1, 3, 1); }
    return outline(c);
  }
  // ---------- personajes y trajes
  const CHARS = [
    { id: 'rayo', n: 'Rayo', role: 'Equilibrado', w: 'R', wn: 'Rifle', wd: 'Disparo rápido y preciso.', ab: 'gren', abn: 'Granada', abd: 'Lanza una granada en arco que revienta todo lo cercano.',
      base: { skin: '#f2a970', skinD: '#c47848', hair: '#3a2418', eye: '#1b1020' },
      fit: { band: '#e43d3a', bandD: '#9e2530', vest: '#4f8a35', vestL: '#86c654', vestD: '#355f24', pants: '#3a5cb0', pantsD: '#26397a', boot: '#6b4428', bootD: '#3a2416' } },
    { id: 'brasa', n: 'Brasa', role: 'Pesado', w: 'E', wn: 'Escopeta', wd: 'Abanico de perdigones de corto alcance.', ab: 'wall', abn: 'Barrera', abd: 'Un escudo que bloquea las balas unos segundos.',
      base: { skin: '#b8784a', skinD: '#8a5432', hair: '#141016', eye: '#1b1020' },
      fit: { band: '#ff8a1e', bandD: '#b0480c', vest: '#5d5d66', vestL: '#8c8c97', vestD: '#3b3b43', pants: '#4d3c2b', pantsD: '#30261b', boot: '#2b2b30', bootD: '#151518' } },
    { id: 'volt', n: 'Volt', role: 'Ágil', w: 'V', wn: 'Láser', wd: 'Atraviesa a varios enemigos en línea.', ab: 'dash', abn: 'Impulso', abd: 'Un tirón hacia adelante sin recibir daño.',
      base: { skin: '#f5c49a', skinD: '#c98a62', hair: '#e8e4f0', eye: '#1b1020' },
      fit: { band: '#4fe3ff', bandD: '#1f8aa8', vest: '#2c2c42', vestL: '#5c5c82', vestD: '#1b1b2a', pants: '#3b2b60', pantsD: '#251b40', boot: '#1f1f2b', bootD: '#101016' } },
  ];
  const SUITS = [
    { id: 'base', n: 'Original', price: 0 },
    { id: 'mil', n: 'Militar', price: 250, camo: ['#3e4723', '#7a6a44'],
      o: { band: '#5b6b2e', bandD: '#3a4520', vest: '#5f6b38', vestL: '#8a9450', vestD: '#3f4824', pants: '#6f6240', pantsD: '#4f452c', boot: '#3a2c1c', bootD: '#22190f', strap: '#3a4520' } },
    { id: 'cyb', n: 'Cyborg', price: 250,
      o: { band: '#ff3b3b', bandD: '#8a1a1a', vest: '#8f99ad', vestL: '#d2dae8', vestD: '#5a6274', pants: '#4a5266', pantsD: '#2e3444', boot: '#3a4050', bootD: '#1e222c', strap: '#2e3444', eye: '#ff3b3b', skin: '#a8b0c2', skinD: '#6e7688', hair: '#4a5266' } },
    { id: 'haz', n: 'Protección', price: 250,
      o: { band: '#1b1b1f', bandD: '#0f0f12', vest: '#e8c43a', vestL: '#ffe27a', vestD: '#b0901e', pants: '#d8b432', pantsD: '#a08420', boot: '#1e1e22', bootD: '#0e0e10', strap: '#2a2a2e', hair: '#e0bc36', belt: '#2a2a2e', skin: '#f2c8a0', skinD: '#c49a72' } },
  ];
  const palette = (ci, si) => Object.assign({}, HERO, CHARS[ci].base, CHARS[ci].fit, SUITS[si].o || {});
  // camuflaje: salpica manchas sobre el chaleco y el pantalón
  function camo(c, P, cols) {
    const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height), px = d.data;
    const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const targets = [P.vest, P.vestL, P.vestD, P.pants, P.pantsD].map(hex), spots = cols.map(hex);
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4;
      if (!targets.some((t) => t[0] === px[i] && t[1] === px[i + 1] && t[2] === px[i + 2])) continue;
      const n = Math.sin(x * 1.7 + y * 0.9) + Math.sin(x * 0.6 - y * 1.3) * 0.8;
      if (n > 0.9) [px[i], px[i + 1], px[i + 2]] = spots[0]; else if (n < -1.1) [px[i], px[i + 1], px[i + 2]] = spots[1];
    }
    g.putImageData(d, 0, 0);
    return c;
  }
  const heroCache = {};
  function hero(ci, si) {
    const k = ci + ':' + si;
    if (heroCache[k]) return heroCache[k];
    const P = palette(ci, si), s = SUITS[si];
    return (heroCache[k] = buildHeroArt(P, s.camo ? (cv) => camo(cv, P, s.camo) : null));
  }
  // retrato para la interfaz (dataURL al triple de tamaño)
  const portCache = {};
  function portrait(ci, si) {
    const k = ci + ':' + si;
    if (portCache[k]) return portCache[k];
    const P = palette(ci, si), s = SUITS[si];
    let cv = heroPose(P, { aim: 'fwd', tf: 0 });
    if (s.camo) cv = camo(cv, P, s.camo);
    return (portCache[k] = cv.toDataURL());
  }

  // ---------- armas: trazadoras, perdigones, fogonazos y el perfil del rayo
  function tracer(len, h, head, mid, tail) {
    const { c, g } = mk(len, h);
    for (let x = 0; x < len; x++) {
      const t = x / (len - 1), col = t > 0.8 ? head : t > 0.4 ? mid : tail;
      const hh = t > 0.6 ? h : Math.max(1, h - 1);
      g.globalAlpha = Math.min(1, 0.25 + t);
      R(g, col, x, Math.floor((h - hh) / 2), 1, hh);
    }
    return c;
  }
  function pellet() { const { c, g } = mk(5, 5); disc(g, 2.5, 2.5, 2.4, '#ff9a3c'); disc(g, 2.5, 2.5, 1.4, '#fff3c0'); return c; }
  function flashStar(r, cols) {
    const { c, g } = mk(r * 2 + 2, r * 2 + 2), m = r + 1;
    disc(g, m, m, r * 0.55, cols[0]); disc(g, m, m, r * 0.3, cols[1]);
    for (const [dx, dy, l] of [[1, 0, 1], [0.7, -0.7, 0.6], [0.7, 0.7, 0.6], [0, -1, 0.45], [0, 1, 0.45]]) line(g, m, m, m + dx * r * l, m + dy * r * l, cols[0], 2);
    line(g, m, m, m + r, m, cols[1], 1);
    return c;
  }
  function flashCone() {
    const { c, g } = mk(20, 16);
    poly(g, [[0, 5], [12, 0], [19, 8], [12, 16], [0, 11]], '#ff8a1e');
    poly(g, [[0, 6], [10, 3], [15, 8], [10, 13], [0, 10]], '#ffd27a');
    poly(g, [[0, 7], [8, 6], [10, 8], [8, 10], [0, 9]], '#fff6d8');
    return c;
  }
  function beamProfile() {
    const { c, g } = mk(4, 9);
    const a = [0.08, 0.2, 0.45, 0.85, 1, 0.85, 0.45, 0.2, 0.08];
    a.forEach((v, y) => { g.fillStyle = `rgba(255,255,255,${v})`; g.fillRect(0, y, 4, 1); });
    return c;
  }
  const weaponFx = () => ({
    tracer: tracer(12, 3, '#ffffff', '#fff0a0', '#ff9a3c'), tracerM: tracer(10, 2, '#fff3c0', '#ff7a4a', '#c8323a'),
    pellet: pellet(), beam: beamProfile(),
    fl: { R: flashStar(6, ['#ffd27a', '#ffffff']), M: flashStar(5, ['#ff9a5a', '#fff3c0']), E: flashCone(), S: flashCone(), V: flashStar(6, ['#4fe3ff', '#ffffff']), L: flashStar(8, ['#ff4f9a', '#ffffff']), F: flashStar(6, ['#ff7a1a', '#ffe08a']) },
  });

  // ---------- vehículos y piezas de la fase 1
  // blindado de la resistencia (mira a la derecha). f = cuadro de orugas, up = cañón en diagonal
  function tankP(f, up) {
    const { c, g } = mk(52, 34);
    const H = '#566a2c', HL = '#7f9a44', HD = '#36451a', TR = '#24261e', TL = '#4a4c40';
    // orugas
    R(g, TR, 3, 24, 44, 9); R(g, TL, 3, 24, 44, 1);
    for (let x = 5 + (f % 2) * 3; x < 46; x += 6) R(g, TL, x, 30, 3, 2);
    for (const x of [8, 16, 24, 32, 40]) { disc(g, x, 28.5, 3.2, '#3a3c32'); disc(g, x, 28.5, 1.4, '#8a8c7a'); }
    // casco
    poly(g, [[1, 24], [6, 15], [44, 15], [50, 22], [48, 25], [2, 25]], H);
    R(g, HL, 6, 15, 38, 1); R(g, HD, 2, 23, 47, 2);
    R(g, '#ff8a1e', 10, 19, 12, 2); R(g, '#ff8a1e', 28, 19, 6, 2);
    // torreta y cañón
    R(g, H, 16, 8, 18, 8); R(g, HL, 16, 8, 18, 1); R(g, HD, 31, 9, 3, 7);
    R(g, HD, 19, 6, 6, 2); R(g, '#9ff3ff', 21, 6, 2, 1);
    if (up) { line(g, 30, 10, 42, -1, '#2c3218', 3); line(g, 30, 9, 41, -1, '#6e7a52', 1); }
    else { R(g, '#2c3218', 33, 10, 18, 3); R(g, '#6e7a52', 33, 10, 18, 1); R(g, '#1a1c14', 48, 9, 3, 5); }
    // antena con banderín
    R(g, '#1a1c14', 18, 0, 1, 8); R(g, '#ff8a1e', 19, 0, 4, 2);
    return outline(c);
  }
  // tanque enemigo Magnus (mira a la izquierda), más grande
  function tankE(f, hurt) {
    const { c, g } = mk(72, 42);
    const H = hurt ? '#6a4a52' : '#3c4552', HL = hurt ? '#9a6a74' : '#62707f', HD = hurt ? '#3a2228' : '#262c36', TR = '#18191e';
    R(g, TR, 4, 30, 62, 11); R(g, '#3a3c46', 4, 30, 62, 1);
    for (let x = 6 + (f % 2) * 4; x < 64; x += 8) R(g, '#3a3c46', x, 38, 4, 2);
    for (const x of [10, 20, 30, 40, 50, 60]) { disc(g, x, 35.5, 4, '#2a2c34'); disc(g, x, 35.5, 1.8, '#7a7e8c'); }
    poly(g, [[2, 29], [10, 17], [62, 17], [70, 28], [68, 31], [3, 31]], H);
    R(g, HL, 10, 17, 52, 1); R(g, HD, 3, 29, 66, 2);
    for (let x = 14; x < 60; x += 9) R(g, '#d93a2e', x, 22, 5, 2);
    R(g, H, 28, 7, 28, 11); R(g, HL, 28, 7, 28, 1); R(g, HD, 28, 15, 28, 2);
    R(g, '#1a1c22', 2, 10, 28, 4); R(g, '#5a606c', 2, 10, 28, 1); R(g, '#0e0f12', 0, 9, 4, 6);
    R(g, '#1a1c22', 52, 12, 10, 3); R(g, '#ff3b5c', 36, 9, 6, 2);
    R(g, '#1a1c22', 46, 0, 1, 7); R(g, '#ff3b5c', 45, 0, 3, 2);
    return outline(c);
  }
  function shell() { const { c, g } = mk(8, 5); R(g, '#ffd27a', 1, 1, 6, 3); R(g, '#fff6d8', 4, 1, 3, 2); R(g, '#c8643a', 0, 2, 2, 1); return c; }
  // muro de hormigón con fierros; k = 0 sano, 1 trizado, 2 roto
  function wall(k) {
    const { c, g } = mk(20, 60);
    const r = rng32(30 + k);
    R(g, '#6e6a7e', 2, 0, 16, 60); R(g, '#8c88a0', 2, 0, 2, 60); R(g, '#4e4a5e', 16, 0, 2, 60);
    for (let y = 6; y < 60; y += 10) R(g, '#5a566a', 2, y, 16, 1);
    for (let i = 0; i < 6 + k * 10; i++) R(g, '#3a3648', 3 + r() * 13, r() * 58, 1 + (r() * 2 | 0), 1 + (r() * 3 | 0));
    if (k >= 1) { line(g, 6, 8, 12, 22, '#2a2636', 1); line(g, 12, 22, 9, 36, '#2a2636', 1); }
    if (k >= 2) { R(g, '#2a2636', 4, 0, 12, 6); line(g, 14, 30, 8, 48, '#2a2636', 1); for (const x of [6, 13]) R(g, '#a8643a', x, 0, 1, 10); }
    return outline(c);
  }
  // bombardero a baja altura (cruza en primer plano)
  function bomberNear(on) {
    const { c, g } = mk(60, 20);
    poly(g, [[2, 10], [10, 6], [50, 6], [58, 10], [50, 13], [10, 13]], '#2a2440');
    R(g, '#3e3660', 10, 6, 40, 1);
    poly(g, [[22, 9], [34, 9], [26, 0], [20, 0]], '#221d36'); poly(g, [[22, 11], [34, 11], [26, 20], [20, 20]], '#1a1630');
    poly(g, [[48, 8], [56, 8], [58, 2], [54, 2]], '#221d36');
    R(g, '#9ff3ff', 6, 8, 3, 2);
    if (on) { R(g, '#ff3b5c', 26, 0, 2, 2); R(g, '#ffb070', 58, 9, 2, 2); }
    return outline(c);
  }
  function napalm() { const { c, g } = mk(5, 9); R(g, '#3a3c46', 1, 2, 3, 6); R(g, '#d93a2e', 1, 6, 3, 1); R(g, '#6e7080', 0, 0, 5, 2); return outline(c); }

  // ---------- fase 2: perro robot (mira a la izquierda) y rejilla de respiradero
  function dog(f, hurt) {
    const { c, g } = mk(28, 18);
    const B = hurt ? '#e8e0f0' : '#4a5262', L = hurt ? '#ffffff' : '#7a8496', D = hurt ? '#b8b0c8' : '#2a2f3a';
    const legs = [[[6, 12], [10, 15], [18, 13], [22, 16]], [[4, 15], [9, 12], [20, 16], [23, 12]]][f % 2];
    for (const [x, y] of legs) line(g, x + 2, 11, x, y + 1, D, 2);
    R(g, B, 5, 6, 17, 6); R(g, L, 5, 6, 17, 1); R(g, D, 5, 11, 17, 1);
    for (let x = 8; x < 20; x += 4) R(g, D, x, 8, 1, 3);
    poly(g, [[0, 6], [5, 3], [8, 5], [8, 10], [2, 10]], B); R(g, L, 2, 4, 4, 1);
    R(g, '#ff3b5c', 2, 6, 2, 1); R(g, '#1a1c22', 0, 9, 4, 1);
    poly(g, [[6, 4], [7, 0], [9, 4]], D);
    line(g, 22, 7, 26, 3, D, 1); R(g, '#ff3b5c', 26, 2, 1, 1);
    return outline(c);
  }
  function grate(hot) {
    const { c, g } = mk(18, 5);
    R(g, '#2a2236', 0, 0, 18, 5); R(g, '#4a4060', 0, 0, 18, 1);
    for (let x = 2; x < 16; x += 3) R(g, hot ? '#ff8a1e' : '#120e1a', x, 1, 2, 3);
    return c;
  }
  function pulseRing() {
    const { c, g } = mk(66, 66);
    disc(g, 33, 33, 32, 'rgba(160,255,240,0.9)');
    g.globalCompositeOperation = 'destination-out'; disc(g, 33, 33, 28, '#000'); g.globalCompositeOperation = 'source-over';
    disc(g, 33, 33, 27, 'rgba(120,240,220,0.15)');
    return c;
  }

  // ---------- nivel 2: la fundición (donde se fabrican los titanes)
  function skyFoundry() {
    const { c, g } = mk(64, 216);
    const stops = [[0, [20, 12, 18]], [60, [44, 20, 28]], [120, [86, 34, 34]], [170, [150, 64, 40]], [216, [196, 92, 44]]];
    const at = (y) => { for (let i = 0; i < stops.length - 1; i++) { const [y0, c0] = stops[i], [y1, c1] = stops[i + 1]; if (y <= y1) { const t = (y - y0) / (y1 - y0); return c0.map((v, k) => v + (c1[k] - v) * t); } } return stops[stops.length - 1][1]; };
    for (let y = 0; y < 216; y++) for (let x = 0; x < 64; x++) { const col = at(y), q = 16, d = bayer(x, y) * q; g.fillStyle = `rgb(${Math.floor((col[0] + d) / q) * q},${Math.floor((col[1] + d) / q) * q},${Math.floor((col[2] + d) / q) * q})`; g.fillRect(x, y, 1, 1); }
    return c;
  }
  function farFoundry() {
    const { c, g } = mk(320, 112);
    const r = rng32(61);
    let x = 0;
    while (x < 320) {
      const w = 20 + ((r() * 30) | 0), h = 26 + ((r() * 50) | 0);
      R(g, '#3a1e26', x, 112 - h, w, h); R(g, '#4a2830', x, 112 - h, 1, h);
      if (r() < 0.55) { const cx = x + 4 + ((r() * (w - 8)) | 0), ch = 20 + ((r() * 26) | 0); R(g, '#3a1e26', cx, 112 - h - ch, 4, ch); R(g, '#ff7a3a', cx, 112 - h - ch, 4, 1); for (let k = 0; k < 4; k++) disc(g, cx + 2 + k * 3, 112 - h - ch - 4 - k * 4, 3 + k, 'rgba(90,60,70,0.55)'); }
      for (let k = 0; k < 4; k++) if (r() < 0.5) R(g, '#ff9a4a', x + 2 + ((r() * (w - 4)) | 0), 112 - h + 4 + ((r() * (h - 8)) | 0), 2, 1);
      x += w + ((r() * 6) | 0);
    }
    return c;
  }
  function midFoundry() {
    const { c, g } = mk(384, 112);
    const r = rng32(71);
    let x = 0;
    while (x < 384) {
      const k = r();
      if (k < 0.3) { // tanque cilíndrico
        const w = 28 + ((r() * 14) | 0), h = 40 + ((r() * 20) | 0);
        R(g, '#2c1a22', x, 112 - h, w, h); ellipse(g, x + w / 2, 112 - h, w / 2, 4, '#3c2430'); R(g, '#40262f', x + 3, 112 - h, 2, h);
        for (let y = 112 - h + 8; y < 108; y += 9) R(g, '#22141a', x, y, w, 1);
        x += w + 6;
      } else if (k < 0.5) { // grúa de celosía
        const h = 80 + ((r() * 20) | 0);
        R(g, '#2c1a22', x + 4, 112 - h, 4, h); for (let y = 112 - h; y < 112; y += 6) line(g, x + 4, y, x + 8, y + 6, '#22141a', 1);
        R(g, '#2c1a22', x - 30, 112 - h, 64, 3); R(g, '#ff3b3b', x + 32, 112 - h - 1, 1, 1); R(g, '#3a242c', x - 22, 112 - h + 3, 1, 22); R(g, '#3a242c', x - 26, 112 - h + 25, 9, 5);
        x += 40;
      } else { // galpón con ventanas encendidas
        const w = 36 + ((r() * 40) | 0), h = 34 + ((r() * 40) | 0), top = 112 - h;
        R(g, '#26161e', x, top, w, h); poly(g, [[x, top], [x + w / 2, top - 8], [x + w, top]], '#26161e'); R(g, '#36202a', x, top, 2, h);
        for (let wy = top + 6; wy < 104; wy += 9) for (let wx = x + 4; wx < x + w - 5; wx += 6) R(g, r() < 0.4 ? '#ffb05a' : r() < 0.5 ? '#ff6a3a' : '#160c12', wx, wy, 3, 4);
        x += w + 4 + ((r() * 10) | 0);
      }
    }
    for (let k = 0; k < 384; k += 24) { R(g, '#1c1016', k, 96, 24, 3); R(g, '#3a242c', k + 10, 99, 2, 13); }
    R(g, '#1c1016', 0, 104, 384, 8);
    return c;
  }
  function nearFoundry() {
    const { c, g } = mk(256, 80);
    R(g, '#22161c', 0, 6, 256, 6); R(g, '#3a2630', 0, 6, 256, 1); R(g, '#160e12', 0, 11, 256, 1);
    R(g, '#22161c', 0, 16, 256, 4); R(g, '#3a2630', 0, 16, 256, 1);
    for (const px of [30, 150]) { R(g, '#1c1216', px, 20, 12, 60); R(g, '#2e1e26', px, 20, 2, 60); disc(g, px + 6, 9, 5, '#2e1e26'); disc(g, px + 6, 9, 2, '#ff6a3a'); }
    for (let x = 6; x < 256; x += 40) { R(g, '#ff8a3a', x, 8, 2, 2); }
    return c;
  }
  // prensa hidráulica: vástago y cabezal
  function pressHead() {
    const { c, g } = mk(30, 16);
    R(g, '#4a4450', 0, 0, 30, 14); R(g, '#7a7484', 0, 0, 30, 2); R(g, '#2a2630', 0, 12, 30, 2);
    for (let x = 2; x < 28; x += 5) { R(g, '#ffd23f', x, 5, 3, 3); R(g, '#16181c', x + 3, 5, 2, 3); }
    R(g, '#1a1820', 2, 14, 26, 2);
    return outline(c);
  }
  function pressRod() { const { c, g } = mk(8, 8); R(g, '#8a8494', 0, 0, 8, 8); R(g, '#c4c0cc', 1, 0, 2, 8); R(g, '#4a4450', 6, 0, 2, 8); return c; }
  function reticle() { const { c, g } = mk(9, 9); for (const [x, y, w, h] of [[4, 0, 1, 3], [4, 6, 1, 3], [0, 4, 3, 1], [6, 4, 3, 1]]) R(g, '#ff8a1e', x, y, w, h); R(g, '#fff3c0', 4, 4); return c; }
  return { titan, beam, tower, bomber, mushroom, grenade, scrap, CHARS, SUITS, hero, portrait, weaponFx, tankP, tankE, shell, wall, bomberNear, napalm, dog, grate, pulseRing, reticle, skyFoundry, farFoundry, midFoundry, nearFoundry, pressHead, pressRod };
})();
