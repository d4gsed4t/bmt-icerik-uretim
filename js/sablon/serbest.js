// Serbest post: şablonda olmayan bir içerik için kitin parçalarını dizerek kurulan görsel (tek ya da çok sayfalı).
// Tasarımcı yalnız hangi parçanın hangi sırayla geleceğini seçer; yerleşim kitin kuralı:
// logo üstte, ortalı dikey ritim, ana içerik ortada toplanır, sondaki bilgi satırı ve düğme alta oturur,
// çok sayfada en alta sayfa noktaları gelir. Aralıklar kitteki şablonlardan (ör. etiket → dev başlık 44 px).
import { esc, zengin, baslik, satir, bosluk, tuval, kaydir, fotoYuva, fotoZemin, qr, kisi, kisiFoto, EM_DUZ, IPUCU_KALIN } from './ortak.js';
import { renklendir } from './tarif.js';
import { IKONLAR } from './ikonlar.js';

export const BICIMLER = {
  'Post (1080 × 1440)': { w: 1080, h: 1440 },
  'Story (1080 × 1920)': { w: 1080, h: 1920, cls: 'story' },
  'Kare (1080 × 1080)': { w: 1080, h: 1080 },
  'Yatay (1920 × 1080)': { w: 1920, h: 1080, pad: '80px 120px', kilit: 96 },
};
export const EN_FAZLA_PARCA = 8, EN_FAZLA_SAYFA = 10;

// İkon parçasının listesi: kitin 34 ikonu, Türkçe adlarıyla
export const IKON_ADLARI = {
  etkinlik: 'Takvim', ekip: 'Ekip', 'egitim-kod': 'Kod', duyuru: 'Duyuru', sponsor: 'Sponsor', soru: 'Soru', terminal: 'Terminal',
  cip: 'Çip', laptop: 'Dizüstü', veri: 'Veri', bulut: 'Bulut', 'yapay-zeka': 'Yapay zekâ', kilit: 'Kilit', wifi: 'Wi-Fi', oyun: 'Oyun',
  roket: 'Roket', konum: 'Konum', saat: 'Saat', bilet: 'Bilet', kupa: 'Kupa', sertifika: 'Sertifika', mikrofon: 'Mikrofon', kamera: 'Kamera',
  video: 'Video', kitap: 'Kitap', fikir: 'Fikir', eposta: 'E-posta', sohbet: 'Sohbet', baglanti: 'Bağlantı', indir: 'İndir', 'ok-sag': 'Ok',
  yildiz: 'Yıldız', kalp: 'Kalp', onay: 'Onay',
};
const ikonAnahtari = ad => Object.keys(IKON_ADLARI).find(k => IKON_ADLARI[k] === ad) ?? 'onay';
const ikonSvg = (k, px) => `<span class="ikon-dev"><svg width="${px}" height="${px}" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="8" stroke-linejoin="miter" stroke-linecap="square">${IKONLAR[k]}</svg></span>`;
// Alıntının açılış tırnağı: yazı değil şekil (harf kutusu görünen işaretten büyük, ölçümü şaşırtıyordu)
const TIRNAK = h => `<svg aria-hidden="true" width="${Math.round(h * 1.32)}" height="${h}" viewBox="0 0 132 100" fill="currentColor" style="color:var(--vurgu);flex:none">`
  + ['', 'translate(70 0)'].map(t => `<path transform="${t}" d="M48 2C20 10 2 34 2 62c0 22 13 36 30 36 15 0 27-11 27-26 0-14-10-25-25-25-3 0-6 1-8 2 3-17 14-30 30-37z"/>`).join('') + '</svg>';
const satirlar = t => String(t ?? '').split('\n').map(x => x.trim()).filter(Boolean);

