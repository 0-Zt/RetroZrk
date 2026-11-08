// =====================================================================
//  MAIN · consola: menú de cartuchos, pausa, fin de juego, layout, bucle
// =====================================================================
const $ = (s) => document.querySelector(s);
const scr = $('#screen');
let mode = 'menu', game = null, overlay = null, osel = 0, sel = Store.get('cart', 0) % 3;
let toastT = 0;
// arreglo: una versión anterior dejaba el volumen en 0 al tocar la fila en AJUSTES; se recupera una vez
if (!Store.get('vol_fix1', false)) {
  if (Store.get('vol_mus', 5) === 0) Store.set('vol_mus', 5);
  if (Store.get('vol_sfx', 5) === 0) Store.set('vol_sfx', 5);
  Store.set('vol_fix1', true);
}
const Settings = { musV: Store.get('vol_mus', 5), sfxV: Store.get('vol_sfx', 5), vib: Store.get('vib', true), pad: Store.get('padsize', 1) };
Snd.setVol(Settings.musV, Settings.sfxV);
const PAD_K = [0.85, 1, 1.15], PAD_N = ['Chicos', 'Medianos', 'Grandes'], DIFF_N = ['Fácil', 'Normal', 'Difícil', 'Maestro'];
let settingsFrom = null;

const UI = {
  $: (s) => $('#hud').querySelector(s),
  setHud(html) { $('#hud').innerHTML = html; },
  setButtons(a, b) { $('#lblA').textContent = a; $('#lblB').textContent = b; },
  toast(msg) {
    const t = $('#toast');
    t.querySelector('span').textContent = msg;
    t.hidden = false; toastT = 1.8;
  },
  // vibración: se puede apagar en AJUSTES; en la app Android usa el vibrador nativo
  vibrate(ms) {
    if (!Settings.vib) return;
    try {
      if (window.AndroidHaptics) { window.AndroidHaptics.vibrate(Array.isArray(ms) ? JSON.stringify(ms) : String(ms)); return; }
      if (navigator.vibrate) navigator.vibrate(ms);
    } catch (e) { /* sin vibración */ }
  },
  gameOver(name, score, rec, rows, buttons = [['retry', 'REINTENTAR'], ['menu', 'MENÚ']], cite = null) {
    if (cite) {
      // Gas Rally: el fin del juego es un parte de tránsito
      openOverlay('over', `
      <div class="panel cite" role="dialog" aria-label="Parte de tránsito">
        <div class="cite-top"><b>Parte de tránsito</b><span>N.º ${String(100000 + ((score * 7 + 4512) % 900000)).slice(0, 6)}</span></div>
        <div class="cite-body">
          <p class="cite-why"><span>Motivo:</span> ${cite.why}</p>
          <dl>${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>
          <div class="cite-pts"><span>Puntos</span><b>${cite.score}</b>${rec ? '<span class="stamp">¡Nuevo récord!</span>' : ''}</div>
        </div>
        <div class="cite-acts">${buttons.map(([act, label]) => `<button class="mbtn${act === 'cont' ? ' cont' : ''}" data-act="${act}">${label}</button>`).join('')}</div>
      </div>`);
      return;
    }
    openOverlay('over', `
      <div class="panel" role="dialog" aria-label="Fin del juego">
        <h2>FIN DEL JUEGO</h2>
        <p>${name}</p>
        <div class="big">${pad6(score)}</div>
        ${rec ? '<p style="color:var(--sun)">¡NUEVO RÉCORD!</p>' : ''}
        <div class="tally">${rows.map(([k, v]) => `<span>${k}</span><span>${v}</span>`).join('')}</div>
        ${buttons.map(([act, label]) => `<button class="mbtn" data-act="${act}">${label}</button>`).join('')}
      </div>`);
  },
};

