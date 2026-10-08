// Etkinlik ailesi: ETU-BMT-Kimlik/uretim/aile_a2.py'nin birebir karşılığı (23 şablon).
// Örnek içerik (ornek) Python'daki örnekle aynıdır: birebirlik testi bu örnekle karşılaştırır.
// seri: birlikte kaydedilen sayfalar (carousel); grup: aynı içeriğin varyantları (yaka kartı rolleri).
import { esc, zengin, baslik, satir, bosluk, varsa, dolu, tuval, kaydir, fotoYuva, fotoZemin, qr, TARIH, IPUCU_KALIN, IPUCU_BASLIK } from './ortak.js';

const P = [1080, 1440], S = [1080, 1920], A4Y = [1123, 794], YK = [756, 1058], SAHNE = [1920, 1080];
const GECE = '#14123A', LAC = '#262261', ACIK = '#77ACD4', TURK = '#35C9C1', BEYAZ = '#FFFFFF';
const BAS = "Python'a\nsıfırdan\ngiriş.";
const ETKINLIK = "Python'a sıfırdan giriş";

// Tam ekran fotoğrafın üstündeki Gece katmanı (yazı okunsun)
const ORT = `<div class="ort" style="background:linear-gradient(to top,${GECE} 28%,rgba(20,18,58,.2) 62%,rgba(20,18,58,.35))"></div>`;
// Fotoğraf zemini üstünde yazı her yüzde beyaz
const BEYAZ_YAZI = (ic, soluk = true) => `<div style="color:#fff;--ink:#fff;--c2:${ACIK};--vurgu:${TURK};${soluk ? '--soluk:rgba(255,255,255,.78);' : ''}display:contents">${ic}</div>`;
const BEYAZ_DEV = 'color:#fff;background:none;-webkit-text-fill-color:#fff';

// Akış satırı: "15.30 Kurulum ve tanışma" → saat + açıklama
const akisSatirlari = t => String(t ?? '').split('\n').map(s => s.trim()).filter(Boolean)
  .map(s => { const m = s.match(/^(\S+)\s+(.*)$/); return m ? `<div><time>${esc(m[1])}</time><span>${esc(m[2])}</span></div>` : `<div><time></time><span>${esc(s)}</span></div>`; }).join('');
const maddeler = t => String(t ?? '').split('\n').map(s => s.trim()).filter(Boolean).map(s => `<div>${esc(s)}</div>`).join('');

// ---------------------------------------------------------------- carousel alanları (4 sayfa ortak)
const CAROUSEL = { id: 'carousel', ad: "Ayrıntı carousel'i" };
const C_ALAN = {
  hap: { ad: 'hap', etiket: 'Etiket', tur: 'kisa', max: 26, ornek: 'Workshop' },
  baslik: { ad: 'baslik', etiket: 'Kapak başlığı', tur: 'uzun', max: 40, ornek: BAS, ipucu: IPUCU_BASLIK },
  vurgu: { ad: 'vurgu', etiket: 'Son kelime turkuaz', tur: 'secim', ornek: true },
  kapak: { ad: 'kapak', etiket: 'Kapak açıklaması', tur: 'uzun', max: 70, ornek: 'Program, eğitmen ve hazırlık listesi içeride.' },
  akis: { ad: 'akis', etiket: 'Program akışı', tur: 'uzun', max: 260, satir: 5, ornek: '15.30 Kurulum ve tanışma\n15.45 Değişkenler ve türler\n16.30 Ara\n16.45 Koşullar ve döngüler\n17.15 İlk küçük proje', ipucu: 'Her satır: saat, boşluk, açıklama. En fazla 5–6 satır.' },
  foto: { ad: 'foto', etiket: 'Eğitmen fotoğrafı', tur: 'foto' },
  egitmen: { ad: 'egitmen', etiket: 'Eğitmen adı', tur: 'kisa', max: 26, ornek: 'Ad Soyad' },
  unvan: { ad: 'unvan', etiket: 'Unvan', tur: 'kisa', max: 30, ornek: 'Unvan' },
  kurum: { ad: 'kurum', etiket: 'Kurum', tur: 'kisa', max: 24, ornek: 'Kurum' },
  hazirlik: { ad: 'hazirlik', etiket: 'Hazırlık listesi', tur: 'uzun', max: 220, satir: 5, ornek: 'Bilgisayarın (Windows, macOS ya da Linux)\nŞarj aleti\nPython 3 kurulu olsun\nKuramayan 15 dakika erken gelsin\nÖn bilgi gerekmez', ipucu: 'Her satır bir madde. En fazla 5 madde.' },
  kayit: { ad: 'kayit', etiket: 'Kayıt notu', tur: 'uzun', max: 70, ornek: "Kontenjan 40 kişi.\nKayıt 13 Ekim'de kapanır." },
  qr: { ad: 'qr', etiket: 'Kayıt bağlantısı (QR olur)', tur: 'kisa', max: 200, ornek: '', ipucu: 'Boş bırakırsan QR yerine yer tutucu çıkar.' },
};