// Parça türleri: formdaki adı, alanları ve çizimi. ciz(p, v, b): parça, bütün değerler (fotoğraflar "blok-<id>"), biçim.
// ana: "tek ana görsel" kuralında ana görsel sayılan parçalar.
export const PARCALAR = {
  hap: { ad: 'Etiket', alanlar: [{ ad: 'metin', tur: 'kisa', max: 30 }], ciz: p => `<span class="hap">${esc(p.metin)}</span>` },
  genis: { ad: 'Küçük başlık', alanlar: [{ ad: 'metin', tur: 'kisa', max: 30 }], ciz: p => `<span class="genis">${esc(p.metin)}</span>` },
  dev: {
    ad: 'Dev başlık', ana: true,
    alanlar: [{ ad: 'metin', tur: 'uzun', max: 40, ipucu: 'Her satır ayrı satıra. *kelime* yazarsan turkuaz olur.' }, { ad: 'vurgu', tur: 'secim', etiket: 'Son kelime turkuaz' }],
    ciz: p => `<h2 class="dev-y" data-sigdir="0.45">${baslik(p.metin, p.vurgu)}</h2>`,
  },
  baslik: { ad: 'Başlık', alanlar: [{ ad: 'metin', tur: 'uzun', max: 50, ipucu: '*kelime* yazarsan turkuaz olur.' }], ciz: p => `<h2 class="bas-o" data-sigdir="0.55" data-satir="serbest">${baslik(p.metin, false, false, EM_DUZ)}</h2>` },
  metin: { ad: 'Açıklama', alanlar: [{ ad: 'metin', tur: 'uzun', max: 120, ipucu: IPUCU_KALIN }], ciz: p => `<p class="ince">${zengin(p.metin)}</p>` },
  rakam: {
    ad: 'Dev rakam', ana: true,
    alanlar: [{ ad: 'metin', tur: 'kisa', max: 5, etiket: 'Rakam', ipucu: 'ör. 3 · %40 · 2026' }, { ad: 'alt', tur: 'kisa', max: 24, etiket: 'Altındaki yazı' }],
    ciz: (p, v, b) => `<p class="rakam" data-sigdir="0.35" style="font-size:${b.h >= 1900 ? 560 : b.w > b.h ? 300 : 420}px;line-height:.9">${esc(p.metin)}</p>`
      + (p.alt?.trim() ? `${bosluk(24)}<span class="genis" style="font-size:40px;letter-spacing:.4em;margin-right:-.4em">${esc(p.alt)}</span>` : ''),
  },
  istatistik: {
    ad: 'İstatistik', alanlar: [{ ad: 'metin', tur: 'uzun', max: 80, ipucu: 'Her satır bir sayı: önce sayı, sonra ne olduğu. ör. 38 katılımcı' }],
    ciz: (p, v, b) => {
      const s = satirlar(p.metin).slice(0, 3).map(x => { const m = x.match(/^(\S+)\s*(.*)$/); return `<div><b>${esc(m?.[1] ?? x)}</b><small>${esc(m?.[2] ?? '')}</small></div>`; });
      return `<div class="stat-y" style="grid-template-columns:repeat(${Math.max(1, s.length)},1fr)${b.w > b.h ? ';max-width:1200px' : ''}">${s.join('')}</div>`;   // yatayda sütunlar kopmasın
    },
  },
  alinti: {
    ad: 'Alıntı', alanlar: [{ ad: 'metin', tur: 'uzun', max: 140, etiket: 'Söz' }, { ad: 'kaynak', tur: 'kisa', max: 40, etiket: 'Kimin sözü' }],
    // söz sayfanın ana öğesi gibi dursun: biçime göre boy (kare en kısa), yatayda iki satıra kırılsın diye genişlik sınırı
    // üstte turkuaz büyük tırnak (ana öğe), söz tırnaksız: editoryal alıntı düzeni
    ciz: (p, v, b) => `${TIRNAK(b.w > b.h || b.w === b.h ? 96 : 124)}${bosluk(b.w > b.h || b.w === b.h ? 34 : 48)}`
      + `<p class="ince" data-sigdir="0.6" data-satir="serbest" style="font-size:${b.h >= 1900 ? 84 : b.w > b.h ? 74 : b.h > b.w ? 76 : 66}px;font-weight:600;color:var(--ink);line-height:1.22;letter-spacing:-.015em;${b.w > b.h ? 'max-width:1250px;' : ''}">${esc(String(p.metin ?? '').trim()).replace(/\n/g, '<br>')}</p>`
      + (p.kaynak?.trim() ? `${bosluk(30)}<span class="genis" style="font-size:26px">${esc(p.kaynak)}</span>` : ''),
  },
  liste: {
    ad: 'Liste', alanlar: [{ ad: 'metin', tur: 'uzun', max: 200, ipucu: 'Her satır bir madde. En fazla 5–6 madde.' }],
    ciz: (p, v, b) => `<div class="liste-y cam" style="padding:40px 50px;width:100%;box-sizing:border-box${b.w > b.h ? ';max-width:1100px' : ''}">${satirlar(p.metin).map(x => `<div>${esc(x)}</div>`).join('')}</div>`,
  },
  ikon: {
    ad: 'İkon satırı', alanlar: [{ ad: 'ikon', tur: 'liste', etiket: 'İkon', secenekler: Object.values(IKON_ADLARI) }, { ad: 'metin', tur: 'kisa', max: 40, etiket: 'Yazı' }],
    ciz: p => `<div style="display:flex;gap:28px;align-items:center;text-align:left">${ikonSvg(ikonAnahtari(p.ikon), 76)}<span style="font:500 40px/1.2 Lexend">${esc(p.metin)}</span></div>`,
  },
  foto: {
    ad: 'Fotoğraf', ana: true, alanlar: [{ ad: 'oran', tur: 'liste', etiket: 'Oran', secenekler: ['Yatay', 'Kare', 'Dikey'] }],
    ciz: (p, v, b) => {
      const g = Math.min(680, Math.round(b.w * 0.62)), h = { Yatay: Math.round(g * 0.7), Kare: g, Dikey: Math.round(g * 1.2) }[p.oran ?? 'Yatay'];
      return fotoYuva(v[`blok-${p.id}`], `blok-${p.id}`, `width:${g}px;height:${h}px`);
    },
  },
  galeri: {
    ad: 'Galeri', ana: true, alanlar: [{ ad: 'adet', tur: 'liste', etiket: 'Fotoğraf sayısı', secenekler: ['3', '2'] }],
    fotolar: p => (p.adet === '2' ? [1, 2] : [1, 2, 3]),
    ciz: (p, v, b) => {
      const iki = p.adet === '2', h = b.w > b.h ? 460 : 560;
      const yer = (n, ek = '') => fotoYuva(v[`blok-${p.id}-${n}`], `blok-${p.id}-${n}`, ek);
      return `<div class="galeri-y" style="flex:none;width:100%;height:${h}px;${iki ? 'grid-template-columns:1fr 1fr;grid-template-rows:1fr' : ''}">${iki ? yer(1) + yer(2) : yer(1) + yer(2) + yer(3)}</div>`;
    },
  },
  // Büyük: kitin tek kişilik tanıtımı (Ekip story) gibi büyük daire, altında görev, ad, bölüm; ortalı.
  // Satır: daire solda, yazı sağda (yönetim kurulu sayfalarındaki gibi), birkaç kişiyi alt alta dizmek için.
  kisi: {
    ad: 'Kişi', alanlar: [{ ad: 'duzen', tur: 'liste', etiket: 'Düzen', secenekler: ['Büyük', 'Satır'] }, { ad: 'gorev', tur: 'kisa', max: 22, etiket: 'Görev' },
      { ad: 'ad', tur: 'kisa', max: 22, etiket: 'Ad Soyad' }, { ad: 'alt', tur: 'kisa', max: 34, etiket: 'Bölüm / kurum' }],
    foto: true,
    ciz: (p, v, b) => {
      const f = v[`blok-${p.id}`], ad = `blok-${p.id}`;
      if (p.duzen === 'Satır') return `<div style="width:fit-content">${kisi(f, ad, p.gorev, p.ad, p.alt, 200)}</div>`;
      if (b.w > b.h) return `<div style="width:fit-content">${kisi(f, ad, p.gorev, p.ad, p.alt, 320)}</div>`;   // yatayda büyük: alt alta sığmaz, yan yana büyük
      const px = b.h >= 1900 ? 460 : b.w > b.h ? 300 : b.h > b.w ? 380 : 270;
      return `<div style="display:flex;flex-direction:column;align-items:center">${kisiFoto(f, ad, px)}${bosluk(b.w > b.h || b.w === b.h ? 44 : 60)}`
        + (p.gorev?.trim() ? `<span class="hap">${esc(p.gorev)}</span>${bosluk(24)}` : '')
        + `<h2 class="bas-o" data-sigdir="0.6" style="font-size:${b.w > b.h || b.w === b.h ? 80 : 96}px">${esc(p.ad)}</h2>`
        + (p.alt?.trim() ? `${bosluk(14)}<p class="ince">${esc(p.alt)}</p>` : '') + '</div>';
    },
  },
  kod: { ad: 'Kod kartı', alanlar: [{ ad: 'metin', tur: 'kod', max: 300 }], ciz: p => `<div class="kod2"><div class="bar"><i></i><i></i><i></i></div><pre>${renklendir(p.metin)}</pre></div>` },
  qr: {
    ad: 'QR', alanlar: [{ ad: 'baglanti', tur: 'kisa', max: 200, etiket: 'Bağlantı' }, { ad: 'metin', tur: 'kisa', max: 40, etiket: 'Yanındaki yazı' }],
    ciz: p => `<div style="display:flex;gap:44px;align-items:center;text-align:left">${qr(p.baglanti)}${p.metin?.trim() ? `<div style="font:600 42px/1.2 Lexend">${esc(p.metin)}</div>` : ''}</div>`,
  },
  ayrac: { ad: 'Ayraç', alanlar: [], ciz: () => '<div class="ayrac-y" style="width:70%"></div>' },
  bilgi: { ad: 'Bilgi satırı', alanlar: [{ ad: 'metin', tur: 'kisa', max: 60, ipucu: 'Parçaları · ile ayır: 14 Ekim · 15.30 · Amfi 2' }], ciz: p => satir(String(p.metin ?? '').split(/\s*·\s*/)) },
  buton: { ad: 'Düğme', alanlar: [{ ad: 'metin', tur: 'kisa', max: 20 }], ciz: p => `<span class="buton">${esc(p.metin)}</span>` },
};

