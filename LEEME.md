# Pixel Arcade para Android — APK compilado en la nube

No necesitas Android Studio ni instalar nada en tu VPS: GitHub compila el APK gratis en sus
servidores cada vez que subes cambios, y te lo deja listo para descargar desde el teléfono.
El juego va completo dentro del APK: funciona sin internet y no pide ningún permiso.

## 1. Crear el repositorio
En github.com → **New repository** → nombre `pixel-arcade` → **Private** → Create
(vacío: sin README ni .gitignore).

## 2. Subir este proyecto
Desde esta carpeta:

```bash
git init -b main
git add .
git commit -m "Pixel Arcade"
git remote add origin https://github.com/TU_USUARIO/pixel-arcade.git
git push -u origin main
```

Si lo subes arrastrando archivos en la web de GitHub, revisa que vaya la carpeta oculta
`.github` (ahí está la receta de compilación).

## 3. Esperar la compilación
Pestaña **Actions** del repositorio → "Compilar APK". Tarda unos 5 minutos y queda en verde.

## 4. Instalar en el teléfono
1. Desde el teléfono abre el repositorio → **Releases** → descarga `PixelArcade-1.apk` y ábrelo.
2. Android te pedirá permitir instalar apps desde el navegador.
3. Play Protect puede avisar que es de un desarrollador desconocido → **Instalar de todas formas**.

La app abre a pantalla completa y gira sola entre vertical y horizontal.
Botón atrás: pausa o vuelve al juego; en el menú principal cierra la app.

## 5. Actualizar
Cada `git push` a `main` genera un APK nuevo (build 2, 3…) en Releases, que se instala encima
del anterior y conserva los récords. Para compilar de nuevo sin cambios:
Actions → Compilar APK → **Run workflow**.

## Firma del APK
`app/arcade.keystore` es la llave con que se firman todas las versiones (contraseña `pixelarcade`).
Sirve para instalar directo en tus teléfonos; mantén el repositorio privado.
Si después quieres publicarlo en Google Play, hay que cambiarla por una llave propia guardada en
los secretos del repositorio (`KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`) y generar un AAB.

## Qué hay aquí
```
app/src/main/assets/                 el juego (misma versión que la web)
app/src/main/java/.../MainActivity   WebView a pantalla completa que carga el juego local
app/src/main/res/                    ícono y tema
.github/workflows/build-apk.yml      compilación en la nube
```
