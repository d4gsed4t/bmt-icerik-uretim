// Platform ailesi: ETU-BMT-Kimlik/uretim/aile_g.py'nin birebir karşılığı (15 şablon).
// Profil, öne çıkanlar, LinkedIn/X/YouTube/Discord kapakları. Kitteki kesik çizgili kılavuzlar (platformun
// üstüne bindiği yerler) çıktıda yok; nerede olduklarını "ne" açıklaması söyler.
import { esc, zengin, baslik, bosluk, tuval, fotoYuva } from './ortak.js';

const SLOGAN = 'Kodla öğren, birlikte üret.';   // örnek slogan (henüz onaylanmadı)

// Öne çıkan ikonları: logonun çizgi dili (kalın, sivri köşe, uçlar düz), 100×100 kutuda
const IKON = {
  Etkinlikler: '<rect x="14" y="22" width="72" height="64"/><path d="M14 42 H86 M34 12 V30 M66 12 V30"/><polyline points="38,62 48,72 66,52"/>',
  Ekip: '<circle cx="36" cy="36" r="13"/><circle cx="68" cy="40" r="10"/><path d="M12 84 V76 A20 20 0 0 1 60 76 V84 M64 62 A18 18 0 0 1 90 76 V84"/>',
  'Eğitim': '<polyline points="34,30 14,50 34,70"/><polyline points="66,30 86,50 66,70"/><path d="M56 22 L44 78"/>',
  Duyurular: '<polygon points="16,40 46,40 76,20 76,80 46,60 16,60"/><path d="M30 60 L36 84 M88 42 V58"/>',
  Sponsorlar: '<polygon points="50,12 86,34 86,66 50,88 14,66 14,34"/><polyline points="34,50 46,62 68,38"/>',
  SSS: '<path d="M34 36 A16 16 0 1 1 56 51 Q50 54 50 62 V66"/><path d="M50 78 V86"/>',
};
const ikon = (ad, px, sw = 8) => `<svg width="${px}" height="${px}" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="${sw}" `
  + `stroke-linejoin="miter" stroke-linecap="square" aria-hidden="true">${IKON[ad]}</svg>`;

const ONE_CIKAN = { id: 'one-cikan', ad: 'Öne çıkan kapağı', secenek: 'Konu' };
const oneCikan = (no, ad) => ({
  id: `one-cikan-${no}`, ad: `Öne çıkan · ${ad}`, aile: 'Platform', w: 1080, h: 1920, yuzler: ['a', 'b'], grup: ONE_CIKAN, varyant: ad,
  ne: 'Instagram öne çıkanlar kapağı: 1080 × 1920 yüklenir, yalnız ortadaki daire görünür. Yazı yok; konuyu seç.',
  alanlar: [],
  ciz: (v, L, y) => tuval(1080, 1920, `<div class="esn"></div><div style="width:620px;height:620px;border-radius:50%;display:grid;place-items:center;color:var(--vurgu);
border:3px solid var(--cizgi);background:color-mix(in srgb, var(--ink) 5%, transparent)">${ikon(ad, 300)}</div><div class="esn"></div>`, y, { pad: '0' }),
});

const sloganAlan = (ornek = SLOGAN, ipucu = '') => ({ ad: 'slogan', etiket: 'Slogan', tur: 'uzun', max: 50, ornek, ...(ipucu ? { ipucu } : {}) });

