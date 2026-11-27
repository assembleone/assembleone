/* FittersIQ Mobile - offline copy of the app.
   Keeps the app page, its scripts and its pinned libraries on the phone so Mobile opens with no
   signal. Rules that keep it safe:
   - Online, the newest file always wins (network first). The saved copy is only used when the
     network fails or is slow, so the phone can never get stuck on an old version.
   - Only the app's own files and pinned library versions are saved. Firebase data calls
     (Firestore, Auth, Storage), photos, maps and anything that is not a plain GET are never touched.
   - Job data is NOT stored here. It stays where it always was (the phone's own storage). */
const VERSION = 'fiq-mobile-offline-v2';
const PICS = 'fiq-mobile-pics-v1';
const NETWORK_WAIT_MS = 5000;

// Number reader files (about 11 MB). Saved once, in the background, so the number scanner works with no signal.
const OCR_FILES = ['eng.traineddata.gz', 'tesseract-core-lstm.wasm.js', 'tesseract-core-simd-lstm.wasm.js', 'tesseract.min.js', 'worker.min.js'];
const OCR_BASE = new URL('./assets/ocr/', self.location.href).href;
async function precacheOcr() {
  try {
    const cache = await caches.open(VERSION);
    for (const f of OCR_FILES) {
      try {
        const url = OCR_BASE + f;
        if (await cache.match(keyFor(url))) continue;
        const res = await fetch(url);
        await putIfGood(cache, url, res);
      } catch (e) {}
    }
  } catch (e) {}
}

