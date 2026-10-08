// Serbest post: şablonda olmayan bir içerik için kitin parçalarını dizerek kurulan görsel.
// Tasarımcı yalnız hangi parçanın hangi sırayla geleceğini seçer; yerleşim kitin kuralı:
// logo üstte, ortalı dikey ritim, ana içerik ortada toplanır, sondaki bilgi satırı ve düğme alta oturur.
// Aralıklar kitteki şablonlardan (ör. etiket → dev başlık 44 px, dev başlık → açıklama 34 px).
import { esc, zengin, baslik, satir, bosluk, tuval, fotoYuva, qr, EM_DUZ, IPUCU_KALIN } from './ortak.js';
import { renklendir } from './tarif.js';

export const BICIMLER = {
  'Post (1080 × 1440)': { w: 1080, h: 1440 },
  'Story (1080 × 1920)': { w: 1080, h: 1920, cls: 'story' },
  'Kare (1080 × 1080)': { w: 1080, h: 1080 },
  'Yatay (1920 × 1080)': { w: 1920, h: 1080, pad: '80px 120px', kilit: 96 },
};

// Parça türleri: formdaki adı, alanları ve çizimi. Bir post en fazla 8 parça.
export const PARCALAR = {
  hap: { ad: 'Etiket', alanlar: [{ ad: 'metin', tur: 'kisa', max: 30 }], ciz: p => `<span class="hap">${esc(p.metin)}</span>` },
  genis: { ad: 'Küçük başlık', alanlar: [{ ad: 'metin', tur: 'kisa', max: 30 }], ciz: p => `<span class="genis">${esc(p.metin)}</span>` },
  dev: {
    ad: 'Dev başlık', alanlar: [{ ad: 'metin', tur: 'uzun', max: 40, ipucu: 'Her satır ayrı satıra. *kelime* yazarsan turkuaz olur.' }, { ad: 'vurgu', tur: 'secim', etiket: 'Son kelime turkuaz' }],
    ciz: p => `<h2 class="dev-y" data-sigdir="0.45">${baslik(p.metin, p.vurgu)}</h2>`,
  },
  baslik: { ad: 'Başlık', alanlar: [{ ad: 'metin', tur: 'uzun', max: 50, ipucu: '*kelime* yazarsan turkuaz olur.' }], ciz: p => `<h2 class="bas-o" data-sigdir="0.55">${baslik(p.metin, false, false, EM_DUZ)}</h2>` },
  metin: { ad: 'Açıklama', alanlar: [{ ad: 'metin', tur: 'uzun', max: 120, ipucu: IPUCU_KALIN }], ciz: p => `<p class="ince">${zengin(p.metin)}</p>` },
  liste: {
    ad: 'Liste', alanlar: [{ ad: 'metin', tur: 'uzun', max: 200, ipucu: 'Her satır bir madde. En fazla 5–6 madde.' }],
    ciz: p => `<div class="liste-y cam" style="padding:40px 50px;width:100%;box-sizing:border-box">${String(p.metin ?? '').split('\n').map(x => x.trim()).filter(Boolean).map(x => `<div>${esc(x)}</div>`).join('')}</div>`,
  },
  foto: {
    ad: 'Fotoğraf', alanlar: [{ ad: 'oran', tur: 'liste', etiket: 'Oran', secenekler: ['Yatay', 'Kare', 'Dikey'] }],
    ciz: (p, f, b) => {
      const g = Math.min(680, Math.round(b.w * 0.62)), h = { Yatay: Math.round(g * 0.7), Kare: g, Dikey: Math.round(g * 1.2) }[p.oran ?? 'Yatay'];
      return fotoYuva(f, `blok-${p.id}`, `width:${g}px;height:${h}px`);
    },
  },
  kod: { ad: 'Kod kartı', alanlar: [{ ad: 'metin', tur: 'kod', max: 300 }], ciz: p => `<div class="kod2"><div class="bar"><i></i><i></i><i></i></div><pre>${renklendir(p.metin)}</pre></div>` },
  qr: {
    ad: 'QR', alanlar: [{ ad: 'baglanti', tur: 'kisa', max: 200, etiket: 'Bağlantı' }, { ad: 'metin', tur: 'kisa', max: 40, etiket: 'Yanındaki yazı' }],
    ciz: p => `<div style="display:flex;gap:44px;align-items:center;text-align:left">${qr(p.baglanti)}${p.metin?.trim() ? `<div style="font:600 42px/1.2 Lexend">${esc(p.metin)}</div>` : ''}</div>`,
  },
  bilgi: { ad: 'Bilgi satırı', alanlar: [{ ad: 'metin', tur: 'kisa', max: 60, ipucu: 'Parçaları · ile ayır: 14 Ekim · 15.30 · Amfi 2' }], ciz: p => satir(String(p.metin ?? '').split(/\s*·\s*/)) },
  buton: { ad: 'Düğme', alanlar: [{ ad: 'metin', tur: 'kisa', max: 20 }], ciz: p => `<span class="buton">${esc(p.metin)}</span>` },
};
export const EN_FAZLA_PARCA = 8;

