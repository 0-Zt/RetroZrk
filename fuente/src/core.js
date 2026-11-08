// =====================================================================
//  CORE · render pixel-perfect, post CRT, utilidades, input, audio
// =====================================================================
const THREE = window.THREE; // three.js r160 (UMD desde jsDelivr)
THREE.ColorManagement.enabled = false;

const H = 216;
const STEP = 1 / 60;
const Engine = { W: 384, H, time: 0, touch: false, crt: true, flash: 0, flashCol: [1, 1, 1], shakeT: 0, shakeA: 0 };

// ---------- utilidades
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const pick = (a) => a[(Math.random() * a.length) | 0];
const sign = (v) => (v > 0 ? 1 : v < 0 ? -1 : 0);
function rng32(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const Store = {
  get(k, d) { try { const v = localStorage.getItem('pxa_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('pxa_' + k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } },
};
const pad6 = (n) => String(Math.max(0, Math.floor(n))).padStart(6, '0');

// ---------- color
const _rgbCache = {};
function rgb(hex) {
  if (_rgbCache[hex]) return _rgbCache[hex];
  const n = parseInt(hex.slice(1), 16);
  return (_rgbCache[hex] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]);
}
function hexNum(hex) { return parseInt(hex.slice(1), 16); }

// ---------- lienzo pixel
function mk(w, h) {
  const c = document.createElement('canvas');
  c.width = w + (w & 1); c.height = h + (h & 1);
  const g = c.getContext('2d', { willReadFrequently: true });
  g.imageSmoothingEnabled = false;
  return { c, g, w: c.width, h: c.height };
}
function R(g, col, x, y, w = 1, h = 1) { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); }
function disc(g, cx, cy, r, col) {
  g.fillStyle = col;
  for (let y = Math.floor(cy - r - 1); y <= Math.ceil(cy + r); y++) {
    const dy = y + 0.5 - cy;
    if (Math.abs(dy) > r) continue;
    const hw = Math.sqrt(r * r - dy * dy);
    const x0 = Math.ceil(cx - hw - 0.5), x1 = Math.floor(cx + hw - 0.5);
    if (x1 >= x0) g.fillRect(x0, y, x1 - x0 + 1, 1);
  }
}
function ellipse(g, cx, cy, rx, ry, col) {
  g.fillStyle = col;
  for (let y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry); y++) {
    const dy = (y + 0.5 - cy) / ry;
    if (Math.abs(dy) > 1) continue;
    const hw = rx * Math.sqrt(1 - dy * dy);
    const x0 = Math.ceil(cx - hw - 0.5), x1 = Math.floor(cx + hw - 0.5);
    if (x1 >= x0) g.fillRect(x0, y, x1 - x0 + 1, 1);
  }
}
function poly(g, pts, col) {
  g.fillStyle = col;
  let minY = 1e9, maxY = -1e9;
  for (const p of pts) { minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); }
  for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
    const yc = y + 0.5, xs = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      if ((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) xs.push(a[0] + ((yc - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
    }
    xs.sort((p, q) => p - q);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const x0 = Math.ceil(xs[i] - 0.5), x1 = Math.floor(xs[i + 1] - 0.5);
      if (x1 >= x0) g.fillRect(x0, y, x1 - x0 + 1, 1);
    }
  }
}
function line(g, x0, y0, x1, y1, col, w = 1) {
  g.fillStyle = col;
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  const o = Math.floor(w / 2);
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    g.fillRect(Math.round(x0 + (x1 - x0) * t) - o, Math.round(y0 + (y1 - y0) * t) - o, w, w);
  }
}
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bayer = (x, y) => (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;
// recorre los pixeles de un canvas
function mapPixels(c, fn) {
  const g = c.getContext('2d');
  const im = g.getImageData(0, 0, c.width, c.height), d = im.data;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) fn(d, (y * c.width + x) * 4, x, y);
  g.putImageData(im, 0, 0);
  return c;
}
// contorno de 1px alrededor de lo opaco (estética 8/16 bits)
function outline(c, col = '#120d20') {
  const g = c.getContext('2d');
  const w = c.width, h = c.height;
  const im = g.getImageData(0, 0, w, h), d = im.data;
  const a = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) a[i] = d[i * 4 + 3] > 127 ? 1 : 0;
  const [r, gg, b] = rgb(col);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (a[i]) { d[i * 4 + 3] = 255; continue; }
    if ((x > 0 && a[i - 1]) || (x < w - 1 && a[i + 1]) || (y > 0 && a[i - w]) || (y < h - 1 && a[i + w])) {
      d[i * 4] = r; d[i * 4 + 1] = gg; d[i * 4 + 2] = b; d[i * 4 + 3] = 255;
    } else d[i * 4 + 3] = 0;
  }
  g.putImageData(im, 0, 0);
  return c;
}
function ditherOut(c, amount, ox = 0, oy = 0) {
  return mapPixels(c, (d, i, x, y) => { if (bayer(x + ox, y + oy) < amount) d[i + 3] = 0; });
}
function whiten(src, col = '#ffffff') {
  const { c, g } = mk(src.width, src.height);
  g.drawImage(src, 0, 0);
  const [r, gg, b] = rgb(col);
  return mapPixels(c, (d, i) => { if (d[i + 3] > 0) { d[i] = r; d[i + 1] = gg; d[i + 2] = b; } });
}
function darken(src, k = 0.55) {
  const { c, g } = mk(src.width, src.height);
  g.drawImage(src, 0, 0);
  return mapPixels(c, (d, i) => { d[i] *= k; d[i + 1] *= k; d[i + 2] *= k * 1.1; });
}
function rot90(src, k) {
  k = ((k % 4) + 4) % 4;
  const sw = src.width, sh = src.height;
  const { c, g } = mk(k & 1 ? sh : sw, k & 1 ? sw : sh);
  g.translate(c.width / 2, c.height / 2);
  g.rotate((k * Math.PI) / 2);
  g.drawImage(src, -sw / 2, -sh / 2);
  return c;
}

// ---------- fuente pixel 3x5
const F3 = {
  '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001011001111', '4': '101101111001001',
  '5': '111100111001111', '6': '111100111101111', '7': '111001010010010', '8': '111101111101111', '9': '111101111001111',
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111',
  F: '111100110100100', G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010',
  K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010',
  P: '110101110100100', Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
  U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101', Y: '101101010010010',
  Z: '111001010100111', '+': '000010111010000', '-': '000000111000000', '!': '010010010000010', '.': '000000000000010',
  '?': '110001010000010', ' ': '000000000000000', ':': '000010000010000', '/': '001001010100100',
};
const F5 = {
  M: '1000111011101011000110001', S: '0111110000011100000111110', L: '1000010000100001000011111',
  F: '1111110000111101000010000', B: '1111010001111101000111110', R: '1111010001111101010010010',
  H: '1000110001111111000110001',
};
function glyph(g, ch, x, y, col, big = false) {
  const set = big ? F5 : F3, n = big ? 5 : 3, bits = set[ch] || set[' '] || F3[' '];
  g.fillStyle = col;
  for (let i = 0; i < bits.length; i++) if (bits[i] === '1') g.fillRect(x + (i % n), y + Math.floor(i / n), 1, 1);
}
function textCanvas(str, col = '#ffffff', oc = '#120d20') {
  str = str.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const { c, g } = mk(str.length * 4 + 2, 8);
  for (let i = 0; i < str.length; i++) glyph(g, str[i], 1 + i * 4, 1, col);
  return outline(c, oc);
}

// ---------- texturas
function T(c) {
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
  t.w = c.width; t.h = c.height; t.src = c;
  return t;
}
const _txtCache = new Map();
function textTex(str, col = '#ffffff') {
  const k = str + col;
  if (!_txtCache.has(k)) _txtCache.set(k, T(textCanvas(str, col)));
  return _txtCache.get(k);
}

