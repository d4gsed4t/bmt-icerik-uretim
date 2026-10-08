// Çizim: şablonu gerçek ölçüsünde, görünmeyen bir kapta kurar; sığdırır ve ölçer.
// Arayüz, denetim ve "Kiti indir" hepsi bunu kullanır.
import { logoHTML } from './marka.js';
import { sigdir, denetle } from './olcum.js';

export const bekle = ms => new Promise(r => setTimeout(r, ms));
export const fontlar = Promise.all([
  ...[300, 400, 500, 600, 700, 800].map(w => document.fonts.load(`${w} 40px Lexend`)),
  document.fonts.load("400 40px 'BMT Kod'"),
]).catch(() => {});

// Görselin yüklenmesini bekle. img.decode() ekran dışındaki görselde hiç sonuçlanmayabiliyor (Chrome, 2026-10-07):
// yükleme olayına bak ve en fazla 3 sn bekle, sınırsız bekleme yok.
export function gorselHazir(i) {
  if (i.complete && i.naturalWidth) return Promise.resolve();
  return Promise.race([new Promise(r => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); }), bekle(3000)]);
}

// Tuvali gerçek ölçüsünde çizer; ölçüm ve PNG hep bu ölçeksiz kopyadan yapılır.
export async function cizimYap(s, degerler, yuz, surum, kap) {
  kap.innerHTML = s.ciz(degerler, (kilit = 88, profil = false) => logoHTML(surum, yuz, kilit, '', profil), yuz);
  const yy = kap.firstElementChild;
  await fontlar;
  await Promise.all([...yy.querySelectorAll('img')].map(gorselHazir));
  const sigmayan = sigdir(yy);
  return { yy, sigmayan, sorunlar: denetle(yy) };
}

// Ölçeksiz tuvalin kopyasını verilen kutuya sığdırıp gösterir; ölçeği döndürür.
export function kucukGoster(yy, kap, genislik, yukseklikSiniri = Infinity) {
  const w = yy.offsetWidth, h = yy.offsetHeight, s = Math.min(genislik / w, yukseklikSiniri / h);
  const kopya = yy.cloneNode(true);
  kopya.style.transform = `scale(${s})`;
  kap.style.width = `${w * s}px`; kap.style.height = `${h * s}px`;
  kap.replaceChildren(kopya);
  return s;
}

// Yazısız zemin (kit/08, Canva'da alt katman): ETU-BMT-Kimlik/uretim/canva_yerli.py'nin yöntemi.
// Metin taşıyan "yaprak" öğeler (satır içi, aynı boydaki sarmalayıcılardan yukarı çıkılarak) saydam yapılır;
// hap, düğme, kutu, sayfa noktası gibi kabuklar ve logo kalır. Gradyanla boyanmış yazı önce düz renge çevrilir.
export function yazisizYap(yy) {
  yy.classList.add('yazisiz');
  const boy = e => getComputedStyle(e).fontSize;
  const yaprak = e => { while (e && e !== yy && getComputedStyle(e).display === 'inline' && e.parentElement && boy(e) === boy(e.parentElement)) e = e.parentElement; return e; };
  const bloklar = new Set(), w = document.createTreeWalker(yy, NodeFilter.SHOW_TEXT);
  let n; while ((n = w.nextNode())) {
    if (!n.textContent.trim()) continue;
    const el = yaprak(n.parentElement);
    if (el.closest('.logo-yuva, .konsept')) continue;   // konsept yer tutucusunun yazısı kılavuz olarak kalır
    bloklar.add(el);
  }
  const gizle = e => { e.style.setProperty('color', 'transparent', 'important'); e.style.setProperty('-webkit-text-fill-color', 'transparent', 'important'); };
  for (const el of bloklar) { gizle(el); el.querySelectorAll('*').forEach(gizle); }
}
