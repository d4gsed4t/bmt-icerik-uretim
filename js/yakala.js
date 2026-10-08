// Tuvali PNG'ye çevirme ve kaydetme.
// snapDOM, tarayıcının kendi çizimini kullanır (SVG foreignObject): 2026-10-07 denemesinde headless Chrome
// çıktısıyla ortalama 0,25/255 fark. Safari'de bu yöntemin bilinen tuzağı: ilk çizim boş gelebilir → boşsa bir kez daha çiz.
import { snapdom } from '../vendor/snapdom.mjs';

async function bosMu(blob) {
  try {
    const bmp = await createImageBitmap(blob);
    const c = new OffscreenCanvas(32, 32), g = c.getContext('2d');
    g.drawImage(bmp, 0, 0, 32, 32);
    const d = g.getImageData(0, 0, 32, 32).data;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 0) return false;  // tek bir görünür piksel yeter
    return true;
  } catch { return false; }  // denetlenemiyorsa çizimi engelleme
}

// olcek: 1 paylaşım için (şablon ölçüsü), 2 baskı için (sertifika: ~190 dpi)
export async function pngYap(el, olcek = 1) {
  for (let deneme = 0; deneme < 3; deneme++) {
    const blob = await snapdom.toBlob(el, { type: 'png', scale: olcek, dpr: 1, embedFonts: true, reconcile: true });
    // dpr 1: her cihazda tam şablon ölçüsü (Retina'da 2× olmasın). reconcile: satır kırılımını kopyada da birebir koru
    // (snapDOM'un kendi uyarısı; ~2× yavaş ama Safari'de farklı kırılmaya karşı birebirlik daha önemli)
    if (blob && !(await bosMu(blob))) return blob;
  }
  throw new Error('Görsel çizilemedi');
}

// Telefonda paylaşım menüsü (iOS: "Resmi Kaydet", Android: Galeri), masaüstünde indirme.
// Seride bütün sayfalar tek paylaşımda gider (carousel'i Instagram'a sırasıyla yüklemek için).
// iOS, paylaşımı yalnız dokunuş anında kabul eder: PNG'ler önceden hazırlanmış olmalı, burada bekleme yapılmaz.
export async function kaydet(bloblar, adlar) {
  const dosyalar = bloblar.map((b, i) => new File([b], adlar[i], { type: b.type || 'image/png' }));
  if (matchMedia('(pointer: coarse)').matches && navigator.canShare?.({ files: dosyalar })) {
    try { await navigator.share({ files: dosyalar }); return 'paylasildi'; }
    catch (e) { if (e.name === 'AbortError') return 'vazgecildi'; }
  }
  for (const [i, d] of dosyalar.entries()) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(d); a.download = d.name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    if (i < dosyalar.length - 1) await new Promise(r => setTimeout(r, 400));   // tarayıcı art arda indirmeyi engellemesin
  }
  return 'indirildi';
}