// ---------------- overlays (pausa / fin)
function openOverlay(kind, html) {
  overlay = kind; osel = 0;
  const o = $('#overlay');
  o.innerHTML = html; o.hidden = false;
  o.querySelectorAll('.mbtn').forEach((b, i) => {
    b.addEventListener('click', () => { osel = i; overlayAct(b.dataset.act); });
  });
  markOverlay();
}
function closeOverlay() { overlay = null; $('#overlay').hidden = true; $('#overlay').innerHTML = ''; Input.reset(); }
function markOverlay() { $('#overlay').querySelectorAll('.mbtn').forEach((b, i) => b.classList.toggle('sel', i === osel)); }
function openPause() {
  Snd.sfx('pause'); Snd.suspend();
  openOverlay('pause', `
    <div class="panel" role="dialog" aria-label="Pausa">
      <h2>Pausa</h2>
      <button class="mbtn" data-act="resume">Continuar</button>
      <button class="mbtn" data-act="restart">Reiniciar</button>
      <button class="mbtn" data-act="settings">Ajustes</button>
      <button class="mbtn" data-act="menu">Salir al menú</button>
      ${game && game.pauseInfo ? game.pauseInfo() : ''}
      <p>${Engine.touch ? 'START pausa · A elegir' : 'ENTER pausa · Z elegir · M sonido · C filtro CRT'}</p>
    </div>`);
}
// ---------------- ajustes: volúmenes, vibración, tamaño de botones, filtro CRT
function settingsHtml() {
  // volumen: − y + a los lados y cada segmento se puede tocar; tocar la fila nunca lo deja en cero
  const vol = (act, name, v) => `
      <div class="mbtn srow" data-act="${act}" role="group" aria-label="Volumen de ${name.toLowerCase()} ${v} de 5"><span>${name}</span>
        <span class="vctl"><button class="vb" data-v="${act}" data-d="-1" aria-label="Bajar ${name.toLowerCase()}">−</button><span class="vbar">${[1, 2, 3, 4, 5].map((l) => `<i class="${l <= v ? 'on' : ''}" data-v="${act}" data-l="${l}"></i>`).join('')}</span><button class="vb" data-v="${act}" data-d="1" aria-label="Subir ${name.toLowerCase()}">+</button></span></div>`;
  return `
    <div class="panel set" role="dialog" aria-label="Ajustes">
      <h2>Ajustes</h2>
      ${vol('s_mus', 'Música', Settings.musV)}
      ${vol('s_sfx', 'Efectos', Settings.sfxV)}
      <button class="mbtn srow" data-act="s_mute"><span>Sonido</span><b>${Snd.isMuted() ? 'Apagado' : 'Encendido'}</b></button>
      <button class="mbtn srow" data-act="s_vib"><span>Vibración</span><b>${Settings.vib ? 'Sí' : 'No'}</b></button>
      ${Engine.touch ? `<button class="mbtn srow" data-act="s_pad"><span>Botones</span><b>${PAD_N[Settings.pad]}</b></button>` : ''}
      <button class="mbtn srow" data-act="s_crt"><span>Filtro CRT</span><b>${Engine.crt ? 'Sí' : 'No'}</b></button>
      <button class="mbtn srow" data-act="s_diff"><span>Dificultad</span><b>${DIFF_N[Math.min(Store.get('rally_diff', 1), Store.get('rally_done', 0) ? 3 : 2)]}</b></button>
      <button class="mbtn srow" data-act="s_free" aria-label="Modo prueba: todas las ciudades abiertas"><span>Modo prueba</span><b>${Store.get('rally_free', false) ? 'Sí' : 'No'}</b></button>
      <button class="mbtn" data-act="s_back">Volver</button>
      <p>◀ ▶ CAMBIAR · ${Engine.touch ? 'B' : 'X'} VOLVER</p>
    </div>`;
}
function openSettings(from) { settingsFrom = from; Snd.resume(); openOverlay('settings', settingsHtml()); bindVolume(); }
function bindVolume() {
  const o = $('#overlay');
  o.querySelectorAll('.vb').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); settingsChange(b.dataset.v, +b.dataset.d); }));
  o.querySelectorAll('.vbar i').forEach((s) => s.addEventListener('click', (e) => { e.stopPropagation(); settingsChange(s.dataset.v, 0, +s.dataset.l); }));
}
function settingsChange(act, d, level) {
  if (act === 's_mus') { Settings.musV = level != null ? level : clamp(Settings.musV + d, 0, 5); Store.set('vol_mus', Settings.musV); }
  else if (act === 's_sfx') { Settings.sfxV = level != null ? level : clamp(Settings.sfxV + d, 0, 5); Store.set('vol_sfx', Settings.sfxV); }
  else if (act === 's_mute') { Snd.toggleMute(); }
  else if (act === 's_vib') { Settings.vib = !Settings.vib; Store.set('vib', Settings.vib); if (Settings.vib) UI.vibrate(40); }
  else if (act === 's_pad') { Settings.pad = (Settings.pad + d + 3) % 3; Store.set('padsize', Settings.pad); layout(); }
  else if (act === 's_crt') { Engine.crt = !Engine.crt; Store.set('crt', Engine.crt); }
  else if (act === 's_diff') { const n = Store.get('rally_done', 0) ? 4 : 3; Store.set('rally_diff', (Math.min(Store.get('rally_diff', 1), n - 1) + d + n) % n); }
  else if (act === 's_free') {
    const on = !Store.get('rally_free', false);
    Store.set('rally_free', on);
    UI.toast(on ? 'GAS RALLY: TODAS LAS CIUDADES Y RONDAS ABIERTAS' : 'MODO PRUEBA APAGADO');
  }
  else if (act !== '') return;
  Snd.setVol(Settings.musV, Settings.sfxV);
  Snd.sfx('select');
  const keep = osel;
  openOverlay('settings', settingsHtml());
  bindVolume();
  osel = keep; markOverlay();
}
function closeSettings() {
  if (settingsFrom === 'pause') openPause();
  else { closeOverlay(); refreshMenu(); }
}
function overlayAct(act) {
  Snd.unlock(); Snd.resume();
  if (act.startsWith('s_')) { if (act === 's_back') closeSettings(); else settingsChange(act, 1); return; }
  if (act === 'settings') { openSettings(mode === 'menu' ? 'menu' : 'pause'); return; }
  if (act === 'resume') { closeOverlay(); Snd.sfx('select'); }
  else if (act === 'restart' || act === 'retry') { closeOverlay(); Snd.sfx('start'); if (game.retry) game.retry(); else { game.exit(); game.start(); } }
  else if (act === 'menu') { closeOverlay(); toMenu(); }
  else { closeOverlay(); Snd.sfx('select'); if (game.action) game.action(act); }
}
function overlayStep() {
  const btns = $('#overlay').querySelectorAll('.mbtn');
  if (overlay === 'settings') {
    const act = btns[osel] && btns[osel].dataset.act;
    if (Input.pressed.left && act !== 's_back') settingsChange(act, -1);
    if (Input.pressed.right && act !== 's_back') settingsChange(act, 1);
    if (Input.pressed.b || Input.pressed.select || Input.pressed.start) { closeSettings(); return; }
  }
  if (Input.pressed.up) { osel = (osel + btns.length - 1) % btns.length; markOverlay(); Snd.sfx('move'); }
  if (Input.pressed.down) { osel = (osel + 1) % btns.length; markOverlay(); Snd.sfx('move'); }
  if (Input.pressed.a || (Input.pressed.start && overlay === 'over')) overlayAct(btns[osel].dataset.act);
  else if (overlay === 'pause' && (Input.pressed.start || Input.pressed.b || Input.pressed.select)) overlayAct('resume');
}

