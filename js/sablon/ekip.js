// Ekip ailesi: ETU-BMT-Kimlik/uretim/aile_b2.py'nin birebir karşılığı (11 şablon).
// Ekipten biri her zaman daire fotoğraf + ince halka (.pp). Örnek içerik Python'dakiyle aynı.
import { esc, zengin, baslik, satir, bosluk, varsa, tuval, kaydir, kisi, kisiFoto, qr, IPUCU_BASLIK } from './ortak.js';

const P = [1080, 1440], S = [1080, 1920], KART = [1011, 638];   // üye kartı: 85,6 × 54 mm @300 dpi
const haplar = t => String(t ?? '').split('\n').map(x => x.trim()).filter(Boolean).map(x => `<span class="hap">${esc(x)}</span>`).join('');

// Kişi alanları: görev, ad, bölüm, fotoğraf (önek k1, k2…)
const kisiAlanlari = (on, no, gorev, alt) => [
  { ad: `${on}foto`, etiket: `${no}. kişi · fotoğraf`, tur: 'foto' },
  { ad: `${on}gorev`, etiket: `${no}. kişi · görev`, tur: 'kisa', max: 22, ornek: gorev },
  { ad: `${on}ad`, etiket: `${no}. kişi · ad`, tur: 'kisa', max: 22, ornek: 'Ad Soyad' },
  { ad: `${on}alt`, etiket: `${no}. kişi · bölüm`, tur: 'kisa', max: 34, ornek: alt },
];
const kisiV = (v, on, px) => kisi(v[`${on}foto`], `${on}foto`, v[`${on}gorev`], v[`${on}ad`], v[`${on}alt`], px);

// ---------------------------------------------------------------- yönetim kurulu carousel'i (4 sayfa)
const YK = { id: 'yk', ad: "Yönetim kurulu carousel'i" };
const YK_ALAN = {
  hap: { ad: 'hap', etiket: 'Kapak etiketi', tur: 'kisa', max: 20, ornek: 'Ekibimiz' },
  baslik: { ad: 'baslik', etiket: 'Kapak başlığı', tur: 'uzun', max: 40, ornek: '2026–2027\nyönetim\nkurulu.', ipucu: IPUCU_BASLIK },
  aciklama: { ad: 'aciklama', etiket: 'Kapak açıklaması', tur: 'uzun', max: 60, ornek: 'Bu yıl kulübü yürütecek ekiple tanış.' },
  ucBaslik: { ad: 'ucBaslik', etiket: '2. sayfa başlığı', tur: 'kisa', max: 24, ornek: 'Yönetim' },
  ikiBaslik: { ad: 'ikiBaslik', etiket: '3. sayfa başlığı', tur: 'kisa', max: 24, ornek: 'Birim sorumluları' },
  kHap: { ad: 'kHap', etiket: 'Kapanış etiketi', tur: 'kisa', max: 20, ornek: 'Sen de katıl' },
  kBaslik: { ad: 'kBaslik', etiket: 'Kapanış başlığı', tur: 'uzun', max: 40, ornek: 'Bu ekipte\nsenin de\nyerin var.', ipucu: 'Son satır turkuaz olur.' },
  kAciklama: { ad: 'kAciklama', etiket: 'Kapanış açıklaması', tur: 'uzun', max: 60, ornek: 'Birim alımları her dönem başında açılıyor.' },
  kButon: { ad: 'kButon', etiket: 'Kapanış düğmesi', tur: 'kisa', max: 20, ornek: 'Bizi takip et →' },
};