// İki parça arasındaki boşluk (kitteki şablonlardan)
function aralik(a, b) {
  if (a === 'hap') return b === 'dev' ? 44 : 36;
  if (a === 'genis') return 20;
  if (a === 'dev') return b === 'metin' ? 34 : 40;
  if (a === 'baslik') return b === 'metin' ? 20 : 36;
  if (a === 'bilgi' || b === 'buton') return 40;
  return 36;
}
const dizi = (parcalar, f, b) => parcalar.map((p, i) => (i ? bosluk(aralik(parcalar[i - 1].tur, p.tur)) : '') + PARCALAR[p.tur].ciz(p, f[`blok-${p.id}`], b)).join('');

export const SERBEST = {
  id: 'serbest', ad: 'Serbest post', aile: 'Serbest', w: 1080, h: 1440, yuzler: ['a', 'b', 'alarm'],
  ne: 'Şablonlarda olmayan bir içerik için: kitin parçalarını sırayla ekle; yerleşim, aralıklar ve sığdırma kitin kuralıyla. '
    + 'Sondaki bilgi satırı ve düğme alta oturur. Sık tekrar eden bir içerikse kalıcı şablon olarak eklenmeli.',
  alanlar: [
    { ad: 'bicim', etiket: 'Biçim', tur: 'liste', secenekler: Object.keys(BICIMLER), ornek: 'Post (1080 × 1440)' },
    { ad: 'parcalar', etiket: 'Parçalar', tur: 'parcalar', ornek: [
      { id: 'o1', tur: 'hap', metin: 'Duyuru' },
      { id: 'o2', tur: 'dev', metin: 'Kulüp odası\ntaşındı.', vurgu: true },
      { id: 'o3', tur: 'metin', metin: 'Yeni yerimiz: Mühendislik Fakültesi,\nB blok, 214 numaralı oda.' },
      { id: 'o4', tur: 'bilgi', metin: 'Hafta içi · 12.00–17.00' },
      { id: 'o5', tur: 'buton', metin: 'Yol tarifi →' },
    ] },
  ],
  // parça fotoğrafları "blok-<id>" adıyla gelir (her parçanın kendi fotoğrafı)
  ciz: (v, L, y) => {
    const b = BICIMLER[v.bicim] ?? BICIMLER['Post (1080 × 1440)'];
    const parcalar = (Array.isArray(v.parcalar) ? v.parcalar : []).filter(p => PARCALAR[p.tur]).slice(0, EN_FAZLA_PARCA);
    let k = parcalar.length;                     // sondaki bilgi satırı ve düğme alt çapa olur
    while (k > 0 && ['bilgi', 'buton'].includes(parcalar[k - 1].tur)) k--;
    if (k === 0) k = parcalar.length;            // hepsi alt çapaysa ortada kalsın
    const ana = parcalar.slice(0, k), alt = parcalar.slice(k);
    return tuval(b.w, b.h, `${L(b.kilit ?? 88)}<div class="esn"></div>${dizi(ana, v, b)}<div class="esn"></div>${dizi(alt, v, b)}`,
      y, { cls: b.cls ?? '', pad: b.pad ?? '' });
  },
};
