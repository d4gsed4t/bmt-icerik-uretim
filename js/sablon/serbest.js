// Serbest post: şablonda olmayan bir içerik için kitin parçalarını dizerek kurulan görsel (tek ya da çok sayfalı).
// Tasarımcı yalnız hangi parçanın hangi sırayla geleceğini seçer; yerleşim kitin kuralı:
// logo üstte, ortalı dikey ritim, ana içerik ortada toplanır, sondaki bilgi satırı ve düğme alta oturur,
// çok sayfada en alta sayfa noktaları gelir. Aralıklar kitteki şablonlardan (ör. etiket → dev başlık 44 px).
import { esc, zengin, baslik, satir, bosluk, tuval, kaydir, fotoYuva, fotoZemin, qr, kisi, EM_DUZ, IPUCU_KALIN } from './ortak.js';
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
    ciz: p => {
      const s = satirlar(p.metin).slice(0, 3).map(x => { const m = x.match(/^(\S+)\s*(.*)$/); return `<div><b>${esc(m?.[1] ?? x)}</b><small>${esc(m?.[2] ?? '')}</small></div>`; });
      return `<div class="stat-y" style="grid-template-columns:repeat(${Math.max(1, s.length)},1fr)">${s.join('')}</div>`;
    },
  },
  alinti: {
    ad: 'Alıntı', alanlar: [{ ad: 'metin', tur: 'uzun', max: 140, etiket: 'Söz' }, { ad: 'kaynak', tur: 'kisa', max: 40, etiket: 'Kimin sözü' }],
    ciz: p => `<p class="ince" data-sigdir="0.6" data-satir="serbest" style="font-size:62px;font-weight:600;color:var(--ink);line-height:1.25;letter-spacing:-.01em">"${esc(String(p.metin ?? '').trim()).replace(/\n/g, '<br>')}"</p>`
      + (p.kaynak?.trim() ? `${bosluk(22)}<span class="genis" style="font-size:24px">${esc(p.kaynak)}</span>` : ''),
  },
  liste: {
    ad: 'Liste', alanlar: [{ ad: 'metin', tur: 'uzun', max: 200, ipucu: 'Her satır bir madde. En fazla 5–6 madde.' }],
    ciz: p => `<div class="liste-y cam" style="padding:40px 50px;width:100%;box-sizing:border-box">${satirlar(p.metin).map(x => `<div>${esc(x)}</div>`).join('')}</div>`,
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
  kisi: {
    ad: 'Kişi', alanlar: [{ ad: 'gorev', tur: 'kisa', max: 22, etiket: 'Görev' }, { ad: 'ad', tur: 'kisa', max: 22, etiket: 'Ad Soyad' }, { ad: 'alt', tur: 'kisa', max: 34, etiket: 'Bölüm / kurum' }],
    foto: true,
    ciz: (p, v) => `<div style="width:fit-content">${kisi(v[`blok-${p.id}`], `blok-${p.id}`, p.gorev, p.ad, p.alt, 200)}</div>`,
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
  ikon: { ikon: 'Onay', metin: 'Ön bilgi gerekmez' }, foto: { oran: 'Yatay' }, galeri: { adet: '3' }, kisi: { gorev: 'Başkan', ad: 'Ad Soyad', alt: 'Bilgisayar Müh. · 3. sınıf' },
  kod: { metin: 'print("Merhaba BMT")' }, qr: { baglanti: '', metin: '' }, ayrac: {}, bilgi: { metin: '14 Ekim · 15.30 · Amfi 2' }, buton: { metin: 'Kayıt ol →' },
};

// Hazır başlangıçlar: iyi örnekleri tek tıkla başlatır (her biri kitin "tek ana görsel" kuralına uygun)
const p = (tur, ek = {}) => ({ tur, ...structuredClone(PARCA_ILK[tur]), ...ek });
export const BASLANGICLAR = {
  'Duyuru': [[p('hap'), p('dev', { metin: 'Kulüp odası\ntaşındı.' }), p('metin', { metin: 'Yeni yerimiz: Mühendislik Fakültesi,\nB blok, 214 numaralı oda.' }), p('bilgi', { metin: 'Hafta içi · 12.00–17.00' }), p('buton', { metin: 'Yol tarifi →' })]],
  'Alıntı': [[p('genis', { metin: 'Haftanın sözü' }), p('alinti'), p('ayrac'), p('bilgi', { metin: 'BMT Söyleşileri · 21 Ekim' })]],
  'Sayı': [[p('hap', { metin: 'Hackathon' }), p('rakam', { metin: '48', alt: 'Saat kaldı' }), p('metin', { metin: 'Başvurular **cuma 23.59**\'da kapanıyor.' }), p('buton', { metin: 'Başvur →' })]],
  'Kişi tanıtımı': [[p('genis', { metin: 'Ekibe hoş geldin' }), p('kisi', { gorev: 'Medya birimi' }), p('metin', { metin: 'Kulübün görsellerinden sorumlu.' })]],
  'İkonlu liste': [[p('baslik', { metin: 'Workshop\'a *gelmeden önce*' }), p('ikon', { ikon: 'Dizüstü', metin: 'Bilgisayarını getir' }), p('ikon', { ikon: 'Terminal', metin: 'Python 3 kurulu olsun' }), p('ikon', { ikon: 'Saat', metin: '15 dakika erken gel' }), p('bilgi', { metin: '14 Ekim · Amfi 2' })]],
  'Kod ipucu': [[p('hap', { metin: 'Python ipucu' }), p('baslik', { metin: 'Listeyi *tek satırda* ters çevir.' }), p('kod', { metin: 'sayilar = [1, 2, 3]\nprint(sayilar[::-1])  # [3, 2, 1]' })]],
  '3 sayfalık anlatım': [
    [p('hap', { metin: 'Rehber' }), p('dev', { metin: 'Git\'e 3 adımda\nbaşla.' }), p('metin', { metin: 'Kaydır, adım adım anlatalım.' })],
    [p('genis', { metin: 'Adım 1' }), p('baslik', { metin: 'Depoyu başlat' }), p('kod', { metin: 'git init' }), p('metin', { metin: 'Klasörü Git\'in takip ettiği bir depoya çevirir.' })],
    [p('genis', { metin: 'Adım 2 ve 3' }), p('baslik', { metin: 'Kaydet ve gönder' }), p('kod', { metin: 'git add .\ngit commit -m "ilk"\ngit push' }), p('buton', { metin: 'Kaydet ve paylaş →' })],
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
function halkalar(w, h) {
  const r = [160, 250, 340], op = [0.4, 0.28, 0.18];
  const daire = (cx, cy) => r.map((x, i) => `<circle cx="${cx}" cy="${cy}" r="${x}" stroke-opacity="${op[i]}"/>`).join('');
  return `<svg class="halka" viewBox="0 0 ${w} ${h}" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true">${daire(w, 0)}${daire(0, h)}</svg>`;
}
const ORT_FOTO = '<div class="ort" style="background:linear-gradient(to top,#14123A 10%,rgba(20,18,58,.42) 45%,rgba(20,18,58,.58))"></div>';

// İki parça arasındaki boşluk (kitteki şablonlardan)
function aralik(a, b) {
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
    if (i) html += bosluk(aralik(parcalar[i - 1].tur, x.tur));
    if (x.tur === 'ikon') {
      let j = i; while (j + 1 < parcalar.length && parcalar[j + 1].tur === 'ikon') j++;
      html += `<div style="display:grid;gap:28px;justify-items:start">${parcalar.slice(i, j + 1).map(y => PARCALAR.ikon.ciz(y, v, b)).join('')}</div>`;
      i = j; continue;
    }
    html += PARCALAR[x.tur].ciz(x, v, b);
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
  denetimDegerleri: ZEMINLER.filter(z => z !== 'Sade').map(z => ({ zemin: z })),
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
    let k = parcalar.length;                     // sondaki bilgi satırı ve düğme alt çapa olur
    while (k > 0 && ['bilgi', 'buton'].includes(parcalar[k - 1].tur)) k--;
    if (k === 0) k = parcalar.length;            // hepsi alt çapaysa ortada kalsın
    const ana = parcalar.slice(0, k), alt = parcalar.slice(k);
    const noktalar = hepsi.length > 1 ? `${alt.length ? bosluk(40) : ''}${kaydir(sayfaNo + 1, hepsi.length)}` : '';
    const z = ZEMINLER.includes(v.zemin) ? v.zemin : 'Sade';
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
