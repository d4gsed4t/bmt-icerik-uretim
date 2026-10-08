// Çevrimdışı açılış: uygulama kabuğu önbellekte. Her istek önce ağdan denenir,
// böylece yeni logo sürümü ve şablon güncellemesi herkese kendiliğinden ulaşır; ağ yoksa son bilinen hâl kullanılır.
const SURUM = 'bmt-post-14';
const KABUK = ['./', 'index.html', 'manifest.webmanifest', 'css/sablon.css', 'css/uygulama.css',
  'js/uygulama.js', 'js/marka.js', 'js/sablonlar.js', 'js/zemin.js', 'js/olcum.js', 'js/yakala.js',
  'js/paket.js', 'js/cizim.js', 'js/kit.js', 'js/sablon/ortak.js', 'js/sablon/etkinlik.js', 'js/sablon/ekip.js', 'js/sablon/platform.js', 'js/sablon/tarif.js', 'js/sablon/serbest.js', 'js/sablon/ikonlar.js', 'vendor/snapdom.mjs', 'vendor/qrcode.mjs',
  ...[300, 400, 500, 600, 700, 800].map(w => `fonts/Lexend-${w}.ttf`), 'fonts/DejaVuSansMono-alt.ttf', 'ikon/ikon-192.png'];

self.addEventListener('install', e => e.waitUntil(caches.open(SURUM).then(c => c.addAll(KABUK)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(k => Promise.all(k.filter(x => x !== SURUM).map(x => caches.delete(x)))).then(() => self.clients.claim())));

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // önce ağ: güncelleme (yeni şablon, yeni logo) herkese hemen ulaşsın; ağ yoksa önbellekteki son hâl
  // no-cache: tarayıcının HTTP önbelleği de sunucuya sorsun (dosya değişmediyse 304, hızlı)
  // (sayfa gezinme isteği seçenekle kopyalanamaz: onda URL kullanılır)
  e.respondWith(fetch(e.request.mode === 'navigate' ? e.request.url : e.request, { cache: 'no-cache' })
    .then(r => { if (r.ok) { const k = r.clone(); caches.open(SURUM).then(c => c.put(e.request, k)); } return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true })));
});