// ---------------- menú
const menuScene = new THREE.Scene();
const menuMat = new THREE.ShaderMaterial({
  uniforms: { time: { value: 0 }, res: { value: new THREE.Vector2(384, 216) } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `
    uniform float time; uniform vec2 res; varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      vec2 p = floor(vUv * res) + 0.5;
      float hz = res.y * 0.36;
      vec3 col;
      if (p.y > hz) {
        float t = (p.y - hz) / (res.y - hz);
        col = mix(vec3(1.0, 0.42, 0.38), vec3(0.42, 0.12, 0.5), smoothstep(0.0, 0.5, t));
        col = mix(col, vec3(0.06, 0.03, 0.16), smoothstep(0.45, 1.0, t));
        vec2 sc = vec2(res.x * 0.5, hz + 28.0);
        float d = length(p - sc);
        float band = fract((sc.y - p.y) / 7.0 + time * 0.25);
        bool gap = p.y < sc.y - 2.0 && band < (sc.y - p.y) / 60.0 + 0.12;
        if (d < 40.0 && !gap) col = mix(vec3(1.0, 0.9, 0.38), vec3(1.0, 0.3, 0.58), clamp((sc.y + 40.0 - p.y) / 80.0, 0.0, 1.0));
        float h = hash(floor(p / 2.0));
        if (h > 0.986 && t > 0.4) col += vec3(0.75) * (0.5 + 0.5 * sin(time * 3.0 + h * 50.0));
      } else {
        float z = hz - p.y;
        float persp = 60.0 / (z + 2.0);
        float gx = (p.x - res.x * 0.5) * persp * 0.11;
        float gz = persp * 2.6 + time * 2.0;
        float lx = step(abs(fract(gx + 0.5) - 0.5), fwidth(gx) * 0.7);
        float lz = step(abs(fract(gz + 0.5) - 0.5), fwidth(gz) * 0.7);
        col = mix(vec3(0.09, 0.03, 0.16), vec3(0.03, 0.01, 0.08), z / hz);
        col = mix(col, vec3(1.0, 0.31, 0.6), max(lx, lz) * clamp(1.15 - z / hz * 0.35, 0.0, 1.0) * smoothstep(3.0, 16.0, z));
        col += vec3(1.0, 0.35, 0.5) * exp(-z * 0.18) * 0.55;
      }
      col = floor(col * 14.0 + 0.5) / 14.0;
      gl_FragColor = vec4(col, 1.0);
    }`,
});
const menuQuad = new THREE.Mesh(QUAD, menuMat);
menuQuad.position.z = -50;
menuScene.add(menuQuad);
const skyline = (() => {
  const { c, g } = mk(256, 60);
  const r = rng32(8);
  let x = 0;
  while (x < 256) {
    const w = 10 + ((r() * 18) | 0), h = 12 + ((r() * 44) | 0);
    R(g, '#140a2c', x, 60 - h, w, h);
    for (let k = 0; k < 4; k++) if (r() < 0.6) R(g, r() < 0.5 ? '#ff4f9a' : '#ffd36b', x + 2 + ((r() * (w - 4)) | 0), 60 - h + 3 + ((r() * (h - 6)) | 0));
    if (r() < 0.3) R(g, '#140a2c', x + (w >> 1), 60 - h - 6, 1, 6);
    x += w + 1;
  }
  const t = T(c); t.wrapS = THREE.RepeatWrapping;
  const m = new THREE.Mesh(QUAD, new THREE.MeshBasicMaterial({ map: t, alphaTest: 0.5 }));
  m.position.z = -40;
  menuScene.add(m);
  return { m, t };
})();
function drawMenuThumbs() {
  const RA = Rally.art;
  const hero = heroPose(HERO, { aim: 'dup', legF: RUN_LEG[0], legB: RUN_LEG[3], tf: 1 });
  // rally
  {
    const c = $('#cart-rally canvas'), g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    R(g, '#4ea94b', 0, 0, 96, 64);
    for (let i = 0; i < 12; i++) disc(g, 6 + i * 9, 6 + (i % 2) * 3, 4, '#2f7d3b');
    R(g, '#3b3d50', 0, 22, 96, 18); R(g, '#3b3d50', 54, 0, 18, 64);
    for (let x = 0; x < 96; x += 8) R(g, '#e8dfb8', x, 30, 4, 2);
    R(g, '#bdb8cc', 0, 20, 54, 2); R(g, '#bdb8cc', 0, 40, 54, 2); R(g, '#bdb8cc', 72, 20, 24, 2); R(g, '#bdb8cc', 72, 40, 24, 2);
    R(g, '#c9694f', 74, 44, 22, 20); R(g, '#e89a7c', 74, 44, 22, 2);
    R(g, '#6f7fb8', 0, 44, 50, 20); R(g, '#9fb0e2', 0, 44, 50, 2);
    g.drawImage(rot90(RA.carPc[0], 1), 18, 22);
    g.drawImage(rot90(RA.carEc[0], 1), 0, 22);
    g.drawImage(RA.canSc[0], 56, 4);
    g.drawImage(RA.canNc[0], 74, 23);
    g.drawImage(rallySmoke(2), 2, 4);
  }
  // commando
  {
    const c = $('#cart-contra canvas'), g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    for (let y = 0; y < 64; y++) { const t = y / 64; R(g, `rgb(${Math.round(40 + t * 210)},${Math.round(20 + t * 110)},${Math.round(90 + t * 10)})`, 0, y, 96, 1); }
    disc(g, 66, 34, 14, '#ffd36b');
    for (let y = 36; y < 48; y += 4) R(g, `rgb(${Math.round(40 + (y / 64) * 210)},${Math.round(20 + (y / 64) * 110)},100)`, 50, y, 32, 1);
    const r = rng32(4);
    for (let x = 0; x < 96;) { const w = 6 + ((r() * 10) | 0), h = 10 + ((r() * 24) | 0); R(g, '#2b1d4f', x, 52 - h, w, h); if (r() < 0.6) R(g, '#ffd36b', x + 2, 54 - h, 1, 1); x += w + 1; }
    R(g, '#a8a2bc', 0, 52, 96, 3); R(g, '#cfc9de', 0, 52, 96, 1); R(g, '#3b2f4f', 0, 55, 96, 9);
    g.drawImage(hero, 4, 13);
    for (let k = 0; k < 3; k++) { disc(g, 38 + k * 10, 20 - k * 8, 1.8, '#ffd23f'); R(g, '#ffffff', 38 + k * 10, 20 - k * 8); }
  }
  // próximamente
  {
    const c = $('#cart-soon canvas'), g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    R(g, '#120d26', 0, 0, 96, 64);
    for (let y = 0; y < 64; y += 4) R(g, '#1a1434', 0, y, 96, 1);
    g.save(); g.translate(36, 14); g.scale(8, 8); glyph(g, '?', 0, 0, '#4fe3ff'); g.restore();
    g.save(); g.translate(39, 15); g.scale(8, 8); glyph(g, '?', 0, 0, '#ff4f9a'); g.restore();
  }
}
function refreshMenu() {
  $('#rec-rally').textContent = 'REC ' + pad6(Store.get('hi_rally', 0));
  $('#rec-contra').textContent = 'REC ' + pad6(Store.get('hi_contra', 0));
  document.querySelectorAll('.cart').forEach((c, i) => c.classList.toggle('sel', i === sel));
  const silent = Snd.isMuted() || Settings.musV + Settings.sfxV === 0;
  $('#optSound').textContent = Snd.isMuted() ? 'SONIDO OFF' : Settings.musV + Settings.sfxV === 0 ? 'VOLUMEN EN 0' : 'SONIDO ON';
  $('#optSound').classList.toggle('on', !silent);

  const fb = $('#optFull');
  fb.hidden = !fsOK || !!window.__NATIVE_APP || matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches;
  fb.textContent = isFull() ? 'SALIR PANT. COMPLETA' : 'PANTALLA COMPLETA';
  fb.classList.toggle('on', isFull());
}
function menuStep() {
  if (Input.pressed.left) { sel = (sel + 2) % 3; Snd.sfx('move'); refreshMenu(); }
  if (Input.pressed.right) { sel = (sel + 1) % 3; Snd.sfx('move'); refreshMenu(); }
  if (Input.pressed.a || Input.pressed.start) launch(sel);
  if (Input.pressed.select) openSettings('menu');
}
function launch(i) {
  Snd.unlock();
  sel = i; Store.set('cart', i); refreshMenu();
  if (i === 2) { Snd.sfx('back'); UI.toast('CARTUCHO 3 EN DESARROLLO · PRÓXIMAMENTE'); return; }
  Snd.sfx('start');
  $('#menu').hidden = true;
  mode = 'game';
  document.body.classList.remove('inmenu');
  game = i === 0 ? Rally : Contra;
  document.body.classList.toggle('g-rally', game === Rally);
  document.body.classList.toggle('g-contra', game === Contra);
  Input.reset();
  game.start();
  keepAwake(true);
}
function toMenu() {
  if (game) game.exit();
  Snd.loopsOff();
  keepAwake(false);
  game = null; mode = 'menu';
  document.body.classList.remove('g-rally', 'g-contra');
  document.body.classList.add('inmenu');
  UI.setHud(''); UI.setButtons('OK', 'VOLVER');
  $('#menu').hidden = false;
  Engine.flash = 0; Engine.shakeT = 0;
  refreshMenu();
  Snd.play(SONGS.menu);
  Input.reset();
}
// pantalla completa (navegador) y pantalla siempre encendida mientras se juega
const fsEl = document.documentElement;
const fsOK = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
const isFull = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
function toggleFull() {
  try {
    if (isFull()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else {
      const p = (fsEl.requestFullscreen || fsEl.webkitRequestFullscreen).call(fsEl, { navigationUI: 'hide' });
      if (p && p.catch) p.catch(() => UI.toast('ESTE NAVEGADOR NO PERMITE PANTALLA COMPLETA'));
    }
  } catch (e) { UI.toast('ESTE NAVEGADOR NO PERMITE PANTALLA COMPLETA'); }
}
let wake = null;
async function keepAwake(on) {
  try {
    if (on && !wake && navigator.wakeLock && document.visibilityState === 'visible') { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); }
    else if (!on && wake) { await wake.release(); wake = null; }
  } catch (e) { wake = null; }
}
function toggleSound() { Snd.unlock(); Snd.toggleMute(); refreshMenu(); Snd.sfx('select'); }
function toggleCrt() { Engine.crt = !Engine.crt; Store.set('crt', Engine.crt); refreshMenu(); if (overlay === 'settings') settingsChange('', 0); }

// ---------------- controles táctiles
function bindPad() {
  const dp = $('#dpad');
  let dpId = null;
  const T0 = Input.touch;
  const setDir = (cx, cy) => {
    const r = dp.getBoundingClientRect();
    const dx = (cx - (r.left + r.width / 2)) / (r.width / 2), dy = (cy - (r.top + r.height / 2)) / (r.height / 2);
    const th = 0.3;
    let L = dx < -th, Rr = dx > th, U = dy < -th, D = dy > th;
    if (Math.abs(dx) > Math.abs(dy) * 2.2) U = D = false;
    if (Math.abs(dy) > Math.abs(dx) * 2.2) L = Rr = false;
    for (const [k, v] of [['left', L], ['right', Rr], ['up', U], ['down', D]]) {
      if (v && !T0[k]) { Input.latch(k); UI.vibrate(6); }
      T0[k] = v;
    }
    dp.className = (U ? 'u ' : '') + (D ? 'd ' : '') + (L ? 'l ' : '') + (Rr ? 'r' : '');
  };
  const clearDir = () => { T0.left = T0.right = T0.up = T0.down = false; dp.className = ''; };
  dp.addEventListener('pointerdown', (e) => { e.preventDefault(); Snd.unlock(); dpId = e.pointerId; try { dp.setPointerCapture(e.pointerId); } catch (er) { /* */ } setDir(e.clientX, e.clientY); });
  dp.addEventListener('pointermove', (e) => { if (e.pointerId === dpId) setDir(e.clientX, e.clientY); });
  const endDp = (e) => { if (e.pointerId !== dpId) return; dpId = null; clearDir(); };
  dp.addEventListener('pointerup', endDp); dp.addEventListener('pointercancel', endDp); dp.addEventListener('lostpointercapture', endDp);
  const btn = (el, act) => {
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault(); Snd.unlock();
      try { el.setPointerCapture(e.pointerId); } catch (er) { /* */ }
      T0[act] = true; Input.latch(act); el.classList.add('on'); UI.vibrate(8);
    });
    const up = () => { T0[act] = false; el.classList.remove('on'); };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('lostpointercapture', up);
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  };
  btn($('#btnA'), 'a'); btn($('#btnB'), 'b'); btn($('#btnC'), 'c'); btn($('#btnD'), 'd'); btn($('#btnFix'), 'f'); btn($('#btnStart'), 'start'); btn($('#btnSel'), 'select');
}

