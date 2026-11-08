#!/usr/bin/env python3
"""Construye las cuatro salidas del Pixel Arcade a partir de src/.

  dist/pixel-arcade.html   artefacto (three.js desde jsDelivr, fuentes de Google)
  dist/android/index.html  app Android (fuentes y three.js locales, __NATIVE_APP)
  dist/pwa/                PWA instalable (todo local + service worker)
  dist/test.html           igual que android pero con window.__dbg para las pruebas

Uso: python3 tools/build.py [--version v12]
"""
import json, os, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')
DIST = os.path.join(ROOT, 'dist')
ASSETS = os.path.join(ROOT, 'assets')          # fonts/ y vendor/three.min.js
ORDER = ['core.js', 'sfx.js', 'music.js', 'art.js', 'worldmap.js', 'rallymaps.js',
         'rallytracks.js', 'rally.js', 'contra.js', 'main.js']
VERSION = sys.argv[sys.argv.index('--version') + 1] if '--version' in sys.argv else 'v12'

def rd(p):
    with open(p, encoding='utf8') as f: return f.read()
def wr(p, s):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf8') as f: f.write(s)

JS = ''.join(rd(os.path.join(SRC, n)) for n in ORDER)
BODY = rd(os.path.join(SRC, 'body.html'))
TAIL = rd(os.path.join(SRC, 'tail.html'))
TITLE = '<title>Pixel Arcade 3 en 1</title>'
FONTS_LOCAL = """<style>
@font-face{font-family:'Pixelify Sans';font-style:normal;font-weight:500;font-display:swap;src:url(fonts/pixelify-sans-latin-500-normal.woff2) format('woff2')}
@font-face{font-family:'Pixelify Sans';font-style:normal;font-weight:700;font-display:swap;src:url(fonts/pixelify-sans-latin-700-normal.woff2) format('woff2')}
@font-face{font-family:'Silkscreen';font-style:normal;font-weight:400;font-display:swap;src:url(fonts/silkscreen-latin-400-normal.woff2) format('woff2')}
@font-face{font-family:'Silkscreen';font-style:normal;font-weight:700;font-display:swap;src:url(fonts/silkscreen-latin-700-normal.woff2) format('woff2')}
@font-face{font-family:'Jersey 10';font-style:normal;font-weight:400;font-display:swap;src:url(fonts/jersey-10-latin-400-normal.woff2) format('woff2')}
@font-face{font-family:'Jersey 15';font-style:normal;font-weight:400;font-display:swap;src:url(fonts/jersey-15-latin-400-normal.woff2) format('woff2')}
</style>
"""
HEAD_LOCAL = ('<!doctype html>\n<html lang="es">\n<meta charset="utf-8">\n'
              '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">\n'
              '<meta name="theme-color" content="#15112a">\n')

def page(head, three, js_extra=''):
    return head + BODY + three + '\n<script type="module">\n' + JS + js_extra + TAIL

# ---------- Android
android = page(HEAD_LOCAL + '<script>window.__NATIVE_APP = true;</script>\n<style>body{margin:0}</style>\n' + TITLE + '\n' + FONTS_LOCAL,
               '<script src="vendor/three.min.js"></script>')
wr(os.path.join(DIST, 'android', 'index.html'), android)

# ---------- Pruebas locales (sirve dist/ con fonts/ y vendor/ al lado)
DBG = ('window.__dbg = { Rally, Contra, Engine, Input, Snd, SONGS, launch, toMenu, step, draw, '
       'get mode() { return mode; }, get game() { return game; } };\n')
test = page(HEAD_LOCAL + '<style>body{margin:0}</style>\n' + TITLE + '\n' + FONTS_LOCAL,
            '<script src="vendor/three.min.js"></script>', DBG)
wr(os.path.join(DIST, 'test.html'), test)

# ---------- Artefacto
art_head = ('<meta charset="utf-8">\n\n' + TITLE + '\n'
            '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
            '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
            '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jersey+10&family=Jersey+15&family=Pixelify+Sans:wght@500;700&family=Silkscreen:wght@400;700&display=swap">\n')
wr(os.path.join(DIST, 'pixel-arcade.html'),
   page(art_head, '<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>'))

# ---------- PWA
P = os.path.join(DIST, 'pwa')
pwa_head = (HEAD_LOCAL + '<link rel="manifest" href="manifest.webmanifest">\n'
            '<link rel="icon" href="icons/icon-192.png">\n<link rel="apple-touch-icon" href="icons/icon-192.png">\n'
            '<meta name="apple-mobile-web-app-capable" content="yes">\n'
            '<style>body{margin:0}</style>\n' + TITLE + '\n' + FONTS_LOCAL)
SWREG = ("if ('serviceWorker' in navigator && location.protocol !== 'file:') "
         "navigator.serviceWorker.register('sw.js').catch(() => {});\n")
wr(os.path.join(P, 'index.html'), page(pwa_head, '<script src="vendor/three.min.js"></script>', SWREG))
for d in ('fonts', 'vendor'):
    for dst in (os.path.join(P, d), os.path.join(DIST, d)):
        shutil.rmtree(dst, ignore_errors=True)
        shutil.copytree(os.path.join(ASSETS, d), dst)
icons = sorted(os.listdir(os.path.join(ASSETS, 'icons')))
shutil.rmtree(os.path.join(P, 'icons'), ignore_errors=True)
shutil.copytree(os.path.join(ASSETS, 'icons'), os.path.join(P, 'icons'))
wr(os.path.join(P, 'manifest.webmanifest'), json.dumps({
    'name': 'Pixel Arcade 3 en 1', 'short_name': 'Pixel Arcade', 'lang': 'es',
    'start_url': './', 'scope': './', 'display': 'fullscreen', 'orientation': 'any',
    'background_color': '#15112a', 'theme_color': '#15112a',
    'icons': [{'src': 'icons/icon-192.png', 'sizes': '192x192', 'type': 'image/png'},
              {'src': 'icons/icon-512.png', 'sizes': '512x512', 'type': 'image/png'},
              {'src': 'icons/icon-maskable-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'}],
}, ensure_ascii=False, indent=2))
files = ['./', 'index.html', 'manifest.webmanifest', 'vendor/three.min.js'] + \
        ['fonts/' + f for f in sorted(os.listdir(os.path.join(ASSETS, 'fonts')))] + ['icons/' + f for f in icons]
wr(os.path.join(P, 'sw.js'), f"""// Service worker: guarda todo para jugar sin conexión. Cambiar VERSION al publicar.
const VERSION = '{VERSION}';
const FILES = {json.dumps(files)};
self.addEventListener('install', (e) => {{ e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); }});
self.addEventListener('activate', (e) => {{ e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())); }});
self.addEventListener('fetch', (e) => {{
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, {{ ignoreSearch: true }}).then((r) => r || fetch(e.request)));
}});
""")
print('ok', VERSION, len(android), 'bytes android')
