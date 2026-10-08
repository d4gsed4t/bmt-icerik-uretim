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
export const degerAnahtari = s => s.anahtar ?? (s.seri ?? s.grup)?.id ?? s.id;   // serbest postun sayfaları: ortak anahtar

// İsteğe bağlı alan: boşaltıldığında şablonda boş bir yazı kutusu kalmıyorsa (şablon o öğeyi hiç çizmiyorsa) gizlenebilir.
// Elle işaretlemek yerine şablonun kendisinden çıkarılır: örnek içerikle ve alan boşken çizilen HTML'deki boş yazı kutuları sayılır.
const BOS_KUTU = /<(h2|p|span|small|b|em|time|div)(\s[^>]*)?>\s*(<i[^>]*><\/i>\s*)*<\/\1>/g;   // yalnız süs (<i>) taşıyan kutu da boş sayılır
const bosSay = html => (html.match(BOS_KUTU) ?? []).length;
const istegeOnbellek = new Map();
export function istegeBagliAlanlar(s) {
  if (istegeOnbellek.has(s.id)) return istegeOnbellek.get(s.id);
  const L = () => '<i data-logo></i>', y = s.yuzler[0], v = ornekDegerler(s);
  const taban = bosSay(s.ciz(v, L, y));
  const sonuc = new Set(s.alanlar.filter(a => (a.tur === 'kisa' || a.tur === 'uzun') && String(v[a.ad] ?? '').trim())
    .filter(a => bosSay(s.ciz({ ...v, [a.ad]: "" }, L, y)) <= taban).map(a => a.ad));
  istegeOnbellek.set(s.id, sonuc);
  return sonuc;
}