// ---------------- layout responsivo
function layout() {
  const touch = matchMedia('(pointer: coarse)').matches || (navigator.maxTouchPoints > 0 && matchMedia('(hover: none)').matches);
  Engine.touch = touch;
  const portrait = innerHeight > innerWidth;
  const b = document.body.classList;
  b.toggle('touch', touch); b.toggle('portrait', portrait); b.toggle('landscape', !portrait); b.toggle('short', innerHeight < 430);
  const st = $('#stage'), app = $('#app'), pad = $('#pad');
  const ovl = touch && !portrait;
  b.toggle('ovl', ovl);
  let aw, ah, minA = 1.2, maxA = 2.0;
  if (touch && portrait) {
    // vertical: pantalla de borde a borde (marco de 2px); los controles llenan el resto
    st.style.flex = '0 0 auto';
    aw = app.clientWidth - 4;
    ah = Math.max(120, app.clientHeight * 0.6 - 8);
    minA = 1.12;
  } else if (ovl) {
    // horizontal: el juego ocupa toda la pantalla y los controles van encima
    st.style.flex = ''; st.style.height = '';
    aw = app.clientWidth; ah = app.clientHeight;
    maxA = 2.4;
  } else {
    st.style.flex = ''; st.style.height = '';
    const cs = getComputedStyle(st);
    aw = st.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 20;
    ah = st.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - 20;
  }
  if (aw < 50 || ah < 50) return;
  const aspect = clamp(aw / ah, minA, maxA);
  const W = Math.round((H * aspect) / 2) * 2;
  let sw = aw, sh = (sw * H) / W;
  if (sh > ah) { sh = ah; sw = (sh * W) / H; }
  sw = Math.floor(sw); sh = Math.floor(sh);
  if (touch && portrait) {
    st.style.height = sh + 8 + 'px';
    const ph = app.clientHeight - (sh + 8);
    pad.style.setProperty('--s', (clamp(Math.min(ph / 330, (app.clientWidth / 2 - 26) / 158), 0.7, 1.25) * PAD_K[Settings.pad]).toFixed(3));
  } else if (ovl) pad.style.setProperty('--s', (clamp(app.clientHeight / 360, 0.72, 1.15) * PAD_K[Settings.pad]).toFixed(3));
  else pad.style.setProperty('--s', 1);
  scr.style.width = sw + 'px'; scr.style.height = sh + 'px';
  scr.style.setProperty('--px', sh / H + 'px');
  const pr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(3.2e6 / (sw * sh)));
  renderer.setPixelRatio(pr);
  renderer.setSize(sw, sh, false);
  setInternalWidth(W);
  menuMat.uniforms.res.value.set(W, H);
}

