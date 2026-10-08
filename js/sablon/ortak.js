// Şablonların ortak parçaları: ETU-BMT-Kimlik/uretim/yeni.py yardımcılarının birebir karşılığı.
// Birebirlik testi (_test/karsilastir.html) işaretlemenin Python'dakiyle aynı kalmasına dayanır:
// sıra, boşluk öğeleri ve satır içi metin (ör. "Unvan · <b>Kurum</b>") aynen korunur.
import { zemin } from '../zemin.js';
import qrcode from '../../vendor/qrcode.mjs';

// ---------------------------------------------------------------- metin
export function esc(t = '') {
  return String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
// Kullanıcı metni: kaçış, **kalın**, satır sonu.
export function zengin(t = '') {
  return esc(String(t ?? '').trim()).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
}
// Dev başlık: her satır ayrı. vurgu: true → son kelime turkuaz ("sıfırdan <em>giriş.</em>"),
// 'satir' → son satırın tamamı ("senin de<br><em>yerin var.</em>"). tum: bütün başlık vurgulu (ör. "Ertelendi.").
// Elle vurgu: metinde *kelimeler* varsa yalnız onlar turkuaz olur (otomatik kural uygulanmaz).
// emStil: dev başlık dışındaki başlıklarda em italik olmasın diye satır içi stil (Python'daki gibi).
export function baslik(t = '', vurgu = false, tum = false, emStil = '') {
  const em = x => `<em${emStil ? ` style="${emStil}"` : ''}>${x}</em>`;
  if (/\*[^*\n]+\*/.test(String(t ?? ''))) return String(t).trim().split('\n').map(s => esc(s.trim()).replace(/\*([^*]+)\*/g, (_, x) => em(x))).filter(Boolean).join('<br>');
  const satirlar = String(t ?? '').trim().split('\n').map(s => s.trim()).filter(Boolean).map(esc);
  if (tum && satirlar.length) return em(satirlar.join('<br>'));
  if (vurgu === 'satir') { if (satirlar.length > 1) satirlar[satirlar.length - 1] = em(satirlar.at(-1)); return satirlar.join('<br>'); }
  if (vurgu && satirlar.length) {
    const son = satirlar.length - 1, k = satirlar[son].lastIndexOf(' ');
    satirlar[son] = k < 0 ? em(satirlar[son]) : `${satirlar[son].slice(0, k + 1)}${em(satirlar[son].slice(k + 1))}`;
  }
  return satirlar.join('<br>');
}
// Bilgi satırı: "14 Ekim Salı · 15.30 · Amfi 2" (boş parçalar atlanır).
export function satir(parcalar, cls = '') {
  const dolu = parcalar.map(p => String(p ?? '').trim()).filter(Boolean);
  return dolu.length ? `<div class="satir ${cls}">${dolu.map(esc).join('<i></i>')}</div>` : '';
}
export const bosluk = h => `<div style="height:${h}px"></div>`;
export const varsa = (deger, html) => (String(deger ?? '').trim() ? html : '');
export const dolu = d => String(d ?? '').trim() !== '';

// ---------------------------------------------------------------- tuval
// yuz: a | b | alarm | saygi | foto. Saygı ve doku:false zemin dokusu almaz.
export function tuval(w, h, ic, yuz, { cls = '', ek = '', pad = '', stil = '', doku = true } = {}) {
  const p = pad ? `padding:${pad};` : '';
  return `<div class="yy ${yuz} ${cls}" style="width:${w}px;height:${h}px;${stil}">${doku && yuz !== 'saygi' ? zemin(w, h) : ''}${ek}<div class="ic" style="${p}">${ic}</div></div>`;
}

// Carousel sayfa göstergesi: noktalar + kaydır.
export function kaydir(i, n) {
  const nok = Array.from({ length: n }, (_, k) => `<i class="${k + 1 === i ? 'on' : ''}"></i>`).join('');
  return `<div class="kaydir-y"><span class="noktalar">${nok}</span>${i < n ? '<span>Kaydır →</span>' : ''}</div>`;
}

// ---------------------------------------------------------------- fotoğraf
// Fotoğraf yuvası boyutunu bilmek zorunda değil (galeri hücresi, tam ekran zemin): object-fit cover,
// konum yüzde (px, py: 0–100), yakınlaştırma aynı noktadan.
function fotoImg(f) {
  return `<img class="foto" src="${f.src}" alt="" draggable="false" style="object-position:${f.px}% ${f.py}%;transform:scale(${f.zoom});transform-origin:${f.px}% ${f.py}%">`;
}
// Çerçeveli fotoğraf (.foto-t). stil: Python'daki satır içi stil (genişlik/yükseklik), aynen.
export function fotoYuva(f, ad, stil = '', sinif = 'foto-t') {
  const s = stil ? ` style="${stil}"` : '';
  return f?.src ? `<div class="${sinif} dolu" data-foto="${ad}"${s}>${fotoImg(f)}</div>` : `<div class="${sinif}" data-foto="${ad}"${s}></div>`;
}
// Ekipten biri: daire fotoğraf + ince halka (.pp)
export const kisiFoto = (f, ad, px) => fotoYuva(f, ad, `width:${px}px;height:${px}px`, 'pp');
// Kişi satırı: daire fotoğraf, görev hapı, ad, bölüm (aile_b2.kisi)
export const kisi = (f, ad, gorev, isim, alt, px = 230) =>
  `<div class="kisi-y">${kisiFoto(f, ad, px)}<div class="ad"><span class="hap">${esc(gorev)}</span><b>${esc(isim)}</b><small>${esc(alt)}</small></div></div>`;

// Tam ekran fotoğraf zemini (.foto-bg), sb: siyah-beyaz.
export function fotoZemin(f, ad, sb = false) {
  const c = `foto-bg${sb ? ' sb' : ''}`;
  return f?.src ? `<div class="${c} dolu" data-foto="${ad}">${fotoImg(f)}</div>` : `<div class="${c}" data-foto="${ad}"></div>`;
}

// ---------------------------------------------------------------- QR
// Bağlantı varsa gerçek QR (SVG, Gece rengi); yoksa kitteki yer tutucu.
export function qr(baglanti, stil = '') {
  const s = stil ? ` style="${stil}"` : '';
  if (!dolu(baglanti)) return `<div class="qr"${s}></div>`;
  const q = qrcode(0, 'M'); q.addData(String(baglanti).trim()); q.make();
  const n = q.getModuleCount(); let yol = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (q.isDark(y, x)) yol += `M${x},${y}h1v1h-1z`;
  return `<div class="qr dolu"${s}><svg viewBox="-2 -2 ${n + 4} ${n + 4}" shape-rendering="crispEdges" aria-hidden="true"><path fill="#14123A" d="${yol}"/></svg></div>`;
}

// ---------------------------------------------------------------- alan tanımları (form)
export const TARIH = (ornek = ['', '', '']) => [
  { ad: 'tarih', etiket: 'Tarih', tur: 'kisa', max: 22, ornek: ornek[0] },
  { ad: 'saat', etiket: 'Saat', tur: 'kisa', max: 8, ornek: ornek[1] },
  { ad: 'yer', etiket: 'Yer', tur: 'kisa', max: 26, ornek: ornek[2] },
];
export const IPUCU_KALIN = '**kelime** yazarsan kalın olur.';
export const IPUCU_BASLIK = 'Her satır ayrı satıra. Kısa tut: 2–3 satır, satır başına 1–2 kelime. *kelime* yazarsan turkuaz olur.';
export const EM_DUZ = 'font-style:normal;color:var(--vurgu)';   // bas-o içindeki vurgu (italik değil)
