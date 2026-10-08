// BMT Post Üretici: tasarımcı içerik girer, görsel kimliğin kendi koduyla çizilir.
// Kavramlar: şablon (tek görsel), seri (birlikte kaydedilen sayfalar: carousel), grup (aynı içeriğin varyantları: yaka kartı rolleri).
import { markaYukle, aktifSurum, surumBul, logolariOnYukle, dosyaYolu } from './marka.js';
import { AILELER, SABLONLAR, ornekDegerler, kardesler, degerAnahtari, istegeBagliAlanlar } from './sablonlar.js';
import { cizimYap, kucukGoster, bekle } from './cizim.js';
import { pngYap, kaydet } from './yakala.js';
import { pdfYap, jpegYap, zipYap } from './paket.js';
import { kitUret } from './kit.js';
import { SERBEST, BICIMLER, PARCALAR, PARCA_ILK, EN_FAZLA_PARCA, EN_FAZLA_SAYFA, BASLANGICLAR, baslangicSayfalari, sayfalarOf, anaGorselFazlasi } from './sablon/serbest.js';

const $ = s => document.querySelector(s);
const YUZ_AD = { a: 'Koyu', b: 'Açık', alarm: 'Alarm', saygi: 'Saygı', foto: 'Fotoğraf' };
const TASLAK = 'bmt-post-taslak-v2';

// ---------------------------------------------------------------- yardımcılar
const yerel = {
  oku(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  yaz(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* gizli pencere: taslaksız çalış */ } },
};
const telefon = () => matchMedia('(max-width: 860px)').matches;
const buyukBas = t => t.charAt(0).toLocaleUpperCase('tr') + t.slice(1);   // "eğitmen" → "Eğitmen" (i → İ doğru)
const dokunmatik = () => matchMedia('(pointer: coarse)').matches;

// ---------------------------------------------------------------- durum
let marka, aktif;
const taslak = yerel.oku(TASLAK) ?? { sablon: 'duyuru', yuz: {}, degerler: {}, surum: {} };
let sablon = SABLONLAR.find(s => s.id === taslak.sablon) ?? SABLONLAR[0];   // seride: önizlenen sayfa; grupta: seçili varyant
let aile = sablon.aile;
const foto = {};            // değer anahtarı → { alan adı → {src, nw, nh, zoom, px, py} }; taslağa yazılmaz
let cizimler = [];          // son çizimde her sayfanın {s, yy, sigmayan, sorunlar}
let bloblar = null, cizimNo = 0, olcek = 1;

const anahtar = () => degerAnahtari(sablon);
// Taban şablon: serbest postta önizlenen sayfa sanal bir şablondur, tabanı Serbest post'tur
const taban = () => sablon.taban ?? sablon;
// Kaydedilecek sayfalar: serbest postta kullanıcının sayfaları, seride kardeşler, gerisinde tek şablon
const sayfalar = () => { const t = taban(); return t.sayfaUret ? t.sayfaUret(degerler(t)) : t.seri ? kardesler(t) : [t]; };
// Yüz seçimi serinin ilk sayfasına göredir; diğer sayfalar kendi listesindeki aynı sıradaki yüzü alır
// (üye kartı: ön ['a','b'], arka ['b','a'] → "Koyu" seçilince ön koyu, arka açık).
const ilkSayfa = () => sayfalar()[0];
// Seçilebilir yüzler: şablon değerlere göre daraltabilir (serbest post: fotoğraf zemini tek yüz, konsept yalnız koyu)
const yuzListesi = () => { const i = ilkSayfa(); return i.yuzFiltre?.(degerler(i)) ?? i.yuzler; };
const yuzSec = () => { const l = yuzListesi(); return l.includes(taslak.yuz[anahtar()]) ? taslak.yuz[anahtar()] : (l[0] ?? ilkSayfa().yuzler[0]); };
const sayfaYuzu = s => s.yuzler[ilkSayfa().yuzler.indexOf(yuzSec())] ?? s.yuzler[0];
const surumSec = () => surumBul(marka, taslak.surum[anahtar()]) ?? aktif;
const kaydetTaslak = () => yerel.yaz(TASLAK, taslak);
// Seri ya da grubun bütün alanları (aynı adlı alan bir kez)
const alanlar = () => { const g = new Map(); for (const s of sayfalar()) for (const a of s.alanlar) if (!g.has(a.ad)) g.set(a.ad, a); return [...g.values()]; };
const hamDegerler = s => ({ ...ornekDegerler(s), ...(taslak.degerler[degerAnahtari(s)] ?? {}), ...(foto[degerAnahtari(s)] ?? {}) });
// Gizlenen isteğe bağlı alanlar boş çizilir (şablon o öğeyi hiç koymaz); yazının kendisi saklı kalır, "Göster" ile döner
const degerler = s => { const v = hamDegerler(s), g = taslak.gizli?.[degerAnahtari(s)] ?? {}; for (const ad in g) if (g[ad]) v[ad] = ''; return v; };

// ---------------------------------------------------------------- çizim akışı
async function ciz() {
  const no = ++cizimNo;
  bloblar = null; kaydetDurumu('hazirlaniyor');
  const surum = surumSec(), yeni = [];
  // seri: bütün sayfalar çizilir (uyarılar ve kayıt hepsini kapsar); her sayfanın kendi gizli kabı
  const kaplar = $('#cizim');
  while (kaplar.children.length < sayfalar().length) kaplar.appendChild(document.createElement('div'));
  while (kaplar.children.length > sayfalar().length) kaplar.lastChild.remove();
  for (const [i, s] of sayfalar().entries()) yeni.push({ s, ...(await cizimYap(s, degerler(s), sayfaYuzu(s), surum, kaplar.children[i])) });
  if (no !== cizimNo) return;
  cizimler = yeni;
  onizle();
  uyarilariGoster();
  surumUyarisi();
  await bekle(350);                      // yazarken her tuşta PNG çizme: kısa bir durgunluk bekle
  if (no !== cizimNo) return;
  try {
    const b = [];
    for (const c of cizimler) b.push(await pngYap(c.yy));
    if (no !== cizimNo) return;
    bloblar = b; kaydetDurumu('hazir');
  } catch (e) { if (no === cizimNo) kaydetDurumu('hata', e.message); }
}

function onizle() {
  const c = cizimler.find(x => x.s.id === sablon.id) ?? cizimler[0];
  if (!c) return;
  const cerceve = $('.onizleme-cerceve');
  olcek = kucukGoster(c.yy, $('#onizleme'), cerceve.clientWidth, telefon() ? innerHeight * 0.62 : innerHeight - 240);
  sayfaSekmeleri();
}

