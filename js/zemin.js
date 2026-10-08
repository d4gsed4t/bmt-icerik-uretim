// Ortak zemin dokusu: çok soluk 60° kristal ızgara, sağ üstten yayılıp kaybolur.
// bmt.py izgara() + yeni.py zemin() karşılığı; iki yüz için iki renk (zA koyu, zB açık/alarm).
let sayac = 0;

function izgara(w, h, renk, opaklik, s = 120, kalinlik = 2) {
  const u = `z${++sayac}`;
  const aci = [0, 60, 120];
  const desen = aci.map(a => `<pattern id="${u}p${a}" width="${s}" height="${s}" patternUnits="userSpaceOnUse" patternTransform="rotate(${a})">`
    + `<line x1="0" y1="0" x2="0" y2="${s}" stroke="${renk}" stroke-width="${kalinlik}"/></pattern>`).join('');
  const maske = `<radialGradient id="${u}g" cx="85%" cy="8%" r="95%"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`
    + `<mask id="${u}m"><rect width="${w}" height="${h}" fill="url(#${u}g)"/></mask>`;
  const katman = aci.map(a => `<rect width="${w}" height="${h}" fill="url(#${u}p${a})"/>`).join('');
  return `<svg class="z" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>${desen}${maske}</defs>`
    + `<g opacity="${opaklik}" mask="url(#${u}m)">${katman}</g></svg>`;
}

export function zemin(w, h) {
  return `<div class="zA">${izgara(w, h, '#77ACD4', 0.09)}</div><div class="zB">${izgara(w, h, '#262261', 0.07)}</div>`;
}
