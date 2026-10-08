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