export const PLATFORM_SABLONLARI = [
  {
    id: 'profil', ad: 'Profil fotoğrafı', aile: 'Platform', w: 1080, h: 1080, yuzler: ['a', 'b'],
    ne: 'Instagram, WhatsApp topluluğu, Discord sunucu ikonu. Dairede yazı okunmadığı için yalnız logo.',
    alanlar: [],
    ciz: (v, L, y) => tuval(1080, 1080, `<div class="esn"></div>${L(88, true)}<div class="esn"></div>`, y, { pad: '0' }),
  },
  ...Object.keys(IKON).map((ad, i) => oneCikan(i + 1, ad)),
  {
    id: 'linkedin-kapak', ad: 'LinkedIn sayfa kapağı', aile: 'Platform', w: 4200, h: 700, yuzler: ['a', 'b'],
    ne: '4200 × 700. Sayfa logosu sol alta biner (kitteki kesik çizgi): içerik ortada-sağda, oraya değmez.',
    alanlar: [sloganAlan('Kodla öğren,\nbirlikte üret.', 'İki satır.')],
    ciz: (v, L, y) => tuval(4200, 700, `<div style="display:flex;align-items:center;gap:90px;height:100%">${L(190)}
<span style="width:3px;height:260px;background:var(--cizgi)"></span><p class="ince" style="font-size:80px;text-align:left">${zengin(v.slogan)}</p></div>`,
      y, { pad: '0 300px', cls: 'li' }),
  },
  {
    id: 'linkedin-etkinlik', ad: 'LinkedIn etkinlik kapağı', aile: 'Platform', w: 1776, h: 444, yuzler: ['a', 'b'],
    ne: '1776 × 444. Etkinliği LinkedIn\'de oluştururken kapak görseli.',
    alanlar: [
      { ad: 'hap', etiket: 'Etiket', tur: 'kisa', max: 40, ornek: 'Workshop · 14 Ekim · Amfi 2' },
      { ad: 'baslik', etiket: 'Başlık', tur: 'kisa', max: 40, ornek: "Python'a sıfırdan giriş.", ipucu: 'Tek satır.' },
      { ad: 'vurgu', etiket: 'Son kelime turkuaz', tur: 'secim', ornek: true },
    ],
    ciz: (v, L, y) => tuval(1776, 444, `${L(64)}<div class="esn"></div><span class="hap" style="font-size:22px;padding:8px 22px">${esc(v.hap)}</span>
${bosluk(16)}<h2 class="dev-y" data-sigdir="0.6" style="font-size:96px">${baslik(v.baslik, v.vurgu)}</h2><div class="esn"></div>`, y, { pad: '44px 120px' }),
  },
  {
    id: 'x-baslik', ad: 'X başlığı', aile: 'Platform', w: 1500, h: 500, yuzler: ['a', 'b'],
    ne: '1500 × 500. Profil fotoğrafı sol alta biner; ortalı içerik ona değmez.',
    alanlar: [sloganAlan()],
    ciz: (v, L, y) => tuval(1500, 500, `<div class="esn"></div>${L(110)}${bosluk(30)}<p class="ince" style="font-size:42px">${zengin(v.slogan)}</p><div class="esn"></div>`,
      y, { pad: '40px 140px' }),
  },
  {
    id: 'youtube-banner', ad: 'YouTube banner', aile: 'Platform', w: 2560, h: 1440, yuzler: ['a', 'b'],
    ne: '2560 × 1440. Telefonda yalnız ortadaki 1546 × 423 görünür; yazı orada.',
    alanlar: [sloganAlan()],
    ciz: (v, L, y) => tuval(2560, 1440, `<div class="esn"></div>${L(200)}${bosluk(40)}<p class="ince" style="font-size:64px">${zengin(v.slogan)}</p><div class="esn"></div>`,
      y, { pad: '508px 507px' }),
  },
  {
    id: 'youtube-kapak', ad: 'YouTube kapağı', aile: 'Platform', w: 1280, h: 720, yuzler: ['a', 'b'],
    ne: '1280 × 720. Workshop kaydı: dev yazı. Kapak küçük görünür: en fazla 2 satır, 5–6 kelime.',
    alanlar: [
      { ad: 'hap', etiket: 'Etiket', tur: 'kisa', max: 24, ornek: 'Workshop kaydı' },
      { ad: 'baslik', etiket: 'Başlık', tur: 'uzun', max: 40, ornek: '5 dakikada\nPython kurulumu', ipucu: 'İki satır: ikinci satır turkuaz olur.' },
    ],
    ciz: (v, L, y) => tuval(1280, 720, `${L(56)}<div class="esn"></div><span class="hap" style="font-size:24px">${esc(v.hap)}</span>${bosluk(20)}
<h2 class="dev-y" data-sigdir="0.55" data-satir="serbest" style="font-size:118px">${baslik(v.baslik, 'satir')}</h2><div class="esn"></div>`, y, { pad: '44px 80px' }),
  },
  {
    id: 'youtube-kapak-foto', ad: 'YouTube kapağı · fotoğraflı', aile: 'Platform', w: 1280, h: 720, yuzler: ['a', 'b'],
    ne: '1280 × 720. Söyleşi ve konuşma kayıtları: solda başlık, sağda konuşmacı.',
    alanlar: [
      { ad: 'foto', etiket: 'Fotoğraf', tur: 'foto' },
      { ad: 'hap', etiket: 'Etiket', tur: 'kisa', max: 20, ornek: 'Söyleşi' },
      { ad: 'baslik', etiket: 'Başlık', tur: 'uzun', max: 50, ornek: 'Yapay zekâ çağında *mühendis olmak.*', ipucu: '*kelimeler* turkuaz olur.' },
    ],
    ciz: (v, L, y) => tuval(1280, 720, `<div style="width:620px;height:100%;display:flex;flex-direction:column;align-items:flex-start;text-align:left;align-self:flex-start">
${L(52)}<div class="esn"></div><span class="hap" style="font-size:24px">${esc(v.hap)}</span>${bosluk(20)}
<h2 class="dev-y" data-sigdir="0.6" data-satir="serbest" style="font-size:78px">${baslik(v.baslik)}</h2><div class="esn"></div></div>`,
      y, { pad: '44px 64px', ek: fotoYuva(v.foto, 'foto', 'position:absolute;right:48px;top:48px;width:520px;height:624px') }),
  },
  {
    id: 'youtube-bitis', ad: 'YouTube bitiş ekranı', aile: 'Platform', w: 1920, h: 1080, yuzler: ['a', 'b'],
    ne: '1920 × 1080, videonun son 20 saniyesi. Alttaki iki video önerisi ve abone düğmesi YouTube\'da eklenir; yerleri boş.',
    alanlar: [
      { ad: 'baslik', etiket: 'Başlık', tur: 'kisa', max: 34, ornek: 'İzlediğin için teşekkürler.' },
      { ad: 'aciklama', etiket: 'Açıklama', tur: 'kisa', max: 50, ornek: 'Sıradaki video ve abone ol düğmesi aşağıda.' },
    ],
    ciz: (v, L, y) => tuval(1920, 1080, `${L(72)}${bosluk(60)}<h2 class="bas-o" data-sigdir="0.6" style="font-size:80px">${esc(v.baslik)}</h2>
${bosluk(16)}<p class="ince" style="font-size:34px">${zengin(v.aciklama)}</p><div class="esn"></div>`, y, { pad: '80px 120px' }),
  },
  {
    id: 'discord-banner', ad: 'Discord banner', aile: 'Platform', w: 960, h: 540, yuzler: ['a', 'b'],
    ne: '960 × 540, sunucu banner\'ı. Sunucu ikonu = profil fotoğrafı.',
    alanlar: [sloganAlan()],
    ciz: (v, L, y) => tuval(960, 540, `<div class="esn"></div>${L(84)}${bosluk(26)}<p class="ince" style="font-size:32px">${zengin(v.slogan)}</p><div class="esn"></div>`,
      y, { pad: '40px 80px' }),
  },
];