// ---------------------------------------------------------------- üye kartı (ön + arka birlikte basılır)
const KART_SERI = { id: 'uye-karti', ad: 'Üye kartı' };
const KART_ALAN = {
  ad: { ad: 'ad', etiket: 'Ad Soyad', tur: 'kisa', max: 20, ornek: 'Ad Soyad' },
  no: { ad: 'no', etiket: 'Üye no', tur: 'kisa', max: 20, ornek: 'No: BMT-0142' },
  donem: { ad: 'donem', etiket: 'Dönem', tur: 'kisa', max: 22, ornek: 'Dönem: 2026–2027' },
  qr: { ad: 'qr', etiket: 'QR bağlantısı (arka yüz)', tur: 'kisa', max: 200, ornek: '', ipucu: 'Ör. üyelik doğrulama sayfası. Boşsa yer tutucu.' },
  kulup: { ad: 'kulup', etiket: 'Kulüp adı (arka yüz)', tur: 'uzun', max: 60, ornek: 'ETÜ Bilgisayar\nMühendisliği Topluluğu' },
  metin: { ad: 'metin', etiket: 'Arka yüz metni', tur: 'uzun', max: 110, ornek: 'Bu kart sahibinin kulüp üyesi olduğunu gösterir. Etkinlik girişlerinde QR okutulur.' },
  bulunursa: { ad: 'bulunursa', etiket: 'Bulunursa', tur: 'kisa', max: 30, ornek: 'Bulunursa: kulüp odasına' },
};

