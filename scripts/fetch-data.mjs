// Rasmiy manbalardan maʼlumot yig‘ib, public/data/*.json ga yozadi (PWA oflayn ishlashi uchun).
//   npm run data
//
//  agencies.json — Xususiy bandlik agentliklari reestri (Migratsiya agentligi, gov.uz) · 4 til
//  embassies.json — Xorijdagi vakolatxonalar (data.egov.uz) · 4 til bitta faylda
//  visa.json     — Oʻzbekiston fuqarolari uchun viza talablari (TIV, gov.uz) · davlatlar ISO kodi bilan
//  courses.json  — Til va kasb kurslari («Xorijda ish» tizimi, lm-api.xorijdaish.uz)
//
// Manba ishlamasa yoki natija shubhali bo‘lsa — eski fayl o‘zgarmaydi (deploy to‘xtamaydi).
// Node 22+ (fetch va to‘liq ICU — davlat nomlari Intl.DisplayNames orqali).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const OUT = (f) => new URL(`../public/data/${f}`, import.meta.url);
const UA = { 'User-Agent': 'Mozilla/5.0 (compatible; SafarUzbekistan-data/2.0)' };
const today = new Date().toISOString().slice(0, 10);
const LANGS = ['uz-latn', 'uz-cyrl', 'ru', 'en'];
// gov.uz til kodlari: oz — lotin, uz — kirill
const GOV = { 'uz-latn': 'oz', 'uz-cyrl': 'uz', ru: 'ru', en: 'en' };

let warnings = 0;
const warn = (m) => { warnings++; console.warn('! ' + m); };

async function get(url, type = 'text') {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(60_000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return type === 'json' ? await r.json() : await r.text();
    } catch (e) {
      if (i === 2) throw new Error(`${url}: ${e.message}`);
      await new Promise((ok) => setTimeout(ok, 2000 * (i + 1)));
    }
  }
}

// ---------- matn yordamchilari ----------
const ENT = { nbsp: ' ', amp: '&', quot: '"', lt: '<', gt: '>', laquo: '«', raquo: '»', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’', ndash: '–', mdash: '—', apos: "'" };
const decode = (s) => s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) =>
  e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : +e.slice(1)) : ENT[e.toLowerCase()] ?? m);
/** HTML → qatorlar (br, p, li, div, h* qator ajratadi) */
const lines = (html) => decode(html
  .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
  .replace(/<br\s*\/?>|<\/(p|li|div|h\d|tr)>/gi, '\n')
  .replace(/<[^>]+>/g, ' '))
  .split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