// ---------------- bucle de juego (paso fijo 60 Hz, render por frame)
let last = performance.now(), acc = 0;
function step(dt) {
  if (Engine.shakeT > 0) Engine.shakeT -= dt;
  if (toastT > 0 && (toastT -= dt) <= 0) $('#toast').hidden = true;
  if (overlay) overlayStep();
  else if (mode === 'menu') menuStep();
  else if (Input.pressed.start && !(game.capturesStart && game.capturesStart())) openPause();
  else game.update(dt);
}
function draw() {
  if (mode === 'menu') {
    const W = Engine.W;
    menuQuad.scale.set(W, H, 1); menuQuad.position.set(W / 2, -H / 2, -50);
    menuMat.uniforms.time.value = Engine.time;
    skyline.m.scale.set(W, 60, 1); skyline.m.position.set(W / 2, -(H * 0.64 - 30 + 1), -40);
    skyline.t.repeat.x = W / 256; skyline.t.offset.x = (Math.floor(Engine.time * 6) % 256) / 256;
    setCam(0, 0);
    renderScene(menuScene);
  } else game.render();
}
function loop(now) {
  requestAnimationFrame(loop);
  let dt = (now - last) / 1000;
  last = now;
  if (dt > 0.25) dt = 0.25;
  if (dt < 0) dt = 0;
  acc += dt;
  let n = 0;
  while (acc >= STEP && n < 5) { Input.poll(); step(STEP); Input.end(); acc -= STEP; n++; }
  if (n === 5) acc = 0;
  Engine.time += dt;
  Engine.flash = Math.max(0, Engine.flash - dt * 2.4);
  draw();
}

