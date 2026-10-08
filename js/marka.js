// Marka katmanı: logo şablonun içinde değil, marka/marka.json'da yaşar.
// Şablon yalnız "buraya şu boyda kilit gelir" der (kilit px, Python'daki kilit(px) ile aynı ölçek);
// hangi dosyanın, hangi gerçek boyda geleceğine marka sürümü karar verir.

export async function markaYukle() {
  const r = await fetch('marka/marka.json', { cache: 'no-cache' });
  if (!r.ok) throw new Error('marka.json okunamadı');
  return r.json();
}

// Aktif sürüm: başlangıç tarihi bugünü geçmiş en yeni sürüm. Tarihi boş olan sürüm bekler.
export function aktifSurum(marka, bugun = new Date()) {
  const gun = bugun.toISOString().slice(0, 10);
  const gecerli = marka.surumler
    .filter(s => s.baslangic && s.baslangic <= gun)
    .sort((a, b) => a.baslangic.localeCompare(b.baslangic));
  return gecerli.at(-1) ?? marka.surumler[0];
}

export function surumBul(marka, id) {
  return marka.surumler.find(s => s.id === id) ?? null;
}

// Python'un round()'u: tam ortadaki değer çifte yuvarlanır (128.5 → 128). Kitle piksel piksel aynı boy için.
const pyRound = x => { const f = Math.floor(x), d = x - f; return d > 0.5 ? f + 1 : d < 0.5 ? f : (f % 2 === 0 ? f : f + 1); };

// Dosya yolu: yönetim sayfasında denenen logo henüz dosya değil, tarayıcıdaki veri (data: adresi)
export const dosyaYolu = (d, onEk = '') => (d.startsWith('data:') ? d : `${onEk}marka/${d}`);

// Hangi dosya: profil modunda sürümün profil dosyası (varsa), yoksa yüzün kendi dosyası.
// Tanımsız yüz koyu dosyayı kullanır (fotoğraf zemini de koyudur).
function yuzDosyasi(surum, yuz, profil) {
  if (profil && surum.profil?.yuzler) return surum.profil.yuzler[yuz] ?? surum.profil.yuzler.a;
  return surum.yuzler[yuz] ?? surum.yuzler.a;
}

// Logonun kendi yüksekliği: round(kilit × oran), profilde sabit. profil.kutu: kare olmayan logo profilde
// bu kareye oranı korunarak sığar (yatay logo yüksekliğe göre büyütülürse tuvalden taşar).
const logoH = (surum, kilit, profil) => (profil ? surum.profil.kutu ?? surum.profil.yukseklik : pyRound(kilit * surum.oran));

// Yuvanın toplam yüksekliği: rozetli yüzde iç boşluk her yanda round(h × pay).
export function logoBoyu(surum, yuz, kilit = 88, profil = false) {
  const y = yuzDosyasi(surum, yuz, profil), h = logoH(surum, kilit, profil);
  return y.rozet ? h + 2 * pyRound(h * y.rozet.pay) : h;
}

// yuz: a (koyu) | b (açık) | alarm | saygi | foto. profil: kilit yerine yalnız işaret, sabit boy (profil görseli).
// Rozet CSS ile çizilir (Python kitindeki .elg gibi): hazır rozet SVG'si büyük boyda iç logoyu 2 px kaydırıyordu.
export function logoHTML(surum, yuz, kilit = 88, onEk = '', profil = false) {
  const y = yuzDosyasi(surum, yuz, profil), h = logoH(surum, kilit, profil);
  const g = profil && surum.profil?.kutu ? `width:${h}px;object-fit:contain;`
    : surum.genislik_orani && !(profil && surum.profil?.yuzler) ? `width:${pyRound(h * surum.genislik_orani)}px;` : '';
  const img = `<img src="${dosyaYolu(y.dosya, onEk)}" alt="" style="height:${h}px;${g}">`;
  const ic = y.rozet
    ? `<span class="rozet" style="background:${y.rozet.renk};padding:${pyRound(h * y.rozet.pay)}px;border-radius:${pyRound(h * y.rozet.yaricap)}px">${img}</span>`
    : img;
  return `<div class="logo-yuva${y.filtre ? ' filtre' : ''}" style="height:${logoBoyu(surum, yuz, kilit, profil)}px">${ic}</div>`;
}

// Sürüm değişince tarayıcı yeni logoyu önceden indirsin: yakalama sırasında eksik görsel kalmasın.
export function logolariOnYukle(surum, onEk = '') {
  return Promise.all(Object.values(surum.yuzler).map(y => new Promise(res => {
    const i = new Image(); i.onload = i.onerror = res; i.src = dosyaYolu(y.dosya, onEk);
    setTimeout(res, 3000);
  })));
}