const clean = (s) => s.replace(/\s+/g, ' ').replace(/\s+([,.])/g, '$1').replace(/^[\s,;|]+|[\s,;|]+$/g, '').trim();
/** o‘zbek lotini: oʻ/gʻ → U+02BB, qolgan apostrof → U+02BC */
const uzLat = (s) => s.replace(/([oOgG])[‘’'`ʼ]/g, '$1ʻ').replace(/(\S)['’`]/g, '$1ʼ');
/** “ ” „ " → «» (inglizchada “”), qo‘shtirnoq ichidagi ortiqcha bo‘shliqlarsiz */
const fixQuotes = (s, l = 'uz-latn') => s.replace(/[“”„"«»]/g, '"').replace(/"\s*([^"]*?)\s*"/g, l === 'en' ? '“$1”' : '«$1»');

// ---------- hududlar (ISO 3166-2:UZ) ----------
const REGION_RULES = [
  ['TO', /toshkent\s+vil|тошкент\s+вил|ташкентская\s+обл|tashkent\s+reg/i],
  ['TK', /toshkent|тошкент|ташкент|tashkent/i],
  ['AN', /andijon|андижон|андижан|andijan/i], ['BU', /buxoro|бухоро|бухар|bukhara/i],
  ['FA', /farg|фарғона|ферган|fergana/i], ['JI', /jizzax|жиззах|джизак|jizzakh/i],
  ['NG', /namangan|наманган/i], ['NW', /navoiy|навоий|навои|navoi/i],
  ['QA', /qashqadaryo|қашқадарё|кашкадар|kashkadarya|qarshi/i],
  ['QR', /qoraqalpog|қорақалпоғ|каракалпак|karakalpak|nukus|нукус/i],
  ['SA', /samarqand|самарқанд|самарканд|samarkand/i], ['SI', /sirdaryo|сирдарё|сырдар|syrdarya|guliston/i],
  ['SU', /surxondaryo|сурхондарё|сурхандар|surkhandarya|termiz/i], ['XO', /xorazm|хоразм|хорезм|khorezm|urganch/i],
];
const regionOf = (text) => REGION_RULES.find(([, re]) => re.test(text))?.[0] ?? null;

function keepOld(file, reason) {
  warn(`${file}: ${reason} — eski fayl saqlab qolindi`);
}
function write(file, data) {
  writeFileSync(OUT(file), JSON.stringify(data, null, 1) + '\n');
  console.log(`✓ ${file}`);
}

// =====================================================================
// 1. Xususiy bandlik agentliklari
// =====================================================================
const AG_PATH = 'migration/activity_page/xususiy-bandlik-agentliklari_';

function parseAgencyRows(html) {
  const t = html.indexOf('<table');
  if (t < 0) return [];
  const table = html.slice(t, html.indexOf('</table>', t));
  const rows = [];
  for (const tr of table.match(/<tr[\s\S]*?<\/tr>/gi) || []) {
    const cells = (tr.match(/<t[dh][\s\S]*?<\/t[dh]>/gi) || []).map((c) => lines(c));
    if (cells.length < 5) continue;
    const no = parseInt(cells[0].join(' '), 10);
    if (!no) continue; // sarlavha qatori
    const contact = cells[3].join('\n');
    const emails = [...new Set((contact.match(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g) || []).map((e) => e.toLowerCase()))];
    let rest = contact.replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, ' ');
    const phones = [];
    rest = rest.replace(/(\+?\s*998)?[\s(]*\d{2}[\s)]*\d{3}[\s-]?\d{2}[\s-]?\d{2}/g, (m) => {
      const d = m.replace(/\D/g, '');
      const full = d.length === 9 ? '998' + d : d;
      if (full.length === 12 && !phones.some((p) => p.tel === '+' + full)) phones.push({ tel: '+' + full, text: clean(m) });
      return ' ';
    });
    const lic = cells[4].join(' ');
    const date = lic.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    rows.push({
      no,
      name: clean(cells[1].join(' ')),
      address: clean(cells[2].join(' ')),
      head: clean(rest.replace(/[,;]+/g, ' ')),
      phones, emails,
      license: (lic.match(/№?\s*(\d{2,})/) || [])[1] ?? '',
      date: date ? `${date[3]}-${date[2]}-${date[1]}` : '',
    });
  }
  return rows;
}

async function agencies() {
  const pages = {};
  for (const l of LANGS) {
    const url = `https://gov.uz/${GOV[l]}/${AG_PATH}`;
    try { pages[l] = { url, rows: parseAgencyRows(await get(url)) }; }
    catch (e) { warn(`agentliklar (${l}): ${e.message}`); pages[l] = { url, rows: [] }; }
    console.log(`  agentliklar ${l}: ${pages[l].rows.length}`);
  }
  const base = pages['uz-latn'].rows;
  if (base.length < 10) return keepOld('agencies.json', `oʻzbekcha jadval topilmadi (${base.length})`);

  const key = (r) => r.license.replace(/^0+/, '');
  const find = (l, r) => pages[l].rows.find((x) => key(x) && key(x) === key(r)) ?? pages[l].rows.find((x) => x.no === r.no);
  const items = base.map((r) => {
    const loc = Object.fromEntries(LANGS.map((l) => [l, l === 'uz-latn' ? r : find(l, r)]));
    const pick = (f) => Object.fromEntries(LANGS.map((l) => {
      const v = loc[l]?.[f] ? (l === 'uz-latn' ? uzLat(loc[l][f]) : loc[l][f]) : uzLat(r[f]);
      return [l, f === 'name' ? fixQuotes(v, l) : v];
    }));
    const phones = [...r.phones];
    const emails = [...r.emails];
    for (const l of LANGS) for (const p of loc[l]?.phones ?? []) if (!phones.some((x) => x.tel === p.tel)) phones.push(p);
    for (const l of LANGS) for (const e of loc[l]?.emails ?? []) if (!emails.includes(e)) emails.push(e);
    return {
      id: key(r) || String(r.no), no: r.no, license: r.license, date: r.date,
      region: regionOf(r.address),
      name: pick('name'), address: pick('address'), head: pick('head'),
      phones: phones.map((p) => p.tel), emails,
    };
  });
  const noRegion = items.filter((i) => !i.region).map((i) => i.no);
  if (noRegion.length) warn(`agentliklar: hudud aniqlanmadi → №${noRegion.join(', ')}`);
  write('agencies.json', {
    fetched: today,
    source: Object.fromEntries(LANGS.map((l) => [l, pages[l].url])),
    items,
  });
}

