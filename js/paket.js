// Dosya paketleme, dış kütüphanesiz: ZIP (sıkıştırmasız, PNG/JPEG zaten sıkışık) ve görsellerden PDF.
// Toplu sertifika (PDF), "Kiti indir" ve marka paketi (ZIP) bunları kullanır.

// ---------------------------------------------------------------- ZIP (store)
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };

// dosyalar: [{ ad: 'klasor/dosya.png', veri: Blob | Uint8Array | string }] → Blob (application/zip)
export async function zipYap(dosyalar) {
  const enc = new TextEncoder(), parcalar = [], merkez = [];
  let konum = 0;
  const simdi = new Date();
  const dosTarih = ((simdi.getFullYear() - 1980) << 9) | ((simdi.getMonth() + 1) << 5) | simdi.getDate();
  const dosSaat = (simdi.getHours() << 11) | (simdi.getMinutes() << 5) | (simdi.getSeconds() >> 1);
  for (const d of dosyalar) {
    const veri = typeof d.veri === 'string' ? enc.encode(d.veri) : d.veri instanceof Uint8Array ? d.veri : new Uint8Array(await d.veri.arrayBuffer());
    const ad = enc.encode(d.ad), crc = crc32(veri);
    const yerel = new DataView(new ArrayBuffer(30));
    yerel.setUint32(0, 0x04034b50, true); yerel.setUint16(4, 20, true); yerel.setUint16(6, 0x0800, true);   // UTF-8 ad
    yerel.setUint16(8, 0, true); yerel.setUint16(10, dosSaat, true); yerel.setUint16(12, dosTarih, true);
    yerel.setUint32(14, crc, true); yerel.setUint32(18, veri.length, true); yerel.setUint32(22, veri.length, true);
    yerel.setUint16(26, ad.length, true); yerel.setUint16(28, 0, true);
    parcalar.push(yerel, ad, veri);
    const m = new DataView(new ArrayBuffer(46));
    m.setUint32(0, 0x02014b50, true); m.setUint16(4, 20, true); m.setUint16(6, 20, true); m.setUint16(8, 0x0800, true);
    m.setUint16(10, 0, true); m.setUint16(12, dosSaat, true); m.setUint16(14, dosTarih, true);
    m.setUint32(16, crc, true); m.setUint32(20, veri.length, true); m.setUint32(24, veri.length, true);
    m.setUint16(28, ad.length, true); m.setUint32(42, konum, true);
    merkez.push(m, ad);
    konum += 30 + ad.length + veri.length;
  }
  const merkezBoy = merkez.reduce((t, p) => t + p.byteLength, 0);
  const son = new DataView(new ArrayBuffer(22));
  son.setUint32(0, 0x06054b50, true); son.setUint16(8, dosyalar.length, true); son.setUint16(10, dosyalar.length, true);
  son.setUint32(12, merkezBoy, true); son.setUint32(16, konum, true);
  return new Blob([...parcalar, ...merkez, son], { type: 'application/zip' });
}

// ---------------------------------------------------------------- PDF (her sayfa bir JPEG)
// sayfalar: [{ jpeg: Blob, w, h }] (piksel); sayfaPt: [genişlik, yükseklik] punto (A4 yatay 842 × 595).
export async function pdfYap(sayfalar, sayfaPt) {
  const enc = new TextEncoder(), parcalar = [], konumlar = [];
  let boy = 0;
  const yaz = p => { const b = typeof p === 'string' ? enc.encode(p) : p; parcalar.push(b); boy += b.length; };
  const nesne = (no, govde) => { konumlar[no] = boy; yaz(`${no} 0 obj\n`); for (const g of [].concat(govde)) yaz(g); yaz('\nendobj\n'); };
  yaz('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  const n = sayfalar.length, [PW, PH] = sayfaPt;
  // nesne düzeni: 1 katalog, 2 sayfa ağacı, her sayfa için 3 nesne (sayfa, içerik, görsel)
  const sayfaNo = i => 3 + i * 3;
  nesne(1, '<< /Type /Catalog /Pages 2 0 R >>');
  nesne(2, `<< /Type /Pages /Count ${n} /Kids [${sayfalar.map((_, i) => `${sayfaNo(i)} 0 R`).join(' ')}] >>`);
  for (const [i, s] of sayfalar.entries()) {
    const no = sayfaNo(i), jpeg = new Uint8Array(await s.jpeg.arrayBuffer());
    const icerik = `q ${PW} 0 0 ${PH} 0 0 cm /G Do Q`;
    nesne(no, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /XObject << /G ${no + 2} 0 R >> >> /Contents ${no + 1} 0 R >>`);
    nesne(no + 1, [`<< /Length ${icerik.length} >>\nstream\n`, icerik, '\nendstream']);
    nesne(no + 2, [`<< /Type /XObject /Subtype /Image /Width ${s.w} /Height ${s.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`, jpeg, '\nendstream']);
  }
  const xref = boy, adet = 3 + n * 3;
  yaz(`xref\n0 ${adet}\n0000000000 65535 f \n`);
  for (let i = 1; i < adet; i++) yaz(`${String(konumlar[i]).padStart(10, '0')} 00000 n \n`);
  yaz(`trailer\n<< /Size ${adet} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(parcalar, { type: 'application/pdf' });
}

// PNG blob → JPEG blob (PDF'e girecek sayfalar için; beyaz zemin üstüne)
export async function jpegYap(pngBlob, kalite = 0.92) {
  const bmp = await createImageBitmap(pngBlob);
  const c = new OffscreenCanvas(bmp.width, bmp.height), g = c.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(bmp, 0, 0);
  return { jpeg: await c.convertToBlob({ type: 'image/jpeg', quality: kalite }), w: bmp.width, h: bmp.height };
}