export const EKIP_SABLONLARI = [
  {
    id: 'yk-kapak', ad: 'Yönetim kurulu · kapak', aile: 'Ekip', w: P[0], h: P[1], yuzler: ['a', 'b'], seri: YK,
    ne: 'Kapak, 3 kişilik sayfa, 2 kişilik sayfa, kapanış: dört sayfa birlikte kaydedilir.',
    alanlar: [YK_ALAN.hap, YK_ALAN.baslik, YK_ALAN.aciklama],
    ciz: (v, L, y) => tuval(...P, `${L()}<div class="esn"></div><span class="hap">${esc(v.hap)}</span>${bosluk(44)}
<h2 class="dev-y" data-sigdir="0.55" style="font-size:150px">${baslik(v.baslik, true)}</h2>` + varsa(v.aciklama, `${bosluk(34)}
<p class="ince">${zengin(v.aciklama)}</p>`) + `<div class="esn"></div>${kaydir(1, 4)}`, y),
  },
  {
    id: 'yk-uc-kisi', ad: 'Yönetim kurulu · 3 kişi', aile: 'Ekip', w: P[0], h: P[1], yuzler: ['a', 'b'], seri: YK,
    alanlar: [YK_ALAN.ucBaslik, ...kisiAlanlari('u1', 1, 'Başkan', 'Bilgisayar Müh. · 3. sınıf'),
      ...kisiAlanlari('u2', 2, 'Başkan yardımcısı', 'Bilgisayar Müh. · 2. sınıf'), ...kisiAlanlari('u3', 3, 'Genel sekreter', 'Bilgisayar Müh. · 2. sınıf')],
    ciz: (v, L, y) => tuval(...P, `${L()}${bosluk(70)}<span class="genis">${esc(v.ucBaslik)}</span><div class="esn"></div>
<div style="display:grid;gap:56px;width:fit-content;min-width:640px">${kisiV(v, 'u1')}${kisiV(v, 'u2')}${kisiV(v, 'u3')}</div>
<div class="esn"></div>${kaydir(2, 4)}`, y),
  },
  {
    id: 'yk-iki-kisi', ad: 'Yönetim kurulu · 2 kişi', aile: 'Ekip', w: P[0], h: P[1], yuzler: ['a', 'b'], seri: YK,
    alanlar: [YK_ALAN.ikiBaslik, ...kisiAlanlari('i1', 4, 'Medya', 'Medya ve tasarım birimi'), ...kisiAlanlari('i2', 5, 'Eğitim', 'Workshop ve eğitim serileri')],
    ciz: (v, L, y) => tuval(...P, `${L()}${bosluk(70)}<span class="genis">${esc(v.ikiBaslik)}</span><div class="esn"></div>
<div style="display:grid;gap:76px;width:fit-content;min-width:640px">${kisiV(v, 'i1', 300)}${kisiV(v, 'i2', 300)}</div>
<div class="esn"></div>${kaydir(3, 4)}`, y),
  },
  {
    id: 'yk-kapanis', ad: 'Yönetim kurulu · kapanış', aile: 'Ekip', w: P[0], h: P[1], yuzler: ['a', 'b'], seri: YK,
    alanlar: [YK_ALAN.kHap, YK_ALAN.kBaslik, YK_ALAN.kAciklama, YK_ALAN.kButon],
    ciz: (v, L, y) => tuval(...P, `${L()}<div class="esn"></div><span class="hap">${esc(v.kHap)}</span>${bosluk(44)}
<h2 class="dev-y" data-sigdir="0.55" style="font-size:136px">${baslik(v.kBaslik, 'satir')}</h2>${bosluk(34)}
<p class="ince">${zengin(v.kAciklama)}</p>` + varsa(v.kButon, `${bosluk(50)}<span class="buton">${esc(v.kButon)}</span>`) + `
<div class="esn"></div>${kaydir(4, 4)}`, y),
  },
  {
    id: 'ekip-story', ad: 'Ekip story (tek kişi)', aile: 'Ekip', w: S[0], h: S[1], yuzler: ['a', 'b'],
    ne: 'Tek kişilik tanıtım: büyük daire fotoğraf, görev, ad, kısa açıklama.',
    alanlar: [
      { ad: 'foto', etiket: 'Fotoğraf', tur: 'foto' },
      { ad: 'hap', etiket: 'Görev / birim', tur: 'kisa', max: 22, ornek: 'Medya birimi' },
      { ad: 'ad', etiket: 'Ad Soyad', tur: 'kisa', max: 22, ornek: 'Ad Soyad' },
      { ad: 'aciklama', etiket: 'Açıklama', tur: 'uzun', max: 90, ornek: 'Bilgisayar Müh. · 2. sınıf\nKulübün bütün görsellerinden sorumlu.' },
      { ad: 'bilgi1', etiket: 'Alt satır 1', tur: 'kisa', max: 22, ornek: 'Medya birimi' },
      { ad: 'bilgi2', etiket: 'Alt satır 2', tur: 'kisa', max: 14, ornek: '2026–2027' },
    ],
    ciz: (v, L, y) => tuval(...S, `${L()}<div class="esn"></div>${kisiFoto(v.foto, 'foto', 480)}${bosluk(70)}<span class="hap">${esc(v.hap)}</span>
${bosluk(26)}<h2 class="bas-o" data-sigdir="0.6" style="font-size:104px">${esc(v.ad)}</h2>${bosluk(20)}
<p class="ince">${zengin(v.aciklama)}</p><div class="esn"></div>${satir([v.bilgi1, v.bilgi2], 'buyuk')}`, y, { cls: 'story' }),
  },
  {
    id: 'birim', ad: 'Birim tanıtımı', aile: 'Ekip', w: P[0], h: P[1], yuzler: ['a', 'b'],
    ne: 'Ana görsel birimin adı; ne yaptığı haplarda, sorumlusu altta.',
    alanlar: [
      { ad: 'sira', etiket: 'Üst etiket', tur: 'kisa', max: 24, ornek: 'Birimler · 2 / 5' },
      { ad: 'baslik', etiket: 'Birim adı', tur: 'kisa', max: 14, ornek: 'Medya.' },
      { ad: 'aciklama', etiket: 'Ne yapar?', tur: 'uzun', max: 100, ornek: "Duyurular, carousel'ler, Reels ve etkinlik fotoğrafları bu birimden çıkar." },
      { ad: 'haplar', etiket: 'Konular (her satır bir hap)', tur: 'uzun', max: 90, satir: 4, ornek: 'Canva ile tasarım\nFotoğraf ve video\nSosyal medya takvimi' },
      ...kisiAlanlari('s', 1, 'Birim sorumlusu', 'Medya birimi').map(a => ({ ...a, etiket: a.etiket.replace('1. kişi', 'Sorumlu') })),
    ],
    ciz: (v, L, y) => tuval(...P, `${L()}${bosluk(70)}<span class="genis">${esc(v.sira)}</span>${bosluk(30)}
<h2 class="dev-y" data-sigdir="0.5" style="font-size:210px">${baslik(v.baslik, false, true)}</h2>${bosluk(20)}
<p class="ince" style="font-size:36px">${zengin(v.aciklama)}</p>${bosluk(40)}
<div class="haplar">${haplar(v.haplar)}</div>
<div class="esn"></div><div class="ayrac-y"></div>${bosluk(40)}<div style="width:fit-content">${kisiV(v, 's', 150)}</div>`, y),
  },
  {
    id: 'hos-geldin', ad: 'Ekibe hoş geldin', aile: 'Ekip', w: P[0], h: P[1], yuzler: ['a', 'b'],
    ne: 'Ekibe katılan yeni üye. Ana görsel kişinin fotoğrafı.',
    alanlar: [
      { ad: 'foto', etiket: 'Fotoğraf', tur: 'foto' },
      { ad: 'hap', etiket: 'Etiket', tur: 'kisa', max: 22, ornek: 'Ekibe hoş geldin' },
      { ad: 'ad', etiket: 'Ad Soyad', tur: 'kisa', max: 22, ornek: 'Ad Soyad' },
      { ad: 'aciklama', etiket: 'Açıklama', tur: 'uzun', max: 100, ornek: 'Eğitim birimine katıldı. Bu dönemki Python serisinde onu göreceksiniz.' },
      { ad: 'bilgi1', etiket: 'Alt satır 1', tur: 'kisa', max: 24, ornek: 'Eğitim birimi' },
      { ad: 'bilgi2', etiket: 'Alt satır 2', tur: 'kisa', max: 14, ornek: '2026–2027' },
    ],
    ciz: (v, L, y) => tuval(...P, `${L()}<div class="esn"></div>${kisiFoto(v.foto, 'foto', 440)}${bosluk(64)}<span class="hap">${esc(v.hap)}</span>
${bosluk(26)}<h2 class="bas-o" data-sigdir="0.6">${esc(v.ad)}</h2>${bosluk(20)}
<p class="ince">${zengin(v.aciklama)}</p><div class="esn"></div>${satir([v.bilgi1, v.bilgi2])}`, y),
  },
  {
    id: 'tebrik', ad: 'Tebrik', aile: 'Ekip', w: P[0], h: P[1], yuzler: ['a', 'b'],
    ne: 'Derece, staj, burs, mezuniyet.',
    alanlar: [
      { ad: 'foto', etiket: 'Fotoğraf', tur: 'foto' },
      { ad: 'hap', etiket: 'Etiket', tur: 'kisa', max: 20, ornek: 'Tebrikler' },
      { ad: 'ad', etiket: 'Ad Soyad', tur: 'kisa', max: 22, ornek: 'Ad Soyad' },
      { ad: 'basari', etiket: 'Başarı', tur: 'uzun', max: 70, ornek: "Ulusal programlama yarışmasında\nTürkiye 2.'si oldu." },
      { ad: 'aciklama', etiket: 'Açıklama', tur: 'uzun', max: 80, ornek: 'Üyemizi kutluyor, başarılarının devamını diliyoruz.' },
      { ad: 'bilgi1', etiket: 'Alt satır 1', tur: 'kisa', max: 30, ornek: 'Ulusal Programlama Yarışması' },
      { ad: 'bilgi2', etiket: 'Alt satır 2', tur: 'kisa', max: 14, ornek: '2026' },
    ],
    ciz: (v, L, y) => tuval(...P, `${L()}<div class="esn"></div>${kisiFoto(v.foto, 'foto', 360)}${bosluk(60)}<span class="hap">${esc(v.hap)}</span>
${bosluk(26)}<h2 class="bas-o" data-sigdir="0.6">${esc(v.ad)}</h2>${bosluk(24)}
<p class="ince" style="font-weight:500;color:var(--ink);font-size:44px">${zengin(v.basari)}</p>${bosluk(20)}
<p class="ince" style="font-size:32px">${zengin(v.aciklama)}</p><div class="esn"></div>${satir([v.bilgi1, v.bilgi2])}`, y),
  },
  {
    id: 'alim', ad: 'Alım ilanı', aile: 'Ekip', w: P[0], h: P[1], yuzler: ['a', 'b'],
    ne: 'Birim alımları: birimler haplarda, son tarih ve başvuru QR\'ı altta.',
    alanlar: [
      { ad: 'hap', etiket: 'Etiket', tur: 'kisa', max: 20, ornek: 'Ekibe katıl' },
      { ad: 'baslik', etiket: 'Dev başlık', tur: 'uzun', max: 40, ornek: 'Birim\nalımları\nbaşladı.', ipucu: IPUCU_BASLIK },
      { ad: 'haplar', etiket: 'Birimler (her satır bir hap)', tur: 'uzun', max: 100, satir: 4, ornek: 'Medya ve tasarım\nEğitim\nOrganizasyon\nSponsorluk' },
      { ad: 'qr', etiket: 'Başvuru bağlantısı (QR olur)', tur: 'kisa', max: 200, ornek: '', ipucu: 'Boş bırakırsan QR yerine yer tutucu çıkar.' },
      { ad: 'sonEtiket', etiket: 'QR yanı etiketi', tur: 'kisa', max: 18, ornek: 'Son başvuru' },
      { ad: 'sonTarih', etiket: 'Son başvuru tarihi', tur: 'kisa', max: 24, ornek: '20 Ekim Pazartesi' },
      { ad: 'form', etiket: 'Alt not', tur: 'kisa', max: 34, ornek: "Form: bio'daki bağlantı" },
    ],
    ciz: (v, L, y) => tuval(...P, `${L()}<div class="esn"></div><span class="hap">${esc(v.hap)}</span>${bosluk(40)}
<h2 class="dev-y" data-sigdir="0.55" style="font-size:136px">${baslik(v.baslik, true)}</h2>${bosluk(44)}
<div class="haplar">${haplar(v.haplar)}</div>
<div class="esn"></div><div style="display:flex;gap:44px;align-items:center;text-align:left">${qr(v.qr)}
<div style="display:grid;gap:14px"><span class="genis" style="letter-spacing:.3em">${esc(v.sonEtiket)}</span><div style="font:600 46px/1.15 Lexend">${esc(v.sonTarih)}</div>
<span style="font:300 28px Lexend;color:var(--soluk)">${esc(v.form)}</span></div></div>`, y),
  },
  {
    id: 'uye-karti-on', ad: 'Üye kartı · ön', aile: 'Ekip', w: KART[0], h: KART[1], yuzler: ['a', 'b'], seri: KART_SERI,
    ne: 'Kredi kartı boyu (85,6 × 54 mm), 300 dpi. Ön ve arka yüz birlikte kaydedilir; ön koyuysa arka açık olur.',
    alanlar: [KART_ALAN.ad, KART_ALAN.no, KART_ALAN.donem],
    ciz: (v, L, y) => tuval(...KART, `<div style="display:flex;width:100%;align-items:center">${L(80)}<span class="hap" style="margin-left:auto;font-size:22px;padding:10px 22px">Üye kartı</span></div>
<div class="esn"></div><div data-sigdir="0.6" style="font:700 84px/1.05 Lexend;letter-spacing:-.03em;align-self:flex-start">${esc(v.ad)}</div>${bosluk(18)}
<div style="display:flex;gap:50px;align-self:flex-start;font:400 24px Lexend;color:var(--soluk);font-variant-numeric:tabular-nums"><span>${esc(v.no)}</span><span>${esc(v.donem)}</span></div>`,
      y, { cls: 'kart', pad: '56px 64px', stil: 'border-radius:37px' }),
  },
  {
    id: 'uye-karti-arka', ad: 'Üye kartı · arka', aile: 'Ekip', w: KART[0], h: KART[1], yuzler: ['b', 'a'], seri: KART_SERI,
    alanlar: [KART_ALAN.qr, KART_ALAN.kulup, KART_ALAN.metin, KART_ALAN.bulunursa],
    ciz: (v, L, y) => tuval(...KART, `<div style="display:flex;gap:56px;height:100%;align-items:center;text-align:left">${qr(v.qr, 'width:290px;height:290px')}
<div style="display:grid;gap:18px"><span style="font:700 40px/1.1 Lexend;letter-spacing:-.02em">${zengin(v.kulup)}</span>
<span style="font:300 24px/1.4 Lexend;color:var(--soluk)">${zengin(v.metin)}</span>
<span class="hap" style="justify-self:start;font-size:20px;padding:10px 20px">${esc(v.bulunursa)}</span></div></div>`,
      y, { cls: 'kart', pad: '56px 64px', stil: 'border-radius:37px' }),
  },
];