function uyarilariGoster() {
  const li = [], cok = cizimler.length > 1;
  // serbest post: taşma varsa asıl çare parça çıkarmak ya da daha uzun biçim; önce bunu söyle
  if (taban().id === 'serbest' && cizimler.some(c => c.sigmayan.length || c.sorunlar.length))
    li.push(['hata', 'İçerik bu biçime sığmıyor: bir parçayı çıkar, metni kısalt, bir sonraki sayfaya taşı ya da daha uzun bir biçim seç (ör. Story).']);
  for (const [i, c] of cizimler.entries()) {
    const on = cok ? `${i + 1}. sayfa: ` : '';
    for (const el of c.sigmayan) li.push(['hata', `${on}${el.classList.contains('dev-y') ? 'Dev başlık' : 'Yazı'} sığmıyor: kısalt ya da satırlara böl.`]);
    for (const s of c.sorunlar) li.push(['', `${on}Yerleşim: ${s}. Metni kısalt.`]);
    const k = [...c.yy.querySelectorAll('[data-oran]')].find(e => +e.dataset.oran < 1);
    if (k && !c.sigmayan.length) li.push(['', `${on}Yazı sığsın diye %${Math.round((1 - k.dataset.oran) * 100)} küçültüldü.`]);
  }
  // boş fotoğraf yuvası: kitteki yer tutucu ("FOTOĞRAF") görselde çıkar
  const f = foto[anahtar()] ?? {};
  const v0 = degerler(taban());
  for (const a of alanlar().filter(a => a.tur === 'foto' && !f[a.ad] && (!a.kosul || a.kosul(v0)))) li.push(['', `${a.etiket} eklenmedi: görselde yer tutucu çıkar.`]);
  if (taban().sayfaUret) for (const [i, sy] of sayfalarOf(v0).entries()) {
    const on = sayfalarOf(v0).length > 1 ? `${i + 1}. sayfa: ` : '';
    const eksik = sy.parcalar.flatMap(x => (x.tur === 'galeri' ? PARCALAR.galeri.fotolar(x).map(n => `blok-${x.id}-${n}`) : ['foto', 'kisi'].includes(x.tur) ? [`blok-${x.id}`] : [])).filter(k => !f[k]);
    if (eksik.length) li.push(['', `${on}${eksik.length} fotoğraf yeri boş: görselde yer tutucu çıkar.`]);
    const ana = anaGorselFazlasi(sy);
    if (ana.length) li.push(['', `${on}İki ana görsel var (${ana.join(', ')}). Kitin kuralı: her görselde tek ana görsel. Birini çıkar ya da ayrı sayfaya taşı.`]);
  }
  const logolar = alanlar().filter(a => a.tur === 'logo');
  if (logolar.length && !logolar.some(a => f[a.ad])) li.push(['', 'Logo eklenmedi: kutularda yer tutucu çıkar. Yalnız eklediğin logolar gösterilir.']);
  if (aktarimNotu && taban().id === 'serbest') li.unshift(['bilgi', aktarimNotu]);
  $('#uyarilar').replaceChildren(...li.map(([c, t]) => Object.assign(document.createElement('li'), { className: c, textContent: t })));
}

function kaydetDurumu(d, mesaj = '') {
  const b = $('#kaydet'), not = $('#kaydet-not'), n = sayfalar().length;
  b.disabled = d !== 'hazir';
  const hazir = n > 1 ? `${n} sayfayı ${dokunmatik() ? 'kaydet' : 'indir'}` : (dokunmatik() ? 'Kaydet' : 'PNG indir');
  b.textContent = d === 'hazir' ? hazir : d === 'hata' ? 'Tekrar dene' : 'Hazırlanıyor…';
  if (d === 'hata') { b.disabled = false; b.dataset.hata = '1'; } else delete b.dataset.hata;
  const yy = cizimler[0]?.yy, w = yy?.offsetWidth || sablon.w, h = yy?.offsetHeight || sablon.h;
  not.textContent = d === 'hata' ? mesaj : `${w} × ${h} px · PNG${n > 1 ? ` · ${n} sayfa` : ''}`;
}

function surumUyarisi() {
  const s = surumSec(), kutu = $('#surum-uyari');
  if (s.id === aktif.id) { kutu.hidden = true; return; }
  kutu.hidden = false;
  kutu.innerHTML = `<span>Bu taslak <b></b> ile başladı. Güncel logo: <b></b>.</span><button type="button" class="ikincil">Güncel logoya geç</button>`;
  const [b1, b2] = kutu.querySelectorAll('b'); b1.textContent = s.ad; b2.textContent = aktif.ad;
  kutu.querySelector('button').onclick = () => { taslak.surum[anahtar()] = aktif.id; kaydetTaslak(); ciz(); };
}

// ---------------------------------------------------------------- şablon seçimi
// Kartta gösterilen birim: seri ve grup tek kart, gerisi şablon başına bir kart.
const kartBirimleri = sablonlar => { const g = new Map(); for (const s of sablonlar) { const k = degerAnahtari(s); if (!g.has(k)) g.set(k, s); } return [...g.values()]; };

function aileSekmeleri() {
  $('#aileler').replaceChildren(...AILELER.map(a => {
    const b = Object.assign(document.createElement('button'), { type: 'button', textContent: a.id });
    b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(a.id === aile));
    b.onclick = () => { aile = a.id; aileSekmeleri(); sablonKartlari(); };
    return b;
  }));
}

let kartNo = 0;
async function sablonKartlari() {
  const no = ++kartNo, kap = $('#sablonlar');
  const birimler = kartBirimleri(AILELER.find(a => a.id === aile).sablonlar);
  kap.replaceChildren(...birimler.map(s => {
    const k = Object.assign(document.createElement('button'), { type: 'button', className: 'sablon-kart' });
    k.setAttribute('role', 'radio'); k.dataset.anahtar = degerAnahtari(s);
    k.setAttribute('aria-checked', String(degerAnahtari(s) === anahtar()));
    const ad = s.seri?.ad ?? s.grup?.ad ?? s.ad;
    const ek = s.seri ? `${kardesler(s).length} sayfa` : s.grup ? `${kardesler(s).length} ${s.grup.secenek.toLowerCase()}` : '';
    k.innerHTML = `<div class="mini"><div class="mini-ic"></div></div><b></b>${ek ? '<small></small>' : ''}`;
    k.querySelector('b').textContent = ad;
    if (ek) k.querySelector('small').textContent = ek;
    k.onclick = () => sablonSec(s.id);
    return k;
  }));
  // küçük resimler: örnek içerikle, sırayla ve arada nefes alarak (arayüz donmasın)
  const gecici = Object.assign(document.createElement('div'), { className: 'cizim' }); document.body.appendChild(gecici);
  for (const s of birimler) {
    if (no !== kartNo) break;
    const { yy } = await cizimYap(s, ornekDegerler(s), s.yuzler[0], aktif, gecici);
    const mini = kap.querySelector(`[data-anahtar="${degerAnahtari(s)}"] .mini`);
    if (mini) kucukGoster(yy, mini.firstElementChild, mini.clientWidth || 110, mini.clientHeight || 146);
    await bekle(0);
  }
  gecici.remove();
}