// Yeni parçanın başlangıç içeriği (boş kalmasın, nereye ne yazılacağı görünsün)
export const PARCA_ILK = {
  hap: { metin: 'Duyuru' }, genis: { metin: 'Küçük başlık' }, dev: { metin: 'Yeni\nbaşlık.', vurgu: true }, baslik: { metin: 'Başlık' },
  metin: { metin: 'Kısa bir açıklama.' }, rakam: { metin: '3', alt: 'Gün kaldı' }, istatistik: { metin: '38 katılımcı\n2 saat\n12 proje' },
  alinti: { metin: 'Kod yazmak, düşünmeyi yazıya dökmektir.', kaynak: 'Konuşmacı adı' }, liste: { metin: 'Birinci madde\nİkinci madde' },
  ikon: { ikon: 'Onay', metin: 'Ön bilgi gerekmez' }, foto: { oran: 'Yatay' }, galeri: { adet: '3' }, kisi: { duzen: 'Büyük', gorev: 'Başkan', ad: 'Ad Soyad', alt: 'Bilgisayar Müh. · 3. sınıf' },
  kod: { metin: 'print("Merhaba BMT")' }, qr: { baglanti: '', metin: '' }, ayrac: {}, bilgi: { metin: '14 Ekim · 15.30 · Amfi 2' }, buton: { metin: 'Kayıt ol →' },
};

