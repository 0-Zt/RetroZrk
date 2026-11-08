// =====================================================================
//  JUEGO 1 · GAS RALLY — gira mundial
//  Garaje con tienda (autos, mejoras de taller y pinturas especiales pagadas con
//  monedas) → mapa mundial con avión → modo GIRA (ciudades de 3 rondas que se
//  desbloquean en orden) o modo DUELO (carrera por bidones contra un rival).
//  Mecánicas: 10 bidones (puntaje creciente), bidón S duplica, bidón L da bono,
//  gas aturdidor, patrullas con IA (BFS), interceptor rápido, ítems de la calle
//  (nitro, imán, escudo, aceite), tráfico civil, avenidas de dos pistas y vida
//  propia en cada ciudad (temblor en Santiago, cruce peatonal y derrape en Tokio).
// =====================================================================
const Rally = (() => {
  const TS = 16, NXC = 11, NYC = 12, MW = 45, MH = 38;
  const NX = (i) => 2 + i * 4, NY = (j) => 2 + j * 3;
  const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
  const ROT = [0, -Math.PI / 2, Math.PI, Math.PI / 2];
  const ROUNDS = 3, BASE_SPEED = 82, MAPTOP = 13, DUEL_CANS = 11, DUEL_WIN = 6;
  const wrapA = (a) => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };

  // ---------------- autos (diseños propios inspirados en estilos de época)
  const CARS = [
    { id: 'bolido', name: 'BÓLIDO GT', desc: 'El clásico del rally: parejo en todo.', vel: 3, giro: 3, tanque: 3, gas: 3, neon: 0.55, price: 0,
      colors: [
        { n: 'AZUL', b: '#2f6ff2', l: '#7fb0ff', d: '#1c44a6', s: '#f2f5ff' },
        { n: 'NARANJO', b: '#ff8a1e', l: '#ffc070', d: '#b85a10', s: '#1b1424' },
        { n: 'VERDE', b: '#2fbf5a', l: '#8ff0a0', d: '#1a7a3a', s: '#f2f5ff' },
        { n: 'BLANCO', b: '#e4e6f0', l: '#ffffff', d: '#9a9ab0', s: '#2f6ff2' }],
      special: { n: 'ORO', b: '#e8b830', l: '#fff2a0', d: '#a0700c', s: '#1b1424', fx: 'gold' } },
    { id: 'rayo', name: 'RAYO 90', desc: 'Coupé turbo noventero con neón. El más rápido.', vel: 5, giro: 3, tanque: 2, gas: 3, neon: 1, price: 700,
      colors: [
        { n: 'MORADO', b: '#5a3fa8', l: '#9b82e8', d: '#33246a', s: '#ff6ec7' },
        { n: 'PERLA', b: '#e8eaf2', l: '#ffffff', d: '#a0a6b8', s: '#ff3355' },
        { n: 'PLATA', b: '#9aa3b4', l: '#d6dce6', d: '#5f6778', s: '#5ff2ff' },
        { n: 'AZUL', b: '#2d5fd0', l: '#7fa6ff', d: '#1b3a8a', s: '#ffd23f' }],
      special: { n: 'NEÓN', b: '#1a1430', l: '#4fe3ff', d: '#0a0818', s: '#ff4f9a', fx: 'neon' } },
    { id: 'roadster', name: 'ROADSTER 65', desc: 'Descapotable clásico. Dobla como ninguno.', vel: 4, giro: 5, tanque: 2, gas: 2, neon: 0.5, price: 300,
      colors: [
        { n: 'AZUL', b: '#2f5fd6', l: '#7fa0ff', d: '#1b3a8a', s: '#f4f4fa' },
        { n: 'VINO', b: '#b5283a', l: '#e8667a', d: '#7a1424', s: '#f4f4fa' },
        { n: 'VERDE', b: '#1f6a44', l: '#4fae78', d: '#0f3f28', s: '#f2e2a0' },
        { n: 'PLATA', b: '#b8c0cc', l: '#e8eef6', d: '#7a8290', s: '#2f5fd6' }],
      special: { n: 'CROMO', b: '#c8d0dc', l: '#ffffff', d: '#6a7488', s: '#4fe3ff', fx: 'chrome' } },
    { id: 'muscle', name: 'MUSCLE 70', desc: 'V8 pesado: tanque grande, pero dobla lento.', vel: 4, giro: 2, tanque: 4, gas: 4, neon: 0.6, price: 450,
      colors: [
        { n: 'AMARILLO', b: '#ffd23f', l: '#fff09a', d: '#c49a10', s: '#1b1424' },
        { n: 'NARANJO', b: '#ff6a1e', l: '#ffaa6a', d: '#b8400a', s: '#f4f4fa' },
        { n: 'NEGRO', b: '#2e2e3c', l: '#5a5a70', d: '#141420', s: '#ff3355' },
        { n: 'LIMA', b: '#8ae03a', l: '#c8ff8a', d: '#4a8a14', s: '#1b1424' }],
      special: { n: 'LLAMAS', b: '#1b1a26', l: '#4a4a5e', d: '#0a0a12', s: '#ff8a1e', fx: 'flames' } },
    { id: 'pulga', name: 'PULGA', desc: 'Chiquito y ahorrador. La bencina le dura harto.', vel: 2, giro: 4, tanque: 5, gas: 4, neon: 0.45, price: 0,
      colors: [
        { n: 'CELESTE', b: '#6ad0f0', l: '#b8f0ff', d: '#2a8ab0', s: '#ffffff' },
        { n: 'MENTA', b: '#7fe0b0', l: '#c8ffe0', d: '#3a9a70', s: '#ffffff' },
        { n: 'ROSADO', b: '#ff8ac0', l: '#ffc8e0', d: '#c04a80', s: '#ffffff' },
        { n: 'AMARILLO', b: '#ffd84a', l: '#fff2a0', d: '#c09a10', s: '#1b1424' }],
      special: { n: 'GALAXIA', b: '#2a1a5a', l: '#5a3ab8', d: '#140a30', s: '#ff9ae0', fx: 'galaxy' } },
  ];
  const carIdx = (id) => CARS.findIndex((c) => c.id === id);
  const GASES = [
    { n: 'BLANCO', c: '#ffffff', neon: '#b8c8ff' },
    { n: 'ROSA', c: '#ff6ec7', neon: '#ff6ec7' },
    { n: 'CIAN', c: '#5ff2ff', neon: '#5ff2ff' },
    { n: 'VERDE', c: '#9dff6a', neon: '#9dff6a' },
  ];
  const UPGS = [['vel', 'MOTOR'], ['tanque', 'TANQUE'], ['giro', 'GIRO']];
  const UPG_PRICE = [120, 250], PAINT_PRICE = 200;
  // equipo para el auto (sirve con cualquier auto): se compra una vez y se puede apagar
  const EQUIP = [
    { id: 'taladro', n: 'TALADRO', price: 600, d: 'Se carga en 8 s. Con carga, choca una patrulla de frente y la sacas 12 s.' },
    { id: 'clavos', n: 'CLAVOS', price: 400, d: 'Ruedas con clavos: no resbalas en aceite, canicas ni hielo, y doblas antes.' },
  ];
  const ITEMS = {
    nitro: { n: 'NITRO', w: 0.3 }, iman: { n: 'IMÁN', w: 0.25 }, escudo: { n: 'ESCUDO', w: 0.25 }, aceite: { n: 'ACEITE', w: 0.2 },
  };
  const rollItem = () => { let p = Math.random(); for (const k in ITEMS) if ((p -= ITEMS[k].w) <= 0) return k; return 'nitro'; };

  // ---------------- ciudades
  const ROOF = {
    teja: { b: '#c45a3c', l: '#e0805e', d: '#8a3a28', t: '#b04e34' }, crema: { b: '#d8c8a0', l: '#f0e4c4', d: '#a08c64', t: '#c8b890' },
    hormigon: { b: '#8a96a8', l: '#b4c0d0', d: '#5a6478', t: '#7c889a' }, ocre: { b: '#e0a050', l: '#f8c880', d: '#a06a28', t: '#d09040' },
    blanco: { b: '#e6e2da', l: '#ffffff', d: '#a8a49c', t: '#d6d2ca' }, pizarra: { b: '#5a6070', l: '#7c8496', d: '#3a3e4a', t: '#50566a' },
    ladrillo: { b: '#8a4a3a', l: '#b06a56', d: '#5a2e24', t: '#7c4234' }, cobre: { b: '#5a9a8a', l: '#86c4b4', d: '#3a6a5e', t: '#50907e' },
    rosa: { b: '#e86a9a', l: '#ff9ac0', d: '#a83a66', t: '#d85e8c' }, amarillo: { b: '#f2c440', l: '#ffe080', d: '#b08a18', t: '#e2b434' },
    turquesa: { b: '#3ab8b0', l: '#7ae0d8', d: '#1e7a74', t: '#32a8a0' }, naranjo: { b: '#e8743a', l: '#ff9e6a', d: '#a8481c', t: '#d86a32' },
    azul: { b: '#5a7ab8', l: '#8aa6e0', d: '#36508a', t: '#506eaa' }, gris: { b: '#7a7e8c', l: '#a2a6b4', d: '#4e5260', t: '#70748a' },
  };
  const MIX_SMALL = [['park', 0.35], ['roof', 0.45], ['plaza', 0.2]];
  const MIX_BIG = [['roof', 0.45], ['park', 0.25], ['plaza', 0.12], ['pool', 0.06], ['parking', 0.12]];
  // paletas del tráfico civil
  const CIV = {
    colectivo: { b: '#1b1a26', l: '#3a3a4c', d: '#0e0e16', s: '#f2c440' },
    redBus: { b: '#e8e8f0', l: '#ffffff', d: '#a0a0b0', s: '#d8202e' },
    porteno1: { b: '#2f6ff2', l: '#7fb0ff', d: '#1c44a6', s: '#ffd23f' },
    porteno2: { b: '#e8743a', l: '#ff9e6a', d: '#a8481c', s: '#f2f2f2' },
    taxiMx: { b: '#e84a8a', l: '#ff8ab8', d: '#a8285e', s: '#f2f2f2' },
    vocho: { b: '#3a8a4a', l: '#6ac07a', d: '#1e5a2a', s: '#f2f2f2' },
    convRed: { b: '#e8383d', l: '#ff8a7a', d: '#9e1d2b', s: '#f4f4fa' },
    convTeal: { b: '#3ab8b0', l: '#7ae0d8', d: '#1e7a74', s: '#f4f4fa' },
    white: { b: '#e6e6ee', l: '#ffffff', d: '#9a9aaa', s: '#3a3a4c' },
    london: { b: '#c8202e', l: '#e84a4a', d: '#8a1420', s: '#e84a4a' },
    cab: { b: '#1b1a26', l: '#3a3a4c', d: '#0e0e16', s: '#2a2a3a' },
    taxiJp: { b: '#3a8a5a', l: '#6ac08a', d: '#1e5a3a', s: '#f2c440' },
  };
  const CITIES = [
    { id: 'scl', code: 'SCL', flag: 'CL', name: 'SANTIAGO', country: 'CHILE', lat: -33.45, lon: -70.67, side: -1, tag: 'Cordillera, jacarandas y palmeras',
      border: 'andes', grass: ['#7fa84a', '#94bc5a', '#64903a'], trees: ['jacaranda', 'jacaranda', 'green', 'palm'], plazaTree: 'palm',
      roofs: ['teja', 'teja', 'crema', 'hormigon', 'ocre'], specials: ['torre', 'cerro'], big: ['estadio'], margin: 84, mixSmall: MIX_SMALL, mixBig: MIX_BIG,
      parked: ['#1b1a26', '#f2c440', '#f2f2f2', '#5ad1e0', '#e05a5a'],
      avenue: { row: 6 }, civ: [['taxi', CIV.colectivo], ['taxi', CIV.colectivo], ['bus', CIV.redBus]], event: 'temblor',
      life: 'Avenida, colectivos y temblores' },
    { id: 'bue', code: 'BUE', flag: 'AR', name: 'BUENOS AIRES', country: 'ARGENTINA', lat: -34.6, lon: -58.38, side: 1, tag: 'Avenidas anchas frente al río',
      border: 'river', water: ['#7a6a4a', '#9a8a68', '#5e5038'], grass: ['#5aa04a', '#72b85a', '#448238'], trees: ['green', 'jacaranda', 'green'], plazaTree: 'green',
      roofs: ['crema', 'blanco', 'gris', 'teja'], specials: ['obelisco'], big: ['estadio', 'puerto'], mixSmall: MIX_SMALL, mixBig: MIX_BIG,
      parked: ['#1b1a26', '#f2c440', '#f2f2f2', '#2f6ff2'], tint: [0xffb070, 0.08],
      avenue: { col: 5 }, civ: [['bus', CIV.porteno1], ['bus', CIV.porteno2], ['taxi', CIV.colectivo]], life: 'Avenida ancha y colectivos' },
    { id: 'mex', code: 'MEX', flag: 'MX', name: 'CIUDAD DE MÉXICO', country: 'MÉXICO', lat: 19.43, lon: -99.13, side: -1, tag: 'Volcanes y techos de colores',
      border: 'volcano', grass: ['#6aa448', '#82bc5a', '#528836'], trees: ['jacaranda', 'green', 'palm'], plazaTree: 'jacaranda',
      roofs: ['rosa', 'amarillo', 'turquesa', 'naranjo', 'teja'], specials: ['zocalo'], big: ['estadio', 'mercado'], mixSmall: MIX_SMALL, mixBig: MIX_BIG,
      parked: ['#e84a8a', '#f2c440', '#f2f2f2', '#3ab8b0'],
      avenue: { row: 4 }, civ: [['taxi', CIV.taxiMx], ['taxi', CIV.taxiMx], ['sedan', CIV.vocho]], life: 'Avenida y taxis rosados' },
    { id: 'lax', code: 'LAX', flag: 'US', name: 'LOS ÁNGELES', country: 'EE. UU.', lat: 34.05, lon: -118.24, side: -1, tag: 'Piscinas, palmeras y atardecer',
      border: 'hills', grass: ['#7ab84e', '#92cc62', '#5e9a3c'], trees: ['palm', 'palm', 'green'], plazaTree: 'palm',
      roofs: ['blanco', 'crema', 'teja', 'azul'], specials: [], big: ['autocine', 'estadio'], mixSmall: MIX_SMALL,
      mixBig: [['roof', 0.35], ['pool', 0.3], ['park', 0.15], ['parking', 0.2]],
      parked: ['#f2f2f2', '#1b1a26', '#e05a5a', '#ffd23f', '#5ad1e0'], tint: [0xff7a40, 0.12],
      avenue: { row: 8 }, civ: [['convertible', CIV.convRed], ['convertible', CIV.convTeal], ['sedan', CIV.white]], life: 'Boulevard y descapotables' },
    { id: 'lon', code: 'LON', flag: 'UK', name: 'LONDRES', country: 'REINO UNIDO', lat: 51.5, lon: -0.13, side: 1, tag: 'Lluvia, ladrillo y buses rojos',
      border: 'river', water: ['#3a5a7a', '#5a7a9a', '#2a4460'], grass: ['#4a8a4a', '#5ea05a', '#3a7038'], trees: ['darkgreen', 'green'], plazaTree: 'darkgreen',
      roofs: ['pizarra', 'ladrillo', 'gris', 'cobre'], specials: [], big: ['estadio'], bridge: true, mixSmall: MIX_SMALL, mixBig: MIX_BIG,
      parked: 'bus', rain: true, tint: [0x5a6a8a, 0.18],
      civ: [['bus', CIV.london], ['bus', CIV.london], ['taxi', CIV.cab]], drift: true, drive: 'L', life: 'Curvas mojadas para derrapar' },
    { id: 'tyo', code: 'TYO', flag: 'JP', name: 'TOKIO', country: 'JAPÓN', lat: 35.68, lon: 139.69, side: -1, tag: 'Noche de neón y cerezos',
      border: 'sea', water: ['#1a3a6a', '#2f5a9a', '#10284a'], grass: ['#4f9a5a', '#66b070', '#3a7a44'], trees: ['sakura', 'sakura', 'green'], plazaTree: 'sakura',
      roofs: ['gris', 'azul', 'blanco', 'pizarra'], specials: [], big: ['domo', 'templo'], mixSmall: MIX_SMALL, mixBig: MIX_BIG,
      parked: ['#f2f2f2', '#1b1a26', '#ffd23f', '#5ad1e0'], night: true, neon: true,
      avenue: { row: 5, col: 5 }, scramble: true, drift: true, drive: 'L',
      civ: [['taxi', CIV.cab], ['taxi', CIV.taxiJp], ['sedan', CIV.white]], life: 'Derrape y gran cruce peatonal' },
  ];
  // pistas especiales: se compran con monedas (o se abren con equipo) y se juegan aparte de la gira
  const TRACKS = [
    { id: 'arena', code: 'SHW', kind: 'arena', name: 'ARENA SHOW', country: 'PISTA ESPECIAL', tag: 'Rampas, aros de fuego y monster trucks', price: 500, lvl: 3, rounds: 1,
      loops: 0.62, margin: 56, civ: [], specials: [], life: 'Show de 90 segundos', song: 'arena' },
    { id: 'nieve', code: 'SNW', kind: 'snow', name: 'PUEBLO NEVADO', country: 'PISTA ESPECIAL', tag: 'Hielo, avalanchas y quitanieves', price: 0, need: 'clavos', lvl: 3, rounds: 3,
      margin: 48, civ: [['plow', null], ['sedan', { b: '#e6e6ee', l: '#ffffff', d: '#9a9aaa', s: '#3a3a4c' }]], specials: [], life: 'Hielo y avalanchas', song: 'snow' },
    { id: 'cuarto', code: 'TOY', kind: 'toy', name: 'CUARTO DE JUGUETES', country: 'PISTA ESPECIAL', tag: 'Alfombra, tren, canicas y un gato', price: 700, lvl: 4, rounds: 3,
      margin: 64, civ: [['convertible', { b: '#ffd23f', l: '#fff09a', d: '#c49a10', s: '#e8383d' }]], specials: [], life: 'Tren, canicas y el gato', song: 'toy' },
  ];
  const NC = CITIES.length, ALLC = CITIES.concat(TRACKS);
  const curC = () => ALLC[S.city];
  const lvl = () => { const c = ALLC[S.city]; return c && c.lvl != null ? c.lvl : S.city; };
  const roundsOf = () => (ALLC[S.city] && ALLC[S.city].rounds) || ROUNDS;
  // lo propio de cada ciudad (se muestra en la pantalla de carga)
  const FEATS = {
    scl: ['Avenida de dos pistas con colectivos y micros', 'Temblores: las patrullas pierden el control unos segundos'],
    bue: ['Avenida ancha de norte a sur', 'Colectivos: si los topas, te frenan'],
    mex: ['Avenida con taxis rosados', 'Más barreras en las calles'],
    lax: ['Boulevard con descapotables', 'Piscinas y calles largas para escapar'],
    lon: ['Curvas mojadas: el auto derrapa', 'Sal del derrape y ganas un mini turbo'],
    tyo: ['Curvas para derrapar y mini turbo', 'Gran cruce: cuando cruzan peatones, todos frenan'],
    arena: ['Rampas: en el aire nadie te atrapa', 'Aro de fuego: +500. Saltar sobre un monster: +400', 'No pierdes autos: cada choque resta 10 segundos'],
    nieve: ['Hielo: las patrullas no pueden doblar (tú sí, con clavos)', 'Montículos que frenan; el quitanieves los limpia', 'Avalanchas: cortan una calle unos segundos'],
    cuarto: ['Pilas en vez de bidones y regalos con ítem', 'El tren pasa: espera cuando baja la barrera', 'Canicas que ruedan y la pata del gato'],
  };
  // cada policía suena distinto: Londres con dos tonos, Tokio con su sirena lenta, el cuarto con una de juguete
  const SIREN_OF = { scl: 'wail', bue: 'yelp', mex: 'yelp', lax: 'wail', lon: 'hilo', tyo: 'jp', arena: 'yelp', nieve: 'wail', cuarto: 'toy' };
  // los bidones suben por la escala mayor: el décimo suena una octava y media más arriba que el primero
  const CAN_STEP = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16];
  const canRate = (k) => Math.pow(2, CAN_STEP[clamp(k - 1, 0, 9)] / 12);
  const panX = (x) => clamp((x - camX - Engine.W / 2) / (Engine.W * 0.55), -0.85, 0.85);
  const TIPS = [
    'El gas aturde a todas las patrullas que lo tocan, no solo a una.',
    'Junta bidones seguidos para hacer combo y ganar más.',
    'Pasa raspando una patrulla sin chocar: da puntos y monedas.',
    'Las patrullas moradas doblan al azar y a veces chocan barreras.',
    'Las naranjas te cortan el paso: no vayas derecho hacia ellas.',
    'Las verdes cuidan su zona: si te alejas, vuelven a su esquina.',
    'Cada cierto rato las patrullas se dispersan unos segundos.',
    'Con escudo puedes romper una barrera o aguantar un choque.',
    'El bidón S duplica los puntos: búscalo primero en el radar.',
    'Las flechas del borde marcan el bidón más cercano y las patrullas.',
    'En la ronda 3 escapa del foco del helicóptero: si te ilumina, todas te ven.',
    'Si las patrullas te alcanzan, mejora el motor en el taller.',
  ];
  // misiones: siempre hay 3 activas; al cumplir una se paga y aparece otra
  const MISSIONS = {
    gas: { t: 'Aturde {n} patrullas con gas', n: 12, c: 50 },
    oil: { t: 'Haz resbalar {n} patrullas con aceite', n: 4, c: 60 },
    cans: { t: 'Junta {n} bidones', n: 40, c: 50 },
    combo: { t: 'Haz un combo ×{n}', n: 4, c: 60, max: true },
    near: { t: 'Pasa raspando {n} patrullas', n: 8, c: 60 },
    nitro: { t: 'Usa {n} nitros', n: 4, c: 40 },
    rocks: { t: 'Rompe {n} barreras con escudo', n: 2, c: 70 },
    boxes: { t: 'Abre {n} cajas de ítem', n: 10, c: 40 },
    duel: { t: 'Gana {n} duelos', n: 2, c: 100 },
    clean: { t: 'Termina una ciudad sin chocar', n: 1, c: 120 },
    heli: { t: 'Escapa del helicóptero {n} veces', n: 2, c: 90 },
    icp: { t: 'Aturde al interceptor {n} veces', n: 2, c: 80, need: 2 },
    boost: { t: 'Sal de {n} derrapes con mini turbo', n: 12, c: 70, need: 5 },
    drill: { t: 'Taladra {n} patrullas', n: 4, c: 90, eq: 'taladro' },
  };
  // logros (con porcentaje en su pantalla)
  const ACHS = [
    ['city1', 'Primera parada', 'Completa Santiago.'],
    ['tour', 'Vuelta al mundo', 'Completa la gira hasta Tokio.'],
    ['master', 'Maestro del volante', 'Completa Tokio en dificultad Maestro.'],
    ['stars', 'Cielo estrellado', 'Las 3 estrellas en una ciudad.'],
    ['allstars', 'Constelación', 'Las 3 estrellas en las 6 ciudades.'],
    ['clean', 'Sin un rasguño', 'Termina una ciudad sin chocar.'],
    ['combo6', 'Combo loco', 'Haz un combo ×6.'],
    ['heli', 'Bajo el radar', 'Escapa sin que el foco te ilumine.'],
    ['final', 'Gran final', 'Escapa de los dos helicópteros de Tokio.'],
    ['duel', 'Duelista', 'Gana un duelo.'],
    ['duels', 'Rey del duelo', 'Gana un duelo en cada ciudad.'],
    ['cars', 'Coleccionista', 'Ten los 5 autos.'],
    ['equip', 'Bien equipado', 'Compra un equipo en el taller.'],
    ['drill', 'Perforador', 'Taladra una patrulla.'],
    ['track', 'Pista propia', 'Abre una pista especial.'],
    ['ring', 'Aro de fuego', 'Salta por un aro de fuego.'],
    ['jumpover', 'Por encima', 'Salta sobre un monster truck.'],
    ['arena', 'Estrella del show', '3 estrellas en la arena.'],
    ['snow', 'Rey del hielo', 'Completa el pueblo nevado.'],
    ['toy', 'Juguetero', 'Completa el cuarto de juguetes.'],
    ['paw', 'Gato aliado', 'Que el gato aturda a una patrulla.'],
    ['rich', 'Millonario', 'Junta 2000 monedas.'],
    ['score', 'Cien mil', 'Haz 100.000 puntos en una gira.'],
    ['top', 'Salón de la fama', 'Entra a los 10 mejores.'],
  ];
  const mText = (m) => MISSIONS[m.id].t.replace('{n}', MISSIONS[m.id].n);
  // patrullas: cada una con su forma de perseguir (y su color)
  const PTYPES = [
    { n: 'Perseguidora', d: 'Va directo hacia ti.' },
    { n: 'Cortadora', d: 'Apunta a donde vas a estar y te corta el paso.' },
    { n: 'Vigilante', d: 'Cuida su zona; si te alejas, vuelve a su esquina.' },
    { n: 'Errática', d: 'Dobla al azar y a veces choca barreras.' },
  ];
  const PORDER = [0, 1, 2, 3, 0, 1, 0, 2];
  const PAR = 210;
  // patrullas por ronda en cada ciudad (dificultad NORMAL); sube despacio, como en el Rally-X original
  const POLICE = { scl: [2, 3, 3], bue: [3, 3, 3], mex: [3, 4, 4], lax: [4, 4, 5], lon: [4, 5, 5], tyo: [5, 5, 6], arena: [4], nieve: [3, 4, 4], cuarto: [3, 4, 5] };
  const diff = () => clamp(Store.get('rally_diff', 1), 0, Store.get('rally_done', 0) ? 3 : 2);   // 0 fácil · 1 normal · 2 difícil · 3 maestro (al terminar la gira)
  function policeCount() {
    if (S.mode === 'duel') return diff() === 0 ? 1 : 2;
    return clamp(POLICE[curC().id][S.round] + Math.min(S.loop, 2) + diff() - 1, 1, 8);
  }
  // velocidad base: 72 px/s en Santiago hasta 82 (= Bólido) en Tokio; la segunda vuelta al mundo suma un poco
  function policeSpeed() {
    const L = lvl() * 3 + S.round;
    const k = Math.min(1 + 0.04 * S.loop, 0.88 + 0.008 * L + 0.04 * S.loop);
    return BASE_SPEED * k * [0.9, 1, 1.08, 1.13][diff()] * (S.mode === 'duel' ? 0.95 : 1);
  }   // tiempo para la tercera estrella (segundos jugando la ciudad)
  // rivales del modo duelo (uno por ciudad, cada vez más hábil)
  const RIVALS = {
    scl: { name: 'LA JOYITA', car: 'muscle', c: 2 }, bue: { name: 'EL TANO', car: 'roadster', c: 1 },
    mex: { name: 'LA GÜERA', car: 'pulga', c: 3 }, lax: { name: 'MR. SUNSET', car: 'muscle', c: 0 },
    lon: { name: 'LORD DRIFT', car: 'bolido', c: 2 }, tyo: { name: 'KAZE', car: 'rayo', c: 1 },
  };

  let A = null, scene = null, world = null, parts = null, skid = null, mapSpr = null, mapTex = null, nightOv = null, tintOv = null;
  let flagSpr = null;
  const flagImg = {}, iconImg = {};
  const flagURL = (code) => flagImg[code] || (flagImg[code] = flagField(code).toDataURL());
  const iconURL = (k) => iconImg[k] || (iconImg[k] = itemIconCanvas(k).toDataURL());
  let carved = [];
  let grid = null, rockAt = null, avLane = new Int8Array(MW * MH), laneDir = new Int8Array(MW * MH).fill(-1), bends = new Map();
  let cans = [], enemies = [], smokes = [], clouds = [], popups = [], glows = [], player = null, icp = null, rival = null;
  let boxes = [], slicks = [], civs = [], peds = [], lights = [], arrows = [], heli = null, heli2 = null, goalSpr = null;
  const distA = new Int16Array(MW * MH), distB = new Int16Array(MW * MH), distV = new Int16Array(MW * MH), distC = new Int16Array(MW * MH);
  let lastPT = -1, lastVT = -1;
  let startTile = [0, 0], rivalTile = [0, 0], enemyStarts = [];
  let gScene = null, G = {}, mScene = null, M = {};
  const S = { coins: Store.get('rally_coins', 0), mapMode: 'tour' };
  let radarCanvas = null, rctx = null, hud = {}, hudCache = {};
  const sel = Object.assign({ m: 0, c: 0, g: 0 }, Store.get('rally_car', {}));
  if (!CARS[sel.m]) sel.m = 0;
  // ---------------- tienda: autos comprados, mejoras y pinturas
  const owned = new Set(Store.get('rally_owned', null) || ['bolido', 'pulga', CARS[sel.m].id]);
  const eqOwned = Store.get('rally_equip', {}), eqOff = Store.get('rally_eqoff', {});
  const hasEq = (id) => !!eqOwned[id];
  const eqOn = (id) => hasEq(id) && !eqOff[id];
  const tracksBought = new Set(Store.get('rally_tracks', []));
  const trackOpen = (i) => freeMode() || (TRACKS[i].price ? tracksBought.has(TRACKS[i].id) : !TRACKS[i].need || hasEq(TRACKS[i].need));
  Store.set('rally_owned', [...owned]);
  const upg = Store.get('rally_upg', {});
  const paints = Store.get('rally_paint', {});
  const upOf = (id) => upg[id] || (upg[id] = { vel: 0, tanque: 0, giro: 0 });
  const statOf = (m, k) => Math.min(7, CARS[m][k] + (k === 'gas' ? 0 : upOf(CARS[m].id)[k] || 0));
  const palOf = (m, c) => (c >= 4 ? CARS[m].special : CARS[m].colors[c]);
  const selReady = () => owned.has(CARS[sel.m].id) && (sel.c < 4 || !!paints[CARS[sel.m].id]);
  const carCache = {};
  function carTex(m, c) {
    const k = m + ':' + c;
    if (!carCache[k]) carCache[k] = [0, 1].map((f) => T(playerCarCanvas(CARS[m].id, palOf(m, c), f)));
    return carCache[k];
  }
  const realUnlocked = () => clamp(Store.get('rally_unlocked', 1), 1, CITIES.length);
  const freeMode = () => !!Store.get('rally_free', false);
  const unlocked = () => (freeMode() ? CITIES.length : realUnlocked());
  const clearedMask = () => Store.get('rally_cleared', 0);
  const hiNow = () => (S.inTrack ? (Store.get('rally_best', {})[curC().id] || {}).score || 0 : S.hi || 0);
  const fmtT = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  const starsOf = (id) => Store.get('rally_stars', {})[id] || 0;
  const starStr = (mask) => [1, 2, 4].map((b) => (mask & b ? '★' : '☆')).join('');
  function missionList() {
    let ms = Store.get('rally_missions', null);
    if (!ms || !Array.isArray(ms.list)) ms = { list: [], done: 0 };
    ms.list = ms.list.filter((m) => MISSIONS[m.id]);
    while (ms.list.length < 3) {
      const pool = Object.keys(MISSIONS).filter((k) => !ms.list.some((m) => m.id === k) && realUnlocked() >= (MISSIONS[k].need || 0) && k !== ms.last && (!MISSIONS[k].eq || hasEq(MISSIONS[k].eq)));
      ms.list.push({ id: pool[(Math.random() * pool.length) | 0], n: 0 });
    }
    Store.set('rally_missions', ms);
    return ms;
  }
  function mission(id, amount = 1) {
    const ms = missionList();
    let changed = false;
    for (let i = 0; i < ms.list.length; i++) {
      const m = ms.list[i], def = MISSIONS[m.id];
      if (m.id !== id) continue;
      m.n = def.max ? Math.max(m.n, amount) : m.n + amount;
      changed = true;
      if (m.n >= def.n) {
        ms.done++; ms.last = m.id;
        ms.list.splice(i, 1); i--;
        S.coins += def.c; Store.set('rally_coins', S.coins); S.coinBump = 0.4;
        UI.toast(`MISIÓN CUMPLIDA · +${def.c} MONEDAS`); Snd.sfx('oneup'); UI.vibrate([30, 40, 30]);
      }
    }
    if (changed) { Store.set('rally_missions', ms); missionList(); }
  }
  const missionsHtml = () => missionList().list.map((m) => `<li>${mText(m)} <b>${Math.min(m.n, MISSIONS[m.id].n)}/${MISSIONS[m.id].n}</b> <em>+${MISSIONS[m.id].c}</em></li>`).join('');
  function addCoins(n, quiet) {
    S.coins = Math.max(0, S.coins + n);
    Store.set('rally_coins', S.coins);
    if (n > 0 && !quiet) { S.coinBump = 0.3; if (n >= 10) Snd.sfx('coin'); }
    if (S.coins >= 2000) ach('rich');
  }

  // ---------------- red de calles con ciclos + avenidas de dos pistas
  function genGrid(r, city) {
    const g = new Uint8Array(MW * MH).fill(1);
    const nx = NXC, ny = NYC;
    const edges = [];
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      if (i < nx - 1) edges.push({ i, j, h: true });
      if (j < ny - 1) edges.push({ i, j, h: false });
    }
    for (let k = edges.length - 1; k > 0; k--) { const m = Math.floor(r() * (k + 1)); [edges[k], edges[m]] = [edges[m], edges[k]]; }
    const par = new Int32Array(nx * ny).map((_, i) => i);
    const find = (a) => { while (par[a] !== a) a = par[a] = par[par[a]]; return a; };
    const deg = new Int32Array(nx * ny);
    const ends = (e) => { const a = e.j * nx + e.i; return [a, e.h ? a + 1 : a + nx]; };
    for (const e of edges) {
      const [a, b] = ends(e);
      const ra = find(a), rb = find(b);
      if (ra !== rb) { par[ra] = rb; e.keep = true; } else e.keep = r() < (city.loops || 0.42);
      if (e.keep) { deg[a]++; deg[b]++; }
    }
    for (const e of edges) {
      if (e.keep) continue;
      const [a, b] = ends(e);
      if (deg[a] < 2 || deg[b] < 2) { e.keep = true; deg[a]++; deg[b]++; }
    }
    // manzanas grandes para estadios y lugares especiales: se quita un nodo y se deja el anillo de calles alrededor
    carved = [];
    const av0 = city.avenue || {}, eKey = new Map(edges.map((e) => [`${e.i},${e.j},${e.h ? 1 : 0}`, e]));
    const setE = (i, j, h, v) => { const e = eKey.get(`${i},${j},${h}`); if (e) e.keep = v; };
    for (const theme of city.big || []) {
      for (let tries = 0; tries < 80; tries++) {
        const i = 1 + ((r() * (nx - 2)) | 0), j = 1 + ((r() * (ny - 3)) | 0);
        if (j === av0.row || i === av0.col || (j === 7 && i >= 4 && i <= 6)) continue;
        if (carved.some((q) => Math.abs(q.i - i) < 3 && Math.abs(q.j - j) < 3)) continue;
        carved.push({ i, j, theme });
        setE(i - 1, j, 1, false); setE(i, j, 1, false); setE(i, j - 1, 0, false); setE(i, j, 0, false);
        setE(i - 1, j - 1, 1, true); setE(i, j - 1, 1, true); setE(i - 1, j + 1, 1, true); setE(i, j + 1, 1, true);
        setE(i - 1, j - 1, 0, true); setE(i - 1, j, 0, true); setE(i + 1, j - 1, 0, true); setE(i + 1, j, 0, true);
        break;
      }
    }
    for (const e of edges) {
      if (!e.keep) continue;
      if (e.h) for (let x = NX(e.i); x <= NX(e.i + 1); x++) g[NY(e.j) * MW + x] = 0;
      else for (let y = NY(e.j); y <= NY(e.j + 1); y++) g[y * MW + NX(e.i)] = 0;
    }
    // avenidas: dos pistas de punta a punta con sentido de tránsito (derecha o izquierda según el país)
    avLane = new Int8Array(MW * MH);
    laneDir = new Int8Array(MW * MH).fill(-1);
    const av = city.avenue || {}, lhs = city.drive === 'L';
    if (av.row != null) {
      const y0 = NY(av.row);
      for (let x = NX(0); x <= NX(NXC - 1); x++) for (let k = 0; k < 2; k++) {
        const i = (y0 + k) * MW + x;
        g[i] = 0; avLane[i] = k + 1; laneDir[i] = (k === 0) !== lhs ? 3 : 1;
      }
    }
    if (av.col != null) {
      const x0 = NX(av.col);
      for (let y = NY(0); y <= NY(NYC - 1); y++) for (let k = 0; k < 2; k++) {
        const i = y * MW + x0 + k;
        g[i] = 0;
        if (avLane[i]) { avLane[i] = 3; laneDir[i] = -1; continue; }
        avLane[i] = k + 1; laneDir[i] = (k === 0) !== lhs ? 2 : 0;
      }
    }
    return g;
  }
  const isRoad = (x, y) => x >= 0 && y >= 0 && x < MW && y < MH && grid[y * MW + x] === 0;
  let blockAt = new Uint8Array(MW * MH);   // cortes temporales (cruces del tren con la barrera abajo)
  const openP = (x, y) => isRoad(x, y) && !blockAt[y * MW + x];
  const openE = (x, y) => isRoad(x, y) && !rockAt[y * MW + x] && !blockAt[y * MW + x];
  function bfs(out, sx, sy) {
    out.fill(9999);
    if (!openE(sx, sy)) return;
    const q = new Int32Array(MW * MH);
    let h = 0, t = 0;
    out[sy * MW + sx] = 0; q[t++] = sy * MW + sx;
    while (h < t) {
      const i = q[h++], x = i % MW, y = (i / MW) | 0, d = out[i] + 1;
      for (let k = 0; k < 4; k++) {
        const nx = x + DX[k], ny = y + DY[k];
        if (!openE(nx, ny)) continue;
        const j = ny * MW + nx;
        if (out[j] > d) { out[j] = d; q[t++] = j; }
      }
    }
  }
  // esquinas en L con brazos rectos: en ciudades de derrape se dibujan y recorren como curvas
  function findBends(city) {
    bends = new Map();
    if (!city.drift) return;
    const straight = (x, y, ax) => {
      if (!isRoad(x, y) || avLane[y * MW + x]) return false;
      const L = isRoad(x - 1, y), Rr = isRoad(x + 1, y), U = isRoad(x, y - 1), D = isRoad(x, y + 1);
      return ax & 1 ? L && Rr && !U && !D : U && D && !L && !Rr;
    };
    const cands = [];
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
      if (!isRoad(x, y) || avLane[y * MW + x]) continue;
      const ds = [0, 1, 2, 3].filter((d) => isRoad(x + DX[d], y + DY[d]));
      if (ds.length !== 2 || (ds[0] & 1) === (ds[1] & 1)) continue;
      const [a, b] = ds;
      if (isRoad(x + DX[a] + DX[b], y + DY[a] + DY[b])) continue;
      if (!straight(x + DX[a], y + DY[a], a) || !straight(x + DX[b], y + DY[b], b)) continue;
      const big = straight(x + 2 * DX[a], y + 2 * DY[a], a) && straight(x + 2 * DX[b], y + 2 * DY[b], b);
      cands.push({ x, y, a, b, big });
    }
    // cada brazo ocupa tramos de medio tile; dos curvas no pueden compartir tramo
    const used = new Set();
    const units = (c, r) => {
      const out = [], cx = c.x * TS + 8, cy = c.y * TS + 8;
      for (const d of [c.a, c.b]) for (let k = 1; k <= r / 8; k++) out.push(`${cx + DX[d] * (k * 8 - 4)},${cy + DY[d] * (k * 8 - 4)}`);
      return out;
    };
    const take = (c, r) => {
      const u = units(c, r);
      if (u.some((k) => used.has(k))) return false;
      u.forEach((k) => used.add(k));
      const tcx = c.x * TS + 8, tcy = c.y * TS + 8;
      bends.set(c.y * MW + c.x, { x: c.x, y: c.y, a: c.a, b: c.b, r, cx: tcx + r * (DX[c.a] + DX[c.b]), cy: tcy + r * (DY[c.a] + DY[c.b]) });
      return true;
    };
    for (const c of cands) if (c.big) take(c, 32);   // primero las curvas largas
    for (const c of cands) if (!bends.has(c.y * MW + c.x)) take(c, 16);
  }
  // punto donde se dibuja algo apoyado en una casilla (en las curvas, sobre el arco)
  function tilePos(x, y) {
    const bd = bends.get(y * MW + x);
    if (!bd) return [x * TS + 8, y * TS + 8];
    const k = bd.r * Math.SQRT1_2;
    return [bd.cx - k * (DX[bd.a] + DX[bd.b]), bd.cy - k * (DY[bd.a] + DY[bd.b])];
  }
  const inCross = (x, y) => !!S.cross && x >= S.cross.ix - 1 && x <= S.cross.ix + 2 && y >= S.cross.iy - 1 && y <= S.cross.iy + 2;

  // ---------------- dibujo de la ciudad (una sola textura)
  const wpick = (list, r) => { let p = r(); for (const [k, w] of list) if ((p -= w) <= 0) return k; return list[list.length - 1][0]; };
  const SK = 96;   // margen dibujado alrededor del mapa (cerros, agua, tribunas…)
  const LANDMARK = new Set(['estadio', 'domo', 'puerto', 'mercado', 'autocine', 'templo']);
  function drawTrack(city, r) {
    const { c, g } = mk(MW * TS + SK * 2, MH * TS + SK * 2);
    g.translate(SK, SK);
    const ice = [];
    if (S.ice) S.ice.forEach((v, i) => v && ice.push(i));
    const spots = RT[city.kind + 'Map'](g, { isRoad, MW, MH, TS, SK, r, ice, railY: S.rail ? S.rail.y : null });
    return { c, spots, flagAt: null };
  }
  function drawCity(city, r) {
    if (city.kind) return drawTrack(city, r);
    const { c, g } = mk(MW * TS + SK * 2, MH * TS + SK * 2);
    g.translate(SK, SK);
    const spots = [];
    if (city.drawSkirt) city.drawSkirt(g, r); else RM.skirt(g, city, rng32(city.id.charCodeAt(0) * 131 + 7), MW * TS, MH * TS, SK);
    const wallAt = (x, y) => !isRoad(x, y);
    const nearRoad = (x, y, d = 1) => { for (let j = -d; j <= d; j++) for (let i = -d; i <= d; i++) if (isRoad(x + i, y + j)) return true; return false; };
    const reg = new Int32Array(MW * MH).fill(-1), regions = [];
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
      if (!wallAt(x, y) || reg[y * MW + x] >= 0) continue;
      const id = regions.length, tiles = [], st = [[x, y]];
      let border = false;
      reg[y * MW + x] = id;
      while (st.length) {
        const [a, b] = st.pop();
        tiles.push([a, b]);
        if (a === 0 || b === 0 || a === MW - 1 || b === MH - 1) border = true;
        for (let k = 0; k < 4; k++) {
          const nx = a + DX[k], ny = b + DY[k];
          if (nx < 0 || ny < 0 || nx >= MW || ny >= MH || !wallAt(nx, ny) || reg[ny * MW + nx] >= 0) continue;
          reg[ny * MW + nx] = id; st.push([nx, ny]);
        }
      }
      const n = tiles.length;
      const cx = tiles.reduce((s, t) => s + t[0], 0) / n * TS + 8, cy = tiles.reduce((s, t) => s + t[1], 0) / n * TS + 8;
      regions.push({ tiles, border, n, cx, cy, theme: border ? 'border' : wpick(n <= 6 ? city.mixSmall : city.mixBig, r), pal: ROOF[city.roofs[(r() * city.roofs.length) | 0]] });
    }
    for (const cv of carved) { const id = reg[NY(cv.j) * MW + NX(cv.i)]; if (id >= 0 && !regions[id].border) regions[id].theme = cv.theme; }
    const big = regions.filter((q) => !q.border && !LANDMARK.has(q.theme)).sort((a, b) => b.n - a.n);
    city.specials.forEach((sp, i) => { const q = big[i]; if (q && q.n >= 6) q.theme = sp; });
    // --- calles
    const SW = '#bdb8cc', CU = '#7d7893', SE = '#a39eb6', ASPH = '#3b3d50';
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
      if (!isRoad(x, y)) continue;
      const px = x * TS, py = y * TS;
      R(g, ASPH, px, py, TS, TS);
      for (let k = 0; k < 7; k++) R(g, r() < 0.5 ? '#45485e' : '#33354a', px + ((r() * 16) | 0), py + ((r() * 16) | 0));
      const L = isRoad(x - 1, y), Rr = isRoad(x + 1, y), U = isRoad(x, y - 1), D = isRoad(x, y + 1);
      const nb = (a, b) => isRoad(a, b) && (isRoad(a - 1, b) + isRoad(a + 1, b) + isRoad(a, b - 1) + isRoad(a, b + 1) >= 3);
      const lane = avLane[y * MW + x];
      if (lane) {
        // avenida: línea divisoria segmentada entre las dos pistas (se corta en los cruces)
        if (lane === 3) continue;
        if (laneDir[y * MW + x] & 1) {
          const yA = lane === 1 ? y : y - 1;
          if (!isRoad(x, yA - 1) && !isRoad(x, yA + 2)) for (let i = 0; i < 16; i++) if (((px + i) >> 3) & 1) R(g, '#e8e6f0', px + i, lane === 1 ? py + 15 : py);
        } else {
          const xA = lane === 1 ? x : x - 1;
          if (!isRoad(xA - 1, y) && !isRoad(xA + 2, y)) for (let i = 0; i < 16; i++) if (((py + i) >> 3) & 1) R(g, '#e8e6f0', lane === 1 ? px + 15 : px, py + i);
        }
        continue;
      }
      if (L + Rr + U + D >= 3) {
        if (r() < 0.18) { disc(g, px + 8, py + 8, 3, '#2c2e3e'); disc(g, px + 8, py + 8, 2, '#4f5268'); R(g, '#2c2e3e', px + 6, py + 8, 5, 1); }
      } else if (L && Rr && !U && !D) {
        for (let i = 0; i < 16; i++) if (!(((px + i) >> 2) & 1)) R(g, '#e8dfb8', px + i, py + 7, 1, 2);
        if (nb(x - 1, y)) for (let k = 1; k < 16; k += 4) R(g, '#d9d6e4', px + 1, py + k, 4, 2);
        if (nb(x + 1, y)) for (let k = 1; k < 16; k += 4) R(g, '#d9d6e4', px + 11, py + k, 4, 2);
      } else if (U && D && !L && !Rr) {
        for (let i = 0; i < 16; i++) if (!(((py + i) >> 2) & 1)) R(g, '#e8dfb8', px + 7, py + i, 2, 1);
        if (nb(x, y - 1)) for (let k = 1; k < 16; k += 4) R(g, '#d9d6e4', px + k, py + 1, 2, 4);
        if (nb(x, y + 1)) for (let k = 1; k < 16; k += 4) R(g, '#d9d6e4', px + k, py + 11, 2, 4);
      }
    }
    // --- bases por tema
    const borderBase = { andes: '#8a6e52', volcano: '#6a7048', hills: '#c8a868', river: city.water && city.water[0], sea: city.water && city.water[0], forest: '#2f7a3a' }[city.border];
    const cerroCols = ['#5e7a34', '#6f8c3e', '#86a24a', '#9cb85a', '#b8cc7a'];
    for (const rg of regions) {
      const th = rg.theme;
      const maxD = rg.tiles.reduce((m, [x, y]) => Math.max(m, Math.hypot(x * TS + 8 - rg.cx, y * TS + 8 - rg.cy)), 0) + 10;
      for (const [x, y] of rg.tiles) {
        const px = x * TS, py = y * TS;
        if (th === 'cerro') {
          for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
            const d = Math.hypot(px + i + 0.5 - rg.cx, py + j + 0.5 - rg.cy) / maxD;
            R(g, cerroCols[clamp(Math.floor((1 - d) * 5 + bayer(px + i, py + j) * 0.9 - 0.45), 0, 4)], px + i, py + j);
          }
        } else {
          const base = LANDMARK.has(th) ? '#d9cdb5' : { border: borderBase, park: city.grass[0], roof: rg.pal.b, torre: '#3e5f86', pool: '#d9cdb5', plaza: '#d9cdb5', obelisco: '#d9cdb5', zocalo: '#b8b0a8', parking: '#565a6f' }[th];
          R(g, base, px, py, TS, TS);
        }
        if (th === 'park') {
          for (let k = 0; k < 7; k++) R(g, r() < 0.5 ? city.grass[1] : city.grass[2], px + ((r() * 16) | 0), py + ((r() * 16) | 0));
        } else if (th === 'border') {
          if (city.border === 'river' || city.border === 'sea') {
            for (let k = 0; k < 6; k++) { const a = (r() * 13) | 0, b = (r() * 16) | 0; R(g, city.water[1], px + a, py + b, 3, 1); }
            if (city.border === 'sea' && !nearRoad(x, y, 2)) { g.fillStyle = city.water[2]; g.globalAlpha = 0.6; g.fillRect(px, py, 16, 16); g.globalAlpha = 1; }
          } else {
            const sp = { andes: ['#a08060', '#6e563e'], volcano: ['#7a8456', '#565e3a'], hills: ['#d8bc80', '#a88a50'], forest: ['#3f9147', '#256b31'] }[city.border];
            for (let k = 0; k < 7; k++) R(g, r() < 0.5 ? sp[0] : sp[1], px + ((r() * 16) | 0), py + ((r() * 16) | 0));
          }
        } else if (th === 'roof') {
          for (let i = 0; i < 16; i += 4) for (let j = (y & 1) * 2; j < 16; j += 4) R(g, rg.pal.t, px + i + ((j >> 2) & 1) * 2, py + j);
        } else if (th === 'torre') {
          for (let j = 0; j < 16; j += 4) for (let i = 0; i < 16; i += 4) { R(g, '#2c4a70', px + i, py + j, 4, 1); R(g, '#2c4a70', px + i, py + j, 1, 4); R(g, '#5a82b0', px + i + 1, py + j + 1, 1, 1); }
        } else if (th === 'pool' || th === 'plaza' || th === 'obelisco') {
          for (let j = 0; j < 16; j += 4) for (let i = 0; i < 16; i += 4) if ((((px + i) >> 2) + ((py + j) >> 2)) & 1) R(g, '#cbbf9e', px + i, py + j, 4, 4);
        } else if (th === 'zocalo') {
          for (let i = 0; i < 16; i += 8) { R(g, '#a39a90', px + i, py, 1, 16); R(g, '#a39a90', px, py + i, 16, 1); }
        } else if (th === 'parking') {
          R(g, '#d8d4e4', px + 2, py + 3, 1, 10); R(g, '#d8d4e4', px + 9, py + 3, 1, 10);
          if (r() < 0.55) {
            const ox = r() < 0.5 ? 3 : 10;
            if (city.parked === 'bus') { R(g, '#c8202e', px + ox, py + 1, 5, 14); R(g, '#e84a4a', px + ox + 1, py + 2, 3, 12); R(g, '#1b2240', px + ox, py + 2, 5, 1); R(g, '#f2f2f2', px + ox + 2, py + 4, 1, 9); }
            else { const col = city.parked[(r() * city.parked.length) | 0]; R(g, col, px + ox, py + 4, 5, 8); R(g, '#1b2240', px + ox, py + 6, 5, 2); R(g, '#1b2240', px + ox, py + 10, 5, 1); }
          }
        }
        const U = isRoad(x, y - 1), D = isRoad(x, y + 1), L = isRoad(x - 1, y), Rr = isRoad(x + 1, y);
        if (th === 'roof' || th === 'torre') {
          const lc = th === 'torre' ? '#a8c8ee' : rg.pal.l, dc = th === 'torre' ? '#2a4466' : rg.pal.d;
          if (U) R(g, lc, px, py + 4, 16, 2);
          if (L) R(g, lc, px + 4, py, 2, 16);
          if (D) R(g, dc, px, py + 10, 16, 2);
          if (Rr) R(g, dc, px + 10, py, 2, 16);
        }
        if (U) { R(g, SW, px, py, 16, 4); for (let i = 0; i < 16; i += 4) R(g, SE, px + i, py + 1, 1, 3); R(g, CU, px, py, 16, 1); }
        if (D) { R(g, SW, px, py + 12, 16, 4); for (let i = 0; i < 16; i += 4) R(g, SE, px + i, py + 12, 1, 3); R(g, CU, px, py + 15, 16, 1); }
        if (L) { R(g, SW, px, py, 4, 16); for (let i = 0; i < 16; i += 4) R(g, SE, px + 1, py + i, 3, 1); R(g, CU, px, py, 1, 16); }
        if (Rr) { R(g, SW, px + 12, py, 4, 16); for (let i = 0; i < 16; i += 4) R(g, SE, px + 12, py + i, 3, 1); R(g, CU, px + 15, py, 1, 16); }
        if (isRoad(x - 1, y - 1) && !U && !L) { R(g, SW, px, py, 4, 4); R(g, CU, px, py, 1, 1); }
        if (isRoad(x + 1, y - 1) && !U && !Rr) { R(g, SW, px + 12, py, 4, 4); R(g, CU, px + 15, py, 1, 1); }
        if (isRoad(x - 1, y + 1) && !D && !L) { R(g, SW, px, py + 12, 4, 4); R(g, CU, px, py + 15, 1, 1); }
        if (isRoad(x + 1, y + 1) && !D && !Rr) { R(g, SW, px + 12, py + 12, 4, 4); R(g, CU, px + 15, py + 15, 1, 1); }
        if (th === 'roof' || th === 'torre') {
          const sh = th === 'torre' ? 6 : 3;
          g.fillStyle = 'rgba(12,8,30,0.30)';
          if (Rr) g.fillRect(px + 16, py + 3, sh, 13);
          if (D) g.fillRect(px + 3, py + 16, 13, sh);
        }
      }
    }
    // --- gran cruce peatonal de Tokio: cebras en los cuatro brazos y diagonales
    if (S.cross) {
      const x0 = S.cross.ix * TS, y0 = S.cross.iy * TS, Z = '#e8e6f0';
      for (let k = 1; k < 32; k += 4) {
        R(g, Z, x0 + k, y0 - 12, 2, 10); R(g, Z, x0 + k, y0 + 34, 2, 10);
        R(g, Z, x0 - 12, y0 + k, 10, 2); R(g, Z, x0 + 34, y0 + k, 10, 2);
      }
      for (let k = 3; k < 28; k += 4) {
        R(g, Z, x0 + k, y0 + k, 3, 2); R(g, Z, x0 + k + 1, y0 + k + 2, 2, 1);
        R(g, Z, x0 + 29 - k, y0 + k, 3, 2); R(g, Z, x0 + 29 - k, y0 + k + 2, 2, 1);
      }
    }
    // --- árboles y elementos
    const TREE = {
      green: (x, y, rd) => { disc(g, x + 2, y + 2, rd, 'rgba(8,30,12,0.35)'); disc(g, x, y, rd, '#2f7d3b'); disc(g, x - 1, y - 1, rd - 1.2, '#45a24a'); disc(g, x - 2, y - 2, rd * 0.45, '#7fd06a'); R(g, '#c8f0a0', x - 3, y - 3); },
      darkgreen: (x, y, rd) => { disc(g, x + 2, y + 2, rd, 'rgba(8,30,12,0.35)'); disc(g, x, y, rd, '#1f5a2b'); disc(g, x - 1, y - 1, rd - 1.2, '#2c7a37'); disc(g, x - 2, y - 2, rd * 0.45, '#4c9446'); R(g, '#86c86e', x - 3, y - 3); },
      jacaranda: (x, y, rd) => { disc(g, x + 2, y + 2, rd, 'rgba(30,10,40,0.35)'); disc(g, x, y, rd, '#6a46b0'); disc(g, x - 1, y - 1, rd - 1.2, '#8b62d0'); disc(g, x - 2, y - 2, rd * 0.45, '#b48af0'); R(g, '#e2ccff', x - 3, y - 3); R(g, '#4a8a3a', x + rd - 2, y); R(g, '#4a8a3a', x - 1, y + rd - 2); },
      sakura: (x, y, rd) => { disc(g, x + 2, y + 2, rd, 'rgba(40,10,30,0.35)'); disc(g, x, y, rd, '#d87aa8'); disc(g, x - 1, y - 1, rd - 1.2, '#f2a0c8'); disc(g, x - 2, y - 2, rd * 0.45, '#ffd0e6'); R(g, '#ffffff', x - 3, y - 3); },
      palm: (x, y, rd) => {
        ellipse(g, x + 3, y + 3, rd, rd * 0.7, 'rgba(8,30,12,0.3)');
        for (let k = 0; k < 7; k++) {
          const a = (k / 7) * Math.PI * 2 + 0.3, ex = x + Math.cos(a) * rd * 1.2, ey = y + Math.sin(a) * rd * 1.2;
          line(g, x, y, ex, ey, '#2f8a3a', 1); R(g, '#6fc05a', ex, ey); line(g, x, y, (x + ex) / 2 + 1, (y + ey) / 2, '#47a24a', 1);
        }
        disc(g, x, y, 1.6, '#8a6a3a');
      },
    };
    const treeOf = (list) => TREE[list[(r() * list.length) | 0]];
    for (const rg of regions) {
      const set = new Set(rg.tiles.map(([x, y]) => y * MW + x));
      const interior = rg.tiles.filter(([x, y]) => set.has(y * MW + x - 1) && set.has(y * MW + x + 1) && set.has((y - 1) * MW + x) && set.has((y + 1) * MW + x));
      const th = rg.theme;
      if (th === 'border') {
        const deep = rg.tiles.filter(([x, y]) => !nearRoad(x, y, 1));
        if (city.border === 'andes') {
          const brown = ['#6a5040', '#8a6a50', '#a8845e', '#c4a07a'], rock = ['#5a4e5e', '#7a6a72', '#9a8a8a', '#bcaaa0'];
          const ms = [];
          for (const [x, y] of rg.tiles) {
            const cx = x * TS + 8, cy = y * TS + 8, e = x / MW;
            if (!nearRoad(x, y, 1)) ms.push([cx + ((r() * 6) | 0) - 3, cy + ((r() * 6) | 0) - 3, 7 + e * 4 + r() * 2, x >= MW - 2 && r() < 0.6]);
            else for (let k = 0; k < 2; k++) disc(g, cx + ((r() * 10) | 0) - 5, cy + ((r() * 10) | 0) - 5, 2 + r() * 1.5, r() < 0.5 ? '#9a7a58' : '#6a7a3a');
          }
          ms.sort((a, b) => a[1] - b[1]);
          for (const [x, y, rd, sn] of ms) RM.mount(g, x, y, rd, sn ? rock : brown, sn ? 0.3 : 0, r);
        } else if (city.border === 'volcano') {
          const right = deep.filter(([x]) => x >= MW - 2).sort((a, b) => a[1] - b[1]);
          for (const [x, y] of rg.tiles) if (!nearRoad(x, y, 1) && r() < 0.6) disc(g, x * TS + 8, y * TS + 8, 4 + r() * 3, r() < 0.5 ? '#7a7a50' : '#5e6a3e');
          [right[(right.length * 0.25) | 0], right[(right.length * 0.7) | 0]].forEach((tl, i) => {
            if (!tl) return;
            const x = tl[0] * TS + 8, y = tl[1] * TS + 8, R0 = 14;
            const cols = ['#4e543a', '#6e7048', '#86805a', '#a09478', '#c8c4bc', '#eef2f8'];
            for (let k = 0; k < 6; k++) disc(g, x - k * 0.7, y - k * 0.7, R0 * (1 - k / 7), cols[k]);
            disc(g, x - 4, y - 4, 1.8, i ? '#3a3030' : '#5a4a4a');
          });
        } else if (city.border === 'hills') {
          for (const [x, y] of rg.tiles) {
            const cx = x * TS + 8, cy = y * TS + 8;
            if (!nearRoad(x, y, 1) && r() < 0.7) { disc(g, cx + 1, cy + 1, 6, 'rgba(60,40,10,0.25)'); disc(g, cx, cy, 6, '#b8945a'); disc(g, cx - 1, cy - 1, 4, '#d2b072'); }
            for (let k = 0; k < 3; k++) disc(g, cx + ((r() * 12) | 0) - 6, cy + ((r() * 12) | 0) - 6, 1.5, r() < 0.5 ? '#7a8a4a' : '#5e6e3a');
            if (r() < 0.12) TREE.palm(cx, cy, 4);
          }
        } else if (city.border === 'river' || city.border === 'sea') {
          for (const [x, y] of deep) if (r() < 0.08) {
            const cx = x * TS + 8, cy = y * TS + 8, v = r() < 0.5;
            ellipse(g, cx + 1, cy + 1, v ? 2.5 : 5.5, v ? 5.5 : 2.5, 'rgba(0,0,0,0.25)');
            ellipse(g, cx, cy, v ? 2.5 : 5.5, v ? 5.5 : 2.5, '#f2f2f2'); R(g, '#8a5a3a', cx - 1, cy - 1, 2, 2);
          }
        } else for (const [x, y] of rg.tiles) for (let k = 0; k < (r() < 0.55 ? 2 : 1); k++) TREE.darkgreen(x * TS + 8 + ((r() * 6) | 0) - 3, y * TS + 8 + ((r() * 6) | 0) - 3, 4.5 + r() * 2);
      } else if (th === 'pool') {
        if (interior.length) {
          for (const [x, y] of interior) {
            const px = x * TS, py = y * TS;
            R(g, '#3fb6e8', px, py, 16, 16);
            for (let k = 0; k < 10; k++) R(g, '#8fdcff', px + ((r() * 14) | 0), py + ((r() * 15) | 0), 2, 1);
            if (!interior.some(([a, b]) => a === x - 1 && b === y)) R(g, '#ffffff', px, py, 1, 16);
            if (!interior.some(([a, b]) => a === x + 1 && b === y)) R(g, '#ffffff', px + 15, py, 1, 16);
            if (!interior.some(([a, b]) => a === x && b === y - 1)) R(g, '#ffffff', px, py, 16, 1);
            if (!interior.some(([a, b]) => a === x && b === y + 1)) R(g, '#2b8cc0', px, py + 15, 16, 1);
          }
          for (const [x, y] of rg.tiles) if (!interior.some(([a, b]) => a === x && b === y) && r() < 0.35) TREE[city.plazaTree](x * TS + 8, y * TS + 8, 3.5);
        } else {
          const [x, y] = rg.tiles[(r() * rg.tiles.length) | 0];
          disc(g, x * TS + 8, y * TS + 8, 5, '#3fb6e8'); disc(g, x * TS + 7, y * TS + 7, 1.5, '#e8fbff');
        }
      } else if (th === 'plaza') {
        const [x, y] = rg.tiles[(r() * rg.tiles.length) | 0];
        const cx = x * TS + 8, cy = y * TS + 8;
        disc(g, cx + 1, cy + 1, 6, 'rgba(0,0,0,0.2)'); disc(g, cx, cy, 6, '#a89c84'); disc(g, cx, cy, 4.6, '#3fb6e8'); disc(g, cx - 1, cy - 1, 1.6, '#e8fbff');
        for (const [a, b] of rg.tiles) if (r() < 0.45 && (a !== x || b !== y)) TREE[city.plazaTree](a * TS + 8 + ((r() * 4) | 0) - 2, b * TS + 8, 3.6);
      } else if (th === 'park') {
        for (const [x, y] of rg.tiles) {
          if (r() < 0.62) treeOf(city.trees)(x * TS + 8 + ((r() * 6) | 0) - 3, y * TS + 8 + ((r() * 6) | 0) - 3, 4.5 + r() * 2);
          if (r() < 0.2) {
            const fx = x * TS + 4 + ((r() * 8) | 0), fy = y * TS + 4 + ((r() * 8) | 0);
            for (let k = 0; k < 5; k++) R(g, pick(['#ff6b8a', '#ffd84a', '#ffffff', '#b48cff']), fx + ((r() * 4) | 0), fy + ((r() * 4) | 0));
          }
        }
      } else if (th === 'roof') {
        const helipad = interior.length && rg.n >= 9 && r() < 0.6 ? interior[(r() * interior.length) | 0] : null;
        for (const [x, y] of rg.tiles) {
          const cx = x * TS + 8 + ((r() * 3) | 0) - 1, cy = y * TS + 8 + ((r() * 3) | 0) - 1;
          if (helipad && helipad[0] === x && helipad[1] === y) {
            disc(g, cx, cy, 7, '#4f4c5c'); disc(g, cx, cy, 6.4, '#ffd23f'); disc(g, cx, cy, 5.4, '#4f4c5c'); glyph(g, 'H', cx - 3, cy - 3, '#ffffff', true);
            continue;
          }
          const p = r();
          if (city.neon && p < 0.22) {
            const col = r() < 0.5 ? '#ff4f9a' : '#4fe3ff', w = 6 + ((r() * 3) | 0);
            R(g, '#120e24', cx - w / 2 - 1, cy - 3, w + 2, 6); R(g, col, cx - w / 2, cy - 2, w, 1); R(g, col, cx - w / 2, cy + 1, w, 1);
            for (let i = 0; i < w; i += 2) R(g, '#ffffff', cx - w / 2 + i, cy - 1, 1, 2);
            spots.push([cx, cy, col]);
          } else if (p < 0.18) { R(g, 'rgba(0,0,0,0.25)', cx - 2, cy - 1, 6, 5); R(g, '#9aa0b4', cx - 3, cy - 2, 6, 5); R(g, '#d0d3de', cx - 3, cy - 2, 6, 1); R(g, '#5a6078', cx - 1, cy, 3, 2); }
          else if (p < 0.3) { disc(g, cx, cy, 1.7, '#3a3448'); R(g, '#7a7488', cx - 1, cy - 1); }
          else if (p < 0.42) { R(g, '#3a6a9a', cx - 3, cy - 2, 6, 4); R(g, '#7fd1ff', cx - 3, cy - 2, 6, 3); R(g, '#d6f4ff', cx - 3, cy - 2, 3, 1); }
          else if (p < 0.5) { disc(g, cx + 1, cy + 1, 3.5, 'rgba(0,0,0,0.25)'); disc(g, cx, cy, 3.5, '#7c5e40'); disc(g, cx - 0.5, cy - 0.5, 2.6, '#a8845e'); R(g, '#5d452f', cx - 1, cy, 3, 1); }
          else if (p < 0.6) { R(g, '#1d2a5e', cx - 4, cy - 3, 8, 6); for (let i = 0; i < 8; i += 2) R(g, '#4a6ad0', cx - 4 + i, cy - 3, 1, 6); R(g, '#4a6ad0', cx - 4, cy, 8, 1); }
        }
      } else if (th === 'torre') {
        // gran torre de vidrio con reflejos y helipuerto
        for (const [x, y] of rg.tiles) if (r() < 0.6) { const px = x * TS, py = y * TS; line(g, px + 3, py + 12, px + 9, py + 6, '#9cc4ee', 1); R(g, '#d6ecff', px + 9, py + 6); }
        const hp = interior.length ? interior.reduce((b, t) => (Math.hypot(t[0] * TS + 8 - rg.cx, t[1] * TS + 8 - rg.cy) < Math.hypot(b[0] * TS + 8 - rg.cx, b[1] * TS + 8 - rg.cy) ? t : b)) : rg.tiles[0];
        const hx = hp[0] * TS + 8, hy = hp[1] * TS + 8;
        disc(g, hx, hy, 7, '#2e3a50'); disc(g, hx, hy, 6.4, '#ffd23f'); disc(g, hx, hy, 5.4, '#2e3a50'); glyph(g, 'H', hx - 3, hy - 3, '#ffffff', true);
        R(g, '#ff3b5c', hx - 7, hy - 7); R(g, '#ff3b5c', hx + 6, hy - 7); R(g, '#ff3b5c', hx - 7, hy + 6); R(g, '#ff3b5c', hx + 6, hy + 6);
        spots.push([hx - 7, hy - 7, '#ff3b5c']);
      } else if (th === 'cerro') {
        // cerro con bosque en las faldas y mirador con estatua blanca en la cumbre
        const maxD = rg.tiles.reduce((m, [x, y]) => Math.max(m, Math.hypot(x * TS + 8 - rg.cx, y * TS + 8 - rg.cy)), 0) + 10;
        for (const [x, y] of rg.tiles) {
          const cx = x * TS + 8, cy = y * TS + 8, d = Math.hypot(cx - rg.cx, cy - rg.cy) / maxD;
          if (d > 0.42 && r() < 0.75) treeOf(['green', 'darkgreen', 'green'])(cx + ((r() * 6) | 0) - 3, cy + ((r() * 6) | 0) - 3, 3.5 + r() * 1.5);
          else if (d > 0.25 && r() < 0.4) R(g, '#d8c89a', cx + ((r() * 8) | 0) - 4, cy + ((r() * 8) | 0) - 4, 2, 1);
        }
        const sx = Math.round(rg.cx), sy = Math.round(rg.cy);
        disc(g, sx, sy, 4.5, '#c8c0b0'); disc(g, sx, sy, 3.5, '#ddd6c6');
        R(g, 'rgba(0,0,0,0.3)', sx + 1, sy - 1, 3, 5); R(g, '#ffffff', sx - 1, sy - 3, 3, 5); R(g, '#e8e8f4', sx, sy - 4); R(g, '#c8c8d8', sx + 1, sy - 2, 1, 4);
        line(g, sx + 6, sy - 8, sx + 6, sy - 2, '#5a5a6a', 1); R(g, '#ff3b5c', sx + 6, sy - 9);
        spots.push([sx, sy - 2, '#ffffff']);
      } else if (th === 'obelisco') {
        const cx = Math.round(rg.cx), cy = Math.round(rg.cy);
        disc(g, cx, cy, 9, city.grass[0]); disc(g, cx, cy, 7.5, city.grass[1]);
        line(g, cx + 2, cy + 2, cx + 13, cy + 13, 'rgba(0,0,0,0.35)', 2);
        R(g, '#d6d2c8', cx - 2, cy - 2, 4, 4); R(g, '#ffffff', cx - 2, cy - 2, 2, 2); R(g, '#b8b4aa', cx, cy, 2, 2);
        for (const [a, b] of rg.tiles) if (r() < 0.3) TREE[city.plazaTree](a * TS + 8, b * TS + 8, 3.4);
        spots.push([cx, cy, '#ffffff']);
      } else if (th === 'zocalo') {
        const cx = Math.round(rg.cx), cy = Math.round(rg.cy);
        disc(g, cx, cy, 3, '#8a8278'); line(g, cx + 1, cy + 1, cx + 10, cy + 6, 'rgba(0,0,0,0.3)', 2);
        R(g, '#006847', cx + 1, cy - 8, 2, 5); R(g, '#ffffff', cx + 3, cy - 8, 2, 5); R(g, '#ce1126', cx + 5, cy - 8, 2, 5); R(g, '#8a6a3a', cx + 3, cy - 6);
        R(g, '#3a3a48', cx, cy - 9, 1, 10);
      } else if (th === 'parking') {
        for (const [x, y] of rg.tiles) if (r() < 0.12) TREE[city.plazaTree](x * TS + 8, y * TS + 8, 3);
      } else if (LANDMARK.has(th)) {
        // lugar especial dentro de la manzana grande (al borde de la vereda)
        const rc = RM.largestRect(rg.tiles);
        const X = rc.x * TS + 4, Y = rc.y * TS + 4, W = rc.w * TS - 8, H = rc.h * TS - 8;
        let out = [];
        if (th === 'estadio' || th === 'domo') out = RM.stadium(g, X, Y, W, H, r, th === 'domo').map(([x, y]) => [x, y, '#fff6c8']);
        else if (th === 'puerto') RM.port(g, X, Y, W, H, r);
        else if (th === 'mercado') RM.market(g, X, Y, W, H, r);
        else if (th === 'autocine') out = RM.driveIn(g, X, Y, W, H, r);
        else if (th === 'templo') out = RM.temple(g, X, Y, W, H, r);
        spots.unshift(...out);
        for (const [x, y] of rg.tiles) if ((x < rc.x || y < rc.y || x >= rc.x + rc.w || y >= rc.y + rc.h) && r() < 0.4) TREE[city.plazaTree](x * TS + 8, y * TS + 8, 3.4);
      }
    }
    // puentes sobre el río que salen del mapa (Londres)
    if (city.bridge) {
      const y = NY(6) * TS + 8;
      if (isRoad(NX(0), NY(6))) RM.bridge(g, y, -SK, NX(0) * TS);
      if (isRoad(NX(NXC - 1), NY(6))) RM.bridge(g, y, (NX(NXC - 1) + 1) * TS, MW * TS + SK);
    }
    // --- curvas redondeadas (ciudades de derrape): asfalto en el arco, vereda en la esquina exterior
    for (const bd of bends.values()) {
      const ax = DX[bd.a], ay = DY[bd.a], bx = DX[bd.b], by = DY[bd.b], Rr = bd.r, n = Rr / 16;
      const mine = new Set([bd.y * MW + bd.x]);
      for (let k = 1; k <= n; k++) { mine.add((bd.y + ay * k) * MW + bd.x + ax * k); mine.add((bd.y + by * k) * MW + bd.x + bx * k); }
      const span = Rr + 28;
      for (let Y = bd.cy - span; Y < bd.cy + span; Y++) for (let X = bd.cx - span; X < bd.cx + span; X++) {
        const rx = X + 0.5 - bd.cx, ry = Y + 0.5 - bd.cy;
        if (rx * ax + ry * ay > 0 || rx * bx + ry * by > 0) continue;
        const d = Math.hypot(rx, ry), tx = Math.floor(X / TS), ty = Math.floor(Y / TS), road = isRoad(tx, ty);
        if (d >= Rr + 8 && road && mine.has(ty * MW + tx)) R(g, d < Rr + 9 ? CU : (X + Y) % 4 === 0 ? SE : SW, X, Y);
        else if (d >= Rr - 8 && d < Rr + 8 && !road) R(g, ASPH, X, Y);
        else if (d >= Rr - 12 && d < Rr - 8 && !road) R(g, d >= Rr - 9 ? CU : SW, X, Y);
        if (d >= Rr - 1 && d < Rr + 1) {
          const sl = Math.atan2(-(rx * ax + ry * ay), -(rx * bx + ry * by)) * Rr;
          R(g, Math.floor(sl / 4) % 2 === 0 ? '#e8dfb8' : ASPH, X, Y);
        } else if (d >= Rr - 6 && d < Rr + 6 && road) {
          // limpia la línea recta vieja dentro de la curva
          const px = X - (tx * TS), py = Y - (ty * TS);
          if (px >= 7 && px <= 8 || py >= 7 && py <= 8) R(g, ASPH, X, Y);
        }
      }
    }
    // asta con la bandera del país: plaza/parque/hito más cercano a la partida
    const sx = startTile[0] * TS + 8, sy = startTile[1] * TS + 8;
    const flagRegs = regions.filter((q) => ['zocalo', 'obelisco', 'plaza', 'park', 'cerro', 'pool'].includes(q.theme));
    let flagAt = null, best = 1e9;
    for (const q of flagRegs.length ? flagRegs : regions.filter((q) => !q.border)) {
      const pri = 1;
      for (const [x, y] of q.tiles) {
        if (q.theme === 'pool' && !nearRoad(x, y, 1)) continue;
        const d = Math.hypot(x * TS + 8 - sx, y * TS + 8 - sy) * pri;
        if (d < best) { best = d; flagAt = [x * TS + 8, y * TS + 10]; }
      }
    }
    return { c, spots, flagAt };
  }

  // ---------------- construcción de ronda
  function cityRng() {
    const city = ALLC[S.city];
    let h = 7;
    for (const ch of city.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return rng32(h + S.round * 7919 + S.loop * 104729 + (S.mode === 'duel' ? 31337 + (S.duelN || 0) * 977 : 0));
  }
  function buildRound() {
    const city = ALLC[S.city], r = cityRng(), duel = S.mode === 'duel';
    grid = genGrid(r, city);
    rockAt = new Uint8Array(MW * MH);
    startTile = duel ? [NX(4), NY(7)] : [NX(5), NY(7)];
    rivalTile = [NX(6), NY(7)];
    enemyStarts = [0, 2, 4, 6, 8, 10, 1, 9].map((i) => [NX(i), NY(NYC - 1)]);
    S.cross = city.scramble ? { ix: NX(city.avenue.col), iy: NY(city.avenue.row) } : null;
    findBends(city);
    S.trk = city.kind || null;
    blockAt = new Uint8Array(MW * MH);
    S.ice = null; S.rail = null; S.rampList = []; S.driftList = []; S.marbleList = [];
    const roadTiles = [];
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) if (isRoad(x, y)) roadTiles.push([x, y]);
    if (S.trk === 'toy') {
      // el tren de juguete cruza el cuarto por una fila de manzanas
      const ty = NY(5) + 1;
      S.rail = { ty, y: ty * TS + 8, xs: [] };
      for (let x = 0; x < MW; x++) if (isRoad(x, ty)) S.rail.xs.push(x);
    }
    const total = () => { let n = 0; for (const [x, y] of roadTiles) if (!rockAt[y * MW + x]) n++; return n; };
    const nRocks = S.trk === 'arena' ? 0 : duel ? Math.min(2 + S.city, 6) : Math.min(2 + lvl() + S.loop + (diff() >= 2 ? diff() - 1 : 0), 8);
    let tries = 0;
    const placed = [];
    const far = (x, y, [a, b], d) => Math.abs(x - a) + Math.abs(y - b) >= d;
    while (placed.length < nRocks && tries++ < 500) {
      const [x, y] = roadTiles[(r() * roadTiles.length) | 0];
      const h = isRoad(x - 1, y) && isRoad(x + 1, y) && !isRoad(x, y - 1) && !isRoad(x, y + 1);
      const v = isRoad(x, y - 1) && isRoad(x, y + 1) && !isRoad(x - 1, y) && !isRoad(x + 1, y);
      if (!h && !v) continue;
      if (S.rail && Math.abs(y - S.rail.ty) < 2) continue;
      if (!far(x, y, startTile, 6) || (duel && !far(x, y, rivalTile, 6))) continue;
      if (enemyStarts.some((s) => !far(x, y, s, 3))) continue;
      if (placed.some((p) => !far(x, y, [p.x, p.y], 5))) continue;
      if ([...bends.values()].some((b) => !far(x, y, [b.x, b.y], 2))) continue;
      rockAt[y * MW + x] = 1;
      bfs(distA, startTile[0], startTile[1]);
      let reach = 0;
      for (const [a, b] of roadTiles) if (distA[b * MW + a] < 9999) reach++;
      if (reach !== total()) { rockAt[y * MW + x] = 0; continue; }
      placed.push({ x, y, h });
    }
    bfs(distA, startTile[0], startTile[1]);
    const nCans = duel ? DUEL_CANS : 10;
    // nunca debajo de donde esperan las patrullas (en la ronda de bono se quedan quietas y lo taparían)
    const parked = [...enemyStarts, ...[1, 9, 5, 3].map((i) => [NX(i), NY(0)])];
    const cand = roadTiles.filter(([x, y]) => !rockAt[y * MW + x] && distA[y * MW + x] > 6 && distA[y * MW + x] < 9999 && !inCross(x, y) && (!duel || far(x, y, rivalTile, 6)) && (!S.rail || y !== S.rail.ty)
      && parked.every((q) => far(x, y, q, 3)));
    const chosen = [];
    tries = 0;
    while (chosen.length < nCans && tries++ < 2500) {
      const [x, y] = cand[(r() * cand.length) | 0];
      if (chosen.some(([a, b]) => Math.abs(a - x) + Math.abs(b - y) < (tries < 900 ? 7 : 4))) continue;
      chosen.push([x, y]);
    }
    let iS = -1, iL = -1;
    if (!duel) {
      iS = (r() * chosen.length) | 0;
      iL = (r() * chosen.length) | 0;
      if (iL === iS) iL = (iS + 3) % chosen.length;
    }
    // pistas especiales: rampas, hielo, montículos y canicas
    const straightAt = (x, y) => (isRoad(x - 1, y) && isRoad(x + 1, y) && !isRoad(x, y - 1) && !isRoad(x, y + 1) ? 'h'
      : isRoad(x, y - 1) && isRoad(x, y + 1) && !isRoad(x - 1, y) && !isRoad(x + 1, y) ? 'v' : null);
    const busy = new Set(chosen.map(([x, y]) => y * MW + x));
    placed.forEach((q) => busy.add(q.y * MW + q.x));
    const pickTiles = (n, ok, sep) => {
      const out = [];
      for (let k = 0; out.length < n && k < 900; k++) {
        const [x, y] = roadTiles[(r() * roadTiles.length) | 0];
        if (!ok(x, y) || busy.has(y * MW + x) || out.some(([a, b]) => Math.abs(a - x) + Math.abs(b - y) < sep)) continue;
        out.push([x, y]); busy.add(y * MW + x);
      }
      return out;
    };
    if (S.trk === 'arena') {
      S.rampList = pickTiles(9, (x, y) => { const a = straightAt(x, y); return a && far(x, y, startTile, 5) && straightAt(x + (a === 'h' ? 1 : 0), y + (a === 'v' ? 1 : 0)) === a && straightAt(x - (a === 'h' ? 1 : 0), y - (a === 'v' ? 1 : 0)) === a; }, 7)
        .map(([x, y], i) => ({ x, y, h: straightAt(x, y) === 'h', ring: i % 3 === 0 }));
    } else if (S.trk === 'snow') {
      S.ice = new Uint8Array(MW * MH);
      const deg = (x, y) => [0, 1, 2, 3].filter((d) => isRoad(x + DX[d], y + DY[d])).length;
      for (const [x, y] of pickTiles(9, (x, y) => deg(x, y) >= 3 && far(x, y, startTile, 5), 7)) {
        S.ice[y * MW + x] = 1;
        for (let d = 0; d < 4; d++) if (isRoad(x + DX[d], y + DY[d]) && r() < 0.8) S.ice[(y + DY[d]) * MW + x + DX[d]] = 1;
      }
      S.driftList = pickTiles(7, (x, y) => straightAt(x, y) && !S.ice[y * MW + x] && far(x, y, startTile, 5), 6).map(([x, y]) => ({ x: x * TS + 8, y: y * TS + 8, on: true, back: 0 }));
    } else if (S.trk === 'toy') {
      S.marbleList = pickTiles(4, (x, y) => straightAt(x, y) && far(x, y, startTile, 7) && y !== S.rail.ty, 8)
        .map(([x, y]) => ({ x: x * TS + 8, y: y * TS + 8, dir: straightAt(x, y) === 'h' ? 1 : 2, ph: 0, cd: 0 }));
    }
    if (mapTex) mapTex.dispose();
    const drawn = drawCity(city, r);
    mapTex = T(drawn.c);
    mapSpr.set(mapTex).at((MW * TS) / 2, (MH * TS) / 2);
    for (const c of cans) { c.spr.remove(); c.glow.remove(); }
    cans = chosen.map(([x, y], i) => {
      const kind = i === iS ? 'S' : i === iL ? 'L' : 'N';
      const frames = S.trk === 'toy' ? (kind === 'S' ? A.batS : kind === 'L' ? A.batL : A.batN) : kind === 'S' ? A.canS : kind === 'L' ? A.canL : A.canN;
      const [px, py] = tilePos(x, y);
      return { x: px, y: py, kind, frames, got: false, ph: r() * 6,
        spr: new Spr(world, frames[0], 5), glow: new Spr(world, kind === 'S' ? A.glowY : kind === 'L' ? A.glowG : A.glowR, 4, { transparent: true, add: true }) };
    });
    for (const rk of S.rockList || []) { if (rk.snow) rk.spr.show(false); else rk.spr.remove(); }
    S.rockList = placed.map((p) => ({ ...p, cx: p.x * TS + 8, cy: p.y * TS + 8, spr: new Spr(world, (p.h ? A.barrierV : A.barrier)[0], 6).at(p.x * TS + 8, p.y * TS + 8) }));
    setupTrack();
    // ambiente de la ciudad
    nightOv.visible = !!city.night;
    tintOv.visible = !!city.tint;
    if (city.tint) { tintOv.material.color.setHex(city.tint[0]); tintOv.material.opacity = city.tint[1]; }
    glows.forEach((s, i) => {
      const sp = drawn.spots[i];
      s.show(!!sp && !!city.night);
      if (sp) s.tint(sp[2]).at(sp[0], sp[1]);
    });
    clouds.forEach((c) => c.spr.show(!city.night));
    S.flagFrames = A.flags[city.flag];
    S.flagAt = drawn.flagAt;
    flagSpr.show(!!drawn.flagAt);
    scene.background.setHex(city.night ? 0x05071a : 0x1d4a26);
    S.collected = 0; S.special = false;
    S.bonus = !duel && S.round === 1;
    lastPT = -1; lastVT = -1;
    S.roadTiles = roadTiles;
    // fondo del radar: calles en tenue, avenidas un poco más claras
    const rb = S.radarBg || (S.radarBg = document.createElement('canvas'));
    rb.width = MW * 2; rb.height = MH * 2;
    const rg = rb.getContext('2d');
    rg.clearRect(0, 0, rb.width, rb.height);
    for (const [x, y] of roadTiles) { rg.fillStyle = avLane[y * MW + x] ? 'rgba(170,180,230,0.42)' : 'rgba(140,150,200,0.26)'; rg.fillRect(x * 2, y * 2, 2, 2); }
  }
  function placeCar(c, [tx, ty], dir) {
    c.x = tx * TS + 8; c.y = ty * TS + 8; c.dir = dir;
    c.vx = c.x; c.vy = c.y; c.hd = null; c.om = 0; c.lead = 0; c.ang = ROT[dir];
    c.tpx = null; c.wvx = 0; c.wvy = 0; c.tvx = 0; c.tvy = 0; c.slip = 0; c.drift = 0;
    c.turnTile = -1; c.turnIn = dir; c.plan = null; c.tile = -1; c.jumpT = 0; c.slowT = 0;
  }
  function resetActors(full) {
    const city = ALLC[S.city], duel = S.mode === 'duel';
    placeCar(player, startTile, 0);
    player.vis = true; player.puffQ = [];
    S.want = -1; S.wantT = 0;
    const nE = policeCount();
    const fromTop = S.mode === 'tour' && diff() > 0 && (lvl() >= 3 || S.loop > 0);
    const corners = [[4, MH - 5], [MW - 5, 4], [4, 4], [MW - 5, MH - 5]];
    let i = 0;
    for (const e of enemies) {
      if (e.icp) { e.active = false; e.spr.show(false); e.hl.show(false); e.stars.forEach((s) => s.show(false)); continue; }
      e.active = i < nE; e.spr.show(e.active); e.hl.show(e.active && !!city.night);
      // en rondas altas algunas patrullas salen desde arriba del mapa (como en el original)
      const top = fromTop && i >= 2 && i % 2 === 1;
      placeCar(e, top ? [NX([1, 9, 5, 3][(i >> 1) % 4]), NY(0)] : enemyStarts[i % enemyStarts.length], top ? 2 : 0);
      e.stun = 0; e.hold = duel ? 2 + i * 1.6 : 0.6 + i * 1.3; e.persona = PORDER[i];
      e.noise = [0.08, 0.12, 0.25, 0.2][e.persona]; e.spin = 0; e.near = false; e.nearCd = 0;
      e.spr.set(A.carT[e.persona][0]);
      e.stars.forEach((s) => s.show(false));
      if (full || !e.distH) {
        // casa: la calle más cercana a su esquina (para dispersarse o vigilar)
        const [cx, cy] = corners[i % 4];
        let best = null, bd = 1e9;
        for (const [x, y] of S.roadTiles) { const d = Math.abs(x - cx) + Math.abs(y - cy); if (!rockAt[y * MW + x] && d < bd) { bd = d; best = [x, y]; } }
        e.home = best; e.distH = e.distH || new Int16Array(MW * MH);
        bfs(e.distH, best[0], best[1]);
      }
      i++;
    }
    S.scatter = false; S.chaseT = rand(16, 22);
    if (S.icpOn) S.icpAt = (S.playT || 0) + 12;
    S.icpOn = false;
    S.lookX = 0; S.lookY = 0; S.spotted = false;
    if (heli && heli.on && S.escape) { heli.x = startTile[0] * TS - 150; heli.y = startTile[1] * TS - 120; }
    if (heli2 && heli2.on && S.escape) { heli2.x = startTile[0] * TS + 170; heli2.y = startTile[1] * TS + 140; }
    player.hl.show(!!city.night);
    for (const s of smokes) { s.life = 0; s.spr.show(false); }
    // efectos de ítems y estados del jugador
    Object.assign(S, { nitroT: 0, magT: 0, shieldT: 0, oilT: 0, oilAcc: 0, slowT: 0, spinT: 0, spinA: 0, boostT: 0, invT: 0, smokeCd: 0, bumpCd: 0 });
    if (full) { S.fuel = 100; S.item = null; S.rollT = 0; S.drillT = 0; }
    player.driftT = 0;
    if (rival) {
      rival.active = duel; rival.boom.show(false); rival.shield.show(false);
      rival.spr.show(duel); rival.glow.show(duel); rival.hl.show(duel && !!city.night); rival.tag.show(duel);
      if (duel) resetRival();
    }
  }

  // ---------------- movimiento sobre la grilla
  function advance(c, dist, decide, open) {
    for (let k = 0; k < 8 && dist > 1e-6; k++) {
      const tx = Math.floor(c.x / TS), ty = Math.floor(c.y / TS);
      const cx = tx * TS + 8, cy = ty * TS + 8;
      let toC = DX[c.dir] ? (cx - c.x) * DX[c.dir] : (cy - c.y) * DY[c.dir];
      if (Math.abs(toC) < 1e-4) {
        c.x = cx; c.y = cy;
        const prev = c.dir;
        decide(c, tx, ty);
        if (c.dir !== prev) { c.turnTile = ty * MW + tx; c.turnIn = prev; }
        if (!open(tx + DX[c.dir], ty + DY[c.dir])) return;
        toC = TS;
      } else if (toC < 0) toC += TS;
      const m = Math.min(dist, toC);
      c.x += DX[c.dir] * m; c.y += DY[c.dir] * m;
      dist -= m;
      if (m >= toC - 1e-4) { if (DX[c.dir]) c.x = Math.floor(c.x / TS) * TS + 8; else c.y = Math.floor(c.y / TS) * TS + 8; }
    }
  }
  function decidePlayer(c, tx, ty) {
    const w = S.want;
    if ((c.jumpT > 0 || (!S.spikes && onIce(tx, ty))) && openP(tx + DX[c.dir], ty + DY[c.dir])) return;
    if (w >= 0 && openP(tx + DX[w], ty + DY[w])) { c.dir = w; return; }
    if (openP(tx + DX[c.dir], ty + DY[c.dir])) return;
    for (const d of [(c.dir + 1) % 4, (c.dir + 3) % 4]) if (openP(tx + DX[d], ty + DY[d])) { c.dir = d; return; }
    c.dir = (c.dir + 2) % 4;
  }
  function predictPlayer(c, tx, ty) {
    const w = S.want;
    if (w >= 0 && openP(tx + DX[w], ty + DY[w])) return w;
    if (openP(tx + DX[c.dir], ty + DY[c.dir])) return c.dir;
    for (const d of [(c.dir + 1) % 4, (c.dir + 3) % 4]) if (openP(tx + DX[d], ty + DY[d])) return d;
    return (c.dir + 2) % 4;
  }
  function enemyField(e, t) {
    if (S.spotted) return distA;                       // el foco del helicóptero delata al jugador
    if (S.scatter && !e.icp && e.distH) return e.distH; // fase de dispersión: cada una a su esquina
    let field = distA;
    if (!e.icp) {
      if (e.persona === 1 && distA[t] > 5) field = distB;
      else if (e.persona === 2 && e.distH && distA[t] > 9 && e.distH[lastPT >= 0 ? lastPT : t] > 10) field = e.distH;
    }
    // en duelo persigue al más cercano (jugador o rival)
    if (S.mode === 'duel' && rival.active && rival.dead <= 0 && distV[t] < distA[t]) field = distV;
    return field;
  }
  function decideEnemy(e, tx, ty) {
    const rev = (e.dir + 2) % 4, opts = [];
    // errática: a veces dobla al azar, aunque haya una barrera
    if (e.persona === 3 && !e.icp && !S.spotted && Math.random() < 0.3) {
      const wild = [0, 1, 2, 3].filter((d) => d !== rev && isRoad(tx + DX[d], ty + DY[d]));
      if (wild.length) { e.dir = wild[(Math.random() * wild.length) | 0]; return; }
    }
    for (let d = 0; d < 4; d++) if (d !== rev && openE(tx + DX[d], ty + DY[d])) opts.push(d);
    if (!opts.length) { e.dir = rev; return; }
    const t = ty * MW + tx, field = enemyField(e, t);
    const roam = field === e.distH && e.distH[t] < 3;   // ya en casa: da vueltas por la zona
    let best = opts[0], bv = 1e9;
    for (const d of opts) {
      let v = field[(ty + DY[d]) * MW + tx + DX[d]];
      if (roam) v = Math.random() * 6;
      else if (Math.random() < e.noise) v += Math.random() * 7;
      if (v < bv) { bv = v; best = d; }
    }
    e.dir = best;
  }
  // tránsito civil: prefiere seguir derecho, respeta el sentido de cada pista de la avenida
  function decideCiv(c, tx, ty) {
    const rev = (c.dir + 2) % 4, t = ty * MW + tx, ok = [];
    for (let d = 0; d < 4; d++) {
      if (d === rev || !openE(tx + DX[d], ty + DY[d])) continue;
      const nt = (ty + DY[d]) * MW + tx + DX[d];
      if (avLane[t] && avLane[t] !== 3 && avLane[nt] && avLane[nt] !== 3) {
        if ((laneDir[t] & 1) === (d & 1)) { if (d !== laneDir[t]) continue; }
        else if (d !== c.dir && c.dir === laneDir[t]) continue;   // sin cambiarse de pista (salvo si quedó a contramano)
      }
      ok.push(d);
    }
    if (ok.includes(c.dir) && Math.random() < 0.72) return;
    if (ok.length) { c.dir = ok[(Math.random() * ok.length) | 0]; return; }
    const any = [0, 1, 2, 3].filter((d) => d !== rev && openE(tx + DX[d], ty + DY[d]));
    c.dir = any.length ? any[(Math.random() * any.length) | 0] : rev;
  }
  // el rival va al bidón objetivo (campo distC) esquivando patrullas
  function decideRival(c, tx, ty) {
    const rev = (c.dir + 2) % 4;
    let best = rev, bv = 1e9;
    for (let d = 0; d < 4; d++) {
      const nx = tx + DX[d], ny = ty + DY[d];
      if (!openE(nx, ny)) continue;
      // puede dar la vuelta en U si conviene claramente (como el jugador)
      let v = distC[ny * MW + nx] + (d === rev ? 1.5 : 0);
      for (const e of enemies) if (e.active && e.stun <= 0 && e.hold <= 0 && Math.abs(e.x - (nx * TS + 8)) < 20 && Math.abs(e.y - (ny * TS + 8)) < 20) v += 6;
      if (Math.random() < c.noise) v += Math.random() * 3;
      if (v < bv) { bv = v; best = d; }
    }
    c.dir = best;
  }
  // decidir una casilla antes (para que el dibujo pueda anticipar la curva)
  function planAhead(c, decide) {
    const tx = Math.floor(c.x / TS), ty = Math.floor(c.y / TS), t = ty * MW + tx;
    if (c.tile === t) return;
    c.tile = t;
    const s = DX[c.dir] ? (c.x - (tx * TS + 8)) * DX[c.dir] : (c.y - (ty * TS + 8)) * DY[c.dir];
    if (s >= 0) { c.plan = null; return; }
    const save = c.dir;
    decide(c, tx, ty);
    c.plan = { t, dir: c.dir };
    c.dir = save;
  }
  // hielo: en una casilla congelada nadie dobla (salvo el jugador con clavos), sigue derecho si puede
  const onIce = (tx, ty) => !!S.ice && S.ice[ty * MW + tx] === 1;
  const planned = (decide, open) => (c, tx, ty) => {
    if (onIce(tx, ty) && open(tx + DX[c.dir], ty + DY[c.dir])) { c.plan = null; return; }
    const p = c.plan;
    if (p && p.t === ty * MW + tx && open(tx + DX[p.dir], ty + DY[p.dir])) c.dir = p.dir; else decide(c, tx, ty);
    c.plan = null;
  };
  const decideEnemyP = planned(decideEnemy, openE), decideWildP = planned(decideEnemy, openP), decideCivP = planned(decideCiv, openE), decideRivalP = planned(decideRival, openE);
  const predPlan = (c, tx, ty) => (c.plan && c.plan.t === ty * MW + tx ? c.plan.dir : -1);

  // ---------------- dibujo de autos: curvas (derrape) y orientación
  function curvePos(c) {
    const tx = Math.floor(c.x / TS), ty = Math.floor(c.y / TS);
    for (const k of [0, 1, -1, 2, -2]) {
      const bx = tx + DX[c.dir] * k, by = ty + DY[c.dir] * k;
      if (bx < 0 || by < 0 || bx >= MW || by >= MH) continue;
      const bd = bends.get(by * MW + bx);
      if (!bd) continue;
      const Rr = bd.r, ox = c.x - (bx * TS + 8), oy = c.y - (by * TS + 8);
      const sa = ox * DX[bd.a] + oy * DY[bd.a], pa = ox * DY[bd.a] - oy * DX[bd.a];
      const sb = ox * DX[bd.b] + oy * DY[bd.b], pb = ox * DY[bd.b] - oy * DX[bd.b];
      let u = null;
      if (Math.abs(pa) < 0.5 && sa >= 0 && sa <= Rr) u = -sa;
      else if (Math.abs(pb) < 0.5 && sb >= 0 && sb <= Rr) u = sb;
      if (u == null) continue;
      const ph = ((u + Rr) / (2 * Rr)) * (Math.PI / 2), co = Math.cos(ph), si = Math.sin(ph);
      return [bd.cx - Rr * (co * DX[bd.b] + si * DX[bd.a]), bd.cy - Rr * (co * DY[bd.b] + si * DY[bd.a])];
    }
    return [c.x, c.y];
  }
  function carVisual(c, pred, dt, k, drifter) {
    if (ALLC[S.city].drift) {
      const [tx, ty] = curvePos(c);
      if (c.tpx == null || Math.hypot(tx - c.tpx, ty - c.tpy) > 24) {
        c.vx = tx; c.vy = ty; c.wvx = 0; c.wvy = 0; c.tvx = 0; c.tvy = 0;
      } else {
        // velocidad del punto a seguir (si saltó, como en el giro anticipado, se ignora ese salto)
        const mx = tx - c.tpx, my = ty - c.tpy;
        if (Math.hypot(mx, my) < 4) { c.tvx = mx / dt; c.tvy = my / dt; }
      }
      c.tpx = tx; c.tpy = ty;
      const W = drifter ? 10 : 15;
      c.wvx += (W * W * (tx - c.vx) + 2 * W * (c.tvx - c.wvx)) * dt;
      c.wvy += (W * W * (ty - c.vy) + 2 * W * (c.tvy - c.wvy)) * dt;
      c.vx += c.wvx * dt; c.vy += c.wvy * dt;
      // la trompa apunta hacia donde va el auto; en curvas se adelanta un poco (derrape)
      if (c.hd == null) c.hd = Math.atan2(DY[c.dir], DX[c.dir]);
      if (c.tvx * c.tvx + c.tvy * c.tvy > 1) {
        const h = Math.atan2(c.tvy, c.tvx), dh = wrapA(h - c.hd);
        c.om = Math.abs(dh) < 0.6 ? dh / dt : 0;
        // giro seco en un cruce: la trompa se pasa hacia adentro y la cola se abre
        if (drifter && Math.abs(dh) >= 0.6 && Math.abs(dh) < 2.5) c.lead = Math.sign(dh) * 0.42;
        c.hd = h;
      } else c.om = 0;
      if (drifter) {
        const tgt = clamp(c.om * 0.1, -0.6, 0.6);
        c.lead += (tgt - c.lead) * (1 - Math.exp(-dt * (Math.abs(tgt) > Math.abs(c.lead) ? 12 : 5)));
      } else c.lead = 0;
      c.ang += wrapA(-(c.hd + c.lead + Math.PI / 2) - c.ang) * (drifter ? 0.28 : 0.4);
      // ángulo de derrape: diferencia entre hacia dónde apunta y hacia dónde se mueve
      const sp = Math.hypot(c.wvx, c.wvy);
      c.slip = sp > 30 ? Math.abs(wrapA(-c.ang - Math.PI / 2 - Math.atan2(c.wvy, c.wvx))) : 0;
      c.drift = Math.max(Math.abs(c.lead), c.slip > 1.4 ? 0 : c.slip);
    } else {
      c.vx = c.x; c.vy = c.y;
      const tg = ROT[c.dir], da = wrapA(tg - c.ang);
      c.ang += da * k;
      if (Math.abs(da) < 0.05) c.ang = tg;
    }
  }
  // marcas de neumático y mini turbo al salir de un derrape
  function driftFx(c, dt, isPlayer) {
    const a = c.drift || 0;
    if (a > 0.2) {
      const b = -c.ang - Math.PI / 2, fx = Math.cos(b), fy = Math.sin(b);
      const rx = c.vx - fx * 6, ry = c.vy - fy * 6;
      skid.emit(rx - fy * 4, ry + fx * 4, 0, 0, 2.6, 0x23212d, 0x34364a, 2, 2);
      skid.emit(rx + fy * 4, ry - fx * 4, 0, 0, 2.6, 0x23212d, 0x34364a, 2, 2);
      if (Math.random() < dt * 18) parts.emit(rx, ry, rand(-15, 15), rand(-15, 15), 0.5, 0xd8d4e6, 0x6a6480, 2, 3, 0, 2);
      if (!c.driftT) { if (isPlayer) Snd.sfx('skid'); }
      c.driftT = (c.driftT || 0) + dt;
    } else if (a < 0.12 && c.driftT) {
      if (c.driftT > 0.25 && isPlayer) {
        S.boostT = 0.5; mission('boost');
        for (let i = 0; i < 6; i++) parts.emit(c.vx, c.vy, rand(-40, 40), rand(-40, 40), 0.35, 0x8fe8ff, 0x2f6ff2, 2, 1, 0, 3);
      }
      c.driftT = 0;
    }
  }
  const fwdOf = (rot) => [-Math.sin(rot), -Math.cos(rot)];
  const towards = (c, o) => DX[c.dir] * (o.x - c.x) + DY[c.dir] * (o.y - c.y) > 0;
  const near = (a, b, d) => Math.abs(a.x - b.x) < d && Math.abs(a.y - b.y) < d;
  const zoneSlow = (c) => { const X = S.cross; return !!X && X.walk && c.x > X.zx0 && c.x < X.zx1 && c.y > X.zy0 && c.y < X.zy1; };

  // ---------------- construcción de escenas
  const SHIRTS = ['#ff4f9a', '#4fe3ff', '#ffd23f', '#7dff7a', '#f2f2f2', '#b48cff'];
  function newEnemy(isIcp) {
    return { spr: new Spr(world, (isIcp ? A.carI : A.carE)[0], 10), stars: [new Spr(world, A.star, 30), new Spr(world, A.star, 30)],
      hl: new Spr(world, A.headlight, 13, { transparent: true, add: true }), icp: isIcp, active: false, x: 0, y: 0, dir: 0, ang: 0, stun: 0, hold: 0, spin: 0 };
  }
  function init() {
    if (scene) return;
    A = buildRallyArt();
    A.underglow = T(underglowCanvas());
    A.glowPink = T(glowCanvas('255,255,255', 9));
    const IC = { b: '#22222e', l: '#4a4a5e', d: '#111118', s: '#f2f2f2' };
    A.carI = [rallyCar(IC, 0, true), rallyCar(IC, 1, true)].map(T);
    A.carT = POLICE_LIVERY.map((P) => [rallyCar(P, 0, true), rallyCar(P, 1, true)].map(T));
    A.carTc = POLICE_LIVERY.map((P) => rallyCar(P, 0, true));
    A.heli = T(heliCanvas()); A.rotor = T(rotorCanvas()); A.heliSh = T(whiten(heliCanvas(), '#000000'));
    A.spot = T(spotCanvas(30));
    A.goal = [0, 1, 2, 3].map((f) => T(goalCanvas(f)));
    A.arrow = T(arrowCanvas());
    A.box = [itemBoxCanvas(0), itemBoxCanvas(1)].map(T);
    A.slick = [1, 2, 3].map((s) => T(slickCanvas(s)));
    A.shield = T(shieldCanvas());
    A.ped = SHIRTS.map((c) => [0, 1].map((f) => T(pedCanvas(c, f))));
    A.light = [T(tlightCanvas(false)), T(tlightCanvas(true))];
    initTrackArt();
    A.civ = {};
    A.rival = {};
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1d4a26);
    world = new THREE.Group(); scene.add(world);
    mapSpr = new Spr(world, A.carP[0], 0);
    const ov = (color, opacity, z) => {
      const m = new THREE.Mesh(QUAD, new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
      m.scale.set(MW * TS + 400, MH * TS + 400, 1); m.position.set((MW * TS) / 2, -(MH * TS) / 2, z); m.frustumCulled = false; m.visible = false;
      world.add(m); return m;
    };
    nightOv = ov(0x070726, 0.58, 3);
    tintOv = ov(0xff8040, 0.1, 55);
    parts = new Particles(world, 1100, 24);
    skid = new Particles(world, 900, 2);
    player = { spr: new Spr(world, A.carP[0], 12), glow: new Spr(world, A.underglow, 9, { transparent: true, add: true }), hl: new Spr(world, A.headlight, 13, { transparent: true, add: true }),
      shield: new Spr(world, A.shield, 14, { transparent: true, add: true }).show(false), x: 0, y: 0, dir: 0, ang: 0, vis: true, puffQ: [] };
    for (let i = 0; i < 40; i++) smokes.push({ spr: new Spr(world, A.smoke[0], 20).show(false), life: 0, x: 0, y: 0, hit: new Set(), owner: 'p' });
    for (let i = 0; i < 2; i++) clouds.push({ spr: new Spr(world, A.cloud, 50, { transparent: true }), x: rand(0, MW * TS), y: rand(0, MH * TS) });
    for (let i = 0; i < 8; i++) popups.push({ spr: new Spr(world, textTex('100'), 60).show(false), t: 0 });
    for (let i = 0; i < 28; i++) glows.push(new Spr(world, A.glowPink, 4, { transparent: true, add: true }).show(false));
    A.flags = {};
    for (const code of Object.keys(FLAG_DRAW)) A.flags[code] = [0, 1, 2, 3].map((ph) => T(flagPoleCanvas(code, ph)));
    flagSpr = new Spr(world, A.flags.CL[0], 8, { transparent: true });
    for (let i = 0; i < 8; i++) enemies.push(newEnemy(false));
    enemies.push((icp = newEnemy(true)));
    rival = { spr: new Spr(world, A.carP[0], 11), glow: new Spr(world, A.underglow, 9, { transparent: true, add: true }), hl: new Spr(world, A.headlight, 13, { transparent: true, add: true }),
      shield: new Spr(world, A.shield, 14, { transparent: true, add: true }).show(false), tag: new Spr(world, textTex('RIVAL', '#ffb347'), 31),
      boom: new Spr(world, A.boom[0], 40).show(false), active: false, x: 0, y: 0, dir: 0, ang: 0, puffQ: [] };
    rival.glow.tint('#ff8a1e');
    [rival.spr, rival.glow, rival.hl, rival.tag].forEach((s) => s.show(false));
    for (let i = 0; i < 2; i++) boxes.push({ spr: new Spr(world, A.box[0], 7).show(false), on: false, t: 0, x: 0, y: 0, ph: i * 2 });
    for (let i = 0; i < 16; i++) slicks.push({ spr: new Spr(world, A.slick[i % 3], 2.5, { transparent: true }).show(false), life: 0, x: 0, y: 0, owner: 'p' });
    for (let i = 0; i < 3; i++) civs.push({ spr: new Spr(world, A.carP[0], 9).show(false), hl: new Spr(world, A.headlight, 13, { transparent: true, add: true }).show(false), active: false, x: 0, y: 0, dir: 0, ang: 0, spin: 0, ghost: 0 });
    for (let i = 0; i < 14; i++) peds.push({ spr: new Spr(world, A.ped[i % SHIRTS.length][0], 7).show(false), shirt: i % SHIRTS.length, x: 0, y: 0 });
    for (let i = 0; i < 4; i++) lights.push(new Spr(world, A.light[1], 8).show(false));
    heli = { spr: new Spr(world, A.heli, 45).show(false), rotor: new Spr(world, A.rotor, 46, { transparent: true }).show(false),
      sh: new Spr(world, A.heliSh, 15, { transparent: true, opacity: 0.3 }).show(false), spot: new Spr(world, A.spot, 16, { transparent: true, add: true }).show(false), x: 0, y: 0, on: false };
    heli2 = { spr: new Spr(world, A.heli, 45).show(false), rotor: new Spr(world, A.rotor, 46, { transparent: true }).show(false),
      sh: new Spr(world, A.heliSh, 15, { transparent: true, opacity: 0.3 }).show(false), spot: new Spr(world, A.spot, 16, { transparent: true, add: true }).show(false), x: 0, y: 0, on: false };
    goalSpr = new Spr(world, A.goal[0], 8).show(false);
    for (let i = 0; i < 6; i++) arrows.push(new Spr(world, A.arrow, 58, { transparent: true }).show(false));
    initTrackSprites();
  }
  function initGarage() {
    if (gScene) return;
    gScene = new THREE.Scene();
    gScene.background = new THREE.Color(0x0e0a1e);
    G.bg = new Spr(gScene, T(garageBgCanvas()), -10);
    G.table = { 4: [0, 1].map((p) => T(turntableCanvas(46, p))), 3: [0, 1].map((p) => T(turntableCanvas(36, p))) };
    G.tableSpr = new Spr(gScene, G.table[4][0], -5);
    G.spot = new Spr(gScene, T(glowCanvas('255,240,220', 40)), -4, { transparent: true, add: true });
    G.glow = new Spr(gScene, A.underglow, 1, { transparent: true, add: true });
    G.car = new Spr(gScene, carTex(sel.m, sel.c)[0], 2);
    G.puffs = [];
    for (let i = 0; i < 8; i++) G.puffs.push({ spr: new Spr(gScene, A.smoke[0], 3).show(false), t: 0, life: 0 });
    G.puffT = 0;
  }
  function worldCanvas() {
    const { w, h, latTop, latBot } = WORLD;
    const raw = atob(WORLD.bits);
    const land = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) land[i] = (raw.charCodeAt(i >> 3) >> (i & 7)) & 1;
    const L = (x, y) => x >= 0 && y >= 0 && x < w && y < h && land[y * w + x] === 1;
    const { c, g } = mk(w, h);
    const im = g.createImageData(c.width, c.height), d = im.data;
    // zonas áridas como manchas elípticas (lon, lat, radio lon, radio lat)
    const DESERT = [[10, 23, 24, 7], [47, 23, 10, 6], [133, -25, 13, 6], [102, 43, 13, 4], [20, -24, 6, 4], [-70, -23, 1.6, 7], [-112, 33, 7, 4], [62, 30, 9, 5], [-66, -40, 3, 6]];
    const arid = (lon, lat) => DESERT.reduce((m, [a, b, ra, rb]) => Math.max(m, Math.exp(-(((lon - a) / ra) ** 2 + ((lat - b) / rb) ** 2))), 0);
    const PAL = {
      snow: ['#dfe8f2', '#ffffff', '#a8b8cc'], desert: ['#d6b26a', '#f0d090', '#a8843e'],
      jungle: ['#2f9a54', '#5ac078', '#1c6a38'], temp: ['#4fae64', '#7fd88a', '#2f7a46'],
    };
    const latLines = [60, 30, 0, -30].map((lt) => Math.round(((latTop - lt) / (latTop - latBot)) * h));
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const lat = latTop - ((y + 0.5) / h) * (latTop - latBot), lon = ((x + 0.5) / w) * 360 - 180;
      let col;
      if (L(x, y)) {
        const dz = (bayer(x, y) - 0.5);
        const p = Math.abs(lat) + dz * 6 > 63 || (lat + dz * 4 > 60 && lon > -75 && lon < -12) ? PAL.snow
          : arid(lon, lat) > 0.45 + dz * 0.35 ? PAL.desert
          : Math.abs(lat) + dz * 5 < 16 ? PAL.jungle : PAL.temp;
        col = !L(x, y - 1) || !L(x - 1, y) ? p[1] : !L(x, y + 1) || !L(x + 1, y) ? p[2] : bayer(x, y) < 0.1 ? p[2] : p[0];
      } else if (L(x + 1, y) || L(x - 1, y) || L(x, y + 1) || L(x, y - 1)) col = '#2c4a8c';
      else if (x % 40 === 0 || latLines.includes(y)) col = (x + y) % 2 ? '#22306a' : '#1a2452';
      else col = bayer(x, y) < 0.07 ? '#1a2452' : '#141c44';
      const [rr, gg, bb] = rgb(col), i = (y * c.width + x) * 4;
      d[i] = rr; d[i + 1] = gg; d[i + 2] = bb; d[i + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    return c;
  }
  const cityPx = (i) => ({ x: ((CITIES[i].lon + 180) / 360) * WORLD.w, y: MAPTOP + ((WORLD.latTop - CITIES[i].lat) / (WORLD.latTop - WORLD.latBot)) * WORLD.h });
  function initMap() {
    if (mScene) return;
    mScene = new THREE.Scene();
    mScene.background = new THREE.Color(0x141c44);
    M.world = new Spr(mScene, T(worldCanvas()), 0).at(WORLD.w / 2, MAPTOP + WORLD.h / 2);
    M.mk = { locked: T(markerCanvas('#6a6488')), open: T(markerCanvas('#ff4f9a')), done: T(markerCanvas('#ffd23f')) };
    M.ring = T(ringCanvas('#ffffff', 9));
    M.marks = CITIES.map((c, i) => {
      const p = cityPx(i);
      return { p, dot: new Spr(mScene, M.mk.locked, 5).at(p.x, p.y), ring: new Spr(mScene, M.ring, 4, { transparent: true }).at(p.x, p.y), label: new Spr(mScene, textTex(c.name, '#ffffff'), 6) };
    });
    const pc = planeCanvas();
    M.plane = new Spr(mScene, T(pc), 10);
    M.shadow = new Spr(mScene, T(whiten(pc, '#000000')), 9, { transparent: true, opacity: 0.35 });
    M.parts = new Particles(mScene, 600, 7);
    M.cam = 0;
  }

  // ---------------- HUD de juego
  const coinH = (n) => `<b class="coin"></b>${n}`;
  // letrero verde de autopista: qué pasa (chico) y a dónde vas (grande)
  const signH = (small, big) => `<span><small>${small}</small><b>${big}</b></span><i class="arw" aria-hidden="true"></i>`;
  const odoH = (v) => pad6(v).split('').map((d) => `<i>${d}</i>`).join('');
  function buildHud() {
    UI.setHud(`
      <div class="hrow">
        <div class="hcol"><span class="hlab" id="rsl" hidden>Tú</span><span class="odo" id="rs" aria-label="Puntos">${odoH(0)}</span></div>
        <div class="hcol" style="align-items:center"><span class="hcity" id="rlbl">Santiago</span><span class="hval sun" id="rl">1/3</span></div>
        <div class="hcol" style="align-items:flex-end"><span class="hlab" id="rhl">Récord</span><span class="hval cyan" id="rh">000000</span></div>
      </div>
      <div class="hbl" style="flex-direction:column">
        <div class="hline"><span class="gauge" aria-label="Gas"><b>E</b><span class="fuel" id="rfw"><i id="rf"></i></span><b>F</b></span><span class="islot" id="ri"><img id="rii" alt=""></span></div>
        <div class="hline"><div class="lives" id="rv"></div><span class="hcan" id="rc">10</span><span class="hcoin" id="rm"></span></div>
      </div>
      <canvas id="radar" width="${MW * 2}" height="${MH * 2}"></canvas>
      <div class="banner" id="rb" hidden></div>
      <div class="achpop" id="rach" hidden></div>`);
    hud = { s: UI.$('#rs'), sl: UI.$('#rsl'), l: UI.$('#rl'), lbl: UI.$('#rlbl'), h: UI.$('#rh'), hl: UI.$('#rhl'), f: UI.$('#rf'), fw: UI.$('#rfw'), v: UI.$('#rv'), c: UI.$('#rc'), b: UI.$('#rb'),
      i: UI.$('#ri'), ii: UI.$('#rii'), m: UI.$('#rm') };
    radarCanvas = UI.$('#radar'); rctx = radarCanvas.getContext('2d');
    hudCache = {};
  }
  function banner(t, sub) {
    if (!hud.b) return;
    if (!t) { hud.b.hidden = true; return; }
    hud.b.hidden = false;
    hud.b.innerHTML = `${t}${sub ? `<small>${sub}</small>` : ''}`;
  }

  // ---------------- garaje: inicio (tu gira y a dónde seguir) y taller (autos, pintura, mejoras, equipo)
  const STATS = [['Velocidad', 'vel'], ['Giro', 'giro'], ['Tanque', 'tanque'], ['Gas', 'gas']];
  const GROWS = 6;
  const SMALLW = new Set(['de', 'del', 'y', 'la', 'el', 'en', 'a']);
  // "CIUDAD DE MÉXICO" → "Ciudad de México" · "BÓLIDO GT" → "Bólido GT" · "EE. UU." se queda igual
  const nice = (str) => str.toLowerCase().split(' ').map((w, i) => {
    if (/\d/.test(w) || /^([a-z])\1\.$/.test(w) || (w.length <= 2 && !/[aeiouáéíóú]/.test(w))) return w.toUpperCase();
    if (i > 0 && SMALLW.has(w)) return w;
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(' ');
  const fmtN = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const hubIcons = {};
  const hubIconURL = (k) => hubIcons[k] || (hubIcons[k] = RT.hubIcon(k).toDataURL());
  // la próxima ciudad de la gira: la primera abierta sin terminar; con todo terminado, la que sigue a la última jugada
  function nextCity() {
    const cm = clearedMask(), un = unlocked();
    for (let i = 0; i < NC; i++) if (i < un && !((cm >> i) & 1)) return i;
    return (clamp(Store.get('rally_last', 0), 0, NC - 1) + 1) % NC;
  }
  function openGarage(view) {
    init(); initGarage();
    Snd.loopsOff();
    leaveTrackRun();
    Snd.play(SONGS.garage);
    S.state = 'garage'; S.gView = view || S.gView || 'home';
    S.gRow = S.gRow || 0; S.gUpg = S.gUpg || 0; S.gEq = S.gEq || 0; S.hF = S.hF || 0;
    document.body.classList.add('inmenu');
    if (S.gView === 'home') renderHub(); else renderShop();
  }
  function renderHub() {
    S.gView = 'home';
    UI.setButtons('ELEGIR', 'SALIR');
    const ni = nextCity(), nc = CITIES[ni], cm = clearedMask(), un = unlocked(), left = CITIES.filter((q, i) => !((cm >> i) & 1)).length;
    const fresh = S.score === 0 && !cm;
    const hello = fresh ? '¡Bienvenido a la gira!' : '¡Hola de nuevo!';
    const sub = fresh ? 'Seis ciudades y la policía de cada país detrás de ti.'
      : left === 0 ? `Ya diste la vuelta al mundo. Sigue sumando puntos en la vuelta ${S.loop + 1}.`
      : left === 1 ? 'Solo te falta Tokio para terminar la gira.' : `Te faltan ${left} ciudades para llegar a Tokio.`;
    const route = CITIES.map((q, i) => {
      const st = starsOf(q.id), cls = [(cm >> i) & 1 ? 'done' : '', i === ni ? 'now' : '', i >= un ? 'lock' : ''].join(' ');
      return `<li class="${cls}" title="${nice(q.name)}"><img src="${flagURL(q.flag)}" alt="${nice(q.name)}"><span>${[1, 2, 4].map((b) => (st & b ? '★' : '·')).join('')}</span></li>`;
    }).join('');
    const ms = missionList().list[0], md = MISSIONS[ms.id];
    UI.setHud(`
      <div class="hud-ui gar hub" id="gar">
        <div class="gtitle">Gas Rally${freeMode() ? ' <small class="ptag">MODO PRUEBA</small>' : ''}</div>
        <div class="gbar"><span class="hcoin" id="gco"></span><button class="chip" id="gach">Logros <b>${achPct()} %</b></button><button class="chip" id="gguide">Guía</button></div>
        <div class="gpanel">
          <div class="hhead"><b>${hello}</b><span>${sub}</span></div>
          <ol class="route" aria-label="Ruta de la gira">${route}</ol>
          ${fresh ? '' : `<div class="runst"><span><em>${fmtN(S.score)}</em> puntos</span><span><em>${S.lives}</em> ${S.lives === 1 ? 'auto' : 'autos'}</span>${S.loop ? `<span>Vuelta <em>${S.loop + 1}</em></span>` : ''}</div>`}
          <button class="sign go" data-f="0">${signH(fresh ? 'Empezar la gira en' : 'Seguir la gira en', nice(nc.name))}</button>
          <div class="tiles">
            <button data-f="1"><img src="${hubIconURL('taller')}" alt=""><b>Taller</b><small>Autos y mejoras</small></button>
            <button data-f="2"><img src="${hubIconURL('duel')}" alt=""><b>Duelos</b><small>Contra los rivales</small></button>
            <button data-f="3"><img src="${hubIconURL('esp')}" alt=""><b>Especiales</b><small>Arena, nieve y juguetes</small></button>
            <button data-f="4"><img src="${hubIconURL('rec')}" alt=""><b>Récords</b><small>Los 10 mejores</small></button>
          </div>
          <p class="mis"><b>Misión</b> ${mText(ms)} <em>${Math.min(ms.n, md.n)}/${md.n}</em> <span class="hcoin">${coinH(md.c)}</span></p>
        </div>
      </div>`);
    UI.$('#gco').innerHTML = coinH(S.coins);
    UI.$('#gguide').addEventListener('click', () => openGuide('garage'));
    UI.$('#gach').addEventListener('click', () => openAchs());
    UI.$('#gar').querySelectorAll('[data-f]').forEach((b) => b.addEventListener('click', () => { Snd.unlock(); S.hF = +b.dataset.f; hubAct(S.hF); }));
    markHub();
  }
  function markHub() { const r = UI.$('#gar'); if (r) r.querySelectorAll('[data-f]').forEach((b) => b.classList.toggle('sel', +b.dataset.f === S.hF)); }
  function hubAct(f) {
    if (f === 0) {
      // directo al mapa con el avión rumbo a la próxima ciudad
      const ni = nextCity();
      if (!selReady()) { renderShop(); UI.toast('ELIGE UN AUTO QUE YA TENGAS'); return; }
      Snd.sfx('start'); S.mapMode = 'tour'; openMap({ sel: ni, mode: 'tour' }); travel();
    } else if (f === 1) { Snd.sfx('select'); renderShop(); }
    else if (f === 2) { Snd.sfx('select'); openMap({ sel: clamp(nextCity(), 0, unlocked() - 1), mode: 'duel' }); }
    else if (f === 3) { Snd.sfx('select'); openMap({ mode: 'esp' }); }
    else if (f === 4) { Snd.sfx('select'); openRecords(() => openGarage('home'), null, 'garage'); }
  }
  function updateHub() {
    if (S.hF === 0) {
      if (Input.pressed.down || Input.pressed.right) { S.hF = S.hLast || 1; Snd.sfx('move'); markHub(); }
    } else {
      if (Input.pressed.up) { S.hLast = S.hF; S.hF = 0; Snd.sfx('move'); markHub(); }
      else if (Input.pressed.left) { S.hF = S.hF === 1 ? 4 : S.hF - 1; Snd.sfx('move'); markHub(); }
      else if (Input.pressed.right) { S.hF = S.hF === 4 ? 1 : S.hF + 1; Snd.sfx('move'); markHub(); }
    }
    if (Input.pressed.a || Input.pressed.start) hubAct(S.hF);
    else if (Input.pressed.select) openGuide('garage');
    else if (Input.pressed.b) toMenu();
  }
  function renderShop() {
    S.gView = 'shop';
    UI.setButtons('ELEGIR', 'VOLVER');
    UI.setHud(`
      <div class="hud-ui gar shop" id="gar">
        <div class="gtitle">Taller</div>
        <div class="gbar"><span class="hcoin" id="gco"></span><button class="chip" id="gback">◀ Inicio</button></div>
        <div class="gpanel">
          <div class="grow" data-row="0"><button class="arr" data-d="-1" aria-label="Auto anterior">◀</button><div class="gname"><b id="gcn"></b><small id="gcd"></small></div><button class="arr" data-d="1" aria-label="Auto siguiente">▶</button></div>
          <div class="gstats" id="gst"></div>
          <div class="grow" data-row="1"><span class="glab">Color <em id="gcc"></em></span><div class="sw" id="gcol"></div></div>
          <div class="grow" data-row="2"><span class="glab">Gas y neón <em id="ggc"></em></span><div class="sw" id="ggas"></div></div>
          <div class="grow" data-row="3"><span class="glab">Mejoras <em>para este auto</em></span><div class="upg" id="gupg"></div></div>
          <div class="grow" data-row="4"><span class="glab">Equipo <em>para todos</em></span><div class="upg" id="geq"></div></div>
          <button class="sign slim" id="ggo" data-row="5"></button>
        </div>
      </div>`);
    const root = UI.$('#gar');
    root.querySelectorAll('.arr').forEach((b) => b.addEventListener('click', () => { S.gRow = 0; changeSel(0, +b.dataset.d); }));
    UI.$('#ggo').addEventListener('click', () => { Snd.unlock(); S.gRow = 5; garageGo(); });
    UI.$('#gback').addEventListener('click', () => { Snd.sfx('back'); renderHub(); });
    root.querySelectorAll('.grow').forEach((rw) => rw.addEventListener('pointerdown', () => { S.gRow = +rw.dataset.row; refreshGarage(); }));
    refreshGarage();
  }
  const swBg = (c, sp) => (sp ? `linear-gradient(135deg,${c.l} 0 25%,${c.b} 25% 60%,${c.s} 60% 72%,${c.d} 72%)` : `linear-gradient(135deg,${c.l},${c.b} 55%,${c.d})`);
  const capW = (w) => w.charAt(0) + w.slice(1).toLowerCase();
  function refreshGarage() {
    const root = UI.$('#gar');
    if (!root) return;
    if (S.gView !== 'shop') { const co = UI.$('#gco'); if (co) co.innerHTML = coinH(S.coins); return; }
    const car = CARS[sel.m], id = car.id, has = owned.has(id), col = palOf(sel.m, sel.c), gas = GASES[sel.g], up = upOf(id);
    const paintOk = sel.c < 4 || !!paints[id];
    UI.$('#gco').innerHTML = coinH(S.coins);
    UI.$('#gcn').textContent = nice(car.name);
    const gcd = UI.$('#gcd');
    gcd.innerHTML = has ? car.desc : `Todavía no es tuyo: cuesta ${coinH(car.price)}`;
    gcd.classList.toggle('lock', !has);
    UI.$('#gcc').innerHTML = sel.c < 4 ? capW(col.n) : paintOk ? `${capW(col.n)} ★` : `${capW(col.n)} · ${coinH(PAINT_PRICE)}`;
    UI.$('#ggc').textContent = capW(gas.n);
    UI.$('#gst').innerHTML = STATS.map(([lab, k]) => {
      const b = car[k], u = k === 'gas' ? 0 : Math.min(up[k] || 0, 7 - b);
      return `<span>${lab}</span><span class="bar5">${'<i class="on"></i>'.repeat(b)}${'<i class="up"></i>'.repeat(u)}${'<i></i>'.repeat(7 - b - u)}</span>`;
    }).join('');
    UI.$('#gcol').innerHTML = [...car.colors, car.special].map((c, i) =>
      `<button class="${i === sel.c ? 'on' : ''}${i === 4 ? ' sp' : ''}${i === 4 && !paints[id] ? ' lock' : ''}" data-i="${i}" style="background:${swBg(c, i === 4)}" aria-label="Color ${capW(c.n)}${i === 4 && !paints[id] ? ' (bloqueado)' : ''}"></button>`).join('');
    UI.$('#ggas').innerHTML = GASES.map((c, i) => `<button class="${i === sel.g ? 'on' : ''}" data-i="${i}" style="background:${c.c};box-shadow:0 0 calc(var(--px)*4) ${c.neon},inset 0 0 0 var(--px) #000" aria-label="Gas ${capW(c.n)}"></button>`).join('');
    UI.$('#gupg').innerHTML = UPGS.map(([k, n], i) => {
      const lv = up[k] || 0, max = lv >= 2;
      return `<button class="${i === S.gUpg && S.gRow === 3 ? 'on' : ''}${max ? ' max' : ''}${!has ? ' off' : ''}" data-i="${i}" aria-label="Mejorar ${capW(n)}">${capW(n)}<span class="pips">${'<b class="on"></b>'.repeat(lv)}${'<b></b>'.repeat(2 - lv)}</span><i>${max ? 'Máx' : coinH(UPG_PRICE[lv])}</i></button>`;
    }).join('');
    UI.$('#geq').innerHTML = EQUIP.map((q, i) => {
      const own = hasEq(q.id), on = eqOn(q.id);
      return `<button class="${i === S.gEq && S.gRow === 4 ? 'on' : ''}${own && !on ? ' off' : ''}" data-i="${i}" aria-label="${own ? (on ? 'Apagar' : 'Encender') : 'Comprar'} ${capW(q.n)}">${capW(q.n)}<span class="pips">${own ? (on ? 'Puesto' : 'Apagado') : ''}</span><i>${own ? '✓' : coinH(q.price)}</i></button>`;
    }).join('');
    if (S.gRow === 4) { gcd.innerHTML = EQUIP[S.gEq].d; gcd.classList.remove('lock'); }
    const go = UI.$('#ggo');
    go.classList.toggle('buy', !has || !paintOk);
    go.innerHTML = !has ? signH(`Comprar por ${coinH(car.price)}`, nice(car.name)) : !paintOk ? signH(`Comprar por ${coinH(PAINT_PRICE)}`, `Pintura ${capW(car.special.n)}`) : signH('Listo', 'Volver al inicio');
    UI.$('#gcol').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { sel.c = +b.dataset.i; S.gRow = 1; saveSel(); }));
    UI.$('#ggas').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { sel.g = +b.dataset.i; S.gRow = 2; saveSel(); burstGas(); }));
    UI.$('#gupg').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { S.gRow = 3; S.gUpg = +b.dataset.i; buyUpgrade(S.gUpg); }));
    UI.$('#geq').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { S.gRow = 4; S.gEq = +b.dataset.i; buyEquip(S.gEq); }));
    root.querySelectorAll('[data-row]').forEach((el) => { if (el.classList.contains('grow') || el.id === 'ggo') el.classList.toggle('sel', +el.dataset.row === S.gRow); });
  }
  function saveSel() { Store.set('rally_car', sel); Snd.sfx('move'); refreshGarage(); }
  function changeSel(row, d) {
    if (row === 0) { sel.m = (sel.m + d + CARS.length) % CARS.length; Snd.sfx('select'); }
    else if (row === 1) sel.c = (sel.c + d + 5) % 5;
    else if (row === 2) { sel.g = (sel.g + d + 4) % 4; burstGas(); }
    else return;
    saveSel();
  }
  function buy(price, fn) {
    if (S.coins < price) { Snd.sfx('deny'); UI.toast(`TE FALTAN ${price - S.coins} MONEDAS`); return false; }
    addCoins(-price, true);
    fn();
    Snd.sfx('buy');
    if (S.state === 'garage') { burstGas(); refreshGarage(); }
    return true;
  }
  function garageGo() {
    const car = CARS[sel.m], id = car.id;
    if (!owned.has(id)) { buy(car.price, () => { owned.add(id); Store.set('rally_owned', [...owned]); UI.toast(`¡EL ${car.name} ES TUYO!`); checkMisc(); }); return; }
    if (sel.c >= 4 && !paints[id]) { buy(PAINT_PRICE, () => { paints[id] = true; Store.set('rally_paint', paints); UI.toast(`PINTURA ${car.special.n} LISTA`); }); return; }
    Snd.sfx('select'); renderHub();
  }
  function buyUpgrade(i) {
    const car = CARS[sel.m], id = car.id, [k, n] = UPGS[i], up = upOf(id), lv = up[k] || 0;
    if (!owned.has(id)) { Snd.sfx('deny'); UI.toast('PRIMERO COMPRA ESTE AUTO'); refreshGarage(); return; }
    if (lv >= 2) { Snd.sfx('deny'); UI.toast(`${n} YA ESTÁ AL MÁXIMO`); refreshGarage(); return; }
    buy(UPG_PRICE[lv], () => { up[k] = lv + 1; Store.set('rally_upg', upg); UI.toast(`${n} NIVEL ${lv + 1} · ${car.name}`); });
  }
  function buyEquip(i) {
    const q = EQUIP[i];
    if (!hasEq(q.id)) { buy(q.price, () => { eqOwned[q.id] = 1; Store.set('rally_equip', eqOwned); UI.toast(`${q.n} INSTALADO · SIRVE EN TODOS LOS AUTOS`); ach('equip'); }); return; }
    eqOff[q.id] = !eqOff[q.id]; Store.set('rally_eqoff', eqOff);
    Snd.sfx(eqOff[q.id] ? 'back' : 'select'); UI.toast(`${q.n} ${eqOff[q.id] ? 'APAGADO' : 'PUESTO'}`);
    refreshGarage();
  }
  function burstGas() { G.puffT = 0; for (let i = 0; i < 3; i++) spawnGaragePuff(i * 0.12); }
  function spawnGaragePuff(delay = 0) {
    const p = G.puffs.find((q) => q.life <= 0) || G.puffs[0];
    p.life = 1.6 + delay; p.max = 1.6; p.delay = delay; p.ang = S.gAng || 0;
  }
  function updateGarage(dt) {
    if ((G.puffT += dt) > 0.55) { G.puffT = 0; spawnGaragePuff(); }
    for (const p of G.puffs) if (p.life > 0) p.life -= dt;
    if (S.gView === 'home') { updateHub(); return; }
    if (Input.pressed.up) { S.gRow = (S.gRow + GROWS - 1) % GROWS; Snd.sfx('move'); refreshGarage(); }
    if (Input.pressed.down) { S.gRow = (S.gRow + 1) % GROWS; Snd.sfx('move'); refreshGarage(); }
    for (const [key, d] of [['left', -1], ['right', 1]]) {
      if (!Input.pressed[key]) continue;
      if (S.gRow === 3) { S.gUpg = (S.gUpg + d + 3) % 3; Snd.sfx('move'); refreshGarage(); }
      else if (S.gRow === 4) { S.gEq = (S.gEq + d + EQUIP.length) % EQUIP.length; Snd.sfx('move'); refreshGarage(); }
      else changeSel(S.gRow, d);
    }
    if (Input.pressed.a || Input.pressed.start) { if (S.gRow === 3) buyUpgrade(S.gUpg); else if (S.gRow === 4) buyEquip(S.gEq); else garageGo(); }
    else if (Input.pressed.select) { openGuide('garage'); return; }
    else if (Input.pressed.b) { Snd.sfx('back'); renderHub(); }
  }
  function renderGarage() {
    const W = Engine.W, t = performance.now() / 1000;
    const wide = W >= 360, k = wide ? 4 : 3;
    const cx = wide ? Math.round(W * 0.28) : Math.round(W / 2), cy = wide ? 120 : 50;
    const el = UI.$('#gar');
    if (el) { el.classList.toggle('wide', wide); el.classList.toggle('narrow', !wide); }
    G.bg.at(W / 2, 108);
    G.tableSpr.set(G.table[k][Math.floor(t * 4) & 1]).at(cx, cy + 2);
    G.spot.show(false);
    const ang = (S.gAng = t * 0.7);
    const neon = GASES[sel.g].neon, has = owned.has(CARS[sel.m].id);
    G.car.set(carTex(sel.m, sel.c)[Math.floor(t * 10) & 1]).scaleBy(k).at(cx, cy).rot(ang).tint(has ? '#ffffff' : '#6a6488');
    G.glow.scaleBy(k).tint(neon).at(cx, cy).rot(ang).show(has);
    G.glow.mat.opacity = (0.35 + CARS[sel.m].neon * 0.65) * (0.85 + 0.15 * Math.sin(t * 6));
    for (const p of G.puffs) {
      if (p.life <= 0 || p.life > p.max) { p.spr.show(false); continue; }
      const u = 1 - p.life / p.max, d = (9 + u * 14) * k;
      const f = Math.min(4, Math.floor(u * 5.5));
      p.spr.set(A.smoke[f]).scaleBy(2).tint(GASES[sel.g].c).show(true).at(cx + Math.sin(p.ang) * d, cy + Math.cos(p.ang) * d);
    }
    setCam(0, 0);
    renderScene(gScene);
  }
  // ---------------- mapa mundial
  function openMap(o = {}) {
    init(); initMap();
    Snd.loopsOff();
    leaveTrackRun();
    S.state = 'map';
    S.mapSel = o.sel != null ? o.sel : S.mapSel || 0;
    if (o.mode) S.mapMode = o.mode;
    document.body.classList.add('inmenu');
    UI.setButtons('VIAJAR', 'INICIO');
    Snd.play(SONGS.menu);
    UI.setHud(`
      <div class="hud-ui wmap" id="wmap">
        <div class="wtop"><button class="chip" id="wgar">◀ Inicio</button>${freeMode() ? '<small class="ptag">MODO PRUEBA</small>' : ''}</div>
        <div class="wscore"><span class="wchip" id="wps"></span><span class="wchip" id="wpv"></span><span class="hcoin" id="wco"></span></div>
        <div class="wpanel">
          <div class="wmode" role="group" aria-label="Modo de juego"><button class="chip" id="wmT">Gira</button><button class="chip" id="wmD">Duelo</button><button class="chip" id="wmE">Especiales</button></div>
          <div class="wnav"><button class="arr" id="wprev" aria-label="Anterior">◀</button><div class="wname"><b><img class="flagimg" id="wfl" alt=""> <span id="wcn"></span></b><small id="wcc"></small></div><button class="arr" id="wnext" aria-label="Siguiente">▶</button></div>
          <div class="wst" id="wst"></div>
          <button class="sign slim wgo" id="wgo"></button>
        </div>
      </div>`);
    UI.$('#wprev').addEventListener('click', () => moveMapSel(-1));
    UI.$('#wnext').addEventListener('click', () => moveMapSel(1));
    UI.$('#wgo').addEventListener('click', () => { Snd.unlock(); travel(); });
    UI.$('#wgar').addEventListener('click', () => { Snd.sfx('back'); openGarage('home'); });
    UI.$('#wmT').addEventListener('click', () => setMapMode('tour'));
    UI.$('#wmD').addEventListener('click', () => setMapMode('duel'));
    UI.$('#wmE').addEventListener('click', () => setMapMode('esp'));
    M.parts.clear();
    M.cam = clamp(cityPx(S.mapSel).x - Engine.W / 2, Math.min(0, (WORLD.w - Engine.W) / 2), Math.max(0, WORLD.w - Engine.W));
    M.camY = clamp(cityPx(S.mapSel).y - 78, -6, 70);
    if (o.toast) UI.toast(o.toast);
    refreshMap();
  }
  function setMapMode(m) { if (S.mapMode !== m) { S.mapMode = m; Snd.sfx('select'); refreshMap(); } }
  function moveMapSel(d) {
    if (S.mapMode === 'esp') S.espSel = ((S.espSel || 0) + d + TRACKS.length) % TRACKS.length;
    else S.mapSel = (S.mapSel + d + CITIES.length) % CITIES.length;
    Snd.sfx('move'); refreshMap();
  }
  const MODES = ['tour', 'duel', 'esp'];
  const trackIcons = {};
  const trackIconURL = (k) => trackIcons[k] || (trackIcons[k] = RT.icon(k).toDataURL());
  const iconOf = (c) => (c.kind ? trackIconURL(c.kind) : flagURL(c.flag));
  const starsH = (mask) => `<span class="stars">${[1, 2, 4].map((b) => `<i class="${mask & b ? 'on' : ''}">★</i>`).join('')}</span>`;
  function refreshEsp() {
    const i = S.espSel || 0, t = TRACKS[i], open = trackOpen(i), st = starsOf(t.id), best = (Store.get('rally_best', {})[t.id] || {}).score;
    UI.$('#wcn').textContent = nice(t.name);
    UI.$('#wfl').src = trackIconURL(t.kind); UI.$('#wfl').alt = '';
    UI.$('#wcc').textContent = t.tag;
    const needEq = t.need && !hasEq(t.need) && !freeMode();
    UI.$('#wst').innerHTML = open ? `${starsH(st)} ${best ? `Récord ${fmtN(best)}` : t.rounds === 1 ? 'Un show de 90 segundos' : 'Tres rondas'}`
      : needEq ? 'Necesitas las ruedas con clavos. Las compras en el taller.' : `Ábrela una vez y es tuya para siempre.`;
    UI.$('#wst').classList.toggle('lock', !open);
    const go = UI.$('#wgo');
    go.disabled = !open && needEq;
    go.classList.toggle('buy', !open && !needEq);
    go.innerHTML = signH(open ? 'Jugar en' : needEq ? 'Faltan los clavos para' : `Abrir por ${coinH(t.price)}`, nice(t.name));
  }
  function refreshMap() {
    const c = CITIES[S.mapSel], i = S.mapSel, open = i < unlocked(), done = (clearedMask() >> i) & 1, duel = S.mapMode === 'duel';
    if (!UI.$('#wcn')) return;
    const esp = S.mapMode === 'esp';
    MODES.forEach((m, k) => { const b = UI.$(['#wmT', '#wmD', '#wmE'][k]); b.classList.toggle('on', S.mapMode === m); b.setAttribute('aria-pressed', String(S.mapMode === m)); });
    UI.$('#wps').innerHTML = `<em>${fmtN(S.score)}</em> pts`;
    UI.$('#wpv').innerHTML = `<em>${S.lives}</em> ${S.lives === 1 ? 'auto' : 'autos'}`;
    UI.$('#wco').innerHTML = coinH(S.coins);
    UI.$('#wgo').classList.remove('buy');
    if (esp) { refreshEsp(); return; }
    UI.$('#wcn').textContent = nice(c.name);
    UI.$('#wfl').src = flagURL(c.flag); UI.$('#wfl').alt = `Bandera de ${nice(c.country)}`;
    UI.$('#wcc').textContent = `${nice(c.country)}: ${(duel ? c.life : c.tag).toLowerCase()}`;
    const wins = Store.get('rally_duels', {})[c.id] || 0, best = Store.get('rally_best', {})[c.id] || {};
    const rv = nice(RIVALS[c.id].name);
    UI.$('#wst').innerHTML = !open ? `Termina ${nice(CITIES[i - 1].name)} en la gira para abrirla.`
      : duel ? `Corre contra ${rv}: el primero en juntar ${DUEL_WIN} bidones gana ${80 + 20 * i} monedas.${wins ? ` Le has ganado ${wins} ${wins === 1 ? 'vez' : 'veces'}.` : ''}`
      : done ? `${starsH(starsOf(c.id))} Récord ${fmtN(best.score || 0)} en ${fmtT(best.time || 0)}` : `${starsH(0)} Tres rondas y un escape final.`;
    UI.$('#wst').classList.toggle('lock', !open);
    UI.$('#wgo').disabled = !open;
    UI.$('#wgo').innerHTML = signH(!open ? 'Bloqueada' : duel ? 'Desafiar a' : 'Viajar a', duel && open ? rv : nice(c.name));
  }
  function travel() {
    if (S.state !== 'map') return;
    if (S.mapMode === 'esp') {
      const i = S.espSel || 0, t = TRACKS[i];
      if (trackOpen(i)) { Snd.sfx('start'); openLoading(NC + i); return; }
      if (t.need && !hasEq(t.need)) { Snd.sfx('deny'); UI.toast('PRIMERO COMPRA LAS RUEDAS CON CLAVOS EN EL GARAJE'); return; }
      if (buy(t.price, () => { tracksBought.add(t.id); Store.set('rally_tracks', [...tracksBought]); })) { UI.toast(`¡${t.name} ABIERTA!`); ach('track'); }
      refreshMap();
      return;
    }
    const ci = S.mapSel;
    if (ci >= unlocked()) { Snd.sfx('back'); UI.toast('CIUDAD BLOQUEADA'); return; }
    const p1 = cityPx(ci);
    let p0 = S.from != null ? cityPx(S.from) : { x: p1.x - 80, y: p1.y + 26 };
    if (S.from === ci) p0 = { x: p1.x - 46, y: p1.y - 24 };
    const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
    const mx = (p0.x + p1.x) / 2, my = (p0.y + p1.y) / 2 - dist * 0.22;
    S.tripFrom = S.from;
    S.trip = { p0, p1, c: { x: mx, y: my }, t: 0, dur: 1.1 + dist / 150, ci, dot: 0 };
    S.state = 'travel';
    M.parts.clear();
    Snd.sfx('fly');
  }
  function updateMap(dt) {
    if (S.state === 'map') {
      if (Input.pressed.left) moveMapSel(-1);
      if (Input.pressed.right) moveMapSel(1);
      if (Input.pressed.up || Input.pressed.down) setMapMode(MODES[(MODES.indexOf(S.mapMode) + (Input.pressed.down ? 1 : 2)) % 3]);
      if (Input.pressed.a || Input.pressed.start) travel();
      else if (Input.pressed.select) openGuide('map');
      else if (Input.pressed.b) { Snd.sfx('back'); openGarage('home'); }
    } else if (S.state === 'travel') {
      const tr = S.trip;
      tr.t = Math.min(tr.dur, tr.t + dt);
      const u = tr.t / tr.dur, e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      const q = (a, b, c) => (1 - e) * (1 - e) * a + 2 * (1 - e) * e * b + e * e * c;
      const x = q(tr.p0.x, tr.c.x, tr.p1.x), y = q(tr.p0.y, tr.c.y, tr.p1.y);
      const dx = 2 * (1 - e) * (tr.c.x - tr.p0.x) + 2 * e * (tr.p1.x - tr.c.x), dy = 2 * (1 - e) * (tr.c.y - tr.p0.y) + 2 * e * (tr.p1.y - tr.c.y);
      if (Math.hypot(dx, dy) > 0.01) S.planeAng = Math.atan2(dy, dx);
      if (S.planeX != null && Math.hypot(x - S.planeX, y - S.planeY) > 0) {
        tr.dot += Math.hypot(x - S.planeX, y - S.planeY);
        while (tr.dot >= 4) { tr.dot -= 4; M.parts.emit(x, y, 0, 0, 999, 0xff4f9a, 0xff4f9a, 1, 1); }
      }
      S.planeX = x; S.planeY = y; S.planeAlt = Math.sin(Math.PI * u) * 9;
      if (tr.t >= tr.dur) { S.state = 'arrive'; S.t = 0; Snd.sfx('fuelS'); }
    } else if (S.state === 'arrive') {
      S.t += dt;
      if (S.t > 1.1) { S.from = S.trip.ci; openLoading(S.trip.ci); }
    }
  }
  function renderMap() {
    const W = Engine.W, t = performance.now() / 1000;
    const flying = S.state === 'travel' || S.state === 'arrive';
    const focus = flying ? S.planeX : cityPx(S.mapSel).x;
    const target = W >= WORLD.w ? (WORLD.w - W) / 2 : clamp(focus - W / 2, 0, WORLD.w - W);
    M.cam += (target - M.cam) * 0.12;
    const fy = flying ? S.planeY : cityPx(S.mapSel).y;
    const ty = clamp(fy - 78, -6, 70);
    M.camY = M.camY == null ? ty : M.camY + (ty - M.camY) * 0.12;
    const wm = UI.$('#wmap');
    if (wm) wm.classList.toggle('flying', flying);
    const un = unlocked(), cm = clearedMask();
    M.marks.forEach((m, i) => {
      const st = (cm >> i) & 1 ? 'done' : i < un ? 'open' : 'locked';
      m.dot.set(M.mk[st]).at(m.p.x, m.p.y);
      const isSel = i === S.mapSel && !flying;
      m.ring.show((isSel && Math.floor(t * 3) % 2 === 0) || (S.state === 'arrive' && i === S.trip.ci && Math.floor(t * 8) % 2 === 0)).at(m.p.x, m.p.y);
      const col = i === S.mapSel ? '#ffffff' : st === 'locked' ? '#8a84a8' : st === 'done' ? '#ffd23f' : '#ff9ac8';
      const tex = textTex(CITIES[i].name, col);
      m.label.set(tex);
      const lx = CITIES[i].side < 0 ? m.p.x - 7 - tex.w / 2 : m.p.x + 7 + tex.w / 2;
      m.label.at(lx, m.p.y);
    });
    if (flying) {
      const a = S.planeAlt;
      M.plane.show(true).at(S.planeX, S.planeY - a).rot(-(S.planeAng + Math.PI / 2));
      M.shadow.show(true).at(S.planeX + a * 0.4, S.planeY + 2).rot(-(S.planeAng + Math.PI / 2));
    } else if (S.from != null) {
      const p = cityPx(S.from);
      M.plane.show(true).at(p.x + 1, p.y - 9).rot(0);
      M.shadow.show(false);
    } else { M.plane.show(false); M.shadow.show(false); }
    M.parts.sync();
    setCam(Math.round(M.cam), Math.round(M.camY));
    renderScene(mScene);
  }

  // ---------------- ciudad, rondas y duelo
  function applyCar() {
    const car = CARS[sel.m];
    S.spd = 70 + statOf(sel.m, 'vel') * 4;
    S.turnWin = 1 + statOf(sel.m, 'giro');
    S.drain = Math.max(0.55, 1.3 - statOf(sel.m, 'tanque') * 0.1);
    S.smokeCost = 6 - car.gas;
    S.neon = car.neon;
    S.gasHex = hexNum(GASES[sel.g].c);
    player.glow.tint(GASES[sel.g].neon);
    S.drill = eqOn('taladro');
    S.spikes = eqOn('clavos') || (freeMode() && ALLC[S.city] && ALLC[S.city].kind === 'snow' && !hasEq('clavos'));
    if (S.spikes) S.turnWin += 1;
  }
  function resetRun() { Object.assign(S, { score: 0, lives: 3, nextLife: 20000, loop: 0 }); }
  // la gira se guarda (puntos, autos y vuelta) para continuarla otro día; las pistas especiales van aparte
  function saveRun() { if (!S.inTrack) Store.set('rally_run', { score: S.score, lives: S.lives, nextLife: S.nextLife, loop: S.loop }); }
  function loadRun() {
    const r = Store.get('rally_run', null);
    if (r && r.lives > 0) Object.assign(S, { score: r.score || 0, lives: r.lives, nextLife: r.nextLife || 20000, loop: r.loop || 0 });
    else resetRun();
  }
  function enterTrackRun() {
    if (!S.inTrack) { S.stash = { score: S.score, lives: S.lives, nextLife: S.nextLife }; S.inTrack = true; }
    Object.assign(S, { score: 0, lives: 3, nextLife: 20000 });
  }
  function leaveTrackRun() { if (S.inTrack) { Object.assign(S, S.stash); S.inTrack = false; } }
  function enterPlay(ci, mode, round = 0) {
    init();
    if (!owned.has(CARS[sel.m].id)) { sel.m = 0; sel.c = 0; }
    if (sel.c >= 4 && !paints[CARS[sel.m].id]) sel.c = 0;
    S.mode = mode; S.city = ci; S.round = mode === 'tour' ? clamp(round, 0, (ALLC[ci].rounds || ROUNDS) - 1) : 0;
    Snd.sirenStyle(SIREN_OF[ALLC[ci].id] || 'wail');
    if (ci >= NC) enterTrackRun(); else { leaveTrackRun(); if (mode === 'tour') saveRun(); }
    Object.assign(S, { cityTime: 0, cityDeaths: 0, cityScore0: S.score || 0, escape: null, spotted: false, combo: 0, comboT: 0 });
    Store.set('rally_last', ci);
    document.body.classList.remove('inmenu');
    UI.setButtons('GAS', 'ÍTEM');
    buildHud();
    applyCar();
    Snd.play(SONGS[ALLC[ci].song || ALLC[ci].id] || SONGS.rally);
    beginRound();
  }
  function startCity(ci, round = 0) { enterPlay(ci, 'tour', round); }
  function startDuel(ci) {
    S.duelP = 0; S.duelR = 0; S.duelN = (S.duelN || 0) + 1;
    enterPlay(ci, 'duel');
  }
  function setupRival(ci) {
    const rv = RIVALS[CITIES[ci].id], m = carIdx(rv.car);
    let col = rv.c;
    if (m === sel.m && col === sel.c) col = (col + 1) % 4;
    rival.frames = carTex(m, col);
    rival.name = rv.name;
    rival.spd = 68 + ci * 3.4;
    rival.noise = Math.max(0.05, 0.25 - ci * 0.04);
    rival.tag.set(textTex(rv.name, '#ffb347'));
  }
  function resetRival() {
    placeCar(rival, rivalTile, 0);
    Object.assign(rival, { dead: 0, inv: 0, smokeCd: 1.5, nitroT: 0, shieldT: 0, magT: 0, oilT: 0, oilAcc: 0, slowT: 0, spinT: 0, spinA: 0, retT: 0,
      target: null, item: null, useT: 0, puffQ: [], driftT: 0 });
    rival.spr.show(true); rival.glow.show(true); rival.boom.show(false);
    bfs(distV, rivalTile[0], rivalTile[1]);
    lastVT = rivalTile[1] * MW + rivalTile[0];
  }
  function beginRound() {
    if (S.mode === 'duel') setupRival(S.city);
    buildRound();
    resetActors(true);
    parts.clear(); skid.clear();
    for (const s of slicks) { s.life = 0; s.spr.show(false); }
    boxes.forEach((b, i) => { b.on = false; b.t = 1.5 + i * 3.5; b.spr.show(false); });
    setupCivs();
    setupCross();
    hideHeli(); S.escape = null; S.spotted = false;
    S.playT = 0; S.icpOn = false; S.icpDone = false;
    // interceptor: ronda 3 a los 30 s; desde México también en la ronda 1 (en FÁCIL no aparece)
    const icpR1 = S.round === 0 && (lvl() >= 2 || S.loop > 0 || diff() >= 2);
    S.icpAt = S.mode === 'tour' && !S.bonus && S.trk !== 'arena' && diff() > 0 && (S.round === 2 || icpR1) ? (S.round === 2 ? 30 : 40) : Infinity;
    S.quakeT = rand(16, 26);
    S.state = 'intro'; S.t = 0; S.lastStep = -1; S.quick = false;
    const c = ALLC[S.city];
    const flag = `<img class="flagimg" src="${iconOf(c)}" alt="${c.kind ? '' : `Bandera de ${c.country}`}">`;
    if (S.mode === 'duel') banner(`${flag} DUELO EN ${c.name}`, `VS ${rival.name} · GANA QUIEN JUNTE ${DUEL_WIN} DE ${DUEL_CANS}`);
    else if (S.round === 0) banner(`${flag} ${c.name}`, `${c.country} · ${c.tag}`);
    else banner(`RONDA ${S.round + 1}/${roundsOf()}`, S.bonus ? 'RONDA DE BONO · LAS PATRULLAS ESPERAN' : 'JUNTA LOS 10 BIDONES');
  }
  function setupCivs() {
    const city = ALLC[S.city];
    if (!A.civ[city.id]) A.civ[city.id] = city.civ.map(([k, P]) => (k === 'plow' ? A.plow : [0, 1].map((f) => T(civCanvas(k, P, f)))));
    const tex = A.civ[city.id];
    const lanes = S.roadTiles.filter(([x, y]) => avLane[y * MW + x] === 1 || avLane[y * MW + x] === 2);
    const taken = [];
    const md = (x, y, [a, b]) => Math.abs(x - a) + Math.abs(y - b);
    civs.forEach((cv, i) => {
      cv.active = i < city.civ.length;
      if (!cv.active) { cv.spr.show(false); cv.hl.show(false); return; }
      cv.frames = tex[i]; cv.spr.set(tex[i][0]).show(true); cv.hl.show(!!city.night);
      cv.bus = city.civ[i][0] === 'bus' || city.civ[i][0] === 'plow'; cv.plow = city.civ[i][0] === 'plow';
      const ok = ([x, y]) => !rockAt[y * MW + x] && md(x, y, startTile) > 8 && !inCross(x, y) && !bends.has(y * MW + x) &&
        !taken.some((t) => md(x, y, t) < 7) && !enemyStarts.some((t) => md(x, y, t) < 3) && (S.mode !== 'duel' || md(x, y, rivalTile) > 6);
      let pool = (i < 2 && lanes.length ? lanes : S.roadTiles).filter(ok);
      if (!pool.length) pool = S.roadTiles.filter(ok);
      const [x, y] = pool.length ? pool[(Math.random() * pool.length) | 0] : S.roadTiles[0];
      taken.push([x, y]);
      let d = laneDir[y * MW + x];
      if (d < 0 || !openE(x + DX[d], y + DY[d])) { const ds = [0, 1, 2, 3].filter((k) => openE(x + DX[k], y + DY[k])); d = ds.length ? ds[(Math.random() * ds.length) | 0] : 0; }
      placeCar(cv, [x, y], d);
      cv.spin = 0; cv.ghost = 0; cv.spinT = 0;
    });
  }
  // cruce peatonal "scramble" de Tokio: 7 s pasan autos, 4,6 s cruzan peatones en todas direcciones
  function setupCross() {
    const X = S.cross;
    peds.forEach((p) => p.spr.show(false));
    lights.forEach((l) => l.show(false));
    if (!X) return;
    const x0 = X.ix * TS, y0 = X.iy * TS;
    X.zx0 = x0 - 16; X.zx1 = x0 + 48; X.zy0 = y0 - 16; X.zy1 = y0 + 48;
    X.corners = [[x0 - 6, y0 - 6], [x0 + 38, y0 - 6], [x0 + 38, y0 + 38], [x0 - 6, y0 + 38]];
    X.walk = false; X.t = 3.5;
    const lp = [[x0 - 3, y0 - 9], [x0 + 35, y0 - 9], [x0 + 35, y0 + 31], [x0 - 3, y0 + 31]];
    lights.forEach((l, i) => l.show(true).set(A.light[1]).at(lp[i][0], lp[i][1]));
    peds.forEach((p, i) => {
      p.home = i % 4; p.walking = false; p.ox = 0; p.oy = 0; p.delay = 0;
      const [cx, cy] = X.corners[p.home];
      p.x = cx + rand(-4, 4); p.y = cy + rand(-4, 4);
      p.spr.show(true);
    });
  }
  function updateCross(dt) {
    const X = S.cross;
    if (!X) return;
    if ((X.t -= dt) <= 0) {
      X.walk = !X.walk; X.t = X.walk ? 4.6 : 7;
      lights.forEach((l) => l.set(A.light[X.walk ? 0 : 1]));
      if (X.walk) {
        if (Math.hypot(player.x - (X.ix * TS + 16), player.y - (X.iy * TS + 16)) < 220) Snd.sfx('whistle');
        for (const p of peds) {
          const to = (p.home + 1 + ((Math.random() * 3) | 0)) % 4;
          const [tx, ty] = X.corners[to];
          p.tx = tx + rand(-4, 4); p.ty = ty + rand(-4, 4);
          p.delay = rand(0, 0.7);
          p.spd = Math.hypot(p.tx - p.x, p.ty - p.y) / rand(2.8, 3.7);
          p.walking = true; p.home = to;
        }
      }
    }
    const movers = [player, ...enemies.filter((e) => e.active), ...civs.filter((c) => c.active)];
    if (rival && rival.active) movers.push(rival);
    for (const p of peds) {
      if (p.walking && (p.delay -= dt) <= 0) {
        const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy), st = p.spd * dt;
        if (d <= st) { p.x = p.tx; p.y = p.ty; p.walking = false; } else { p.x += (dx / d) * st; p.y += (dy / d) * st; }
      }
      let fx = 0, fy = 0;
      for (const c of movers) {
        const dx = p.x + p.ox - c.vx, dy = p.y + p.oy - c.vy, d = Math.hypot(dx, dy);
        if (d < 12 && d > 0.01) { fx += dx / d; fy += dy / d; }
      }
      p.ox = clamp(p.ox * (1 - dt * 2.5) + fx * dt * 80, -10, 10);
      p.oy = clamp(p.oy * (1 - dt * 2.5) + fy * dt * 80, -10, 10);
    }
  }
  function addScore(n, x, y) {
    S.score += n;
    if (S.score >= S.nextLife) { S.nextLife += 20000; S.lives = Math.min(S.lives + 1, 6); Snd.sfx('oneup'); popup('1UP', x != null ? x : player.x, (y != null ? y : player.y) - 10, '#7dff7a'); }
    if (x !== undefined) popup(String(n), x, y, '#ffffff');
  }
  function popup(str, x, y, col) {
    const p = popups.find((q) => q.t <= 0) || popups[0];
    p.spr.set(textTex(str, col)).show(true);
    p.x = x; p.y = y; p.t = 1.1;
  }
  function crash() {
    if (S.state !== 'play') return;
    S.state = 'dying'; S.t = 0;
    player.vis = false; player.shield.show(false);
    Snd.sfx('crash');
    shake(4, 0.5); flash(0.35, [1, 0.6, 0.4]);
    UI.vibrate([80, 40, 120]);
    if (S.mode === 'tour') S.cityDeaths++;
    S.combo = 0; S.comboT = 0;
    S.boom = { t: 0, x: player.vx, y: player.vy, spr: S.boom ? S.boom.spr : new Spr(world, A.boom[0], 40) };
    S.boom.spr.show(true).at(player.vx, player.vy);
    parts.burst(player.vx, player.vy, 40, 140, 0.8, 0xffd84a, 0x7a2a3a, 2, 1, 0, 3);
    parts.burst(player.vx, player.vy, 14, 60, 1.4, 0x9ba3c0, 0x2a2638, 2, 2, 0, 1);
  }
  function respawnPlayer() {
    placeCar(player, startTile, 0);
    player.vis = true;
    Object.assign(S, { want: -1, wantT: 0, invT: 2.2, spinT: 0, spinA: 0, nitroT: 0, oilT: 0, slowT: 0, state: 'play' });
    S.fuel = Math.max(S.fuel, 40);
    lastPT = -1;
    S.boom.spr.show(false);
    UI.toast('¡DE VUELTA A LA PISTA!');
  }
  // ---------------- gas, escape y estela
  function dropSmoke(c, isP) {
    if (isP) {
      if (S.smokeCd > 0 || S.fuel <= 0) return;
      S.smokeCd = 0.42;
      S.fuel = Math.max(0, S.fuel - S.smokeCost);
    }
    Snd.sfx('smoke');
    c.puffQ = [0, 0.07, 0.14];
  }
  function tickPuffs(c, dt, owner) {
    if (!c.puffQ || !c.puffQ.length) return;
    for (let i = 0; i < c.puffQ.length; i++) c.puffQ[i] -= dt;
    while (c.puffQ.length && c.puffQ[0] <= 0) { c.puffQ.shift(); spawnPuff(c, owner); }
  }
  function spawnPuff(c, owner) {
    const s = smokes.find((q) => q.life <= 0) || smokes[0];
    const [fx, fy] = fwdOf(c.ang);
    s.x = c.vx - fx * 9 + rand(-1, 1); s.y = c.vy - fy * 9 + rand(-1, 1);
    s.life = 3.2; s.max = 3.2; s.hit.clear(); s.owner = owner;
    s.spr.show(true).set(A.smoke[0]).tint(owner === 'p' ? GASES[sel.g].c : '#ffc890').at(s.x, s.y);
    for (let k = 0; k < 4; k++) parts.emit(s.x, s.y, rand(-20, 20), rand(-20, 20), 0.5, 0xffffff, owner === 'p' ? S.gasHex : 0xffb347, 2, 1, 0, 3);
  }
  function exhaust(c, nitro, dt) {
    const [fx, fy] = fwdOf(c.ang);
    const bx = c.vx - fx * 8, by = c.vy - fy * 8;
    if (Math.random() < dt * 14) parts.emit(bx + rand(-1, 1), by + rand(-1, 1), -fx * 18 + rand(-6, 6), -fy * 18 + rand(-6, 6), 0.35, 0xc8c3d8, 0x5a5468, 2, 1, 0, 2);
    if (nitro) for (let k = 0; k < 2; k++) {
      const blue = Math.random() < 0.4;
      parts.emit(bx + rand(-2, 2), by + rand(-2, 2), -fx * 60 + rand(-10, 10), -fy * 60 + rand(-10, 10), 0.22, blue ? 0x8fe8ff : 0xffe14a, blue ? 0x2f6ff2 : 0xff3a2a, 2, 1, 0, 2);
    }
  }
  function headlight(s, x, y, rot) { const [fx, fy] = fwdOf(rot); s.at(x + fx * 17, y + fy * 17).rot(rot); }

  // ---------------- ítems de la calle
  function spawnBox(b) {
    const busy = (x, y) => cans.some((c) => !c.got && Math.abs(c.x - x) < 28 && Math.abs(c.y - y) < 28) ||
      boxes.some((o) => o !== b && o.on && Math.abs(o.x - x) < 96 && Math.abs(o.y - y) < 96);
    for (let k = 0; k < 50; k++) {
      const [tx, ty] = S.roadTiles[(Math.random() * S.roadTiles.length) | 0];
      const i = ty * MW + tx, d = distA[i], x = tx * TS + 8, y = ty * TS + 8;
      if (rockAt[i] || d < 8 || d > 34 || inCross(tx, ty) || bends.has(i) || busy(x, y)) continue;
      b.x = x; b.y = y; b.on = true; b.spr.show(true);
      parts.burst(x, y, 10, 50, 0.4, 0xffffff, 0x7a6ae8, 1, 1, 0, 3);
      return;
    }
    b.t = 1;
  }
  function updateBoxes(dt) {
    for (const b of boxes) {
      if (!b.on) { if ((b.t -= dt) <= 0) spawnBox(b); continue; }
      if (player.vis && near(b, player, 12)) takeBox(b, player);
      else if (rival && rival.active && rival.dead <= 0 && near(b, rival, 12)) takeBox(b, rival);
    }
  }
  function takeBox(b, c) {
    b.on = false; b.t = 9; b.spr.show(false);
    parts.burst(b.x, b.y, 14, 70, 0.5, 0xd8c8ff, 0x7a6ae8, 2, 1, 0, 3);
    if (c === player) {
      Snd.sfx('item'); UI.vibrate(20); mission('boxes');
      if (S.item || S.rollT > 0) { addCoins(5); popup('+5', b.x, b.y - 10, '#ffd23f'); return; }
      S.rollT = 0.7; S.rollItem = rollItem();
    } else if (!rival.item) { rival.item = rollItem(); rival.useT = rand(0.5, 1.6); }
  }
  function useItem() {
    if (!S.item || S.rollT > 0 || !player.vis) return;
    const k = S.item;
    S.item = null;
    applyItem(S, k);
    UI.toast(`¡${ITEMS[k].n}!`);
    UI.vibrate(k === 'nitro' ? [30, 30, 30, 30, 60] : 20);
    if (k === 'nitro') mission('nitro');
  }
  function applyItem(st, k, quiet) {
    const sfx = (n) => { if (!quiet) Snd.sfx(n); };
    if (k === 'nitro') { st.nitroT = 3.2; sfx('nitro'); }
    else if (k === 'iman') { st.magT = 8; sfx('shield'); }
    else if (k === 'escudo') { st.shieldT = 15; sfx('shield'); }
    else if (k === 'aceite') { st.oilT = 3.2; st.oilAcc = 14; sfx('oil'); }
  }
  function dropSlick(c, owner) {
    const s = slicks.reduce((a, b) => (b.life < a.life ? b : a));
    const [fx, fy] = fwdOf(c.ang);
    s.x = c.vx - fx * 10; s.y = c.vy - fy * 10; s.life = 8; s.owner = owner;
    s.spr.set(A.slick[(Math.random() * 3) | 0]).show(true).at(s.x, s.y);
  }
  function magnet(c, dt) {
    for (const k of cans) {
      if (k.got) continue;
      const dx = c.x - k.x, dy = c.y - k.y, d = Math.hypot(dx, dy);
      if (d < 64 && d > 1) {
        const m = Math.min(d, 150 * dt);
        k.x += (dx / d) * m; k.y += (dy / d) * m;
        if (Math.random() < dt * 20) parts.emit(k.x, k.y, (dx / d) * 40, (dy / d) * 40, 0.25, 0xff8a8a, 0x8a2a3a, 1, 1);
      }
    }
  }
  function shieldBreak(st) {
    st.shieldT = 0;
    Snd.sfx('shieldOff'); flash(0.2, [0.5, 0.9, 1]);
    if (st === S) UI.vibrate([40, 30, 60]);
  }
  function breakRock(rk) {
    rockAt[rk.y * MW + rk.x] = 0;
    if (rk.snow) { rk.gone = true; rk.spr.show(false); } else rk.spr.remove();
    S.rockList.splice(S.rockList.indexOf(rk), 1);
    parts.burst(rk.cx, rk.cy, 24, 110, 0.6, 0xff8a1e, 0xf4f1ea, 2, 1, 0, 3);
    Snd.sfx('explode'); shake(2, 0.25); UI.vibrate(60);
    lastPT = -1; lastVT = -1;
    addCoins(2); mission('rocks');
  }

  // ---------------- bidones
  function gotCan(c, who) {
    c.got = true; c.spr.show(false); c.glow.show(false);
    parts.burst(c.x, c.y, 18, 90, 0.6, c.kind === 'S' ? 0xfff09a : c.kind === 'L' ? 0xa6ffcf : 0xffd84a, 0xff6a3a, 2, 1, 0, 3);
    if (S.mode === 'duel') {
      if (who === rival) {
        S.duelR++; Snd.sfx('tick'); popup(`${S.duelR}/${DUEL_WIN}`, c.x, c.y - 10, '#ffb347');
        rival.slowT = 0.6;
        if (S.duelR >= DUEL_WIN) { duelEnd(false); return true; }
        return false;
      }
      S.duelP++; S.fuel = Math.min(100, S.fuel + 12); addCoins(3); Snd.sfx('fuel', { rate: canRate(S.duelP) }); comboHit(c); mission('cans');
      popup(`${S.duelP}/${DUEL_WIN}`, c.x, c.y - 10, '#ffffff');
      if (S.duelP >= DUEL_WIN) { duelEnd(true); return true; }
      return false;
    }
    if (S.trk === 'arena') {
      // en la arena los bidones reaparecen: el show dura lo que dura el reloj
      S.collected++; comboHit(c); mission('cans');
      const pts = (200 + 100 * Math.min(S.combo, 5)) * (S.special ? 2 : 1);
      S.fuel = Math.min(100, S.fuel + (c.kind === 'L' ? 40 : 15));
      addCoins(c.kind === 'N' ? 2 : 5);
      if (c.kind === 'S') { S.special = true; Snd.sfx('fuelS'); UI.toast('¡BIDÓN S! PUNTOS ×2 HASTA EL FINAL'); flash(0.25, [1, 0.9, 0.4]); }
      else if (c.kind === 'L') { Snd.sfx('lucky'); addScore(1000); UI.toast('¡BIDÓN L! +1000'); }
      else Snd.sfx('fuel', { rate: canRate(Math.min(S.combo, 10)) });
      addScore(pts, c.x, c.y - 10);
      c.respawn = 3;
      return false;
    }
    S.collected++;
    comboHit(c); mission('cans');
    let pts = S.collected * 100;
    if (S.special) pts *= 2;
    S.fuel = Math.min(100, S.fuel + (c.kind === 'L' ? 25 : 12));
    addCoins(c.kind === 'N' ? 3 : 6);
    if (c.kind === 'S') { S.special = true; Snd.sfx('fuelS'); UI.toast('¡BIDÓN S! PUNTOS ×2'); flash(0.25, [1, 0.9, 0.4]); }
    else if (c.kind === 'L') { const b = Math.round(S.fuel) * 10; Snd.sfx('lucky'); UI.toast(`¡BIDÓN L! BONO +${b}`); addScore(b); flash(0.25, [0.5, 1, 0.7]); }
    else Snd.sfx('fuel', { rate: canRate(S.collected) });
    addScore(pts, c.x, c.y - 10);
    if (S.collected >= 10) {
      addCoins(15);
      if (S.round === roundsOf() - 1) { startEscape(); return false; }
      S.state = 'clear'; S.t = 0; S.tallyT = 0; S.tallyAcc = 0; S.tallyTotal = S.fuel * 10;
      banner('¡RONDA COMPLETA!', 'BONO DE GAS · +15 MONEDAS');
      Snd.sfx('clear');
      return true;
    }
    return false;
  }
  function cityComplete() {
    const c = curC(), arena = S.trk === 'arena', L = lvl();
    S.state = 'cityclear'; S.t = 0;
    S.paw = null; TK.paw.show(false); TK.pawSh.show(false);
    const bonus = arena ? 0 : 5000 * (L + 1), coins = arena ? Math.round(S.score / 200) : 40 * (L + 1);
    if (bonus) addScore(bonus);
    addCoins(coins);
    // estrellas: terminar, sin chocar y bajo el tiempo (en la arena, por puntaje); récord del lugar
    const mask = arena ? 1 | (S.score >= ARENA_STAR[0] ? 2 : 0) | (S.score >= ARENA_STAR[1] ? 4 : 0)
      : 1 | (S.cityDeaths === 0 ? 2 : 0) | (S.cityTime <= PAR ? 4 : 0);
    const all = Store.get('rally_stars', {}), old = all[c.id] || 0;
    all[c.id] = old | mask; Store.set('rally_stars', all);
    const fresh = [1, 2, 4].filter((b) => mask & b && !(old & b)).length;
    if (fresh) addCoins(10 * fresh);
    const best = Store.get('rally_best', {}), b0 = best[c.id] || {};
    best[c.id] = { score: Math.max(b0.score || 0, S.score - S.cityScore0), time: Math.min(b0.time || 1e9, S.cityTime) };
    Store.set('rally_best', best);
    if (S.cityDeaths === 0 && !arena) mission('clean');
    UI.vibrate([40, 40, 40, 40, 120]);
    S.cityMask = mask;
    if (S.city < NC) {
      Store.set('rally_cleared', clearedMask() | (1 << S.city));
      const next = S.city + 1;
      if (next < NC) Store.set('rally_unlocked', Math.max(realUnlocked(), next + 1));
    }
    if (arena) banner(`¡FIN DEL SHOW! ${starStr(mask)}`, `${pad6(S.score)} PUNTOS · +${coins + 10 * fresh} MONEDAS`);
    else banner(`¡${c.name} COMPLETADA! ${starStr(mask)}`, `${fmtT(S.cityTime)} · BONO +${bonus} · +${coins + 10 * fresh} MONEDAS`);
    Snd.sfx('clear');
    if (arena) { Snd.sfx('cheer'); for (let k = 0; k < 4; k++) firework(player.x + rand(-80, 80), player.y - rand(20, 70)); }
    trackAchievements(mask);
    if (!S.inTrack && S.score > S.hi) { S.hi = S.score; Store.set('hi_rally', S.score); }
    saveRun();
  }
  function duelEnd(win) {
    S.state = 'duelend'; S.t = 0;
    const c = ALLC[S.city];
    const prize = win ? 80 + 20 * S.city : 15;
    addCoins(prize);
    if (win) {
      const d = Store.get('rally_duels', {}); d[c.id] = (d[c.id] || 0) + 1; Store.set('rally_duels', d); mission('duel'); UI.vibrate([40, 40, 120]);
      ach('duel'); if (CITIES.every((q) => d[q.id])) ach('duels');
    }
    banner(win ? '¡GANASTE EL DUELO!' : `GANÓ ${rival.name}`, `${S.duelP} - ${S.duelR} · +${prize} MONEDAS`);
    Snd.sfx(win ? 'clear' : 'gameover');
    if (win) flash(0.3, [1, 0.9, 0.5]);
  }

  // ---------------- combo, pasar raspando
  function comboHit(c) {
    S.combo = S.comboT > 0 ? S.combo + 1 : 1; S.comboT = 4.5;
    if (S.combo < 2) { UI.vibrate(12); return; }
    if (S.mode === 'tour') addScore(100 * (S.combo - 1));
    popup(`COMBO ×${S.combo}`, c.x, c.y - 22, '#ff9ae0');
    if (S.combo >= 3) addCoins(1);
    mission('combo', S.combo);
    if (S.combo >= 6) ach('combo6');
    UI.vibrate(25);
  }
  function nearMiss() {
    S.nNear = (S.nNear || 0) + 1;
    if (S.mode === 'tour') addScore(200);
    addCoins(1);
    popup(S.mode === 'tour' ? 'RASPANDO +200' : 'RASPANDO', player.x, player.y - 16, '#7dffea');
    Snd.sfx('whoosh'); UI.vibrate(15);
    mission('near');
  }

  // ---------------- escape final (ronda 3): helicóptero con foco y meta
  function startEscape() {
    const ok = ([x, y]) => { const i = y * MW + x; return !rockAt[i] && !inCross(x, y) && !bends.has(i); };
    const pool = S.roadTiles.filter(([x, y]) => ok([x, y]) && distA[y * MW + x] >= 24 && distA[y * MW + x] <= 34);
    let pickT = pool.length ? pool[(Math.random() * pool.length) | 0] : null;
    if (!pickT) { let bd = -1; for (const t of S.roadTiles) { const d = distA[t[1] * MW + t[0]]; if (ok(t) && d < 9999 && d > bd) { bd = d; pickT = t; } } }
    S.escape = { x: pickT[0] * TS + 8, y: pickT[1] * TS + 8 };
    goalSpr.show(true);
    heli.on = true; heli.away = 0; heli.x = player.x - 170; heli.y = player.y - 130; heli.ang = 0;
    [heli.spr, heli.rotor, heli.sh, heli.spot].forEach((q) => q.show(true));
    // gran final en Tokio: dos helicópteros, uno te busca por delante
    S.final = S.mode === 'tour' && S.city === NC - 1 && !S.inTrack;
    if (S.final) {
      heli2.on = true; heli2.away = 0; heli2.x = player.x + 190; heli2.y = player.y + 150; heli2.ang = Math.PI;
      [heli2.spr, heli2.rotor, heli2.sh, heli2.spot].forEach((q) => q.show(true));
      banner('¡GRAN FINAL!', 'DOS HELICÓPTEROS TE BUSCAN · LLEGA A LA META');
    } else banner('¡ESCAPA!', 'LLEGA A LA META · SI EL FOCO TE ILUMINA, TODAS TE VEN');
    S.everSpotted = false;
    S.goT = 2.4;
    Snd.sfx('siren'); UI.vibrate([50, 50, 50, 50, 100]);
    Snd.play(SONGS.chase);
    if (!S.icpOn && lvl() >= 2 && diff() > 0 && S.trk !== 'toy') { S.icpDone = false; spawnIcp(); }
    if (S.icpOn) S.icpT = 999;
  }
  function updateEscape(dt) {
    const X = S.escape, p = player;
    const [fx, fy] = fwdOf(p.ang);
    const was = S.spotted;
    S.spotted = false;
    for (const h of [heli, heli2]) {
      if (!h.on || h.away) continue;
      // el segundo helicóptero apunta más adelante: te corta el paso
      const lead = h === heli ? 24 : 70, k = h === heli ? 1 : 0.9;
      const dx = p.vx + fx * lead - h.x, dy = p.vy + fy * lead - h.y, d = Math.hypot(dx, dy);
      const sp = (66 + lvl() * 1.5) * [0.9, 1, 1.08, 1.12][diff()] * k * dt;
      if (d > 1) {
        h.x += (dx / d) * Math.min(d, sp); h.y += (dy / d) * Math.min(d, sp);
        h.ang += wrapA(-(Math.atan2(dy, dx) + Math.PI / 2) - h.ang) * 0.06;
      }
      if (Math.hypot(p.vx - h.x, p.vy - h.y) < 26) S.spotted = true;
    }
    if (S.spotted && !was) { UI.vibrate(30); Snd.sfx('spot'); S.everSpotted = true; }
    if ((S.chopT = (S.chopT || 0) - dt) <= 0) { S.chopT = 0.13; if (near(heli, p, 260) || (heli2.on && near(heli2, p, 260))) Snd.sfx('chop'); }
    if (near(p, X, 12)) { escapeDone(); return true; }
    return false;
  }
  function escapeDone() {
    S.escape = null; S.spotted = false;
    goalSpr.show(false); heli.away = 2.5; if (heli2.on) heli2.away = 2.5;
    addScore(3000, player.x, player.y - 12); addCoins(20); mission('heli');
    if (!S.everSpotted) ach('heli');
    if (S.final) ach('final');
    if (S.icpOn) { S.icpT = 0; retireIcp(); }
    S.state = 'clear'; S.t = 0; S.tallyT = 0; S.tallyAcc = 0; S.tallyTotal = S.fuel * 10;
    banner('¡ESCAPASTE!', 'BONO DE ESCAPE +3000 · +20 MONEDAS');
    Snd.sfx('clear'); UI.vibrate([40, 40, 80]);
  }
  function hideHeli() { for (const h of [heli, heli2]) { h.on = false; [h.spr, h.rotor, h.sh, h.spot].forEach((q) => q.show(false)); } goalSpr.show(false); }
  // motor (tono según velocidad) y sirena (según la patrulla más cercana)
  function soundLoops() {
    if ((S.sndN = (S.sndN || 0) + 1) % 3) return;
    if (S.state === 'play') {
      Snd.engine(0.85 + (S.nitroT > 0 ? 0.3 : 0), clamp((S.curSpd || 0) / 120, 0, 1.3));
      let lv = 0;
      if (!(S.bonus && S.fuel > 0)) for (const e of enemies) if (e.active && e.stun <= 0 && e.hold <= 0) lv = Math.max(lv, 1 - Math.hypot(e.x - player.x, e.y - player.y) / 230);
      if (heli.on && !heli.away) lv = Math.max(lv, 0.5);
      Snd.siren(clamp(lv, 0, 1) * 0.9);
    } else if (S.state === 'intro') { Snd.engine(0.45, 0.04); Snd.siren(0); }
    else { Snd.engine(0, 0); Snd.siren(0); }
  }

  // ---------------- interceptor y eventos de ciudad
  function spawnIcp() {
    let best = null, bd = -1;
    for (let k = 0; k < 80; k++) {
      const [x, y] = S.roadTiles[(Math.random() * S.roadTiles.length) | 0];
      const i = y * MW + x;
      if (rockAt[i] || distA[i] >= 9999 || distA[i] < 16 || inCross(x, y)) continue;
      const edge = x <= 4 || y <= 4 || x >= MW - 5 || y >= MH - 5;
      const d = distA[i] + (edge ? 12 : 0);
      if (d > bd) { bd = d; best = [x, y]; }
    }
    if (!best) { S.icpAt += 5; return; }
    const ds = [0, 1, 2, 3].filter((d) => openE(best[0] + DX[d], best[1] + DY[d]));
    placeCar(icp, best, ds.length ? ds[0] : 0);
    Object.assign(icp, { active: true, stun: 0, hold: 0.6, persona: 0, noise: 0.05, spin: 0 });
    icp.spr.show(true); icp.hl.show(!!ALLC[S.city].night);
    S.icpOn = true; S.icpT = 22;
    Snd.sfx('siren'); UI.vibrate([60, 60, 60]);
    if (!S.escape) UI.toast('¡INTERCEPTOR EN CAMINO!');
  }
  function retireIcp() {
    S.icpOn = false; S.icpDone = true;
    icp.active = false; icp.spr.show(false); icp.hl.show(false); icp.stars.forEach((s) => s.show(false));
    parts.burst(icp.vx, icp.vy, 16, 60, 0.8, 0x9ba3c0, 0x2a2638, 2, 2, 0, 1);
    UI.toast('EL INTERCEPTOR SE RETIRA');
  }
  function quake() {
    shake(3, 1.6); flash(0.12, [1, 0.85, 0.6]);
    Snd.sfx('quake'); UI.toast('¡TEMBLOR!'); UI.vibrate([100, 60, 140, 60, 220]);
    for (const e of enemies) if (e.active && e.hold <= 0) e.stun = Math.max(e.stun, 1.6);
    if (rival && rival.active && rival.dead <= 0) rival.slowT = 1.2;
    S.slowT = Math.max(S.slowT, 0.6);
    for (let k = 0; k < 50; k++) parts.emit(camX + rand(0, Engine.W), camY + rand(0, H), rand(-20, 20), rand(-30, -5), rand(0.6, 1.2), 0xc8a878, 0x6a5038, 2, 1, 20, 1);
  }
  function events(dt) {
    const city = ALLC[S.city];
    // cada cierto rato las patrullas se dispersan hacia sus esquinas (salvo en el escape)
    if (!S.escape && (S.chaseT -= dt) <= 0) { S.scatter = !S.scatter; S.chaseT = S.scatter ? 4 : rand(16, 22); }
    if (S.escape) S.scatter = false;
    if (S.mode === 'tour' && !S.icpDone) {
      if (!S.icpOn && S.playT >= S.icpAt) spawnIcp();
      else if (S.icpOn && (S.icpT -= dt) <= 0) retireIcp();
    }
    if (city.event === 'temblor' && (S.quakeT -= dt) <= 0) { S.quakeT = rand(35, 45); quake(); }
  }

  // ---------------- pistas especiales: arena de acrobacias, pueblo nevado y cuarto de juguetes
  const JUMP = 0.72, DRILL = 8, ARENA_T = 90, ARENA_STAR = [15000, 30000];
  const TK = { ramps: [], drifts: [], piles: [], gates: [], train: [], marbles: [], eSh: [], paw: null, pawSh: null, drill: null, pSh: null };
  const distT = new Int16Array(MW * MH);
  function initTrackArt() {
    A.ramp = T(RT.ramp()); A.rampH = T(rot90(RT.ramp(), 1));
    A.ring = [0, 1, 2].map((f) => T(RT.fireRing(f))); A.ringH = [0, 1, 2].map((f) => T(rot90(RT.fireRing(f), 1)));
    A.monster = POLICE_LIVERY.map((P) => [0, 1].map((f) => T(RT.monster(P, f))));
    A.suv = POLICE_LIVERY.map((P) => [0, 1].map((f) => T(RT.suv(P, f))));
    A.windup = POLICE_LIVERY.map((P) => [0, 1].map((f) => T(RT.windup(P, f))));
    A.batN = [0, 1].map((f) => T(RT.battery('', f))); A.batS = [0, 1].map((f) => T(RT.battery('S', f))); A.batL = [0, 1].map((f) => T(RT.battery('L', f)));
    A.gift = [0, 1].map((f) => T(RT.gift(f)));
    A.paw = T(RT.paw()); A.pawSh = T(RT.shadowDisc(22, 16)); A.carSh = T(RT.shadowDisc(8, 8));
    A.train = { loco: T(RT.train('loco')), a: T(RT.train('a')), b: T(RT.train('b')) };
    A.gate = [false, true].map((d) => [0, 1].map((f) => T(RT.gate(d, f))));
    A.marble = [0, 1, 2, 3].map((f) => T(RT.marble(f)));
    A.drift = T(RT.drift()); A.pile = T(RT.pile());
    A.drill = [0, 1].map((f) => T(RT.drill(f)));
    A.plow = [0, 1].map((f) => T(RT.plow(f)));
  }
  function initTrackSprites() {
    for (let i = 0; i < 10; i++) TK.ramps.push({ spr: new Spr(world, A.ramp, 3).show(false), ring: new Spr(world, A.ring[0], 15, { transparent: true }).show(false) });
    for (let i = 0; i < 8; i++) TK.drifts.push(new Spr(world, A.drift, 3.5).show(false));
    for (let i = 0; i < 6; i++) TK.piles.push(new Spr(world, A.pile, 6).show(false));
    for (let i = 0; i < 28; i++) TK.gates.push(new Spr(world, A.gate[0][0], 7).show(false));
    TK.train = ['loco', 'a', 'b'].map((k) => new Spr(world, A.train[k], 16).show(false));
    for (let i = 0; i < 4; i++) TK.marbles.push(new Spr(world, A.marble[0], 6).show(false));
    for (let i = 0; i < 10; i++) TK.eSh.push(new Spr(world, A.carSh, 9.5, { transparent: true, opacity: 0.35 }).show(false));
    TK.paw = new Spr(world, A.paw, 48).show(false);
    TK.pawSh = new Spr(world, A.pawSh, 15, { transparent: true, opacity: 0.4 }).show(false);
    TK.drill = new Spr(world, A.drill[0], 13).show(false);
    TK.pSh = new Spr(world, A.carSh, 11, { transparent: true, opacity: 0.35 }).show(false);
  }
  const polTex = () => (S.trk === 'arena' ? A.monster : S.trk === 'snow' ? A.suv : S.trk === 'toy' ? A.windup : A.carT);
  function setupTrack() {
    TK.ramps.forEach((q, i) => {
      const rp = S.rampList[i];
      q.spr.show(!!rp); q.ring.show(!!rp && rp.ring);
      if (!rp) return;
      rp.cx = rp.x * TS + 8; rp.cy = rp.y * TS + 8; rp.q = q;
      q.spr.set(rp.h ? A.rampH : A.ramp).at(rp.cx, rp.cy);
      q.ring.set((rp.h ? A.ringH : A.ring)[0]).at(rp.cx, rp.cy);
    });
    TK.drifts.forEach((d, i) => { const it = S.driftList[i]; d.show(!!it); if (it) { d.at(it.x, it.y); it.spr = d; } });
    TK.piles.forEach((q) => q.show(false));
    TK.eSh.forEach((q) => q.show(false));
    TK.marbles.forEach((m, i) => { const it = S.marbleList[i]; m.show(!!it); if (it) it.spr = m; });
    TK.gates.forEach((g) => g.show(false));
    if (S.rail) {
      S.rail.cross = S.rail.xs.map((x, i) => {
        const a = TK.gates[i * 2], b = TK.gates[i * 2 + 1];
        if (!a || !b) return { x, closed: false };
        a.show(true).setFlip(false).at(x * TS + 8, S.rail.y - 12);
        b.show(true).setFlip(true).at(x * TS + 8, S.rail.y + 12);
        return { x, closed: false, a, b };
      });
    }
    TK.train.forEach((t) => t.show(false));
    S.train = S.rail ? { x: -SK - 40, wait: 3 } : null;
    S.paw = null; S.pawT = rand(14, 20); TK.paw.show(false); TK.pawSh.show(false);
    S.avT = rand(16, 24); S.aval = null;
    S.showT = ARENA_T; S.fwT = 1;
    S.jOver = null;
  }
  // saltos en las rampas: en el aire no te atrapan; aterrizar da puntos (más con aro o sobre un monster)
  function rampCheck(c, isP) {
    if (!S.rampList.length || c.jumpT > 0) return;
    const tx = Math.floor(c.x / TS), ty = Math.floor(c.y / TS);
    for (const rp of S.rampList) {
      if (rp.x !== tx || rp.y !== ty) continue;
      if ((rp.h ? DX[c.dir] : DY[c.dir]) === 0 || Math.abs(rp.h ? c.x - rp.cx : c.y - rp.cy) > 4) return;
      c.jumpT = JUMP; c.ring = rp.ring;
      if (isP) { S.jOver = new Set(); Snd.sfx('leap'); UI.vibrate(15); }
      return;
    }
  }
  function jumpTick(c, dt, isP) {
    if (!(c.jumpT > 0)) return;
    c.jumpT -= dt;
    if (isP && S.jOver) for (const e of enemies) if (e.active && e.hold <= 0 && near(e, c, 15)) S.jOver.add(e);
    if (c.jumpT > 0) return;
    c.jumpT = 0;
    parts.burst(c.vx, c.vy, 10, 55, 0.45, 0xc8945a, 0x6a4224, 2, 1, 0, 3);
    if (!isP) return;
    const over = S.jOver ? S.jOver.size : 0, pts = 200 + (c.ring ? 500 : 0) + over * 400;
    addScore(pts);
    popup(c.ring ? `¡ARO DE FUEGO! +${pts}` : over ? `¡SOBRE EL MONSTER! +${pts}` : `SALTO +${pts}`, c.x, c.y - 16, c.ring ? '#ffb347' : over ? '#ff9ae0' : '#ffffff');
    addCoins(c.ring || over ? 3 : 1);
    Snd.sfx('land'); shake(1.5, 0.15); UI.vibrate(25);
    S.nJump = (S.nJump || 0) + 1;
    if (c.ring) { firework(c.x, c.y - 24); firework(c.x + rand(-30, 30), c.y - 40); Snd.sfx('cheer'); ach('ring'); }
    if (over) { ach('jumpover'); Snd.sfx('cheer'); }
    S.jOver = null;
  }
  function firework(x, y) {
    const [a, b] = pick([[0xff4f9a, 0xffd23f], [0x4fe3ff, 0xffffff], [0x7dff7a, 0xffd23f], [0xffb347, 0xff3b3b], [0xb48cff, 0xffffff]]);
    parts.burst(x, y, 28, 95, 0.9, a, b, 2, 1, 14, 1.5);
    Snd.sfx('pop');
  }
  function respawnCan(c) {
    for (let k = 0; k < 80; k++) {
      const [x, y] = S.roadTiles[(Math.random() * S.roadTiles.length) | 0], i = y * MW + x;
      if (distA[i] < 8 || distA[i] >= 9999 || rockAt[i] || bends.has(i)) continue;
      if (cans.some((o) => o !== c && !o.got && Math.abs(o.x - (x * TS + 8)) + Math.abs(o.y - (y * TS + 8)) < 64)) continue;
      if (S.rampList.some((rp) => rp.x === x && rp.y === y)) continue;
      [c.x, c.y] = tilePos(x, y);
      break;
    }
    if (c.kind === 'S') { c.kind = 'N'; c.frames = A.canN; c.glow.set(A.glowR); }
    c.got = false; c.spr.show(true); c.glow.show(true);
    parts.burst(c.x, c.y, 10, 50, 0.4, 0xffd84a, 0xff6a3a, 2, 1, 0, 3);
  }
  function snowPuff(x, y) { parts.burst(x, y, 14, 60, 0.6, 0xffffff, 0xc8d4ea, 2, 1, 0, 3); }
  // montículos, quitanieves y avalanchas
  function updateSnow(dt) {
    const p = player;
    for (const d of S.driftList) {
      if (!d.on) {
        if ((d.back -= dt) <= 0) {
          for (let k = 0; k < 40; k++) {
            const [x, y] = S.roadTiles[(Math.random() * S.roadTiles.length) | 0], i = y * MW + x;
            if (rockAt[i] || S.ice[i] || distA[i] < 6 || distA[i] >= 9999) continue;
            d.x = x * TS + 8; d.y = y * TS + 8; d.on = true; d.spr.show(true).at(d.x, d.y); snowPuff(d.x, d.y);
            break;
          }
          if (!d.on) d.back = 2;
        }
        continue;
      }
      if (near(d, p, 11) && !(p.jumpT > 0)) {
        if (!d.touch) { d.touch = true; Snd.sfx('puff'); snowPuff(d.x, d.y); UI.vibrate(15); }
        S.slowT = Math.max(S.slowT, 0.3);
      } else d.touch = false;
      for (const e of enemies) if (e.active && e.hold <= 0 && near(d, e, 11)) e.slowT = Math.max(e.slowT || 0, 0.3);
      for (const cv of civs) if (cv.active && cv.plow && near(d, cv, 12)) { d.on = false; d.back = 14; d.spr.show(false); snowPuff(d.x, d.y); }
    }
    if (S.aval) {
      const av = S.aval;
      av.t -= dt;
      if (Math.random() < dt * 40) parts.emit(av.cx + rand(-16, 16), av.cy - rand(4, 30), rand(-10, 10), rand(40, 90), 0.45, 0xffffff, 0xc8d4ea, 2, 1);
      if (av.t <= 0) dropPile(av);
    } else if (S.state === 'play' && !S.escape && (S.avT -= dt) <= 0) { S.avT = rand(20, 30); startAval(); }
    for (const rk of S.rockList) if (rk.snow && (rk.life -= dt) <= 0) removePile(rk);
  }
  const straightTile = (x, y) => (isRoad(x - 1, y) && isRoad(x + 1, y) && !isRoad(x, y - 1) && !isRoad(x, y + 1)) || (isRoad(x, y - 1) && isRoad(x, y + 1) && !isRoad(x - 1, y) && !isRoad(x + 1, y));
  function startAval() {
    const p = player, px = Math.floor(p.x / TS), py = Math.floor(p.y / TS);
    const cand = S.roadTiles.filter(([x, y]) => { const d = distA[y * MW + x]; return d >= 5 && d <= 14 && !rockAt[y * MW + x] && straightTile(x, y) && !cans.some((c) => !c.got && Math.floor(c.x / TS) === x && Math.floor(c.y / TS) === y); });
    for (let k = 0; k < 12 && cand.length; k++) {
      const [x, y] = cand.splice((Math.random() * cand.length) | 0, 1)[0];
      rockAt[y * MW + x] = 1;
      bfs(distT, px, py);
      let total = 0, reach = 0;
      for (const [a, b] of S.roadTiles) { const i = b * MW + a; if (!rockAt[i]) { total++; if (distT[i] < 9999) reach++; } }
      rockAt[y * MW + x] = 0;
      if (reach !== total) continue;
      S.aval = { x, y, cx: x * TS + 8, cy: y * TS + 8, t: 1.3, h: isRoad(x - 1, y) };
      UI.toast('¡AVALANCHA!'); Snd.sfx('rumble'); shake(2, 0.8); UI.vibrate([30, 30, 30, 30]);
      return;
    }
  }
  function dropPile(av) {
    S.aval = null;
    const spr = TK.piles.find((q) => !q.visible);
    if (!spr) return;
    rockAt[av.y * MW + av.x] = 1;
    S.rockList.push({ x: av.x, y: av.y, cx: av.cx, cy: av.cy, h: av.h, snow: true, life: 12, spr: spr.show(true).at(av.cx, av.cy) });
    lastPT = -1; enemies.forEach((e) => { e.plan = null; e.tile = -1; });
    snowPuff(av.cx, av.cy); snowPuff(av.cx, av.cy - 6); Snd.sfx('thud'); shake(2, 0.2);
    for (const e of enemies) if (e.active && e.hold <= 0 && Math.abs(e.x - av.cx) < 14 && Math.abs(e.y - av.cy) < 14) { e.stun = 2.5; e.dir = (e.dir + 2) % 4; e.plan = null; e.tile = -1; }
  }
  function removePile(rk) {
    if (rk.gone) return;
    rk.gone = true;
    rockAt[rk.y * MW + rk.x] = 0;
    rk.spr.show(false);
    S.rockList.splice(S.rockList.indexOf(rk), 1);
    snowPuff(rk.cx, rk.cy);
    lastPT = -1; lastVT = -1;
  }
  // tren con barreras, canicas que ruedan y la pata del gato
  function updateToy(dt) {
    const p = player, R0 = S.rail, tr = S.train;
    if (tr.wait > 0) tr.wait -= dt;
    else { tr.x += 118 * dt; if (tr.x - 100 > MW * TS + SK) { tr.x = -SK - 30; tr.wait = rand(5, 9); } }
    const running = tr.wait <= 0, head = tr.x, tail = tr.x - 96;
    let changed = false;
    for (const cr of R0.cross) {
      const cx = cr.x * TS + 8, closed = running && head > cx - 140 && tail < cx + 14;
      if (closed === cr.closed) continue;
      cr.closed = closed; changed = true;
      blockAt[R0.ty * MW + cr.x] = closed ? 1 : 0;
      if (closed && Math.abs(cx - p.x) < Engine.W * 0.7 && Math.abs(R0.y - p.y) < 170) Snd.sfx('bell');
    }
    if (changed) { lastPT = -1; for (const c of [...enemies, ...civs]) { c.plan = null; c.tile = -1; } }
    if (running) {
      const hit = (c) => Math.abs(c.y - R0.y) < 11 && c.x > tail - 8 && c.x < head + 6;
      if (p.vis && S.invT <= 0 && hit(p)) {
        if (S.shieldT > 0) { shieldBreak(S); p.dir = DY[p.dir] ? (p.y < R0.y ? 0 : 2) : p.dir; S.invT = 1; }
        else { crash(); return true; }
      }
      for (const e of enemies) if (e.active && e.stun <= 0 && e.hold <= 0 && hit(e)) {
        e.stun = 3; e.plan = null; e.tile = -1; Snd.sfx('stun', { pan: panX(e.x) });
        if (S.mode === 'tour') addScore(100, e.x, e.y - 12);
      }
      for (const cv of civs) if (cv.active && !(cv.spinT > 0) && hit(cv)) cv.spinT = 1.2;
    }
    for (const m of S.marbleList) {
      advance(m, 52 * dt, decideMarble, openE);
      m.ph += dt * 10;
      if (m.cd > 0) { m.cd -= dt; continue; }
      if (p.vis && near(m, p, 9) && !(p.jumpT > 0)) {
        m.dir = (m.dir + 2) % 4; m.cd = 0.7; Snd.sfx('tick');
        if (!S.spikes && S.shieldT <= 0 && S.spinT <= 0) { S.spinT = 0.9; S.spinA = 0; Snd.sfx('spin'); UI.vibrate([20, 20, 20]); }
        continue;
      }
      for (const e of enemies) if (e.active && e.stun <= 0 && e.hold <= 0 && near(m, e, 9)) { e.stun = 1.6; m.dir = (m.dir + 2) % 4; m.cd = 0.7; Snd.sfx('stun', { pan: panX(e.x) }); break; }
    }
    if (S.paw) updatePaw(dt);
    else if (!S.escape && (S.pawT -= dt) <= 0) startPaw();
    return false;
  }
  function decideMarble(m, tx, ty) {
    if (openE(tx + DX[m.dir], ty + DY[m.dir]) && Math.random() < 0.75) return;
    const opts = [0, 1, 2, 3].filter((d) => d !== (m.dir + 2) % 4 && openE(tx + DX[d], ty + DY[d]));
    m.dir = opts.length ? opts[(Math.random() * opts.length) | 0] : (m.dir + 2) % 4;
  }
  function startPaw() {
    const p = player;
    S.paw = { x: clamp(p.x + DX[p.dir] * 46, 40, MW * TS - 40), y: clamp(p.y + DY[p.dir] * 46, 40, MH * TS - 40), t: 0, hit: false };
    UI.toast('¡CUIDADO! ¡EL GATO!'); Snd.sfx('meow');
  }
  function updatePaw(dt) {
    const w = S.paw, p = player;
    w.t += dt;
    if (!w.hit && w.t >= 1.5) {
      w.hit = true; shake(3, 0.3); Snd.sfx('thud'); UI.vibrate(60);
      parts.burst(w.x, w.y, 16, 80, 0.5, 0xf4b060, 0xffffff, 2, 1, 0, 3);
      let n = 0;
      for (const e of enemies) if (e.active && e.hold <= 0 && Math.hypot(e.x - w.x, e.y - w.y) < 28) { e.stun = 3; n++; }
      for (const cv of civs) if (cv.active && Math.hypot(cv.x - w.x, cv.y - w.y) < 28) cv.spinT = 1.4;
      if (n && S.mode === 'tour') { addScore(150 * n, w.x, w.y - 20); popup('¡ZARPAZO!', w.x, w.y - 32, '#ffb347'); ach('paw'); }
      if (p.vis && S.invT <= 0 && Math.hypot(p.x - w.x, p.y - w.y) < 28) {
        if (S.shieldT > 0) shieldBreak(S);
        else { S.spinT = 1.2; S.spinA = 0; S.fuel = Math.max(0, S.fuel - 12); Snd.sfx('spin'); }
      }
    }
    if (w.t >= 2.3) { S.paw = null; S.pawT = rand(15, 22); }
  }
  function updateTrack(dt) {
    if (S.trk === 'arena') {
      const prev = S.showT;
      S.showT -= dt;
      if (S.showT <= 0) { S.showT = 0; cityComplete(); return true; }
      if (S.showT < 10 && Math.ceil(S.showT) !== Math.ceil(prev)) Snd.sfx('count');
      for (const c of cans) if (c.got && c.respawn > 0 && (c.respawn -= dt) <= 0) respawnCan(c);
      if ((S.fwT -= dt) <= 0) { S.fwT = rand(1.4, 3); firework(camX + rand(20, Engine.W - 20), camY + rand(10, H * 0.5)); }
      return false;
    }
    if (S.trk === 'snow') { updateSnow(dt); return false; }
    if (S.trk === 'toy') return updateToy(dt);
    return false;
  }
  // taladro: se carga solo; con la carga llena, una patrulla que chocas de frente queda fuera 12 s
  const drillReady = () => S.drill && S.drillT >= DRILL;
  function wreck(e) {
    S.drillT = 0;
    parts.burst(e.vx, e.vy, 30, 120, 0.7, 0xffd84a, 0x7a2a3a, 2, 1, 0, 3);
    parts.burst(e.vx, e.vy, 12, 50, 1.2, 0x9ba3c0, 0x2a2638, 2, 2, 0, 1);
    Snd.sfx('crash'); shake(2.5, 0.3); UI.vibrate([40, 30, 60]);
    if (S.mode === 'tour') addScore(400, e.x, e.y - 12);
    popup('¡TALADRADA!', e.x, e.y - 24, '#ffb347');
    addCoins(3); mission('drill'); ach('drill');
    S.nDrill = (S.nDrill || 0) + 1;
    if (e.icp) { retireIcp(); return; }
    placeCar(e, enemyStarts[enemies.indexOf(e) % enemyStarts.length], 0);
    e.hold = 12; e.stun = 0; e.spin = 0; e.near = false; e.jumpT = 0;
    e.stars.forEach((s) => s.show(false));
  }

  // ---------------- actualización
  function update(dt) {
    achTick(dt);
    if (S.state === 'story') { updateStory(dt); return; }
    if (S.state === 'achs') { updateAchs(); return; }
    if (S.state === 'initials') { updateInitials(); return; }
    if (S.state === 'records') { updateRecords(); return; }
    if (S.state === 'ending') { updateEnding(dt); return; }
    if (S.state === 'garage') { updateGarage(dt); return; }
    if (S.state === 'loading') { updateLoading(dt); return; }
    if (S.state === 'guide') { updateGuide(); return; }
    if (S.state === 'map' || S.state === 'travel' || S.state === 'arrive') { updateMap(dt); return; }
    S.t += dt;
    if (S.coinBump > 0) S.coinBump -= dt;
    if (S.state === 'intro') {
      const step = Math.floor(S.t / 0.7) - (S.round === 0 ? 1 : 0);
      if (step !== S.lastStep && !S.quick) {
        S.lastStep = step;
        const sub = S.mode === 'duel' ? `VS ${rival.name} · PRIMERO EN JUNTAR ${DUEL_WIN}` : S.bonus ? 'RONDA DE BONO' : `${ALLC[S.city].name} · RONDA ${S.round + 1}/${roundsOf()}`;
        if (step >= 1 && step <= 3) { banner(String(4 - step), sub); Snd.sfx('count'); }
      }
      if (S.t >= (S.quick ? 1.25 : S.round === 0 ? 3.5 : 2.8)) {
        S.state = 'play'; S.t = 0; S.quick = false; banner('¡YA!', ''); Snd.sfx('go'); S.goT = 0.8;
        const c = ALLC[S.city];
        if (S.round === 0 && c.scramble) UI.toast('CURVAS PARA DERRAPAR · EN EL GRAN CRUCE TODOS FRENAN');
        else if (S.round === 0 && c.drift) UI.toast('CURVAS PARA DERRAPAR · SAL DEL DERRAPE CON MINI TURBO');
      }
    } else if (S.state === 'play') {
      if (S.goT > 0 && (S.goT -= dt) <= 0) banner(null);
      updatePlay(dt);
    } else if (S.state === 'dying') {
      const f = Math.floor(S.t / 0.09);
      if (f < A.boom.length) S.boom.spr.set(A.boom[f]).at(S.boom.x, S.boom.y); else S.boom.spr.show(false);
      updateEnemies(dt * 0.5);
      updateCivs(dt);
      if (S.mode === 'duel') { updateRival(dt); if (S.state !== 'dying') { updateFx(dt); return; } }
      if (S.t > 1.5) {
        if (S.mode === 'duel') { respawnPlayer(); updateFx(dt); return; }
        if (S.trk === 'arena') {
          S.showT = Math.max(1, S.showT - 10);
          respawnPlayer(); UI.toast('CHOQUE: −10 SEGUNDOS DE SHOW');
          updateFx(dt); return;
        }
        S.lives--;
        if (S.lives <= 0) { gameOver(); return; }
        resetActors(false);
        S.fuel = Math.max(S.fuel, 40);
        S.state = 'intro'; S.t = 0; S.lastStep = -1; S.quick = true;
        banner('¡OTRA VEZ!', S.lives === 1 ? 'TE QUEDA EL ÚLTIMO AUTO' : `QUEDAN ${S.lives} AUTOS`);
      }
    } else if (S.state === 'clear') {
      S.tallyT = (S.tallyT || 0) + dt;
      if (S.fuel > 0 && S.tallyT > 0.6) {
        const k = Math.min(S.fuel, dt * 90);
        S.fuel -= k; S.tallyAcc = (S.tallyAcc || 0) + k * 10;
        while (S.tallyAcc >= 10) { S.tallyAcc -= 10; addScore(10); }
        if ((S.tick = (S.tick || 0) + dt) > 0.05) { S.tick = 0; Snd.sfx('tick'); }
        banner('¡RONDA COMPLETA!', `BONO DE GAS +${Math.round(S.tallyTotal - S.fuel * 10)}`);
      } else if (S.fuel <= 0 && S.tallyT > 0.6) {
        S.fuel = 0;
        if ((S.doneT = (S.doneT || 0) + dt) > 1.4) {
          S.doneT = 0; S.tallyT = 0;
          if (S.round < roundsOf() - 1) { S.round++; beginRound(); return; }
          cityComplete();
        }
      }
    } else if (S.state === 'cityclear') {
      if (S.t > 3.4) {
        if (S.city >= NC) { openMap({ mode: 'esp' }); return; }
        const next = S.city + 1;
        if (next >= CITIES.length) openEnding();
        else openMap({ sel: next, toast: `NUEVA CIUDAD: ${CITIES[next].name}` });
        return;
      }
    } else if (S.state === 'duelend') {
      if (S.t > 3.8) { openMap({ sel: S.city, mode: 'duel' }); return; }
    }
    updateCross(dt);
    updateFx(dt);
    soundLoops();
  }
  function updatePlay(dt) {
    const city = ALLC[S.city], duel = S.mode === 'duel', p = player;
    S.playT += dt;
    const I = Input.held;
    let w = -1;
    if (I.up) w = 0; else if (I.down) w = 2;
    if (I.left) w = 3; else if (I.right) w = 1;
    if (Input.pressed.up) w = 0; if (Input.pressed.down) w = 2; if (Input.pressed.left) w = 3; if (Input.pressed.right) w = 1;
    if (w >= 0) { S.want = w; S.wantT = 0.35; } else if ((S.wantT -= dt) <= 0) S.want = -1;
    if (Input.pressed.a) dropSmoke(p, true);
    if (Input.pressed.b) useItem();
    for (const k of ['smokeCd', 'nitroT', 'magT', 'shieldT', 'oilT', 'slowT', 'boostT', 'invT', 'bumpCd']) if (S[k] > 0) S[k] -= dt;
    if (S.rollT > 0 && (S.rollT -= dt) <= 0) { S.item = S.rollItem; Snd.sfx('powerup'); UI.toast(`${ITEMS[S.item].n} · ÚSALO CON ${Engine.touch ? 'B' : 'X'}`); }
    tickPuffs(p, dt, 'p');
    const prevFuel = S.fuel;
    S.fuel = Math.max(0, S.fuel - dt * S.drain * (S.bonus ? 100 / 42 : 100 / 82) * (diff() === 0 ? 0.85 : 1));
    if (prevFuel > 0 && S.fuel <= 0) { Snd.sfx('alarm'); UI.toast('¡SIN GAS!'); }
    if (S.fuel <= 0 && Math.random() < dt * 3) parts.emit(p.vx, p.vy, rand(-10, 10), rand(-10, 10), 0.5, 0x2a2638, 0x5a5468, 2, 3, 0, 1);
    let spd = (S.fuel > 0 ? S.spd : S.spd * 0.48) * (S.nitroT > 0 ? 1.6 : 1) * (S.boostT > 0 ? 1.15 : 1) * (S.slowT > 0 ? 0.5 : 1) * (zoneSlow(p) ? 0.45 : 1);
    if (S.mode === 'tour') S.cityTime += dt;
    if (S.comboT > 0 && (S.comboT -= dt) <= 0) S.combo = 0;
    if (S.drill && S.drillT < DRILL && (S.drillT += dt) >= DRILL) { Snd.sfx('drill'); popup('TALADRO LISTO', p.x, p.y - 18, '#ffd23f'); }
    const stuck = p.jumpT > 0 || (!S.spikes && onIce(Math.floor(p.x / TS), Math.floor(p.y / TS)));
    if (S.spinT > 0) {
      S.spinT -= dt; S.spinA += dt * 16; spd *= 0.25;
      if (S.spinT <= 0) S.spinA = 0;
    } else if (!stuck) {
      const want = S.want;
      if (want >= 0 && want === (p.dir + 2) % 4) p.dir = want;
      else if (want >= 0 && want !== p.dir) {
        // giro anticipado: depende del auto (el roadster dobla antes que nadie)
        const tx = Math.floor(p.x / TS), ty = Math.floor(p.y / TS), cx = tx * TS + 8, cy = ty * TS + 8;
        const off = DX[p.dir] ? Math.abs(p.x - cx) : Math.abs(p.y - cy);
        if (off <= S.turnWin && openP(tx + DX[want], ty + DY[want])) {
          p.turnTile = ty * MW + tx; p.turnIn = p.dir;
          p.x = cx; p.y = cy; p.dir = want;
          if (!city.drift) parts.burst(p.x, p.y, 3, 30, 0.35, 0x9a95ad, 0x5a5468, 1, 1, 0, 3);
        }
      }
    }
    const ox = p.x, oy = p.y;
    advance(p, spd * dt, decidePlayer, openP);
    jumpTick(p, dt, true);
    rampCheck(p, true);
    const moved = Math.abs(p.x - ox) + Math.abs(p.y - oy);
    carVisual(p, city.drift ? predictPlayer : null, dt, 0.45, true);
    S.curSpd = moved / dt;
    if (city.drift) driftFx(p, dt, true);
    // la cámara mira hacia donde vas
    {
      const lfx = DX[p.dir], lfy = DY[p.dir], LA = Math.min(56, Engine.W * 0.16), k = 1 - Math.exp(-dt * 2.2);
      S.lookX += (lfx * LA - S.lookX) * k; S.lookY += (lfy * LA * 0.75 - S.lookY) * k;
    }
    exhaust(p, S.nitroT > 0, dt);
    if (S.oilT > 0 && (S.oilAcc += moved) >= 14) { S.oilAcc = 0; dropSlick(p, 'p'); }
    if (S.magT > 0) magnet(p, dt);
    const pt = Math.floor(p.y / TS) * MW + Math.floor(p.x / TS);
    if (pt !== lastPT) {
      lastPT = pt;
      bfs(distA, Math.floor(p.x / TS), Math.floor(p.y / TS));
      let ax = Math.floor(p.x / TS), ay = Math.floor(p.y / TS);
      for (let k = 0; k < 5 && openE(ax + DX[p.dir], ay + DY[p.dir]); k++) { ax += DX[p.dir]; ay += DY[p.dir]; }
      bfs(distB, ax, ay);
    }
    for (const rk of S.rockList) {
      if (p.jumpT > 0 || Math.abs(rk.cx - p.x) >= 11 || Math.abs(rk.cy - p.y) >= 11) continue;
      if (rk.snow && S.shieldT <= 0) {
        // nieve de la avalancha: no destruye, te devuelve
        if (S.bumpCd <= 0) { p.dir = (p.dir + 2) % 4; S.bumpCd = 0.5; S.slowT = Math.max(S.slowT, 0.5); snowPuff(rk.cx, rk.cy); Snd.sfx('puff'); UI.vibrate(30); }
        break;
      }
      if (S.shieldT > 0) { breakRock(rk); shieldBreak(S); break; }
      crash(); return;
    }
    for (const c of cans) {
      if (c.got || Math.abs(c.x - p.x) > 12 || Math.abs(c.y - p.y) > 12) continue;
      if (gotCan(c, p)) return;
    }
    if (S.spinT <= 0 && S.shieldT <= 0) {
      if (!S.spikes && !(p.jumpT > 0)) for (const s of slicks) if (s.life > 0 && s.owner === 'r' && near(s, p, 8)) { s.life = 0; s.spr.show(false); S.spinT = 1; S.spinA = 0; Snd.sfx('spin'); UI.vibrate([20, 20, 20, 20, 20]); break; }
    }
    updateBoxes(dt);
    updateCivs(dt);
    civBumps(p, S);
    updateEnemies(dt);
    if (S.trk && updateTrack(dt)) return;
    if (duel) {
      updateRival(dt);
      if (S.state !== 'play') return;
      duelContacts();
    }
    for (const e of enemies) {
      if (!e.active || e.hold > 0) continue;
      if (e.nearCd > 0) e.nearCd -= dt;
      if (e.stun > 0) { e.near = false; continue; }
      const cheb = Math.max(Math.abs(e.x - p.x), Math.abs(e.y - p.y)), hitR = S.trk === 'arena' ? 13 : 11;
      if (p.jumpT > 0 || e.jumpT > 0) { e.near = false; continue; }
      if (cheb < hitR && S.invT <= 0) {
        if (drillReady() && towards(p, e)) { wreck(e); continue; }
        if (S.shieldT > 0) { shieldBreak(S); e.stun = 3; e.spin = 0; e.near = false; Snd.sfx('stun', { pan: panX(e.x) }); addCoins(1); continue; }
        crash(); return;
      }
      if (cheb < 19) e.near = true;
      else if (e.near && cheb > 26) { e.near = false; if (e.nearCd <= 0 && S.invT <= 0) { e.nearCd = 2.5; nearMiss(); } }
    }
    if (S.escape && updateEscape(dt)) return;
    events(dt);
  }
  function civBumps(c, st) {
    for (const cv of civs) {
      if (!cv.active || cv.ghost > 0 || !near(cv, c, cv.bus ? 13 : 11)) continue;
      cv.ghost = 1.2;
      Snd.sfx('horn', { pan: panX(cv.x) });
      if (c === player && drillReady() && towards(c, cv)) {
        S.drillT = 0; cv.spinT = 1.5; cv.ghost = 2.5;
        if (S.mode === 'tour') addScore(150, cv.x, cv.y - 12);
        parts.burst(cv.vx, cv.vy, 16, 80, 0.5, 0xffd84a, 0x9ba3c0, 2, 1, 0, 3); shake(1.5, 0.2);
        continue;
      }
      if (st.nitroT > 0 || st.shieldT > 0) cv.spinT = 1;
      else {
        st.slowT = 0.5;
        if (towards(cv, c)) { cv.dir = (cv.dir + 2) % 4; cv.plan = null; cv.tile = -1; }
      }
      if (c === player) { shake(1, 0.15); UI.vibrate(35); }
    }
  }
  function updateCivs(dt) {
    for (const cv of civs) {
      if (!cv.active) continue;
      if (cv.ghost > 0) cv.ghost -= dt;
      if (cv.spinT > 0) {
        cv.spinT -= dt; cv.spin += dt * 14;
        if (cv.spinT <= 0) cv.spin = 0;
        continue;
      }
      advance(cv, BASE_SPEED * 0.66 * (zoneSlow(cv) ? 0.45 : 1) * dt, decideCivP, openE);
      planAhead(cv, decideCiv);
      carVisual(cv, predPlan, dt, 0.3, false);
      for (const s of slicks) if (s.life > 0 && near(s, cv, 8)) { s.life = 0; s.spr.show(false); cv.spinT = 1; break; }
    }
  }
  function updateEnemies(dt) {
    const base = policeSpeed();
    const idle = S.bonus && S.fuel > 0 && S.state === 'play';
    for (const e of enemies) {
      if (!e.active) continue;
      if (e.hold > 0) { if (S.state === 'play') e.hold -= dt; continue; }
      if (e.stun > 0) {
        e.stun -= dt; e.spin += dt * 14;
        e.stars.forEach((s, i) => { const a = S.t * 6 + i * Math.PI; s.show(true).at(e.vx + Math.cos(a) * 7, e.vy - 9 + Math.sin(a) * 2.5); });
        if (e.stun <= 0) { e.stars.forEach((s) => s.show(false)); e.spin = 0; }
        continue;
      }
      if (idle && !e.icp) continue;
      const wild = e.persona === 3 && !e.icp;
      if (e.slowT > 0) e.slowT -= dt;
      const iceK = S.ice && onIce(Math.floor(e.x / TS), Math.floor(e.y / TS)) ? 1.12 : 1;
      advance(e, base * (e.icp ? 1.1 : 1) * (S.spotted ? 1.08 : 1) * (zoneSlow(e) ? 0.45 : 1) * (e.slowT > 0 ? 0.5 : 1) * iceK * dt, wild ? decideWildP : decideEnemyP, wild ? openP : openE);
      jumpTick(e, dt, false);
      rampCheck(e, false);
      planAhead(e, decideEnemy);
      carVisual(e, predPlan, dt, 0.35, false);
      if (wild) {
        const rk = S.rockList.find((r) => Math.abs(r.cx - e.x) < 11 && Math.abs(r.cy - e.y) < 11);
        if (rk) {
          e.stun = 2.4; e.dir = (e.dir + 2) % 4; e.plan = null; e.tile = -1; S.nRock = (S.nRock || 0) + 1;
          Snd.sfx('stun', { pan: panX(e.x) }); parts.burst(e.vx, e.vy, 12, 70, 0.4, 0xff8a1e, 0xf4f1ea, 2, 1, 0, 3);
          continue;
        }
      }
      for (const s of smokes) {
        if (s.life <= 0 || s.hit.has(e) || Math.abs(s.x - e.x) >= 11 || Math.abs(s.y - e.y) >= 11) continue;
        s.hit.add(e); e.stun = e.icp ? 1.4 : 2.8; Snd.sfx('stun', { pan: panX(e.x) });
        if (s.owner === 'p') { if (S.mode === 'tour') addScore(e.icp ? 300 : 50, e.x, e.y - 12); addCoins(e.icp ? 3 : 1); mission('gas'); if (e.icp) mission('icp'); }
        break;
      }
      if (e.stun > 0) continue;
      for (const s of slicks) {
        if (s.life <= 0 || !near(s, e, 8)) continue;
        s.life = 0; s.spr.show(false); e.stun = 2.2; Snd.sfx('spin', { pan: panX(e.x), vol: 0.7 });
        if (s.owner === 'p') { addCoins(1); mission('oil'); }
        break;
      }
      if (e.stun > 0) continue;
      for (const cv of civs) {
        if (!cv.active || cv.ghost > 0 || !near(cv, e, cv.bus ? 13 : 11)) continue;
        cv.ghost = 1.2; e.stun = 0.9; Snd.sfx('horn', { pan: panX(cv.x) });
        if (towards(cv, e)) { cv.dir = (cv.dir + 2) % 4; cv.plan = null; cv.tile = -1; }
        break;
      }
    }
    for (let i = 0; i < enemies.length; i++) for (let j = i + 1; j < enemies.length; j++) {
      const a = enemies[i], b = enemies[j];
      if (!a.active || !b.active || a.stun > 0 || b.stun > 0 || a.hold > 0 || b.hold > 0) continue;
      if (a.dir === (b.dir + 2) % 4 && Math.abs(a.x - b.x) < 9 && Math.abs(a.y - b.y) < 9) { a.stun = b.stun = 1.6; Snd.sfx('stun', { pan: panX(a.x) }); }
    }
  }

  // ---------------- rival del duelo
  function retargetRival() {
    const rv = rival;
    rv.retT = 1.5;
    let best = null, bd = 1e9;
    const dOf = (c) => distV[Math.floor(c.y / TS) * MW + Math.floor(c.x / TS)];
    for (const c of cans) {
      if (c.got) continue;
      const d = dOf(c);
      if (d < bd) { bd = d; best = c; }
    }
    // histéresis: solo cambia de bidón si el nuevo está claramente más cerca
    if (rv.target && !rv.target.got && best !== rv.target && dOf(rv.target) <= bd + 3) best = rv.target;
    if (best && (best !== rv.target || rv.dirty)) {
      bfs(distC, Math.floor(best.x / TS), Math.floor(best.y / TS));
      // nuevo objetivo a sus espaldas: vuelta en U inmediata
      const tx = Math.floor(rv.x / TS), ty = Math.floor(rv.y / TS), d = rv.dir;
      const at = (x, y) => (openE(x, y) ? distC[y * MW + x] : 9999);
      if (at(tx - DX[d], ty - DY[d]) + 1 < at(tx + DX[d], ty + DY[d])) { rv.dir = (d + 2) % 4; rv.plan = null; rv.tile = -1; }
    }
    rv.target = best; rv.dirty = false;
  }
  function rivalCrash() {
    const rv = rival;
    rv.dead = 2; rv.bx = rv.vx; rv.by = rv.vy;
    rv.spr.show(false); rv.glow.show(false); rv.shield.show(false); rv.tag.show(false);
    rv.boom.show(true).set(A.boom[0]).at(rv.bx, rv.by);
    Snd.sfx('crash'); shake(2, 0.3);
    parts.burst(rv.bx, rv.by, 30, 120, 0.7, 0xffd84a, 0x7a2a3a, 2, 1, 0, 3);
    UI.toast(`¡LA POLICÍA ATRAPÓ A ${rv.name}!`);
  }
  function updateRival(dt) {
    const rv = rival, city = ALLC[S.city];
    if (!rv.active) return;
    if (rv.dead > 0) {
      rv.dead -= dt;
      const f = Math.floor((2 - rv.dead) / 0.09);
      if (f < A.boom.length) rv.boom.set(A.boom[f]).at(rv.bx, rv.by); else rv.boom.show(false);
      if (rv.dead <= 0) { resetRival(); rv.inv = 2; }
      return;
    }
    for (const k of ['inv', 'smokeCd', 'nitroT', 'shieldT', 'magT', 'oilT', 'slowT', 'retT']) if (rv[k] > 0) rv[k] -= dt;
    tickPuffs(rv, dt, 'r');
    if (rv.spinT > 0) {
      rv.spinT -= dt; rv.spinA += dt * 16;
      if (rv.spinT <= 0) rv.spinA = 0;
      return;
    }
    if (!rv.target || rv.target.got || rv.retT <= 0) retargetRival();
    const ox = rv.x, oy = rv.y;
    advance(rv, rv.spd * (rv.nitroT > 0 ? 1.5 : 1) * (rv.slowT > 0 ? 0.5 : 1) * (zoneSlow(rv) ? 0.45 : 1) * dt, decideRivalP, openE);
    planAhead(rv, decideRival);
    const vt = Math.floor(rv.y / TS) * MW + Math.floor(rv.x / TS);
    if (vt !== lastVT) { lastVT = vt; bfs(distV, Math.floor(rv.x / TS), Math.floor(rv.y / TS)); }
    carVisual(rv, predPlan, dt, 0.4, true);
    if (city.drift) driftFx(rv, dt, false);
    exhaust(rv, rv.nitroT > 0, dt);
    if (rv.oilT > 0 && (rv.oilAcc += Math.abs(rv.x - ox) + Math.abs(rv.y - oy)) >= 14) { rv.oilAcc = 0; dropSlick(rv, 'r'); }
    if (rv.magT > 0) magnet(rv, dt);
    if (rv.smokeCd <= 0 && enemies.some((e) => e.active && e.stun <= 0 && e.hold <= 0 && Math.hypot(e.x - rv.x, e.y - rv.y) < 44)) { dropSmoke(rv, false); rv.smokeCd = 2.8; }
    if (rv.item && (rv.useT -= dt) <= 0) {
      const k = rv.item;
      const chased = player.vis && !towards(rv, player) && near(rv, player, 90);
      if (k !== 'aceite' || chased || rv.useT < -6) { rv.item = null; applyItem(rv, k, !near(rv, player, 200)); }
    }
    for (const c of cans) if (!c.got && near(c, rv, 12) && gotCan(c, rv)) return;
    if (rv.shieldT <= 0 && rv.inv <= 0) {
      for (const s of slicks) if (s.life > 0 && s.owner === 'p' && near(s, rv, 8)) { s.life = 0; s.spr.show(false); rv.spinT = 1.4; Snd.sfx('spin'); addCoins(1); break; }
      for (const s of smokes) if (s.life > 0 && s.owner === 'p' && !s.hit.has(rv) && near(s, rv, 11)) { s.hit.add(rv); rv.spinT = 1.4; Snd.sfx('stun'); addCoins(1); break; }
    }
    civBumps(rv, rv);
    for (const e of enemies) {
      if (!e.active || e.stun > 0 || e.hold > 0 || rv.inv > 0 || !near(e, rv, 11)) continue;
      if (rv.shieldT > 0) { rv.shieldT = 0; e.stun = 3; Snd.sfx('shieldOff'); continue; }
      rivalCrash(); return;
    }
  }
  function duelContacts() {
    const rv = rival, p = player;
    if (rv.dead > 0 || !p.vis || S.bumpCd > 0 || !near(rv, p, 11)) return;
    S.bumpCd = 0.6;
    Snd.sfx('horn'); shake(1.5, 0.2); UI.vibrate(35);
    parts.burst((p.vx + rv.vx) / 2, (p.vy + rv.vy) / 2, 10, 80, 0.4, 0xffffff, 0xffb347, 1, 1, 0, 3);
    if (S.shieldT > 0 || S.nitroT > 0) { rv.spinT = 1.2; return; }
    if (rv.shieldT > 0 || rv.nitroT > 0) { S.spinT = 0.8; S.spinA = 0; return; }
    const pt = towards(p, rv), rt = towards(rv, p);
    if (pt) p.dir = (p.dir + 2) % 4;
    if (rt) { rv.dir = (rv.dir + 2) % 4; rv.plan = null; rv.tile = -1; }
  }

  let camX = 0, camY = 0;
  function updateFx(dt) {
    for (const s of smokes) {
      if (s.life <= 0) continue;
      s.life -= dt;
      const u = 1 - s.life / s.max;
      s.spr.set(A.smoke[Math.min(4, u < 0.08 ? 0 : u < 0.18 ? 1 : u < 0.72 ? 2 : u < 0.88 ? 3 : 4)]).at(s.x, s.y);
      if (s.life <= 0) s.spr.show(false);
    }
    for (const s of slicks) if (s.life > 0 && (s.life -= dt) <= 0) s.spr.show(false);
    for (const h of [heli, heli2]) if (h.on && h.away > 0) {
      h.away -= dt; h.y -= 110 * dt; h.x += 50 * dt;
      if (h.away <= 0) { h.on = false; [h.spr, h.rotor, h.sh, h.spot].forEach((q) => q.show(false)); }
    }
    for (const c of clouds) {
      c.x += dt * 9; c.y += dt * 4.5;
      if (c.x > MW * TS + 90) c.x = -90;
      if (c.y > MH * TS + 60) c.y = -60;
      c.spr.at(c.x, c.y);
    }
    for (const p of popups) {
      if (p.t <= 0) continue;
      p.t -= dt; p.y -= dt * 18;
      p.spr.at(p.x, p.y).show(p.t > 0 && (p.t > 0.3 || Math.floor(p.t * 20) % 2 === 0));
    }
    if (ALLC[S.city].rain) {
      for (let k = 0; k < 5; k++) parts.emit(camX + rand(-20, Engine.W + 20), camY + rand(-10, H), -40, 280, 0.22, 0xa8bcdc, 0x4a5a7a, 1, 1);
      if (Math.random() < dt * 20) parts.emit(camX + rand(0, Engine.W), camY + rand(0, H), 0, 0, 0.15, 0xd8e4f8, 0x8a9ab8, 2, 1);
    }
    parts.update(dt);
    skid.update(dt);
  }

  // ---------------- dibujo
  function shieldDraw(spr, on, t, x, y, T0, col) {
    spr.show(on && (t > 2 || Math.floor(T0 * 10) % 2 === 0));
    if (!on) return;
    spr.tint(col).at(x, y);
    spr.mat.opacity = 0.65 + 0.3 * Math.sin(T0 * 9);
  }
  function renderTrack(T0) {
    let si = 0;
    for (const e of enemies) {
      if (!e.active || !(e.jumpT > 0) || si >= TK.eSh.length) continue;
      const k = 1 + 0.42 * Math.sin(Math.PI * (1 - e.jumpT / JUMP));
      TK.eSh[si++].show(true).at(e.vx + (k - 1) * 8, e.vy + (k - 1) * 6);
    }
    for (; si < TK.eSh.length; si++) TK.eSh[si].show(false);
    if (S.trk === 'arena') for (const rp of S.rampList) if (rp.ring) rp.q.ring.set((rp.h ? A.ringH : A.ring)[Math.floor(T0 * 9 + rp.x) % 3]);
    if (S.trk === 'toy') {
      for (const m of S.marbleList) m.spr.set(A.marble[Math.floor(m.ph) & 3]).at(m.x, m.y);
      const blink = Math.floor(T0 * 4) & 1;
      for (const cr of S.rail.cross) if (cr.a) { const t = A.gate[cr.closed ? 1 : 0][cr.closed ? blink : 0]; cr.a.set(t); cr.b.set(t); }
      const tr = S.train, run = tr.wait <= 0;
      TK.train[0].show(run).at(tr.x - 17, S.rail.y - 1);
      TK.train[1].show(run).at(tr.x - 34 - 15, S.rail.y - 1);
      TK.train[2].show(run).at(tr.x - 64 - 15, S.rail.y - 1);
      const w = S.paw;
      TK.pawSh.show(!!w); TK.paw.show(!!w && w.t > 1.1);
      if (w) {
        const u = Math.min(1, w.t / 1.5);
        TK.pawSh.scaleBy(w.t > 1.9 ? Math.max(0.3, 1 - (w.t - 1.9) * 2) : 0.4 + u * 0.6).at(w.x, w.y);
        TK.pawSh.mat.opacity = 0.2 + u * 0.3;
        const dy = w.t < 1.5 ? -((1.5 - w.t) / 0.4) * 150 : w.t < 1.9 ? 0 : -((w.t - 1.9) / 0.4) * 150;
        TK.paw.at(w.x, w.y - 6 + dy);
      }
    }
  }
  function render() {
    if (S.state === 'garage' || S.state === 'story' || S.state === 'achs' || (S.state === 'guide' && S.guideFrom === 'garage')) { renderGarage(); return; }
    if (S.state === 'records' && S.recBg === 'map') { renderMap(); return; }
    if (S.state === 'records' && S.recBg === 'garage') { renderGarage(); return; }
    if (S.state === 'map' || S.state === 'travel' || S.state === 'arrive' || S.state === 'loading' || S.state === 'guide') { renderMap(); return; }
    const p = player, T0 = performance.now() / 1000, city = ALLC[S.city], night = !!city.night;
    const wf = Math.floor(T0 * 14) & 1;
    const pa = p.ang + (S.spinT > 0 ? S.spinA : 0);
    const blinkP = S.invT > 0 && Math.floor(T0 * 14) % 2 === 0;
    const jk = (c) => (c.jumpT > 0 ? 1 + 0.42 * Math.sin(Math.PI * (1 - c.jumpT / JUMP)) : 1);
    const pj = jk(p);
    p.spr.set(carTex(sel.m, sel.c)[wf]).scaleBy(pj).show(p.vis && !blinkP).at(p.vx, p.vy - (pj - 1) * 10).rot(pa);
    p.spr.m.position.z = pj > 1 ? 17 : 12;
    p.glow.scaleBy(pj).show(p.vis && pj === 1).at(p.vx, p.vy).rot(pa);
    TK.pSh.show(p.vis && pj > 1).at(p.vx + (pj - 1) * 8, p.vy + (pj - 1) * 6);
    TK.drill.show(p.vis && drillReady() && S.state === 'play');
    if (drillReady()) { const [fx, fy] = fwdOf(pa); TK.drill.set(A.drill[Math.floor(T0 * 16) & 1]).at(p.vx + fx * 11, p.vy - (pj - 1) * 10 + fy * 11).rot(pa); }
    p.glow.mat.opacity = Math.min(1, (0.3 + S.neon * 0.7) * (night ? 1 : 0.75) * (0.88 + 0.12 * Math.sin(T0 * 7)) * (S.nitroT > 0 ? 1.35 : 1));
    if (night) headlight(p.hl.show(p.vis), p.vx, p.vy, pa);
    shieldDraw(p.shield, p.vis && S.shieldT > 0, S.shieldT, p.vx, p.vy, T0, '#5ff2ff');
    for (const e of enemies) {
      if (!e.active) continue;
      const fade = e.icp && S.icpT < 2.5 && Math.floor(T0 * 10) % 2 === 0;
      const ej = jk(e);
      e.spr.set((e.icp ? A.carI : polTex()[e.persona])[Math.floor(T0 * (e.icp ? 10 : 6)) & 1]).scaleBy(ej).show(!fade).at(e.vx, e.vy - (ej - 1) * 10).rot(e.ang + e.spin);
      e.spr.m.position.z = ej > 1 ? 16.5 : 10;
      if (night) headlight(e.hl, e.vx, e.vy, e.ang);
    }
    if (rival.active) {
      const rv = rival, alive = rv.dead <= 0, ra = rv.ang + (rv.spinT > 0 ? rv.spinA : 0);
      const bl = rv.inv > 0 && Math.floor(T0 * 14) % 2 === 0;
      rv.spr.set(rv.frames[wf]).show(alive && !bl).at(rv.vx, rv.vy).rot(ra);
      rv.glow.show(alive).at(rv.vx, rv.vy).rot(ra);
      rv.glow.mat.opacity = 0.7 * (0.85 + 0.15 * Math.sin(T0 * 7 + 1));
      rv.tag.show(alive && (S.playT < 6 || S.state !== 'play' || Math.floor(T0 * 0.5) % 3 === 0)).at(rv.vx, rv.vy - 15);
      if (night) headlight(rv.hl.show(alive), rv.vx, rv.vy, ra);
      shieldDraw(rv.shield, alive && rv.shieldT > 0, rv.shieldT, rv.vx, rv.vy, T0, '#ffb347');
    }
    for (const cv of civs) {
      if (!cv.active) continue;
      cv.spr.set(cv.frames[Math.floor(T0 * 8) & 1]).at(cv.vx, cv.vy).rot(cv.ang + cv.spin);
      if (night) headlight(cv.hl, cv.vx, cv.vy, cv.ang);
    }
    for (const c of cans) {
      if (c.got) continue;
      const bob = Math.round(Math.sin(T0 * 4 + c.ph) * 1.5);
      c.spr.set(c.frames[Math.floor(T0 * 3 + c.ph) & 1]).at(c.x, c.y - 1 + bob);
      // si una patrulla quieta (esperando, aturdida o en la ronda de bono) queda encima, el bidón se dibuja sobre ella
      const still = enemies.some((e) => e.active && (e.hold > 0 || e.stun > 0 || S.bonus) && Math.abs(e.x - c.x) < 12 && Math.abs(e.y - c.y) < 12);
      c.spr.m.position.z = still ? 11 : 5;
      c.glow.at(c.x, c.y + 1).mat.opacity = 0.6 + Math.sin(T0 * 5 + c.ph) * 0.4;
    }
    for (const b of boxes) if (b.on) b.spr.set((S.trk === 'toy' ? A.gift : A.box)[Math.floor(T0 * 4 + b.ph) & 1]).at(b.x, b.y - 1 + Math.round(Math.sin(T0 * 3 + b.ph) * 1.5));
    for (const s of slicks) if (s.life > 0) s.spr.show(s.life > 1.2 || Math.floor(T0 * 10) % 2 === 0);
    if (S.trk) renderTrack(T0);
    if (S.cross) peds.forEach((q, i) => q.spr.set(A.ped[q.shirt][q.walking && q.delay <= 0 ? Math.floor(T0 * 8 + i) & 1 : 0]).at(q.x + q.ox, q.y + q.oy));
    glows.forEach((g, i) => { if (g.visible) g.mat.opacity = 0.55 + 0.35 * Math.sin(T0 * (3 + (i % 3)) + i); });
    if (S.flagAt) flagSpr.set(S.flagFrames[Math.floor(T0 * 7) % 4]).anchor(S.flagAt[0], S.flagAt[1], 4, 37);
    for (const rk of S.rockList) if (!rk.snow) rk.spr.set((rk.h ? A.barrierV : A.barrier)[Math.floor(T0 * 3) & 1]);
    for (const h of [heli, heli2]) if (h.on) {
      const hy = h.y - 24;
      h.spr.at(h.x, hy).rot(h.ang);
      h.rotor.at(h.x, hy - 2).rot(T0 * 26);
      h.sh.at(h.x + 10, h.y + 4).rot(h.ang);
      h.spot.show(!h.away).at(h.x, h.y);
      h.spot.mat.opacity = S.spotted ? 1 : 0.75;
    }
    if (S.escape) goalSpr.set(A.goal[Math.floor(T0 * 8) % 4]).anchor(S.escape.x, S.escape.y + 6, 2, 24);
    parts.sync();
    skid.sync();
    const W = Engine.W;
    const live = S.state === 'play' || S.state === 'intro';
    const MG = city.margin || 40;
    camX = clamp(Math.round(p.vx + (live ? S.lookX || 0 : 0)) - W / 2, -MG, MW * TS - W + MG);
    camY = clamp(Math.round(p.vy + (live ? S.lookY || 0 : 0)) - H / 2, -MG, MH * TS - H + MG);
    drawArrows(T0, camX, camY);
    setCam(camX, camY);
    renderScene(scene);
    drawRadar(T0, camX, camY);
    drawHud();
  }
  // flechas en el borde: bidón más cercano (o la meta), patrullas que vienen, rival
  function drawArrows(T0, cx, cy) {
    const W = Engine.W, list = [];
    const inView = (x, y) => x > cx + 6 && x < cx + W - 6 && y > cy + 6 && y < cy + H - 6;
    const dist = (o) => Math.hypot(o.x - player.x, o.y - player.y);
    if (S.state === 'play' && player.vis) {
      if (S.escape) { if (!inView(S.escape.x, S.escape.y)) list.push([S.escape.x, S.escape.y, '#7dff7a', false]); }
      else {
        let best = null, bd = 1e9;
        for (const c of cans) if (!c.got && dist(c) < bd) { bd = dist(c); best = c; }
        if (best && !inView(best.x, best.y)) list.push([best.x, best.y, best.kind === 'S' ? '#fff09a' : best.kind === 'L' ? '#7dff7a' : '#ffd23f', false]);
      }
      const cops = enemies.filter((e) => e.active && e.hold <= 0 && e.stun <= 0 && !inView(e.x, e.y) && dist(e) < 300).sort((a, b) => dist(a) - dist(b)).slice(0, 3);
      for (const e of cops) list.push([e.x, e.y, e.icp ? '#e07bff' : '#ff4a5a', dist(e) < 190]);
      if (rival.active && rival.dead <= 0 && !inView(rival.x, rival.y)) list.push([rival.x, rival.y, '#ffb347', false]);
    }
    const mx = cx + W / 2, my = cy + H / 2;
    arrows.forEach((a, i) => {
      const it = list[i];
      if (!it || (it[3] && Math.floor(T0 * 8) % 2)) { a.show(false); return; }
      // el rectángulo útil deja libre el marcador de arriba
      const dx = it[0] - mx, dy = it[1] - my, top = 30, bot = 14, side = 10;
      const cy0 = my + (top - bot) / 2, hh = H / 2 - (top + bot) / 2;
      const dy2 = it[1] - cy0;
      const k = Math.min((W / 2 - side) / Math.max(1e-3, Math.abs(dx)), hh / Math.max(1e-3, Math.abs(dy2)));
      a.show(true).tint(it[2]).at(mx + dx * k, cy0 + dy2 * k).rot(-(Math.atan2(dy2, dx) + Math.PI / 2));
    });
  }
  function drawRadar(t, cx, cy) {
    if (!rctx) return;
    const g = rctx, RW = MW * 2, RH = MH * 2;
    g.clearRect(0, 0, RW, RH);
    if (S.radarBg) g.drawImage(S.radarBg, 0, 0);
    g.fillStyle = 'rgba(79,227,255,0.05)';
    for (let x = 0; x < RW; x += 8) g.fillRect(x, 0, 1, RH);
    for (let y = 0; y < RH; y += 8) g.fillRect(0, y, RW, 1);
    g.strokeStyle = 'rgba(255,255,255,0.25)'; g.lineWidth = 1;
    g.strokeRect(Math.round(cx / 8) + 0.5, Math.round(cy / 8) + 0.5, Math.round(Engine.W / 8), Math.round(H / 8));
    const blink = Math.floor(t * 4) & 1, dot = (x, y, s = 2) => g.fillRect(Math.floor(x / 8) - (s >> 1), Math.floor(y / 8) - (s >> 1), s, s);
    for (const c of cans) {
      if (c.got || (c.kind === 'S' && blink)) continue;
      g.fillStyle = c.kind === 'S' ? '#fff09a' : c.kind === 'L' ? '#7dff7a' : '#ffd23f';
      dot(c.x, c.y);
    }
    g.fillStyle = '#b48cff';
    for (const b of boxes) if (b.on) dot(b.x, b.y);
    for (const e of enemies) {
      if (!e.active) continue;
      if (e.icp) { if (blink) continue; g.fillStyle = '#e07bff'; dot(e.x, e.y, 3); continue; }
      g.fillStyle = '#ff4a5a'; dot(e.x, e.y);
    }
    if (rival.active && rival.dead <= 0) { g.fillStyle = '#ffb347'; dot(rival.x, rival.y, 3); }
    g.fillStyle = blink ? '#ffffff' : '#4fe3ff';
    dot(player.x, player.y, 3);
  }
  function drawHud() {
    if (!hud.s) return;
    const set = (k, v, fn) => { if (hudCache[k] !== v) { hudCache[k] = v; fn(v); } };
    const duel = S.mode === 'duel';
    const arena = S.trk === 'arena';
    set('mode', S.mode + (arena ? 'A' : ''), () => {
      hud.sl.hidden = !duel;
      hud.s.className = duel ? 'odo txt' : 'odo';
      hud.hl.textContent = duel ? nice(rival.name) : 'Récord';
      hud.c.classList.toggle('arena', arena);
      hud.h.classList.toggle('cyan', !duel); hud.h.classList.toggle('pink', duel);
      hud.v.hidden = duel || arena;
    });
    if (duel) {
      set('s', 'd' + S.duelP, () => (hud.s.textContent = `${S.duelP}/${DUEL_WIN}`));
      set('h', 'd' + S.duelR, () => (hud.h.textContent = `${S.duelR}/${DUEL_WIN}`));
      set('l', 'duel', () => (hud.l.textContent = 'DUELO'));
    } else {
      set('s', S.score, (v) => (hud.s.innerHTML = odoH(v)));
      set('h', Math.max(hiNow(), S.score), (v) => (hud.h.textContent = pad6(v)));
      if (arena) set('l', 'a' + Math.ceil(S.showT), () => { hud.l.textContent = fmtT(Math.ceil(S.showT)); hud.l.classList.toggle('pink', S.showT < 10); });
      else if (S.escape) {
        const m = Math.round(Math.hypot(S.escape.x - player.x, S.escape.y - player.y) / 4);
        set('l', S.spotted ? 'v' : 'e' + m, () => { hud.l.textContent = S.spotted ? '¡TE VEN!' : `META ${m} M`; hud.l.classList.toggle('pink', S.spotted); });
      } else set('l', S.round + (S.bonus ? 10 : 0), () => { hud.l.textContent = S.bonus ? 'BONO' : `${S.round + 1}/${roundsOf()}`; hud.l.classList.remove('pink'); });
    }
    set('lbl', S.city, (v) => (hud.lbl.textContent = nice(ALLC[v].name)));
    set('f', Math.round(S.fuel), (v) => { hud.f.style.width = v + '%'; hud.fw.classList.toggle('low', v < 22); });
    set('v', S.lives, (v) => (hud.v.innerHTML = '<b></b>'.repeat(Math.max(0, v - 1))));
    const left = duel ? cans.filter((c) => !c.got).length : arena ? S.collected : 10 - S.collected;
    set('c', left + (S.special ? 1000 : 0) + (arena ? 5000 : 0), () => (hud.c.textContent = `${left}${S.special ? ' ×2' : ''}`));
    set('m', S.coins, (v) => (hud.m.innerHTML = coinH(v)));
    set('mb', S.coinBump > 0, (v) => hud.m.classList.toggle('bump', v));
    const rolling = S.rollT > 0;
    const icon = rolling ? Object.keys(ITEMS)[Math.floor(performance.now() / 70) % 4] : S.item;
    set('i', icon || '', (v) => { hud.ii.hidden = !v; if (v) hud.ii.src = iconURL(v); });
    set('io', !!S.item && !rolling, (v) => { hud.i.classList.toggle('on', v); UI.setButtons('GAS', v ? ITEMS[S.item].n : 'ÍTEM'); });
  }
  const CONT = 100;
  function gameOver() {
    S.state = 'over';
    Snd.loopsOff();
    const tour = S.mode === 'tour' && !S.inTrack, rec = tour && S.score > S.hi;
    if (rec) { S.hi = S.score; Store.set('hi_rally', S.score); }
    if (tour) Store.set('rally_run', null);
    banner(null);
    Snd.stop(); Snd.sfx('gameover');
    const show = () => {
      S.state = 'over';
      buildHud();
      const btns = [['retry', S.inTrack ? 'Reintentar la pista' : 'Reintentar la ciudad'], ['map', 'Mapa'], ['menu', 'Menú']];
      if (tour && S.coins >= CONT) btns.unshift(['cont', `Seguir aquí por ${CONT} monedas`]);
      UI.gameOver('GAS RALLY', S.score, rec, [['Lugar', nice(ALLC[S.city].name)], ['Ronda', `${S.round + 1} de ${roundsOf()}`], ['Auto', nice(CARS[sel.m].name)], ['Monedas', fmtN(S.coins)]], btns,
        { why: S.fuel <= 0 ? 'te quedaste sin gas y te alcanzaron' : 'te alcanzó la patrulla', score: fmtN(S.score) });
    };
    if (tour && qualifies(S.score)) { S.overT = 0; openInitials(S.score, show); } else show();
  }
  // continuar (como en el arcade): pagas monedas, sigues en la misma ronda con 3 autos y los puntos desde cero
  function continueRun() {
    if (S.coins < CONT) return;
    addCoins(-CONT, true);
    Object.assign(S, { score: 0, lives: 3, nextLife: 20000 });
    Snd.sfx('buy');
    startCity(S.city, S.round);
    UI.toast(`¡CONTINÚAS EN LA RONDA ${S.round + 1}!`);
  }

  // ---------------- pantalla de carga: qué trae la ciudad, misiones y un consejo
  // tarjeta de embarque: a dónde vas, qué trae la ciudad, tus misiones y un consejo
  function openLoading(ci, ready) {
    S.state = 'loading'; S.loadCi = ci; S.loadT = ready ? 2 : 0; S.loadReady = false;
    if (ci < NC) S.mapSel = ci; else S.espSel = ci - NC;
    if (!ready) { S.loadRound = 0; S.loadTip = pick(TIPS); }
    S.loadTip = S.loadTip || pick(TIPS);
    const c = ALLC[ci], duel = S.mapMode === 'duel' && ci < NC, nR = c.rounds || ROUNDS;
    UI.setButtons('PARTIR', 'MAPA');
    const stars = starsOf(c.id), best = Store.get('rally_best', {})[c.id];
    const fi = S.tripFrom != null ? S.tripFrom : Store.get('rally_last', null);
    const from = !c.kind && fi != null && fi < NC && fi !== ci ? { code: CITIES[fi].code, name: nice(CITIES[fi].name) } : { code: 'PIT', name: 'Garaje' };
    const rows = duel
      ? [`Gana el primero en juntar ${DUEL_WIN} de ${DUEL_CANS} bidones.`, `Premio: ${80 + 20 * ci} monedas. Si pierdes, 15.`, 'Si te atrapan, vuelves a la pista sin perder autos.']
      : [...FEATS[c.id], ...(nR > 1 ? ['Ronda 2: bono. Ronda 3: interceptor y escape.'] : [])];
    const meta = [
      ['Modo', duel ? 'Duelo' : c.kind ? 'Especial' : 'Gira'],
      [duel ? 'Rival' : 'Rondas', duel ? nice(RIVALS[c.id].name) : nR === 1 ? '1 show' : String(nR)],
      ['Récord', best ? fmtN(best.score) : '—'],
      ['Dificultad', ['Fácil', 'Normal', 'Difícil', 'Maestro'][diff()]],
    ];
    UI.setHud(`
      <div class="hud-ui load${ready ? ' ready' : ''}" id="load">
        <div class="ticket" role="dialog" aria-label="Tarjeta de embarque a ${nice(c.name)}">
          <div class="tk-main">
            <div class="tk-head"><b>Pixel Air</b><span>Tarjeta de embarque</span>${duel ? '' : starsH(stars)}</div>
            <div class="tk-route">
              <div><small>Desde</small><b>${from.code}</b><span>${from.name}</span></div>
              <i class="tk-plane" aria-hidden="true">✈</i>
              <div class="to"><small>Hacia</small><b>${c.code}</b><span><img class="flagimg" src="${iconOf(c)}" alt=""> ${nice(c.name)}</span></div>
            </div>
            <dl class="tk-meta">${meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
            <h3>${duel ? 'El duelo' : c.kind ? 'En esta pista' : 'En esta ciudad'}</h3>
            <ul>${rows.map((t) => `<li>${t}</li>`).join('')}</ul>
            <p class="tk-tip"><b>Consejo:</b> ${S.loadTip}</p>
          </div>
          <div class="tk-stub">
            <h3>Tus misiones</h3>
            <ul class="tk-mis">${missionList().list.map((m) => `<li><span>${mText(m)}</span><em>${Math.min(m.n, MISSIONS[m.id].n)}/${MISSIONS[m.id].n}</em><i class="hcoin">${coinH(MISSIONS[m.id].c)}</i></li>`).join('')}</ul>
            ${freeMode() && !duel && nR > 1 ? `<div class="lround" role="group" aria-label="Ronda de inicio"><span>Partir en</span>${[0, 1, 2].map((r) => `<button class="chip${r === S.loadRound ? ' on' : ''}" data-r="${r}">${r + 1}${r === 1 ? ' bono' : r === 2 ? ' escape' : ''}</button>`).join('')}</div>` : ''}
            <div class="tk-code" aria-hidden="true"><i></i></div>
            <div class="tk-btns"><button class="chip" id="lmap">Mapa</button><button class="chip" id="lguide">Guía</button><button class="gbtn" id="lgo" disabled>Embarcando…</button></div>
          </div>
        </div>
      </div>`);
    UI.$('#lgo').addEventListener('click', () => { Snd.unlock(); loadGo(); });
    UI.$('#lguide').addEventListener('click', () => openGuide('loading'));
    UI.$('#lmap').addEventListener('click', () => backToMap());
    UI.$('#load').querySelectorAll('.lround .chip').forEach((b) => b.addEventListener('click', () => setLoadRound(+b.dataset.r)));
    if (!ready) Snd.sfx('tick');
  }
  function setLoadRound(r) {
    const nR = ALLC[S.loadCi].rounds || ROUNDS;
    S.loadRound = (r + nR) % nR;
    Snd.sfx('move');
    UI.$('#load').querySelectorAll('.lround .chip').forEach((b) => b.classList.toggle('on', +b.dataset.r === S.loadRound));
  }
  function loadGo() {
    if (S.state !== 'loading' || !S.loadReady) return;
    Snd.sfx('ignite');
    if (S.mapMode === 'duel' && S.loadCi < NC) startDuel(S.loadCi); else startCity(S.loadCi, freeMode() ? S.loadRound : 0);
  }
  function updateLoading(dt) {
    S.loadT += dt;
    if (S.loadT >= 1.2 && !S.loadReady) {
      S.loadReady = true;
      const b = UI.$('#lgo');
      if (b) { b.disabled = false; b.textContent = '¡A la pista! ▶'; }
      const l = UI.$('#load'); if (l) l.classList.add('ready');
      Snd.sfx('select');
    }
    if (freeMode() && S.mapMode !== 'duel' && (ALLC[S.loadCi].rounds || ROUNDS) > 1 && (Input.pressed.up || Input.pressed.down)) setLoadRound(S.loadRound + (Input.pressed.down ? 1 : -1));
    if (Input.pressed.a || Input.pressed.start) loadGo();
    else if (Input.pressed.select) openGuide('loading');
    else if (Input.pressed.b) backToMap();
  }
  function backToMap() { if (S.loadCi >= NC) openMap({ mode: 'esp' }); else openMap({ sel: S.loadCi }); }

  // ---------------- guía: qué hace cada cosa
  function guidePages() {
    if (A.guide) return A.guide;
    const ka = Engine.touch ? 'A' : 'Z', kb = Engine.touch ? 'B' : 'X';
    const coin = (() => { const { c, g } = mk(12, 12); disc(g, 6, 6, 5, '#c48a10'); disc(g, 5.6, 5.6, 4.2, '#ffd23f'); R(g, '#fff6b0', 4, 3, 2, 1); return outline(c); })();
    const star = (() => { const { c, g } = mk(13, 13); poly(g, [[6.5, 0.5], [8.2, 4.6], [12.5, 4.8], [9.2, 7.6], [10.4, 12], [6.5, 9.6], [2.6, 12], [3.8, 7.6], [0.5, 4.8], [4.8, 4.6]], '#ffd23f'); return outline(c); })();
    const IC = { b: '#22222e', l: '#4a4a5e', d: '#111118', s: '#f2f2f2' };
    const pages = [
      { t: 'Bidones', rows: [
        [A.canNc[0], 'Bidón', 'Da bencina y puntos: 100, 200… hasta 1000. Junta 10 para pasar de ronda.'],
        [A.canSc[0], 'Bidón S', 'Duplica los puntos de los bidones que siguen.'],
        [A.canLc[0], 'Bidón L', 'Bono por la bencina que te queda.'],
        [rallySmoke(2), `Gas (${ka})`, 'Una nube que aturde a las patrullas. Gasta bencina: sin bencina vas lento y no hay gas.']] },
      { t: 'Ítems', rows: [
        [itemBoxCanvas(0), 'Caja ?', `Un ítem al azar; se usa con ${kb}. Si ya tienes uno, te da 5 monedas.`],
        [itemIconCanvas('nitro'), 'Nitro', 'Mucha velocidad por 3 segundos.'],
        [itemIconCanvas('iman'), 'Imán', 'Atrae los bidones cercanos por 8 segundos.'],
        [itemIconCanvas('escudo'), 'Escudo', 'Aguanta un choque con una patrulla o rompe una barrera.'],
        [itemIconCanvas('aceite'), 'Aceite', 'Deja manchas: la patrulla que las pisa queda girando.']] },
      { t: 'Patrullas', rows: [
        ...PTYPES.map((q, i) => [A.carTc[i], q.n, q.d]),
        [starCanvas(), 'Dispersión', 'Cada cierto rato todas se van a sus esquinas unos segundos.']] },
      { t: 'Peligros', rows: [
        [rallyCar(IC, 0, true), 'Interceptor', 'Patrulla negra más rápida. Aparece un rato y se retira.'],
        [heliCanvas(), 'Helicóptero', 'En el escape de la ronda 3: si su foco te ilumina, todas van por ti.'],
        [rallyBarrier(0), 'Barrera', 'Si la chocas pierdes un auto. A la patrulla errática a veces también le pasa.'],
        [civCanvas('taxi', CIV.colectivo, 0), 'Tráfico', 'Los autos civiles no te destruyen, pero te frenan. A las patrullas las aturden.']] },
      { t: 'Ciudades', rows: [
        [goalCanvas(0), 'Escape', 'Al juntar los 10 bidones de la ronda 3, llega a la meta para terminar la ciudad.'],
        [flagField('CL'), 'Temblor', 'En Santiago: las patrullas pierden el control unos segundos.'],
        [playerCarCanvas('rayo', CARS[1].colors[0], 0), 'Derrape', 'En Londres y Tokio: sal de la curva derrapando y ganas un mini turbo.'],
        [pedCanvas('#ff4f9a', 0), 'Gran cruce', 'En Tokio: cuando cruzan peatones, todos los autos frenan.']] },
      { t: 'Especiales', rows: [
        [RT.icon('arena'), 'Arena Show', 'Un show de 90 s: salta rampas, pasa por aros de fuego (+500) y sobre los monster trucks (+400). Chocar resta 10 s.'],
        [RT.icon('snow'), 'Pueblo Nevado', 'En el hielo las patrullas no doblan. Los montículos frenan y las avalanchas cortan calles. Necesita clavos.'],
        [RT.icon('toy'), 'Cuarto de Juguetes', 'Pilas en vez de bidones. Espera el tren en la barrera y esquiva las canicas y la pata del gato.'],
        [RT.drill(0), 'Taladro', 'Equipo: se carga en 8 s. Con carga, la patrulla que chocas de frente queda fuera 12 s (+400).'],
        [RT.suv(POLICE_LIVERY[2], 0), 'Clavos', 'Equipo: no resbalas en aceite, canicas ni hielo, y doblas antes.']] },
      { t: 'Progreso', rows: [
        [coin, 'Monedas', 'Se ganan jugando. En el taller compras autos, mejoras, pinturas y equipo.'],
        [star, 'Estrellas', `Por ciudad: terminarla, sin chocar y en menos de ${fmtT(PAR)}. Cada estrella nueva da 10 monedas.`],
        [itemBoxCanvas(1), 'Misiones', 'Siempre hay 3. Al cumplir una cobras y aparece otra.'],
        [playerCarCanvas('muscle', CARS[3].colors[2], 0), 'Duelos', 'Carrera por bidones contra el rival de cada ciudad.'],
        [goalCanvas(1), 'Récords y logros', 'Los 10 mejores puntajes con iniciales y los logros con porcentaje están en el inicio. La gira se guarda sola.']] },
      { t: 'Controles', rows: Engine.touch ? [
        [null, 'Cruceta', 'Doblar. Puedes marcar el giro antes de llegar a la esquina.'],
        [null, 'A', 'Gas (humo).'], [null, 'B', 'Usar ítem.'], [null, 'Start', 'Pausa, ajustes y misiones.'], [null, 'Select', 'Guía (en el inicio, el taller y el mapa).']] : [
        [null, 'Flechas / WASD', 'Doblar. Puedes marcar el giro antes de llegar a la esquina.'],
        [null, 'Z / espacio', 'Gas (humo).'], [null, 'X / shift', 'Usar ítem.'], [null, 'Enter', 'Pausa, ajustes y misiones.'], [null, 'Tab', 'Guía (en el inicio, el taller y el mapa). M: sonido. C: filtro CRT.']] },
    ];
    for (const pg of pages) pg.rows = pg.rows.map(([c, n, d]) => [c ? c.toDataURL() : null, n, d]);
    return (A.guide = pages);
  }
  function openGuide(from) {
    init();
    S.guideFrom = from; S.state = 'guide'; S.gPage = S.gPage || 0;
    document.body.classList.add('inmenu');
    UI.setButtons('SIGUIENTE', 'VOLVER');
    Snd.sfx('select');
    renderGuide();
  }
  function renderGuide() {
    const pages = guidePages(), pg = pages[S.gPage];
    UI.setHud(`
      <div class="hud-ui guide" id="guide">
        <div class="gtitle">Guía</div>
        <div class="gtabs" role="tablist">${pages.map((q, i) => `<button class="chip${i === S.gPage ? ' on' : ''}" data-i="${i}" role="tab" aria-selected="${i === S.gPage}">${q.t}</button>`).join('')}</div>
        <div class="gpage">
          <ul>${pg.rows.map(([img, n, d]) => `<li>${img ? `<img src="${img}" alt="">` : '<i class="gkey"></i>'}<div><b>${n}</b><span>${d}</span></div></li>`).join('')}</ul>
        </div>
        <div class="gfoot"><button class="arr" id="gprev" aria-label="Página anterior">◀</button><span>${S.gPage + 1}/${pages.length}</span><button class="arr" id="gnext" aria-label="Página siguiente">▶</button><button class="chip" id="gback">Volver</button></div>
      </div>`);
    UI.$('#guide').querySelectorAll('.gtabs .chip').forEach((b) => b.addEventListener('click', () => { S.gPage = +b.dataset.i; Snd.sfx('move'); renderGuide(); }));
    UI.$('#gprev').addEventListener('click', () => guideTurn(-1));
    UI.$('#gnext').addEventListener('click', () => guideTurn(1));
    UI.$('#gback').addEventListener('click', closeGuide);
  }
  function guideTurn(d) { const n = guidePages().length; S.gPage = (S.gPage + d + n) % n; Snd.sfx('move'); renderGuide(); }
  function closeGuide() {
    Snd.sfx('back');
    if (S.guideFrom === 'garage') openGarage();
    else if (S.guideFrom === 'loading') openLoading(S.loadCi, true);
    else if (S.guideFrom === 'map' && S.mapMode === 'esp') openMap({ mode: 'esp' });
    else openMap();
  }
  function updateGuide() {
    if (Input.pressed.left || Input.pressed.up) guideTurn(-1);
    else if (Input.pressed.right || Input.pressed.down || Input.pressed.a) guideTurn(1);
    else if (Input.pressed.b || Input.pressed.select || Input.pressed.start) closeGuide();
  }

  // ---------------- logros, récords con iniciales, historia y final de la gira
  const achGot = () => Store.get('rally_ach', {});
  function ach(id) {
    const got = achGot();
    if (got[id]) return;
    got[id] = Date.now(); Store.set('rally_ach', got);
    const a = ACHS.find((q) => q[0] === id);
    if (a) (S.achQ || (S.achQ = [])).push(a);
  }
  const achPct = () => Math.round((ACHS.filter((a) => achGot()[a[0]]).length / ACHS.length) * 100);
  function achTick(dt) {
    if (S.achT > 0) { if ((S.achT -= dt) <= 0) { const el = UI.$('#rach'); if (el) el.hidden = true; } return; }
    if (!S.achQ || !S.achQ.length) return;
    const a = S.achQ.shift(), el = UI.$('#rach');
    Snd.sfx('ach');
    if (el) { el.innerHTML = `<b>★ LOGRO</b>${a[1]}<small>${a[2]}</small>`; el.hidden = false; S.achT = 3; }
    else { UI.toast(`★ LOGRO: ${a[1]}`); S.achT = 1.9; }
  }
  function trackAchievements(mask) {
    const c = curC();
    if (c.id === 'arena' && mask === 7) ach('arena');
    if (c.id === 'nieve') ach('snow');
    if (c.id === 'cuarto') ach('toy');
    if (S.city === 0) ach('city1');
    if (S.city < NC && mask === 7) ach('stars');
    if (S.city < NC && CITIES.every((q) => starsOf(q.id) === 7)) ach('allstars');
    if (S.cityDeaths === 0 && S.trk !== 'arena') ach('clean');
    checkMisc();
  }
  function checkMisc() {
    if (S.coins >= 2000) ach('rich');
    if (!S.inTrack && S.score >= 100000) ach('score');
    if (owned.size >= CARS.length) ach('cars');
  }
  // los 10 mejores con iniciales (estilo arcade)
  const topList = () => Store.get('rally_top', []);
  const qualifies = (sc) => { const l = topList(); return sc > 0 && (l.length < 10 || sc > l[l.length - 1].s); };
  const INI = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ0123456789. ';
  function openInitials(score, after) {
    S.state = 'initials'; S.iniScore = score; S.iniAfter = after; S.iniPos = 0;
    S.ini = (Store.get('rally_ini', 'AAA') + '   ').slice(0, 3).split('');
    document.body.classList.add('inmenu');
    UI.setButtons('OK', 'BORRAR');
    banner(null);
    Snd.play(SONGS.victory);
    renderInitials();
  }
  function renderInitials() {
    UI.setHud(`
      <div class="hud-ui load" id="ini"><div class="lcard">
        <div class="lhead"><b>¡Nuevo récord!</b><small>Hiciste ${fmtN(S.iniScore)} puntos. Escribe tus iniciales.</small></div>
        <div class="inis">${S.ini.map((ch, i) => `<div class="inic${i === S.iniPos ? ' on' : ''}"><button class="arr" data-i="${i}" data-d="1" aria-label="Letra siguiente">▲</button><b>${ch === ' ' ? '_' : ch}</b><button class="arr" data-i="${i}" data-d="-1" aria-label="Letra anterior">▼</button></div>`).join('')}</div>
        <p class="ltip">${Engine.touch ? 'Con ▲ y ▼ cambias la letra; A pasa a la siguiente.' : 'Con ↑ y ↓ cambias la letra, con ← y → te mueves. Z confirma y X borra.'}</p>
        <div class="lbtns"><button class="gbtn" id="iok">Guardar ▶</button></div>
      </div></div>`);
    UI.$('#ini').querySelectorAll('.inic .arr').forEach((b) => b.addEventListener('click', () => { S.iniPos = +b.dataset.i; iniStep(+b.dataset.d); }));
    UI.$('#iok').addEventListener('click', () => iniDone());
  }
  function iniStep(d) { const k = Math.max(0, INI.indexOf(S.ini[S.iniPos])); S.ini[S.iniPos] = INI[(k + d + INI.length) % INI.length]; Snd.sfx('move'); renderInitials(); }
  function updateInitials() {
    if (Input.pressed.up) iniStep(1);
    else if (Input.pressed.down) iniStep(-1);
    else if (Input.pressed.left) { S.iniPos = (S.iniPos + 2) % 3; Snd.sfx('move'); renderInitials(); }
    else if (Input.pressed.right) { S.iniPos = (S.iniPos + 1) % 3; Snd.sfx('move'); renderInitials(); }
    else if (Input.pressed.start) iniDone();
    else if (Input.pressed.a) { if (S.iniPos < 2) { S.iniPos++; Snd.sfx('select'); renderInitials(); } else iniDone(); }
    else if (Input.pressed.b) { S.ini[S.iniPos] = ' '; if (S.iniPos > 0) S.iniPos--; Snd.sfx('back'); renderInitials(); }
  }
  function iniDone() {
    if (S.state !== 'initials') return;
    const name = S.ini.join('').trim() || '???';
    Store.set('rally_ini', S.ini.join(''));
    const list = topList(), entry = { n: name, s: S.iniScore, c: ALLC[S.city] ? ALLC[S.city].name : '', l: S.loop || 0, t: Date.now() };
    list.push(entry); list.sort((a, b) => b.s - a.s);
    if (list.length > 10) list.length = 10;
    Store.set('rally_top', list);
    ach('top'); Snd.sfx('buy');
    openRecords(S.iniAfter, entry.t, 'play');
  }
  function openRecords(after, hl, bg = 'map') {
    S.state = 'records'; S.recAfter = after; S.recBg = bg;
    document.body.classList.add('inmenu');
    UI.setButtons('SEGUIR', 'VOLVER');
    const list = topList();
    UI.setHud(`
      <div class="hud-ui load" id="recs"><div class="lcard">
        <div class="lhead"><b>Récords</b><small>Los 10 mejores puntajes de la gira mundial</small></div>
        <ol class="rtab">${list.length ? list.map((e, i) => `<li class="${e.t === hl ? 'me' : ''}"><span>${i + 1}</span><b>${e.n}</b><em>${fmtN(e.s)}</em><small>${nice(e.c)}${e.l ? `, vuelta ${e.l + 1}` : ''}</small></li>`).join('') : '<li class="none">Todavía no hay récords. Termina una gira o haz un buen puntaje y aparecerás aquí.</li>'}</ol>
        <div class="lbtns"><button class="gbtn" id="rback">${bg === 'play' ? 'Seguir ▶' : 'Volver'}</button></div>
      </div></div>`);
    UI.$('#rback').addEventListener('click', () => recordsBack());
  }
  function recordsBack() {
    if (S.state !== 'records') return;
    Snd.sfx('back');
    const f = S.recAfter; S.recAfter = null;
    if (f) f(); else openMap();
  }
  function updateRecords() { if (Input.pressed.a || Input.pressed.b || Input.pressed.start || Input.pressed.select) recordsBack(); }
  // pantalla de logros (desde el garaje)
  const ACH_PER = 8;
  function openAchs() {
    init(); initGarage();
    S.state = 'achs'; S.achPage = S.achPage || 0;
    document.body.classList.add('inmenu');
    UI.setButtons('SIGUIENTE', 'VOLVER');
    Snd.sfx('select');
    renderAchs();
  }
  function renderAchs() {
    const got = achGot(), pages = Math.ceil(ACHS.length / ACH_PER), pg = S.achPage % pages, pct = achPct();
    UI.setHud(`
      <div class="hud-ui load" id="achs"><div class="lcard">
        <div class="lhead"><b>Logros: ${pct}%</b><small>Llevas ${ACHS.filter((a) => got[a[0]]).length} de ${ACHS.length}. Página ${pg + 1} de ${pages}.</small></div>
        <div class="lbar"><i style="width:${pct}%;animation:none"></i></div>
        <ul class="achl">${ACHS.slice(pg * ACH_PER, pg * ACH_PER + ACH_PER).map((a) => `<li class="${got[a[0]] ? 'ok' : ''}"><i>${got[a[0]] ? '★' : '☆'}</i><div><b>${a[1]}</b><span>${a[2]}</span></div></li>`).join('')}</ul>
        <div class="lbtns"><button class="arr" id="aprev" aria-label="Página anterior">◀</button><button class="arr" id="anext" aria-label="Página siguiente">▶</button><button class="gbtn" id="aback">Volver</button></div>
      </div></div>`);
    UI.$('#aprev').addEventListener('click', () => achTurn(-1));
    UI.$('#anext').addEventListener('click', () => achTurn(1));
    UI.$('#aback').addEventListener('click', () => { Snd.sfx('back'); openGarage('home'); });
  }
  function achTurn(d) { const pages = Math.ceil(ACHS.length / ACH_PER); S.achPage = (S.achPage + d + pages) % pages; Snd.sfx('move'); renderAchs(); }
  function updateAchs() {
    if (Input.pressed.left || Input.pressed.up) achTurn(-1);
    else if (Input.pressed.right || Input.pressed.down || Input.pressed.a) achTurn(1);
    else if (Input.pressed.b || Input.pressed.start || Input.pressed.select) { Snd.sfx('back'); openGarage('home'); }
  }
  // historia al empezar por primera vez
  function openStory() {
    init(); initGarage();
    S.state = 'story'; S.storyT = 0;
    document.body.classList.add('inmenu');
    UI.setButtons('¡VAMOS!', 'SALTAR');
    Snd.play(SONGS.garage);
    UI.setHud(`
      <div class="hud-ui load" id="story"><div class="lcard">
        <div class="lhead"><b>Gas Rally: gira mundial</b><small>Seis ciudades, un tanque de bencina y la policía de cada país detrás de ti.</small></div>
        <ul class="slines">
          <li>Junta los 10 bidones de cada ronda antes de quedarte sin bencina.</li>
          <li>Suelta gas para aturdir a las patrullas y usa los ítems de la calle.</li>
          <li>En la ronda 3, escapa del helicóptero y llega a la meta.</li>
          <li>Gana monedas para mejorar tu auto, comprar equipo y abrir pistas especiales.</li>
          <li class="route">Santiago → Buenos Aires → México → Los Ángeles → Londres → Tokio</li>
        </ul>
        <div class="lbtns"><button class="gbtn" id="sgo">¡A la pista! ▶</button></div>
      </div></div>`);
    UI.$('#sgo').addEventListener('click', () => { Snd.unlock(); storyDone(); });
  }
  function storyDone() { if (S.state !== 'story') return; Store.set('rally_intro', true); Snd.sfx('start'); openGarage('home'); }
  function updateStory(dt) {
    S.storyT += dt;
    if (S.storyT > 0.4 && (Input.pressed.a || Input.pressed.start || Input.pressed.b)) storyDone();
  }
  // final: estadísticas, créditos y la vuelta siguiente (y la dificultad MAESTRO)
  function openEnding() {
    S.state = 'ending'; S.endT = 0; S.fwT = 0.3;
    const done = Store.get('rally_done', 0) + 1;
    Store.set('rally_done', done);
    ach('tour'); if (diff() === 3) ach('master');
    const stars = CITIES.reduce((n, c) => n + [1, 2, 4].filter((b) => starsOf(c.id) & b).length, 0);
    banner(null);
    Snd.loopsOff(); Snd.play(SONGS.victory);
    UI.setButtons('SEGUIR', 'SEGUIR');
    UI.setHud(`
      <div class="hud-ui load ending" id="end"><div class="lcard">
        <div class="lhead"><b>¡Gira mundial completa!</b><small>${done === 1 ? 'Llegaste a Tokio. La policía del mundo te aplaude (a regañadientes).' : `Terminaste la vuelta ${S.loop + 1}. ¡Qué manera de manejar!`}</small></div>
        <div class="lcols">
          <div class="lsec"><h3>Tu gira</h3><ul>
            <li>Puntos: <b>${fmtN(S.score)}</b></li><li>Estrellas: <b>${stars} de 18</b></li><li>Autos: <b>${owned.size} de ${CARS.length}</b></li>
            <li>Monedas: <b>${fmtN(S.coins)}</b></li><li>Logros: <b>${achPct()}%</b></li></ul></div>
          <div class="lsec credits"><h3>Créditos</h3><div class="roll"><div>
            <p><b>Gas Rally</b></p><p>Un juego de Pixel Arcade</p><p>Idea y pruebas<br><b>Simon</b></p><p>Código, pixel art y música<br><b>Claude</b></p>
            <p>Inspirado en los juegos de rally de los 80</p><p>¡Gracias por jugar!</p></div></div></div>
        </div>
        <p class="ltip"><b>Nuevo:</b>${done === 1 ? ' se abrió la dificultad Maestro en Ajustes.' : ''} La próxima vuelta trae más patrullas.</p>
        <div class="lbtns"><button class="gbtn" id="ego">Seguir ▶</button></div>
      </div></div>`);
    UI.$('#ego').addEventListener('click', () => endingDone());
  }
  function endingDone() {
    if (S.state !== 'ending' || S.endT < 1) return;
    S.loop++; saveRun();
    const go = () => openMap({ sel: 0, toast: 'LA SIGUIENTE VUELTA ES MÁS DIFÍCIL' });
    if (qualifies(S.score)) openInitials(S.score, go); else go();
  }
  function updateEnding(dt) {
    S.endT += dt;
    if ((S.fwT -= dt) <= 0) { S.fwT = rand(0.3, 0.8); firework(player.x + rand(-140, 140), player.y + rand(-90, 40)); }
    updateFx(dt);
    if (S.endT > 1 && (Input.pressed.a || Input.pressed.start || Input.pressed.b)) endingDone();
  }

  // ---------------- interfaz con la consola
  function start() {
    Snd.bank('rally');
    init();
    leaveTrackRun();
    loadRun();
    S.hi = Store.get('hi_rally', 0);
    S.coins = Store.get('rally_coins', 0);
    S.city = null; S.from = null; S.mode = 'tour';
    if (!Store.get('rally_intro', false)) openStory(); else openGarage('home');
  }
  function retry() {
    if (S.mode === 'duel') { startDuel(S.city); return; }
    if (S.city >= NC) { startCity(S.city); return; }
    resetRun(); startCity(S.city != null ? S.city : 0);
  }
  function action(act) {
    if (act === 'cont') { continueRun(); return; }
    if (act === 'map') {
      if (S.city >= NC) { openMap({ mode: 'esp' }); return; }
      resetRun(); openMap({ sel: S.city || 0, mode: 'tour' });
    }
  }
  function exit() { if (S.score > (S.hi || 0)) Store.set('hi_rally', S.score); document.body.classList.remove('inmenu'); Snd.loopsOff(); Snd.bank('arcade'); }
  const capturesStart = () => ['garage', 'map', 'travel', 'arrive', 'cityclear', 'duelend', 'loading', 'guide', 'story', 'achs', 'initials', 'records', 'ending', 'over'].includes(S.state);
  const pauseInfo = () => (!['play', 'intro', 'dying', 'clear'].includes(S.state) ? ''
    : `<div class="pinfo"><b>Misiones</b>${missionList().list.map((m) => `<span>${mText(m)}: ${Math.min(m.n, MISSIONS[m.id].n)} de ${MISSIONS[m.id].n}</span>`).join('')}</div>`);
  return {
    start, update, render, exit, retry, action, capturesStart, pauseInfo,
    peek: () => ({ S, player, enemies, cans, smokes, sel, CITIES, CARS, rival, civs, boxes, slicks, peds, bends, icp, owned, upg, paints,
      grid: () => grid, avLane: () => avLane, rockAt: () => rockAt, distC: () => distC, distV: () => distV, laneDir: () => laneDir, mapCanvas: () => mapTex && mapTex.src }),
    dbgCity: (ci, round = 0) => { init(); resetRun(); S.hi = Store.get('hi_rally', 0); startCity(ci, round); },
    dbgDuel: (ci) => { init(); resetRun(); startDuel(ci); },
    dbgItem: (k) => { S.item = k; S.rollT = 0; },
    dbgEnding: () => { S.city = NC - 1; openEnding(); },
    dbgOver: () => { S.lives = 1; crash(); },
    dbgCoins: (n) => { S.coins = n; Store.set('rally_coins', n); if (S.state === 'garage') refreshGarage(); },
    get art() { init(); return A; },
  };
})();

