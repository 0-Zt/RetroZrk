// =====================================================================
//  GAS RALLY · pistas especiales (arena de acrobacias, pueblo nevado,
//  cuarto de juguetes): sprites propios y el dibujo de cada mapa.
//  Todo es pixel art generado por código; el juego vive en rally.js.
// =====================================================================
const RT = (() => {
  // ---------------- sprites
  // rampa de salto (para calles verticales; se rota para las horizontales)
  function ramp() {
    const { c, g } = mk(18, 22);
    g.translate(1, 1);
    R(g, 'rgba(0,0,0,0.35)', 2, 2, 15, 18);
    for (let y = 0; y < 20; y++) {
      const h = 1 - Math.abs(y - 9.5) / 10;
      const col = h > 0.75 ? '#e8d8b0' : h > 0.5 ? '#c8a878' : h > 0.25 ? '#a07c50' : '#7a5a36';
      R(g, col, 1, y, 14, 1);
      if (y % 3 === 0) R(g, 'rgba(60,40,20,0.35)', 1, y, 14, 1);
    }
    R(g, '#ff8a1e', 0, 0, 1, 20); R(g, '#ff8a1e', 15, 0, 1, 20);
    for (let y = 0; y < 20; y += 4) { R(g, '#f4f1ea', 0, y, 1, 2); R(g, '#f4f1ea', 15, y, 1, 2); }
    R(g, '#ffffff', 3, 9, 10, 1);
    g.setTransform(1, 0, 0, 1, 0, 0);
    return outline(c);
  }
  // aro de fuego sobre la rampa
  function fireRing(f) {
    const { c, g } = mk(30, 12);
    for (let k = 0; k < 40; k++) {
      const a = (k / 40) * Math.PI * 2, x = 15 + Math.cos(a) * 12, y = 6 + Math.sin(a) * 3.6;
      const fl = ((k + f * 3) % 5) / 5;
      disc(g, x, y - fl * 1.5, 2.2 - fl * 0.6, fl < 0.4 ? '#ff4a1e' : '#ff9a2e');
      if (fl > 0.5) R(g, '#ffe45c', x, y - 2 - fl);
    }
    for (let k = 0; k < 40; k += 3) { const a = (k / 40) * Math.PI * 2; R(g, '#fff6c8', 15 + Math.cos(a) * 12, 6 + Math.sin(a) * 3.6); }
    return c;
  }
  // monster truck (patrulla de la arena)
  function monster(P, f) {
    const { c, g } = mk(24, 26);
    g.translate(1, 1);
    for (const [x, y] of [[0, 1], [15, 1], [0, 15], [15, 15]]) {
      R(g, '#15131f', x, y, 7, 8);
      for (let k = f ? 0 : 1; k < 8; k += 2) R(g, '#4a4858', x, y + k, 7, 1);
      R(g, '#2a2836', x + 2, y + 2, 3, 4); R(g, '#8a8898', x + 3, y + 3, 1, 2);
    }
    R(g, '#3a3848', 5, 4, 12, 16);
    R(g, P.d, 6, 3, 10, 18); R(g, P.b, 6, 3, 9, 17); R(g, P.l, 6, 3, 9, 2); R(g, P.l, 6, 3, 1, 17);
    R(g, '#1b2240', 7, 7, 8, 3); R(g, '#9be8ff', 8, 7, 3, 1);
    R(g, '#d8d4e4', 7, 11, 8, 1); R(g, '#d8d4e4', 7, 15, 8, 1); R(g, '#d8d4e4', 7, 11, 1, 5); R(g, '#d8d4e4', 14, 11, 1, 5);
    R(g, f ? '#5a1c2a' : '#ff4d5e', 7, 12, 4, 2); R(g, f ? '#58a8ff' : '#1c2a5a', 11, 12, 4, 2);
    R(g, '#fff1a0', 7, 3); R(g, '#fff1a0', 14, 3); R(g, '#ff3d4f', 7, 20); R(g, '#ff3d4f', 14, 20);
    g.setTransform(1, 0, 0, 1, 0, 0);
    return outline(c);
  }
  // patrulla 4x4 con cadenas (pueblo nevado)
  function suv(P, f) {
    const { c, g } = mk(18, 20);
    g.translate(1, 1);
    for (const [x, y] of [[0, 2], [13, 2], [0, 12], [13, 12]]) {
      R(g, '#1b1a26', x, y, 3, 5);
      for (let k = f ? 0 : 1; k < 5; k += 2) R(g, '#c8d0dc', x, y + k, 3, 1);
    }
    R(g, P.b, 2, 0, 12, 18); R(g, P.l, 2, 0, 1, 18); R(g, P.d, 13, 0, 1, 18); R(g, P.d, 2, 17, 12, 1);
    R(g, '#f2f5ff', 3, 0, 10, 2);
    R(g, '#1b2240', 4, 3, 8, 3); R(g, '#9be8ff', 5, 3, 2, 1);
    R(g, '#3a3848', 4, 7, 8, 7); for (let y = 8; y < 14; y += 2) R(g, '#6a6878', 4, y, 8, 1);
    R(g, '#e9e6f2', 4, 6, 8, 1);
    R(g, f ? '#5a1c2a' : '#ff4d5e', 4, 6, 4, 1); R(g, f ? '#58a8ff' : '#1c2a5a', 8, 6, 4, 1);
    R(g, '#fff1a0', 3, 0); R(g, '#fff1a0', 12, 0); R(g, '#ff3d4f', 3, 17); R(g, '#ff3d4f', 12, 17);
    g.setTransform(1, 0, 0, 1, 0, 0);
    return outline(c);
  }
  // patrulla de juguete a cuerda, con llave dorada que gira
  function windup(P, f) {
    const { c, g } = mk(20, 22);
    g.translate(2, 2);
    for (const [x, y] of [[0, 3], [13, 3], [0, 11], [13, 11]]) { disc(g, x + 1.5, y + 2, 2.4, '#1b1a26'); R(g, '#ffd23f', x + 1, y + 1, 1, 1); }
    ellipse(g, 8, 8.5, 6.4, 8.8, P.d); ellipse(g, 7.6, 8, 6, 8.4, P.b); ellipse(g, 6, 5, 2.4, 3.2, P.l);
    ellipse(g, 8, 4.5, 4, 2, '#1b2240'); R(g, '#9be8ff', 6, 3, 2, 1);
    disc(g, 5, 0.8, 1.4, '#ffffff'); disc(g, 11, 0.8, 1.4, '#ffffff'); R(g, '#1b1a26', 5, 0); R(g, '#1b1a26', 11, 0);
    R(g, '#e9e6f2', 5, 8, 6, 2); R(g, '#ff4d5e', 5, 8, 3, 2); R(g, '#1c2a5a', 8, 8, 3, 2);
    R(g, '#b8860c', 7, 12, 2, 3);
    if (f) { R(g, '#ffd23f', 3, 14, 10, 2); disc(g, 3, 15, 1.8, '#ffd23f'); disc(g, 13, 15, 1.8, '#ffd23f'); R(g, '#fff2a0', 4, 14, 3, 1); }
    else { R(g, '#ffd23f', 7, 12, 2, 6); disc(g, 8, 18, 1.8, '#ffd23f'); R(g, '#fff2a0', 7, 13, 1, 3); }
    g.setTransform(1, 0, 0, 1, 0, 0);
    return outline(c);
  }
  // quitanieves (tráfico civil del pueblo nevado)
  function plow(f) {
    const { c, g } = mk(22, 26);
    g.translate(1, 1);
    R(g, '#1b1a26', 3, 6, 3, 5); R(g, '#1b1a26', 14, 6, 3, 5); R(g, '#1b1a26', 3, 16, 3, 5); R(g, '#1b1a26', 14, 16, 3, 5);
    poly(g, [[0, 2], [20, 2], [19, 5], [1, 5]], '#ff8a1e');
    for (let x = 1; x < 20; x += 4) R(g, '#1b1424', x, 3, 2, 1);
    R(g, '#c8c4d0', 1, 1, 18, 1);
    R(g, '#e8b830', 5, 5, 10, 18); R(g, '#fff09a', 5, 5, 1, 18); R(g, '#a0700c', 14, 5, 1, 18);
    R(g, '#1b2240', 6, 7, 8, 3); R(g, '#9be8ff', 7, 7, 2, 1);
    R(g, '#c8901a', 6, 12, 8, 10); for (let y = 13; y < 22; y += 2) R(g, '#a0700c', 6, y, 8, 1); R(g, '#f2f2f2', 7, 13, 6, 1);
    R(g, f ? '#ff8a1e' : '#7a3a0a', 9, 10, 2, 2);
    g.setTransform(1, 0, 0, 1, 0, 0);
    return outline(c);
  }
  // pilas en vez de bidones (cuarto de juguetes)
  function battery(kind, f) {
    const P = kind === 'S' ? ['#ffc531', '#fff09a', '#b8730c'] : kind === 'L' ? ['#2fd27a', '#a6ffcf', '#147a45'] : ['#2a2836', '#5a5868', '#15131f'];
    const { c, g } = mk(12, 19);
    g.translate(1, 1);
    R(g, '#c8c4d0', 4, 0, 2, 2);
    R(g, P[0], 1, 2, 8, 14); R(g, P[1], 1, 2, 1, 14); R(g, P[2], 8, 2, 1, 14);
    R(g, kind ? P[2] : '#c87a30', 1, 2, 8, 4); R(g, kind ? P[1] : '#f0a050', 1, 2, 8, 1);
    if (kind) glyph(g, kind, 3, 8, '#ffffff');
    else { R(g, '#f2f2f2', 3, 9, 4, 1); R(g, '#f2f2f2', 4, 8, 2, 3); }
    R(g, '#ffffff', 2, f ? 10 : 7, 1, 2);
    g.setTransform(1, 0, 0, 1, 0, 0);
    return outline(c);
  }
  // regalo en vez de caja de ítem
  function gift(f) {
    const { c, g } = mk(18, 18);
    g.translate(1, 1);
    R(g, '#c8204a', 1, 4, 14, 11); R(g, '#e8406a', 1, 4, 13, 10); R(g, '#ff7aa0', 1, 4, 14, 1);
    R(g, '#ffd23f', 7, 4, 2, 11); R(g, '#ffd23f', 1, 8, 14, 2);
    disc(g, 5.5, 2.5, 2.2, '#ffd23f'); disc(g, 10.5, 2.5, 2.2, '#ffd23f'); R(g, '#b8860c', 7, 3, 2, 2);
    if (f) { R(g, '#ffffff', 3, 6); R(g, '#ffffff', 12, 12); }
    g.setTransform(1, 0, 0, 1, 0, 0);
    return outline(c);
  }
  // pata del gato (y su sombra)
  function paw() {
    const { c, g } = mk(46, 52);
    ellipse(g, 23, 34, 14, 17, '#e8943a'); ellipse(g, 22, 33, 12.5, 15.5, '#f4b060');
    for (let k = 0; k < 6; k++) R(g, '#d07a2a', 13 + k * 3.5, 40 + (k % 2), 2, 6);
    disc(g, 23, 28, 7, '#ff9ab8'); disc(g, 23, 27, 5.6, '#ffb8cc');
    [[10, 14], [18, 9], [28, 9], [36, 14]].forEach(([x, y]) => { disc(g, x, y, 5.6, '#f4b060'); disc(g, x, y + 0.5, 3.4, '#ff9ab8'); R(g, '#ffffff', x - 1, y - 1); });
    return outline(c, '#4a2a10');
  }
  function shadowDisc(rx, ry) {
    const { c, g } = mk(rx * 2 + 2, ry * 2 + 2);
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
      const d = ((x + 0.5 - rx - 1) / rx) ** 2 + ((y + 0.5 - ry - 1) / ry) ** 2;
      if (d <= 1 && (d < 0.6 || bayer(x, y) < 0.6)) R(g, '#000000', x, y);
    }
    return c;
  }
  // tren de juguete (mirando a la derecha)
  function train(part) {
    const { c, g } = mk(part === 'loco' ? 36 : 30, 18);
    g.translate(1, 1);
    const W = part === 'loco' ? 34 : 28;
    R(g, 'rgba(0,0,0,0.3)', 2, 3, W - 2, 14);
    for (let x = 3; x < W - 3; x += 7) { disc(g, x + 2, 1.5, 2, '#1b1a26'); disc(g, x + 2, 14.5, 2, '#1b1a26'); }
    if (part === 'loco') {
      R(g, '#c8202e', 0, 2, 22, 12); R(g, '#e84a4a', 0, 2, 22, 2);
      R(g, '#1b1a26', 22, 3, 11, 10); R(g, '#3a3a4c', 22, 3, 11, 2);
      disc(g, 28, 8, 3, '#5a5a6a'); disc(g, 28, 8, 1.6, '#1b1a26');
      R(g, '#ffd23f', 0, 5, 9, 6); R(g, '#9be8ff', 2, 6, 5, 4);
      R(g, '#ffd23f', 33, 7, 1, 2);
    } else {
      const col = part === 'a' ? ['#2f6ff2', '#7fb0ff'] : ['#2fbf5a', '#8ff0a0'];
      R(g, col[0], 0, 2, W, 12); R(g, col[1], 0, 2, W, 2);
      [[3, 5, '#ffd23f'], [11, 5, '#e8383d'], [19, 5, '#ffffff']].forEach(([x, y, k]) => { R(g, 'rgba(0,0,0,0.3)', x + 1, y + 1, 6, 6); R(g, k, x, y, 6, 6); });
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
    return outline(c);
  }
  // barrera del cruce del tren (para calles verticales: el brazo cruza la calle de lado a lado)
  function gate(down, f) {
    const { c, g } = mk(22, 8);
    R(g, '#3a3a48', 0, 1, 4, 5); R(g, f ? '#ff3b3b' : '#5a1414', 1, 2, 2, 2);
    if (down) for (let x = 4; x < 21; x++) R(g, ((x >> 1) & 1) ? '#f4f1ea' : '#e8383d', x, 3, 1, 2);
    else R(g, '#e8383d', 4, 3, 2, 2);
    return outline(c);
  }
  function marble(f) {
    const { c, g } = mk(10, 10);
    disc(g, 5, 5, 4, '#3a8ae8'); disc(g, 4.6, 4.6, 3.2, '#5fb0ff');
    const a = f * 1.2;
    line(g, 5 + Math.cos(a) * 3, 5 + Math.sin(a) * 3, 5 - Math.cos(a) * 3, 5 - Math.sin(a) * 3, '#ffd23f', 1);
    R(g, '#ffffff', 3, 3);
    return outline(c);
  }
  // montículo de nieve en la calle y bloque de avalancha
  function drift() {
    const { c, g } = mk(20, 14);
    ellipse(g, 11, 9, 8, 4, 'rgba(60,70,110,0.35)');
    ellipse(g, 10, 7, 8, 5, '#c8d4ea'); ellipse(g, 9, 6, 6.5, 4, '#eef2fa'); ellipse(g, 7, 5, 3, 2, '#ffffff');
    return outline(c, '#5a6a8a');
  }
  function pile() {
    const { c, g } = mk(22, 22);
    disc(g, 12, 13, 9, 'rgba(60,70,110,0.35)');
    disc(g, 11, 11, 9, '#b8c4dc'); disc(g, 10, 10, 7.5, '#dfe6f2'); disc(g, 8, 8, 4, '#ffffff');
    [[5, 14], [15, 7], [14, 15]].forEach(([x, y]) => { R(g, '#7a6a72', x, y, 3, 2); R(g, '#9a8a8a', x, y, 2, 1); });
    return outline(c, '#5a6a8a');
  }
  // broca del taladro (apunta hacia arriba)
  function drill(f) {
    const { c, g } = mk(10, 11);
    g.translate(1, 1);
    poly(g, [[4, 0], [8, 8], [0, 8]], '#9aa3b4');
    for (let y = 1; y < 8; y += 2) R(g, '#5f6778', 4 - y / 2 + (f ? 1 : 0), y, Math.max(1, y / 2), 1);
    R(g, '#e8eef6', 4, 1, 1, 3);
    R(g, '#ffb020', 1, 8, 7, 1);
    g.setTransform(1, 0, 0, 1, 0, 0);
    return outline(c);
  }
  // íconos para las pistas (lista de especiales y pantalla de carga)
  function icon(kind) {
    const { c, g } = mk(22, 15);
    if (kind === 'arena') {
      R(g, '#8a5a32', 0, 0, 22, 15); R(g, '#b07a46', 0, 10, 22, 5);
      poly(g, [[3, 13], [14, 13], [14, 6]], '#e8d8b0'); R(g, '#ff8a1e', 3, 13, 11, 1);
      for (let k = 0; k < 10; k++) { const a = k * 0.63; R(g, k & 1 ? '#ffd23f' : '#ff4a1e', 17 + Math.cos(a) * 3.5, 6 + Math.sin(a) * 3.5); }
    } else if (kind === 'snow') {
      R(g, '#3a5a8a', 0, 0, 22, 15);
      poly(g, [[0, 15], [8, 4], [14, 11], [17, 7], [22, 15]], '#dfe6f2'); poly(g, [[6, 6.5], [8, 4], [10, 6.5]], '#ffffff');
      for (const [x, y] of [[3, 3], [15, 2], [19, 5], [11, 1]]) R(g, '#ffffff', x, y);
    } else {
      R(g, '#a8784a', 0, 0, 22, 15); for (let y = 3; y < 15; y += 4) R(g, '#8a5e36', 0, y, 22, 1);
      R(g, '#4a7ad0', 2, 2, 18, 11); R(g, '#8a8a98', 2, 7, 18, 2); for (let x = 3; x < 20; x += 4) R(g, '#ffffff', x, 7.5, 2, 1);
      R(g, '#e8383d', 5, 3, 4, 3); R(g, '#ffd23f', 13, 10, 4, 3);
    }
    return outline(c);
  }

  // íconos del inicio del juego (16x16)
  function hubIcon(kind) {
    const { c, g } = mk(18, 18);
    g.translate(1, 1);
    if (kind === 'taller') {
      // llave inglesa
      line(g, 3, 13, 10, 6, '#9aa3b4', 3); line(g, 3, 13, 10, 6, '#d6dce6', 1);
      disc(g, 11.5, 4.5, 4, '#9aa3b4'); disc(g, 12.5, 3.5, 1.8, '#15112a'); R(g, '#15112a', 12, 0, 4, 3);
      R(g, '#ffffff', 10, 3);
    } else if (kind === 'duel') {
      // dos banderas a cuadros cruzadas
      line(g, 2, 15, 9, 2, '#d6d6e4', 1); line(g, 14, 15, 7, 2, '#d6d6e4', 1);
      for (let y = 0; y < 4; y++) for (let x = 0; x < 5; x++) {
        R(g, (x + y) & 1 ? '#1b1a26' : '#ffffff', 1 + x, 1 + y);
        R(g, (x + y) & 1 ? '#ff4f9a' : '#ffffff', 10 + x, 1 + y);
      }
    } else if (kind === 'esp') {
      // rampa con aro de fuego
      poly(g, [[1, 14], [11, 14], [11, 8]], '#e8d8b0'); R(g, '#ff8a1e', 1, 14, 11, 1);
      for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; R(g, k & 1 ? '#ffd23f' : '#ff4a1e', 11.5 + Math.cos(a) * 3.5, 5 + Math.sin(a) * 3.5); }
    } else {
      // copa
      R(g, '#ffd23f', 4, 1, 8, 6); R(g, '#fff2a0', 5, 1, 2, 5); R(g, '#c48a10', 11, 1, 1, 6);
      R(g, '#ffd23f', 2, 2, 2, 3); R(g, '#ffd23f', 12, 2, 2, 3); R(g, '#15112a', 3, 3); R(g, '#15112a', 12, 3);
      R(g, '#ffd23f', 5, 7, 6, 1); R(g, '#c48a10', 7, 8, 2, 3); R(g, '#ffd23f', 5, 11, 6, 2); R(g, '#c48a10', 4, 13, 8, 2);
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
    return outline(c);
  }

  // ---------------- dibujo de los mapas
  // regiones (manzanas) entre calles
  function regionsOf(ctx) {
    const { isRoad, MW, MH } = ctx;
    const reg = new Int32Array(MW * MH).fill(-1), out = [];
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
      if (isRoad(x, y) || reg[y * MW + x] >= 0) continue;
      const tiles = [], st = [[x, y]];
      let border = false;
      reg[y * MW + x] = out.length;
      while (st.length) {
        const [a, b] = st.pop();
        tiles.push([a, b]);
        if (a === 0 || b === 0 || a === MW - 1 || b === MH - 1) border = true;
        for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
          const nx = a + dx, ny = b + dy;
          if (nx < 0 || ny < 0 || nx >= MW || ny >= MH || isRoad(nx, ny) || reg[ny * MW + nx] >= 0) continue;
          reg[ny * MW + nx] = out.length; st.push([nx, ny]);
        }
      }
      out.push({ tiles, border, n: tiles.length });
    }
    return out;
  }
  const near4 = (ctx, x, y) => ({ U: ctx.isRoad(x, y - 1), D: ctx.isRoad(x, y + 1), L: ctx.isRoad(x - 1, y), R: ctx.isRoad(x + 1, y) });

  // ===== ARENA DE ACROBACIAS: tierra, tribunas llenas y montículos
  function arenaMap(g, ctx) {
    const { isRoad, MW, MH, TS, SK, r } = ctx, MWp = MW * TS, MHp = MH * TS, spots = [];
    // tribunas alrededor (fuera del mapa)
    R(g, '#2a2238', -SK, -SK, MWp + SK * 2, MHp + SK * 2);
    const crowd = ['#ff4f9a', '#ffd23f', '#4fe3ff', '#f2f2f2', '#7dff7a', '#ff8a1e', '#b48cff', '#e8383d'];
    for (let y = -SK; y < MHp + SK; y += 2) for (let x = -SK; x < MWp + SK; x += 2) {
      const d = Math.max(-x, -y, x - MWp, y - MHp);
      if (d < 10) continue;
      const row = Math.floor((d - 10) / 6);
      const aisle = (Math.abs(x - MWp / 2) % 80 < 5 && (y < 0 || y > MHp)) || (Math.abs(y - MHp / 2) % 80 < 5 && (x < 0 || x > MWp));
      if (aisle) { R(g, (d >> 2) & 1 ? '#5a5070' : '#4a4060', x, y, 2, 2); continue; }
      R(g, row & 1 ? '#3a3050' : '#443a5c', x, y, 2, 2);
      if (r() < 0.62) R(g, crowd[(r() * crowd.length) | 0], x, y, 1, 1);
    }
    // muro acolchado con publicidad
    R(g, '#1b1a26', -10, -10, MWp + 20, 10); R(g, '#1b1a26', -10, MHp, MWp + 20, 10);
    R(g, '#1b1a26', -10, -10, 10, MHp + 20); R(g, '#1b1a26', MWp, -10, 10, MHp + 20);
    const ads = [['#e8383d', '#ffffff'], ['#2f6ff2', '#ffd23f'], ['#ffd23f', '#1b1424'], ['#2fbf5a', '#ffffff']];
    for (let x = -8, i = 0; x < MWp + 8; x += 40, i++) {
      const [a, b] = ads[i % 4];
      R(g, a, x, -8, 36, 6); R(g, a, x, MHp + 2, 36, 6);
      for (let k = 3; k < 33; k += 4) { R(g, b, x + k, -6, 2, 2); R(g, b, x + k, MHp + 4, 2, 2); }
    }
    for (let y = -8, i = 0; y < MHp + 8; y += 40, i++) {
      const [a, b] = ads[(i + 1) % 4];
      R(g, a, -8, y, 6, 36); R(g, a, MWp + 2, y, 6, 36);
      for (let k = 3; k < 33; k += 4) { R(g, b, -6, y + k, 2, 2); R(g, b, MWp + 4, y + k, 2, 2); }
    }
    // torres de luz
    for (const [x, y] of [[-30, -30], [MWp + 30, -30], [-30, MHp + 30], [MWp + 30, MHp + 30], [MWp / 2, -40], [MWp / 2, MHp + 40]]) {
      R(g, '#1b1a26', x - 7, y - 4, 14, 8); for (let k = -6; k < 6; k += 3) R(g, '#fff6c8', x + k, y - 3, 2, 2);
      spots.push([x, y, '#fff6c8']);
    }
    // tierra
    R(g, '#6a4224', 0, 0, MWp, MHp);
    for (let k = 0; k < (MWp * MHp) / 14; k++) R(g, pick(['#5e3a1e', '#7a4e2a', '#845632', '#62401f']), r() * MWp, r() * MHp, 1 + ((r() * 2) | 0), 1);
    // pistas de tierra apisonada con huellas
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
      if (!isRoad(x, y)) continue;
      const px = x * TS, py = y * TS, n = near4(ctx, x, y);
      R(g, '#c49460', px, py, TS, TS);
      for (let k = 0; k < 8; k++) R(g, r() < 0.5 ? '#d0a06a' : '#b08050', px + ((r() * 16) | 0), py + ((r() * 16) | 0), 2, 1);
      if (n.L && n.R && !n.U && !n.D) for (let i = 0; i < 16; i += 2) { R(g, '#9a6a3c', px + i, py + 4, 1, 1); R(g, '#9a6a3c', px + i + 1, py + 11, 1, 1); }
      if (n.U && n.D && !n.L && !n.R) for (let i = 0; i < 16; i += 2) { R(g, '#9a6a3c', px + 4, py + i, 1, 1); R(g, '#9a6a3c', px + 11, py + i + 1, 1, 1); }
      if (!n.U) R(g, '#5e3a1c', px, py, 16, 1);
      if (!n.D) R(g, '#c89458', px, py + 15, 16, 1);
      if (!n.L) R(g, '#5e3a1c', px, py, 1, 16);
      if (!n.R) R(g, '#c89458', px + 15, py, 1, 16);
    }
    // obstáculos en las manzanas: montículos, neumáticos, autos aplastados y fardos
    for (const rg of regionsOf(ctx)) {
      for (const [x, y] of rg.tiles) {
        const cx = x * TS + 8, cy = y * TS + 8, p = r();
        if (rg.border) { if (p < 0.5) { disc(g, cx + 1, cy + 1, 4, 'rgba(0,0,0,0.3)'); disc(g, cx, cy, 4, '#15131f'); disc(g, cx, cy, 2, '#3a3848'); } continue; }
        if (p < 0.3) { disc(g, cx + 2, cy + 2, 7, 'rgba(30,15,5,0.35)'); disc(g, cx, cy, 7, '#6a4224'); disc(g, cx - 1, cy - 1, 5.5, '#8a5a32'); disc(g, cx - 2, cy - 2, 3, '#a8743e'); }
        else if (p < 0.5) for (const [ox, oy] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) { disc(g, cx + ox + 1, cy + oy + 1, 3.2, 'rgba(0,0,0,0.3)'); disc(g, cx + ox, cy + oy, 3.2, '#15131f'); disc(g, cx + ox, cy + oy, 1.5, '#4a4858'); }
        else if (p < 0.66) {
          const col = pick(['#e8383d', '#2f6ff2', '#ffd23f', '#e6e6ee', '#2fbf5a']);
          R(g, 'rgba(0,0,0,0.3)', cx - 5, cy - 2, 12, 7); R(g, col, cx - 6, cy - 4, 12, 7); R(g, 'rgba(0,0,0,0.25)', cx - 6, cy, 12, 1);
          R(g, '#1b2240', cx - 3, cy - 3, 5, 2); R(g, '#5a5a6a', cx + 3, cy - 4, 1, 7);
        } else if (p < 0.82) {
          R(g, 'rgba(0,0,0,0.3)', cx - 4, cy - 2, 10, 7); R(g, '#e8c45a', cx - 5, cy - 4, 10, 7); R(g, '#c8a040', cx - 5, cy - 4, 10, 1);
          for (let k = -4; k < 5; k += 3) R(g, '#b08a30', cx + k, cy - 4, 1, 7);
        }
      }
    }
    return spots;
  }

  // ===== PUEBLO NEVADO
  function snowMap(g, ctx) {
    const { isRoad, MW, MH, TS, SK, r } = ctx, MWp = MW * TS, MHp = MH * TS, spots = [];
    const inMap = (x, y) => x >= 0 && y >= 0 && x < MWp && y < MHp;
    R(g, '#e6ecf6', -SK, -SK, MWp + SK * 2, MHp + SK * 2);
    for (let k = 0; k < ((MWp + SK * 2) * (MHp + SK * 2)) / 30; k++) R(g, pick(['#d4dcea', '#f4f8ff', '#c8d2e4']), -SK + r() * (MWp + SK * 2), -SK + r() * (MHp + SK * 2));
    const pine = (x, y, s) => {
      ellipse(g, x + 2, y + 2, s, s * 0.8, 'rgba(40,50,90,0.3)');
      disc(g, x, y, s, '#1f5a3b'); disc(g, x - 0.5, y - 0.5, s * 0.72, '#2c7a4a'); disc(g, x - 1, y - 1, s * 0.4, '#3f9a5a');
      for (let k = 0; k < 4; k++) R(g, '#ffffff', x + (r() - 0.5) * s * 1.4, y + (r() - 0.5) * s * 1.4, 2, 1);
      R(g, '#f4f8ff', x - 1, y - 1);
    };
    // montañas nevadas y bosque de pinos fuera del mapa
    const rock = ['#6a6e86', '#8a8ea6', '#a8acc4', '#c8ccdc'], list = [];
    for (let y = -SK - 10; y < MHp + SK + 10; y += 18) for (let x = -SK - 10; x < MWp + SK + 10; x += 18) {
      const px = x + (r() - 0.5) * 12, py = y + (r() - 0.5) * 12;
      if (inMap(px, py)) continue;
      const depth = Math.max(-px, -py, px - MWp, py - MHp) / SK;
      if (py < 0 && depth > 0.3) list.push(['m', px, py, 14 + depth * 14 + r() * 4, Math.min(1, 0.4 + depth)]);
      else if (r() < 0.75) list.push(['p', px, py, 4 + r() * 3]);
    }
    list.sort((a, b) => a[2] - b[2]);
    for (const it of list) if (it[0] === 'm') RM.mount(g, it[1], it[2], it[3], rock, it[4], r); else pine(it[1], it[2], it[3]);
    // telesilla: cable con sillas que sube por la ladera
    const lx0 = MWp * 0.15, ly0 = -12, lx1 = MWp * 0.55, ly1 = -SK + 6;
    line(g, lx0, ly0, lx1, ly1, '#3a3a4c', 1);
    for (let k = 0; k <= 4; k++) { const u = k / 4, x = lx0 + (lx1 - lx0) * u, y = ly0 + (ly1 - ly0) * u; R(g, '#5a5a6a', x - 1, y - 1, 3, 3); }
    for (let k = 1; k < 12; k++) { const u = k / 12, x = lx0 + (lx1 - lx0) * u, y = ly0 + (ly1 - ly0) * u; R(g, pick(['#e8383d', '#2f6ff2', '#ffd23f']), x - 2, y + 2, 4, 2); R(g, '#3a3a4c', x, y, 1, 2); }
    // suelo del pueblo
    R(g, '#eef2fa', 0, 0, MWp, MHp);
    for (let k = 0; k < (MWp * MHp) / 22; k++) R(g, pick(['#dfe6f2', '#ffffff', '#d4dcea']), r() * MWp, r() * MHp);
    // calles despejadas con huellas y bancos de nieve a los lados
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
      if (!isRoad(x, y)) continue;
      const px = x * TS, py = y * TS, n = near4(ctx, x, y);
      R(g, '#9aa6bc', px, py, TS, TS);
      for (let k = 0; k < 7; k++) R(g, r() < 0.5 ? '#aab6ca' : '#8a96ac', px + ((r() * 16) | 0), py + ((r() * 16) | 0), 2, 1);
      if (n.L && n.R && !n.U && !n.D) { R(g, '#7e8aa0', px, py + 4, 16, 2); R(g, '#7e8aa0', px, py + 10, 16, 2); }
      if (n.U && n.D && !n.L && !n.R) { R(g, '#7e8aa0', px + 4, py, 2, 16); R(g, '#7e8aa0', px + 10, py, 2, 16); }
      const bank = (bx, by, w, h) => { R(g, '#ffffff', bx, by, w, h); for (let i = 0; i < Math.max(w, h); i += 3) R(g, '#dfe6f2', bx + (w > h ? i : 0), by + (w > h ? 0 : i), w > h ? 1 : w, w > h ? h : 1); };
      if (!n.U) bank(px, py - 2, 16, 3);
      if (!n.D) bank(px, py + 15, 16, 3);
      if (!n.L) bank(px - 2, py, 3, 16);
      if (!n.R) bank(px + 15, py, 3, 16);
    }
    // hielo
    for (const i of ctx.ice || []) {
      const x = i % MW, y = (i / MW) | 0, px = x * TS, py = y * TS;
      R(g, '#a8dcf2', px, py, 16, 16); R(g, '#c8ecfa', px + 1, py + 1, 14, 14);
      for (let k = 0; k < 4; k++) { const a = (r() * 12) | 0, b = (r() * 12) | 0; line(g, px + a, py + b, px + a + 4, py + b - 3, '#ffffff', 1); }
      R(g, '#7ec4e4', px, py + 15, 16, 1);
    }
    // manzanas: cabañas con techo nevado, pinos, laguna congelada y monos de nieve
    const roofs = [['#8a4a3a', '#5a2e24'], ['#3a5a8a', '#24406a'], ['#4a6a3a', '#2e4a24'], ['#7a5a3a', '#4e3820']];
    for (const rg of regionsOf(ctx)) {
      const set = new Set(rg.tiles.map(([x, y]) => y * MW + x));
      const inner = rg.tiles.filter(([x, y]) => set.has(y * MW + x - 1) && set.has(y * MW + x + 1) && set.has((y - 1) * MW + x) && set.has((y + 1) * MW + x));
      if (rg.border) { for (const [x, y] of rg.tiles) if (r() < 0.7) pine(x * TS + 8 + (r() - 0.5) * 6, y * TS + 8 + (r() - 0.5) * 6, 4.5 + r() * 2); continue; }
      const kind = rg.n >= 10 && inner.length >= 2 && r() < 0.35 ? 'pond' : r() < 0.55 ? 'cabins' : 'forest';
      if (kind === 'pond') {
        for (const [x, y] of inner) { R(g, '#a8dcf2', x * TS - 2, y * TS - 2, 20, 20); }
        for (const [x, y] of inner) for (let k = 0; k < 3; k++) line(g, x * TS + r() * 12, y * TS + r() * 12, x * TS + r() * 16, y * TS + r() * 16, '#e8f8ff', 1);
        for (let k = 0; k < 4; k++) { const [x, y] = inner[(r() * inner.length) | 0]; R(g, pick(['#e8383d', '#2f6ff2', '#ffd23f', '#b48cff']), x * TS + r() * 14, y * TS + r() * 14, 2, 3); }
        for (const [x, y] of rg.tiles) if (!inner.some(([a, b]) => a === x && b === y) && r() < 0.4) pine(x * TS + 8, y * TS + 8, 4);
      } else if (kind === 'cabins') {
        for (const [x, y] of rg.tiles) {
          const cx = x * TS + 8, cy = y * TS + 8, [rc, rd] = roofs[(r() * roofs.length) | 0];
          if (r() < 0.25) { pine(cx, cy, 4.5); continue; }
          R(g, 'rgba(40,50,90,0.3)', cx - 4, cy - 3, 12, 11);
          R(g, rc, cx - 6, cy - 5, 12, 10); R(g, rd, cx - 6, cy + 4, 12, 1);
          R(g, '#ffffff', cx - 5, cy - 5, 10, 4); R(g, '#d4dcea', cx - 5, cy, 10, 4);
          R(g, '#b8c4dc', cx - 6, cy - 1, 12, 1);
          R(g, '#e8eef8', cx - 6, cy - 5, 1, 9); R(g, '#c8d2e4', cx + 5, cy - 5, 1, 9);
          R(g, '#5a4e5e', cx + 1, cy - 4, 3, 3); R(g, '#3a2a28', cx + 2, cy - 3);
          R(g, '#e6ecf6', cx + 3, cy - 7, 2, 1); R(g, '#f4f8ff', cx + 4, cy - 9, 2, 1);
          if (r() < 0.5) { R(g, '#ffd86a', cx - 4, cy + 4, 2, 1); spots.push([cx - 3, cy + 4, '#ffd86a']); }
        }
      } else {
        for (const [x, y] of rg.tiles) for (let k = 0; k < (r() < 0.5 ? 2 : 1); k++) pine(x * TS + 8 + (r() - 0.5) * 8, y * TS + 8 + (r() - 0.5) * 8, 4 + r() * 2);
        if (r() < 0.5) {
          const [x, y] = rg.tiles[(r() * rg.tiles.length) | 0], cx = x * TS + 8, cy = y * TS + 8;
          disc(g, cx, cy + 2, 3.5, '#ffffff'); disc(g, cx, cy - 2, 2.5, '#ffffff'); R(g, '#ff8a1e', cx + 2, cy - 2, 2, 1); R(g, '#1b1a26', cx - 1, cy - 3);
        }
      }
    }
    return spots;
  }

  // ===== CUARTO DE JUGUETES: alfombra con calles impresas sobre piso de madera
  function toyMap(g, ctx) {
    const { isRoad, MW, MH, TS, SK, r } = ctx, MWp = MW * TS, MHp = MH * TS, spots = [];
    // piso de tablas
    for (let y = -SK; y < MHp + SK; y += 10) {
      const off = ((y / 10) & 1) * 37;
      for (let x = -SK - off; x < MWp + SK; x += 74) {
        const tone = pick(['#b88454', '#a8784a', '#c49060', '#b07c4e']);
        R(g, tone, x, y, 74, 10); R(g, '#8a5e36', x, y + 9, 74, 1); R(g, '#8a5e36', x + 73, y, 1, 10);
        for (let k = 0; k < 3; k++) R(g, 'rgba(90,50,20,0.25)', x + r() * 70, y + 2 + r() * 6, 8 + r() * 10, 1);
      }
    }
    // muebles y juguetes desparramados alrededor
    const shadow = (x, y, w, h) => R(g, 'rgba(40,20,10,0.35)', x + 4, y + 4, w, h);
    // cama (arriba a la derecha)
    { const x = MWp + 10, y = -SK + 4, w = SK + 40, h = SK + 10; shadow(x, y, w, h); R(g, '#f2f2f2', x, y, w, h); R(g, '#4a7ad0', x, y + 26, w, h - 26); for (let k = 0; k < w; k += 8) R(g, '#5a8ae0', x + k, y + 26, 4, h - 26); R(g, '#ffffff', x + 10, y + 4, 40, 16); R(g, '#d8dce8', x + 10, y + 18, 40, 2); }
    // mesa con sus patas y una silla (abajo a la izquierda)
    for (const [x, y] of [[-70, MHp + 20], [-10, MHp + 20], [-70, MHp + 70], [-10, MHp + 70]]) { disc(g, x + 2, y + 2, 5, 'rgba(40,20,10,0.35)'); disc(g, x, y, 5, '#6a3e1e'); disc(g, x - 1, y - 1, 3, '#8a5a32'); }
    // caja de juguetes (abajo a la derecha) y pantuflas
    { const x = MWp + 20, y = MHp + 14; shadow(x, y, 60, 40); R(g, '#e8383d', x, y, 60, 40); R(g, '#ff6a6a', x, y, 60, 4); R(g, '#ffd23f', x + 24, y + 14, 12, 12); glyph(g, 'A', x + 27, y + 17, '#e8383d'); }
    for (const [x, y] of [[-60, 40], [-44, 50]]) { ellipse(g, x + 2, y + 2, 6, 11, 'rgba(40,20,10,0.35)'); ellipse(g, x, y, 6, 11, '#ff8ac0'); ellipse(g, x, y - 4, 4, 5, '#ffc8e0'); }
    // libro abierto, pelota y lápices de cera
    { const x = -SK + 14, y = MHp * 0.45; shadow(x, y, 44, 30); R(g, '#f8f4e8', x, y, 44, 30); R(g, '#c8c0a8', x + 21, y, 2, 30); for (let k = 4; k < 28; k += 3) { R(g, '#8a8a98', x + 3, y + k, 16, 1); R(g, '#8a8a98', x + 25, y + k, 16, 1); } }
    { const x = MWp + 50, y = MHp * 0.5; disc(g, x + 3, y + 3, 11, 'rgba(40,20,10,0.35)'); disc(g, x, y, 11, '#e8383d'); for (let k = -11; k < 11; k++) R(g, '#ffffff', x + k, y - 1, 1, 2); disc(g, x - 4, y - 4, 3, '#ff8a7a'); }
    for (let k = 0; k < 5; k++) { const x = MWp * 0.3 + k * 9, y = -SK + 30 + (k % 2) * 6; R(g, 'rgba(40,20,10,0.3)', x + 2, y + 2, 4, 20); R(g, ['#e8383d', '#2f6ff2', '#ffd23f', '#2fbf5a', '#b48cff'][k], x, y, 4, 20); R(g, '#f2f2f2', x, y + 4, 4, 2); }
    // alfombra: borde con flecos y diseño
    R(g, '#c8302e', -6, -6, MWp + 12, MHp + 12);
    for (let x = -6; x < MWp + 6; x += 3) { R(g, '#f2e8c8', x, -9, 1, 3); R(g, '#f2e8c8', x, MHp + 6, 1, 3); }
    for (let y = -6; y < MHp + 6; y += 3) { R(g, '#f2e8c8', -9, y, 3, 1); R(g, '#f2e8c8', MWp + 6, y, 3, 1); }
    for (let x = -4; x < MWp + 4; x += 8) { R(g, '#ffd23f', x, -4, 4, 2); R(g, '#ffd23f', x + 4, MHp + 2, 4, 2); }
    for (let y = -4; y < MHp + 4; y += 8) { R(g, '#ffd23f', -4, y, 2, 4); R(g, '#ffd23f', MWp + 2, y + 4, 2, 4); }
    R(g, '#5aa04a', 0, 0, MWp, MHp);
    for (let k = 0; k < (MWp * MHp) / 40; k++) R(g, pick(['#4e9040', '#66ac54']), r() * MWp, r() * MHp, 2, 2);
    // calles impresas
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
      if (!isRoad(x, y)) continue;
      const px = x * TS, py = y * TS, n = near4(ctx, x, y);
      R(g, '#7a7a8a', px, py, TS, TS);
      if (n.L && n.R && !n.U && !n.D) for (let i = 0; i < 16; i += 8) R(g, '#f2f2f2', px + i + 2, py + 7, 4, 2);
      if (n.U && n.D && !n.L && !n.R) for (let i = 0; i < 16; i += 8) R(g, '#f2f2f2', px + 7, py + i + 2, 2, 4);
      if (!n.U) R(g, '#9a9aa8', px, py, 16, 2);
      if (!n.D) R(g, '#9a9aa8', px, py + 14, 16, 2);
      if (!n.L) R(g, '#9a9aa8', px, py, 2, 16);
      if (!n.R) R(g, '#9a9aa8', px + 14, py, 2, 16);
    }
    // carril del tren de madera (cruza todo el cuarto)
    if (ctx.railY != null) {
      const y = ctx.railY;
      R(g, 'rgba(40,20,10,0.3)', -SK, y - 5, MWp + SK * 2, 12);
      R(g, '#e0b884', -SK, y - 7, MWp + SK * 2, 14); R(g, '#f0cc98', -SK, y - 7, MWp + SK * 2, 2);
      R(g, '#a8784a', -SK, y - 4, MWp + SK * 2, 2); R(g, '#a8784a', -SK, y + 2, MWp + SK * 2, 2);
      for (let x = -SK; x < MWp + SK; x += 28) R(g, '#c89a64', x, y - 7, 1, 14);
    }
    // casas, árboles y una laguna impresos + juguetes de verdad encima
    const houseCols = ['#e8383d', '#2f6ff2', '#ffd23f', '#ff8ac0', '#b48cff', '#ff8a1e'];
    for (const rg of regionsOf(ctx)) {
      if (rg.border) continue;
      for (const [x, y] of rg.tiles) {
        const cx = x * TS + 8, cy = y * TS + 8;
        if (ctx.railY != null && Math.abs(cy - ctx.railY) < 10) continue;
        const p = r();
        if (p < 0.3) { R(g, '#f2f2f2', cx - 5, cy - 1, 10, 7); poly(g, [[cx - 7, cy - 1], [cx, cy - 7], [cx + 7, cy - 1]], houseCols[(r() * houseCols.length) | 0]); R(g, '#4a7ad0', cx - 1, cy + 2, 3, 4); }
        else if (p < 0.5) { disc(g, cx, cy, 5, '#2f8a3a'); disc(g, cx - 1, cy - 1, 3, '#4fae4a'); R(g, '#8a5a32', cx - 1, cy + 4, 2, 3); }
        else if (p < 0.58) { ellipse(g, cx, cy, 7, 5, '#3fb6e8'); ellipse(g, cx - 1, cy - 1, 4, 2, '#8fdcff'); }
      }
      // un juguete grande por manzana
      const [x, y] = rg.tiles[(r() * rg.tiles.length) | 0], cx = x * TS + 8, cy = y * TS + 8;
      if (ctx.railY != null && Math.abs(cy - ctx.railY) < 16) continue;
      const toy = r();
      if (toy < 0.3) {
        const col = houseCols[(r() * houseCols.length) | 0];
        R(g, 'rgba(0,0,0,0.3)', cx - 5, cy - 2, 13, 9); R(g, col, cx - 7, cy - 4, 13, 9); R(g, 'rgba(255,255,255,0.3)', cx - 7, cy - 4, 13, 1);
        for (const [a, b] of [[-4, -1], [0, -1], [4, -1], [-4, 3], [0, 3], [4, 3]]) { disc(g, cx + a, cy + b, 1.6, col); R(g, 'rgba(255,255,255,0.5)', cx + a - 1, cy + b - 1); }
      } else if (toy < 0.55) {
        const col = houseCols[(r() * houseCols.length) | 0];
        R(g, 'rgba(0,0,0,0.3)', cx - 4, cy - 3, 11, 11); R(g, '#f2e8c8', cx - 6, cy - 5, 11, 11); R(g, col, cx - 5, cy - 4, 9, 9);
        glyph(g, 'ABCXYZ'[(r() * 6) | 0], cx - 3, cy - 2, '#ffffff');
      } else if (toy < 0.7) {
        disc(g, cx + 2, cy + 2, 6, 'rgba(0,0,0,0.3)'); disc(g, cx, cy, 6, '#a8703a'); disc(g, cx - 5, cy - 5, 2.5, '#a8703a'); disc(g, cx + 5, cy - 5, 2.5, '#a8703a');
        disc(g, cx, cy + 1, 2.5, '#d8a870'); R(g, '#1b1a26', cx - 2, cy - 2); R(g, '#1b1a26', cx + 2, cy - 2); R(g, '#1b1a26', cx, cy + 1);
      }
    }
    return spots;
  }

  return { hubIcon, ramp, fireRing, monster, suv, windup, plow, battery, gift, paw, shadowDisc, train, gate, marble, drift, pile, drill, icon, arenaMap, snowMap, toyMap };
})();