// Hazır başlangıçlar: iyi örnekleri tek tıkla başlatır (her biri kitin "tek ana görsel" kuralına uygun)
const p = (tur, ek = {}) => ({ tur, ...structuredClone(PARCA_ILK[tur]), ...ek });
export const BASLANGICLAR = {
  'Duyuru': [[p('hap'), p('dev', { metin: 'Kulüp odası\ntaşındı.' }), p('metin', { metin: 'Yeni yerimiz: Mühendislik Fakültesi,\nB blok, 214 numaralı oda.' }), p('bilgi', { metin: 'Hafta içi · 12.00–17.00' }), p('buton', { metin: 'Yol tarifi →' })]],
  'Alıntı': [[p('genis', { metin: 'Haftanın sözü' }), p('alinti'), p('ayrac'), p('bilgi', { metin: 'BMT Söyleşileri · 21 Ekim' })]],
  'Sayı': [[p('hap', { metin: 'Hackathon' }), p('rakam', { metin: '48', alt: 'Saat kaldı' }), p('metin', { metin: 'Başvurular **cuma 23.59**\'da kapanıyor.' }), p('buton', { metin: 'Başvur →' })]],
  'Kişi tanıtımı': [[p('genis', { metin: 'Ekibe hoş geldin' }), p('kisi', { gorev: 'Medya birimi', alt: 'Bilgisayar Müh. · 2. sınıf' }), p('metin', { metin: 'Kulübün bütün görsellerinden sorumlu.' })]],
  'İkonlu liste': [[p('baslik', { metin: 'Workshop\'a *gelmeden önce*' }), p('ikon', { ikon: 'Dizüstü', metin: 'Bilgisayarını getir' }), p('ikon', { ikon: 'Terminal', metin: 'Python 3 kurulu olsun' }), p('ikon', { ikon: 'Saat', metin: '15 dakika erken gel' }), p('bilgi', { metin: '14 Ekim · Amfi 2' })]],
  'Kod ipucu': [[p('hap', { metin: 'Python ipucu' }), p('baslik', { metin: 'Listeyi *tek satırda* ters çevir.' }), p('kod', { metin: 'sayilar = [1, 2, 3]\nprint(sayilar[::-1])  # [3, 2, 1]' })]],
  '3 sayfalık anlatım': [
    [p('hap', { metin: 'Rehber' }), p('dev', { metin: 'Git\'e\n3 adımda\nbaşla.' }), p('metin', { metin: 'Kaydır, adım adım anlatalım.' })],
    [p('genis', { metin: 'Adım 1' }), p('baslik', { metin: 'Depoyu *başlat*', boy: 2 }), p('kod', { metin: 'git init' }), p('metin', { metin: 'Klasörü Git\'in takip ettiği\nbir depoya çevirir.', boy: 1 })],
    [p('genis', { metin: 'Adım 2 ve 3' }), p('baslik', { metin: 'Kaydet ve *gönder*' }), p('kod', { metin: 'git add .\ngit commit -m "ilk"\ngit push' }), p('buton', { metin: 'Kaydet ve paylaş →' })],
  ],
};
const kimlikVer = sayfalar => sayfalar.map((parcalar, i) => ({ id: `s${i}`, parcalar: parcalar.map((x, j) => ({ id: `b${i}${j}${Math.random().toString(36).slice(2, 6)}`, ...x })) }));
export const baslangicSayfalari = ad => kimlikVer(structuredClone(BASLANGICLAR[ad]));