// ---------- renderer
const glCanvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: false, alpha: false, powerPreference: 'high-performance', stencil: false });
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setClearColor(0x07050f, 1);
const rt = new THREE.WebGLRenderTarget(Engine.W, H, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: false, depthBuffer: true });
const cam = new THREE.OrthographicCamera(0, Engine.W, 0, -H, 0.1, 1000);
cam.position.set(0, 0, 500);
function setCam(x, y) {
  let sx = 0, sy = 0;
  if (Engine.shakeT > 0) { sx = (Math.random() * 2 - 1) * Engine.shakeA; sy = (Math.random() * 2 - 1) * Engine.shakeA; }
  cam.position.x = Math.round(x + sx);
  cam.position.y = -Math.round(y + sy);
}
function shake(a, t) { Engine.shakeA = Math.max(Engine.shakeA * (Engine.shakeT > 0 ? 1 : 0), a); Engine.shakeT = Math.max(Engine.shakeT, t); }
function flash(a = 0.6, col = [1, 1, 1]) { Engine.flash = Math.max(Engine.flash, a); Engine.flashCol = col; }

// post-proceso: escalado nítido (sharp-bilinear) + CRT moderno (curvatura, scanlines, glow, viñeta)
const postScene = new THREE.Scene();
const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const postMat = new THREE.ShaderMaterial({
  uniforms: {
    tDiffuse: { value: rt.texture }, res: { value: new THREE.Vector2(Engine.W, H) },
    crt: { value: 1 }, flash: { value: 0 }, flashCol: { value: new THREE.Vector3(1, 1, 1) },
  },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform vec2 res; uniform float crt; uniform float flash; uniform vec3 flashCol;
    varying vec2 vUv;
    vec3 tex(vec2 uv){
      vec2 px = uv * res;
      vec2 seam = floor(px + 0.5);
      vec2 d = px - seam;
      vec2 fw = max(fwidth(px), vec2(1e-4));
      px = seam + clamp(d / fw, -0.5, 0.5);
      return texture2D(tDiffuse, px / res).rgb;
    }
    void main(){
      vec2 uv = vUv;
      vec2 cc = uv * 2.0 - 1.0;
      if (crt > 0.5) {
        cc += cc * (cc.yx * cc.yx) * 0.03;
        uv = cc * 0.5 + 0.5;
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
      }
      vec3 col = tex(uv);
      if (crt > 0.5) {
        float ca = 0.45 / res.x * dot(cc, cc);
        col.r = mix(col.r, tex(uv + vec2(ca, 0.0)).r, 0.7);
        col.b = mix(col.b, tex(uv - vec2(ca, 0.0)).b, 0.7);
        vec2 t = 1.0 / res;
        vec3 gl = texture2D(tDiffuse, uv + vec2(1.5, 0.0) * t).rgb + texture2D(tDiffuse, uv - vec2(1.5, 0.0) * t).rgb
                + texture2D(tDiffuse, uv + vec2(0.0, 1.5) * t).rgb + texture2D(tDiffuse, uv - vec2(0.0, 1.5) * t).rgb
                + texture2D(tDiffuse, uv + vec2(3.0, 2.0) * t).rgb + texture2D(tDiffuse, uv - vec2(3.0, 2.0) * t).rgb
                + texture2D(tDiffuse, uv + vec2(-2.0, 3.0) * t).rgb + texture2D(tDiffuse, uv - vec2(-2.0, 3.0) * t).rgb;
        gl *= 0.125;
        col += max(gl - 0.5, 0.0) * 0.85;
        float sy = fract(uv.y * res.y);
        col *= 1.0 - 0.22 * pow(abs(sy - 0.5) * 2.0, 2.0);
        col *= 1.0 - 0.18 * dot(cc, cc);
        col = mix(col, col * col * (3.0 - 2.0 * col), 0.25);
      }
      col = mix(col, flashCol, flash);
      gl_FragColor = vec4(col, 1.0);
    }`,
  depthTest: false, depthWrite: false,
});
postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat));

function renderScene(scene) {
  postMat.uniforms.crt.value = Engine.crt ? 1 : 0;
  postMat.uniforms.flash.value = Engine.flash;
  postMat.uniforms.flashCol.value.set(...Engine.flashCol);
  renderer.setRenderTarget(rt);
  renderer.render(scene, cam);
  renderer.setRenderTarget(null);
  renderer.render(postScene, postCam);
}
function setInternalWidth(W) {
  if (W === Engine.W) return false;
  Engine.W = W;
  rt.setSize(W, H);
  postMat.uniforms.res.value.set(W, H);
  cam.right = W; cam.updateProjectionMatrix();
  return true;
}

// ---------- sprites
const QUAD = new THREE.PlaneGeometry(1, 1);
class Spr {
  constructor(parent, t, z = 0, o = {}) {
    this.mat = new THREE.MeshBasicMaterial({
      map: t, transparent: !!o.transparent, alphaTest: o.transparent ? 0.02 : 0.5, depthWrite: !o.transparent,
      opacity: o.opacity ?? 1, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    if (o.color) this.mat.color.setHex(o.color);
    this.m = new THREE.Mesh(QUAD, this.mat);
    this.m.position.z = z;
    this.m.frustumCulled = false;
    this.parent = parent;
    parent.add(this.m);
    this.flip = false; this.w = 1; this.h = 1; this.k = 1;
    this.set(t);
  }
  set(t) {
    if (this.mat.map !== t) this.mat.map = t;
    if (t.w !== this.w || t.h !== this.h) { this.w = t.w; this.h = t.h; this.rescale(); }
    return this;
  }
  rescale() { this.m.scale.set((this.flip ? -1 : 1) * this.w * this.k, this.h * this.k, 1); }
  // escala entera (2x, 3x, 4x) para mantener el pixel nítido
  scaleBy(k) { if (k !== this.k) { this.k = k; this.rescale(); } return this; }
  setFlip(f) { if (f !== this.flip) { this.flip = f; this.rescale(); } return this; }
  tint(hex) { this.mat.color.set(hex); return this; }
  // posiciona por centro, alineado a la grilla de pixeles
  at(x, y) {
    const w = this.w * this.k, h = this.h * this.k;
    this.m.position.x = Math.round(x - w / 2) + w / 2;
    this.m.position.y = -(Math.round(y - h / 2) + h / 2);
    return this;
  }
  // posiciona por un punto ancla (pixel del canvas), respetando espejo horizontal
  anchor(x, y, ax, ay) {
    const axx = this.flip ? this.w - ax : ax;
    this.m.position.x = Math.round(x - axx) + this.w / 2;
    this.m.position.y = -(Math.round(y - ay) + this.h / 2);
    return this;
  }
  show(v) { this.m.visible = v; return this; }
  get visible() { return this.m.visible; }
  rot(a) { this.m.rotation.z = a; return this; }
  z(v) { this.m.position.z = v; return this; }
  remove() { this.parent.remove(this.m); this.mat.dispose(); }
}

// ---------- partículas: un único draw call de puntos cuadrados (= pixeles)
class Particles {
  constructor(parent, max = 900, z = 40) {
    this.max = max; this.n = 0; this.z = z;
    this.pos = new Float32Array(max * 3); this.col = new Float32Array(max * 3); this.sz = new Float32Array(max);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('pcol', new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('psize', new THREE.BufferAttribute(this.sz, 1).setUsage(THREE.DynamicDrawUsage));
    geo.setDrawRange(0, 0);
    this.geo = geo;
    const mat = new THREE.ShaderMaterial({
      vertexShader: 'attribute float psize; attribute vec3 pcol; varying vec3 vC; void main(){ vC = pcol; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_PointSize = psize; }',
      fragmentShader: 'varying vec3 vC; void main(){ gl_FragColor = vec4(vC, 1.0); }',
    });
    this.pts = new THREE.Points(geo, mat);
    this.pts.frustumCulled = false;
    parent.add(this.pts);
    const F = () => new Float32Array(max);
    this.x = F(); this.y = F(); this.vx = F(); this.vy = F(); this.t = F(); this.ttl = F(); this.g = F(); this.dr = F();
    this.r0 = F(); this.g0 = F(); this.b0 = F(); this.r1 = F(); this.g1 = F(); this.b1 = F(); this.s0 = F(); this.s1 = F(); this.zz = F();
  }
  emit(x, y, vx, vy, ttl, c0, c1 = c0, s0 = 1, s1 = s0, grav = 0, drag = 0, z = 0) {
    if (this.n >= this.max) return;
    const i = this.n++;
    this.x[i] = x; this.y[i] = y; this.vx[i] = vx; this.vy[i] = vy; this.t[i] = 0; this.ttl[i] = ttl; this.g[i] = grav; this.dr[i] = drag;
    this.r0[i] = ((c0 >> 16) & 255) / 255; this.g0[i] = ((c0 >> 8) & 255) / 255; this.b0[i] = (c0 & 255) / 255;
    this.r1[i] = ((c1 >> 16) & 255) / 255; this.g1[i] = ((c1 >> 8) & 255) / 255; this.b1[i] = (c1 & 255) / 255;
    this.s0[i] = s0; this.s1[i] = s1; this.zz[i] = z;
  }
  burst(x, y, n, speed, ttl, c0, c1, s0 = 1, s1 = 1, grav = 0, drag = 2) {
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2, v = speed * (0.3 + Math.random() * 0.7);
      this.emit(x, y, Math.cos(a) * v, Math.sin(a) * v, ttl * (0.6 + Math.random() * 0.6), c0, c1, s0, s1, grav, drag);
    }
  }
  kill(i) {
    const j = --this.n;
    if (i === j) return;
    for (const k of ['x', 'y', 'vx', 'vy', 't', 'ttl', 'g', 'dr', 'r0', 'g0', 'b0', 'r1', 'g1', 'b1', 's0', 's1', 'zz']) this[k][i] = this[k][j];
  }
  clear() { this.n = 0; this.geo.setDrawRange(0, 0); }
  update(dt) {
    let i = 0;
    while (i < this.n) {
      this.t[i] += dt;
      if (this.t[i] >= this.ttl[i]) { this.kill(i); continue; }
      this.vy[i] += this.g[i] * dt;
      if (this.dr[i]) { const k = Math.max(0, 1 - this.dr[i] * dt); this.vx[i] *= k; this.vy[i] *= k; }
      this.x[i] += this.vx[i] * dt; this.y[i] += this.vy[i] * dt;
      i++;
    }
  }
  sync() {
    for (let i = 0; i < this.n; i++) {
      const u = this.t[i] / this.ttl[i];
      const s = Math.max(0, Math.round(this.s0[i] + (this.s1[i] - this.s0[i]) * u));
      const off = s & 1 ? 0.5 : 0;
      this.pos[i * 3] = Math.floor(this.x[i]) + off;
      this.pos[i * 3 + 1] = -(Math.floor(this.y[i]) + off);
      this.pos[i * 3 + 2] = this.z + this.zz[i];
      this.col[i * 3] = this.r0[i] + (this.r1[i] - this.r0[i]) * u;
      this.col[i * 3 + 1] = this.g0[i] + (this.g1[i] - this.g0[i]) * u;
      this.col[i * 3 + 2] = this.b0[i] + (this.b1[i] - this.b0[i]) * u;
      this.sz[i] = s;
    }
    this.geo.setDrawRange(0, this.n);
    this.geo.attributes.position.needsUpdate = true;
    this.geo.attributes.pcol.needsUpdate = true;
    this.geo.attributes.psize.needsUpdate = true;
  }
}

// ---------- entrada: teclado + táctil + gamepad, con "latch" para toques rápidos
const Input = (() => {
  const ACTS = ['left', 'right', 'up', 'down', 'a', 'b', 'c', 'd', 'e', 'f', 'start', 'select'];
  const KEYS = {
    ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
    KeyZ: 'a', Space: 'a', KeyJ: 'a', KeyX: 'b', KeyK: 'b', ShiftLeft: 'b', KeyV: 'c', KeyL: 'c', KeyQ: 'd', KeyF: 'e', KeyE: 'select', Enter: 'start', KeyP: 'start', Escape: 'start', Backspace: 'select', Tab: 'select',
  };
  const kb = {}, touch = {}, latch = {}, pad = {}, held = {}, prev = {}, pressed = {};
  const api = { held, pressed, touch, onKey: null, anyPressed: false };
  addEventListener('keydown', (e) => {
    if (e.code === 'KeyM' && !e.repeat) api.onKey && api.onKey('mute');
    if (e.code === 'KeyC' && !e.repeat) api.onKey && api.onKey('crt');
    const a = KEYS[e.code];
    if (!a) return;
    e.preventDefault();
    Snd.unlock();
    if (!e.repeat) { kb[a] = true; latch[a] = true; }
  });
  addEventListener('keyup', (e) => { const a = KEYS[e.code]; if (a) { kb[a] = false; e.preventDefault(); } });
  addEventListener('blur', () => { for (const k in kb) kb[k] = false; for (const k in touch) touch[k] = false; });
  function pollPad() {
    for (const a of ACTS) pad[a] = false;
    const gps = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const gp of gps) {
      if (!gp) continue;
      const b = (i) => gp.buttons[i] && gp.buttons[i].pressed;
      const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
      pad.left = pad.left || b(14) || ax < -0.45; pad.right = pad.right || b(15) || ax > 0.45;
      pad.up = pad.up || b(12) || ay < -0.45; pad.down = pad.down || b(13) || ay > 0.45;
      pad.a = pad.a || b(0); pad.b = pad.b || b(2) || b(1); pad.c = pad.c || b(3) || b(5); pad.d = pad.d || b(4); pad.e = pad.e || b(6) || b(7); pad.start = pad.start || b(9); pad.select = pad.select || b(8);
    }
  }
  api.poll = () => {
    pollPad();
    let any = false;
    for (const a of ACTS) {
      const h = !!(kb[a] || touch[a] || latch[a] || pad[a]);
      pressed[a] = h && !prev[a];
      if (pressed[a]) any = true;
      held[a] = h;
    }
    api.anyPressed = any;
  };
  api.end = () => { for (const a of ACTS) { prev[a] = held[a]; latch[a] = false; } };
  api.reset = () => { for (const a of ACTS) { kb[a] = false; latch[a] = false; prev[a] = true; held[a] = false; pressed[a] = false; } };
  api.latch = (a) => { latch[a] = true; };
  return api;
})();

// ---------- audio chiptune (WebAudio puro: ondas de pulso, triángulo y ruido)
const Snd = (() => {
  let ctx = null, master, sfx, mus, noiseBuf, pulse = {};
  let muted = Store.get('muted', false), pending = null;
  // volumen de música y efectos por separado (0..5)
  let volM = Store.get('vol_mus', 5) / 5, volS = Store.get('vol_sfx', 5) / 5;
  const last = {};
  const api = {};
  api.isMuted = () => muted;
  api.unlock = () => {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try { ctx = new AC(); } catch (e) { return; }
      master = ctx.createGain(); master.gain.value = muted ? 0 : 0.6; master.connect(ctx.destination);
      const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
      sfx = ctx.createGain(); sfx.gain.value = 0.55 * volS; sfx.connect(comp);
      mus = ctx.createGain(); mus.gain.value = 0.3 * volM; mus.connect(comp);
      comp.connect(master);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const mkPulse = (duty) => {
        const n = 48, re = new Float32Array(n), im = new Float32Array(n);
        for (let k = 1; k < n; k++) re[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty);
        return ctx.createPeriodicWave(re, im);
      };
      pulse.p25 = mkPulse(0.25); pulse.p12 = mkPulse(0.125);
      G = makeGraph(ctx, mus);
      if (pending) { const s = pending; pending = null; api.play(s); }
      warmFoley();
    }
    if (ctx.state === 'suspended') ctx.resume();
  };
  api.toggleMute = () => {
    muted = !muted; Store.set('muted', muted);
    if (master) master.gain.setTargetAtTime(muted ? 0 : 0.6, ctx.currentTime, 0.02);
    return muted;
  };
  api.setVol = (m, x) => {
    volM = m / 5; volS = x / 5;
    if (ctx) { mus.gain.setTargetAtTime(0.3 * volM, ctx.currentTime, 0.02); sfx.gain.setTargetAtTime(0.55 * volS, ctx.currentTime, 0.02); }
  };
  // para grabar lo que suena (pruebas y avances): conecta la salida a otro nodo
  api.tap = (dest) => { if (master && dest) master.connect(dest); return ctx; };
  api.suspend = () => { if (ctx && ctx.state === 'running') ctx.suspend(); };
  api.resume = () => { if (ctx && ctx.state === 'suspended') ctx.resume(); };
  function osc(type) {
    const o = ctx.createOscillator();
    if (pulse[type]) o.setPeriodicWave(pulse[type]); else o.type = type;
    return o;
  }
  function tone(type, f0, f1, dur, vol = 0.3, delay = 0, dest = sfx) {
    const t = ctx.currentTime + delay;
    const o = osc(type), g = ctx.createGain();
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.03);
  }
  function noise(dur, vol = 0.3, f0 = 3000, f1 = 300, ft = 'lowpass', delay = 0, dest = sfx, q = 0.8) {
    const t = ctx.currentTime + delay;
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const f = ctx.createBiquadFilter(); f.type = ft; f.Q.value = q;
    f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.03);
  }
  const N = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const SFX = {
    select: () => { tone('p25', 660, 990, 0.07, 0.22); },
    move: () => { tone('p12', 520, 520, 0.04, 0.15); },
    start: () => { [72, 76, 79, 84].forEach((m, i) => tone('p25', N(m), N(m), 0.1, 0.22, i * 0.07)); },
    back: () => { tone('p25', 600, 300, 0.1, 0.2); },
    pause: () => { tone('p25', 880, 880, 0.06, 0.2); tone('p25', 660, 660, 0.08, 0.2, 0.08); },
    smoke: () => { noise(0.45, 0.32, 1400, 200, 'lowpass'); tone('triangle', 180, 90, 0.25, 0.25); },
    fuel: () => { tone('p25', N(84), N(84), 0.07, 0.22); tone('p25', N(91), N(91), 0.14, 0.22, 0.07); },
    fuelS: () => { [79, 83, 86, 91, 95].forEach((m, i) => tone('p25', N(m), N(m), 0.08, 0.2, i * 0.05)); },
    lucky: () => { [72, 79, 84, 88, 91, 96].forEach((m, i) => tone('p12', N(m), N(m), 0.09, 0.2, i * 0.05)); },
    crash: () => { noise(0.8, 0.55, 2400, 80, 'lowpass'); tone('square', 320, 40, 0.6, 0.25); },
    stun: () => { tone('p12', 1200, 300, 0.25, 0.14); },
    tick: () => { tone('p12', 1760, 1760, 0.025, 0.12); },
    oneup: () => { [76, 79, 88, 84, 86, 91].forEach((m, i) => tone('p25', N(m), N(m), 0.08, 0.22, i * 0.07)); },
    count: () => { tone('p25', N(69), N(69), 0.16, 0.25); },
    go: () => { tone('p25', N(81), N(81), 0.35, 0.28); },
    shoot: () => { tone('p25', 1100, 380, 0.07, 0.16); },
    mgun: () => { tone('p25', 1300, 520, 0.05, 0.13); noise(0.03, 0.1, 6000, 3000, 'highpass'); },
    spread: () => { tone('square', 850, 260, 0.09, 0.13); noise(0.05, 0.12, 5000, 1500, 'bandpass'); },
    laser: () => { tone('sawtooth', 2200, 180, 0.22, 0.14); tone('p12', 1100, 90, 0.22, 0.1); },
    fireball: () => { tone('triangle', 260, 520, 0.12, 0.2); noise(0.1, 0.1, 900, 400, 'bandpass'); },
    jump: () => { tone('p12', 330, 620, 0.1, 0.12); },
    hit: () => { noise(0.05, 0.18, 7000, 2500, 'highpass'); },
    tink: () => { tone('square', 2400, 2000, 0.04, 0.08); },
    eshot: () => { tone('p25', 700, 320, 0.08, 0.1); },
    explode: () => { noise(0.45, 0.5, 2600, 90, 'lowpass'); tone('triangle', 140, 40, 0.35, 0.3); },
    boom: () => { noise(1.2, 0.7, 3000, 60, 'lowpass'); tone('triangle', 110, 30, 1.0, 0.45); tone('square', 80, 30, 0.6, 0.15); },
    powerup: () => { [72, 76, 79, 84, 88].forEach((m, i) => tone('p25', N(m), N(m), 0.07, 0.22, i * 0.045)); },
    die: () => { [76, 72, 67, 64, 60, 55].forEach((m, i) => tone('p25', N(m), N(m) * 0.97, 0.1, 0.22, i * 0.08)); },
    alarm: () => { for (let i = 0; i < 3; i++) { tone('square', 880, 880, 0.14, 0.14, i * 0.3); tone('square', 660, 660, 0.14, 0.14, i * 0.3 + 0.15); } },
    missile: () => { noise(0.35, 0.18, 800, 3000, 'bandpass'); },
    fly: () => { noise(1.4, 0.16, 300, 1600, 'bandpass'); tone('triangle', 160, 240, 1.2, 0.1); },
    clear: () => { [67, 72, 76, 79, 76, 79, 84].forEach((m, i) => tone('p25', N(m), N(m), i === 6 ? 0.5 : 0.12, 0.24, i * 0.12)); },
    gameover: () => { [67, 66, 65, 64, 60].forEach((m, i) => tone('triangle', N(m), N(m), i === 4 ? 0.7 : 0.22, 0.3, i * 0.24)); },
    // --- rally: ítems, tráfico y eventos
    skid: () => { noise(0.28, 0.16, 2600, 1800, 'bandpass', 0, sfx, 6); },
    nitro: () => { noise(0.7, 0.3, 400, 4000, 'bandpass', 0, sfx, 2); tone('sawtooth', 110, 330, 0.6, 0.12); },
    shield: () => { [72, 79, 84].forEach((m, i) => tone('triangle', N(m), N(m + 12), 0.14, 0.18, i * 0.06)); },
    shieldOff: () => { tone('triangle', 1200, 200, 0.3, 0.18); noise(0.2, 0.15, 6000, 1500, 'highpass'); },
    horn: () => { tone('p25', 392, 392, 0.12, 0.14); tone('p25', 466, 466, 0.12, 0.1); tone('p25', 392, 392, 0.16, 0.14, 0.16); tone('p25', 466, 466, 0.16, 0.1, 0.16); },
    quake: () => { noise(1.6, 0.5, 220, 40, 'lowpass'); tone('triangle', 55, 30, 1.4, 0.4); },
    siren: () => { for (let i = 0; i < 4; i++) tone('p25', i % 2 ? 740 : 980, i % 2 ? 980 : 740, 0.22, 0.12, i * 0.22); },
    item: () => { [84, 88, 91, 96, 91, 96].forEach((m, i) => tone('p12', N(m), N(m), 0.05, 0.16, i * 0.035)); },
    coin: () => { tone('p25', N(88), N(88), 0.05, 0.16); tone('p25', N(95), N(95), 0.12, 0.16, 0.05); },
    oil: () => { noise(0.3, 0.2, 500, 200, 'lowpass'); tone('triangle', 200, 120, 0.2, 0.15); },
    spin: () => { tone('p12', 900, 300, 0.35, 0.12); tone('p12', 700, 250, 0.35, 0.08, 0.1); },
    buy: () => { [76, 81, 84, 88, 93].forEach((m, i) => tone('p25', N(m), N(m), 0.07, 0.2, i * 0.05)); noise(0.08, 0.1, 8000, 4000, 'highpass', 0.25); },
    deny: () => { tone('square', 220, 200, 0.12, 0.14); tone('square', 180, 160, 0.16, 0.14, 0.12); },
    whistle: () => { tone('sine', 2400, 2600, 0.12, 0.1); tone('sine', 2400, 2600, 0.25, 0.1, 0.18); },
    chop: () => { noise(0.07, 0.22, 420, 120, 'lowpass'); },
    whoosh: () => { noise(0.28, 0.22, 600, 3200, 'bandpass', 0, sfx, 1.5); },
    spot: () => { tone('square', 1320, 1320, 0.06, 0.12); tone('square', 1320, 1320, 0.06, 0.12, 0.1); },
    // --- pistas especiales
    leap: () => { tone('p25', 220, 880, 0.22, 0.16); noise(0.25, 0.14, 800, 2400, 'bandpass'); },
    land: () => { noise(0.22, 0.4, 900, 60, 'lowpass'); tone('triangle', 120, 50, 0.18, 0.3); },
    cheer: () => { noise(1.1, 0.16, 1800, 900, 'bandpass', 0, sfx, 0.6); noise(0.9, 0.1, 3200, 2200, 'bandpass', 0.1, sfx, 1.2); },
    pop: () => { noise(0.05, 0.2, 3000, 800, 'lowpass'); noise(0.5, 0.06, 6000, 2000, 'highpass', 0.06); },
    puff: () => { noise(0.25, 0.22, 2400, 400, 'lowpass'); },
    rumble: () => { noise(1.4, 0.45, 300, 50, 'lowpass'); tone('triangle', 70, 35, 1.2, 0.3); },
    thud: () => { noise(0.3, 0.45, 700, 50, 'lowpass'); tone('triangle', 90, 40, 0.25, 0.35); },
    bell: () => { for (let i = 0; i < 4; i++) { tone('triangle', 1760, 1740, 0.12, 0.12, i * 0.25); tone('sine', 2640, 2600, 0.08, 0.05, i * 0.25); } },
    meow: () => { tone('sawtooth', 520, 820, 0.18, 0.08); tone('sawtooth', 820, 460, 0.32, 0.08, 0.18); tone('p12', 1040, 900, 0.4, 0.05, 0.1); },
    drill: () => { tone('square', 660, 1320, 0.12, 0.12); tone('square', 990, 1980, 0.12, 0.1, 0.1); },
    ach: () => { [79, 84, 88, 91, 96].forEach((m, i) => tone('triangle', N(m), N(m), 0.12, 0.2, i * 0.07)); },
  };
  // ---------- efectos propios (sfx.js): se calculan una vez y se tocan como buffers
  // banco 'rally' = efectos del Gas Rally; fuera de él solo la consola usa los nuevos
  let bank = 'arcade';
  const fcache = {};
  api.bank = (b) => { bank = b; };
  function foleyBufs(name, all) {
    let vs = fcache[name];
    if (!vs) vs = fcache[name] = [];
    const want = all ? 3 : 1;
    while (vs.length < want) {
      const d = Foley.render(name, ctx.sampleRate, 13 + vs.length * 7919);
      const b = ctx.createBuffer(1, d.length, ctx.sampleRate);
      if (b.copyToChannel) b.copyToChannel(d, 0); else b.getChannelData(0).set(d);
      vs.push(b);
    }
    return vs;
  }
  // prepara los efectos de a uno en los ratos libres (primero una variante de cada uno, después el resto)
  function warmFoley() {
    const list = Foley.names().map((n) => [n, false]).concat(Foley.names().map((n) => [n, true]));
    const idle = window.requestIdleCallback || ((f) => setTimeout(() => f({ timeRemaining: () => 8 }), 40));
    const step = (dl) => {
      while (list.length && dl.timeRemaining() > 4) { const [n, all] = list.shift(); try { foleyBufs(n, all); } catch (e) { /* sin audio */ } }
      if (list.length) idle(step);
    };
    idle(step);
  }
  function playFoley(name, o) {
    const vs = foleyBufs(name, false), b = vs[(Math.random() * vs.length) | 0];
    const s = ctx.createBufferSource(); s.buffer = b;
    s.playbackRate.value = ((o && o.rate) || 1) * (1 + (Math.random() - 0.5) * 0.05 * Foley.jitter(name));
    const g = ctx.createGain(); g.gain.value = o && o.vol != null ? o.vol : 1;
    s.connect(g);
    let n = g;
    if (o && o.pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = clamp(o.pan, -1, 1); n.connect(p); n = p; }
    n.connect(sfx); s.start();
  }
  // ---------- sonidos continuos: motor y sirena
  // motor: pulsos de explosión (onda propia) por dos resonancias fijas del escape y la admisión,
  // con un temblor aleatorio para que no suene a zumbido de chip
  let eng = null, sir = null, sirStyle = 'wail';
  const live = () => ctx && ctx.state === 'running';
  function engineWave() {
    const n = 40, re = new Float32Array(n), im = new Float32Array(n);
    for (let k = 1; k < n; k++) { re[k] = 0; im[k] = Math.pow(k, -0.85) * (k % 2 ? 1 : 0.6) * (1 + 0.35 * Math.sin(k * 1.7)); }
    return ctx.createPeriodicWave(re, im);
  }
  api.engine = (level, pitch) => {
    if (!live()) return;
    if (!eng) {
      if (level <= 0.01) return;
      const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), sh = ctx.createWaveShaper();
      const b1 = ctx.createBiquadFilter(), b2 = ctx.createBiquadFilter(), lp = ctx.createBiquadFilter(), g = ctx.createGain(), g2 = ctx.createGain();
      o1.setPeriodicWave(engineWave()); o2.type = 'sine';
      const curve = new Float32Array(256); for (let i = 0; i < 256; i++) { const x = i / 127.5 - 1; curve[i] = Math.tanh(x * 2.2); }
      sh.curve = curve;
      b1.type = 'bandpass'; b1.frequency.value = 380; b1.Q.value = 1.3;
      b2.type = 'bandpass'; b2.frequency.value = 1150; b2.Q.value = 2.2;
      lp.type = 'lowpass'; lp.frequency.value = 2200; lp.Q.value = 0.5;
      const m2 = ctx.createGain(); m2.gain.value = 0.55;
      g.gain.value = 0; g2.gain.value = 0.35;
      // admisión: ruido de aire que sube con el acelerador
      const ns = ctx.createBufferSource(); ns.buffer = noiseBuf; ns.loop = true;
      const nf = ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 900; nf.Q.value = 0.8;
      const ng = ctx.createGain(); ng.gain.value = 0;
      o1.connect(sh); sh.connect(b1); sh.connect(b2); b2.connect(m2);
      b1.connect(lp); m2.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g);
      ns.connect(nf); nf.connect(ng); ng.connect(g);
      g.connect(sfx);
      o1.start(); o2.start(); ns.start();
      eng = { o1, o2, ns, g, ng, lp };
    }
    const t = ctx.currentTime, fr = 38 + pitch * 72;
    eng.o1.frequency.setTargetAtTime(fr, t, 0.06);
    eng.o1.detune.setTargetAtTime((Math.random() - 0.5) * 22, t, 0.02);
    eng.o2.frequency.setTargetAtTime(fr * 0.5, t, 0.06);
    eng.lp.frequency.setTargetAtTime(900 + pitch * 1800, t, 0.08);
    eng.ng.gain.setTargetAtTime(Math.max(0, level) * (0.05 + pitch * 0.12), t, 0.08);
    eng.g.gain.setTargetAtTime(Math.max(0, level) * 0.075, t, 0.06);
  };
  // sirena según el país: wail (lenta), yelp (rápida), hilo (dos tonos de Londres), jp (Tokio), toy (juguete)
  const SIRENS = {
    wail: { lfo: 'triangle', rate: 0.32, c: 960, d: 330 },
    yelp: { lfo: 'triangle', rate: 3.1, c: 1000, d: 320 },
    hilo: { lfo: 'square', rate: 0.95, c: 790, d: 110 },
    jp: { lfo: 'sawtooth', rate: 0.42, c: 760, d: 260 },
    toy: { lfo: 'square', rate: 4.2, c: 1500, d: 260 },
  };
  api.sirenStyle = (st) => {
    if (!SIRENS[st] || st === sirStyle) return;
    sirStyle = st;
    if (sir && ctx) { const P = SIRENS[st], t = ctx.currentTime; sir.lfo.type = P.lfo; sir.lfo.frequency.setValueAtTime(P.rate, t); sir.o.frequency.setValueAtTime(P.c, t); sir.lg.gain.setValueAtTime(P.d, t); }
  };
  api.siren = (level) => {
    if (!live()) return;
    if (!sir) {
      if (level <= 0.01) return;
      const P = SIRENS[sirStyle];
      const o = ctx.createOscillator(), lfo = ctx.createOscillator(), lg = ctx.createGain(), g = ctx.createGain(), f = ctx.createBiquadFilter();
      const n = 12, re = new Float32Array(n), im = new Float32Array(n);
      for (let k = 1; k < n; k++) im[k] = [0, 1, 0.55, 0.42, 0.18, 0.2, 0.08, 0.1, 0.04, 0.05, 0.02, 0.02][k];
      o.setPeriodicWave(ctx.createPeriodicWave(re, im));
      o.frequency.value = P.c; lfo.type = P.lfo; lfo.frequency.value = P.rate; lg.gain.value = P.d; g.gain.value = 0;
      f.type = 'lowpass'; f.Q.value = 0.7; f.frequency.value = 1200;
      lfo.connect(lg); lg.connect(o.frequency); o.connect(f); f.connect(g); g.connect(sfx);
      o.start(); lfo.start();
      sir = { o, lfo, lg, g, f };
    }
    const t = ctx.currentTime, lv = Math.max(0, level);
    sir.f.frequency.setTargetAtTime(700 + lv * 3800, t, 0.15);   // de lejos suena opaca
    sir.g.gain.setTargetAtTime(lv * 0.05, t, 0.12);
  };
  api.loopsOff = () => {
    for (const k of ['eng', 'sir']) {
      const L = k === 'eng' ? eng : sir;
      if (!L) continue;
      if (ctx) L.g.gain.setTargetAtTime(0, ctx.currentTime, 0.04);
      setTimeout(() => { try { for (const n of Object.values(L)) if (n.stop) n.stop(); } catch (e) { /* ya detenido */ } }, 300);
    }
    eng = null; sir = null;
  };
  api.sfx = (name, o) => {
    if (!ctx || muted) return;
    const now = ctx.currentTime;
    if (last[name] && now - last[name] < 0.035) return;
    last[name] = now;
    try { const k = Foley.key(name, bank); if (k) playFoley(k, o); else if (SFX[name]) SFX[name](); } catch (e) { /* nodo de audio no disponible */ }
  };
  // --- secuenciador de música
  const midi = (s) => {
    const m = /^([A-G])(#|b)?(-?\d)$/.exec(s);
    const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]];
    return base + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (parseInt(m[3], 10) + 1) * 12;
  };
  api.seq = (str) => {
    const tk = str.trim().split(/\s+/), out = [];
    for (let i = 0; i < tk.length; i++) {
      const t = tk[i];
      if (t === '.' || t === '-') { out.push(null); continue; }
      let len = 1;
      while (tk[i + len] === '-') len++;
      out.push({ m: midi(t), len });
    }
    return out;
  };
  api.bars = (len, list) => {
    list.forEach((b, i) => { const n = b.trim().split(/\s+/).length; if (n !== len) console.warn(`compás ${i + 1} tiene ${n} pasos (esperados ${len}): ${b}`); });
    return api.seq(list.join(' '));
  };
  // ===== música =====
  // Cada canción pasa por su propio "bus": compresor suave, eco (delay con filtro) y un leve
  // bombeo del resto de la mezcla con cada golpe de bombo. Los instrumentos van más allá del
  // chip clásico: sierra doble desafinada, bajo con filtro, pluck, pad y campana.
  let song = null, step = 0, nextT = 0, timer = 0, G = null;
  function makeGraph(c, dest) {
    const g = { ctx: c };
    const nb = c.createBuffer(1, c.sampleRate, c.sampleRate), nd = nb.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    g.noise = nb;
    const pw = (duty) => {
      const n = 48, re = new Float32Array(n), im = new Float32Array(n);
      for (let k = 1; k < n; k++) re[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty);
      return c.createPeriodicWave(re, im);
    };
    g.pulse = { p25: pw(0.25), p12: pw(0.125) };
    g.comp = c.createDynamicsCompressor();
    g.comp.threshold.value = -16; g.comp.knee.value = 8; g.comp.ratio.value = 3; g.comp.attack.value = 0.004; g.comp.release.value = 0.14;
    g.post = c.createGain(); g.comp.connect(g.post); g.post.connect(dest);
    g.out = c.createGain(); g.out.connect(g.comp);
    g.duck = c.createGain(); g.duck.connect(g.out);
    g.drums = c.createGain(); g.drums.gain.value = 0.9; g.drums.connect(g.out);
    g.echoIn = c.createGain(); g.echoDel = c.createDelay(1.5); g.echoLp = c.createBiquadFilter(); g.echoFb = c.createGain(); g.echoWet = c.createGain();
    g.echoLp.type = 'lowpass'; g.echoLp.frequency.value = 2600; g.echoFb.gain.value = 0.34; g.echoWet.gain.value = 0.6;
    g.echoIn.connect(g.echoDel); g.echoDel.connect(g.echoLp); g.echoLp.connect(g.echoFb); g.echoFb.connect(g.echoDel);
    g.echoLp.connect(g.echoWet); g.echoWet.connect(g.out);
    return g;
  }
  function oscG(g, type) {
    const o = g.ctx.createOscillator();
    if (g.pulse[type]) o.setPeriodicWave(g.pulse[type]); else o.type = type;
    return o;
  }
  // Cada canal es un sintetizador monofónico persistente (osciladores que quedan sonando y solo se
  // automatizan): mucho más liviano que crear nodos por nota, ideal para teléfonos.
  function makeVoice(g, ch, s) {
    const c = g.ctx, type = ch.type || 'p25', v = { ch, oscs: [] };
    v.amp = c.createGain(); v.amp.gain.value = 0;
    let tail = v.amp;
    if (ch.pan && c.createStereoPanner) { const pn = c.createStereoPanner(); pn.pan.value = ch.pan; v.amp.connect(pn); tail = pn; }
    tail.connect(s.pump && ch.duck !== false ? g.duck : g.out);
    if (ch.fx) { const sg = c.createGain(); sg.gain.value = ch.fx; tail.connect(sg); sg.connect(g.echoIn); }
    const add = (w, mul, det, dest, gain) => {
      const o = oscG(g, w);
      if (det) o.detune.value = det;
      if (gain != null) { const gg = c.createGain(); gg.gain.value = gain; o.connect(gg); gg.connect(dest); } else o.connect(dest);
      v.oscs.push({ o, mul });
    };
    const lp = (cut, q) => { const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = q; fl.frequency.value = cut; fl.connect(v.amp); v.flt = fl; return fl; };
    if (type === 'saw') { const fl = lp(ch.cut || 3000, ch.q || 1.4); add('sawtooth', 1, -7, fl, 0.6); add('sawtooth', 1, 7, fl, 0.6); v.fenv = [ch.cut || 3000, 0.75, 0.3]; }
    else if (type === 'supersq') { const fl = lp(ch.cut || 3400, 0.7); add('square', 1, -9, fl, 0.5); add('square', 1, 9, fl, 0.5); }
    else if (type === 'pad') { const fl = lp(ch.cut || 1300, 0.7); add('sawtooth', 1, -12, fl, 0.45); add('sawtooth', 1, 12, fl, 0.45); }
    else if (type === 'bass') { const fl = lp(ch.cut || 1500, ch.q || 5); add('sawtooth', 1, 0, fl, 0.85); add('sine', 0.5, 0, v.amp, 0.45); v.fenv = [ch.cut || 1500, 0.32, 0.16]; }
    else if (type === 'pluck') { const fl = lp(ch.cut || 4200, ch.q || 2); add('p25', 1, 0, fl, 0.9); v.fenv = [ch.cut || 4200, 0.09, 0.25]; }
    else if (type === 'bell') {
      add('sine', 1, 0, v.amp);
      v.fm = c.createGain(); v.fm.gain.value = 0; v.fm.connect(v.amp);
      add('sine', 3.01, 0, v.fm); add('sine', 2, 0, v.amp, 0.18);
    }
    else if (type === 'sub') add('sine', 1, 0, v.amp);
    else add(type, 1, 0, v.amp);
    const t0 = c.currentTime;
    for (const { o } of v.oscs) o.start(t0);
    return v;
  }
  function stopVoices(vs, t) { for (const v of vs || []) for (const { o } of v.oscs) { try { o.stop(t); } catch (e) { /* ya detenido */ } } }
  // los instrumentos nuevos suben un poco para que la melodía se oiga en el parlante del teléfono
  const LIFT = { saw: 1.45, supersq: 1.45, pluck: 1.4, bell: 1.35, pad: 1.2, bass: 0.85 };
  function noteOn(v, n, t, dt, s) {
    const ch = v.ch, f = N(n.m + (s.tr || 0));
    const len = n.len * dt, dur = ch.decay ? Math.min(ch.decay, len * 1.5) : len * (ch.gate || 0.9);
    const att = ch.att != null ? ch.att : ch.type === 'pad' ? 0.09 : 0.004;
    const rel = ch.rel != null ? ch.rel : ch.type === 'pad' ? 0.28 : 0.03;
    const vol = ch.vol * (n.acc || 1) * (LIFT[ch.type] || 1), a = v.amp.gain;
    for (const { o, mul } of v.oscs) o.frequency.setValueAtTime(f * mul, t);
    a.setTargetAtTime(0, t - 0.006, 0.0015);              // corte breve: cada nota se ataca de nuevo
    a.setTargetAtTime(vol, t, att / 3 + 0.0008);
    if (ch.decay) a.setTargetAtTime(0, t + att, dur / 4);
    else a.setTargetAtTime(0, t + Math.max(att, dur), rel / 3 + 0.002);
    if (v.fenv) { const [c0, k, tm] = v.fenv; v.flt.frequency.setValueAtTime(c0, t); v.flt.frequency.setTargetAtTime(c0 * k, t, Math.min(tm, dur) / 3 + 0.01); }
    if (v.fm) { v.fm.gain.setValueAtTime(0.55, t); v.fm.gain.setTargetAtTime(0, t, 0.08); }
  }
  // batería: voces de ruido y tono persistentes; solo se automatiza el volumen y la altura
  // k bombo · s caja · h/o hi-hat cerrado/abierto · c palmas · r platillo · m tom · z shaker
  // i aro · w subida de ruido (un compás) · g güiro · x golpe · b cencerro · t taiko. En mayúscula, más fuerte.
  function drumVoices(g) {
    if (g.dv) return g.dv;
    const c = g.ctx, dv = {};
    const nv = (type, f, q) => {
      const n = c.createBufferSource(); n.buffer = g.noise; n.loop = true;
      const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
      const gg = c.createGain(); gg.gain.value = 0;
      n.connect(fl); fl.connect(gg); gg.connect(g.drums); n.start();
      return { fl, g: gg.gain };
    };
    const tv = (w) => { const o = c.createOscillator(); o.type = w; const gg = c.createGain(); gg.gain.value = 0; o.connect(gg); gg.connect(g.drums); o.start(); return { f: o.frequency, g: gg.gain }; };
    dv.hat = nv('highpass', 8200, 0.7); dv.sn = nv('bandpass', 1900, 0.9); dv.shk = nv('bandpass', 6400, 1.5);
    dv.clap = nv('bandpass', 1500, 1.2); dv.click = nv('highpass', 2200, 0.7); dv.cr = nv('highpass', 4600, 0.7);
    dv.low = nv('bandpass', 400, 0.7); dv.rim = nv('bandpass', 3200, 3); dv.gui = nv('bandpass', 3000, 3);
    dv.kick = tv('sine'); dv.body = tv('triangle'); dv.tom = tv('sine'); dv.bell1 = tv('square'); dv.bell2 = tv('square');
    return (g.dv = dv);
  }
  function drum(g, ch0, t, s, dt) {
    const ch = ch0.toLowerCase(), A = ch0 !== ch ? 1.35 : 1, dv = drumVoices(g);
    const hit = (p, v, d) => { p.setValueAtTime(v * A, t); p.setTargetAtTime(0, t + 0.002, d / 4); };
    if (ch === 'k') {
      dv.kick.f.setValueAtTime(155, t); dv.kick.f.setTargetAtTime(44, t, 0.035);
      hit(dv.kick.g, 0.7, 0.24); hit(dv.click.g, 0.32, 0.014);
      if (s.pump) { const dk = typeof s.pump === 'number' ? s.pump : 0.42; g.duck.gain.setValueAtTime(1 - dk, t); g.duck.gain.linearRampToValueAtTime(1, t + 0.22); }
    } else if (ch === 's') { hit(dv.sn.g, 0.42, 0.17); dv.body.f.setValueAtTime(210, t); dv.body.f.setTargetAtTime(160, t, 0.03); hit(dv.body.g, 0.25, 0.09); }
    else if (ch === 'h') hit(dv.hat.g, 0.17, 0.035);
    else if (ch === 'o') hit(dv.hat.g, 0.16, 0.22);
    else if (ch === 'r') hit(dv.cr.g, 0.15, 1.4);
    else if (ch === 'm') { dv.tom.f.setValueAtTime(210, t); dv.tom.f.setTargetAtTime(105, t, 0.09); hit(dv.tom.g, 0.5, 0.28); }
    else if (ch === 'z') hit(dv.shk.g, 0.15, 0.045);
    else if (ch === 'i') hit(dv.rim.g, 0.3, 0.04);
    else if (ch === 'x') hit(dv.low.g, 0.35, 0.2);
    else if (ch === 't') { dv.tom.f.setValueAtTime(120, t); dv.tom.f.setTargetAtTime(48, t, 0.1); hit(dv.tom.g, 0.9, 0.38); hit(dv.low.g, 0.35, 0.2); }
    else if (ch === 'b') { dv.bell1.f.setValueAtTime(540, t); dv.bell2.f.setValueAtTime(800, t); hit(dv.bell1.g, 0.06, 0.12); hit(dv.bell2.g, 0.06, 0.12); }
    else if (ch === 'c') {
      const p = dv.clap.g;
      for (let k = 0; k < 3; k++) { p.setValueAtTime(0.5 * A, t + k * 0.012); p.setTargetAtTime(0.05, t + k * 0.012, 0.003); }
      p.setValueAtTime(0.45 * A, t + 0.036); p.setTargetAtTime(0, t + 0.036, 0.03);
    } else if (ch === 'g') {
      const p = dv.gui.g;
      dv.gui.fl.frequency.setValueAtTime(2600, t); dv.gui.fl.frequency.linearRampToValueAtTime(4200, t + 0.16);
      for (let k = 0; k < 8; k++) { p.setValueAtTime(0.32 * A, t + k * 0.02); p.setTargetAtTime(0.05, t + k * 0.02, 0.005); }
      p.setTargetAtTime(0, t + 0.16, 0.01);
    } else if (ch === 'w') {
      const c = g.ctx, d = dt * 16, n = c.createBufferSource(); n.buffer = g.noise;
      const fl = c.createBiquadFilter(); fl.type = 'bandpass'; fl.Q.value = 3; fl.frequency.setValueAtTime(300, t); fl.frequency.exponentialRampToValueAtTime(7000, t + d);
      const gg = c.createGain(); gg.gain.setValueAtTime(0.0001, t); gg.gain.exponentialRampToValueAtTime(0.16 * A, t + d); gg.gain.exponentialRampToValueAtTime(0.001, t + d + 0.06);
      n.connect(fl); fl.connect(gg); gg.connect(g.drums); n.start(t); n.stop(t + d + 0.1);
    }
  }
  function schedStep(g, s, vs, st, t0, dt) {
    const t = t0 + (st % 2 ? (s.swing || 0) * dt : 0);
    for (let i = 0; i < s.ch.length; i++) { const n = s.ch[i].notes[st % s.ch[i].notes.length]; if (n) noteOn(vs[i], n, t, dt, s); }
    if (s.drums) for (const lay of Array.isArray(s.drums) ? s.drums : [s.drums]) { const d = lay[st % lay.length]; if (d && d !== '.') drum(g, d, t, s, dt); }
  }
  let voices = null;
  function sched() {
    if (!song || !ctx || ctx.state !== 'running') return;
    const dt = 60 / song.bpm / 4;
    while (nextT < ctx.currentTime + 0.14) { schedStep(G, song, voices, step, nextT, dt); nextT += dt; step++; }
  }
  api.play = (s) => {
    if (!ctx) { pending = s; return; }
    if (song === s) return;
    api.stop();
    song = s; step = 0; nextT = ctx.currentTime + 0.08;
    voices = s.ch.map((ch) => makeVoice(G, ch, s));
    G.post.gain.setTargetAtTime(s.gain || 1, ctx.currentTime, 0.02);
    G.echoDel.delayTime.setValueAtTime((s.echo || 0.75) * 60 / s.bpm, ctx.currentTime);
    G.duck.gain.cancelScheduledValues(ctx.currentTime); G.duck.gain.setValueAtTime(1, ctx.currentTime);
    timer = setInterval(sched, 25);
  };
  api.stop = () => {
    clearInterval(timer); timer = 0; song = null; pending = null;
    if (voices && ctx) {
      const t = ctx.currentTime;
      for (const v of voices) { v.amp.gain.cancelScheduledValues(t); v.amp.gain.setTargetAtTime(0, t, 0.02); }
      stopVoices(voices, t + 0.12);
    }
    voices = null;
  };
  // para pruebas: renderiza una canción sin reproducirla (devuelve un AudioBuffer)
  api.render = (s, seconds = 20, sr = 22050) => {
    const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const c = new OAC(2, Math.ceil(sr * seconds), sr), g = makeGraph(c, c.destination);
    g.echoDel.delayTime.value = (s.echo || 0.75) * 60 / s.bpm;
    g.post.gain.value = s.gain || 1;
    const vs = s.ch.map((ch) => makeVoice(g, ch, s)), dt = 60 / s.bpm / 4;
    for (let st = 0, t = 0.05; t < seconds; st++, t += dt) schedStep(g, s, vs, st, t, dt);
    return c.startRendering();
  };
  // largo de una canción antes de repetirse (segundos)
  api.length = (s) => Math.max(...s.ch.map((c) => c.notes.length), ...(Array.isArray(s.drums) ? s.drums : [s.drums || '']).map((d) => d.length)) * 15 / s.bpm;
  return api;
})();

// canciones originales (no son las de los juegos clásicos)
const SONGS = {
  contra: {
    bpm: 146,
    ch: [
      { type: 'triangle', vol: 0.55, gate: 0.75, notes: Snd.seq(
        'E2 E2 E3 E2 E2 E3 E2 D3 E2 E2 E3 E2 G2 A2 B2 D3  C2 C2 C3 C2 C2 C3 C2 B2 C2 C2 C3 C2 E2 F#2 G2 B2  D2 D2 D3 D2 D2 D3 D2 C3 D2 D2 D3 D2 F#2 G2 A2 C3  B1 B1 B2 B1 B1 B2 B1 A2 B1 B1 B2 B1 D#2 F#2 A2 B2') },
      { type: 'p25', vol: 0.13, gate: 0.9, notes: Snd.seq(
        'E5 - - . B4 . E5 . G5 - F#5 - E5 . D5 .  C5 - - . G4 . C5 . E5 - D5 - C5 . B4 .  D5 - - . A4 . D5 . F#5 - A5 - G5 . F#5 .  F#5 - - - D#5 - B4 - F#5 . G5 . A5 . B5 .') },
      { type: 'p12', vol: 0.05, gate: 0.6, notes: Snd.seq(
        'B4 . G4 . B4 . G4 . B4 . G4 . B4 . G4 .  G4 . E4 . G4 . E4 . G4 . E4 . G4 . E4 .  A4 . F#4 . A4 . F#4 . A4 . F#4 . A4 . F#4 .  B4 . F#4 . D#4 . F#4 . B4 . F#4 . D#4 . F#4 .') },
    ],
    drums: 'k.hks.h.k.hks.hhk.hks.h.kkhks.hs',
  },
};
// ---------- las canciones del Gas Rally están en music.js
const B = Snd.bars;
// ---------- canciones largas por secciones (intro, A, B, puente…), para que no se repitan a cada rato.
// parts: { A: { bars: 8, bajo: [compases…], drums: [capas…], fill: [capas del último compás] } }
// Cada patrón se repite hasta llenar la sección; si un canal no tiene patrón, calla.
function mkSong(d) {
  const steps = d.steps || 16, names = Object.keys(d.ch), notes = {}, lays = [];
  names.forEach((k) => (notes[k] = []));
  let total = 0;
  for (const sec of d.form) {
    const P = d.parts[sec], bars = P.bars, n = bars * steps;
    if (!P) throw new Error('falta la sección ' + sec);
    for (const k of names) {
      const seq = P[k] ? Snd.bars(steps, P[k]) : [];
      for (let i = 0; i < n; i++) notes[k].push(seq.length ? seq[i % seq.length] : null);
    }
    const L = Math.max((P.drums || []).length, (P.fill || []).length);
    for (let li = 0; li < L; li++) {
      let str = '';
      for (let b = 0; b < bars; b++) {
        const src = P.fill && b === bars - 1 ? P.fill[li] || '' : (P.drums || [])[li] || '';
        const off = src.length ? (b * steps) % src.length : 0;
        str += (src.slice(off, off + steps) || '').padEnd(steps, '.');
      }
      lays[li] = (lays[li] || '').padEnd(total, '.') + str;
    }
    total += n;
    for (let li = 0; li < lays.length; li++) lays[li] = lays[li].padEnd(total, '.');
  }
  return { bpm: d.bpm, tr: d.tr, swing: d.swing, pump: d.pump, echo: d.echo, gain: d.gain, ch: names.map((k) => ({ ...d.ch[k], notes: notes[k] })), drums: lays };
}
// nota sostenida o silencio de n pasos (para escribir compases más corto)
const hold = (n, len) => [n, ...Array(len - 1).fill('-')].join(' ');
const rest = (len) => Array(len).fill('.').join(' ');
SONGS.boss = { ...SONGS.contra, bpm: 168, tr: 1, drums: 'k.hsk.hsk.hsk.hskkhsk.hsk.hskhss' };

