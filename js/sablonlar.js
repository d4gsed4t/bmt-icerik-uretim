// Bütün şablonlar, aile aile. Her ailenin dosyası js/sablon/ altında.
// ciz(v, L, yuz): v form değerleri, L(kilit=88) logo yuvası (marka katmanından), yuz şablon yüzü.
import { ETKINLIK_SABLONLARI } from './sablon/etkinlik.js';
import { EKIP_SABLONLARI } from './sablon/ekip.js';
import { PLATFORM_SABLONLARI } from './sablon/platform.js';
import { TARIF_SABLONLARI } from './sablon/tarif.js';
import { SERBEST } from './sablon/serbest.js';
export { esc, zengin } from './sablon/ortak.js';

export const AILELER = [
  { id: 'Etkinlik', sablonlar: ETKINLIK_SABLONLARI },
  { id: 'Ekip', sablonlar: EKIP_SABLONLARI },
  { id: 'Platform', sablonlar: PLATFORM_SABLONLARI },
  { id: 'İçerik', sablonlar: TARIF_SABLONLARI },
  { id: 'Serbest', sablonlar: [SERBEST] },
];
export const SABLONLAR = AILELER.flatMap(a => a.sablonlar);

// Örnek içerik: fotoğraf ve logo alanları boş (yer tutucu), seçimler kendi varsayılanıyla.
// Seride bütün sayfaların alanları birlikte: quiz cevap sayfası soruyu soru sayfasının alanından okur.
export const ornekDegerler = s => Object.fromEntries(kardesler(s).flatMap(k => k.alanlar)
  .filter(a => a.tur !== 'foto' && a.tur !== 'logo').map(a => [a.ad, structuredClone(a.ornek ?? '')]));

// Bir seri ya da grubun bütün şablonları (seri: birlikte kaydedilir, grup: varyantlar)
export const kardesler = s => (s.seri || s.grup) ? SABLONLAR.filter(x => (x.seri ?? x.grup) === (s.seri ?? s.grup)) : [s];
// Değerlerin saklandığı anahtar: seri/grup içinde ortak
export const degerAnahtari = s => (s.seri ?? s.grup)?.id ?? s.id;