// Zemin (atmosfer): kitin kendi malzemesinden hazır seçenekler, ayar çubuğu yok (her biri iki yüzde denetlenir).
//   Sade: kitin gradyanı ve soluk ızgarası · Işık: üstten turkuaz huzme + ortada derin mavi parıltı (kit/05-grafik ışıkları)
//   Halka: köşelerde ince halkalar (kit/05-grafik), yazıya değmesin diye yarıçap logo/etiket/bilgi satırına göre sınırlı
//   Fotoğraf: tam ekran gerçek fotoğraf, gece renkli karartma, yazı beyaz (tek yüz)
//   Konsept: üstte görsel, zemine eriyerek; yazı altta (yalnız koyu yüz: açık yüzde koyu görselin geçişi bulanık kalıyordu)
export const ZEMINLER = ['Sade', 'Işık', 'Halka', 'Fotoğraf', 'Konsept'];
const z0 = v => (ZEMINLER.includes(v.zemin) ? v.zemin : 'Sade');
function halkalar(w, h) {
  const r = [160, 250, 340], op = [0.4, 0.28, 0.18];
  const daire = (cx, cy) => r.map((x, i) => `<circle cx="${cx}" cy="${cy}" r="${x}" stroke-opacity="${op[i]}"/>`).join('');
  return `<svg class="halka" viewBox="0 0 ${w} ${h}" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true">${daire(w, 0)}${daire(0, h)}</svg>`;
}
const ORT_FOTO = '<div class="ort" style="background:linear-gradient(to top,#14123A 10%,rgba(20,18,58,.42) 45%,rgba(20,18,58,.58))"></div>';