function sablonSec(id) {
  if (id !== 'serbest') aktarimNotu = '';
  sablon = SABLONLAR.find(s => s.id === id);
  taslak.sablon = id; kaydetTaslak();
  document.querySelectorAll('.sablon-kart').forEach(k => k.setAttribute('aria-checked', String(k.dataset.anahtar === anahtar())));
  panelKur(); ciz();
}

function panelKur() {
  $('#sablon-ne').textContent = (sablon.seri ? kardesler(sablon)[0] : sablon).ne ?? '';
  varyantDugmeleri(); yuzDugmeleri(); formKur(); topluKur();
}

// ---------------------------------------------------------------- toplu çıktı (sertifika: isim listesinden tek PDF)
// "BMT-2026-0142" + 3 → "BMT-2026-0145": sondaki rakam dizisi aynı genişlikte artar
const numaraArtir = (no, k) => String(no ?? '').replace(/(\d+)(\D*)$/, (_, r, son) => String(+r + k).padStart(r.length, '0') + son);
const isimler = () => $('#toplu-liste').value.split('\n').map(x => x.trim()).filter(Boolean);

function topluKur() {
  const t = sablon.toplu;
  $('#toplu-bolum').hidden = !t;
  if (!t) return;
  const liste = $('#toplu-liste');
  liste.value = (taslak.toplu ??= {})[anahtar()] ?? '';
  const guncelle = () => {
    const n = isimler().length;
    $('#toplu-say').textContent = n ? `${n} kişi` : '';
    $('#toplu-indir').disabled = !n;
    $('#toplu-indir').textContent = n ? `${n} sertifikayı PDF olarak ${dokunmatik() ? 'kaydet' : 'indir'}` : 'PDF oluştur';
  };
  liste.oninput = () => { taslak.toplu[anahtar()] = liste.value; kaydetTaslak(); guncelle(); };
  guncelle();
}

async function topluIndir() {
  const t = sablon.toplu, liste = isimler(), dugme = $('#toplu-indir'), durum = $('#toplu-durum');
  if (!t || !liste.length) return;
  dugme.disabled = true;
  const kap = Object.assign(document.createElement('div'), { className: 'cizim' }); document.body.appendChild(kap);
  try {
    const temel = degerler(sablon), artir = $('#toplu-no').checked, sayfalar = [];
    for (const [i, ad] of liste.entries()) {
      durum.textContent = `Hazırlanıyor: ${i + 1} / ${liste.length}`;
      const v = { ...temel, [t.ad]: ad, ...(artir ? { [t.no]: numaraArtir(temel[t.no], i) } : {}) };
      const { yy, sigmayan } = await cizimYap(sablon, v, sayfaYuzu(sablon), surumSec(), kap);
      if (sigmayan.length) durum.textContent += ` · "${ad}" sığmadı, küçültüldü`;
      sayfalar.push(await jpegYap(await pngYap(yy, 2)));
    }
    const pdf = await pdfYap(sayfalar, t.sayfaPt);
    durum.textContent = `${liste.length} sayfalık PDF hazır (${(pdf.size / 1048576).toFixed(1)} MB).`;
    const tarih = new Date().toISOString().slice(0, 10);
    await kaydet([pdf], [`bmt-${sablon.id}-${liste.length}-kisi-${tarih}.pdf`]);
  } catch (e) { durum.textContent = `Olmadı: ${e.message}`; }
  finally { kap.remove(); dugme.disabled = false; }
}

function varyantDugmeleri() {
  $('#varyant-bolum').hidden = !sablon.grup;
  if (!sablon.grup) return;
  $('#varyant-baslik').textContent = sablon.grup.secenek;
  $('#varyantlar').replaceChildren(...kardesler(sablon).map(s => {
    const b = Object.assign(document.createElement('button'), { type: 'button', textContent: s.varyant });
    b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', String(s.id === sablon.id));
    b.onclick = () => sablonSec(s.id);
    return b;
  }));
}

function yuzDugmeleri() {
  $('#yuz-bolum').hidden = yuzListesi().length < 2;
  $('#yuzler').replaceChildren(...yuzListesi().map(y => {
    const b = Object.assign(document.createElement('button'), { type: 'button', textContent: YUZ_AD[y] });
    b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', String(y === yuzSec()));
    b.onclick = () => { taslak.yuz[anahtar()] = y; kaydetTaslak(); yuzDugmeleri(); ciz(); };
    return b;
  }));
}

// Seride önizlenecek sayfa
function sayfaSekmeleri() {
  const kap = $('#sayfalar'), s = sayfalar();
  kap.hidden = s.length < 2;
  if (s.length < 2) return;
  kap.replaceChildren(...s.map((x, i) => {
    const b = Object.assign(document.createElement('button'), { type: 'button', textContent: x.taban ? `${i + 1}. sayfa` : `${i + 1} · ${buyukBas(x.ad.split(' · ').at(-1))}` });
    b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(x.id === sablon.id));
    b.onclick = () => { sablon = x; taslak.sablon = x.taban?.id ?? x.id; kaydetTaslak(); onizle(); if (x.taban) formKur(); };
    return b;
  }));
}

// ---------------------------------------------------------------- form
function degerYaz(ad, deger) {
  const d = (taslak.degerler[anahtar()] ??= {});
  d[ad] = deger;
  taslak.surum[anahtar()] ??= aktif.id;     // taslak ilk düzenlendiği sürümü hatırlar
  kaydetTaslak();
}