// Drawings and photos kept in cloud storage: saved the first time they load so they show with no signal.
function isStoragePicture(href) {
  return /^https:\/\/(firebasestorage\.googleapis\.com|[^\/]*\.firebasestorage\.app|storage\.googleapis\.com)\//.test(href);
}
// True only when the page asking is the Mobile app (Studio shares this site and is left alone).
async function fromMobile(event) {
  try {
    if (!event.clientId) return false;
    const c = await self.clients.get(event.clientId);
    return !!c && /\/Mobile\.html(\?|#|$)/.test(c.url);
  } catch (e) { return false; }
}
async function storagePicture(event, request) {
  if (!(await fromMobile(event))) return fetch(request);
  const cache = await caches.open(PICS);
  const key = keyFor(request.url);
  const saved = await cache.match(key);
  const live = (async function () {
    let res;
    try { res = await fetch(request.url, { mode: 'cors', credentials: 'omit' }); }
    catch (e) { res = await fetch(request); }
    if (res && (res.ok || res.type === 'opaque')) { try { await cache.put(key, res.clone()); } catch (e) {} }
    return res;
  })();
  live.catch(function () {});
  if (!saved) return live;
  event.waitUntil(live.catch(function () {}));
  const slow = new Promise(function (resolve) { setTimeout(function () { resolve(saved); }, 4000); });
  const fresh = live.then(function (res) { return (res && (res.ok || res.type === 'opaque')) ? res : saved; }, function () { return saved; });
  return Promise.race([fresh, slow]);
}

// Libraries pinned to an exact version: safe to keep and serve straight from the phone.
const PINNED = [
  'https://www.gstatic.com/firebasejs/12.2.1/',
  'https://unpkg.com/jsqr@1.4.0/',
  'https://unpkg.com/leaflet@1.9.4/',
  'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/'
];
const PRECACHE_PINNED = [
  'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js',
  'https://www.gstatic.com/firebasejs/12.2.1/firebase-functions.js',
  'https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js',
  'https://unpkg.com/jsqr@1.4.0/dist/jsQR.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js'
];
// The app's own files (relative to this file, which lives in /beta/).
const PRECACHE_OWN = [
  './Mobile.html',
  './Mobile-Core.html',
  './mobile-build83-cleanup.js',
  './mobile-build86-scan-fix.js',
  './mobile-build88-jobs-cleanup.js',
  './i18n.js',
  './sync-protocol.js',
  './fittersiq-help.js',
  './academy-mobile.js',
  './assets/icon_32.png',
  './assets/icon_180.png',
  './assets/icon_192.png',
  './assets/fittersiq-header-logo.png'
];
// Only these exact files are ever answered by this worker. Studio and every other page on the site are left alone.
const OWN_PATHS = ['/Mobile.html', '/Mobile-Core.html', '/mobile-build83-cleanup.js', '/mobile-build86-scan-fix.js',
  '/mobile-build88-jobs-cleanup.js', '/i18n.js', '/sync-protocol.js', '/fittersiq-help.js', '/academy-mobile.js',
  '/assets/icon_32.png', '/assets/icon_180.png', '/assets/icon_192.png', '/assets/fittersiq-header-logo.png'];
// Big offline-reading files are saved the first time they are used, not up front.
const RUNTIME_OWN_PREFIXES = ['/assets/ocr/'];

function keyFor(u) {
  const url = new URL(typeof u === 'string' ? u : u.url, self.location.href);
  url.search = '';
  url.hash = '';
  return new Request(url.href);
}

function isPinned(href) {
  return PINNED.some(function (p) { return href.indexOf(p) === 0; });
}

async function putIfGood(cache, request, response) {
  try {
    if (response && (response.ok || response.type === 'opaque')) {
      await cache.put(keyFor(request.url || request), response.clone());
    }
  } catch (e) { /* storage full or similar: the app still works online */ }
}

async function precacheModule(cache, url, seen, depth) {
  if (seen.has(url) || depth > 5) return;
  seen.add(url);
  let res;
  try { res = await fetch(url); } catch (e) { return; }
  if (!res || !res.ok) return;
  await putIfGood(cache, url, res);
  if (!/\.m?js$/.test(url)) return;
  let text = '';
  try { text = await res.text(); } catch (e) { return; }
  const re = /(?:from|import)\s*\(?\s*["']([^"']+\.m?js)["']/g;
  let m;
  while ((m = re.exec(text))) {
    let next;
    try { next = new URL(m[1], url).href; } catch (e) { continue; }
    if (isPinned(next)) await precacheModule(cache, next, seen, depth + 1);
  }
}

self.addEventListener('install', function (event) {
  event.waitUntil((async function () {
    const cache = await caches.open(VERSION);
    // Best effort: one missing file must never stop the rest from being saved.
    await Promise.all(PRECACHE_OWN.map(async function (path) {
      try {
        const url = new URL(path, self.location.href).href;
        const res = await fetch(url, { cache: 'reload' });
        await putIfGood(cache, url, res);
      } catch (e) {}
    }));
    const seen = new Set();
    await Promise.all(PRECACHE_PINNED.map(async function (url) {
      try {
        await precacheModule(cache, url, seen, 0);
        if (!(await cache.match(keyFor(url)))) {
          const res = await fetch(url, { mode: 'no-cors' });
          await putIfGood(cache, url, res);
        }
      } catch (e) {}
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', function (event) {
  event.waitUntil((async function () {
    const names = await caches.keys();
    await Promise.all(names.filter(function (n) { return n.indexOf('fiq-mobile-offline-') === 0 && n !== VERSION; })
      .map(function (n) { return caches.delete(n); }));
    await self.clients.claim();
  })());
});

async function networkFirst(event, request, fallbackKey) {
  const cache = await caches.open(VERSION);
  const key = fallbackKey || keyFor(request.url);
  let settled = false;
  const network = fetch(request).then(function (res) {
    settled = true;
    event.waitUntil(putIfGood(cache, request, res));
    return res;
  });
  network.catch(function () {}); // the race below reports a failure; this only silences a late one
  const timer = new Promise(function (resolve) {
    setTimeout(async function () {
      if (settled) return resolve(null);
      resolve(await cache.match(key));
    }, NETWORK_WAIT_MS);
  });
  try {
    const first = await Promise.race([network, timer]);
    if (first) return first;
    // Timer fired with nothing saved: keep waiting for the network.
    return await network;
  } catch (e) {
    const saved = await cache.match(key);
    if (saved) return saved;
    throw e;
  }
}

async function cacheFirst(event, request) {
  const cache = await caches.open(VERSION);
  const saved = await cache.match(keyFor(request.url));
  if (saved) return saved;
  const res = await fetch(request);
  event.waitUntil(putIfGood(cache, request, res));
  return res;
}

self.addEventListener('fetch', function (event) {
  const request = event.request;
  if (request.method === 'HEAD') {
    // The number reader checks its own files with a HEAD request before it starts.
    let hu; try { hu = new URL(request.url); } catch (e) { return; }
    if (hu.origin === self.location.origin && hu.pathname.indexOf('/assets/ocr/') !== -1) {
      event.respondWith((async function () {
        const cache = await caches.open(VERSION);
        const saved = await cache.match(keyFor(request.url));
        if (saved) return new Response(null, { status: 200, headers: { 'Content-Type': saved.headers.get('Content-Type') || 'application/octet-stream' } });
        return fetch(request);
      })());
    }
    return;
  }
  if (request.method !== 'GET') return;
  let url;
  try { url = new URL(request.url); } catch (e) { return; }

  if (url.origin !== self.location.origin) {
    if (isPinned(url.href)) { event.respondWith(cacheFirst(event, request)); return; }
    if (isStoragePicture(url.href) && (request.destination === 'image' || request.destination === '')) { event.respondWith(storagePicture(event, request)); return; }
    return; // Firebase data calls, maps, geocoding etc. go straight to the network.
  }

  const dir = new URL('./', self.location.href).pathname;       // folder this file lives in
  const rel = url.pathname.indexOf(dir) === 0 ? '/' + url.pathname.slice(dir.length) : null;
  if (rel === null) return;
  if (request.mode === 'navigate') {
    if (rel === '/Mobile.html') event.respondWith(networkFirst(event, request));
    return;
  }
  if (rel.indexOf('/assets/ocr/') === 0) { event.respondWith(cacheFirst(event, request)); return; }
  if (OWN_PATHS.indexOf(rel) !== -1) event.respondWith(networkFirst(event, request));
});

self.addEventListener('activate', function (event) { event.waitUntil(precacheOcr()); });
