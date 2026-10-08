// İçerik tarifleri: ETU-BMT-Kimlik/uretim/tarifler.py'nin birebir karşılığı (9 şablon).
// Stilleri css/sablon.css'in sonunda ("içerik tarifleri").
import { esc, zengin, baslik, satir, bosluk, varsa, tuval, kaydir, fotoYuva, EM_DUZ, IPUCU_BASLIK } from './ortak.js';

const P = [1080, 1440], S = [1080, 1920];
const KONUM = '<path d="M50 90 L26 54 A28 28 0 1 1 74 54 Z"/><circle cx="50" cy="38" r="10"/>';   // kit/03-ikon "konum"
const ik = (ic, px, sw = 7) => `<span class="ikon-dev"><svg width="${px}" height="${px}" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="${sw}" `
  + `stroke-linejoin="miter" stroke-linecap="square">${ic}</svg></span>`;

// ---------------------------------------------------------------- kod kartı renklendirme (Python benzeri diller)
// yorum → soluk (<s>), anahtar kelime ve metin → turkuaz (<b>), fonksiyon çağrısı → açık mavi (<u>)
const ANAHTAR = new Set('def return if elif else for while in not and or is import from as class try except finally with lambda yield pass break continue True False None global async await'.split(' '));
export function renklendir(kod) {
  return String(kod ?? '').split('\n').map(satirKod => {
    let cikti = '', i = 0;
    const kalan = () => satirKod.slice(i);
    while (i < satirKod.length) {
      let m;
      if ((m = kalan().match(/^#.*/))) cikti += `<s>${esc(m[0])}</s>`;
      else if ((m = kalan().match(/^("[^"]*"?|'[^']*'?)/))) cikti += `<b>${esc(m[0])}</b>`;
      else if ((m = kalan().match(/^[A-Za-z_ğüşıöçĞÜŞİÖÇ][\wğüşıöçĞÜŞİÖÇ]*/))) {
        const ad = m[0], sonra = satirKod.slice(i + ad.length);
        cikti += ANAHTAR.has(ad) ? `<b>${ad}</b>` : /^\s*\(/.test(sonra) ? `<u>${ad}</u>` : esc(ad);
      } else { m = [satirKod[i]]; cikti += esc(m[0]); }
      i += m[0].length;
    }
    return cikti;
  }).join('\n');
}

// "PZT Kulüp tanışma 18.00" → gün, etkinlik, saat (saat yoksa boş)
function gunler(t) {
  return String(t ?? '').split('\n').map(s => s.trim()).filter(Boolean).map(s => {
    const p = s.split(/\s+/), gun = p.shift(), saat = /^\d{1,2}[.:]\d{2}$/.test(p.at(-1) ?? '') ? p.pop() : '';
    return `<div><small>${esc(gun)}</small><span>${esc(p.join(' '))}</span><em>${esc(saat)}</em></div>`;
  }).join('');
}

// ---------------------------------------------------------------- quiz (soru + cevap birlikte)
const QUIZ = { id: 'quiz', ad: 'Quiz' };
const Q_ALAN = {
  etiket: { ad: 'etiket', etiket: 'Etiket', tur: 'kisa', max: 20, ornek: 'Quiz · Soru 3' },
  soru: { ad: 'soru', etiket: 'Soru', tur: 'uzun', max: 70, ornek: 'İlk bilgisayar\nprogramını kim yazdı?' },
  a: { ad: 'a', etiket: 'A şıkkı', tur: 'kisa', max: 30, ornek: 'Alan Turing' },
  b: { ad: 'b', etiket: 'B şıkkı', tur: 'kisa', max: 30, ornek: 'Ada Lovelace' },
  c: { ad: 'c', etiket: 'C şıkkı', tur: 'kisa', max: 30, ornek: 'Charles Babbage' },
  dogru: { ad: 'dogru', etiket: 'Doğru şık', tur: 'liste', secenekler: ['A', 'B', 'C'], ornek: 'B' },
  cevapEtiket: { ad: 'cevapEtiket', etiket: 'Cevap sayfası etiketi', tur: 'kisa', max: 20, ornek: 'Cevap' },
  aciklama: { ad: 'aciklama', etiket: 'Cevap açıklaması', tur: 'uzun', max: 110, ornek: "1843'te Babbage'ın Analitik Makinesi için\nBernoulli sayılarını hesaplayan algoritma." },
};
const siklar = (v, cevap) => ['A', 'B', 'C'].map(h => {
  const k = !cevap ? '<div class="cam">' : h === v.dogru ? '<div class="cam dogru">' : '<div class="cam" style="opacity:.45">';
  return `${k}<b>${h}</b>${esc(v[h.toLowerCase()])}</div>`;
}).join('');

const logoAlani = n => ({ ad: `logo${n}`, etiket: `${n}. logo`, tur: 'logo' });

export const TARIF_SABLONLARI = [
  {
    id: 'kod-ipucu', ad: 'Kod ipucu', aile: 'İçerik', w: P[0], h: P[1], yuzler: ['a', 'b'],
    ne: 'Haftalık ipucu: başlık ve kod kartı. Seri hâlinde #01, #02… numaralanır.',
    alanlar: [
      { ad: 'hap', etiket: 'Etiket', tur: 'kisa', max: 26, ornek: 'Python ipucu · #07' },
      { ad: 'baslik', etiket: 'Başlık', tur: 'uzun', max: 50, ornek: 'İki değişkeni\n*tek satırda* değiştir.', ipucu: '*kelimeler* turkuaz olur.' },
      { ad: 'kod', etiket: 'Kod', tur: 'kod', max: 300, satir: 6, ornek: '# geçici değişken yok\na, b = b, a\nprint(a, b)  # 2 1', ipucu: 'En fazla 6–7 satır. Yorumlar, anahtar kelimeler ve fonksiyonlar kendiliğinden renklenir.' },
    ],
    ciz: (v, L, y) => tuval(...P, `${L()}${bosluk(80)}<span class="hap">${esc(v.hap)}</span>${bosluk(30)}
<h2 class="bas-o" data-sigdir="0.6" style="font-size:92px">${baslik(v.baslik, false, false, EM_DUZ)}</h2>
<div class="esn"></div><div class="kod2"><div class="bar"><i></i><i></i><i></i></div><pre>${renklendir(v.kod)}</pre></div><div class="esn"></div>${kaydir(1, 3)}`, y),
  },
  {
    id: 'anket', ad: 'Anket (story)', aile: 'İçerik', w: S[0], h: S[1], yuzler: ['a', 'b'],
    ne: 'Takipçiyi karara ortak eder. Instagram anket çıkartmasının yeri boş bırakılır.',
    alanlar: [
      { ad: 'hap', etiket: 'Etiket', tur: 'kisa', max: 20, ornek: 'Anket' },
      { ad: 'baslik', etiket: 'Soru', tur: 'uzun', max: 40, ornek: 'Sıradaki\nworkshop\nne olsun?', ipucu: 'Son satır turkuaz olur.' },
      { ad: 'cikartma', etiket: 'Çıkartma yerini göster', tur: 'secim', ornek: true, ipucu: "Instagram'da anket çıkartmasını bu kutunun üstüne koy." },
      { ad: 'aciklama', etiket: 'Alt not', tur: 'kisa', max: 40, ornek: "Sonuç cuma günü story'de." },
    ],
    ciz: (v, L, y) => tuval(...S, `${L()}<div class="esn"></div><span class="hap">${esc(v.hap)}</span>${bosluk(40)}
<h2 class="dev-y" data-sigdir="0.55" style="font-size:132px">${baslik(v.baslik, 'satir')}</h2>${bosluk(70)}
<div class="esn"></div>` + (v.cikartma ? `<div class="cam" style="width:760px;height:300px;display:grid;place-items:center;border-style:dashed;font:400 28px Lexend;color:var(--soluk)">Instagram anket çıkartması buraya</div>
${bosluk(40)}` : '') + varsa(v.aciklama, `<p class="ince" style="font-size:30px">${zengin(v.aciklama)}</p>`), y, { cls: 'story' }),
  },
  {
    id: 'quiz-soru', ad: 'Quiz · soru', aile: 'İçerik', w: P[0], h: P[1], yuzler: ['a', 'b'], seri: QUIZ,
    ne: 'İki sayfa: soru ve üç şık, ikinci sayfada doğru şık vurgulu. Kaydırmaya sebep verir.',
    alanlar: [Q_ALAN.etiket, Q_ALAN.soru, Q_ALAN.a, Q_ALAN.b, Q_ALAN.c],
    ciz: (v, L, y) => tuval(...P, `${L()}${bosluk(70)}<span class="hap">${esc(v.etiket)}</span>${bosluk(30)}
<h2 class="bas-o" data-sigdir="0.6" style="font-size:80px">${zengin(v.soru)}</h2><div class="esn"></div>
<div class="secenek">${siklar(v, false)}</div>
<div class="esn"></div>${kaydir(1, 2)}`, y),
  },
  {
    id: 'quiz-cevap', ad: 'Quiz · cevap', aile: 'İçerik', w: P[0], h: P[1], yuzler: ['a', 'b'], seri: QUIZ,
    alanlar: [Q_ALAN.dogru, Q_ALAN.cevapEtiket, Q_ALAN.aciklama],
    ciz: (v, L, y) => tuval(...P, `${L()}${bosluk(70)}<span class="hap">${esc(v.cevapEtiket)}</span>${bosluk(30)}
<h2 class="bas-o" data-sigdir="0.6" style="font-size:80px">${zengin(v.soru)}</h2><div class="esn"></div>
<div class="secenek">${siklar(v, true)}</div>
` + varsa(v.aciklama, `${bosluk(40)}<p class="ince" style="font-size:32px">${zengin(v.aciklama)}</p>`) + `<div class="esn"></div>${kaydir(2, 2)}`, y),
  },
  {
    id: 'iki-panel', ad: 'İki panel', aile: 'İçerik', w: P[0], h: P[1], yuzler: ['a', 'b'],
    ne: 'Beklenti / Gerçek, Önce / Sonra: her ikili karşılaştırma. İkinci panel vurgulu.',
    alanlar: [
      { ad: 'hap', etiket: 'Etiket', tur: 'kisa', max: 28, ornek: 'Bilgisayar mühendisliği' },
      { ad: 'baslik', etiket: 'Başlık', tur: 'kisa', max: 24, ornek: 'İlk dönem.' },
      { ad: 'sol', etiket: 'Sol panel etiketi', tur: 'kisa', max: 14, ornek: 'Beklenti' },
      { ad: 'foto1', etiket: 'Sol panel fotoğrafı', tur: 'foto' },
      { ad: 'solMetin', etiket: 'Sol panel metni', tur: 'uzun', max: 50, ornek: 'Hacker filmlerindeki gibi yeşil ekran.' },
      { ad: 'sag', etiket: 'Sağ panel etiketi', tur: 'kisa', max: 14, ornek: 'Gerçek' },
      { ad: 'foto2', etiket: 'Sağ panel fotoğrafı', tur: 'foto' },
      { ad: 'sagMetin', etiket: 'Sağ panel metni', tur: 'uzun', max: 50, ornek: 'Noktalı virgül yüzünden 3 saat.' },
      { ad: 'aciklama', etiket: 'Alt not', tur: 'kisa', max: 50, ornek: 'Sen hangisini yaşadın? Yorumlara yaz.' },
    ],
    ciz: (v, L, y) => tuval(...P, `${L()}${bosluk(70)}<span class="hap">${esc(v.hap)}</span>${bosluk(30)}
<h2 class="bas-o" data-sigdir="0.6" style="font-size:84px">${esc(v.baslik)}</h2><div class="esn"></div>
<div class="iki-panel"><div class="cam"><span class="genis" style="letter-spacing:.3em">${esc(v.sol)}</span>${fotoYuva(v.foto1, 'foto1', 'width:100%;height:auto', 'foto-t ph')}<span style="font:500 32px/1.3 Lexend">${zengin(v.solMetin)}</span></div>
<div class="cam" style="border-color:color-mix(in srgb, var(--vurgu) 60%, transparent)"><span class="genis" style="letter-spacing:.3em;color:var(--vurgu)">${esc(v.sag)}</span>${fotoYuva(v.foto2, 'foto2', 'width:100%;height:auto', 'foto-t ph')}<span style="font:500 32px/1.3 Lexend">${zengin(v.sagMetin)}</span></div></div>
<div class="esn"></div>` + varsa(v.aciklama, `<p class="ince" style="font-size:32px">${zengin(v.aciklama)}</p>`), y),
  },
  {
    id: 'etkinlik-nerede', ad: 'Etkinlik nerede?', aile: 'İçerik', w: P[0], h: P[1], yuzler: ['a', 'b'],
    ne: 'İlk kez gelen için yol tarifi: sade harita, konum, yol bilgisi.',
    alanlar: [
      { ad: 'hap', etiket: 'Etiket', tur: 'kisa', max: 22, ornek: 'Etkinlik nerede?' },
      { ad: 'bina', etiket: 'Bina', tur: 'kisa', max: 30, ornek: 'Mühendislik Fakültesi,' },
      { ad: 'salon', etiket: 'Salon (turkuaz)', tur: 'kisa', max: 24, ornek: 'Amfi 2.' },
      { ad: 'b1', etiket: 'Bilgi 1', tur: 'kisa', max: 22, ornek: 'Giriş kat' },
      { ad: 'b2', etiket: 'Bilgi 2', tur: 'kisa', max: 22, ornek: 'Kantinin karşısı' },
      { ad: 'b3', etiket: 'Bilgi 3', tur: 'kisa', max: 22, ornek: 'Asansör var' },
    ],
    ciz: (v, L, y) => tuval(...P, `${L()}${bosluk(70)}<span class="hap">${esc(v.hap)}</span>${bosluk(30)}
<h2 class="bas-o" data-sigdir="0.6" style="font-size:84px">${esc(v.bina)}<br><em style="${EM_DUZ}">${esc(v.salon)}</em></h2><div class="esn"></div>
<div class="harita cam"><svg class="yol" viewBox="0 0 860 520" fill="none" aria-hidden="true"><path d="M-20 400 C 180 380 240 260 430 250 S 700 120 900 140" stroke="currentColor" stroke-opacity=".18" stroke-width="26"/><path d="M200 -20 L 260 540 M 600 -20 L 540 540" stroke="currentColor" stroke-opacity=".1" stroke-width="18"/><rect x="300" y="300" width="120" height="90" rx="14" fill="currentColor" fill-opacity=".1"/><rect x="600" y="230" width="150" height="110" rx="14" fill="currentColor" fill-opacity=".1"/><rect x="80" y="80" width="100" height="120" rx="14" fill="currentColor" fill-opacity=".1"/><circle cx="430" cy="250" r="90" stroke="#35C9C1" stroke-opacity=".35" stroke-width="3"/></svg><div style="position:absolute;left:430px;top:250px;transform:translate(-50%,-100%)">${ik(KONUM, 120, 8)}</div></div>
<div class="esn"></div>${satir([v.b1, v.b2, v.b3])}`, y),
  },
  {
    id: 'pi-gunu', ad: 'Özel gün (π günü)', aile: 'İçerik', w: P[0], h: P[1], yuzler: ['a', 'b'],
    ne: 'Takvime bağlı günler: Pi Günü, Ada Lovelace Günü, Programcılar Günü. Ana görsel dev rakam.',
    alanlar: [
      { ad: 'etiket', etiket: 'Üst etiket', tur: 'kisa', max: 28, ornek: '14 Mart · Pi Günü' },
      { ad: 'rakam', etiket: 'Dev rakam', tur: 'kisa', max: 6, ornek: '3,14', ipucu: 'π sembolü Lexend\'de yok; rakamla anlat.' },
      { ad: 'alt', etiket: 'Rakamın altı', tur: 'kisa', max: 30, ornek: '159 26535 89793 23846…' },
      { ad: 'aciklama', etiket: 'Açıklama', tur: 'uzun', max: 90, ornek: 'Sonsuz, tekrarsız. Bugün kaç basamağını ezbere biliyorsun?' },
      { ad: 'b1', etiket: 'Bilgi 1', tur: 'kisa', max: 22, ornek: 'Yorumlara yaz' },
      { ad: 'b2', etiket: 'Bilgi 2', tur: 'kisa', max: 24, ornek: 'En uzun dizi kazanır' },
    ],
    ciz: (v, L, y) => tuval(...P, `${L()}<div class="esn"></div><span class="genis">${esc(v.etiket)}</span>${bosluk(10)}
<p class="rakam" data-sigdir="0.5" style="font-size:330px;line-height:1">${esc(v.rakam)}</p>${bosluk(20)}<p class="ince" style="font-size:40px;font-weight:500;color:var(--ink);letter-spacing:.04em">${esc(v.alt)}</p>
${bosluk(24)}<p class="ince" style="font-size:32px">${zengin(v.aciklama)}</p><div class="esn"></div>${satir([v.b1, v.b2])}`, y),
  },
  {
    id: 'bu-hafta', ad: "Bu hafta BMT'de (story)", aile: 'İçerik', w: S[0], h: S[1], yuzler: ['a', 'b'],
    ne: 'Pazartesi sabahı tek story: haftanın bütün etkinlikleri.',
    alanlar: [
      { ad: 'hap', etiket: 'Hafta', tur: 'kisa', max: 20, ornek: '13–17 Ekim' },
      { ad: 'baslik', etiket: 'Başlık', tur: 'uzun', max: 30, ornek: "Bu hafta\nBMT'de.", ipucu: IPUCU_BASLIK },
      { ad: 'gunler', etiket: 'Program', tur: 'uzun', max: 260, satir: 6, ornek: "PZT Kulüp tanışma 18.00\nSAL Python'a giriş 15.30\nÇAR Git ve GitHub 16.00\nPER Oyun gecesi 19.00\nCUM Söyleşi: yapay zekâ 14.00", ipucu: 'Her satır: gün, etkinlik, saat. Ör. PZT Kulüp tanışma 18.00' },
      { ad: 'b1', etiket: 'Alt satır 1', tur: 'kisa', max: 20, ornek: 'Ayrıntılar' },
      { ad: 'b2', etiket: 'Alt satır 2', tur: 'kisa', max: 24, ornek: "bio'daki bağlantı" },
    ],
    ciz: (v, L, y) => tuval(...S, `${L()}<div class="esn"></div><span class="hap">${esc(v.hap)}</span>${bosluk(30)}
<h2 class="dev-y" data-sigdir="0.55" style="font-size:132px">${baslik(v.baslik, true)}</h2>${bosluk(60)}
<div class="gunler cam">${gunler(v.gunler)}</div>
<div class="esn"></div>${satir([v.b1, v.b2], 'buyuk')}`, y, { cls: 'story' }),
  },
  {
    id: 'sponsor', ad: 'Sponsor teşekkürü', aile: 'İçerik', w: P[0], h: P[1], yuzler: ['a', 'b'],
    ne: 'Logo ızgarası, her logo kendi kutusunda. Kit kuralı: logolar tek renk (koyu yüzde beyaz, açık yüzde koyu).',
    alanlar: [
      { ad: 'hap', etiket: 'Etiket', tur: 'kisa', max: 20, ornek: 'Teşekkürler' },
      { ad: 'baslik', etiket: 'Başlık', tur: 'uzun', max: 50, ornek: "Hackathon '26'yı\nmümkün kılanlar." },
      logoAlani(1), logoAlani(2), logoAlani(3), logoAlani(4), logoAlani(5), logoAlani(6),
      { ad: 'tek', etiket: 'Logoları tek renge çevir', tur: 'secim', ornek: true },
      { ad: 'aciklama', etiket: 'Alt not', tur: 'uzun', max: 90, ornek: 'Logolar beyaz ya da tek renk; renkli logo cam kutunun içinde bile zemine karışır.', ipucu: 'Bu kitteki örnek not; kendi teşekkür cümleni yaz.' },
    ],
    ciz: (v, L, y) => {
      const yuklu = [1, 2, 3, 4, 5, 6].map(n => v[`logo${n}`]).filter(f => f?.src);
      const kutular = yuklu.length
        ? yuklu.map(f => `<div class="cam dolu"><img class="${v.tek ? 'tek' : ''}" src="${f.src}" alt=""></div>`).join('')
        : Array.from({ length: 6 }, () => '<div class="cam">logo</div>').join('');
      return tuval(...P, `${L()}${bosluk(70)}<span class="hap">${esc(v.hap)}</span>${bosluk(30)}
<h2 class="bas-o" data-sigdir="0.6" style="font-size:84px">${zengin(v.baslik)}</h2><div class="esn"></div>
<div class="logolar${yuklu.length ? ' dolu' : ''}">${kutular}</div><div class="esn"></div>
` + varsa(v.aciklama, `<p class="ince" style="font-size:30px">${zengin(v.aciklama)}</p>`), y);
    },
  },
];