// ---------------------------------------------------------------- teşekkür alanları (2 sayfa ortak)
const TESEKKUR = { id: 'tesekkur', ad: 'Teşekkür' };
const T_ALAN = {
  baslik: { ad: 'baslik', etiket: 'Etkinlik adı', tur: 'kisa', max: 32, ornek: ETKINLIK },
  foto1: { ad: 'foto1', etiket: 'Fotoğraf 1 (büyük)', tur: 'foto' },
  foto2: { ad: 'foto2', etiket: 'Fotoğraf 2', tur: 'foto' },
  foto3: { ad: 'foto3', etiket: 'Fotoğraf 3', tur: 'foto' },
  s1: { ad: 's1', etiket: 'Sayı 1', tur: 'kisa', max: 4, ornek: '38' }, s1ad: { ad: 's1ad', etiket: 'Ne?', tur: 'kisa', max: 14, ornek: 'katılımcı' },
  s2: { ad: 's2', etiket: 'Sayı 2', tur: 'kisa', max: 4, ornek: '2' }, s2ad: { ad: 's2ad', etiket: 'Ne?', tur: 'kisa', max: 14, ornek: 'saat' },
  s3: { ad: 's3', etiket: 'Sayı 3', tur: 'kisa', max: 4, ornek: '38' }, s3ad: { ad: 's3ad', etiket: 'Ne?', tur: 'kisa', max: 14, ornek: 'ilk program' },
  not: { ad: 'not', etiket: 'Kapanış notu', tur: 'uzun', max: 80, ornek: "Gelen herkese teşekkürler.\nSunum ve kodlar bio'daki bağlantıda." },
};

// ---------------------------------------------------------------- yaka kartı (3 rol, aynı içerik)
const YAKA = { id: 'yaka', ad: 'Yaka kartı', secenek: 'Rol' };
const yakaAlan = [
  { ad: 'hap', etiket: 'Etiket', tur: 'kisa', max: 20, ornek: 'Workshop' },
  { ad: 'etkinlik', etiket: 'Etkinlik adı', tur: 'uzun', max: 40, ornek: "Python'a\nsıfırdan giriş" },
  { ad: 'bilgi', etiket: 'Tarih · yer', tur: 'kisa', max: 34, ornek: '14 Ekim 2026 · Amfi 2' },
  { ad: 'ad', etiket: 'Ad Soyad', tur: 'kisa', max: 22, ornek: 'Ad Soyad' },
  { ad: 'alt', etiket: 'Bölüm · sınıf', tur: 'kisa', max: 34, ornek: 'Bilgisayar Müh. · 2. sınıf' },
];
function yaka(id, rol, renk, yazi) {
  return {
    id, ad: `Yaka kartı · ${rol}`, aile: 'Etkinlik', w: YK[0], h: YK[1], yuzler: ['a', 'b'], grup: YAKA, varyant: rol,
    ne: 'Basılı yaka kartı, 100 × 140 mm. Rol alttaki renk bandından okunur.',
    alanlar: yakaAlan,
    ciz: (v, L, y) => tuval(...YK, `${L(64)}${bosluk(70)}<span class="hap" style="font-size:24px">${esc(v.hap)}</span>
${bosluk(22)}<div class="dev-y" data-sigdir="0.6" style="font-size:84px">${zengin(v.etkinlik)}</div>${bosluk(16)}
<span style="font:400 24px Lexend;color:var(--soluk)">${esc(v.bilgi)}</span><div class="esn"></div><div class="ayrac-y"></div>${bosluk(44)}
<div data-sigdir="0.6" style="font:700 80px/1.05 Lexend;letter-spacing:-.03em">${esc(v.ad)}</div>${bosluk(12)}
<span style="font:300 26px Lexend;color:var(--soluk)">${esc(v.alt)}</span>${bosluk(150)}`, y,
      { pad: '60px 64px', ek: `<div class="bant-y" style="background:${renk};color:${yazi};z-index:2">${esc(rol)}<span>ETÜ BMT</span></div>` }),
  };
}

