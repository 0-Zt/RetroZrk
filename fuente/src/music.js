// =====================================================================
//  MÚSICA DEL GAS RALLY · composiciones originales por secciones
//  Cada canción dura entre 50 s y 1,5 min antes de repetirse (intro, A, B,
//  puente…) y mezcla el chip clásico con instrumentos actuales: bajo con
//  filtro, pads anchos, plucks con eco y batería con bombeo.
// =====================================================================
(() => {
  const H = hold, Z = rest;
  const crash = (bars) => 'r'.padEnd(bars * 16, '.');
  const riser = (bars) => '.'.repeat((bars - 1) * 16) + 'w'.padEnd(16, '.');

  // ---------- INICIO / TALLER · chillhop con swing (Fa mayor)
  const gBass = ['F2 - - . . . F3 . C3 - . . A2 . . .', 'A2 - - . . . A3 . E3 - . . C3 . . .', 'D2 - - . . . D3 . A2 - . . F2 . . .', 'Bb1 - - . . . Bb2 . C2 - - . . . C3 .'];
  const gPadL = [H('A3', 16), H('C4', 16), H('C4', 16), `${H('D4', 8)} ${H('E4', 8)}`];
  const gPadH = [H('E4', 16), H('G4', 16), H('F4', 16), `${H('A4', 8)} ${H('Bb4', 8)}`];
  const gKeys = ['F4 . A4 . C5 . E5 . C5 . A4 . E5 . C5 .', 'A4 . C5 . E5 . G5 . E5 . C5 . G5 . E5 .', 'D5 . F5 . A5 . C6 . A5 . F5 . C6 . A5 .', 'Bb4 . D5 . F5 . A5 . C5 . E5 . G5 . Bb5 .'];
  SONGS.garage = mkSong({
    gain: 1.44, bpm: 92, swing: 0.16, pump: 0.3, echo: 0.75,
    ch: {
      bass: { type: 'bass', vol: 0.34, gate: 0.6, cut: 1000 },
      padL: { type: 'pad', vol: 0.05, cut: 1100, pan: -0.3 },
      padH: { type: 'pad', vol: 0.045, cut: 1300, pan: 0.3 },
      keys: { type: 'bell', vol: 0.065, decay: 0.45, fx: 0.25, pan: 0.25 },
      lead: { type: 'saw', vol: 0.07, gate: 0.85, cut: 2200, fx: 0.35, pan: -0.1 },
    },
    parts: {
      I: { bars: 2, padL: gPadL, padH: gPadH, keys: gKeys, drums: ['k.......k.......', '................', 'h.h.h.h.h.h.h.h.'] },
      A: { bars: 4, bass: gBass, padL: gPadL, padH: gPadH, keys: gKeys,
        drums: ['k.......k.k.....', '....c.......c...', 'h.h.h.h.h.h.h.hh', '..z...z...z...z.'] },
      B: { bars: 4, bass: gBass, padL: gPadL, padH: gPadH, keys: gKeys,
        lead: ['C5 - - . A4 . C5 . D5 - . . C5 . A4 .', 'E5 - - - - - . . D5 . C5 . A4 - G4 .', 'F5 - - . E5 . D5 . C5 - . . A4 . C5 .', 'D5 - - - - - - - E5 - - - G5 - - -'],
        drums: ['k.......k.k.....', '....c.......c...', 'h.h.h.h.h.h.h.hh', '..z...z...z...z.'], fill: ['k.......k.k.....', '....c.......cccc', 'h.h.h.h.h.h.....', '..z...z...z...z.'] },
      C: { bars: 4, bass: ['F2 - - - - - - - . . . . . . . .', 'A2 - - - - - - - . . . . . . . .', 'D2 - - - - - - - . . . . . . . .', 'Bb1 - - - - - - - C2 - - - - - - -'], padL: gPadL, padH: gPadH,
        lead: ['A5 - - - G5 - E5 - D5 - - - C5 - - -', 'E5 - - - - - - - G5 - - - E5 - - -', 'F5 - - - E5 - D5 - C5 - - - A4 - - -', 'Bb4 - - - - - - - C5 - - - - - - -'],
        drums: ['k...........k...', '....i.......i...', 'h...h...h...h...'], fill: ['k...........k...', '....i.......i...', 'h...h...h...w...'] },
    },
    form: ['I', 'A', 'A', 'B', 'B', 'C', 'A', 'B'],
  });

  // ---------- MAPA Y MENÚ · tema de viaje, pop alegre (Re mayor)
  const mBassA = ['D2 . D3 . D2 . D3 . D2 . D3 . A2 . D3 .', 'C#2 . C#3 . C#2 . C#3 . C#2 . C#3 . A2 . C#3 .', 'B1 . B2 . B1 . B2 . B1 . B2 . F#2 . B2 .', 'G1 . G2 . G1 . G2 . A1 . A2 . A1 . C#2 .'];
  const mBassB = ['E2 . E3 . E2 . E3 . E2 . E3 . B2 . E3 .', 'G2 . G3 . G2 . G3 . G2 . G3 . D3 . G3 .', 'D2 . D3 . D2 . D3 . D2 . D3 . A2 . D3 .', 'A1 . A2 . A1 . A2 . A1 . A2 . E2 . C#3 .'];
  const mBassC = ['G2 . G3 . G2 . G3 . G2 . G3 . D3 . G3 .', 'A2 . A3 . A2 . A3 . A2 . A3 . E3 . A3 .', 'F#2 . F#3 . F#2 . F#3 . F#2 . F#3 . C#3 . F#3 .', 'B1 . B2 . B1 . B2 . A1 . A2 . A1 . A2 .'];
  const mPlA = ['D4 F#4 A4 D5 F#4 A4 D5 F#5 D4 F#4 A4 D5 F#4 A4 D5 A4', 'C#4 E4 A4 C#5 E4 A4 C#5 E5 C#4 E4 A4 C#5 E4 A4 C#5 A4', 'B3 D4 F#4 B4 D4 F#4 B4 D5 B3 D4 F#4 B4 D4 F#4 B4 F#4', 'G3 B3 D4 G4 B3 D4 G4 B4 A3 C#4 E4 A4 C#4 E4 A4 E4'];
  const mPlB = ['E4 G4 B4 E5 G4 B4 E5 G5 E4 G4 B4 E5 G4 B4 E5 B4', 'G4 B4 D5 G5 B4 D5 G5 B5 G4 B4 D5 G5 B4 D5 G5 D5', 'D4 F#4 A4 D5 F#4 A4 D5 F#5 D4 F#4 A4 D5 F#4 A4 D5 A4', 'A3 C#4 E4 A4 C#4 E4 A4 C#5 A3 C#4 E4 A4 C#4 E4 G4 E4'];
  const mPadA = [H('F#4', 16), H('E4', 16), H('D4', 16), `${H('D4', 8)} ${H('C#4', 8)}`];
  const mDr = ['k...k...k...k...', '....c.......c...', '..o...o...o...o.'];
  const mFill = ['k...k...k...k.k.', '....c.......cccc', '..o...o...o.....', '............mmmm'];
  SONGS.menu = mkSong({
    gain: 1.56, bpm: 116, pump: 0.35, echo: 0.75,
    ch: {
      bass: { type: 'bass', vol: 0.34, gate: 0.5, cut: 1300 },
      pluck: { type: 'pluck', vol: 0.055, gate: 0.5, fx: 0.3, pan: 0.25 },
      pad: { type: 'pad', vol: 0.05, cut: 1400, pan: -0.2 },
      lead: { type: 'supersq', vol: 0.065, gate: 0.85, fx: 0.3, cut: 3000 },
      bell: { type: 'bell', vol: 0.05, decay: 0.4, fx: 0.25, pan: -0.3 },
    },
    parts: {
      I: { bars: 2, pluck: mPlA, pad: mPadA, drums: ['..h...h...h...h.', riser(2)] },
      A: { bars: 4, bass: mBassA, pluck: mPlA, pad: mPadA, drums: [...mDr, crash(4)], fill: mFill },
      A2: { bars: 8, bass: mBassA, pluck: mPlA, pad: mPadA,
        lead: ['F#5 - - . E5 . D5 . E5 - - . F#5 . A5 .', 'E5 - - - - - . . C#5 . D5 . E5 - - .', 'D5 - - . C#5 . B4 . F#5 - - . E5 . D5 .', 'D5 - - - - - . . . . A4 . B4 . D5 .',
          'F#5 - - . E5 . D5 . E5 - - . F#5 . A5 .', 'B5 - - - A5 - - - E5 - - - . . . .', 'D5 - - . C#5 . B4 . A5 - - . G5 . F#5 .', 'G5 - - - F#5 - - - E5 - - - D5 - - -'],
        drums: [...mDr, 'z.z.z.z.z.z.z.z.', crash(8)], fill: mFill },
      B: { bars: 4, bass: mBassB, pluck: mPlB, pad: [H('G4', 16), H('D4', 16), H('F#4', 16), H('E4', 16)],
        lead: ['G5 - - - F#5 - E5 - D5 - - - B4 - - -', 'D5 - - - E5 - F#5 - G5 - - - - - . .', 'F#5 - - - E5 - D5 - A5 - - - F#5 - - -', 'E5 - - - - - - - C#5 - - - E5 - - -'],
        drums: [...mDr, 'z.z.z.z.z.z.z.z.', crash(4)], fill: mFill },
      C: { bars: 4, bass: mBassC, pad: [H('D4', 16), H('C#4', 16), H('C#4', 16), H('D4', 16)],
        bell: ['B5 . . . D6 . . . G5 . . . B5 . . .', 'C#6 . . . E6 . . . A5 . . . C#6 . . .', 'A5 . . . C#6 . . . F#5 . . . A5 . . .', 'B5 . . . D6 . . . F#6 . . . E6 . . .'],
        lead: ['D5 - - - - - B4 - G4 - - - B4 - D5 -', 'E5 - - - - - C#5 - A4 - - - C#5 - E5 -', 'F#5 - - - - - E5 - C#5 - - - A4 - - -', 'B4 - - - - - - - . . . . . . . .'],
        drums: ['k.......k.......', '........c.......', 'h.h.h.h.h.h.h.h.'], fill: ['k.......k.......', '........c.......', 'h.h.h.h.w.......'] },
    },
    form: ['I', 'A', 'A2', 'B', 'C', 'B', 'A2'],
  });

  // ---------- SANTIAGO · cueca electrónica en 6/8 con palmas en hemiola (Re mayor)
  const sBassA = ['D2 - - - - - A2 - - - - -', 'G2 - - - - - D2 - - - - -', 'A2 - - - - - E2 - - - - -', 'D2 - - - - - A2 - - - - -', 'D2 - - - - - F#2 - - - - -', 'G2 - - - - - B2 - - - - -', 'A2 - - - - - C#3 - - - - -', 'D3 - - - - - A2 - - - - -'];
  const sGuitA = ['D4 . F#4 . A4 . D4 . F#4 . A4 .', 'D4 . G4 . B4 . D4 . G4 . B4 .', 'C#4 . E4 . A4 . C#4 . E4 . G4 .', 'D4 . F#4 . A4 . D4 . F#4 . A4 .', 'D4 . F#4 . A4 . D4 . F#4 . A4 .', 'D4 . G4 . B4 . D4 . G4 . B4 .', 'C#4 . E4 . A4 . C#4 . E4 . G4 .', 'D4 . F#4 . A4 . D4 . F#4 . A4 .'];
  const sDr = ['k.....k.....', '....c...c.......c.....c.', '..h...h...h.', 'z.z.z.z.z.z.'];
  SONGS.scl = mkSong({
    gain: 1.0, bpm: 140, steps: 12, pump: 0.25, echo: 0.5,
    ch: {
      bass: { type: 'bass', vol: 0.32, gate: 0.85, cut: 1100 },
      guit: { type: 'pluck', vol: 0.055, decay: 0.2, pan: 0.3 },
      pad: { type: 'pad', vol: 0.04, cut: 1200, pan: -0.25 },
      lead: { type: 'saw', vol: 0.08, gate: 0.85, cut: 2600, fx: 0.22 },
      harm: { type: 'supersq', vol: 0.04, gate: 0.85, cut: 2400, pan: -0.25 },
    },
    parts: {
      I: { bars: 2, guit: sGuitA, pad: [H('F#4', 12), H('G4', 12)], drums: ['', '....c...c.......c.....c.'] },
      A: { bars: 8, bass: sBassA, guit: sGuitA, pad: [H('F#4', 12), H('G4', 12), H('E4', 12), H('F#4', 12)],
        lead: ['A4 - D5 - F#5 - E5 - D5 - C#5 -', 'B4 - D5 - G5 - - - F#5 - E5 -', 'C#5 - E5 - A5 - G5 - F#5 - E5 -', 'F#5 - E5 - D5 - - - - - . .', 'D5 - F#5 - A5 - - - B5 - A5 -', 'G5 - B5 - D6 - - - B5 - G5 -', 'A5 - G5 - F#5 - E5 - C#5 - E5 -', 'D5 - - - - - . . F#4 - A4 -'],
        harm: ['F#4 - A4 - D5 - C#5 - B4 - A4 -', 'G4 - B4 - D5 - - - D5 - C#5 -', 'A4 - C#5 - E5 - E5 - D5 - C#5 -', 'D5 - C#5 - A4 - - - - - . .', 'A4 - D5 - F#5 - - - G5 - F#5 -', 'D5 - G5 - B5 - - - G5 - D5 -', 'E5 - E5 - D5 - C#5 - A4 - C#5 -', 'A4 - - - - - . . D4 - F#4 -'],
        drums: [...sDr, 'r'.padEnd(96, '.')], fill: ['k.....k.....', '....c...c...', 'mm.m.m.mmmmm', 'z.z.z.z.z.z.'] },
      B: { bars: 8, bass: ['B1 - - - - - F#2 - - - - -', 'G2 - - - - - D2 - - - - -', 'A2 - - - - - E2 - - - - -', 'D2 - - - - - A2 - - - - -', 'B1 - - - - - F#2 - - - - -', 'E2 - - - - - B2 - - - - -', 'A2 - - - - - C#3 - - - - -', 'D2 - - - - - A2 - - - - -'],
        guit: ['B3 . D4 . F#4 . B3 . D4 . F#4 .', 'B3 . D4 . G4 . B3 . D4 . G4 .', 'C#4 . E4 . A4 . C#4 . E4 . A4 .', 'D4 . F#4 . A4 . D4 . F#4 . A4 .', 'B3 . D4 . F#4 . B3 . D4 . F#4 .', 'B3 . E4 . G4 . B3 . E4 . G4 .', 'C#4 . E4 . A4 . C#4 . E4 . G4 .', 'D4 . F#4 . A4 . D4 . F#4 . A4 .'],
        pad: [H('D4', 12), H('D4', 12), H('C#4', 12), H('D4', 12), H('D4', 12), H('E4', 12), H('C#4', 12), H('D4', 12)],
        lead: ['F#5 - - - D5 - B4 - D5 - F#5 -', 'G5 - - - F#5 - E5 - D5 - B4 -', 'A4 - C#5 - E5 - A5 - G5 - E5 -', 'F#5 - - - - - D5 - - - . .', 'B5 - - - A5 - F#5 - - - D5 -', 'E5 - G5 - B5 - - - A5 - G5 -', 'E5 - C#5 - A4 - C#5 - E5 - G5 -', 'F#5 - - - - - . . A4 - D5 -'],
        harm: ['D5 - - - B4 - G4 - B4 - D5 -', 'E5 - - - D5 - C#5 - B4 - G4 -', 'E4 - A4 - C#5 - E5 - E5 - C#5 -', 'D5 - - - - - A4 - - - . .', 'G5 - - - F#5 - D5 - - - B4 -', 'B4 - E5 - G5 - - - E5 - E5 -', 'C#5 - A4 - E4 - A4 - C#5 - E5 -', 'D5 - - - - - . . F#4 - A4 -'],
        drums: [...sDr, 'r'.padEnd(96, '.')] },
      C: { bars: 4, bass: sBassA, guit: ['D4 . . F#4 . A4 D4 . . F#4 . A4', 'G4 . . B4 . D5 G4 . . B4 . D5', 'A4 . . C#5 . E5 A4 . . C#5 . E5', 'D4 . . F#4 . A4 D4 - - - - -'],
        drums: ['k...........', '....c...c.......c.....c.', '', 'z.z.z.z.z.z.'], fill: ['k...........', '....c...c...', '', 'w...........'] },
    },
    form: ['I', 'A', 'B', 'A', 'C', 'B', 'A'],
  });

  // ---------- BUENOS AIRES · cumbia digital con güiro y acordeón (La menor)
  const bBassA = ['A2 - . . E3 - . . A2 - . . E3 - . .', 'G2 - . . D3 - . . G2 - . . D3 - . .', 'F2 - . . C3 - . . F2 - . . C3 - . .', 'E2 - . . B2 - . . E2 - . . G#2 - . .'];
  const bChA = ['. . C5 . . . E5 . . . C5 . . . E5 .', '. . B4 . . . D5 . . . B4 . . . D5 .', '. . A4 . . . C5 . . . A4 . . . C5 .', '. . G#4 . . . B4 . . . G#4 . . . B4 .'];
  const bBassB = ['F2 - . . C3 - . . F2 - . . C3 - . .', 'G2 - . . D3 - . . G2 - . . D3 - . .', 'C3 - . . G2 - . . C3 - . . G2 - . .', 'E2 - . . B2 - . . E2 - . . G#2 - . .', 'F2 - . . C3 - . . F2 - . . C3 - . .', 'G2 - . . D3 - . . G2 - . . D3 - . .', 'A2 - . . E3 - . . A2 - . . E3 - . .', 'E2 - . . B2 - . . E2 - . . G#2 - . .'];
  const bChB = ['. . A4 . . . C5 . . . A4 . . . C5 .', '. . B4 . . . D5 . . . B4 . . . D5 .', '. . G4 . . . C5 . . . G4 . . . E5 .', '. . G#4 . . . B4 . . . G#4 . . . B4 .', '. . A4 . . . C5 . . . A4 . . . C5 .', '. . B4 . . . D5 . . . B4 . . . D5 .', '. . C5 . . . E5 . . . C5 . . . E5 .', '. . G#4 . . . B4 . . . G#4 . . . B4 .'];
  const bDr = ['k.......k.......', 'g.hhg.hhg.hhg.hh', '....s.......s..s', '......b.......b.'];
  SONGS.bue = mkSong({
    gain: 1.56, bpm: 98, pump: 0.25, echo: 0.75,
    ch: {
      bass: { type: 'bass', vol: 0.36, gate: 0.7, cut: 900 },
      keys: { type: 'pluck', vol: 0.055, decay: 0.14, pan: 0.3 },
      lead: { type: 'saw', vol: 0.08, gate: 0.85, cut: 2400, fx: 0.25, pan: -0.1 },
      bell: { type: 'bell', vol: 0.05, decay: 0.4, fx: 0.3, pan: -0.3 },
      pad: { type: 'pad', vol: 0.035, cut: 1100, pan: 0.2 },
    },
    parts: {
      I: { bars: 2, keys: bChA, pad: [H('C5', 16), H('B4', 16)], drums: ['', 'g.hhg.hhg.hhg.hh', '', '', riser(2)] },
      A: { bars: 8, bass: bBassA, keys: bChA,
        lead: ['E5 - - . E5 . D5 . C5 - - . B4 . C5 .', 'D5 - - . D5 . C5 . B4 - - . A4 . B4 .', 'C5 - - . C5 . B4 . A4 - - . G#4 . A4 .', 'B4 - - - - - - - G#4 - - - E4 - - -', 'A5 - . A5 G5 . E5 . G5 - . G5 E5 . C5 .', 'D5 - . D5 E5 . D5 . B4 - . B4 G4 . B4 .', 'C5 - . C5 D5 . C5 . A4 - . A4 B4 . C5 .', 'B4 - - . G#4 . B4 . E5 - - - D5 . B4 .'],
        drums: [...bDr, 'r'.padEnd(128, '.')], fill: ['k.......k.......', 'g.hhg.hhg.hhg.hh', '....s.......sSss', '......b.......b.'] },
      B: { bars: 8, bass: bBassB, keys: bChB, pad: [H('A4', 16), H('B4', 16), H('G4', 16), H('G#4', 16), H('A4', 16), H('B4', 16), H('C5', 16), H('B4', 16)],
        lead: ['A4 - - . C5 . E5 . A5 - - . G5 . E5 .', 'G5 - - . F5 . E5 . D5 - - . E5 . F5 .', 'E5 - - . D5 . C5 . G4 - - . A4 . C5 .', 'B4 - - - - - - - G#4 - - - B4 - - -', 'C5 - - . D5 . E5 . F5 - - . E5 . D5 .', 'D5 - - . E5 . F5 . G5 - - . F5 . E5 .', 'E5 - - . C5 . A4 . C5 - - . E5 . A5 .', 'G#5 - - - - - - - E5 - - - . . . .'],
        drums: [...bDr, 'z.z.z.z.z.z.z.z.'] },
      C: { bars: 4, bass: bBassA,
        bell: ['E5 . . . . . A5 . . . G5 . . . E5 .', 'D5 . . . . . G5 . . . F5 . . . D5 .', 'C5 . . . . . F5 . . . E5 . . . C5 .', 'B4 . . . . . E5 . . . D5 . . . B4 .'],
        drums: ['k.......k.......', 'g.hhg.hhg.hhg.hh'], fill: ['k.......k.......', 'g.hhg.hhg.hhg.hh', '', '', 'w...............'] },
    },
    form: ['I', 'A', 'B', 'A', 'C', 'B'],
  });

  // ---------- CIUDAD DE MÉXICO · ranchera electrónica: polka con trompetas en terceras (Sol mayor)
  const xBass = ['G2 . . . D2 . . . G2 . . . D2 . . .', 'D2 . . . A2 . . . D2 . . . F#2 . . .', 'D2 . . . A2 . . . D2 . . . C3 . . .', 'G2 . . . D2 . . . G2 . . . B2 . . .', 'C3 . . . G2 . . . C3 . . . E3 . . .', 'G2 . . . D2 . . . G2 . . . D2 . . .', 'D2 . . . A2 . . . D2 . . . F#2 . . .', 'G2 . . . D2 . . . G2 . . . . . . .'];
  const xPah = ['. . D5 . . . D5 . . . D5 . . . D5 .', '. . C5 . . . C5 . . . C5 . . . C5 .', '. . C5 . . . C5 . . . C5 . . . C5 .', '. . D5 . . . D5 . . . D5 . . . D5 .', '. . E5 . . . E5 . . . E5 . . . E5 .', '. . D5 . . . D5 . . . D5 . . . D5 .', '. . C5 . . . C5 . . . C5 . . . C5 .', '. . D5 . . . D5 . . . . . . . . .'];
  const xBassB = ['C3 . . . G2 . . . C3 . . . G2 . . .', 'G2 . . . D2 . . . G2 . . . D2 . . .', 'D2 . . . A2 . . . D2 . . . F#2 . . .', 'G2 . . . D2 . . . G2 . . . B2 . . .'];
  const xPahB = ['. . E5 . . . E5 . . . E5 . . . E5 .', '. . D5 . . . D5 . . . D5 . . . D5 .', '. . C5 . . . C5 . . . C5 . . . C5 .', '. . D5 . . . D5 . . . D5 . . . D5 .'];
  const xDr = ['k...k...k...k...', '....c.......c...', '..o...o...o...o.', 'z.z.z.z.z.z.z.z.'];
  SONGS.mex = mkSong({
    gain: 1.75, bpm: 126, pump: 0.3, echo: 0.5,
    ch: {
      bass: { type: 'bass', vol: 0.36, gate: 0.4, cut: 1200 },
      pah: { type: 'pluck', vol: 0.05, decay: 0.12, pan: 0.25 },
      tp1: { type: 'supersq', vol: 0.07, gate: 0.8, cut: 3200, fx: 0.18, pan: -0.15 },
      tp2: { type: 'supersq', vol: 0.05, gate: 0.8, cut: 2800, pan: 0.2 },
      acc: { type: 'saw', vol: 0.07, gate: 0.75, cut: 2600, fx: 0.2 },
    },
    parts: {
      I: { bars: 2, tp1: ['G4 - B4 - D5 - G5 - - - - - - - - -', 'D5 - - - . . . . . . . . . . . .'], tp2: ['D4 - G4 - B4 - D5 - - - - - - - - -', 'B4 - - - . . . . . . . . . . . .'], drums: ['', '', '', '', riser(2)] },
      A: { bars: 8, bass: xBass, pah: xPah,
        tp1: ['D5 - B4 - G4 - B4 - D5 - - - E5 - D5 -', 'C5 - A4 - F#4 - A4 - C5 - - - D5 - C5 -', 'A4 - C5 - E5 - D5 - C5 - A4 - F#4 - A4 -', 'G4 - B4 - D5 - G5 - G5 - - - . . D5 -', 'E5 - - - D5 - C5 - E5 - - - G5 - - -', 'D5 - B4 - D5 - G5 - - - D5 - B4 - G4 -', 'A4 - B4 - C5 - D5 - E5 - D5 - C5 - A4 -', 'G4 - - - - - - - . . . . D5 - D5 -'],
        tp2: ['B4 - G4 - D4 - G4 - B4 - - - C5 - B4 -', 'A4 - F#4 - D4 - F#4 - A4 - - - B4 - A4 -', 'F#4 - A4 - C5 - B4 - A4 - F#4 - D4 - F#4 -', 'D4 - G4 - B4 - D5 - D5 - - - . . B4 -', 'C5 - - - B4 - A4 - C5 - - - E5 - - -', 'B4 - G4 - B4 - D5 - - - B4 - G4 - D4 -', 'F#4 - G4 - A4 - B4 - C5 - B4 - A4 - F#4 -', 'D4 - - - - - - - . . . . B4 - B4 -'],
        drums: [...xDr, 'r'.padEnd(128, '.')], fill: ['k...k...k...k.k.', '....c.......cccc', '..o...o...o.....', 'z.z.z.z.mmmmmmmm'] },
      B: { bars: 8, bass: xBassB, pah: xPahB,
        acc: ['E5 . G5 . E5 . C5 . G5 - - - E5 - - -', 'D5 . B4 . D5 . G5 . B5 - - - G5 - - -', 'F#5 . A5 . F#5 . D5 . C6 - - - A5 - - -', 'G5 - - - D5 - - - B4 - - - . . . .', 'E5 . G5 . C6 . G5 . E5 - - - C5 - - -', 'D5 . G5 . B5 . G5 . D5 - - - B4 - - -', 'C5 . E5 . F#5 . A5 . D6 - - - C6 - A5 -', 'G5 - - - - - - - . . . . . . . .'],
        drums: [...xDr, 'r'.padEnd(128, '.')] },
      C: { bars: 4, bass: xBassB, pah: xPahB,
        tp1: ['G5 - - - - - - - E5 - - - - - - -', 'D5 - - - - - - - B4 - - - - - - -', 'C5 - - - - - - - A4 - - - - - - -', 'B4 - - - - - - - . . . . . . . .'],
        drums: ['k.......k.......', '................', '..h...h...h...h.'], fill: ['k.......k.......', '................', '..h...h...h...h.', 'w...............'] },
    },
    form: ['I', 'A', 'B', 'A', 'C', 'B', 'A'],
  });

  // ---------- LOS ÁNGELES · synthwave al atardecer con guitarra surf (Mi menor)
  const lBassA = ['E2 . E3 . E2 . E3 . E2 . E3 . E2 . E3 .', 'C2 . C3 . C2 . C3 . C2 . C3 . C2 . C3 .', 'G2 . G3 . G2 . G3 . G2 . G3 . G2 . G3 .', 'D2 . D3 . D2 . D3 . D2 . D3 . D2 . D3 .'];
  const lArpA = ['E4 G4 B4 E5 B4 G4 E4 G4 B4 E5 G5 E5 B4 G4 E4 B3', 'C4 E4 G4 C5 G4 E4 C4 E4 G4 C5 E5 C5 G4 E4 C4 G3', 'G3 B3 D4 G4 D4 B3 G3 B3 D4 G4 B4 G4 D4 B3 G3 D3', 'D4 F#4 A4 D5 A4 F#4 D4 F#4 A4 D5 F#5 D5 A4 F#4 D4 A3'];
  const lPadL = [H('B3', 16), H('C4', 16), H('D4', 16), H('D4', 16)];
  const lPadH = [H('G4', 16), H('G4', 16), H('B4', 16), H('A4', 16)];
  const lDr = ['k...k...k...k...', '....S.......S...', 'h.h.h.h.h.h.h.h.'];
  SONGS.lax = mkSong({
    gain: 1.81, bpm: 118, pump: 0.5, echo: 0.75,
    ch: {
      bass: { type: 'bass', vol: 0.34, gate: 0.45, cut: 900 },
      arp: { type: 'pluck', vol: 0.045, gate: 0.4, fx: 0.35, pan: 0.3 },
      padL: { type: 'pad', vol: 0.05, cut: 1500, pan: -0.3 },
      padH: { type: 'pad', vol: 0.045, cut: 1700, pan: 0.3 },
      lead: { type: 'saw', vol: 0.075, gate: 0.9, cut: 3200, fx: 0.4 },
      surf: { type: 'supersq', vol: 0.05, gate: 0.5, cut: 2600, fx: 0.25, pan: -0.2 },
    },
    parts: {
      I: { bars: 4, arp: lArpA, padL: lPadL, padH: lPadH, drums: ['', '', '', riser(4)] },
      A: { bars: 8, bass: lBassA, arp: lArpA, padL: lPadL, padH: lPadH,
        lead: ['B4 - - - E5 - - - G5 - - - F#5 - E5 -', 'E5 - - - - - - - D5 - - - C5 - - -', 'D5 - - - G5 - - - B5 - - - A5 - G5 -', 'F#5 - - - - - - - - - - - . . . .', 'B4 - - - E5 - - - G5 - - - B5 - A5 -', 'G5 - - - - - - - E5 - - - C5 - - -', 'D5 - - - G5 - - - B5 - - - D6 - B5 -', 'A5 - - - - - - - F#5 - - - D5 - - -'],
        drums: [...lDr, 'r'.padEnd(128, '.')], fill: ['k...k...k...k.k.', '....S.......SSSS', 'h.h.h.h.h.h.....'] },
      B: { bars: 8, bass: ['E2 . E3 . E2 . E3 . G2 . G3 . A2 . B2 .', 'E2 . E3 . E2 . E3 . G2 . G3 . A2 . B2 .', 'C3 . C3 . C3 . C3 . E3 . E3 . G2 . G2 .', 'D3 . D3 . D3 . D3 . F#2 . F#2 . A2 . A2 .', 'E2 . E3 . E2 . E3 . G2 . G3 . A2 . B2 .', 'E2 . E3 . E2 . E3 . G2 . G3 . A2 . B2 .', 'C3 . C3 . C3 . C3 . E3 . E3 . G2 . G2 .', 'B2 . B2 . B2 . B2 . D#3 . D#3 . F#2 . F#2 .'],
        padL: [H('B3', 16), H('B3', 16), H('C4', 16), H('D4', 16), H('B3', 16), H('B3', 16), H('C4', 16), H('B3', 16)],
        surf: ['E5 E5 E5 E5 E5 E5 E5 E5 G5 G5 G5 G5 F#5 F#5 F#5 F#5', 'E5 E5 E5 E5 D5 D5 D5 D5 B4 B4 B4 B4 D5 D5 D5 D5', 'C5 C5 C5 C5 E5 E5 E5 E5 G5 G5 G5 G5 E5 E5 E5 E5', 'D5 D5 D5 D5 F#5 F#5 F#5 F#5 A5 A5 A5 A5 F#5 F#5 D5 D5', 'B5 B5 B5 B5 A5 A5 G5 G5 E5 E5 E5 E5 G5 G5 A5 A5', 'B5 B5 B5 B5 B5 B5 B5 B5 . . . . . . . .', 'C6 C6 C6 C6 B5 B5 A5 A5 G5 G5 G5 G5 E5 E5 E5 E5', 'D#5 D#5 D#5 D#5 F#5 F#5 F#5 F#5 B5 B5 B5 B5 A5 A5 F#5 F#5'],
        drums: ['k...k...k...k...', '....S.......S...', '..o...o...o...o.', 'r'.padEnd(128, '.')] },
      C: { bars: 4, padL: [H('C4', 16), H('D4', 16), H('B3', 16), H('B3', 16)], padH: [H('G4', 16), H('A4', 16), H('F#4', 16), H('G4', 16)],
        arp: ['C4 E4 G4 C5 G4 E4 C4 E4 G4 C5 E5 C5 G4 E4 C4 G3', 'D4 F#4 A4 D5 A4 F#4 D4 F#4 A4 D5 F#5 D5 A4 F#4 D4 A3', 'B3 D4 F#4 B4 F#4 D4 B3 D4 F#4 B4 D5 B4 F#4 D4 B3 F#3', 'E4 G4 B4 E5 B4 G4 E4 G4 B4 E5 G5 E5 B4 G4 E4 B3'],
        lead: ['E5 - - - - - - - G5 - - - - - - -', 'F#5 - - - - - - - A5 - - - - - - -', 'B5 - - - - - - - A5 - - - F#5 - - -', 'G5 - - - - - - - - - - - . . . .'],
        drums: ['k.......k.......', '....S.......S...'], fill: ['k.......k.......', '....S.......S...', 'w...............'] },
    },
    form: ['I', 'A', 'B', 'A', 'C', 'B'],
  });

  // ---------- LONDRES · drum and bass con guitarras punk (Mi mixolidio)
  const nGuit = ['B3 . B3 . B3 . B3 . B3 . B3 . B3 . B3 .', 'A3 . A3 . A3 . A3 . A3 . A3 . A3 . A3 .', 'E4 . E4 . E4 . E4 . E4 . E4 . E4 . E4 .', 'B3 . B3 . B3 . B3 . F#4 . F#4 . B3 . B3 .'];
  const nBass = [H('E2', 16), H('D2', 16), H('A1', 16), `${H('E2', 8)} ${H('B1', 8)}`];
  const nDr = ['k.........k.....', '....s.......s...', 'hhhhhhhhhhhhhhhh'];
  const nDr2 = ['k.........k.k...', '....s..s.s..s..s', 'h.h.h.h.h.h.h.h.', '..o...o...o...o.'];
  SONGS.lon = mkSong({
    gain: 1.0, bpm: 172, pump: 0.35, echo: 0.75,
    ch: {
      bass: { type: 'bass', vol: 0.34, gate: 0.95, cut: 1100, q: 3 },
      guit: { type: 'supersq', vol: 0.04, gate: 0.5, cut: 2200, pan: 0.3 },
      lead: { type: 'saw', vol: 0.08, gate: 0.85, cut: 3000, fx: 0.3, pan: -0.1 },
      pad: { type: 'pad', vol: 0.045, cut: 1300, pan: -0.3 },
    },
    parts: {
      I: { bars: 2, pad: [H('B3', 16), H('A3', 16)], guit: nGuit, drums: ['', '', 'hhhhhhhhhhhhhhhh', riser(2)] },
      A: { bars: 8, bass: nBass, guit: nGuit,
        lead: ['G#4 - B4 - E5 - - - D5 - B4 - G#4 - . .', 'F#4 - A4 - D5 - - - C#5 - A4 - F#4 - . .', 'A4 - C#5 - E5 - F#5 - E5 - C#5 - A4 - B4 -', 'B4 - - - G#4 - - - E4 - - - . . . .', 'E5 - E5 - E5 - D5 - E5 - - - B4 - - -', 'D5 - D5 - D5 - C#5 - D5 - - - A4 - - -', 'C#5 - E5 - A5 - G#5 - F#5 - E5 - C#5 - E5 -', 'E5 - - - - - - - . . . . B4 - D5 -'],
        drums: [...nDr, 'r'.padEnd(128, '.')], fill: ['k.........k.....', '....s.......ssss', 'hhhhhhhhhhhh....'] },
      B: { bars: 8, bass: [H('C#2', 16), H('A1', 16), H('E2', 16), H('B1', 16)],
        guit: ['G#3 . G#3 . G#3 . G#3 . G#3 . G#3 . G#3 . G#3 .', 'E3 . E3 . E3 . E3 . E3 . E3 . E3 . E3 .', 'B3 . B3 . B3 . B3 . B3 . B3 . B3 . B3 .', 'F#3 . F#3 . F#3 . F#3 . F#3 . F#3 . F#3 . F#3 .'],
        pad: [H('E4', 16), H('E4', 16), H('G#4', 16), H('F#4', 16)],
        lead: ['G#5 - - - E5 - - - C#5 - - - E5 - G#5 -', 'A5 - - - - - - - E5 - - - C#5 - - -', 'B5 - - - G#5 - - - E5 - - - G#5 - B5 -', 'F#5 - - - - - - - D#5 - - - B4 - - -', 'G#5 - - - E5 - - - C#5 - - - E5 - G#5 -', 'A5 - - - B5 - - - C#6 - - - A5 - - -', 'B5 - - - - - - - G#5 - - - E5 - - -', 'F#5 - - - - - - - - - - - . . . .'],
        drums: [...nDr2, 'r'.padEnd(128, '.')] },
      C: { bars: 4, bass: nBass, pad: [H('B3', 16), H('A3', 16), H('C#4', 16), H('B3', 16)],
        drums: ['k...............', '........s.......', 'h...h...h...h...'], fill: ['k...............', '........s.......', 'h...h...h...h...', 'w...............'] },
    },
    form: ['I', 'A', 'B', 'A', 'C', 'B', 'A'],
  });

  // ---------- TOKIO · future funk con koto y taiko (escala miyako-bushi en Mi)
  const tBassA = ['E1 . E2 . . E1 E2 . E1 . E2 . . E1 B1 .', 'C2 . C3 . . C2 C3 . A1 . A2 . . A1 B1 .', 'E1 . E2 . . E1 E2 . E1 . E2 . . E1 B1 .', 'A1 . A2 . . A1 A2 . F1 . F2 . . F1 B1 .'];
  const tKotoA = ['E4 . B4 . E5 . F5 . E5 . B4 . A4 . B4 .', 'C5 . A4 . F4 . A4 . C5 . E5 . F5 . E5 .', 'E4 . B4 . E5 . F5 . E5 . B4 . A4 . B4 .', 'A4 . C5 . F5 . E5 . C5 . B4 . A4 . F4 .'];
  const tDr = ['k...k...k...k...', '....c.......c...', '..o...o...o...o.', 'h.hhh.hhh.hhh.hh'];
  SONGS.tyo = mkSong({
    gain: 1.35, bpm: 124, pump: 0.4, echo: 0.75,
    ch: {
      bass: { type: 'bass', vol: 0.34, gate: 0.5, cut: 1300, q: 6 },
      koto: { type: 'pluck', vol: 0.05, decay: 0.24, fx: 0.3, pan: 0.3 },
      pad: { type: 'pad', vol: 0.045, cut: 1500, pan: -0.25 },
      lead: { type: 'bell', vol: 0.085, decay: 0.5, fx: 0.3 },
      lead2: { type: 'saw', vol: 0.06, gate: 0.9, cut: 2800, fx: 0.3, pan: -0.1 },
    },
    parts: {
      I: { bars: 2, koto: tKotoA, drums: ['t.......t...t...', '', '', '', riser(2)] },
      A: { bars: 8, bass: tBassA, koto: tKotoA, pad: [H('B3', 16), H('A3', 16), H('B3', 16), H('C4', 16)],
        lead: ['E5 - - - F5 - - - E5 - - - B4 - - -', 'C5 - - - B4 - A4 - B4 - - - - - - -', 'A5 - - - B5 - - - C6 - - - B5 - A5 -', 'F5 - - - E5 - - - - - - - . . . .', 'B5 - - - C6 - B5 - A5 - - - F5 - - -', 'E5 - F5 - E5 - C5 - B4 - - - A4 - - -', 'B4 - - - C5 - - - E5 - - - F5 - - -', 'E5 - - - - - - - - - - - . . . .'],
        drums: [...tDr, 'r'.padEnd(128, '.')], fill: ['k...k...k...k...', '....c.......c...', '..o...o...o.....', 't.......t.t.t.t.'] },
      B: { bars: 8, bass: ['A1 . A2 . . A1 A2 . A1 . A2 . . A1 G2 .', 'F1 . F2 . . F1 F2 . F1 . F2 . . F1 E2 .', 'E1 . E2 . . E1 E2 . E1 . E2 . . E1 B1 .', 'E1 . E2 . . E1 E2 . E1 . E2 . B1 . C2 .'],
        koto: ['A4 . C5 . E5 . A5 . E5 . C5 . B4 . C5 .', 'F4 . A4 . C5 . F5 . C5 . A4 . F4 . A4 .', 'E4 . B4 . E5 . F5 . E5 . B4 . A4 . B4 .', 'E4 . B4 . E5 . B5 . A5 . F5 . E5 . B4 .'],
        pad: [H('C4', 16), H('C4', 16), H('B3', 16), H('B3', 16)],
        lead2: ['A5 - - - B5 - C6 - B5 - A5 - F5 - - -', 'E5 - - - F5 - A5 - - - - - . . . .', 'C6 - - - B5 - A5 - F5 - A5 - B5 - - -', 'E6 - - - - - - - - - - - . . . .', 'A5 - - - B5 - C6 - E6 - C6 - B5 - A5 -', 'F5 - - - E5 - F5 - A5 - - - . . . .', 'B5 - - - A5 - F5 - E5 - F5 - A5 - - -', 'E5 - - - - - - - - - - - . . . .'],
        drums: [...tDr, 'r'.padEnd(128, '.')] },
      C: { bars: 4, koto: tKotoA, pad: [H('B3', 16), H('A3', 16), H('B3', 16), H('C4', 16)],
        drums: ['t.......t...t...', '....c.......c...'], fill: ['t...t...t.t.t.t.', '....c.......c...', 'w...............'] },
    },
    form: ['I', 'A', 'B', 'A', 'C', 'B'],
  });

  // ---------- PERSECUCIÓN · electro rápido y tenso para el escape (Mi frigio)
  const cBass = ['E2 E2 E3 E2 E2 E2 E3 E2 E2 E2 E3 E2 G2 G2 E3 E2', 'E2 E2 E3 E2 E2 E2 E3 E2 F2 F2 F3 F2 F2 F2 F3 F2', 'C2 C2 C3 C2 C2 C2 C3 C2 C2 C2 C3 C2 D2 D2 D3 D2', 'B1 B1 B2 B1 B1 B1 B2 B1 B1 B1 B2 B1 D#2 D#2 F#2 B1'];
  SONGS.chase = mkSong({
    gain: 1.23, bpm: 170, pump: 0.3, echo: 0.5,
    ch: {
      bass: { type: 'bass', vol: 0.3, gate: 0.55, cut: 1100, q: 6 },
      siren: { type: 'saw', vol: 0.065, gate: 0.95, cut: 3600, fx: 0.25 },
      arp: { type: 'pluck', vol: 0.045, gate: 0.4, fx: 0.2, pan: 0.3 },
      pad: { type: 'pad', vol: 0.04, cut: 1200, pan: -0.3 },
    },
    parts: {
      I: { bars: 2, bass: [cBass[0]], pad: [H('B3', 16), H('B3', 16)], drums: ['', '', 'hhhhhhhhhhhhhhhh', riser(2)] },
      A: { bars: 8, bass: cBass, pad: [H('B3', 16), H('C4', 16), H('C4', 16), H('B3', 16)],
        siren: ['B5 - - - C6 - - - B5 - - - G5 - - -', 'B5 - - - C6 - - - D6 - - - C6 - - -', 'G5 - - - E5 - - - G5 - - - A5 - - -', 'B5 - - - - - - - D#5 - - - F#5 - - -'],
        drums: ['k.........k.....', '....s.......s...', 'hhhhhhhhhhhhhhhh', 'r'.padEnd(128, '.')], fill: ['k.........k.k...', '....s.......ssss', 'hhhhhhhhhhhh....'] },
      B: { bars: 8, bass: cBass,
        arp: ['E4 G4 B4 E5 F5 E5 B4 G4 E4 G4 B4 E5 F5 E5 B4 G4', 'E4 G4 B4 E5 F5 E5 B4 G4 F4 A4 C5 F5 G5 F5 C5 A4', 'C4 E4 G4 C5 D5 C5 G4 E4 C4 E4 G4 C5 D5 C5 G4 E4', 'B3 D#4 F#4 B4 C5 B4 F#4 D#4 B3 D#4 F#4 B4 D#5 B4 F#4 D#4'],
        siren: ['E6 - - - - - - - F6 - - - - - - -', 'E6 - - - - - - - F6 - - - G6 - - -', 'E6 - - - - - - - C6 - - - - - - -', 'B5 - - - - - - - - - - - . . . .'],
        drums: ['k.........k.k...', '....s..s.s..s..s', 'h.h.h.h.h.h.h.h.', '..o...o...o...o.'] },
    },
    form: ['I', 'A', 'B', 'A', 'B'],
  });

  // ---------- VICTORIA · fanfarria y celebración (Do mayor)
  SONGS.victory = mkSong({
    gain: 1.5, bpm: 128, pump: 0.3, echo: 0.75,
    ch: {
      bass: { type: 'bass', vol: 0.34, gate: 0.5, cut: 1300 },
      brass: { type: 'supersq', vol: 0.075, gate: 0.85, cut: 3400, fx: 0.25 },
      pluck: { type: 'pluck', vol: 0.05, gate: 0.5, fx: 0.3, pan: 0.3 },
      pad: { type: 'pad', vol: 0.045, cut: 1500, pan: -0.3 },
    },
    parts: {
      F: { bars: 4, brass: ['C5 - E5 - G5 - C6 - - - G5 - C6 - - -', 'A5 - - - F5 - A5 - G5 - - - - - . .', 'C5 - E5 - G5 - E6 - - - D6 - C6 - - -', 'A5 - C6 - B5 - G5 - C6 - - - - - . .'],
        bass: ['C2 . . . C3 . . . G2 . . . G1 . . .', 'F2 . . . F3 . . . G2 . . . G1 . . .', 'C2 . . . C3 . . . A2 . . . A1 . . .', 'F2 . . . G2 . . . C2 - - - . . . .'],
        drums: ['k.......k.......', '....s.......s...', 'r'.padEnd(64, '.')], fill: ['k.......k.......', '....s...ssssSSSS', ''] },
      A: { bars: 8, bass: ['C2 . C3 . C2 . C3 . C2 . C3 . C2 . C3 .', 'A1 . A2 . A1 . A2 . A1 . A2 . A1 . A2 .', 'F1 . F2 . F1 . F2 . F1 . F2 . F1 . F2 .', 'G1 . G2 . G1 . G2 . G1 . G2 . B1 . D2 .'],
        pluck: ['E4 G4 C5 E5 G4 C5 E5 G5 E4 G4 C5 E5 G4 C5 E5 C5', 'E4 A4 C5 E5 A4 C5 E5 A5 E4 A4 C5 E5 A4 C5 E5 C5', 'F4 A4 C5 F5 A4 C5 F5 A5 F4 A4 C5 F5 A4 C5 F5 C5', 'G4 B4 D5 G5 B4 D5 G5 B5 G4 B4 D5 G5 F5 D5 B4 G4'],
        pad: [H('E4', 16), H('E4', 16), H('F4', 16), H('D4', 16)],
        brass: ['G5 - - - E5 - - - C6 - - - G5 - - -', 'A5 - - - E5 - - - C6 - - - A5 - - -', 'F5 - - - A5 - - - C6 - - - F6 - - -', 'D6 - - - B5 - - - G5 - - - . . . .', 'G5 - - - E5 - - - C6 - - - E6 - - -', 'E6 - - - D6 - C6 - A5 - - - . . . .', 'F5 - - - A5 - - - C6 - - - A5 - F5 -', 'G5 - - - - - - - D6 - - - B5 - - -'],
        drums: ['k...k...k...k...', '....c.......c...', '..o...o...o...o.', 'z.z.z.z.z.z.z.z.'] },
    },
    form: ['F', 'A', 'A'],
  });

  // ---------- ARENA · rock de estadio con pisotones y palmas (La menor)
  const aGuit = ['A3 A3 . A3 A3 . A3 . G3 G3 . G3 G3 . G3 .', 'F3 F3 . F3 F3 . F3 . G3 G3 . G3 E3 . E3 .'];
  const aDr = ['k...k...k...k...', '....c.......c...', '....s.......s...', 'h.h.h.h.h.h.h.h.'];
  SONGS.arena = mkSong({
    gain: 1.38, bpm: 150, pump: 0.25, echo: 0.5,
    ch: {
      bass: { type: 'bass', vol: 0.36, gate: 0.6, cut: 900 },
      gt1: { type: 'supersq', vol: 0.05, gate: 0.6, cut: 1800, pan: -0.35 },
      gt2: { type: 'saw', vol: 0.04, gate: 0.6, cut: 1600, pan: 0.35 },
      lead: { type: 'saw', vol: 0.08, gate: 0.9, cut: 3600, fx: 0.3 },
    },
    parts: {
      I: { bars: 4, drums: ['k.k.....k.k.....', '....c.......c...', '', '', riser(4)] },
      A: { bars: 8, bass: ['A1 . A1 . A1 . A1 . G1 . G1 . G1 . G1 .', 'F1 . F1 . F1 . F1 . G1 . G1 . E1 . E1 .'], gt1: aGuit, gt2: aGuit.map((b) => b.replace(/([A-G]#?)3/g, '$14')),
        lead: ['A4 - C5 - E5 - - - D5 - C5 - D5 - - -', 'C5 - - - A4 - - - B4 - G#4 - E4 - - -', 'A4 - C5 - E5 - - - G5 - E5 - D5 - - -', 'C5 - D5 - E5 - - - . . . . . . . .', 'A5 - - - G5 - E5 - G5 - - - A5 - - -', 'F5 - - - E5 - D5 - E5 - - - - - . .', 'A5 - - - B5 - C6 - B5 - - - G5 - - -', 'A5 - - - - - - - G#5 - - - E5 - - -'],
        drums: [...aDr, 'r'.padEnd(128, '.')], fill: ['k...k...k...k.k.', '....c.......c...', '....s.......ssss', 'h.h.h.h.mmmmmmmm'] },
      B: { bars: 8, bass: ['F1 . F1 . F1 . F1 . C2 . C2 . C2 . C2 .', 'G1 . G1 . G1 . G1 . E1 . E1 . E1 . E1 .'],
        gt1: ['F3 F3 . F3 F3 . F3 . C4 C4 . C4 C4 . C4 .', 'G3 G3 . G3 G3 . G3 . E3 E3 . E3 E3 . E3 .'], gt2: ['C4 C4 . C4 C4 . C4 . G4 G4 . G4 G4 . G4 .', 'D4 D4 . D4 D4 . D4 . B3 B3 . B3 B3 . B3 .'],
        lead: ['C6 - - - - - A5 - G5 - - - E5 - - -', 'D5 - - - E5 - - - G#5 - - - B5 - - -', 'C6 - - - - - A5 - G5 - - - E5 - G5 -', 'B5 - - - - - - - G#5 - - - . . . .'],
        drums: [...aDr, 'o.o.o.o.o.o.o.o.'] },
      C: { bars: 4, bass: ['A1 - - - - - - - . . . . . . . .'],
        drums: ['k...k.......k...', '....c.......c...'], fill: ['k...k.......k...', '....c.......cccc', '', '', 'w...............'] },
    },
    form: ['I', 'A', 'B', 'A', 'C', 'B', 'A'],
  });

  // ---------- PUEBLO NEVADO · vals invernal con cascabeles (Re mayor, 3/4)
  const wBass = ['D2 - - . . . A2 - - . . .', 'G2 - - . . . D2 - - . . .', 'E2 - - . . . A2 - - . . .', 'D2 - - . . . A1 - - . . .'];
  const wHarp = ['. . F#4 . A4 . . . F#4 . A4 .', '. . G4 . B4 . . . G4 . B4 .', '. . G4 . B4 . . . E4 . C#5 .', '. . F#4 . A4 . . . E4 . C#5 .'];
  const wDr = ['k...........', '....h...h...', 'z.z.z.z.z.z.'];
  SONGS.snow = mkSong({
    gain: 1.75, bpm: 116, steps: 12, pump: 0.2, echo: 0.5,
    ch: {
      bass: { type: 'bass', vol: 0.3, gate: 0.7, cut: 800 },
      harp: { type: 'pluck', vol: 0.05, decay: 0.3, fx: 0.3, pan: 0.3 },
      pad: { type: 'pad', vol: 0.05, cut: 1300, pan: -0.3 },
      bell: { type: 'bell', vol: 0.09, decay: 0.6, fx: 0.35 },
      flute: { type: 'saw', vol: 0.06, gate: 0.9, cut: 2000, fx: 0.3, att: 0.03 },
    },
    parts: {
      I: { bars: 4, harp: wHarp, pad: [H('F#4', 12), H('G4', 12), H('E4', 12), H('F#4', 12)], drums: ['', '', 'z.z.z.z.z.z.'] },
      A: { bars: 8, bass: wBass, harp: wHarp, pad: [H('F#4', 12), H('G4', 12), H('E4', 12), H('F#4', 12)],
        bell: ['F#5 - - - - - A5 - - G5 - -', 'B5 - - - - - D5 - - - - -', 'E5 - - F#5 - - G5 - - B5 - -', 'A5 - - - - - . . . . . .', 'D6 - - - - - C#6 - - B5 - -', 'A5 - - - - - F#5 - - - - -', 'G5 - - E5 - - C#5 - - E5 - -', 'D5 - - - - - . . . . . .'],
        drums: [...wDr, 'r'.padEnd(96, '.')] },
      B: { bars: 8, bass: ['B1 - - . . . F#2 - - . . .', 'G2 - - . . . D2 - - . . .', 'E2 - - . . . B1 - - . . .', 'A1 - - . . . E2 - - . . .'], harp: ['. . D4 . F#4 . . . D4 . F#4 .', '. . D4 . G4 . . . D4 . G4 .', '. . E4 . G4 . . . E4 . G4 .', '. . C#4 . E4 . . . C#4 . G4 .'],
        pad: [H('D4', 12), H('D4', 12), H('E4', 12), H('C#4', 12)],
        flute: ['B5 - - - - - A5 - - F#5 - -', 'G5 - - - - - D5 - - - - -', 'E5 - - G5 - - B5 - - A5 - -', 'A5 - - - - - G5 - - E5 - -', 'B5 - - - - - D6 - - C#6 - -', 'B5 - - - - - G5 - - - - -', 'G5 - - F#5 - - E5 - - G5 - -', 'A5 - - - - - . . . . . .'],
        drums: [...wDr, 'o.....o.....'] },
      C: { bars: 4, harp: wHarp, bell: ['A5 . . F#5 . . D5 . . F#5 . .', 'B5 . . G5 . . D5 . . G5 . .', 'C#6 . . A5 . . E5 . . A5 . .', 'D6 - - - - - . . . . . .'], drums: ['', '', 'z.z.z.z.z.z.'] },
    },
    form: ['I', 'A', 'B', 'A', 'C', 'B', 'A'],
  });

  // ---------- CUARTO DE JUGUETES · caja de música con bossa de juguete (Sol mayor)
  const yBass = ['G2 . . D3 . . G2 . D2 . . G2 . . D3 .', 'C3 . . G2 . . C3 . D3 . . A2 . . D3 .'];
  const yBox = ['B5 . D6 . G6 . D6 . B5 . D6 . A5 . B5 .', 'C6 . E6 . G6 . E6 . D6 . C6 . B5 . A5 .', 'B5 . D6 . G6 . A6 . B6 . A6 . G6 . D6 .', 'E6 . C6 . A5 . F#5 . G5 . . . . . . .'];
  const yDr = ['k.....k.....k...', '..i...i.....i...', 'z.z.z.z.z.z.z.z.'];
  SONGS.toy = mkSong({
    gain: 1.88, bpm: 100, swing: 0.1, pump: 0.2, echo: 0.75,
    ch: {
      bass: { type: 'bass', vol: 0.3, gate: 0.6, cut: 900 },
      box: { type: 'bell', vol: 0.08, decay: 0.5, fx: 0.3, pan: 0.15 },
      xylo: { type: 'pluck', vol: 0.05, decay: 0.16, pan: -0.3 },
      pad: { type: 'pad', vol: 0.035, cut: 1200, pan: 0.3 },
    },
    parts: {
      I: { bars: 4, box: yBox, drums: ['', '', ''] },
      A: { bars: 8, bass: yBass, box: yBox, pad: [H('B4', 16), H('C5', 16)],
        drums: [...yDr, 'b'.padEnd(64, '.')] },
      B: { bars: 8, bass: ['E2 . . B2 . . E2 . B1 . . E2 . . B2 .', 'C3 . . G2 . . C3 . D3 . . A2 . . D3 .'],
        xylo: ['G5 . B5 . E6 . B5 . G5 . B5 . E6 . D6 .', 'E6 . C6 . G5 . C6 . F#6 . D6 . A5 . D6 .', 'G5 . B5 . E6 . G6 . F#6 . E6 . D6 . B5 .', 'C6 . A5 . E5 . A5 . D6 . . . . . . .'],
        box: ['E6 - - - - - - - D6 - - - B5 - - -', 'C6 - - - E6 - - - D6 - - - - - - -', 'G6 - - - F#6 - - - E6 - - - D6 - - -', 'C6 - - - - - - - D6 - - - - - - -'],
        pad: [H('G4', 16), H('E4', 16), H('G4', 16), H('F#4', 16)], drums: yDr },
      C: { bars: 4, box: ['G5 . . . B5 . . . D6 . . . G6 . . .', 'E6 . . . C6 . . . A5 . . . F#5 . . .'], xylo: ['. . D5 . . . D5 . . . D5 . . . D5 .'], drums: ['', '', 'z.z.z.z.z.z.z.z.'], fill: ['', '', 'z.z.z.z.z.z.z.z.', 'w...............'] },
    },
    form: ['I', 'A', 'B', 'A', 'C', 'B', 'A'],
  });
  SONGS.rally = SONGS.lax;
})();

