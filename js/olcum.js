// Ölçüm: yazıyı alana sığdırmak ve yayından önce çakışma denetimi.
// İkisi de gerçek ölçüde (ölçeksiz) çizilmiş tuval üzerinde çalışır.

// İçerik tuvalin iç alanından taşıyor mu? (.ic flex sütun; boşluklar sıfırlanınca içerik alttan taşar)
function tasiyor(yy) {
  const ic = yy.querySelector('.ic'), r = ic.getBoundingClientRect(), st = getComputedStyle(ic);
  const alt = r.bottom - parseFloat(st.paddingBottom) + 1;
  return [...ic.children].some(c => c.getBoundingClientRect().bottom > alt);
}

// Görünen satır sayısı: kendiliğinden kırılan satırlar dahil.
function satirSayisi(el) {
  const rg = document.createRange(); rg.selectNodeContents(el);
  return new Set([...rg.getClientRects()].filter(q => q.width > 1).map(q => Math.round(q.bottom))).size;
}

// data-sigdir="0.55": yazı taşarsa ya da kullanıcının yazdığı bir satır kendi içinde kırılırsa
// boyu %5'lik adımlarla taban boyun en çok bu oranına kadar küçülür.
// Dönüş: hâlâ sığmayan öğelerin listesi (kullanıcıya "kısalt" uyarısı için).
export function sigdir(yy) {
  const sigmayan = [];
  for (const el of yy.querySelectorAll('[data-sigdir]')) {
    const taban = parseFloat(getComputedStyle(el).fontSize), alt = taban * parseFloat(el.dataset.sigdir);
    // data-satir="serbest": başlık tasarım gereği kendiliğinden kırılır (ör. sahne), satır kuralı uygulanmaz
    const yazilan = el.dataset.satir === 'serbest' ? Infinity : el.querySelectorAll('br').length + 1;   // kullanıcının satırları
    let boy = taban;
    const sorunlu = () => el.scrollWidth > el.clientWidth + 1 || satirSayisi(el) > yazilan || tasiyor(yy);
    while (sorunlu() && boy > alt) {
      boy = Math.max(alt, boy * 0.95);
      el.style.fontSize = `${boy}px`;
    }
    if (sorunlu()) sigmayan.push(el);
    el.dataset.oran = (boy / taban).toFixed(2);
  }
  // serbest postta "küçük" ayarlı parçalar: sığdırmadan sonra küçülür (bkz. sablon/serbest.js, sar)
  for (const el of yy.querySelectorAll('[data-zoom]')) el.style.zoom = el.dataset.zoom;
  return sigmayan;
}

const ADLAR = { 'dev-y': 'dev başlık', 'bas-o': 'başlık', ince: 'açıklama', hap: 'etiket', genis: 'küçük başlık', satir: 'bilgi satırı', buton: 'düğme', rakam: 'dev rakam' };
// blok adları: yalın ve yönelme hâli ("logo tuvalden taşıyor", "açıklama logoya değiyor")
const BLOK = { 'foto-t': ['fotoğraf', 'fotoğrafa'], pp: ['fotoğraf', 'fotoğrafa'], qr: ['QR', "QR'a"], 'logo-yuva': ['logo', 'logoya'] };
const blokAdi = (el, yonelme) => (BLOK[[...el.classList].find(c => BLOK[c])] ?? ['görsel', 'görsele'])[yonelme ? 1 : 0];
const yaziAdi = el => { const k = el.closest('.dev-y, .bas-o, .ince, .hap, .genis, .satir, .buton, .rakam'); return k ? ADLAR[[...k.classList].find(c => ADLAR[c])] : 'yazı'; };

// Denetim: ETU-BMT-Kimlik/uretim/denetim.py'nin yöntemi (kitin "0 sorun" ölçüsüyle aynı sonucu versin diye birebir):
// her metin satırının kutusu; yazı↔yazı çakışmasında satır kutusunun dikeyde %15'i boşluk sayılır;
// 40 px²'den küçük değmeler sayılmaz; yazı fotoğraf/QR/kişi dairesi/logoya binmemeli; yazı ve bloklar tuvalden taşmamalı.
export function denetle(yy) {
  const cr = yy.getBoundingClientRect(), sorunlar = [];
  const satirlar = [];
  const w = document.createTreeWalker(yy, NodeFilter.SHOW_TEXT);
  let n; while ((n = w.nextNode())) {
    if (!n.textContent.trim()) continue;
    const el = n.parentElement, st = getComputedStyle(el);
    if (st.visibility === 'hidden' || st.display === 'none') continue;
    const r = document.createRange(); r.selectNodeContents(n);
    for (const b of r.getClientRects()) if (b.width > 1 && b.height > 1) satirlar.push({ el, b });
  }
  const bloklar = [...yy.querySelectorAll('.foto-t, .qr, .pp, .logo-yuva img')].map(el => ({ el: el.closest('.logo-yuva') ?? el, b: el.getBoundingClientRect() }));
  const kes = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  const sh = b => ({ left: b.left, right: b.right, top: b.top + b.height * .15, bottom: b.bottom - b.height * .15 });
  for (let i = 0; i < satirlar.length; i++) {
    const A = satirlar[i];
    for (let j = i + 1; j < satirlar.length; j++) {
      const B = satirlar[j];
      if (A.el === B.el || A.el.contains(B.el) || B.el.contains(A.el)) continue;
      if (kes(sh(A.b), sh(B.b)) > 40) sorunlar.push(`${yaziAdi(A.el)} ile ${yaziAdi(B.el)} üst üste`);
    }
    for (const K of bloklar) {
      if (K.el.contains(A.el) || A.el.contains(K.el) || K.el.contains(A.el.closest('.pp'))) continue;
      if (kes(A.b, K.b) > 40) sorunlar.push(`${yaziAdi(A.el)} ${blokAdi(K.el, true)} değiyor`);
    }
    const b = A.b;
    if (b.left < cr.left - 1 || b.right > cr.right + 1 || b.top < cr.top - 1 || b.bottom > cr.bottom + 1) sorunlar.push(`${yaziAdi(A.el)} tuvalden taşıyor`);
  }
  for (const K of bloklar) if (K.b.bottom > cr.bottom + 1 || K.b.right > cr.right + 1) sorunlar.push(`${blokAdi(K.el)} tuvalden taşıyor`);
  return [...new Set(sorunlar)];
}

