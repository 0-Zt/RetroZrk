// =====================================================================
//  FOLEY · efectos de sonido propios, calculados muestra a muestra
//  Nada de "pitidos de chip": cada efecto se arma con capas físicas
//  (golpe + cuerpo + cola): metal resonante, burbujas, gomas que chillan,
//  bocinas de verdad, válvulas de gas, multitud, campanas de cruce…
//  Cada uno se calcula una vez en 3 variantes y al tocarlo cambia un poco
//  el tono, así dos bidones seguidos nunca suenan idénticos.
// =====================================================================
const Foley = (() => {
  const TAU = Math.PI * 2;
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  // ---------- piezas de DSP
  function prng(seed) {
    let s = seed >>> 0 || 1;
    return () => { s = (s + 0x6d2b79f5) >>> 0; let t = Math.imul(s ^ (s >>> 15), s | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  // filtro de estado variable (Simper/TPT): estable aunque la frecuencia cambie en cada muestra
  function svf() {
    let a = 0, b = 0;
    return (x, fc, q, sr, mode) => {
      const g = Math.tan(Math.PI * Math.min(Math.max(fc, 10), sr * 0.45) / sr), k = 1 / q;
      const a1 = 1 / (1 + g * (g + k)), a2 = g * a1, a3 = g * a2;
      const v3 = x - b, v1 = a1 * a + a2 * v3, v2 = b + a2 * a + a3 * v3;
      a = 2 * v1 - a; b = 2 * v2 - b;
      return mode === 0 ? v2 : mode === 1 ? v1 : x - k * v1 - v2;
    };
  }
  const LP = 0, BP = 1, HP = 2;
  // ruido rosa (Kellet) y marrón
  function pinkGen(r) { let b0 = 0, b1 = 0, b2 = 0; return () => { const w = r() * 2 - 1; b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913; return (b0 + b1 + b2 + w * 0.1848) * 0.2; }; }
  function brownGen(r) { let l = 0; return () => { l = (l + 0.02 * (r() * 2 - 1)) / 1.02; return l * 3.5; }; }
  const env = (t, a, d) => (t < 0 ? 0 : t < a ? t / a : Math.exp(-(t - a) / d));
  const sat = (x, k) => Math.tanh(x * k) / Math.tanh(k);

  // contexto de dibujo de un efecto
  function ctx(sr, dur, seed) {
    const n = Math.ceil(sr * dur), out = new Float32Array(n), r = prng(seed);
    const c = { sr, n, out, r, dur, rr: (a, b) => a + r() * (b - a) };
    // suma una capa: fn(t, i) devuelve la muestra; empieza en t0 y dura d
    c.layer = (t0, d, fn, gain = 1) => {
      const i0 = Math.max(0, Math.floor(t0 * sr)), i1 = Math.min(n, Math.ceil((t0 + d) * sr));
      for (let i = i0; i < i1; i++) out[i] += fn((i - i0) / sr, i - i0) * gain;
    };
    // golpe de metal: parciales inarmónicos que se apagan cada uno a su ritmo
    c.modal = (t0, f, ratios, amps, decs, gain = 1, att = 0.0008) => {
      const ph = ratios.map(() => r() * TAU), d = Math.max(...decs) * 7;
      c.layer(t0, d, (t) => { let s = 0; for (let k = 0; k < ratios.length; k++) s += amps[k] * Math.sin(ph[k] + TAU * f * ratios[k] * t) * Math.exp(-t / decs[k]); return s * Math.min(1, t / att); }, gain);
    };
    // campanita FM (portadora + moduladora inarmónica)
    c.fm = (t0, f, ratio, index, dec, gain = 1, idec = dec * 0.4) => {
      let p = 0, q = 0;
      c.layer(t0, dec * 6, (t) => { q += TAU * f * ratio / sr; p += TAU * f / sr; return Math.sin(p + index * Math.exp(-t / idec) * Math.sin(q)) * env(t, 0.0015, dec); }, gain);
    };
    // chasquido seco (pulso de ruido filtrado)
    c.click = (t0, fc, gain = 1, d = 0.0012, q = 2) => { const f = svf(); c.layer(t0, d * 10, (t) => f((r() * 2 - 1) * Math.exp(-t / d), fc, q, sr, BP), gain); };
    // golpe sordo con caída de tono
    c.thump = (t0, f0, f1, d, gain = 1, drive = 1.5) => { let p = 0; c.layer(t0, d * 6, (t) => { p += TAU * (f1 + (f0 - f1) * Math.exp(-t / (d * 0.5))) / sr; return sat(Math.sin(p) * env(t, 0.002, d), drive); }, gain); };
    // burbuja (Minnaert): el tono sube mientras se apaga
    c.bubble = (t0, f, d = 0.03, gain = 1) => { let p = 0; c.layer(t0, d * 6, (t) => { p += TAU * f * (1 + 0.9 * (t / (d * 3))) / sr; return Math.sin(p) * env(t, 0.003, d); }, gain); };
    // ruido filtrado con barrido y envolvente de ataque/caída
    c.hiss = (t0, d, gen, mode, f0, f1, q, att, dec, gain = 1) => {
      const f = svf(), g = gen === 'pink' ? pinkGen(r) : gen === 'brown' ? brownGen(r) : () => r() * 2 - 1;
      c.layer(t0, d, (t) => { const fc = f0 * Math.pow(f1 / f0, Math.min(1, t / d)); return f(g(), fc, q, sr, mode) * env(t, att, dec); }, gain);
    };
    // nota de "metal de bronce" (diente de sierra con filtro que se abre) para fanfarrias
    c.brass = (t0, f, d, gain = 1) => {
      const fl = svf(); let p = 0, p2 = 0;
      c.layer(t0, d + 0.25, (t) => {
        p += f / sr; p2 += f * 1.006 / sr;
        const s = (2 * (p % 1) - 1) + (2 * (p2 % 1) - 1) * 0.7;
        const e = t < d ? Math.min(1, t / 0.02) : Math.exp(-(t - d) / 0.06);
        return fl(s, 300 + 2600 * Math.min(1, t / 0.06) * (0.65 + 0.35 * e), 1.1, sr, LP) * e;
      }, gain);
    };
    // goma que chilla: tono inestable + ruido estrecho que lo sigue
    c.squeal = (t0, d, f0, f1, gain = 1) => {
      const f = svf(); let p = 0, j = 0;
      c.layer(t0, d, (t) => {
        j += (c.r() - 0.5) * 0.04; j *= 0.995;
        const fr = (f0 + (f1 - f0) * t / d) * (1 + 0.035 * Math.sin(TAU * 17 * t) + j * 0.3);
        p += TAU * fr / sr;
        const s = Math.sin(p) * 0.6 + f((c.r() * 2 - 1), fr, 9, sr, BP) * 2.2;
        return sat(s, 1.6) * Math.min(1, t / 0.015) * Math.min(1, (d - t) / 0.08) * (0.8 + 0.2 * Math.sin(TAU * 31 * t + c.r()));
      }, gain);
    };
    // bocina de auto: dos tonos desafinados, saturados y pasados por la "trompeta"
    c.horn = (t0, d, fa, fb, gain = 1) => {
      const f1 = svf(), f2 = svf(); let p = 0, q = 0;
      c.layer(t0, d + 0.06, (t) => {
        p += fa * (1 + 0.004 * Math.sin(TAU * 6 * t)) / sr; q += fb / sr;
        const s = (2 * (p % 1) - 1) + (2 * (q % 1) - 1);
        const e = t < d ? Math.min(1, t / 0.012) : Math.exp(-(t - d) / 0.02);
        return f2(f1(sat(s, 2.4), 950, 0.8, sr, BP), 3200, 0.7, sr, LP) * e;
      }, gain);
    };
    return c;
  }
  // normaliza al pico pedido y suaviza el final
  function finish(c, peak) {
    const o = c.out; let m = 0;
    for (let i = 0; i < o.length; i++) { const a = Math.abs(o[i]); if (a > m) m = a; }
    const k = m > 0 ? peak / m : 0, fade = Math.min(o.length, Math.floor(c.sr * 0.01));
    for (let i = 0; i < o.length; i++) o[i] *= k;
    for (let i = 0; i < fade; i++) o[o.length - 1 - i] *= i / fade;
    return o;
  }

  // ---------- los efectos. [duración, pico, función, variación de tono al tocar]
  // UI = consola (sirve a todos los juegos); el resto es del Gas Rally
  const D = {};
  const def = (name, dur, peak, fn, jit = 1, ui = false) => { const bank = ui === true ? 'ui' : ui || 'rally'; D[bank === 'contra' ? 'contra:' + name : name] = { dur, peak, fn, jit, bank }; };

  // --- consola y menús: táctiles, como perillas y teclas de verdad
  def('move', 0.06, 0.32, (c) => { c.click(0, c.rr(3000, 3800), 1, 0.0014, 3); c.fm(0.001, c.rr(1900, 2100), 1.41, 0.6, 0.01, 0.35); }, 1, true);
  def('select', 0.3, 0.5, (c) => {
    c.click(0, 2600, 0.9, 0.0012); c.thump(0.004, 210, 130, 0.022, 0.8); c.click(0.019, 3400, 0.5, 0.001);
    c.fm(0.016, 1568, 2, 1.4, 0.06, 0.32); c.fm(0.05, 2093, 2, 1.2, 0.07, 0.22);
  }, 0.6, true);
  def('back', 0.24, 0.45, (c) => { c.click(0, 3000, 0.6, 0.001); c.thump(0.01, 160, 110, 0.02, 0.6); c.fm(0.012, 1319, 2, 1.2, 0.05, 0.28); c.fm(0.055, 988, 2, 1, 0.06, 0.24); }, 0.6, true);
  def('start', 0.75, 0.6, (c) => {
    // cartucho que entra: ka-CHUNK y un acorde que sube
    c.click(0, 1700, 1, 0.002); c.thump(0, 150, 100, 0.02, 0.5);
    c.click(0.085, 1200, 1.2, 0.003); c.thump(0.085, 110, 55, 0.05, 1.1, 2.2);
    c.modal(0.085, 430, [1, 2.32, 4.18, 6.3], [1, 0.6, 0.35, 0.2], [0.09, 0.06, 0.04, 0.03], 0.35);
    [76, 79, 83, 88].forEach((m, i) => c.fm(0.17 + i * 0.055, mtof(m), 3.5, 1.6, 0.16, 0.24));
  }, 0.2, true);
  def('pause', 0.22, 0.42, (c) => {
    // radio de boxes: chasquido de squelch con ruido "comprimido" y un bip
    const f = svf(); let hold = 0, k = 0;
    c.layer(0, 0.07, (t) => { if (k++ % 5 === 0) hold = Math.round(f(c.r() * 2 - 1, 1500, 1.4, c.sr, BP) * 6) / 6; return hold * env(t, 0.002, 0.025); }, 0.9);
    c.layer(0.075, 0.12, (t) => (Math.sin(TAU * 1000 * t) + 0.22 * Math.sin(TAU * 3000 * t)) * (t < 0.08 ? Math.min(1, t / 0.003) : Math.exp(-(t - 0.08) / 0.01)), 0.5);
  }, 0.3, true);
  def('tick', 0.05, 0.3, (c) => {
    // contador mecánico de surtidor
    const f = svf(), g = svf();
    c.layer(0, 0.05, (t, i) => { const x = i < 3 ? 1 : 0; return f(x, 2600, 22, c.sr, BP) + 0.5 * g(x, 5300, 18, c.sr, BP); }, 1);
  }, 0.8, true);
  def('deny', 0.32, 0.5, (c) => { [0, 0.12].forEach((t0, i) => { c.thump(t0, 175 - i * 30, 120 - i * 20, 0.045, 1, 3); c.hiss(t0, 0.08, 'brown', LP, 600, 200, 0.7, 0.002, 0.03, 0.6); }); }, 0.3, true);
  def('buy', 1.0, 0.55, (c) => {
    // caja registradora: cajón, campanilla y monedas
    c.hiss(0, 0.16, 'brown', BP, 300, 700, 1.2, 0.01, 0.08, 1.4);
    c.layer(0, 0.14, (t) => Math.sin(TAU * 55 * t) * (c.r() * 2 - 1) * env(t, 0.005, 0.05), 0.25);
    c.fm(0.1, 2093, 3.5, 2.2, 0.35, 0.55);
    for (let i = 0; i < 6; i++) c.fm(c.rr(0.13, 0.38), c.rr(3200, 6200), 2.76, 1.5, c.rr(0.025, 0.05), 0.16);
  }, 0.4, true);
  def('coin', 0.32, 0.42, (c) => { c.fm(0, 2350, 2.76, 1.4, 0.07, 0.8); c.fm(0.055, 3130, 2.76, 1.2, 0.1, 0.7); });
  def('ach', 1.1, 0.5, (c) => {
    // marimba: barra de madera con parciales 1 · 3,93 · 9,2
    [79, 84, 88, 91].forEach((m, i) => c.modal(i * 0.085, mtof(m), [1, 3.93, 9.2], [1, 0.32, 0.08], [0.32, 0.07, 0.025], 0.6, 0.002));
    c.hiss(0.25, 0.6, 'white', HP, 7000, 9000, 0.7, 0.05, 0.18, 0.06);
  }, 0.2, true);

  // --- Gas Rally: bidones, gas, choques y la calle
  const can = (c, t0, f) => {
    c.click(t0, 2200, 0.8, 0.0015);
    c.modal(t0, f, [1, 1.73, 2.41, 3.12, 4.45], [1, 0.62, 0.48, 0.32, 0.18], [0.11, 0.085, 0.06, 0.045, 0.03], 0.9);
    c.thump(t0, 180, 120, 0.02, 0.35);
  };
  def('fuel', 0.42, 0.55, (c) => {
    const f = c.rr(250, 275);
    can(c, 0, f); c.bubble(0.045, c.rr(480, 560), 0.025, 0.45); c.bubble(0.1, c.rr(640, 720), 0.02, 0.35);
    c.fm(0.02, f * 8, 1, 0.4, 0.06, 0.12);
  });
  def('fuelS', 0.8, 0.55, (c) => {
    can(c, 0, 300);
    [84, 88, 91, 96].forEach((m, i) => c.fm(0.05 + i * 0.045, mtof(m), 3.5, 1.4, 0.14, 0.32));
    c.hiss(0.08, 0.6, 'white', HP, 6000, 9000, 0.8, 0.03, 0.2, 0.07);
  }, 0.3);
  def('lucky', 1.1, 0.55, (c) => {
    can(c, 0, 230);
    // rodillo de tragamonedas que frena y premio
    let t = 0.06; for (let i = 0; i < 11; i++) { c.click(t, 2400 + i * 60, 0.55, 0.0012, 6); t += 0.028 + i * 0.006; }
    [72, 76, 79].forEach((m) => c.fm(t + 0.02, mtof(m + 12), 3.5, 1.8, 0.3, 0.35));
  }, 0.2);
  def('smoke', 0.7, 0.6, (c) => {
    // válvula que se abre, chorro de gas a presión y el "fump"
    c.click(0, 4200, 1, 0.0018, 3);
    c.hiss(0.006, 0.62, 'pink', BP, 5200, 2200, 0.9, 0.012, 0.2, 1.6);
    c.hiss(0.006, 0.4, 'white', HP, 7000, 4000, 0.7, 0.005, 0.07, 0.25);
    c.thump(0.01, 95, 48, 0.06, 0.7, 2);
  }, 0.6);
  def('stun', 0.55, 0.36, (c) => {
    // la patrulla queda mareada: frenazo corto y "pajaritos"
    c.squeal(0, 0.16, 1250, 980, 0.5);
    [0.17, 0.27, 0.39].forEach((t0, i) => { let p = 0; c.layer(t0, 0.09, (t) => { p += TAU * (2500 + 1300 * Math.sin(Math.PI * t / 0.07) + i * 180) / c.sr; return Math.sin(p) * env(t, 0.006, 0.025); }, 0.35); });
  });
  def('spin', 0.6, 0.45, (c) => { c.squeal(0, 0.58, c.rr(1150, 1250), 640, 1); }, 0.6);
  def('skid', 0.26, 0.16, (c) => {
    // derrape sobre mojado: chirrido corto y siseo de agua
    c.squeal(0, 0.2, c.rr(1300, 1450), 1100, 0.6);
    c.hiss(0, 0.24, 'pink', BP, 3200, 2000, 1.2, 0.01, 0.07, 1.2);
  }, 0.8);
  def('horn', 0.4, 0.45, (c) => {
    const fa = c.rr(405, 425), fb = fa * 1.26;
    if (c.r() < 0.5) c.horn(0, 0.3, fa, fb); else { c.horn(0, 0.11, fa, fb); c.horn(0.17, 0.16, fa, fb); }
  }, 0.4);
  def('siren', 1.1, 0.4, (c) => {
    let p = 0; const fl = svf();
    c.layer(0, 1.05, (t) => { const f = t < 0.65 ? 620 + 700 * t / 0.65 : 1320 - 420 * (t - 0.65) / 0.4; p += f / c.sr; const s = Math.sin(TAU * p) + 0.4 * Math.sin(TAU * 2 * p) + 0.2 * Math.sin(TAU * 3 * p); return fl(s, 2600, 0.8, c.sr, LP) * Math.min(1, t / 0.08) * Math.min(1, (1.05 - t) / 0.15); });
  }, 0.2);
  def('shield', 0.6, 0.45, (c) => {
    // campo de fuerza que se arma: barrido FM con coro
    [1, 1.006].forEach((dt) => { let p = 0, q = 0; c.layer(0, 0.55, (t) => { const f = (200 + 520 * Math.min(1, t / 0.32)) * dt; q += TAU * f * 1.5 / c.sr; p += TAU * f / c.sr; return Math.sin(p + 2.5 * Math.sin(q)) * Math.min(1, t / 0.04) * Math.exp(-Math.max(0, t - 0.3) / 0.08); }, 0.5); });
    c.hiss(0.2, 0.3, 'white', HP, 6000, 9000, 1, 0.02, 0.06, 0.1);
  }, 0.3);
  def('shieldOff', 0.55, 0.5, (c) => {
    // se trizó: crujido de vidrio y esquirlas
    c.hiss(0, 0.06, 'white', HP, 3500, 2500, 0.8, 0.001, 0.012, 1);
    for (let i = 0; i < 12; i++) c.fm(c.rr(0, 0.28), c.rr(3800, 9000), c.rr(1.3, 2.9), 1.2, c.rr(0.01, 0.035), c.rr(0.15, 0.35));
    let p = 0; c.layer(0.02, 0.4, (t) => { p += TAU * (900 * Math.exp(-t / 0.12) + 180) / c.sr; return Math.sin(p + 1.5 * Math.sin(p * 1.41)) * env(t, 0.005, 0.12); }, 0.35);
  }, 0.4);
  def('nitro', 1.05, 0.6, (c) => {
    c.hiss(0, 0.16, 'white', HP, 2500, 1800, 0.7, 0.002, 0.05, 0.6);                       // psshh de la válvula
    c.layer(0.04, 0.2, (t) => { const f = (Math.sin(TAU * 26 * t) > 0 ? 1 : 0.15); return (c.r() * 2 - 1) * f * env(t, 0.005, 0.07); }, 0.25); // tu-tu-tu
    c.hiss(0.05, 0.95, 'pink', BP, 380, 3200, 1.2, 0.2, 0.3, 1.5);                          // rugido que sube
    const fl = svf(); let p = 0;
    c.layer(0.05, 0.9, (t) => { p += (85 + 150 * Math.min(1, t / 0.6)) / c.sr; return fl(2 * (p % 1) - 1, 900, 1.5, c.sr, LP) * env(t, 0.08, 0.35); }, 0.55);
  }, 0.4);
  def('item', 0.85, 0.45, (c) => {
    // ruleta de ítem: trinquete que frena y un "tin" al caer
    let t = 0; for (let i = 0; i < 13; i++) { c.click(t, 1900 + (i % 2) * 500, 0.7, 0.001, 5); t += 0.032 + i * 0.0045; }
    c.fm(t, 1760, 3.5, 1.6, 0.18, 0.5);
  }, 0.3);
  def('powerup', 0.5, 0.45, (c) => { c.fm(0, mtof(84), 3.5, 1.8, 0.12, 0.6); c.fm(0.08, mtof(91), 3.5, 1.6, 0.18, 0.6); c.click(0, 3000, 0.4); }, 0.3);
  def('oil', 0.45, 0.55, (c) => {
    // mancha de aceite: splash viscoso y burbujas que revientan
    c.hiss(0, 0.2, 'brown', LP, 1100, 180, 1.4, 0.003, 0.07, 1.6);
    c.bubble(0.03, 210, 0.04, 0.5); c.bubble(0.09, 160, 0.05, 0.45); c.bubble(0.16, 260, 0.03, 0.3);
    c.click(0.18, 900, 0.3, 0.002);
  }, 0.6);
  def('thud', 0.35, 0.6, (c) => { c.thump(0, 85, 42, 0.07, 1, 2.5); c.hiss(0, 0.12, 'brown', LP, 900, 150, 0.7, 0.002, 0.03, 1); c.modal(0.004, 180, [1, 2.4, 3.9], [0.4, 0.25, 0.1], [0.05, 0.03, 0.02], 0.4); }, 0.6);
  def('puff', 0.32, 0.4, (c) => { c.hiss(0, 0.3, 'pink', LP, 2200, 500, 0.7, 0.012, 0.07, 1.4); });
  def('pop', 0.8, 0.5, (c) => {
    c.click(0, 1500, 1.5, 0.003, 1); c.thump(0, 140, 60, 0.02, 0.6);
    for (let i = 0; i < 26; i++) { const t = 0.06 + Math.pow(c.r(), 1.6) * 0.65; c.click(t, c.rr(3000, 7000), (1 - t / 0.75) * c.rr(0.2, 0.5), 0.0008, 4); }
  }, 0.5);
  def('whoosh', 0.5, 0.45, (c) => { const f = svf(); const g = pinkGen(c.r); c.layer(0, 0.48, (t) => { const u = t / 0.48; return f(g(), 500 + 2200 * Math.sin(Math.PI * Math.min(1, u * 1.2)), 1.6, c.sr, BP) * Math.sin(Math.PI * u) ** 2; }, 1.6); }, 0.5);
  def('whistle', 0.75, 0.42, (c) => {
    // silbato de policía (de bolita): tono alto con trino irregular
    [[0, 0.17], [0.24, 0.38]].forEach(([t0, d]) => {
      let p = 0;
      c.layer(t0, d + 0.03, (t) => {
        const tr = 0.55 + 0.45 * Math.sin(TAU * 27 * t + Math.sin(TAU * 3 * t));
        p += TAU * (2850 + 90 * Math.sin(TAU * 27 * t)) / c.sr;
        const e = t < d ? Math.min(1, t / 0.01) : Math.exp(-(t - d) / 0.01);
        return (Math.sin(p) + 0.08 * Math.sin(2 * p)) * tr * e;
      }, 0.8);
      c.hiss(t0, d, 'white', HP, 5000, 5000, 0.7, 0.01, d, 0.08);
    });
  }, 0.3);
  def('spot', 0.55, 0.42, (c) => {
    // te encontró el foco: aviso de radar con eco
    [0, 0.13, 0.26].forEach((t0, i) => c.layer(t0, 0.12, (t) => (Math.sin(TAU * 1480 * t) + 0.3 * Math.sin(TAU * 2960 * t)) * env(t, 0.003, 0.035), 1 - i * 0.35));
    c.click(0, 1500, 0.5, 0.004);
  }, 0.2);
  def('chop', 0.12, 0.5, (c) => { c.hiss(0, 0.1, 'brown', LP, 420, 140, 0.8, 0.004, 0.025, 1.8); c.thump(0, 70, 45, 0.02, 0.5); }, 0.6);
  def('fly', 1.7, 0.5, (c) => {
    c.hiss(0, 1.65, 'pink', BP, 260, 1700, 0.9, 0.35, 0.55, 1.8);
    let p = 0; c.layer(0, 1.6, (t) => { p += TAU * (1100 + 1300 * Math.min(1, t / 1.2)) / c.sr; return Math.sin(p) * Math.min(1, t / 0.4) * Math.exp(-Math.max(0, t - 1) / 0.25); }, 0.08);
    c.hiss(0, 1.6, 'brown', LP, 140, 90, 0.7, 0.3, 0.6, 1.4);
  }, 0.2);
  const rumble = (c, d, top, gain) => {
    const f = svf(), g = brownGen(c.r); let am = 0;
    c.layer(0, d, (t) => { am += (c.r() - 0.5) * 0.25; am *= 0.997; return f(g(), top, 0.7, c.sr, LP) * (0.7 + 0.6 * Math.abs(am)) * Math.min(1, t / 0.08) * Math.min(1, (d - t) / 0.5); }, gain);
    for (let i = 0; i < 6; i++) c.thump(c.rr(0, d - 0.4), c.rr(60, 90), 35, 0.06, 0.4, 2);
  };
  def('quake', 1.8, 0.65, (c) => { rumble(c, 1.75, 140, 2.5); c.hiss(0.1, 1.4, 'pink', BP, 700, 300, 1, 0.3, 0.5, 0.25); }, 0.3);
  def('rumble', 1.6, 0.65, (c) => { rumble(c, 1.55, 220, 2.2); c.hiss(0, 1.5, 'pink', LP, 900, 300, 0.7, 0.4, 0.5, 0.8); }, 0.3);
  def('leap', 0.45, 0.5, (c) => {
    const fl = svf(); let p = 0;
    c.layer(0, 0.4, (t) => { p += (90 + 160 * Math.min(1, t / 0.25)) / c.sr; return fl(sat(2 * (p % 1) - 1, 2), 1200, 1.2, c.sr, LP) * env(t, 0.01, 0.15); }, 0.7);
    c.hiss(0.05, 0.38, 'pink', BP, 600, 2600, 1.2, 0.05, 0.15, 0.9);
  }, 0.4);
  def('land', 0.42, 0.6, (c) => {
    c.thump(0, 78, 40, 0.07, 1, 2.2); c.hiss(0, 0.12, 'brown', LP, 700, 160, 0.7, 0.002, 0.035, 1.2);
    let p = 0; c.layer(0.03, 0.18, (t) => { p += TAU * (1250 - 400 * t / 0.18) / c.sr; return Math.sin(p + 2 * Math.sin(p * 0.51)) * env(t, 0.01, 0.05); }, 0.18); // resorte que cruje
    c.modal(0.005, 240, [1, 2.6, 4.1], [0.5, 0.3, 0.15], [0.06, 0.04, 0.025], 0.4);
  }, 0.5);
  def('cheer', 1.7, 0.5, (c) => {
    // tribuna: dos formantes de "¡aaah!" sobre ruido rosa que respira, y aplausos
    const f1 = svf(), f2 = svf(), g = pinkGen(c.r); let am = 0;
    c.layer(0, 1.65, (t) => { am += (c.r() - 0.5) * 0.08; am *= 0.999; const x = g(); const e = Math.min(1, t / 0.18) * Math.min(1, (1.65 - t) / 0.7); return (f1(x, 780 + 60 * Math.sin(t * 3), 4, c.sr, BP) + 0.7 * f2(x, 1250, 5, c.sr, BP)) * e * (0.8 + Math.abs(am)); }, 2.4);
    for (let i = 0; i < 70; i++) { const t = c.rr(0.05, 1.3); c.click(t, c.rr(900, 2200), c.rr(0.15, 0.4), 0.003, 1.5); }
  }, 0.2);
  def('bell', 1.15, 0.45, (c) => {
    // campana del cruce del tren: golpes alternados
    for (let i = 0; i < 4; i++) c.modal(i * 0.26, i % 2 ? 1380 : 1460, [1, 2.0, 2.76, 5.4], [1, 0.5, 0.4, 0.15], [0.22, 0.15, 0.09, 0.04], 0.7, 0.001);
  }, 0.1);
  def('meow', 0.62, 0.45, (c) => {
    // gato con formantes: "mi-a-ou"
    const fa = svf(), fb = svf(); let p = 0;
    const seg = (t, a, b, m) => (t < 0.15 ? a + (b - a) * t / 0.15 : b + (m - b) * Math.min(1, (t - 0.15) / 0.4));
    c.layer(0, 0.58, (t) => {
      p += seg(t, 620, 790, 520) / c.sr;
      const x = (2 * (p % 1) - 1) * (1 + 0.1 * Math.sin(TAU * 7 * t));
      const e = Math.min(1, t / 0.04) * Math.min(1, (0.58 - t) / 0.12);
      return (fa(x, seg(t, 480, 950, 620), 6, c.sr, BP) + 0.6 * fb(x, seg(t, 2300, 1450, 900), 8, c.sr, BP)) * e;
    }, 1.5);
  }, 0.5);
  def('drill', 0.5, 0.45, (c) => {
    const fl = svf(); let p = 0;
    c.layer(0, 0.46, (t) => { p += (320 + 900 * Math.min(1, t / 0.2)) / c.sr; const s = (2 * (p % 1) - 1); return fl(s, 1800, 2, c.sr, BP) * env(t, 0.01, 0.25); }, 0.8);
    c.layer(0, 0.4, (t) => (c.r() * 2 - 1) * (0.5 + 0.5 * Math.sin(TAU * 42 * t)) * env(t, 0.02, 0.15), 0.2);
    c.modal(0.2, 900, [1, 2.7, 4.6], [0.6, 0.4, 0.2], [0.05, 0.03, 0.02], 0.35);
  }, 0.4);
  // largada: bips de cronómetro de rally (limpios, sin chip)
  const beep = (c, f, d) => c.layer(0, d + 0.03, (t) => (Math.sin(TAU * f * t) + 0.25 * Math.sin(TAU * 2 * f * t) + 0.08 * Math.sin(TAU * 3 * f * t)) * (t < d ? Math.min(1, t / 0.002) : Math.exp(-(t - d) / 0.008)));
  def('count', 0.17, 0.3, (c) => beep(c, 1046.5, 0.12), 0);
  def('go', 0.6, 0.38, (c) => { beep(c, 2093, 0.42); c.layer(0, 0.45, (t) => Math.sin(TAU * 2096 * t) * Math.min(1, t / 0.002) * Math.exp(-t / 0.3), 0.4); }, 0);
  def('clear', 1.4, 0.55, (c) => {
    // bandera a cuadros: dos golpes de bronce y platillo
    [60, 64, 67].forEach((m) => c.brass(0, mtof(m), 0.12, 0.3));
    [67, 72, 76, 79].forEach((m) => c.brass(0.2, mtof(m), 0.75, 0.3));
    c.thump(0.2, 120, 60, 0.05, 0.6);
    c.hiss(0.2, 1.1, 'white', HP, 5500, 4000, 0.6, 0.002, 0.35, 0.45);
  }, 0);
  def('oneup', 0.9, 0.5, (c) => { c.horn(0, 0.08, 415, 523, 0.7); c.horn(0.13, 0.12, 415, 523, 0.7); [84, 88, 91, 96].forEach((m, i) => c.fm(0.3 + i * 0.06, mtof(m), 3.5, 1.5, 0.14, 0.4)); }, 0);
  def('gameover', 2.3, 0.5, (c) => {
    // trombón con sordina: wah, wah, wah, waaah
    const notes = [[58, 0, 0.36], [57, 0.4, 0.36], [56, 0.8, 0.36], [55, 1.2, 1.0]];
    for (const [m, t0, d] of notes) {
      const f1 = svf(), f2 = svf(); let p = 0;
      c.layer(t0, d + 0.1, (t) => {
        const vib = t > 0.35 ? 1 + 0.012 * Math.sin(TAU * 5.5 * (t - 0.35)) : 1;
        p += mtof(m) * vib / c.sr;
        const s = 2 * (p % 1) - 1;
        const wah = 380 + 1300 * Math.sin(Math.PI * Math.min(1, t / Math.min(d, 0.36)));
        const e = t < d ? Math.min(1, t / 0.03) : Math.exp(-(t - d) / 0.04);
        return (f1(s, wah, 3, c.sr, BP) + 0.4 * f2(s, 2200, 2, c.sr, BP)) * e;
      }, 1);
    }
  }, 0);
  def('explode', 1.3, 0.65, (c) => {
    c.thump(0, 70, 30, 0.18, 1.3, 3);
    c.hiss(0, 1.2, 'brown', LP, 2400, 90, 0.7, 0.002, 0.3, 2.4);
    c.hiss(0, 0.3, 'white', HP, 3000, 1500, 0.7, 0.001, 0.05, 0.4);
    for (let i = 0; i < 9; i++) c.modal(c.rr(0.15, 0.9), c.rr(500, 1600), [1, 2.4, 3.7], [0.5, 0.3, 0.2], [0.04, 0.03, 0.02], 0.15);
  }, 0.4);
  def('crash', 1.3, 0.7, (c) => {
    // choque: golpe grave, lata que se abolla, vidrio y piezas que ruedan
    c.thump(0, 95, 38, 0.09, 1.4, 3);
    const f1 = svf(), f2 = svf(), f3 = svf();
    c.layer(0, 0.5, (t) => { const x = (c.r() * 2 - 1) * Math.sin(TAU * 37 * t + 1); return (f1(x, 430, 7, c.sr, BP) + f2(x, 1130, 8, c.sr, BP) + 0.7 * f3(x, 2380, 9, c.sr, BP)) * env(t, 0.002, 0.11); }, 2.2);
    c.hiss(0, 0.5, 'white', HP, 4000, 2500, 0.7, 0.001, 0.04, 0.5);
    for (let i = 0; i < 16; i++) c.fm(c.rr(0.03, 0.5), c.rr(3500, 8500), c.rr(1.3, 2.9), 1, c.rr(0.01, 0.03), c.rr(0.08, 0.22));
    for (let i = 0; i < 5; i++) c.modal(c.rr(0.35, 1.0), c.rr(700, 1300), [1, 2.3, 3.8], [0.5, 0.3, 0.15], [0.03, 0.02, 0.015], 0.14);
  }, 0.3);
  def('alarm', 1.0, 0.45, (c) => {
    // timbre eléctrico: martillo a 22 golpes por segundo sobre una campana
    for (let k = 0; k < 2; k++) for (let i = 0; i < 8; i++) c.modal(k * 0.45 + i / 22, 1900, [1, 2.4, 3.3], [1, 0.5, 0.3], [0.05, 0.03, 0.02], 0.6, 0.0005);
  }, 0.2);
  def('ignite', 1.2, 0.6, (c) => {
    // burro de arranque "rr-rr-rr" y el motor que prende y acelera
    const fl = svf(); let p = 0;
    c.layer(0, 0.42, (t) => { p += 180 / c.sr; const crank = 0.5 + 0.5 * Math.sin(TAU * 11 * t); return fl(2 * (p % 1) - 1, 700, 1.4, c.sr, LP) * crank * Math.min(1, t / 0.02); }, 0.45);
    const f2 = svf(), f3 = svf(), f4 = svf(); let q = 0;
    c.layer(0.4, 0.78, (t) => {
      const rpm = t < 0.25 ? 40 + 140 * t / 0.25 : 180 - 90 * Math.min(1, (t - 0.25) / 0.35);
      q += rpm / c.sr; const x = Math.exp(-((q % 1) * 6)) * 2 - 0.5;
      return f4(f2(x, 420, 1.5, c.sr, BP) + 0.6 * f3(x, 1250, 2, c.sr, BP), 1800, 0.7, c.sr, LP) * Math.min(1, t / 0.02) * Math.min(1, (0.78 - t) / 0.25);
    }, 1.2);
  }, 0.2);

  // --- Neón Commando: fondo de guerra, habilidades y chatarra
  const K = 'contra';
  def('stomp', 0.7, 0.55, (c) => { c.thump(0, 55, 32, 0.12, 1, 2.5); c.hiss(0, 0.6, 'brown', LP, 260, 80, 0.7, 0.01, 0.18, 1.6); c.modal(0.02, 120, [1, 2.3, 3.6], [0.4, 0.25, 0.15], [0.09, 0.06, 0.04], 0.35); }, 0.5, K);
  def('beam', 1.5, 0.4, (c) => {
    // rayo del titán a lo lejos: zumbido que sube y chisporrotea
    let p = 0, q = 0; c.layer(0, 1.45, (t) => { const f = 90 + 60 * Math.min(1, t / 0.4); p += TAU * f / c.sr; q += TAU * f * 3.01 / c.sr; return (Math.sin(p) + 0.5 * Math.sin(q) + 0.3 * (c.r() * 2 - 1)) * Math.min(1, t / 0.15) * Math.min(1, (1.45 - t) / 0.2); }, 0.8);
    c.hiss(0, 1.4, 'white', BP, 2400, 3200, 2, 0.1, 0.5, 0.2);
  }, 0.3, K);
  def('collapse', 2.6, 0.6, (c) => { rumble(c, 2.5, 260, 2.4); for (let i = 0; i < 10; i++) c.modal(c.rr(0.1, 1.8), c.rr(300, 900), [1, 2.4, 3.9], [0.5, 0.3, 0.15], [0.06, 0.04, 0.03], 0.18); c.hiss(0.2, 2.2, 'pink', LP, 1400, 400, 0.7, 0.3, 0.8, 0.6); }, 0.3, K);
  def('drone', 2.4, 0.35, (c) => { const f = svf(), g = pinkGen(c.r); let p = 0; c.layer(0, 2.35, (t) => { p += TAU * 82 / c.sr; return (f(g(), 300, 1.2, c.sr, BP) * 1.4 + Math.sin(p) * 0.4 * (1 + 0.3 * Math.sin(TAU * 5 * t))) * Math.sin(Math.PI * t / 2.35); }, 1); }, 0.2, K);
  def('farboom', 2.6, 0.7, (c) => {
    // explosión grande a lo lejos: golpe sordo, rugido largo y cola que rueda por la ciudad
    c.thump(0, 48, 28, 0.25, 1.4, 2.5);
    c.hiss(0, 2.5, 'brown', LP, 700, 60, 0.7, 0.01, 0.7, 2.6);
    c.hiss(0.05, 1.6, 'pink', LP, 1800, 250, 0.7, 0.02, 0.35, 0.5);
    for (let i = 0; i < 4; i++) c.thump(c.rr(0.3, 1.6), c.rr(50, 70), 30, 0.08, 0.35, 2);
  }, 0.3, K);
  def('throw', 0.3, 0.4, (c) => { c.click(0, 2600, 0.6, 0.002); c.modal(0.005, 1900, [1, 2.7], [0.6, 0.3], [0.03, 0.02], 0.3); c.hiss(0.02, 0.25, 'pink', BP, 900, 2400, 1.4, 0.03, 0.08, 0.8); }, 0.5, K);
  def('gboom', 1.1, 0.7, (c) => { c.thump(0, 90, 36, 0.1, 1.4, 3); c.hiss(0, 1, 'brown', LP, 3000, 120, 0.7, 0.001, 0.22, 2.2); c.hiss(0, 0.2, 'white', HP, 4000, 2000, 0.7, 0.001, 0.03, 0.5); for (let i = 0; i < 8; i++) c.modal(c.rr(0.08, 0.7), c.rr(600, 1800), [1, 2.4, 3.7], [0.5, 0.3, 0.2], [0.03, 0.02, 0.015], 0.14); }, 0.4, K);
  def('barrier', 0.7, 0.45, (c) => { [1, 1.007].forEach((dt) => { let p = 0, q = 0; c.layer(0, 0.65, (t) => { const f = (160 + 380 * Math.min(1, t / 0.25)) * dt; q += TAU * f * 2 / c.sr; p += TAU * f / c.sr; return Math.sin(p + 1.8 * Math.sin(q)) * Math.min(1, t / 0.03) * Math.exp(-Math.max(0, t - 0.25) / 0.12); }, 0.5); }); c.click(0, 3000, 0.4); }, 0.3, K);
  def('dash', 0.35, 0.45, (c) => { const f = svf(), g = pinkGen(c.r); c.layer(0, 0.32, (t) => f(g(), 900 + 3200 * Math.sin(Math.PI * Math.min(1, t / 0.3)), 1.8, c.sr, BP) * Math.sin(Math.PI * t / 0.32), 1.8); let p = 0; c.layer(0, 0.2, (t) => { p += TAU * (600 + 1800 * t / 0.2) / c.sr; return Math.sin(p) * env(t, 0.005, 0.06); }, 0.25); }, 0.5, K);
  def('chink', 0.16, 0.3, (c) => { c.modal(0, 2600, [1, 1.52, 2.33], [1, 0.5, 0.3], [0.04, 0.03, 0.02], 1, 0.0005); c.click(0, 5000, 0.3, 0.0008); }, 1, K);

  // --- Neón Commando: armas con cuerpo propio (golpe del cañón + estampido + cola)
  def('rifle', 0.26, 0.24, (c) => { c.click(0, 2200, 1.2, 0.0015, 1.5); c.thump(0, 190, 90, 0.022, 0.8, 2.5); c.hiss(0, 0.12, 'white', BP, 3400, 1400, 1.1, 0.0008, 0.022, 1.3); c.hiss(0.008, 0.22, 'pink', LP, 1800, 500, 0.7, 0.003, 0.05, 0.4); }, 1, K);
  def('shoot', 0.22, 0.22, (c) => { c.click(0, 2600, 1, 0.0012, 1.5); c.thump(0, 220, 120, 0.018, 0.6, 2); c.hiss(0, 0.1, 'white', BP, 3800, 1800, 1.2, 0.0008, 0.018, 1.1); }, 1, K);
  def('mgun', 0.2, 0.18, (c) => { c.click(0, 3000, 1, 0.001, 1.5); c.thump(0, 240, 120, 0.016, 0.7, 2.5); c.hiss(0, 0.09, 'white', BP, 4200, 2000, 1.1, 0.0006, 0.016, 1.2); c.modal(0.01, 2600, [1, 2.3], [0.15, 0.08], [0.02, 0.015], 0.3); }, 1.4, K);
  def('shotgun', 0.5, 0.45, (c) => {
    // escopeta: estampido grave, nube de perdigones y el "chk-chk" de la corredera
    c.thump(0, 100, 40, 0.07, 1.3, 3.2); c.click(0, 1800, 1.4, 0.002, 1);
    c.hiss(0, 0.2, 'white', LP, 7000, 300, 0.7, 0.0008, 0.06, 2.1); c.hiss(0, 0.3, 'brown', LP, 900, 120, 0.7, 0.002, 0.09, 1.3);
    c.click(0.24, 1500, 0.7, 0.002, 3); c.modal(0.24, 900, [1, 2.6, 4.1], [0.4, 0.25, 0.1], [0.03, 0.02, 0.015], 0.35);
    c.click(0.33, 1100, 0.8, 0.002, 3); c.modal(0.33, 760, [1, 2.6, 4.1], [0.4, 0.25, 0.1], [0.035, 0.02, 0.015], 0.4);
  }, 0.5, K);
  def('spread', 0.32, 0.32, (c) => { c.thump(0, 150, 70, 0.04, 1, 2.5); c.click(0, 2400, 1.2, 0.0015, 1); c.hiss(0, 0.16, 'white', LP, 9000, 900, 0.7, 0.0008, 0.04, 1.8); for (let i = 0; i < 4; i++) c.click(c.rr(0.01, 0.05), c.rr(3000, 6000), 0.4, 0.0008, 4); }, 0.7, K);
  def('vlaser', 0.3, 0.28, (c) => {
    // riel de energía: zap que cae en picada, chisporroteo y un golpe de aire
    let p = 0, q = 0; c.layer(0, 0.24, (t) => { const f = 600 + 3000 * Math.exp(-t / 0.035); q += TAU * f * 1.5 / c.sr; p += TAU * f / c.sr; return Math.sin(p + 3.5 * Math.exp(-t / 0.05) * Math.sin(q)) * env(t, 0.001, 0.07); }, 0.9);
    c.hiss(0, 0.06, 'white', HP, 7000, 5000, 0.8, 0.0005, 0.012, 0.6); c.thump(0, 160, 90, 0.02, 0.5, 2);
  }, 0.8, K);
  def('laser', 0.45, 0.34, (c) => {
    [1, 1.012].forEach((dt) => { let p = 0, q = 0; c.layer(0, 0.38, (t) => { const f = (260 + 2200 * Math.exp(-t / 0.06)) * dt; q += TAU * f * 2.01 / c.sr; p += TAU * f / c.sr; return Math.sin(p + 2.5 * Math.sin(q)) * env(t, 0.002, 0.12); }, 0.55); });
    c.thump(0, 90, 45, 0.06, 0.9, 2.5); c.hiss(0, 0.3, 'white', BP, 5000, 2500, 2, 0.001, 0.08, 0.5);
  }, 0.5, K);
  def('fireball', 0.4, 0.26, (c) => { c.hiss(0, 0.36, 'pink', BP, 400, 1500, 1.2, 0.01, 0.12, 1.5); for (let i = 0; i < 9; i++) c.click(c.rr(0, 0.3), c.rr(1500, 4500), c.rr(0.2, 0.45), 0.0008, 3); c.thump(0, 120, 70, 0.03, 0.5, 2); }, 0.6, K);
  def('hit', 0.2, 0.26, (c) => { c.thump(0, 150, 80, 0.028, 1, 2.5); c.hiss(0, 0.06, 'white', BP, 1300, 900, 1.5, 0.0008, 0.016, 1.2); c.click(0, 3200, 0.7, 0.0008, 2); }, 0.8, K);
  def('tink', 0.16, 0.16, (c) => { c.modal(0, c.rr(1700, 2100), [1, 2.4, 3.9], [1, 0.4, 0.2], [0.03, 0.02, 0.012], 1, 0.0004); c.click(0, 5000, 0.4, 0.0006, 3); }, 1.5, K);
  def('eshot', 0.14, 0.14, (c) => { c.thump(0, 320, 180, 0.014, 0.8, 2); c.hiss(0, 0.06, 'pink', LP, 1600, 500, 0.7, 0.001, 0.014, 0.9); }, 1, K);
  def('explode', 1.0, 0.5, (c) => { c.thump(0, 78, 32, 0.12, 1.3, 3); c.hiss(0, 0.9, 'brown', LP, 2600, 100, 0.7, 0.001, 0.2, 2.3); c.hiss(0, 0.12, 'white', HP, 3500, 1800, 0.7, 0.001, 0.03, 0.5); for (let i = 0; i < 6; i++) c.modal(c.rr(0.06, 0.6), c.rr(700, 1900), [1, 2.4, 3.7], [0.5, 0.3, 0.2], [0.03, 0.02, 0.015], 0.13); }, 0.5, K);
  def('boom', 2.3, 0.6, (c) => { c.thump(0, 56, 24, 0.32, 1.5, 3); c.hiss(0, 2.2, 'brown', LP, 2000, 50, 0.7, 0.002, 0.6, 2.8); c.hiss(0, 0.35, 'white', HP, 3000, 1200, 0.7, 0.001, 0.06, 0.6); rumble(c, 2.2, 160, 1.2); for (let i = 0; i < 12; i++) c.modal(c.rr(0.1, 1.6), c.rr(500, 1600), [1, 2.4, 3.7], [0.5, 0.3, 0.2], [0.04, 0.03, 0.02], 0.14); }, 0.2, K);
  def('jump', 0.18, 0.18, (c) => { c.hiss(0, 0.16, 'pink', BP, 700, 1900, 1.4, 0.005, 0.04, 1.4); c.click(0, 900, 0.6, 0.003, 2); }, 0.8, K);
  def('die', 1.0, 0.45, (c) => {
    c.thump(0, 130, 45, 0.08, 1.3, 3); c.click(0, 2500, 1, 0.002, 1.5);
    let p = 0; c.layer(0.05, 0.6, (t) => { p += TAU * (520 * Math.exp(-t / 0.25) + 90) / c.sr; return Math.sin(p) * env(t, 0.01, 0.2); }, 0.45);
    const f = svf(); let hold = 0, k = 0; c.layer(0.12, 0.5, (t) => { if (k++ % 6 === 0) hold = Math.round(f(c.r() * 2 - 1, 1800, 1.2, c.sr, BP) * 5) / 5; return hold * env(t, 0.01, 0.15); }, 0.5);
  }, 0.2, K);
  def('powerup', 0.65, 0.38, (c) => { c.click(0, 1800, 0.9, 0.002, 2); c.hiss(0.03, 0.08, 'white', BP, 2600, 3400, 2, 0.005, 0.03, 0.8); c.click(0.12, 2300, 1, 0.002, 2); c.modal(0.12, 1300, [1, 2.5, 4], [0.5, 0.3, 0.15], [0.04, 0.03, 0.02], 0.4); c.fm(0.22, mtof(84), 3.5, 1.4, 0.12, 0.4); c.fm(0.3, mtof(91), 3.5, 1.2, 0.16, 0.4); }, 0.2, K);
  def('missile', 0.65, 0.3, (c) => { c.thump(0, 120, 60, 0.04, 0.8, 2); c.hiss(0, 0.6, 'pink', BP, 600, 3000, 1.3, 0.02, 0.2, 1.5); for (let i = 0; i < 10; i++) c.click(c.rr(0.02, 0.5), c.rr(2000, 6000), 0.25, 0.0006, 3); }, 0.4, K);
  def('alarm', 1.4, 0.32, (c) => {
    // claxon de base militar: tres "auuu-ga"
    for (let k = 0; k < 3; k++) { const f1 = svf(); let p = 0; c.layer(k * 0.45, 0.38, (t) => { p += (300 + 260 * Math.min(1, t / 0.28)) / c.sr; return f1(sat(2 * (p % 1) - 1, 2), 1100, 1.4, c.sr, BP) * Math.min(1, t / 0.02) * Math.min(1, (0.38 - t) / 0.05); }, 1); }
  }, 0, K);
  def('clear', 1.6, 0.45, (c) => {
    for (let i = 0; i < 16; i++) { const t = i * 0.032; c.hiss(t, 0.05, 'white', BP, 2600, 2200, 0.9, 0.001, 0.02, 0.25 + i * 0.03); }
    [55, 59, 62].forEach((m) => c.brass(0.52, mtof(m + 12), 0.18, 0.3)); [55, 60, 64, 67].forEach((m) => c.brass(0.74, mtof(m + 12), 0.65, 0.3));
    c.thump(0.74, 110, 55, 0.06, 0.7); c.hiss(0.74, 0.8, 'white', HP, 5000, 4000, 0.6, 0.002, 0.3, 0.35);
  }, 0, K);
  def('gameover', 2.4, 0.4, (c) => { [[55, 0, 0.5], [53, 0.55, 0.5], [50, 1.1, 1.1]].forEach(([m, t0, d]) => c.brass(t0, mtof(m - 12), d, 0.45)); const f = svf(); c.layer(0, 2.3, (t) => f(c.r() * 2 - 1, 1600, 1.5, c.sr, BP) * 0.15 * Math.min(1, t / 0.5) * Math.min(1, (2.3 - t) / 0.6), 1); }, 0, K);
  def('oneup', 0.8, 0.4, (c) => { c.click(0, 1800, 0.8, 0.002, 2); c.click(0.1, 2300, 0.9, 0.002, 2); [84, 88, 91, 96].forEach((m, i) => c.fm(0.18 + i * 0.06, mtof(m), 3.5, 1.5, 0.14, 0.4)); }, 0, K);

  // ---------- API
  return {
    key: (name, bank) => (D[bank + ':' + name] ? bank + ':' + name : D[name] && (D[name].bank === 'ui' || D[name].bank === bank) ? name : null),
    names: () => Object.keys(D),
    jitter: (key) => (D[key] ? D[key].jit : 0),
    render(name, sr, seed) {
      const d = D[name], c = ctx(sr, d.dur, seed);
      d.fn(c);
      return finish(c, d.peak);
    },
  };
})();
