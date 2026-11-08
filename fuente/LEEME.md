# Código fuente del Pixel Arcade

El juego se escribe en `src/` y se arma con un solo comando:

```bash
python3 tools/build.py --version v14
```

Eso deja en `dist/`:

- `android/index.html`: va a `app/src/main/assets/index.html` (junto con `assets/fonts/`).
- `pixel-arcade.html`: la versión web de un solo archivo (three.js y fuentes desde internet).
- `pwa/`: la versión instalable para el VPS. Cambia `--version` en cada publicación para que los
  teléfonos se actualicen.
- `test.html`: igual a la de Android, con `window.__dbg` para pruebas automáticas.

Orden de los archivos (se concatenan en un solo módulo): core, sfx, music, art, worldmap,
rallymaps, rallytracks, rally, contrafx, contra, main. `body.html` tiene el CSS y el marcado.