// Ölçülü serbestlik: her parça kademeyle büyür/küçülür, sola/ortaya/sağa hizalanır, üst boşluğu kademeyle değişir.
// Piksel ayarı yok: boyutlar ~bir yazı basamağı arayla, her parçanın kendi aralığında (tam genişlikteki parça ve
// zaten en büyük kademedeki dev başlık/dev rakam büyümez: büyüyen dev rakamın harf kutusu logoya taşıyordu).
export const BOY = { '-2': 0.72, '-1': 0.85, 0: 1, 1: 1.18, 2: 1.38 };
export const BOY_ADLARI = { '-2': 'En küçük', '-1': 'Küçük', 0: 'Normal', 1: 'Büyük', 2: 'En büyük' };
export const BOY_ARALIGI = {
  hap: [-1, 2], genis: [-1, 2], dev: [-2, 0], baslik: [-2, 2], metin: [-1, 2], rakam: [-2, 0], istatistik: [-2, 0], alinti: [-2, 1],
  liste: [-2, 0], ikon: [-1, 2], foto: [-2, 1], galeri: [-2, 0], kisi: [-1, 1], kod: [-2, 0], qr: [-1, 2], ayrac: [0, 0], bilgi: [-1, 1], buton: [-1, 2],
};
export const TAM_GENIS = new Set(['istatistik', 'liste', 'galeri', 'kod']);   // hizalaması anlamsız (zaten tam genişlik)
export const HIZALAR = ['sol', 'orta', 'sag'];
// üst boşluk: -1 yakın (yarı), 0 kitin aralığı, 1 geniş (iki kat), 2 alta it (bu parça ve sonrası alta oturur)
export const ARA_ADLARI = { '-1': 'Yakın', 0: 'Normal', 1: 'Geniş', 2: 'Alta it' };
const boyOf = x => { const [a, b] = BOY_ARALIGI[x.tur] ?? [0, 0]; return Math.min(b, Math.max(a, x.boy ?? 0)); };
// Varsayılandaki parça kitin çizimiyle birebir kalır (sarmalayıcı yok); ayarlıysa sarmalayıcı hizalar ve ölçekler.
// Büyütme sığdırmadan önce (zoom: sığmazsa sığdırma geri alır), küçültme sonra (data-zoom: sığdırılmış hâli küçülür;
// yoksa zaten genişliğe sığdırılmış dev başlıkta küçültme görünmezdi). data-zoom'u olcum.js/sigdir uygular.
function sar(x, html, { boy = true, hiza = true } = {}) {
  const k = boy ? BOY[boyOf(x)] : 1, h = hiza && !TAM_GENIS.has(x.tur) && HIZALAR.includes(x.hiza) ? x.hiza : 'orta';
  if (k === 1 && h === 'orta') return html;
  const ai = { sol: 'flex-start', orta: 'center', sag: 'flex-end' }[h], ta = { sol: 'left', orta: 'center', sag: 'right' }[h];
  return `<div class="sp" style="flex:none;align-self:stretch;display:flex;flex-direction:column;align-items:${ai};text-align:${ta}${k > 1 ? `;zoom:${k}` : ''}"${k < 1 ? ` data-zoom="${k}"` : ''}>${html}</div>`;
}
// Sayfadaki alt çapanın başladığı yer: ilk "alta it" parçası ya da sondaki bilgi satırı/düğmeler
export function altBaslangic(parcalar) {
  let k = parcalar.length;
  while (k > 0 && ['bilgi', 'buton'].includes(parcalar[k - 1].tur)) k--;
  if (k === 0) k = parcalar.length;            // hepsi alt çapaysa ortada kalsın
  const it = parcalar.findIndex((x, i) => i > 0 && x.ara === 2);
  return it > 0 ? Math.min(k, it) : k;
}

// İki parça arasındaki boşluk (kitteki şablonlardan)
function aralik(a, b) {
  if (b === 'kisi') return 64;               // halka dairenin 16 px dışında: üstteki yazıya değmesin
  if (a === 'kisi') return 48;
  if (a === 'hap') return b === 'dev' || b === 'rakam' ? 44 : 36;
  if (a === 'genis') return 20;
  if (a === 'dev' || a === 'rakam') return b === 'metin' ? 34 : 40;
  if (a === 'baslik') return b === 'metin' ? 20 : 36;
  if (a === 'ikon' && b === 'ikon') return 28;
  if (a === 'bilgi' || b === 'buton') return 40;
  return 36;
}
// Art arda gelen ikon satırları tek, sola yaslı bir blokta toplanır (ikonlar alt alta hizalı; blok ortada kalır)
function dizi(parcalar, v, b) {
  let html = '';
  for (let i = 0; i < parcalar.length; i++) {
    const x = parcalar[i];
    if (i) html += bosluk(Math.round(aralik(parcalar[i - 1].tur, x.tur) * ({ '-1': 0.5, 1: 2 }[x.ara] ?? 1)));
    if (x.tur === 'ikon') {   // grubun hizası ilk ikon satırından, boyutu her satırın kendinden
      let j = i; while (j + 1 < parcalar.length && parcalar[j + 1].tur === 'ikon') j++;
      html += sar(x, `<div style="display:grid;gap:28px;justify-items:start">${parcalar.slice(i, j + 1).map(y => sar(y, PARCALAR.ikon.ciz(y, v, b), { hiza: false })).join('')}</div>`, { boy: false });
      i = j; continue;
    }
    html += sar(x, PARCALAR[x.tur].ciz(x, v, b));
  }
  return html;
}