function formKur() {
  const form = $('#form'), v = hamDegerler(sablon);
  const istege = taban().sayfaUret ? new Set() : new Set(sayfalar().flatMap(x => [...istegeBagliAlanlar(x)]));
  const gizli = (taslak.gizli ??= {})[anahtar()] ??= {};
  $('#serbest-aktar').hidden = !!taban().sayfaUret;
  form.replaceChildren();
  let ucli = null;   // tarih · saat · yer tek satırda, şablondaki yerinde
  if (!alanlar().length) form.appendChild(Object.assign(document.createElement('p'), { className: 'not', textContent: 'Bu şablonda yazı yok: yüzü (ve varsa konuyu) seçip kaydet.' }));
  for (const a of alanlar()) {
    if (a.kosul && !a.kosul(v)) continue;   // ör. zemin görseli yalnız Fotoğraf ve Konsept zemininde
    if (a.tur === 'foto' || a.tur === 'logo') { form.appendChild(fotoAlani(a)); continue; }
    if (a.tur === 'sayfalar') { form.appendChild(sayfaDuzenleyici(a, v[a.ad])); continue; }
    if (a.tur === 'liste') {
      const kutu = Object.assign(document.createElement('label'), { className: 'alan' });
      kutu.innerHTML = `<span><span></span></span><select></select>`;
      kutu.querySelector('span > span').textContent = a.etiket;
      const sec = kutu.querySelector('select');
      sec.replaceChildren(...a.secenekler.map(x => Object.assign(document.createElement('option'), { value: x, textContent: x })));
      sec.value = v[a.ad] ?? a.secenekler[0];
      sec.onchange = () => { degerYaz(a.ad, sec.value); if (a.yenidenKur) { formKur(); yuzDugmeleri(); } ciz(); };
      form.appendChild(kutu); continue;
    }
    const kutu = document.createElement('label');
    if (a.tur === 'secim') {
      kutu.className = 'secim';
      kutu.innerHTML = `<input type="checkbox"><span></span>`;
      const i = kutu.querySelector('input'); i.checked = !!v[a.ad];
      kutu.querySelector('span').textContent = a.etiket;
      i.onchange = () => { degerYaz(a.ad, i.checked); ciz(); };
      form.appendChild(kutu); continue;
    }
    kutu.className = 'alan';
    kutu.innerHTML = `<span><span></span><small></small></span>${a.tur === 'uzun' || a.tur === 'kod' ? '<textarea></textarea>' : '<input type="text">'}${a.ipucu ? '<span class="ipucu"></span>' : ''}`;
    kutu.querySelector('span > span').textContent = a.etiket;
    if (a.ipucu) kutu.querySelector('.ipucu').textContent = a.ipucu;
    const g = kutu.querySelector('input, textarea'), say = kutu.querySelector('small');
    if (istege.has(a.ad)) {
      // isteğe bağlı: gizlenince görselden çıkar, yazı silinmez
      const d = Object.assign(document.createElement('button'), { type: 'button', className: 'gizle', textContent: gizli[a.ad] ? 'Göster' : 'Gizle' });
      d.setAttribute('aria-pressed', String(!!gizli[a.ad]));
      d.onclick = e => { e.preventDefault(); gizli[a.ad] = !gizli[a.ad]; kaydetTaslak(); formKur(); ciz(); };
      kutu.querySelector('span').appendChild(d);
      if (gizli[a.ad]) { kutu.classList.add('gizli'); g.disabled = true; }
    }
    g.value = v[a.ad] ?? ''; g.maxLength = a.max; g.lang = 'tr'; g.spellcheck = a.tur !== 'kod';
    if (a.tur === 'kod') { g.classList.add('kod'); g.autocapitalize = 'off'; g.setAttribute('autocorrect', 'off'); }
    if (a.tur === 'uzun' || a.tur === 'kod') g.rows = Math.min(a.satir ?? 4, Math.max(2, (g.value.match(/\n/g)?.length ?? 0) + 1));
    const sayac = () => { say.textContent = `${g.value.length}/${a.max}`; say.classList.toggle('dolu', g.value.length >= a.max); };
    sayac();
    g.oninput = () => { sayac(); degerYaz(a.ad, g.value); ciz(); };
    if (['tarih', 'saat', 'yer'].includes(a.ad)) {
      if (!ucli) ucli = form.appendChild(Object.assign(document.createElement('div'), { className: 'ucli' }));
      ucli.appendChild(kutu);
    } else form.appendChild(kutu);
  }
}

// ---------------------------------------------------------------- serbest post: sayfa ve parça düzenleyicisi
const yeniKimlik = () => Math.random().toString(36).slice(2, 8);
const fotoSil = id => { for (const k of Object.keys(foto[anahtar()] ?? {})) if (k === `blok-${id}` || k.startsWith(`blok-${id}-`)) delete foto[anahtar()][k]; };
const dugme = (metin, tik, cls = 'ikincil') => Object.assign(document.createElement('button'), { type: 'button', className: cls, textContent: metin, onclick: tik });

