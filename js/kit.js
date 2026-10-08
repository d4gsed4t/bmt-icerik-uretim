// "Kiti indir": kitin logoya bağlı klasörlerini seçilen marka sürümüyle uygulamanın kendisinden üretir.
// Böylece logo değişince Python üreticiyi çalıştırmak gerekmez; kit ve uygulama aynı koddan çıkar.
//   01-logo/                 sürümün logo dosyaları, rozetli hâli (PNG), profil fotoğrafı (1080)
//   08-sablon-zeminleri/     her şablonun yazısız hâli, 2× PNG (Canva'da alt katman)
//   09-sablon-ornekleri/     her şablonun örnek içerikli hâli, 1× JPG (neye benzeyeceği)
// Logodan bağımsız klasörler (02-renk … 07-yazi-tipi, kılavuz) değişmez; mevcut kitte kalır.
import { AILELER, ornekDegerler } from './sablonlar.js';
import { cizimYap, yazisizYap, gorselHazir } from './cizim.js';
import { logoHTML, dosyaYolu } from './marka.js';
import { pngYap } from './yakala.js';
import { zipYap, jpegYap } from './paket.js';
import { snapdom } from '../vendor/snapdom.mjs';

const KLASOR = { Etkinlik: '1-etkinlik', Ekip: '2-ekip', Platform: '3-platform', 'İçerik': '4-icerik-tarifleri' };

export async function kitUret(marka, surum, ilerle = () => {}) {
  const dosyalar = [], kap = Object.assign(document.createElement('div'), { className: 'cizim' });
  document.body.appendChild(kap);
  try {
    const toplam = AILELER.filter(a => KLASOR[a.id]).reduce((t, a) => t + a.sablonlar.length, 0);
    let sayi = 0;
    for (const aile of AILELER.filter(a => KLASOR[a.id])) for (const [i, s] of aile.sablonlar.entries()) {   // serbest post kitte yok
      ilerle(`${++sayi} / ${toplam} · ${s.ad}`);
      const ad = `${String(i + 1).padStart(2, '0')}-${s.id}`, yuz = s.yuzler[0], klasor = KLASOR[aile.id];
      // örnek (yazılı)
      let { yy } = await cizimYap(s, ornekDegerler(s), yuz, surum, kap);
      dosyalar.push({ ad: `09-sablon-ornekleri/${klasor}/${ad}.jpg`, veri: (await jpegYap(await pngYap(yy), 0.88)).jpeg });
      // zemin (yazısız, 2×)
      ({ yy } = await cizimYap(s, ornekDegerler(s), yuz, surum, kap));
      yazisizYap(yy);
      dosyalar.push({ ad: `08-sablon-zeminleri/${klasor}/${ad}.png`, veri: await pngYap(yy, 2) });
    }

    // 01-logo: sürümün kaynak dosyaları + rozetli hâli + profil
    ilerle('Logo dosyaları');
    const kaynaklar = new Set([...Object.values(surum.yuzler), ...Object.values(surum.profil?.yuzler ?? {})].map(y => y.dosya));
    for (const [i, d] of [...kaynaklar].entries()) {
      const blob = await (await fetch(dosyaYolu(d))).blob();
      const ad = d.startsWith('data:') ? `logo-${i + 1}.${blob.type.includes('svg') ? 'svg' : 'png'}` : d.split('/').pop();
      dosyalar.push({ ad: `01-logo/${ad}`, veri: blob });
    }
    for (const [yuz, adi] of [['a', 'logo-koyu-zemin'], ['b', 'logo-acik-zemin']]) {
      kap.innerHTML = `<div style="display:inline-block;padding:0">${logoHTML(surum, yuz, 176)}</div>`;
      await Promise.all([...kap.querySelectorAll('img')].map(gorselHazir));
      dosyalar.push({ ad: `01-logo/${adi}.png`, veri: await snapdom.toBlob(kap.firstElementChild, { type: 'png', scale: 2, dpr: 1, embedFonts: false }) });
    }
    const profil = AILELER.flatMap(a => a.sablonlar).find(s => s.id === 'profil');
    if (profil) {
      const { yy } = await cizimYap(profil, ornekDegerler(profil), 'a', surum, kap);
      dosyalar.push({ ad: '01-logo/profil-1080.png', veri: await pngYap(yy) });
    }

    const tarih = new Date().toISOString().slice(0, 10);
    dosyalar.push({ ad: 'BENIOKU.txt', veri: `ETÜ BMT Kit · logoya bağlı klasörler
Marka sürümü: ${surum.ad} (${surum.id}) · üretim: ${tarih} · BMT Post Üretici

Bu paket kitin logoya bağlı klasörlerinin güncel hâlidir. Mevcut kitte aynı adlı klasörleri bunlarla değiştir:
  01-logo/               logo dosyaları; logo-acik-zemin.png açık ve alarm zemininde kullanılır
  08-sablon-zeminleri/   şablonların yazısız hâli (2×): Canva'da tasarımın ilk katmanı
  09-sablon-ornekleri/   şablonların örnek içerikli hâli: neye benzemesi gerektiği
Diğer klasörler (02-renk, 03-ikon, 04-zemin, 05-grafik, 06-bilesen, 07-yazi-tipi) ve kullanım kılavuzu
logodan bağımsızdır, değişmez.

En kolayı: paylaşımları doğrudan BMT Post Üretici'den yap; kit, şablonda olmayan bir şey kurarken lazım.
` });
    ilerle('ZIP hazırlanıyor');
    return { zip: await zipYap(dosyalar), adet: dosyalar.length, ad: `ETU-BMT-Kit-${surum.id}-${tarih}.zip` };
  } finally { kap.remove(); }
}
