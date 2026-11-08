// =====================================================================
//  GAS RALLY · dibujo de lugares especiales de cada ciudad y del entorno
//  (estadios, puerto, mercado, autocine, templo, puente, cerros alrededor)
//  Todo se pinta sobre la textura del mapa en coordenadas de pixel.
// =====================================================================
const RM = (() => {
  // mayor rectángulo de casillas dentro de una región (para ubicar un lugar grande)
  function largestRect(tiles) {
    const set = new Set(tiles.map(([x, y]) => x + ',' + y));
    let best = null;
    const xs = tiles.map((t) => t[0]), ys = tiles.map((t) => t[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      if (!set.has(x + ',' + y)) continue;
      for (let h = 1; y + h - 1 <= y1; h++) {
        let w = 0;
        while (x + w <= x1) {
          let ok = true;
          for (let j = 0; j < h && ok; j++) ok = set.has(x + w + ',' + (y + j));
          if (!ok) break;
          w++;
        }
        if (!w) break;
        const a = w * h + Math.min(w, h) * 0.5;
        if (!best || a > best.a) best = { x, y, w, h, a };
      }
    }
    return best;
  }

  // ---- estadio visto desde arriba: tribunas con público, cancha y torres de luz
  function stadium(g, X, Y, W, H, r, dome) {
    const cx = X + W / 2, cy = Y + H / 2, rx = W / 2, ry = H / 2;
    ellipse(g, cx + 2, cy + 3, rx, ry, 'rgba(10,8,24,0.35)');
    if (dome) {
      // domo blanco con nervaduras
      ellipse(g, cx, cy, rx, ry, '#b8bccb');
      ellipse(g, cx - 1, cy - 1, rx - 2, ry - 2, '#e6e8f0');
      for (let k = -3; k <= 3; k++) {
        const t = k / 4;
        for (let a = -1; a <= 1; a += 0.02) {
          const px = cx + t * rx * Math.sqrt(Math.max(0, 1 - a * a)) * 0.98, py = cy + a * (ry - 2);
          R(g, '#c4c8d6', px, py);
        }
      }
      ellipse(g, cx - rx * 0.3, cy - ry * 0.35, rx * 0.25, ry * 0.18, '#ffffff');
      return [[X + 3, Y + 3], [X + W - 3, Y + 3], [X + 3, Y + H - 3], [X + W - 3, Y + H - 3]];
    }
    ellipse(g, cx, cy, rx, ry, '#5a5468');
    // público: puntitos de colores por anillos
    const crowd = ['#ff4f9a', '#ffd23f', '#4fe3ff', '#f2f2f2', '#7dff7a', '#ff8a1e', '#b48cff'];
    for (let y = Math.floor(Y); y < Y + H; y++) for (let x = Math.floor(X); x < X + W; x++) {
      const d = ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2;
      if (d > 1) continue;
      if (d > 0.42) { if ((x + y) % 2 === 0 && r() < 0.75) R(g, crowd[(r() * crowd.length) | 0], x, y); else R(g, d > 0.8 ? '#4a4458' : '#6a6480', x, y); }
    }
    // cancha
    const fx = rx * 0.62, fy = ry * 0.6;
    R(g, '#3f9a4a', cx - fx, cy - fy, fx * 2, fy * 2);
    for (let i = 0; i < fx * 2; i += 6) R(g, '#4aae56', cx - fx + i, cy - fy, 3, fy * 2);
    g.strokeStyle = '#e8f8e8'; g.lineWidth = 1;
    g.strokeRect(Math.round(cx - fx) + 1.5, Math.round(cy - fy) + 1.5, Math.round(fx * 2) - 3, Math.round(fy * 2) - 3);
    R(g, '#e8f8e8', cx, cy - fy + 1, 1, fy * 2 - 2);
    disc(g, cx, cy, Math.min(fx, fy) * 0.32, '#e8f8e8'); disc(g, cx, cy, Math.min(fx, fy) * 0.32 - 1, '#3f9a4a');
    R(g, '#e8f8e8', cx - fx + 1, cy - 3, 3, 6); R(g, '#e8f8e8', cx + fx - 4, cy - 3, 3, 6);
    // torres de luz en las esquinas
    const towers = [[X + 2, Y + 2], [X + W - 3, Y + 2], [X + 2, Y + H - 3], [X + W - 3, Y + H - 3]];
    for (const [tx, ty] of towers) { R(g, '#2a2a3a', tx - 1, ty - 1, 3, 3); R(g, '#fff6c8', tx, ty); }
    return towers;
  }

  // ---- puerto: contenedores apilados y grúas pórtico
  function port(g, X, Y, W, H, r) {
    R(g, '#6a6e7c', X, Y, W, H);
    for (let y = Y + 2; y < Y + H; y += 6) for (let x = X + 2; x < X + W; x += 10) R(g, '#5e6270', x, y + 4, 8, 1);
    const cols = ['#c8402e', '#2f6ff2', '#2fae6a', '#e8b830', '#e8743a', '#8a4ae8', '#e8e8f0'];
    for (let y = Y + 3; y < Y + H - 6; y += 6) for (let x = X + 3; x < X + W - 9; x += 10) {
      if (r() < 0.25) continue;
      const c = cols[(r() * cols.length) | 0];
      R(g, 'rgba(0,0,0,0.3)', x + 1, y + 1, 8, 4); R(g, c, x, y, 8, 4);
      for (let k = 1; k < 8; k += 2) R(g, 'rgba(0,0,0,0.18)', x + k, y, 1, 4);
    }
    // dos grúas: rieles, cabina y pluma
    for (const fx of [0.3, 0.72]) {
      const gx = Math.round(X + W * fx);
      R(g, 'rgba(0,0,0,0.3)', gx - 5, Y + 2, 12, H - 2);
      R(g, '#ffb020', gx - 6, Y, 2, H); R(g, '#ffb020', gx + 4, Y, 2, H);
      R(g, '#e89a10', gx - 6, Y + Math.round(H * 0.4), 12, 3);
      R(g, '#3a3a48', gx - 2, Y + Math.round(H * 0.4) - 2, 4, 3);
    }
  }

  // ---- mercado: hileras de toldos de colores
  function market(g, X, Y, W, H, r) {
    R(g, '#c8b898', X, Y, W, H);
    const tolds = [['#e84a8a', '#ffffff'], ['#ffd23f', '#e8743a'], ['#3ab8b0', '#ffffff'], ['#7dff7a', '#2f8a3a'], ['#4f7af2', '#ffffff'], ['#e8383d', '#ffd23f']];
    for (let y = Y + 2; y < Y + H - 6; y += 9) for (let x = X + 2; x < X + W - 7; x += 9) {
      const [a, b] = tolds[(r() * tolds.length) | 0];
      R(g, 'rgba(0,0,0,0.25)', x + 1, y + 2, 7, 6);
      for (let k = 0; k < 7; k++) R(g, (k >> 1) % 2 ? b : a, x + k, y, 1, 6);
      R(g, 'rgba(0,0,0,0.15)', x, y + 5, 7, 1);
    }
    // gente caminando entre los puestos
    for (let k = 0; k < (W * H) / 60; k++) R(g, pick(['#ff4f9a', '#4fe3ff', '#ffd23f', '#f2f2f2', '#2a2a3a']), X + 1 + ((r() * (W - 2)) | 0), Y + 1 + ((r() * (H - 2)) | 0));
  }

  // ---- autocine: pantalla gigante y autos estacionados en abanico
  function driveIn(g, X, Y, W, H, r) {
    R(g, '#3e4052', X, Y, W, H);
    for (let y = Y + 10; y < Y + H - 4; y += 7) R(g, '#4c4e62', X + 3, y, W - 6, 1);
    // pantalla en el borde superior
    R(g, 'rgba(0,0,0,0.35)', X + W * 0.2 + 1, Y + 2, W * 0.6, 5);
    R(g, '#e8e8f0', X + W * 0.2, Y + 1, W * 0.6, 4);
    R(g, '#7fc8ff', X + W * 0.2 + 1, Y + 1, W * 0.6 - 2, 2);
    const cars = ['#e8383d', '#ffd23f', '#2f6ff2', '#f2f2f2', '#3ab8b0', '#1b1a26', '#ff8a1e'];
    for (let y = Y + 9; y < Y + H - 7; y += 7) for (let x = X + 4; x < X + W - 6; x += 7) {
      if (r() < 0.3) continue;
      const c = cars[(r() * cars.length) | 0];
      R(g, c, x, y, 4, 5); R(g, '#1b2240', x, y + 1, 4, 1);
    }
    return [[X + W * 0.5, Y + 3, '#9ad8ff']];
  }

  // ---- templo con portal rojo, techo curvo, jardín y estanque
  function temple(g, X, Y, W, H, r) {
    R(g, '#d8c8a0', X, Y, W, H);
    for (let k = 0; k < (W * H) / 18; k++) R(g, r() < 0.5 ? '#cbbb92' : '#e2d4b0', X + ((r() * W) | 0), Y + ((r() * H) | 0));
    // jardín y estanque
    disc(g, X + W * 0.78, Y + H * 0.72, Math.min(W, H) * 0.2, '#3f8a4a');
    ellipse(g, X + W * 0.78, Y + H * 0.72, Math.min(W, H) * 0.13, Math.min(W, H) * 0.09, '#3fb6e8');
    R(g, '#ff8a1e', X + W * 0.76, Y + H * 0.71, 2, 1);
    for (let k = 0; k < 5; k++) disc(g, X + 4 + r() * (W - 8), Y + H - 4 - r() * 6, 2.5, '#d87aa8');
    // edificio del templo
    const tx = X + W * 0.42, ty = Y + H * 0.38, tw = W * 0.5, th = H * 0.42;
    R(g, 'rgba(0,0,0,0.3)', tx - tw / 2 + 2, ty - th / 2 + 3, tw, th);
    R(g, '#4a3a3a', tx - tw / 2, ty - th / 2, tw, th);
    R(g, '#6a5048', tx - tw / 2 + 1, ty - th / 2 + 1, tw - 2, th / 2 - 1);
    R(g, '#2a2020', tx - tw / 2, ty, tw, 1);
    R(g, '#c8a040', tx - 1, ty - th / 2, 2, th);
    // portal rojo (torii) delante
    const gx = tx, gy = Y + H - 6;
    R(g, '#c8202e', gx - 9, gy - 2, 18, 2); R(g, '#1b1a26', gx - 10, gy - 3, 20, 1);
    R(g, '#c8202e', gx - 7, gy - 1, 2, 5); R(g, '#c8202e', gx + 5, gy - 1, 2, 5);
    R(g, '#e8d8b8', gx - 1, gy + 1, 2, 5);
    return [[gx, gy, '#ff3b5c'], [tx, ty, '#ffd23f']];
  }

  // ---- montaña vista desde arriba: ladera en sombra, ladera iluminada, crestas y nieve en la cumbre
  function mount(g, x, y, rad, pal, snow, r) {
    ellipse(g, x + rad * 0.3, y + rad * 0.32, rad, rad * 0.9, 'rgba(20,12,30,0.32)');
    disc(g, x, y, rad, pal[0]);
    disc(g, x - rad * 0.16, y - rad * 0.16, rad * 0.8, pal[1]);
    const px = x - rad * 0.12, py = y - rad * 0.14;
    poly(g, [[px, py], [x - rad * 0.96, y - rad * 0.12], [x - rad * 0.78, y - rad * 0.62], [x - rad * 0.3, y - rad * 0.92], [x + rad * 0.12, y - rad * 0.9]], pal[2]);
    const a0 = r() * 6.28;
    for (let k = 0; k < 4; k++) {
      const a = a0 + k * 1.57 + (r() - 0.5) * 0.6, ex = px + Math.cos(a) * rad * 0.9, ey = py + Math.sin(a) * rad * 0.9;
      line(g, px, py, ex, ey, Math.cos(a) + Math.sin(a) < 0 ? pal[3] : pal[0], 1);
      if (snow) { const L = 0.5 + snow * 0.35; line(g, px, py, px + (ex - px) * L, py + (ey - py) * L, '#eef2fa', snow > 0.6 ? 2 : 1); }
    }
    if (snow) {
      disc(g, px, py, rad * (0.2 + snow * 0.28), '#dfe6f2');
      disc(g, px - rad * 0.06, py - rad * 0.06, rad * (0.12 + snow * 0.2), '#ffffff');
      for (let k = 0; k < 5; k++) R(g, '#eef2fa', px + (r() - 0.5) * rad * 0.9, py + (r() - 0.5) * rad * 0.9, 2, 1);
    }
  }

  // ---- entorno fuera del mapa (se ve en los bordes): cerros, cordillera, agua, volcanes
  function skirt(g, city, r, MWpx, MHpx, SK) {
    const W = MWpx + SK * 2, H = MHpx + SK * 2;
    const x0 = -SK, y0 = -SK;
    const inMap = (x, y) => x >= 0 && y >= 0 && x < MWpx && y < MHpx;
    const b = city.border;
    if (b === 'river' || b === 'sea') {
      R(g, city.water[0], x0, y0, W, H);
      for (let k = 0; k < (W * H) / 260; k++) {
        const x = x0 + r() * W, y = y0 + r() * H;
        if (!inMap(x, y)) R(g, city.water[1], x, y, 3, 1);
      }
      // botes
      for (let k = 0; k < 10; k++) {
        const x = x0 + r() * W, y = y0 + r() * H;
        if (inMap(x - 20, y - 20) || inMap(x + 20, y + 20)) continue;
        const v = r() < 0.5;
        ellipse(g, x + 1, y + 1, v ? 2.5 : 5.5, v ? 5.5 : 2.5, 'rgba(0,0,0,0.25)');
        ellipse(g, x, y, v ? 2.5 : 5.5, v ? 5.5 : 2.5, '#f2f2f2'); R(g, '#8a5a3a', x - 1, y - 1, 2, 2);
      }
      return;
    }
    const base = { andes: '#8a6e52', volcano: '#6a7048', hills: '#c8a868' }[b] || '#5a8a4a';
    R(g, base, x0, y0, W, H);
    for (let k = 0; k < (W * H) / 40; k++) {
      const x = x0 + r() * W, y = y0 + r() * H;
      if (!inMap(x, y)) R(g, b === 'hills' ? (r() < 0.5 ? '#d8bc80' : '#a88a50') : b === 'volcano' ? (r() < 0.5 ? '#7a8456' : '#565e3a') : (r() < 0.5 ? '#a08060' : '#6e563e'), x, y);
    }
    // cerros y montañas, de atrás hacia adelante para que se monten bien
    const brown = ['#6a5040', '#8a6a50', '#a8845e', '#c4a07a'], rock = ['#5a4e5e', '#7a6a72', '#9a8a8a', '#bcaaa0'];
    const olive = ['#4e5a32', '#66743e', '#7e8c4c', '#9aa864'], dry = ['#a07c48', '#bc985e', '#d2b072', '#e6cc94'];
    const list = [];
    for (let y = y0 - 10; y < y0 + H + 10; y += 17) for (let x = x0 - 10; x < x0 + W + 10; x += 17) {
      const px = x + (r() - 0.5) * 12, py = y + (r() - 0.5) * 12;
      if (inMap(px, py)) continue;
      const east = px >= MWpx;
      if (b === 'andes') {
        const depth = east ? (px - MWpx) / SK : Math.max(-px, -py, py - MHpx, 0) / SK;
        if (east) list.push([px, py, 12 + depth * 14 + r() * 5, depth > 0.22 || r() < 0.25 ? clamp(depth * 1.3, 0.25, 1) : 0, rock]);
        else if (r() < 0.7) list.push([px, py, 7 + depth * 8 + r() * 4, false, r() < 0.55 ? brown : olive]);
      } else if (b === 'volcano') { if (r() < 0.5) list.push([px, py, 6 + r() * 6, false, olive]); }
      else if (b === 'hills') { if (r() < 0.45) list.push([px, py, 7 + r() * 6, false, dry]); }
      else if (r() < 0.6) list.push([px, py, 5, false, null]);
    }
    list.sort((a, b2) => a[1] - b2[1] || a[0] - b2[0]);
    for (const [px, py, rad, snow, pal] of list) {
      if (!pal) { disc(g, px + 2, py + 2, 5, 'rgba(8,30,12,0.35)'); disc(g, px, py, 5, '#2f7d3b'); disc(g, px - 1, py - 1, 3.5, '#45a24a'); continue; }
      mount(g, px, py, rad, pal, snow, r);
      if (!snow && pal !== rock) for (let k = 0; k < rad / 3; k++) disc(g, px + (r() - 0.5) * rad * 1.4, py + (r() - 0.5) * rad * 1.4, 1.2, r() < 0.5 ? '#4a6a30' : '#5e7e3a');
      if (b === 'hills' && r() < 0.15) { const qx = px + rad * 0.8, qy = py + rad * 0.6; for (let k = 0; k < 6; k++) line(g, qx, qy, qx + Math.cos(k) * 5, qy + Math.sin(k) * 5, '#3f9a4a', 1); }
    }
    if (b === 'volcano') {
      // dos volcanes grandes al oriente
      [[MWpx + SK * 0.5, MHpx * 0.3], [MWpx + SK * 0.55, MHpx * 0.68]].forEach(([vx, vy], i) => {
        const cols = ['#4e543a', '#6e7048', '#86805a', '#a09478', '#c8c4bc', '#eef2f8'];
        for (let k = 0; k < 6; k++) disc(g, vx - k * 1.2, vy - k * 1.2, 34 * (1 - k / 7), cols[k]);
        disc(g, vx - 7, vy - 7, 3, i ? '#3a3030' : '#5a4a4a');
      });
    }
  }

  // ---- puente sobre el río que sale del mapa, con un bus rojo
  function bridge(g, y, x0, x1) {
    R(g, 'rgba(0,0,0,0.35)', x0, y - 6, x1 - x0, 14);
    R(g, '#7a7488', x0, y - 8, x1 - x0, 16);
    R(g, '#3b3d50', x0, y - 6, x1 - x0, 12);
    for (let x = x0; x < x1; x += 8) R(g, '#e8dfb8', x, y - 1, 4, 2);
    R(g, '#b8b4c8', x0, y - 8, x1 - x0, 1); R(g, '#b8b4c8', x0, y + 7, x1 - x0, 1);
    for (let x = x0 + 6; x < x1; x += 18) { R(g, '#d8d4e4', x, y - 9, 1, 3); R(g, '#d8d4e4', x, y + 7, 1, 3); }
    // bus de dos pisos detenido en el puente
    const bx = (x0 + x1) / 2 - 13;
    R(g, 'rgba(0,0,0,0.3)', bx + 1, y - 4, 26, 9); R(g, '#c8202e', bx, y - 5, 26, 9); R(g, '#e84a4a', bx + 1, y - 4, 24, 3);
    for (let k = 3; k < 24; k += 4) R(g, '#1b2240', bx + k, y - 2, 2, 2);
  }

  return { largestRect, stadium, port, market, driveIn, temple, skirt, bridge, mount };
})();