function sayfaDuzenleyici(alan, deger) {
  const kap = Object.assign(document.createElement('div'), { className: 'parcalar' });
  const liste = structuredClone(sayfalarOf({ sayfalar: deger }));
  const no = Math.min(sablon.sayfaNo ?? 0, liste.length - 1), sayfa = liste[no];
  const kaydet = () => { degerYaz(alan.ad, liste); ciz(); };
  // yapı değişince (sayfa/parça ekle, sil, taşı) form ve önizleme o sayfayla yeniden kurulur
  const yeniden = (hedef = no) => { degerYaz(alan.ad, liste); sablon = sayfalar()[Math.min(hedef, liste.length - 1)]; taslak.sablon = taban().id; formKur(); ciz(); };

  // sayfalar
  const ust = Object.assign(document.createElement('div'), { className: 'sayfa-cubuk' });
  ust.appendChild(Object.assign(document.createElement('span'), { className: 'ipucu', textContent: 'Sayfa:' }));
  for (const [i] of liste.entries()) {
    const d = dugme(String(i + 1), () => yeniden(i), 'sayfa-no');
    d.setAttribute('aria-pressed', String(i === no)); d.setAttribute('aria-label', `${i + 1}. sayfa`);
    ust.appendChild(d);
  }
  if (liste.length < EN_FAZLA_SAYFA) {
    ust.appendChild(dugme('+ Sayfa', () => { liste.push({ id: yeniKimlik(), parcalar: [] }); yeniden(liste.length - 1); }));
    ust.appendChild(dugme('Çoğalt', () => {
      const kopya = structuredClone(sayfa); kopya.id = yeniKimlik(); kopya.parcalar.forEach(x => { x.id = yeniKimlik(); });
      liste.splice(no + 1, 0, kopya); yeniden(no + 1);
    }));
  }
  if (liste.length > 1) ust.appendChild(dugme('Sayfayı sil', () => { sayfa.parcalar.forEach(x => fotoSil(x.id)); liste.splice(no, 1); yeniden(Math.max(0, no - 1)); }));
  kap.appendChild(ust);

  // hazır başlangıçlar
  const bas = Object.assign(document.createElement('div'), { className: 'baslangic' });
  const sec = document.createElement('select');
  sec.setAttribute('aria-label', 'Hazır başlangıç');
  sec.replaceChildren(Object.assign(document.createElement('option'), { value: '', textContent: 'Hazır başlangıç seç…' }),
    ...Object.keys(BASLANGICLAR).map(ad => Object.assign(document.createElement('option'), { value: ad, textContent: ad })));
  sec.onchange = () => {
    if (!sec.value) return;
    if (!confirm(`"${sec.value}" başlangıcı bütün sayfaların yerine geçecek. Devam edilsin mi?`)) { sec.value = ''; return; }
    liste.forEach(sy => sy.parcalar.forEach(x => fotoSil(x.id)));
    liste.splice(0, liste.length, ...baslangicSayfalari(sec.value)); yeniden(0);
  };
  bas.appendChild(sec); kap.appendChild(bas);

  kap.appendChild(Object.assign(document.createElement('span'), { className: 'ipucu', textContent: `${liste.length > 1 ? `${no + 1}. sayfanın parçaları` : 'Parçalar'} · ${sayfa.parcalar.length}/${EN_FAZLA_PARCA}` }));
  const parcalar = sayfa.parcalar;
  for (const [i, p] of parcalar.entries()) {
    const tur = PARCALAR[p.tur]; if (!tur) continue;
    const kart = Object.assign(document.createElement('div'), { className: 'parca' });
    kart.innerHTML = `<div class="parca-ust"><b></b><span><button type="button" data-y aria-label="Yukarı taşı">↑</button><button type="button" data-a aria-label="Aşağı taşı">↓</button><button type="button" data-s aria-label="Parçayı sil">✕</button></span></div>`;
    kart.querySelector('b').textContent = `${i + 1}. ${tur.ad}`;
    kart.querySelector('[data-y]').disabled = i === 0;
    kart.querySelector('[data-a]').disabled = i === parcalar.length - 1;
    kart.querySelector('[data-y]').onclick = () => { [parcalar[i - 1], parcalar[i]] = [parcalar[i], parcalar[i - 1]]; yeniden(); };
    kart.querySelector('[data-a]').onclick = () => { [parcalar[i + 1], parcalar[i]] = [parcalar[i], parcalar[i + 1]]; yeniden(); };
    kart.querySelector('[data-s]').onclick = () => { parcalar.splice(i, 1); fotoSil(p.id); yeniden(); };
    for (const f of tur.alanlar) {
      if (f.tur === 'secim') {
        const l = Object.assign(document.createElement('label'), { className: 'secim' });
        l.innerHTML = '<input type="checkbox"><span></span>'; l.querySelector('span').textContent = f.etiket;
        const c = l.querySelector('input'); c.checked = !!p[f.ad];
        c.onchange = () => { p[f.ad] = c.checked; kaydet(); };
        kart.appendChild(l); continue;
      }
      if (f.tur === 'liste') {
        const sl = document.createElement('select');
        sl.replaceChildren(...f.secenekler.map(x => Object.assign(document.createElement('option'), { value: x, textContent: `${f.etiket}: ${x}` })));
        sl.value = p[f.ad] ?? f.secenekler[0];
        sl.onchange = () => { p[f.ad] = sl.value; p.tur === 'galeri' ? yeniden() : kaydet(); };   // galeri: fotoğraf alanı sayısı değişir
        kart.appendChild(sl); continue;
      }
      const g = document.createElement(f.tur === 'kisa' ? 'input' : 'textarea');
      if (f.tur === 'kisa') g.type = 'text'; else g.rows = Math.min(5, Math.max(2, (String(p[f.ad] ?? '').match(/\n/g)?.length ?? 0) + 1));
      if (f.tur === 'kod') { g.classList.add('kod'); g.spellcheck = false; g.autocapitalize = 'off'; }
      else { g.lang = 'tr'; g.spellcheck = true; }
      g.value = p[f.ad] ?? ''; g.maxLength = f.max; g.placeholder = f.etiket ?? '';
      g.setAttribute('aria-label', `${tur.ad}: ${f.etiket ?? 'metin'}`);
      g.oninput = () => { p[f.ad] = g.value; kaydet(); };
      kart.appendChild(g);
      if (f.ipucu) kart.appendChild(Object.assign(document.createElement('span'), { className: 'ipucu', textContent: f.ipucu }));
    }
    if (p.tur === 'foto' || tur.foto) kart.appendChild(fotoAlani({ ad: `blok-${p.id}`, etiket: p.tur === 'kisi' ? 'Kişinin fotoğrafı' : 'Fotoğraf', tur: 'foto' }));
    if (p.tur === 'galeri') for (const n of tur.fotolar(p)) kart.appendChild(fotoAlani({ ad: `blok-${p.id}-${n}`, etiket: `${n}. fotoğraf`, tur: 'foto' }));
    kap.appendChild(kart);
  }
  if (parcalar.length < EN_FAZLA_PARCA) {
    const ekle = Object.assign(document.createElement('div'), { className: 'parca-ekle' });
    ekle.innerHTML = '<span class="ipucu">Parça ekle:</span>';
    for (const [tur, t] of Object.entries(PARCALAR))
      ekle.appendChild(dugme(`+ ${t.ad}`, () => { parcalar.push({ id: yeniKimlik(), tur, ...structuredClone(PARCA_ILK[tur]) }); yeniden(); }));
    kap.appendChild(ekle);
  }
  return kap;
}