// Değerlerden sayfa listesi (eski taslaklarda tek "parcalar" dizisi vardı)
export const sayfalarOf = v => (Array.isArray(v.sayfalar) && v.sayfalar.length ? v.sayfalar : [{ id: 's0', parcalar: Array.isArray(v.parcalar) ? v.parcalar : [] }]);

// "Tek ana görsel" kuralı: bir sayfada birden fazla ana görsel parçası varsa adlarını döndürür
export function anaGorselFazlasi(sayfa) {
  const ana = sayfa.parcalar.filter(x => PARCALAR[x.tur]?.ana);
  return ana.length > 1 ? ana.map(x => PARCALAR[x.tur].ad.toLocaleLowerCase('tr')) : [];
}

export const SERBEST = {
  id: 'serbest', ad: 'Serbest post', aile: 'Serbest', w: 1080, h: 1440, yuzler: ['a', 'b', 'alarm'],
  ne: 'Şablonlarda olmayan bir içerik için: kitin parçalarını sırayla ekle; yerleşim, aralıklar ve sığdırma kitin kuralıyla. '
    + 'Sondaki bilgi satırı ve düğme alta oturur. Birden fazla sayfa eklersen carousel olur. Sık tekrar eden bir içerikse kalıcı şablon olarak eklenmeli.',
  // seçilen zemine göre kullanılabilir yüzler: fotoğraf zemini tek yüz (yazı beyaz), konsept yalnız koyu
  yuzFiltre: v => (v.zemin === 'Fotoğraf' ? [] : v.zemin === 'Konsept' ? ['a'] : null),
  // denetim ekranı bütün zeminleri de dener
  // denetim ekranı bütün zeminleri ve ayarların uç hâllerini de dener (her parça en büyük kademesinde)
  denetimDegerleri: [...ZEMINLER.filter(z => z !== 'Sade').map(z => ({ zemin: z })),
    { zemin: 'Sade', ayar: 'en büyük, sola', sayfalar: [{ id: 's0', parcalar: [
      { id: 'u1', tur: 'hap', metin: 'Duyuru', boy: 2, hiza: 'sol' }, { id: 'u2', tur: 'dev', metin: 'Kulüp odası\ntaşındı.', vurgu: true, boy: 1, hiza: 'sol' },
      { id: 'u3', tur: 'metin', metin: 'Yeni yerimiz: Mühendislik Fakültesi,\nB blok, 214 numaralı oda.', boy: 2, hiza: 'sol', ara: 1 },
      { id: 'u4', tur: 'bilgi', metin: 'Hafta içi · 12.00–17.00', boy: 1, hiza: 'sol' }, { id: 'u5', tur: 'buton', metin: 'Yol tarifi →', boy: 2, hiza: 'sol' }] }] },
    { zemin: 'Işık', ayar: 'en büyük, sağa, alta it', sayfalar: [{ id: 's0', parcalar: [
      { id: 'u1', tur: 'genis', metin: 'Hackathon', boy: 2, hiza: 'sag' }, { id: 'u2', tur: 'rakam', metin: '48', alt: 'Saat kaldı', boy: 1 },
      { id: 'u3', tur: 'ikon', ikon: 'Dizüstü', metin: 'Bilgisayarını getir', boy: 2, hiza: 'sag', ara: 2 }, { id: 'u4', tur: 'ikon', ikon: 'Saat', metin: '15 dakika erken gel', boy: 2 },
      { id: 'u5', tur: 'qr', baglanti: 'https://example.org', metin: 'Başvur', boy: 2, hiza: 'sag' }] }] }],
  alanlar: [
    { ad: 'bicim', etiket: 'Biçim', tur: 'liste', secenekler: Object.keys(BICIMLER), ornek: 'Post (1080 × 1440)' },
    { ad: 'zemin', etiket: 'Zemin', tur: 'liste', secenekler: ZEMINLER, ornek: 'Sade', yenidenKur: true },
    { ad: 'zeminFoto', etiket: 'Zemin görseli', tur: 'foto', kosul: v => v.zemin === 'Fotoğraf' || v.zemin === 'Konsept',
      ipucu: 'Fotoğraf zemininde görsel tam ekran ve karartılır; Konsept zemininde üstte durur, alta doğru erir.' },
    { ad: 'sayfalar', etiket: 'Parçalar', tur: 'sayfalar', ornek: [{ id: 's0', parcalar: [
      { id: 'o1', tur: 'hap', metin: 'Duyuru' },
      { id: 'o2', tur: 'dev', metin: 'Kulüp odası\ntaşındı.', vurgu: true },
      { id: 'o3', tur: 'metin', metin: 'Yeni yerimiz: Mühendislik Fakültesi,\nB blok, 214 numaralı oda.' },
      { id: 'o4', tur: 'bilgi', metin: 'Hafta içi · 12.00–17.00' },
      { id: 'o5', tur: 'buton', metin: 'Yol tarifi →' },
    ] }] },
  ],
  // Çok sayfada her sayfa ayrı bir "sanal şablon" olur (uygulama sayfa sekmelerini, kaydı bununla kurar)
  sayfaUret: v => sayfalarOf(v).map((_, i, hepsi) => ({
    ...SERBEST, id: `serbest#${i}`, anahtar: 'serbest', taban: SERBEST, sayfaNo: i,
    ad: hepsi.length > 1 ? `Serbest post · ${i + 1}. sayfa` : 'Serbest post',
    ciz: (d, L, y) => SERBEST.ciz(d, L, y, i),
  })),
  ciz: (v, L, y, sayfaNo = 0) => {
    const b = BICIMLER[v.bicim] ?? BICIMLER['Post (1080 × 1440)'];
    const hepsi = sayfalarOf(v), sayfa = hepsi[sayfaNo] ?? hepsi[0];
    const parcalar = (sayfa.parcalar ?? []).filter(x => PARCALAR[x.tur]).slice(0, EN_FAZLA_PARCA);
    const k = z0(v) === 'Konsept' ? altBaslangic(parcalar.map(x => ({ ...x, ara: x.ara === 2 ? 0 : x.ara }))) : altBaslangic(parcalar);
    const ana = parcalar.slice(0, k), alt = parcalar.slice(k);
    const noktalar = hepsi.length > 1 ? `${alt.length ? bosluk(40) : ''}${kaydir(sayfaNo + 1, hepsi.length)}` : '';
    const z = z0(v);
    // konsept: görsel üstte, içerik altta toplanır (büyük etkinlik şablonu gibi); diğerlerinde ana içerik ortada
    const ic = z === 'Konsept'
      ? `${L(b.kilit ?? 88)}<div class="esn"></div>${dizi(ana, v, b)}${alt.length ? bosluk(40) + dizi(alt, v, b) : ''}${noktalar ? bosluk(40) + kaydir(sayfaNo + 1, hepsi.length) : ''}`
      : `${L(b.kilit ?? 88)}<div class="esn"></div>${dizi(ana, v, b)}<div class="esn"></div>${dizi(alt, v, b)}${noktalar}`;
    const ek = { Sade: '', 'Işık': '<div class="isik"></div>', Halka: halkalar(b.w, b.h),
      Konsept: v.zeminFoto?.src
        ? `<div class="konsept dolu" data-foto="zeminFoto" style="height:62%"><img class="foto" src="${v.zeminFoto.src}" alt="" draggable="false" style="object-position:${v.zeminFoto.px}% ${v.zeminFoto.py}%;transform:scale(${v.zeminFoto.zoom});transform-origin:${v.zeminFoto.px}% ${v.zeminFoto.py}%"></div>`
        : '<div class="konsept" style="height:62%"><span>Konsept görseli</span></div>',
      'Fotoğraf': fotoZemin(v.zeminFoto, 'zeminFoto') + ORT_FOTO }[z];
    // fotoğraf zemininde yazı her yüzde beyaz, logo koyu zemin dosyası (yüz: foto)
    if (z === 'Fotoğraf') return tuval(b.w, b.h, `<div style="color:#fff;--ink:#fff;--c2:#77ACD4;--vurgu:#35C9C1;--soluk:rgba(255,255,255,.82);display:contents">${ic}</div>`,
      'foto', { cls: b.cls ?? '', pad: b.pad ?? '', doku: false, ek });
    return tuval(b.w, b.h, ic, z === 'Konsept' ? 'a' : y, { cls: `${b.cls ?? ''} zemin-${z === 'Işık' ? 'isik' : z.toLowerCase()}`, pad: b.pad ?? '', ek });
  },
};