export const ETKINLIK_SABLONLARI = [
  {
    id: 'duyuru', ad: 'Etkinlik duyurusu', aile: 'Etkinlik', w: P[0], h: P[1], yuzler: ['a', 'b'],
    ne: 'Workshop, söyleşi, gezi: ilk duyuru. Ana görsel dev başlık.',
    alanlar: [
      { ad: 'hap', etiket: 'Etiket', tur: 'kisa', max: 26, ornek: 'Workshop' },
      { ad: 'baslik', etiket: 'Dev başlık', tur: 'uzun', max: 40, ornek: BAS, ipucu: IPUCU_BASLIK },
      { ad: 'vurgu', etiket: 'Son kelime turkuaz', tur: 'secim', ornek: true },
      { ad: 'aciklama', etiket: 'Açıklama', tur: 'uzun', max: 80, ornek: 'İlk programını birlikte yazalım.\nÖn bilgi gerekmez.', ipucu: IPUCU_KALIN },
      ...TARIH(['14 Ekim Salı', '15.30', 'Amfi 2']),
      { ad: 'buton', etiket: 'Düğme', tur: 'kisa', max: 18, ornek: 'Kayıt ol →' },
    ],
    ciz: (v, L, y) => tuval(...P, `${L()}<div class="esn"></div>`
      + varsa(v.hap, `<span class="hap">${esc(v.hap)}</span>${bosluk(44)}`)
      + `<h2 class="dev-y" data-sigdir="0.55">${baslik(v.baslik, v.vurgu)}</h2>`
      + varsa(v.aciklama, `${bosluk(34)}<p class="ince">${zengin(v.aciklama)}</p>`)
      + `<div class="esn"></div>${satir([v.tarih, v.saat, v.yer])}`
      + varsa(v.buton, `${bosluk(40)}<span class="buton">${esc(v.buton)}</span>`), y),
  },
  {
    id: 'duyuru-story', ad: 'Duyuru story', aile: 'Etkinlik', w: S[0], h: S[1], yuzler: ['a', 'b'],
    ne: "Duyurunun story hâli. Üst ve alt 250 px boş; bağlantı çıkartmasının yeri işaretli.",
    alanlar: [
      { ad: 'hap', etiket: 'Etiket', tur: 'kisa', max: 26, ornek: 'Workshop' },
      { ad: 'baslik', etiket: 'Dev başlık', tur: 'uzun', max: 40, ornek: BAS, ipucu: IPUCU_BASLIK },
      { ad: 'vurgu', etiket: 'Son kelime turkuaz', tur: 'secim', ornek: true },
      ...TARIH(['14 Ekim Salı', '15.30', 'Amfi 2']),
      { ad: 'cikartma', etiket: 'Bağlantı çıkartması yerini göster', tur: 'secim', ornek: true, ipucu: "Instagram'da bağlantı çıkartmasını bu kutunun üstüne koy." },
    ],
    ciz: (v, L, y) => tuval(...S, `${L()}<div class="esn"></div>`
      + varsa(v.hap, `<span class="hap">${esc(v.hap)}</span>${bosluk(44)}`)
      + `<h2 class="dev-y" data-sigdir="0.55" style="font-size:156px">${baslik(v.baslik, v.vurgu)}</h2>${bosluk(40)}${satir([v.tarih, v.saat, v.yer], 'buyuk')}`
      + (v.cikartma ? `${bosluk(70)}<div class="cam" style="width:620px;height:150px;display:grid;place-items:center;border-style:dashed;font:400 26px Lexend;color:var(--soluk)">bağlantı çıkartması buraya</div>` : ''), y, { cls: 'story' }),
  },
  // ---------------- carousel: 4 sayfa birlikte
  {
    id: 'carousel-kapak', ad: 'Carousel · kapak', aile: 'Etkinlik', w: P[0], h: P[1], yuzler: ['a', 'b'], seri: CAROUSEL,
    ne: 'Kapak, program akışı, eğitmen ve hazırlık: dört sayfa birlikte kaydedilir.',
    alanlar: [C_ALAN.hap, C_ALAN.baslik, C_ALAN.vurgu, C_ALAN.kapak],
    ciz: (v, L, y) => tuval(...P, `${L()}<div class="esn"></div>` + varsa(v.hap, `<span class="hap">${esc(v.hap)}</span>${bosluk(44)}`)
      + `<h2 class="dev-y" data-sigdir="0.55">${baslik(v.baslik, v.vurgu)}</h2>` + varsa(v.kapak, `${bosluk(34)}<p class="ince">${zengin(v.kapak)}</p>`)
      + `<div class="esn"></div>${kaydir(1, 4)}`, y),
  },
  {
    id: 'carousel-akis', ad: 'Carousel · akış', aile: 'Etkinlik', w: P[0], h: P[1], yuzler: ['a', 'b'], seri: CAROUSEL,
    alanlar: [C_ALAN.akis],
    ciz: (v, L, y) => tuval(...P, `${L()}${bosluk(90)}<span class="genis">Program</span>${bosluk(20)}<h2 class="bas-o">Akış</h2>
${bosluk(56)}<div class="akis-y cam">${akisSatirlari(v.akis)}</div>
<div class="esn"></div>${kaydir(2, 4)}`, y),
  },
  {
    id: 'carousel-egitmen', ad: 'Carousel · eğitmen', aile: 'Etkinlik', w: P[0], h: P[1], yuzler: ['a', 'b'], seri: CAROUSEL,
    alanlar: [C_ALAN.foto, C_ALAN.egitmen, C_ALAN.unvan, C_ALAN.kurum],
    ciz: (v, L, y) => tuval(...P, `${L()}${bosluk(64)}${fotoYuva(v.foto, 'foto', 'width:600px;height:660px')}<div class="esn"></div>
<span class="genis">Eğitmen</span>${bosluk(20)}<h2 class="bas-o" data-sigdir="0.6">${esc(v.egitmen)}</h2>
<p class="ince" style="font-size:32px;margin-top:12px">${[esc(String(v.unvan ?? '').trim()), dolu(v.kurum) ? `<b>${esc(v.kurum.trim())}</b>` : ''].filter(Boolean).join(' · ')}</p>${bosluk(40)}${kaydir(3, 4)}`, y),
  },
  {
    id: 'carousel-hazirlik', ad: 'Carousel · hazırlık', aile: 'Etkinlik', w: P[0], h: P[1], yuzler: ['a', 'b'], seri: CAROUSEL,
    alanlar: [C_ALAN.hazirlik, C_ALAN.kayit, C_ALAN.qr],
    ciz: (v, L, y) => tuval(...P, `${L()}${bosluk(90)}<span class="genis">Hazırlık</span>${bosluk(20)}<h2 class="bas-o">Yanında getir</h2>
${bosluk(56)}<div class="liste-y cam" style="padding:44px 50px;width:100%;font-size:40px;gap:30px">${maddeler(v.hazirlik)}</div>
<div class="esn"></div><div style="display:flex;gap:44px;align-items:center;text-align:left">${qr(v.qr)}
<div style="display:grid;gap:14px"><span class="genis" style="letter-spacing:.3em">Kayıt</span><div style="font:600 42px/1.2 Lexend">${zengin(v.kayit)}</div></div></div>
${bosluk(50)}${kaydir(4, 4)}`, y),
  },
  {
    id: 'konusmaci', ad: 'Konuşmacı tanıtımı', aile: 'Etkinlik', w: P[0], h: P[1], yuzler: ['a', 'b'],
    ne: 'Söyleşi ya da eğitmen. Ana görsel fotoğraf.',
    alanlar: [
      { ad: 'foto', etiket: 'Fotoğraf', tur: 'foto' },
      { ad: 'etiket', etiket: 'Küçük başlık', tur: 'kisa', max: 20, ornek: 'Söyleşi' },
      { ad: 'ad', etiket: 'Ad Soyad', tur: 'kisa', max: 26, ornek: 'Ad Soyad' },
      { ad: 'unvan', etiket: 'Unvan', tur: 'kisa', max: 30, ornek: 'Yazılım Mühendisi' },
      { ad: 'kurum', etiket: 'Kurum', tur: 'kisa', max: 24, ornek: 'Kurum' },
      { ad: 'konu', etiket: 'Konu', tur: 'uzun', max: 70, ornek: 'Yapay zekâ çağında yazılım mühendisi olmak' },
      ...TARIH(['21 Ekim', '14.00', 'Konferans Salonu']),
    ],
    ciz: (v, L, y) => tuval(...P, `${L()}${bosluk(64)}${fotoYuva(v.foto, 'foto', 'width:620px;height:640px')}<div class="esn"></div>`
      + varsa(v.etiket, `<span class="genis">${esc(v.etiket)}</span>${bosluk(20)}`)
      + `<h2 class="bas-o" data-sigdir="0.6">${esc(v.ad)}</h2>`
      + ((dolu(v.unvan) || dolu(v.kurum)) ? `<p class="ince" style="font-size:32px;margin-top:12px">${[esc(String(v.unvan ?? '').trim()), dolu(v.kurum) ? `<b>${esc(v.kurum.trim())}</b>` : ''].filter(Boolean).join(' · ')}</p>` : '')
      + varsa(v.konu, `${bosluk(30)}<p class="ince" style="font-size:34px">"${esc(v.konu.trim())}"</p>`)
      + `${bosluk(30)}${satir([v.tarih, v.saat, v.yer])}`, y),
  },
  {
    id: 'buyuk-etkinlik', ad: 'Büyük etkinlik', aile: 'Etkinlik', w: P[0], h: P[1], yuzler: ['a', 'b'],
    ne: "Hackathon, zirve: üstte etkinliğe özel konsept görseli (Gemini'de üretilir), yazı altta.",
    alanlar: [
      { ad: 'konsept', etiket: 'Konsept görseli', tur: 'foto', ipucu: 'Görselin alt kısmı zemine erir; önemli kısmı üstte olsun.' },
      { ad: 'hap', etiket: 'Etiket', tur: 'kisa', max: 30, ornek: '24 saat · 15–16 Kasım' },
      { ad: 'baslik', etiket: 'Dev başlık', tur: 'uzun', max: 30, ornek: 'Hackathon\nErzurum', ipucu: IPUCU_BASLIK },
      { ad: 'aciklama', etiket: 'Açıklama', tur: 'uzun', max: 70, ornek: 'Takımını kur, fikrini 24 saatte ürüne çevir.' },
      { ad: 'buton', etiket: 'Düğme', tur: 'kisa', max: 18, ornek: 'Başvur →' },
    ],
    ciz: (v, L, y) => tuval(...P, `${L()}<div class="esn"></div>` + varsa(v.hap, `<span class="hap">${esc(v.hap)}</span>${bosluk(30)}`)
      + `<h2 class="dev-y" data-sigdir="0.55" style="font-size:150px">${baslik(v.baslik)}</h2>`
      + varsa(v.aciklama, `${bosluk(26)}<p class="ince" style="font-size:34px">${zengin(v.aciklama)}</p>`)
      + varsa(v.buton, `${bosluk(40)}<span class="buton">${esc(v.buton)}</span>`), y,
      { ek: v.konsept?.src ? `<div class="konsept dolu" data-foto="konsept" style="height:1010px"><img class="foto" src="${v.konsept.src}" alt="" draggable="false" style="object-position:${v.konsept.px}% ${v.konsept.py}%;transform:scale(${v.konsept.zoom});transform-origin:${v.konsept.px}% ${v.konsept.py}%"></div>`
        : `<div class="konsept" style="height:1010px"><span>Konsept görseli · Gemini<br>ör. Palandöken'de gece kodlayanlar</span></div>` }),
  },
  {
    id: 'son-gun', ad: 'Son gün (alarm)', aile: 'Etkinlik', w: P[0], h: P[1], yuzler: ['alarm'],
    ne: 'Yalnız acil duyuruda: son gün, yarın, başladı. Turkuaz zemin.',
    alanlar: [
      { ad: 'hap', etiket: 'Etkinlik adı', tur: 'kisa', max: 30, ornek: ETKINLIK },
      { ad: 'baslik', etiket: 'Dev başlık', tur: 'uzun', max: 16, ornek: 'Son\ngün.', ipucu: 'En fazla iki kısa kelime.' },
      { ad: 'aciklama', etiket: 'Açıklama', tur: 'uzun', max: 80, ornek: "Kayıtlar bu gece **23.59**'da kapanıyor.\n**6 yer** kaldı.", ipucu: IPUCU_KALIN },
      { ad: 'buton', etiket: 'Düğme', tur: 'kisa', max: 18, ornek: 'Kayıt ol →' },
    ],
    ciz: (v, L, y) => tuval(...P, `${L()}<div class="esn"></div>`
      + varsa(v.hap, `<span class="hap">${esc(v.hap)}</span>${bosluk(40)}`)
      + `<h2 class="dev-y" data-sigdir="0.45" style="font-size:290px;line-height:.98">${baslik(v.baslik)}</h2>`
      + varsa(v.aciklama, `${bosluk(40)}<p class="ince">${zengin(v.aciklama)}</p>`)
      + `<div class="esn"></div>` + varsa(v.buton, `<span class="buton">${esc(v.buton)}</span>`), y),
  },
  {
    id: 'yarin', ad: 'Geri sayım (story)', aile: 'Etkinlik', w: S[0], h: S[1], yuzler: ['a', 'b'],
    ne: 'Sakin hatırlatma: dev rakam.',
    alanlar: [
      { ad: 'etkinlik', etiket: 'Etkinlik adı', tur: 'kisa', max: 30, ornek: ETKINLIK },
      { ad: 'rakam', etiket: 'Kalan gün', tur: 'kisa', max: 2, ornek: '1' },
      { ad: 'alt', etiket: 'Rakamın altı', tur: 'kisa', max: 14, ornek: 'Gün kaldı' },
      ...TARIH(['Yarın', '15.30', 'Amfi 2']),
    ],
    ciz: (v, L, y) => tuval(...S, `${L()}<div class="esn"></div>` + varsa(v.etkinlik, `<span class="genis">${esc(v.etkinlik)}</span>${bosluk(40)}`)
      + `<p class="rakam" data-sigdir="0.6">${esc(v.rakam)}</p>${bosluk(40)}<span class="genis" style="font-size:46px;letter-spacing:.5em;margin-right:-.5em">${esc(v.alt)}</span>
<div class="esn"></div>${satir([v.tarih, v.saat, v.yer], 'buyuk')}`, y, { cls: 'story' }),
  },
  {
    id: 'bugun', ad: 'Bugün (alarm story)', aile: 'Etkinlik', w: S[0], h: S[1], yuzler: ['alarm'],
    ne: 'Etkinlik günü sabahı. Turkuaz zemin.',
    alanlar: [
      { ad: 'hap', etiket: 'Etkinlik adı', tur: 'kisa', max: 30, ornek: ETKINLIK },
      { ad: 'baslik', etiket: 'Dev başlık', tur: 'uzun', max: 12, ornek: 'Bugün.' },
      { ad: 'saat', etiket: 'Saat', tur: 'kisa', max: 8, ornek: '15.30' },
      { ad: 'yer', etiket: 'Yer', tur: 'kisa', max: 26, ornek: 'Amfi 2' },
      { ad: 'aciklama', etiket: 'Hatırlatma', tur: 'uzun', max: 60, ornek: 'Bilgisayarını şarj etmeyi unutma.' },
    ],
    ciz: (v, L, y) => tuval(...S, `${L()}<div class="esn"></div>` + varsa(v.hap, `<span class="hap">${esc(v.hap)}</span>${bosluk(40)}`)
      + `<h2 class="dev-y" data-sigdir="0.5" style="font-size:250px">${baslik(v.baslik)}</h2>${bosluk(40)}${satir([v.saat, v.yer], 'buyuk')}
<div class="esn"></div>` + varsa(v.aciklama, `<p class="ince">${zengin(v.aciklama)}</p>`), y, { cls: 'story' }),
  },
  {
    id: 'ertelendi', ad: 'Ertelendi / değişiklik', aile: 'Etkinlik', w: P[0], h: P[1], yuzler: ['a', 'b'],
    ne: 'Erteleme, iptal, yer değişikliği. Eski tarih üstü çizili, yenisi kutuda.',
    alanlar: [
      { ad: 'etkinlik', etiket: 'Etkinlik adı', tur: 'kisa', max: 30, ornek: ETKINLIK },
      { ad: 'baslik', etiket: 'Başlık', tur: 'kisa', max: 14, ornek: 'Ertelendi.', ipucu: 'Ör. Ertelendi. · İptal. · Yer değişti.' },
      { ad: 'eski', etiket: 'Eski tarih (üstü çizili)', tur: 'kisa', max: 30, ornek: '14 Ekim Salı · 15.30' },
      { ad: 'yeniEtiket', etiket: 'Kutunun etiketi', tur: 'kisa', max: 16, ornek: 'Yeni tarih' },
      ...TARIH(['21 Ekim Salı', '15.30', 'Amfi 2']),
      { ad: 'aciklama', etiket: 'Açıklama', tur: 'uzun', max: 70, ornek: 'Kaydın geçerli, yeniden kayıt olmana gerek yok.' },
    ],
    ciz: (v, L, y) => tuval(...P, `${L()}<div class="esn"></div>` + varsa(v.etkinlik, `<span class="genis">${esc(v.etkinlik)}</span>${bosluk(36)}`)
      + `<h2 class="dev-y" data-sigdir="0.6" style="font-size:150px">${baslik(v.baslik, false, true)}</h2>${bosluk(60)}`
      + varsa(v.eski, `<span class="eski-y">${esc(v.eski)}</span>${bosluk(24)}`)
      + `<div class="cam" style="padding:30px 50px;display:grid;gap:14px"><span class="hap" style="justify-self:center">${esc(v.yeniEtiket)}</span>${satir([v.tarih, v.saat, v.yer], 'buyuk')}</div>
<div class="esn"></div>` + varsa(v.aciklama, `<p class="ince" style="font-size:32px">${zengin(v.aciklama)}</p>`), y),
  },
  {
    id: 'canli', ad: 'Şu an canlı (story)', aile: 'Etkinlik', w: S[0], h: S[1], yuzler: ['foto'],
    ne: 'Etkinlik sırasında: tam ekran fotoğraf, altta koyu katman.',
    alanlar: [
      { ad: 'foto', etiket: 'Fotoğraf (tam ekran)', tur: 'foto' },
      { ad: 'hap', etiket: 'Etiket', tur: 'kisa', max: 20, ornek: 'Şu an canlı' },
      { ad: 'baslik', etiket: 'Başlık', tur: 'uzun', max: 40, ornek: BAS, ipucu: IPUCU_BASLIK },
      { ad: 'vurgu', etiket: 'Son kelime turkuaz', tur: 'secim', ornek: true },
      { ad: 'aciklama', etiket: 'Açıklama', tur: 'uzun', max: 70, ornek: "Amfi 2'deyiz. Gelemeyenler için kayıt YouTube'da." },
    ],
    ciz: (v, L, y) => tuval(...S, BEYAZ_YAZI(`${L()}<div class="esn"></div>
<span class="hap"><i class="canli-nokta"></i>${esc(v.hap)}</span>${bosluk(40)}<h2 class="dev-y" data-sigdir="0.55" style="font-size:132px;${BEYAZ_DEV}">${baslik(v.baslik, v.vurgu)}</h2>
` + varsa(v.aciklama, `${bosluk(30)}<p class="ince">${zengin(v.aciklama)}</p>`)), y,
      { cls: 'story', doku: false, ek: fotoZemin(v.foto, 'foto') + ORT }),
  },
  {
    id: 'reels-kapak', ad: 'Reels kapağı', aile: 'Etkinlik', w: S[0], h: S[1], yuzler: ['foto'],
    ne: 'Yazı ve logo, profil ızgarasında görünen ortadaki 3:4 alanda.',
    alanlar: [
      { ad: 'foto', etiket: 'Fotoğraf / video karesi', tur: 'foto' },
      { ad: 'hap', etiket: 'Etiket', tur: 'kisa', max: 16, ornek: 'Reels' },
      { ad: 'baslik', etiket: 'Başlık', tur: 'uzun', max: 40, ornek: '5 dakikada\nPython kurulumu', ipucu: 'İki satır: ikinci satır turkuaz olur.' },
    ],
    ciz: (v, L, y) => tuval(...S, BEYAZ_YAZI(`${L(80)}<div class="esn"></div>
<span class="hap">${esc(v.hap)}</span>${bosluk(30)}<h2 class="dev-y" data-sigdir="0.55" data-satir="serbest" style="font-size:120px;${BEYAZ_DEV}">${baslik(v.baslik, 'satir')}</h2>`, false), y,
      { cls: 'story', pad: '330px 90px', doku: false, ek: fotoZemin(v.foto, 'foto') + ORT }),
  },
  // ---------------- teşekkür: 2 sayfa birlikte
  {
    id: 'tesekkur-galeri', ad: 'Teşekkür · galeri', aile: 'Etkinlik', w: P[0], h: P[1], yuzler: ['a', 'b'], seri: TESEKKUR,
    ne: 'Etkinlik sonrası: üç fotoğraf ve rakamlar, iki sayfa birlikte kaydedilir.',
    alanlar: [T_ALAN.baslik, T_ALAN.foto1, T_ALAN.foto2, T_ALAN.foto3],
    ciz: (v, L, y) => tuval(...P, `${L()}${bosluk(60)}<span class="genis">Teşekkürler</span>${bosluk(18)}
<h2 class="bas-o" data-sigdir="0.6" style="font-size:76px">${esc(v.baslik)}</h2>${bosluk(50)}
<div class="galeri-y">${fotoYuva(v.foto1, 'foto1')}${fotoYuva(v.foto2, 'foto2')}${fotoYuva(v.foto3, 'foto3')}</div>${bosluk(40)}${kaydir(1, 2)}`, y),
  },
  {
    id: 'tesekkur-rakamlar', ad: 'Teşekkür · rakamlar', aile: 'Etkinlik', w: P[0], h: P[1], yuzler: ['a', 'b'], seri: TESEKKUR,
    alanlar: [T_ALAN.s1, T_ALAN.s1ad, T_ALAN.s2, T_ALAN.s2ad, T_ALAN.s3, T_ALAN.s3ad, T_ALAN.not],
    ciz: (v, L, y) => tuval(...P, `${L()}<div class="esn"></div><span class="genis">Rakamlarla</span>${bosluk(60)}
<div class="stat-y">${[[v.s1, v.s1ad], [v.s2, v.s2ad], [v.s3, v.s3ad]].filter(([a]) => dolu(a)).map(([a, b]) => `<div><b>${esc(a)}</b><small>${esc(b)}</small></div>`).join('')}</div>
${bosluk(70)}<p class="ince">${zengin(v.not)}</p><div class="esn"></div>${kaydir(2, 2)}`, y),
  },
  {
    id: 'kazananlar', ad: 'Kazananlar', aile: 'Etkinlik', w: P[0], h: P[1], yuzler: ['a', 'b'],
    ne: 'Yarışma sonucu: kürsü, birinci vurgu renginde.',
    alanlar: [
      { ad: 'hap', etiket: 'Etiket', tur: 'kisa', max: 20, ornek: 'Kazananlar' },
      { ad: 'baslik', etiket: 'Yarışma adı', tur: 'kisa', max: 26, ornek: "BMT Hackathon '26" },
      { ad: 't1', etiket: '1. takım', tur: 'uzun', max: 24, ornek: 'Kar\nTanesi', ipucu: 'Uzun adı iki satıra böl.' },
      { ad: 'k1', etiket: '1. takım kişi', tur: 'kisa', max: 10, ornek: '3 kişi' },
      { ad: 't2', etiket: '2. takım', tur: 'uzun', max: 24, ornek: 'Null\nPointer' },
      { ad: 'k2', etiket: '2. takım kişi', tur: 'kisa', max: 10, ornek: '4 kişi' },
      { ad: 't3', etiket: '3. takım', tur: 'uzun', max: 24, ornek: 'Kuzey\nYıldızı' },
      { ad: 'k3', etiket: '3. takım kişi', tur: 'kisa', max: 10, ornek: '4 kişi' },
    ],
    ciz: (v, L, y) => tuval(...P, `${L()}${bosluk(60)}<span class="hap">${esc(v.hap)}</span>${bosluk(30)}
<h2 class="bas-o" data-sigdir="0.6">${esc(v.baslik)}</h2><div class="esn"></div>
<div class="kursu-y"><div class="iki"><b>${zengin(v.t2)}</b><small>${esc(v.k2)}</small><div class="basamak">2</div></div>
<div class="bir"><b>${zengin(v.t1)}</b><small>${esc(v.k1)}</small><div class="basamak">1</div></div>
<div class="uc"><b>${zengin(v.t3)}</b><small>${esc(v.k3)}</small><div class="basamak">3</div></div></div>`, y, { pad: '84px 90px 0' }),
  },
  {
    id: 'sertifika', ad: 'Katılım sertifikası', aile: 'Etkinlik', w: A4Y[0], h: A4Y[1], yuzler: ['b', 'a'],
    toplu: { ad: 'ad', no: 'no', sayfaPt: [842, 595] },   // isim listesinden tek PDF (A4 yatay)
    ne: 'A4 yatay, yazdırılabilir. Her katılımcı için adı ve numarayı değiştir.',
    alanlar: [
      { ad: 'tur', etiket: 'Belge türü', tur: 'kisa', max: 26, ornek: 'Katılım sertifikası' },
      { ad: 'ad', etiket: 'Ad Soyad', tur: 'kisa', max: 28, ornek: 'Ad Soyad' },
      { ad: 'metin', etiket: 'Metin', tur: 'uzun', max: 200, ornek: '14 Ekim 2026 tarihinde düzenlenen "Python\'a Sıfırdan Giriş" workshop\'una katılarak 2 saatlik eğitimi tamamlamıştır.' },
      { ad: 'imza1', etiket: '1. imza', tur: 'kisa', max: 30, ornek: 'Yönetim Kurulu Başkanı' },
      { ad: 'imza2', etiket: '2. imza', tur: 'kisa', max: 30, ornek: 'Akademik Danışman' },
      { ad: 'no', etiket: 'Belge no', tur: 'kisa', max: 24, ornek: 'No: BMT-2026-0142' },
    ],
    ciz: (v, L, y) => tuval(...A4Y, `${L(64)}<div class="esn"></div><span class="genis" style="font-size:20px">${esc(v.tur)}</span>${bosluk(20)}
<div data-sigdir="0.6" style="font:700 84px/1.05 Lexend;letter-spacing:-.03em">${esc(v.ad)}</div>${bosluk(22)}
<p class="ince" style="font-size:22px;max-width:36em">${zengin(v.metin)}</p>
<div class="esn"></div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:60px;width:100%;font:400 17px Lexend;color:var(--soluk);text-align:left">
<div style="border-top:2px solid var(--cizgi);padding-top:12px">${esc(v.imza1)}</div><div style="border-top:2px solid var(--cizgi);padding-top:12px">${esc(v.imza2)}</div>
<div style="padding-top:12px;text-align:right;font-variant-numeric:tabular-nums">${esc(v.no)}</div></div>`, y, { pad: '64px 80px' }),
  },
  yaka('yaka-ekip', 'Ekip', TURK, GECE),
  yaka('yaka-katilimci', 'Katılımcı', ACIK, GECE),
  yaka('yaka-konusmaci', 'Konuşmacı', LAC, BEYAZ),
  {
    id: 'sahne', ad: 'Sahne ekranı (16:9)', aile: 'Etkinlik', w: SAHNE[0], h: SAHNE[1], yuzler: ['a', 'b'],
    ne: 'Projeksiyonda açılış ekranı.',
    alanlar: [
      { ad: 'hap', etiket: 'Etiket', tur: 'kisa', max: 20, ornek: 'Workshop' },
      { ad: 'baslik', etiket: 'Başlık', tur: 'uzun', max: 40, ornek: "Python'a sıfırdan giriş.", ipucu: 'Uzunsa kendiliğinden iki satıra iner.' },
      { ad: 'vurgu', etiket: 'Son kelime turkuaz', tur: 'secim', ornek: true },
      { ad: 'bilgi1', etiket: 'Bilgi 1', tur: 'kisa', max: 30, ornek: 'Wi-Fi: ETU-Misafir' },
      { ad: 'bilgi2', etiket: 'Bilgi 2', tur: 'kisa', max: 30, ornek: 'Kodlar: bmt.link/python' },
    ],
    ciz: (v, L, y) => tuval(...SAHNE, `${L(96)}<div class="esn"></div><span class="hap">${esc(v.hap)}</span>${bosluk(40)}
<h2 class="dev-y" data-sigdir="0.55" data-satir="serbest" style="font-size:180px">${baslik(v.baslik, v.vurgu)}</h2>${bosluk(40)}
<div class="esn"></div>${satir([v.bilgi1, v.bilgi2], 'buyuk')}`, y, { pad: '80px 120px' }),
  },
  {
    id: 'saygi', ad: 'Anma (saygı modu)', aile: 'Etkinlik', w: P[0], h: P[1], yuzler: ['saygi'],
    ne: '10 Kasım, 18 Mart, taziye. Renk, süs ve turkuaz kapanır.',
    alanlar: [
      { ad: 'tarih', etiket: 'Tarih', tur: 'kisa', max: 22, ornek: '10 Kasım 1938' },
      { ad: 'metin', etiket: 'Metin', tur: 'uzun', max: 120, ornek: "Cumhuriyetimizin kurucusu\nMustafa Kemal Atatürk'ü\nsaygı ve özlemle anıyoruz." },
    ],
    ciz: (v, L, y) => tuval(...P, `<div class="esn"></div><span class="genis" style="letter-spacing:.3em">${esc(v.tarih)}</span>${bosluk(50)}
<h2 data-sigdir="0.7" style="font:500 66px/1.3 Lexend;margin:0;text-wrap:balance">${zengin(v.metin)}</h2>
<div class="esn"></div><div style="opacity:.7;font-size:20px">${L(56)}</div>`, y),
  },
];