// =====================================================================
// 2. Viza talablari
// =====================================================================
const VISA_PATH = 'mfa/pages/o-zbekiston-respublikasi-fuqarolari-uchun-viza-talablari';
const GROUPS = {
  // birinchi mos kelgani olinadi (tartib muhim)
  tourist: /turistik|туристическ|tourist/i,
  arrival: /visa on arrival|kelganda|по прибытии/i,
  evisa: /e-visa|elektron viza|электронной виз/i,
  free: /to[ʻ‘’'`]?liq vizasiz|полный безвизов|visa-free/i,
};
const isCountry = (l) => l.length <= 45 && !/\d/.test(l) && !/[:()]/.test(l) && /[,.]?$/.test(l);

function parseVisa(html) {
  const ls = lines(html);
  const start = ls.findIndex((l) => /vizasiz rejim joriy|безвизовый режим для граждан|visa-free regime/i.test(l));
  const endIdx = ls.findIndex((l, i) => i > start && /oxirgi yangilan|последнее обновление|last update/i.test(l));
  if (start < 0) return null;
  const updated = (ls[endIdx] || '').match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? '';
  const groups = {};
  let cur = null;
  for (const l of ls.slice(start + 1, endIdx < 0 ? undefined : endIdx)) {
    const g = /\d/.test(l) && Object.keys(GROUPS).find((k) => GROUPS[k].test(l));
    if (g) { cur = g; groups[g] = []; continue; }
    if (!cur) continue;
    if (isCountry(l)) groups[cur].push(l.replace(/[,.\s]+$/, '').trim());
    else if (groups[cur].length) cur = null; // ro‘yxat tugadi
  }
  return { updated, groups };
}

// Davlat nomi → ISO kodi (ICU nomlari + manbadagi farqlar)
const ALIAS = {
  'kongo demokratik respublikasi': 'CD', 'конго': 'CD', 'falastin': 'PS', 'палестина': 'PS', 'makao': 'MO', 'макао': 'MO',
  'mikroneziya': 'FM', 'sent vinsent va grenadin orollari': 'VC', 'komor orollari': 'KM', 'maldiv orollari': 'MV',
  'seyshel orollari': 'SC', 'kot divuar': 'CI', 'sharqiy timor': 'TL', 'восточный тимор': 'TL', 'iordaniya': 'JO',
  'gaiti': 'HT', 'syerra leone': 'SL', 'kabo verde': 'CV', 'gvineya bisau': 'GW', 'ekvatorial gvineya': 'GQ',
  'janubiy sudan': 'SS', 'birlashgan arab amirliklari': 'AE', 'kirgiziya': 'KG', 'киргизия': 'KG', 'xitoy': 'CN',
  'mogʻuliston': 'MN', 'moguliston': 'MN', 'omon': 'OM', 'filippin': 'PH', 'surinam': 'SR', 'tailand': 'TH',
  'zimbabve': 'ZW', 'koreya': 'KR', 'chexiya': 'CZ', 'vietnam': 'VN', 'nigeriya': 'NG', 'hindiston': 'IN', 'saudiya arabistoni': 'SA',
};
const norm = (s) => s.toLowerCase().normalize('NFC').replace(/[ʻ‘’'`ʼ"]/g, '').replace(/ё/g, 'е').replace(/[-–]/g, ' ').replace(/\s+/g, ' ').trim();
const CODES = [];
for (let a = 65; a <= 90; a++) for (let b = 65; b <= 90; b++) CODES.push(String.fromCharCode(a, b));
const DN = Object.fromEntries([['uz-latn', 'uz'], ['uz-cyrl', 'uz-Cyrl'], ['ru', 'ru'], ['en', 'en']].map(([k, loc]) => [k, new Intl.DisplayNames([loc], { type: 'region', fallback: 'none' })]));
const ISO = new Map();
for (const c of CODES) for (const l of ['uz-latn', 'ru', 'en']) {
  let n; try { n = DN[l].of(c); } catch { /* */ }
  if (n && n !== c) ISO.set(norm(n), ISO.get(norm(n)) ?? c);
}
const isoOf = (name) => ALIAS[norm(name)] ?? ISO.get(norm(name)) ?? null;
// ICU nomlarini qisqartirish
const NAME_FIX = {
  en: { MO: 'Macao', PS: 'Palestine', CD: 'DR Congo', VC: 'Saint Vincent and the Grenadines', AG: 'Antigua and Barbuda', FM: 'Micronesia' },
  'uz-cyrl': { MO: 'Макао', PS: 'Фаластин', CD: 'Конго Демократик Республикаси', TL: 'Шарқий Тимор', MN: 'Мўғулистон', OM: 'Уммон' },
  ru: {},
};
const icuName = (l, c) => NAME_FIX[l]?.[c] ?? DN[l].of(c);

async function visa() {
  const src = {};
  const parsed = {};
  for (const l of LANGS) {
    const url = `https://gov.uz/${GOV[l]}/${VISA_PATH}`;
    try { parsed[l] = parseVisa(await get(url)); } catch (e) { warn(`viza (${l}): ${e.message}`); parsed[l] = null; }
    const ok = parsed[l] && Object.values(parsed[l].groups).some((g) => g.length);
    src[l] = ok ? url : null;
    console.log(`  viza ${l}: ${ok ? Object.entries(parsed[l].groups).map(([k, v]) => `${k} ${v.length}`).join(', ') : 'mazmun yoʻq'}`);
  }
  const base = parsed['uz-latn'];
  if (!base || Object.keys(base.groups).length < 3) return keepOld('visa.json', 'oʻzbekcha sahifa tahlil qilinmadi');
  // tarjimasi yo‘q tillar uchun rasmiy sahifa: kirill → lotin sahifa, ingliz → rus sahifa (bo‘lmasa lotin)
  const fallback = { 'uz-latn': 'uz-latn', 'uz-cyrl': 'uz-latn', ru: 'uz-latn', en: src.ru ? 'ru' : 'uz-latn' };
  const source = Object.fromEntries(LANGS.map((l) => [l, src[l] ?? src[fallback[l]]]));

  const groups = [];
  const unknown = [];
  for (const id of ['free', 'tourist', 'arrival', 'evisa']) {
    const names = base.groups[id] ?? [];
    const ru = parsed.ru?.groups[id];
    const countries = names.map((n, i) => {
      const iso = isoOf(n);
      if (!iso) unknown.push(n);
      const name = {
        'uz-latn': uzLat(n),
        'uz-cyrl': iso ? icuName('uz-cyrl', iso) : n,
        ru: ru && ru.length === names.length ? ru[i] : iso ? icuName('ru', iso) : n,
        en: iso ? icuName('en', iso) : n,
      };
      return { iso, name };
    });
    groups.push({ id, countries });
  }
  if (unknown.length) warn(`viza: ISO kodi topilmadi → ${unknown.join(', ')} (scripts/fetch-data.mjs → ALIAS)`);
  write('visa.json', { fetched: today, updated: base.updated, source, groups });
}

// =====================================================================
// 3. Til va kasb kurslari («Xorijda ish»)
// =====================================================================
const XD = 'https://lm-api.xorijdaish.uz/api/labour-migration/classifier';

async function pages(path) {
  const out = [];
  for (let p = 1, last = 1; p <= last && p <= 20; p++) {
    const j = await get(`${XD}/${path}?page=${p}&per_page=100`, 'json');
    if (!j?.success) throw new Error(`${path}: success=false`);
    out.push(...(j.data?.data ?? []));
    last = j.data?.last_page ?? 1;
  }
  return out;
}

async function courses() {
  let foreign, vocational, predeparture;
  try {
    [foreign, vocational, predeparture] = await Promise.all([pages('get-foreign-courses'), pages('get-vocational-courses'), pages('get-predepartures-courses').catch(() => [])]);
  } catch (e) { return keepOld('courses.json', e.message); }
  const regions = (rs = []) => [...new Set(rs.map((r) => regionOf(r.name_uz || r.name_ru || '')).filter(Boolean))];
  const common = (c) => ({
    id: c.id, format: c.study_format === 'online' ? 'online' : 'offline', months: c.duration_months ?? null,
    phone: c.phone_number ? '+' + String(c.phone_number).replace(/\D/g, '') : null, regions: regions(c.regions),
  });
  const data = {
    fetched: today,
    source: 'https://xorijdaish.uz',
    language: foreign.filter((c) => c.is_active !== false).map((c) => ({
      ...common(c), name: fixQuotes(uzLat(c.course_name ?? '')),
      lang: c.language ? { 'uz-latn': uzLat(c.language.name_uz), 'uz-cyrl': c.language.name_cyrl, ru: c.language.name_ru, en: c.language.name_en } : null,
    })),
    profession: vocational.filter((c) => c.is_active !== false).map((c) => ({ ...common(c), name: fixQuotes(uzLat(c.profession_name ?? '')) })),
    predeparture: predeparture.filter((c) => c.is_active !== false).map((c) => ({ ...common(c), name: fixQuotes(uzLat(c.course_name ?? c.name ?? '')) })),
  };
  console.log(`  kurslar: til ${data.language.length}, kasb ${data.profession.length}, oldindan tayyorlov ${data.predeparture.length}`);
  if (!data.language.length && !data.profession.length && existsSync(OUT('courses.json'))) {
    const old = JSON.parse(readFileSync(OUT('courses.json'), 'utf8'));
    if (old.language?.length || old.profession?.length) return keepOld('courses.json', 'API boʻsh roʻyxat qaytardi');
  }
  write('courses.json', data);
}

// =====================================================================
// 4. Huquqiy va ijtimoiy qo‘llanma («Xorijda ish» → information-blog)
// =====================================================================
const BLOG = 'https://lm-api.xorijdaish.uz/api/labour-migration/information-blog';
// Faqat oddiy matn teglari qoldiriladi; atributlar olib tashlanadi (havolada — faqat http(s) href)
const ALLOW = new Set(['h2', 'h3', 'h4', 'h5', 'p', 'ul', 'ol', 'li', 'b', 'strong', 'i', 'em', 'br', 'table', 'tbody', 'tr', 'td', 'th', 'a']);
function sanitize(html, uz) {
  let s = (html || '')
    .replace(/<(script|style|iframe|object|embed|svg|math|form)[\s\S]*?<\/\1>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (m, tag, attrs) => {
      const t = tag.toLowerCase();
      if (!ALLOW.has(t)) return t === 'div' || t === 'span' ? (m.startsWith('</') && t === 'div' ? '\n' : '') : '';
      if (m.startsWith('</')) return `</${t}>`;
      if (t === 'h2' || t === 'h3') return '<h3>';
      if (t === 'a') {
        const href = (attrs.match(/href\s*=\s*["']([^"']+)["']/i) || [])[1];
        return href && /^https?:\/\//i.test(href) ? `<a href="${href.replace(/"/g, '%22')}" target="_blank" rel="noopener">` : '<a>';
      }
      return `<${t}>`;
    })
    .replace(/<\/h2>|<\/h3>/g, '</h3>');
  // HTML belgilarini (&lsquo; …) oddiy belgilarga — <, >, & bundan mustasno
  s = s.replace(/&(?!(lt|gt|amp);)(#x?[0-9a-f]+|\w+);/gi, (m) => decode(m));
  s = s.replace(/[ \t ]+/g, ' ').replace(/<p>\s*<\/p>/g, '').replace(/\n\s*\n+/g, '\n').trim();
  // o‘zbek lotinida oʻ/gʻ belgisini to‘g‘rilash (faqat teglar orasidagi matnda)
  if (uz) s = s.replace(/>([^<]+)</g, (m, txt) => '>' + uzLat(txt) + '<');
  return s;
}

async function guides() {
  let list;
  try { list = (await get(BLOG, 'json'))?.data; } catch (e) { return keepOld('guides.json', e.message); }
  if (!Array.isArray(list) || !list.length) return keepOld('guides.json', 'roʻyxat boʻsh');
  const KEY = { 'uz-latn': 'uz', 'uz-cyrl': 'cyrl', ru: 'ru', en: 'en' };
  const items = [];
  for (const g of list) {
    let x;
    try { x = (await get(`${BLOG}/${g.id}`, 'json'))?.data; } catch (e) { warn(`qoʻllanma ${g.id}: ${e.message}`); continue; }
    if (!x || x.status === 0) continue;
    const pick = (f, fn) => Object.fromEntries(LANGS.map((l) => [l, fn(x[`${f}_${KEY[l]}`] || x[`${f}_uz`] || '', l)]));
    const text = (s, l) => { const v = clean(decode(String(s))); return l === 'uz-latn' ? uzLat(v) : v; };
    // sarlavhadan davlatni aniqlash (ISO) — «… hududida ishga joylashish»
    const iso = isoOf((x.title_uz || '').replace(/\s+(Respublikasi|Federatsiyasi)?\s*hududida.*$/i, '').replace(/\s+Respublikasida.*$/i, '').trim());
    const group = iso ? 'country' : /qaytgan|reintegrats|subsidiya|kompensatsiya/i.test(x.title_uz || '') ? 'return' : 'general';
    items.push({
      id: x.id, iso, group, updated: String(x.updated_at || x.created_at || '').slice(0, 10),
      title: pick('title', text), desc: pick('desc', text), body: pick('body', (s, l) => sanitize(s, l === 'uz-latn')),
    });
  }
  if (items.length < 3) return keepOld('guides.json', `faqat ${items.length} ta qoʻllanma olindi`);
  console.log(`  qoʻllanmalar: ${items.length} (davlat boʻyicha: ${items.filter((i) => i.iso).map((i) => i.iso).join(', ')})`);
  write('guides.json', { fetched: today, source: 'https://xorijdaish.uz', items });
}

// =====================================================================
// 5. Vakolatxonalar (data.egov.uz) — 4 til bitta faylga
// =====================================================================
const EGOV = 'https://data.egov.uz/apiData/MainData/GetByFile?id=6107cb7d2a2e256d868e86ac&fileType=1&tableType=2&lang=';
const EGOV_LANG = { 'uz-latn': 1, 'uz-cyrl': 2, ru: 3, en: 4 };
// manbada kirill so‘z ichida lotin harflari uchraydi («Aвстрия») — ko‘rinishi bir xil kirill harfiga almashtiriladi
const HOMO = { A: 'А', a: 'а', B: 'В', C: 'С', c: 'с', E: 'Е', e: 'е', H: 'Н', K: 'К', M: 'М', O: 'О', o: 'о', P: 'Р', p: 'р', T: 'Т', X: 'Х', x: 'х', y: 'у' };
const cyrFix = (s) => s.replace(/[\p{L}]+/gu, (w) => (/[Ѐ-ӿ]/.test(w) ? w.replace(/[ABCEHKMOPTXaceopxy]/g, (ch) => HOMO[ch]) : w));
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/** "6734-39-42/43, 6734-39-50" → ["6734-39-42", "6734-39-43", "6734-39-50"] (src/lib/api.ts dagi bilan bir xil) */
function splitNumbers(raw) {
  const s = String(raw ?? '').trim();
  if (!s || /^vak/i.test(s) || /^вак/i.test(s)) return [];
  const out = [];
  for (const group of s.split(/[,;]/)) {
    const parts = group.split('/').map((p) => p.trim()).filter(Boolean);
    if (!parts.length) continue;
    const first = parts[0];
    out.push(first);
    for (const p of parts.slice(1)) out.push(p.length <= 3 && first.length > p.length ? first.slice(0, first.length - p.length) + p : p);
  }
  return out;
}

async function embassies() {
  let raw;
  try {
    raw = Object.fromEntries(await Promise.all(LANGS.map(async (l) => [l, await get(EGOV + EGOV_LANG[l], 'json')])));
  } catch (e) { return keepOld('embassies.json', e.message); }
  const base = raw['uz-latn'];
  if (!Array.isArray(base) || base.length < 20) return keepOld('embassies.json', `oʻzbekcha roʻyxat juda qisqa (${base?.length})`);
  const txt = (l, r, ...keys) => {
    const v = clean(String(keys.map((k) => r?.[k]).find((x) => x != null && String(x).trim()) ?? ''));
    return l === 'uz-latn' ? uzLat(v) : l === 'en' ? v : cyrFix(v);
  };
  const items = base.map((b, i) => {
    // tillar tartib raqami bo‘yicha birlashtiriladi; topilmasa — shu indeksdagi yozuv
    const row = (l) => raw[l]?.find((r) => r.tartibraqami === b.tartibraqami) ?? raw[l]?.[i];
    const loc = (f) => Object.fromEntries(LANGS.map((l) => [l, f(l, row(l)) || f('uz-latn', b)]));
    const name = loc((l, r) => txt(l, r, 'Vakolatxonanomi', 'Vakolatnomanomi'));
    const lat = Number(b.latitude), lon = Number(b.longitude);
    const nums = (k) => splitNumbers(LANGS.map((l) => row(l)?.[k]).find((v) => splitNumbers(v).length) ?? '');
    return {
      id: i,
      code: clean(String(b.Codi ?? '')),
      phones: nums('Telefon'),
      faxes: nums('Faks'),
      lat: Number.isFinite(lat) && lat !== 0 ? lat : null,
      lon: Number.isFinite(lon) && lon !== 0 ? lon : null,
      kind: /konsul|консул|consul/i.test(name['uz-latn'] + name.ru) ? 'consulate' : 'embassy',
      name,
      address: loc((l, r) => txt(l, r, 'Vakolatxonamanzili')),
      head: loc((l, r) => cap(txt(l, r, 'Rahbar'))),
      position: loc((l, r) => cap(txt(l, r, 'Lavozimi'))),
    };
  });
  const miss = LANGS.filter((l) => raw[l]?.length !== base.length);
  if (miss.length) warn(`vakolatxonalar: ${miss.join(', ')} roʻyxati uzunligi farq qiladi — oʻzbekcha matn bilan toʻldirildi`);
  console.log(`  vakolatxonalar: ${items.length} (konsullik ${items.filter((e) => e.kind === 'consulate').length})`);
  write('embassies.json', { fetched: today, source: 'https://data.egov.uz/data/6107cb7d2a2e256d868e86ac', items });
}

// =====================================================================
const only = process.argv.slice(2);
const jobs = { agencies, visa, courses, guides, embassies };
for (const [name, fn] of Object.entries(jobs)) {
  if (only.length && !only.includes(name)) continue;
  try { await fn(); } catch (e) { warn(`${name}: ${e.message}`); }
}
console.log(warnings ? `\n${warnings} ta ogohlantirish (eski maʼlumot saqlangan joylar bor)` : '\n✓ barcha maʼlumotlar yangilandi');
console.log('Eslatma: index.html dagi data-version ni yangilang (CLAUDE.md, 5.1).');
