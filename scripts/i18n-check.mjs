// Tillar faylini tekshirish:   npm run i18n
// Özbekça (yangi alifbo) qatorlarini O‘zbekcha’dan qayta yaratish:   npm run i18n:yangi
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = new URL('../public/data/i18n.json', import.meta.url);
const data = JSON.parse(readFileSync(FILE, 'utf8'));
const S = data.strings;
const base = data.default;

// Amaldagi lotin → 2027-yilgi yangi lotin alifbosi (Oʻ→Ö, Gʻ→Ğ, Sh→Ş, Ch→Ç). src/lib/translit.ts bilan bir xil.
const pairs = [['Oʻ', 'Ö'], ['oʻ', 'ö'], ['Gʻ', 'Ğ'], ['gʻ', 'ğ'], ['SH', 'Ş'], ['Sh', 'Ş'], ['sh', 'ş'], ['CH', 'Ç'], ['Ch', 'Ç'], ['ch', 'ç']];
// {o‘zgaruvchi}, URL va domen nomlari (xorijdaish.uz) o‘girilmaydi
const KEEP = /(\{[^}]*\}|https?:\/\/\S+|[\w.-]+\.(?:uz|com|org|net|cc|me|ru|io)\b)/;
const toYangi = (s) => s.split(KEEP).map((p, i) => (i % 2) ? p : pairs.reduce((a, [x, y]) => a.split(x).join(y), p)).join('');
const conv = (v) => typeof v === 'string' ? toYangi(v) : Array.isArray(v) ? v.map(toYangi) : Object.fromEntries(Object.entries(v).map(([k, x]) => [k, toYangi(x)]));

if (process.argv.includes('--write-yangi')) {
  S['uz-yangi'] = Object.fromEntries(Object.entries(S['uz-latn']).map(([k, v]) => [k, k === '@date' ? v : conv(v)]));
  writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n');
  console.log('uz-yangi qayta yaratildi');
}

let errors = 0;
const keys = Object.keys(S[base]);
for (const code of Object.keys(data.languages)) {
  const loc = S[code];
  if (!loc) { console.error(`✗ ${code}: tarjimalar yo‘q`); errors++; continue; }
  const missing = keys.filter((k) => !(k in loc));
  const extra = Object.keys(loc).filter((k) => !keys.includes(k));
  if (missing.length) { console.error(`✗ ${code}: yetishmaydi → ${missing.join(', ')}`); errors++; }
  if (extra.length) console.warn(`! ${code}: ortiqcha → ${extra.join(', ')}`);
  for (const [k, v] of Object.entries(loc)) {
    const texts = typeof v === 'string' ? [v] : Array.isArray(v) ? v : Object.values(v);
    for (const s of texts) {
      if (s.includes("'")) { console.error(`✗ ${code} ${k}: ASCII apostrof (') — oʻ/gʻ uchun ʻ, tutuq uchun ʼ ishlating`); errors++; }
      if (code === 'uz-latn' && /[oOgG][‘’`]/.test(s)) { console.error(`✗ ${code} ${k}: oʻ/gʻ da noto‘g‘ri belgi — U+02BB (ʻ) bo‘lishi kerak`); errors++; }
      if (code === 'uz-yangi' && /(sh|ch|[oOgG]ʻ)/i.test(s.replace(new RegExp(KEEP.source, 'g'), ''))) { console.error(`✗ ${code} ${k}: eski alifbo harfi qolgan`); errors++; }
    }
    // {placeholder} lar bir xil bo‘lishi kerak
    if (typeof v === 'string' && typeof S[base][k] === 'string') {
      const ph = (x) => (x.match(/\{[a-z]+\}/g) || []).sort().join();
      if (ph(v) !== ph(S[base][k])) { console.error(`✗ ${code} ${k}: {placeholder} mos emas`); errors++; }
    }
  }
}
console.log(errors ? `\n${errors} ta xato` : `✓ ${Object.keys(data.languages).length} til, ${keys.length} kalit — xatosiz`);
process.exit(errors ? 1 : 0);