// ---------------------------------------------------------------- şablondan serbest posta aktarma
// Çizilmiş şablonun öğeleri sırasıyla serbest post parçalarına çevrilir; fotoğraflar ve yüz de geçer.
const ATLANAN = { 'kursu-y': 'kürsü', harita: 'harita', secenek: 'quiz şıkları', 'iki-panel': 'iki panel', logolar: 'logo ızgarası', 'bant-y': 'rol bandı' };
function metinOf(el, vurgu = '*', kalin = '**') {
  let t = '';
  for (const c of el.childNodes) {
    if (c.nodeType === 3) t += c.textContent;
    else if (c.tagName === 'BR') t += '\n';
    else if (c.tagName === 'EM') t += `${vurgu}${metinOf(c, vurgu, kalin)}${vurgu}`;
    else if (c.tagName === 'B') t += `${kalin}${metinOf(c, vurgu, kalin)}${kalin}`;
    else if (c.tagName !== 'I') t += metinOf(c, vurgu, kalin);
  }
  return t.replace(/[ \t]+\n/g, '\n').replace(/\n[ \t]+/g, '\n').trim();
}
function parcalaraAyir(yy, eskiFoto, yeniFoto) {
  const parcalar = [], atlanan = new Set();
  const id = () => Math.random().toString(36).slice(2, 8);
  const fotoTasi = (el, yeni) => { const f = eskiFoto[el?.dataset?.foto]; if (f) yeniFoto[yeni] = f; };
  const tani = c => {
    if (c.matches('.hap')) return { tur: 'hap', metin: c.textContent.trim() };
    if (c.matches('.genis')) return { tur: 'genis', metin: c.textContent.trim() };
    if (c.matches('.dev-y')) return { tur: 'dev', metin: metinOf(c, '*', '') };
    if (c.matches('.bas-o')) return { tur: 'baslik', metin: metinOf(c, '*', '') };
    if (c.matches('p.rakam')) return { tur: 'rakam', metin: c.textContent.trim(), alt: '' };
    if (c.matches('p.ince, .eski-y')) return { tur: 'metin', metin: metinOf(c, '', '**') };
    if (c.matches('.satir')) return { tur: 'bilgi', metin: [...c.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).filter(Boolean).join(' · ') };
    if (c.matches('.buton')) return { tur: 'buton', metin: c.textContent.trim() };
    if (c.matches('.ayrac-y')) return { tur: 'ayrac' };
    if (c.matches('.kod2')) return { tur: 'kod', metin: c.querySelector('pre').textContent };
    // satır içindeki parçalar (saat + açıklama, gün + etkinlik + saat) boşlukla birleşir
    if (c.matches('.liste-y, .gunler, .akis-y')) return { tur: 'liste', metin: [...c.children].map(x => (x.children.length ? [...x.children].map(y => y.textContent.trim()).filter(Boolean).join(' ') : x.textContent).replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n') };
    if (c.matches('.stat-y')) return { tur: 'istatistik', metin: [...c.children].map(x => `${x.querySelector('b')?.textContent ?? ''} ${x.querySelector('small')?.textContent ?? ''}`.trim()).join('\n') };
    if (c.matches('.haplar')) return { tur: 'bilgi', metin: [...c.children].map(x => x.textContent.trim()).join(' · ') };
    if (c.matches('.qr')) return { tur: 'qr', baglanti: '', metin: '' };
    if (c.matches('.kisi-y')) { const p = { id: id(), tur: 'kisi', gorev: c.querySelector('.hap')?.textContent.trim() ?? '', ad: c.querySelector('b')?.textContent.trim() ?? '', alt: c.querySelector('small')?.textContent.trim() ?? '' }; fotoTasi(c.querySelector('.pp'), `blok-${p.id}`); return p; }
    if (c.matches('.galeri-y')) { const p = { id: id(), tur: 'galeri', adet: c.children.length === 2 ? '2' : '3' }; [...c.children].forEach((x, i) => fotoTasi(x, `blok-${p.id}-${i + 1}`)); return p; }
    if (c.matches('.foto-t, .pp')) { const r = c.offsetWidth / Math.max(1, c.offsetHeight); const p = { id: id(), tur: 'foto', oran: r > 1.15 ? 'Yatay' : r < 0.87 ? 'Dikey' : 'Kare' }; fotoTasi(c, `blok-${p.id}`); return p; }
    return null;
  };
  const gez = el => {
    for (const c of el.children) {
      if (c.matches('.logo-yuva, .esn, .kaydir-y')) continue;
      const atla = [...c.classList].find(k => ATLANAN[k]);
      if (atla) { atlanan.add(ATLANAN[atla]); continue; }
      const p = tani(c);
      if (p) { parcalar.push({ id: p.id ?? id(), ...p }); continue; }
      // doğrudan yazı taşıyan kutu (içinde yalnız <br>/<b> olabilir) yazıdır; değilse sarmalayıcıdır (cam kutu, sıra): içine bak
      const yazili = [...c.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
      if (yazili) { parcalar.push({ id: id(), tur: 'metin', metin: metinOf(c, '', '**') }); continue; }
      if (c.children.length) gez(c);
    }
  };
  gez(yy.querySelector('.ic'));
  return { parcalar, atlanan };
}

let aktarimNotu = '';
function serbesteAktar() {
  const mevcut = taslak.degerler.serbest;
  if (mevcut && !confirm('Serbest post\'taki mevcut içerik bu şablonun içeriğiyle değişecek. Devam edilsin mi?')) return;
  const eskiFoto = foto[anahtar()] ?? {}, yeniFoto = {}, atlanan = new Set(), sayfaListe = [];
  for (const c of cizimler) {
    const r = parcalaraAyir(c.yy, eskiFoto, yeniFoto);
    r.atlanan.forEach(x => atlanan.add(x));
    for (let i = 0; i < Math.max(1, r.parcalar.length); i += EN_FAZLA_PARCA) sayfaListe.push({ id: Math.random().toString(36).slice(2, 8), parcalar: r.parcalar.slice(i, i + EN_FAZLA_PARCA) });
  }
  const yy = cizimler[0].yy, w = yy.offsetWidth, h = yy.offsetHeight;
  const bicim = Object.keys(BICIMLER).find(k => BICIMLER[k].w === w && BICIMLER[k].h === h) ?? (w > h ? 'Yatay (1920 × 1080)' : 'Post (1080 × 1440)');
  const fbg = yy.querySelector('.foto-bg'), kon = yy.querySelector('.konsept');
  const zemin = fbg ? 'Fotoğraf' : kon ? 'Konsept' : 'Sade';
  if (fbg) { const f = eskiFoto[fbg.dataset.foto]; if (f) yeniFoto.zeminFoto = f; }
  if (kon?.dataset.foto && eskiFoto[kon.dataset.foto]) yeniFoto.zeminFoto = eskiFoto[kon.dataset.foto];
  const yuz = yuzSec();
  taslak.degerler.serbest = { bicim, zemin, sayfalar: sayfaListe.slice(0, EN_FAZLA_SAYFA) };
  taslak.yuz.serbest = ['a', 'b', 'alarm'].includes(yuz) ? yuz : 'a';
  taslak.surum.serbest = surumSec().id;
  foto.serbest = yeniFoto;
  aktarimNotu = `"${(taban().seri?.ad ?? taban().grup?.ad ?? taban().ad)}" serbest posta aktarıldı.` + (atlanan.size ? ` Aktarılamayan öğeler: ${[...atlanan].join(', ')}.` : '');
  aile = 'Serbest'; aileSekmeleri(); sablonKartlari(); sablonSec('serbest');
}

// ---------------------------------------------------------------- fotoğraf
function fotoAlani(a) {
  const kutu = Object.assign(document.createElement('div'), { className: 'foto-alan' });
  const f = foto[anahtar()]?.[a.ad];
  kutu.innerHTML = `<span class="alan"><span><span></span></span></span>
    <div class="foto-dugmeler"><label class="ikincil" style="cursor:pointer"><span>${f ? 'Değiştir' : a.tur === 'logo' ? 'Logo seç' : 'Fotoğraf seç'}</span><input type="file" accept="image/*" hidden></label>
    <button type="button" class="ikincil" data-kaldir ${f ? '' : 'hidden'}>Kaldır</button></div>
    <label class="alan" ${f && a.tur === 'foto' ? '' : 'hidden'}><span><span>Yakınlaştır</span></span><input type="range" min="1" max="3" step="0.01"></label>
    <p class="not" ${f && a.tur === 'foto' ? '' : 'hidden'}>Konumlamak için önizlemede fotoğrafı sürükle.</p>${a.ipucu ? '<p class="not ipucu"></p>' : ''}`;
  kutu.querySelector('.alan span span').textContent = a.etiket;
  if (a.ipucu) kutu.querySelector('.ipucu').textContent = a.ipucu;
  const zoom = kutu.querySelector('input[type="range"]');
  if (f) zoom.value = f.zoom;
  kutu.querySelector('input[type="file"]').onchange = async e => {
    const d = e.target.files?.[0]; if (!d) return;
    (foto[anahtar()] ??= {})[a.ad] = { ...(await fotoHazirla(d, a.tur === 'logo')), zoom: 1, px: 50, py: 50 };
    formKur(); ciz();
  };
  kutu.querySelector('[data-kaldir]').onclick = () => { delete foto[anahtar()]?.[a.ad]; formKur(); ciz(); };
  zoom.oninput = () => { foto[anahtar()][a.ad].zoom = +zoom.value; ciz(); };
  return kutu;
}

// Büyük telefon fotoğrafını 1600 px'e indir: hem hızlı çizilir hem iOS belleğine sığar.
// Logo: saydamlık korunur (PNG); SVG logo olduğu gibi kullanılır (vektör, küçültmeye gerek yok).
async function fotoHazirla(dosya, logo = false) {
  if (logo && dosya.type === 'image/svg+xml') {
    const src = await new Promise((ok, hata) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = hata; r.readAsDataURL(dosya); });
    return { src, nw: 1, nh: 1 };
  }
  const bmp = await createImageBitmap(dosya, { imageOrientation: 'from-image' });
  const s = Math.min(1, (logo ? 800 : 1600) / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return { src: logo ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.9), nw: c.width, nh: c.height };
}

// Sürükleme: fotoğraf object-fit:cover ile yuvayı doldurur; konum yüzde (0–100) olarak taşma payı içinde değişir.
function suruklemeKur() {
  const on = $('#onizleme');
  let iz = null;
  on.addEventListener('pointerdown', e => {
    const yer = e.target.closest('[data-foto].dolu'); if (!yer) return;
    const f = foto[anahtar()]?.[yer.dataset.foto]; if (!f) return;
    const r = yer.getBoundingClientRect(), k = Math.max(r.width / f.nw, r.height / f.nh) * f.zoom;
    // ekrandaki taşma payı (px); hiç taşmıyorsa o eksende kayma yok
    iz = { x: e.clientX, y: e.clientY, px: f.px, py: f.py, f, img: yer.querySelector('img'), tx: f.nw * k - r.width, ty: f.nh * k - r.height };
    on.setPointerCapture(e.pointerId); e.preventDefault();
  });
  on.addEventListener('pointermove', e => {
    if (!iz) return;
    const sinir = v => Math.max(0, Math.min(100, v));
    if (iz.tx > 1) iz.f.px = sinir(iz.px - (e.clientX - iz.x) / iz.tx * 100);
    if (iz.ty > 1) iz.f.py = sinir(iz.py - (e.clientY - iz.y) / iz.ty * 100);
    iz.img.style.objectPosition = iz.img.style.transformOrigin = `${iz.f.px}% ${iz.f.py}%`;   // anında geri bildirim
  });
  const birak = () => { if (iz) { iz = null; ciz(); } };
  on.addEventListener('pointerup', birak); on.addEventListener('pointercancel', birak);
}

// ---------------------------------------------------------------- denetim ekranı
let denetimNo = 0;
async function denetimCalistir() {
  const no = ++denetimNo;   // sürüm değişince yarım kalan eski denetim listeye yazmayı bırakır
  const surum = surumBul(marka, $('#denetim-surum').value), sonuc = $('#denetim-sonuc'), oz = $('#denetim-ozet');
  sonuc.replaceChildren(); oz.textContent = 'Denetleniyor…'; oz.className = 'ozet';
  const gecici = Object.assign(document.createElement('div'), { className: 'cizim' }); document.body.appendChild(gecici);
  await logolariOnYukle(surum);
  let toplam = 0, sayi = 0;
  // şablonun kendi örneği + (varsa) denetimin denemesi gereken değer varyantları (serbest post: her zemin)
  const denemeler = SABLONLAR.flatMap(s => [ornekDegerler(s), ...(s.denetimDegerleri ?? []).map(d => ({ ...ornekDegerler(s), ...d }))]
    .flatMap(v => { const l = s.yuzFiltre?.(v) ?? s.yuzler; return (l.length ? l : [s.yuzler[0]]).map(y => ({ s, v, y })); }));
  for (const { s, v, y } of denemeler) {
    const { yy, sigmayan, sorunlar } = await cizimYap(s, v, y, surum, gecici);
    if (no !== denetimNo) { gecici.remove(); return; }
    const hepsi = [...sigmayan.map(() => 'yazı sığmıyor'), ...sorunlar];
    toplam += hepsi.length; sayi++;
    const fig = document.createElement('figure');
    fig.innerHTML = `<div class="mini"></div><figcaption><b></b><span></span></figcaption>`;
    fig.querySelector('b').textContent = `${s.ad}${v.zemin && v.zemin !== 'Sade' ? ` · ${v.zemin}` : ''} · ${YUZ_AD[y]}`;
    const sp = fig.querySelector('span');
    sp.className = hepsi.length ? 'sorun' : 'temiz';
    sp.textContent = hepsi.length ? hepsi.join(' · ') : 'Sorun yok';
    sonuc.appendChild(fig);
    kucukGoster(yy, fig.querySelector('.mini'), fig.clientWidth || 220, 300);
    oz.textContent = `Denetleniyor… ${sayi}`;
  }
  gecici.remove();
  oz.textContent = toplam ? `${surum.ad}: ${sayi} görselde ${toplam} sorun. Bu sürüm yayına alınmamalı.` : `${surum.ad}: ${sayi} görselin hepsi temiz. Yayına alınabilir.`;
  oz.className = `ozet${toplam ? '' : ' temiz'}`;
}

// ---------------------------------------------------------------- kit ve yeni logo (yönetim)
function surumSecenekleri(secili) {
  const sec = $('#denetim-surum');
  sec.replaceChildren(...marka.surumler.map(s => Object.assign(document.createElement('option'), {
    value: s.id, textContent: `${s.ad} · ${s.deneme ? 'deneme' : s.id === aktif.id ? 'aktif' : s.baslangic ? `${s.baslangic} itibarıyla` : 'bekliyor'}`,
  })));
  sec.value = secili ?? aktif.id;
}

async function kitIndir() {
  const d = $('#kit-indir'), durum = $('#kit-durum'), surum = surumBul(marka, $('#denetim-surum').value);
  d.disabled = true;
  try {
    const { zip, adet, ad } = await kitUret(marka, surum, m => { durum.textContent = m; });
    durum.textContent = `${adet} dosya, ${(zip.size / 1048576).toFixed(0)} MB.`;
    await kaydet([zip], [ad]);
  } catch (e) { durum.textContent = `Olmadı: ${e.message}`; }
  finally { d.disabled = false; }
}

const dataUrl = dosya => new Promise((ok, hata) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = hata; r.readAsDataURL(dosya); });
const kisaAd = t => t.toLocaleLowerCase('tr').replace(/[ğüşıöç]/g, h => ({ ğ: 'g', ü: 'u', ş: 's', ı: 'i', ö: 'o', ç: 'c' })[h]).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'logo';

// Formdan geçici bir marka sürümü kurar (dosyalar tarayıcıda data: adresi olarak), denetime sokar.
async function yeniLogoDene(e) {
  e.preventDefault();
  const f = new FormData(e.target), koyu = f.get('koyu'), acik = f.get('acik');
  if (!koyu?.size) return;
  const boy = Math.max(60, Math.min(220, +f.get('boy') || 128));
  const gercek = marka.surumler.filter(s => !s.deneme).length;
  const k = await dataUrl(koyu), a = acik?.size ? await dataUrl(acik) : null;
  const rozet = !a && f.get('rozet') ? { rozet: { pay: 0.13, yaricap: 0.2, renk: '#14123A' } } : {};
  const surum = {
    id: `v${gercek + 1}-${kisaAd(f.get('ad'))}`, ad: String(f.get('ad')).trim(), baslangic: f.get('tarih') || null, deneme: true,
    oran: boy / 88,
    yuzler: { a: { dosya: k }, b: { dosya: a ?? k, ...rozet }, alarm: { dosya: a ?? k, ...rozet }, saygi: { dosya: k, filtre: true } },
    profil: { kutu: Math.round(boy * 760 / 128) },   // kare olmayan logo profilde kareye sığar
  };
  surum.dosyaTurleri = { koyu: koyu.type, acik: acik?.size ? acik.type : null };
  marka.surumler = [...marka.surumler.filter(s => !s.deneme), surum];
  surumSecenekleri(surum.id);
  $('#marka-paketi').disabled = false;
  $('#yeni-durum').textContent = 'Denetleniyor: aşağıda her şablon yeni logoyla.';
  await denetimCalistir();
  $('#yeni-durum').textContent = $('#denetim-ozet').textContent;
}

// Yayına alınacak marka klasörü: bütün sürümler + yeni sürümün dosyaları + güncel marka.json
async function markaPaketi() {
  const yeni = marka.surumler.find(s => s.deneme); if (!yeni) return;
  const dosyalar = [], uzanti = t => (t?.includes('svg') ? 'svg' : 'png');
  const json = structuredClone({ ...marka, surumler: marka.surumler });
  for (const s of json.surumler) {
    if (s.deneme) {
      const yol = { [s.yuzler.a.dosya]: `${s.id}/logo-koyu.${uzanti(s.dosyaTurleri.koyu)}` };
      if (s.yuzler.b.dosya !== s.yuzler.a.dosya) yol[s.yuzler.b.dosya] = `${s.id}/logo-acik.${uzanti(s.dosyaTurleri.acik)}`;
      for (const [data, ad] of Object.entries(yol)) dosyalar.push({ ad: `marka/${ad}`, veri: await (await fetch(data)).blob() });
      for (const y of [...Object.values(s.yuzler), ...Object.values(s.profil?.yuzler ?? {})]) y.dosya = yol[y.dosya] ?? y.dosya;
      delete s.deneme; delete s.dosyaTurleri;
    } else {
      for (const y of [...Object.values(s.yuzler), ...Object.values(s.profil?.yuzler ?? {})])
        if (!dosyalar.some(d => d.ad === `marka/${y.dosya}`)) dosyalar.push({ ad: `marka/${y.dosya}`, veri: await (await fetch(`marka/${y.dosya}`)).blob() });
    }
  }
  dosyalar.unshift({ ad: 'marka/marka.json', veri: JSON.stringify(json, null, 2) + '\n' });
  dosyalar.push({ ad: 'BENIOKU.txt', veri: `BMT Post Üretici · marka paketi
Yeni sürüm: ${yeni.ad} (${yeni.id}) · geçiş tarihi: ${yeni.baslangic ?? 'yok (bekler)'}

Yayındaki uygulamanın marka klasörünü bu paketteki "marka" klasörüyle değiştir (app/marka).
Eski sürümler pakette duruyor: geri dönmek için marka.json'da yeni sürümün "baslangic" değerini sil.
Geçiş tarihi gelince uygulama yeni logoya kendiliğinden geçer; o güne kadar başlanan taslaklar kendi sürümüyle biter.
` });
  await kaydet([await zipYap(dosyalar)], [`bmt-marka-${yeni.id}.zip`]);
}

// ---------------------------------------------------------------- sekmeler, tema
function sekmeKur() {
  document.querySelectorAll('[data-sekme]').forEach(b => b.onclick = () => {
    const ad = b.dataset.sekme;
    document.querySelectorAll('[data-sekme]').forEach(x => x.removeAttribute('aria-current'));
    b.setAttribute('aria-current', 'page');
    $('#uret').hidden = ad !== 'uret'; $('#denetim').hidden = ad !== 'denetim';
    if (ad === 'denetim' && !$('#denetim-sonuc').children.length) denetimCalistir();
    if (ad === 'uret') ciz();
  });
}

function temaKur() {
  let t = 'sistem';
  try { t = localStorage.getItem('bmt-tema') ?? 'sistem'; } catch {}
  const uygula = yeni => {
    t = yeni;
    if (t === 'sistem') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t;
    try { localStorage.setItem('bmt-tema', t); } catch {}
    document.querySelectorAll('[data-tema]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tema === t)));
  };
  document.querySelectorAll('[data-tema]').forEach(b => b.onclick = () => uygula(b.dataset.tema));
  uygula(t);
}

// ---------------------------------------------------------------- başlat
async function basla() {
  temaKur(); sekmeKur(); suruklemeKur();
  marka = await markaYukle();
  aktif = aktifSurum(marka);
  await logolariOnYukle(aktif);
  $('#marka-bilgi').textContent = `Marka: ${aktif.ad}`;
  $('#ust-logo').src = dosyaYolu(aktif.yuzler.a.dosya);
  surumSecenekleri(); $('#denetim-surum').onchange = denetimCalistir;
  $('#kit-indir').onclick = kitIndir;
  $('#yeni-logo').onsubmit = yeniLogoDene;
  $('#marka-paketi').onclick = markaPaketi;

  $('#kaydet').onclick = async () => {
    if ($('#kaydet').dataset.hata) return ciz();
    if (!bloblar) return;
    const tarih = new Date().toISOString().slice(0, 10), kok = degerAnahtari(sablon);
    const dosyaAdi = c => c.s.id.replace('#', '-sayfa');   // serbest postun sanal sayfa kimliği (serbest#1) dosya adına uygun olsun
    const adlar = cizimler.map((c, i) => cizimler.length > 1 ? `bmt-${kok}-${i + 1}-${dosyaAdi(c).replace(/-sayfa\d+$/, '')}-${tarih}.png` : `bmt-${dosyaAdi(c).replace(/-sayfa\d+$/, '')}-${tarih}.png`);
    const sonuc = await kaydet(bloblar, adlar);
    if (sonuc === 'indirildi') $('#kaydet-not').textContent = cizimler.length > 1 ? `${cizimler.length} dosya indirildi.` : 'İndirildi.';
  };
  $('#toplu-indir').onclick = topluIndir;
  $('#serbest-aktar').onclick = serbesteAktar;
  $('#sifirla').onclick = () => { const k = anahtar(); delete taslak.degerler[k]; delete taslak.surum[k]; delete foto[k]; kaydetTaslak(); formKur(); ciz(); };
  let boyut; addEventListener('resize', () => { clearTimeout(boyut); boyut = setTimeout(onizle, 150); });

  aileSekmeleri(); panelKur();
  await ciz();
  sablonKartlari();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
}
basla().catch(e => { document.body.insertAdjacentHTML('afterbegin', `<p style="padding:20px;color:#FF7A7F">Uygulama açılamadı: ${e.message}</p>`); });