function boot() {
  Engine.crt = Store.get('crt', true);
  layout();
  bindPad();
  drawMenuThumbs();
  refreshMenu();
  $('#menu').hidden = false;
  document.body.classList.add('inmenu');
  document.querySelectorAll('.cart').forEach((c, i) => c.addEventListener('click', () => launch(i)));
  $('#optSound').addEventListener('click', toggleSound);
  $('#optSet').addEventListener('click', () => { Snd.unlock(); openSettings('menu'); });
  $('#optFull').addEventListener('click', toggleFull);
  document.addEventListener('fullscreenchange', () => { refreshMenu(); setTimeout(layout, 60); });
  document.addEventListener('webkitfullscreenchange', () => { refreshMenu(); setTimeout(layout, 60); });
  Input.onKey = (k) => { if (k === 'mute') toggleSound(); if (k === 'crt') toggleCrt(); };
  addEventListener('pointerdown', () => Snd.unlock(), { passive: true });
  addEventListener('resize', layout);
  addEventListener('orientationchange', () => setTimeout(layout, 120));
  if (window.ResizeObserver) new ResizeObserver(() => layout()).observe($('#stage'));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (mode === 'game' && !overlay) openPause(); Snd.suspend(); }
    else { if (!overlay) Snd.resume(); if (mode === 'game') keepAwake(true); }
  });
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  Snd.play(SONGS.menu);
  requestAnimationFrame((t) => { last = t; loop(t); });
}
// botón "atrás" de la app Android: pausa / vuelve / sale desde el menú
window.__androidBack = () => {
  if (overlay === 'settings') { closeSettings(); return 'ok'; }
  if (mode === 'menu') return 'exit';
  if (overlay === 'pause') overlayAct('resume');
  else if (overlay === 'over') overlayAct('menu');
  else openPause();
  return 'ok';
};
if (window.claude && window.claude.hot && window.claude.hot.ready) window.claude.hot.ready(() => boot());
else boot();

