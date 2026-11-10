// Amaldagi lotin yozuvi → 2027-yil 22-apreldan kuchga kiradigan yangi lotin alifbosi.
// Oʻ→Ö, Gʻ→Ğ, Sh→Ş, Ch→Ç (scripts/i18n-check.mjs bilan bir xil qoidalar).
// data.egov.uz kabi tashqi manbalardagi matnlar uchun ishlatiladi.
const APOS = "[ʻ‘’'`]";
const rules: [RegExp, string][] = [
  [new RegExp('O' + APOS, 'g'), 'Ö'], [new RegExp('o' + APOS, 'g'), 'ö'],
  [new RegExp('G' + APOS, 'g'), 'Ğ'], [new RegExp('g' + APOS, 'g'), 'ğ'],
  [/SH/g, 'Ş'], [/Sh/g, 'Ş'], [/sh/g, 'ş'], [/CH/g, 'Ç'], [/Ch/g, 'Ç'], [/ch/g, 'ç'],
];

export function toYangi(text: string): string {
  return text
    // URL va domen nomlari (xorijdaish.uz, @email) o‘girilmaydi
    .split(/(https?:\/\/\S+|[\w.+-]+@[\w.-]+|[\w.-]+\.(?:uz|com|org|net|cc|me|ru|io)\b)/)
    .map((p, i) => (i % 2 ? p : rules.reduce((s, [re, to]) => s.replace(re, to), p)))
    .join('');
}