// Tasarım denetimi (serbest post): çakışma yokken de göze batanlar.
//   yakın: art arda iki parça arasında 16 px'ten az boşluk (kişi dairesinin halkası dahil: ::before, 16 px dışarıda)
//   boş: parçalar sayfanın kullanılabilir yüksekliğinin %35'inden azını dolduruyor (ana görsel yok ya da küçük;
//        eşik, kitin seyrek ama dengeli kapaklarını geçirecek kadar düşük)
//   kenar: parça iç kenar boşluğuna taşıyor
export function tasarimDenetle(yy) {
  const ic = yy.querySelector('.ic'), st = getComputedStyle(ic), cr = ic.getBoundingClientRect();
  const ust = cr.top + parseFloat(st.paddingTop), alt = cr.bottom - parseFloat(st.paddingBottom);
  const sol = cr.left + parseFloat(st.paddingLeft), sag = cr.right - parseFloat(st.paddingRight);
  const bos = el => el.classList.contains('esn') || (!el.children.length && !el.textContent.trim() && !el.className);
  const gorunur = el => {   // öğenin görünen sınırı: kutusu, yazı satırları, kişi halkaları
    const r = el.getBoundingClientRect(); let b = { top: r.top, bottom: r.bottom, left: r.left, right: r.right };
    const ekle = q => { if (q.width > 1 && q.height > 1) b = { top: Math.min(b.top, q.top), bottom: Math.max(b.bottom, q.bottom), left: Math.min(b.left, q.left), right: Math.max(b.right, q.right) }; };
    const rg = document.createRange(); rg.selectNodeContents(el);   // yazı satırı: kit denetimi gibi dikeyde %15 pay (harf kutusunun boş üst/altı)
    [...rg.getClientRects()].forEach(q => ekle(new DOMRect(q.left, q.top + q.height * .15, q.width, q.height * .7)));
    for (const pp of [el, ...el.querySelectorAll('.pp')].filter(x => x.classList?.contains('pp'))) { const q = pp.getBoundingClientRect(); ekle(new DOMRect(q.left - 19, q.top - 19, q.width + 38, q.height + 38)); }
    return b;
  };
  const ogeler = [...ic.children].filter(el => !bos(el)).map(el => ({ el, b: gorunur(el) }));
  const TASARIM_AD = [['.logo-yuva', 'logo'], ['.kaydir-y', 'sayfa noktaları'], ['.kisi-y, .pp', 'kişi'], ['.dev-y', 'dev başlık'], ['.rakam', 'dev rakam'],
    ['.bas-o', 'başlık'], ['.galeri-y', 'galeri'], ['.foto-t', 'fotoğraf'], ['.qr', 'QR'], ['.kod2', 'kod kartı'], ['.liste-y', 'liste'], ['.stat-y', 'istatistik'],
    ['.ikon-dev', 'ikon satırı'], ['.ayrac-y', 'ayraç'], ['.satir', 'bilgi satırı'], ['.buton', 'düğme'], ['.hap', 'etiket'], ['.genis', 'küçük başlık'], ['.ince', 'açıklama']];
  const ad = el => TASARIM_AD.find(([q]) => el.matches(q) || el.querySelector(q))?.[1] ?? 'parça';
  const sorunlar = [];
  for (let i = 1; i < ogeler.length; i++) {
    const a = ogeler[i - 1], b = ogeler[i], ara = b.b.top - a.b.bottom;
    if (ara < 16) sorunlar.push(`${ad(a.el)} ile ${ad(b.el)} çok yakın (${Math.max(0, Math.round(ara))} px): alttakinin boşluğunu artır`);
  }
  const icerik = ogeler.filter(o => !o.el.matches('.logo-yuva, .kaydir-y'));
  if (icerik.length) {
    const logo = ogeler.find(o => o.el.matches('.logo-yuva')), bas = logo ? logo.b.bottom : ust;
    const dolu = icerik.reduce((t, o) => t + (o.b.bottom - o.b.top), 0) / (alt - bas);
    if (dolu < 0.35) sorunlar.push(`Sayfa boş kalıyor (içerik %${Math.round(dolu * 100)}): bir parçayı büyüt ya da bir ana görsel ekle (dev başlık, dev rakam, fotoğraf)`);
  }
  for (const o of ogeler) if (o.b.left < sol - 2 || o.b.right > sag + 2) sorunlar.push(`${ad(o.el)} kenar boşluğuna taşıyor: küçült`);
  return sorunlar;
}
