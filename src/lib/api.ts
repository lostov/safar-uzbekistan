import { OWM_KEY, TTL } from './config';
import { load, save, isFresh, type Cached } from './store';
import { loadDataFile, type EmbassiesFile, type Loc } from './data';
import { distanceKm, rememberPlace, type Pos } from './geo';

// ---------------- Vakolatxonalar (data.egov.uz) ----------------
export interface Embassy {
  id: number;
  name: string;
  address: string;
  code: string;
  phones: string[];
  faxes: string[];
  head: string;
  position: string;
  lat: number | null;
  lon: number | null;
  kind: 'embassy' | 'consulate';
}

/** "6734-39-42/43, 6734-39-50" → ["6734-39-42", "6734-39-43", "6734-39-50"] */
export function splitNumbers(raw: unknown): string[] {
  const s = String(raw ?? '').trim();
  if (!s || /^vak/i.test(s) || /^вак/i.test(s)) return [];
  const out: string[] = [];
  for (const group of s.split(/[,;]/)) {
    const parts = group.split('/').map((p) => p.trim()).filter(Boolean);
    if (!parts.length) continue;
    const first = parts[0];
    out.push(first);
    for (const p of parts.slice(1)) {
      // "/43" — oxirgi raqamlar almashtiriladi
      out.push(p.length <= 3 && first.length > p.length ? first.slice(0, first.length - p.length) + p : p);
    }
  }
  return out;
}

export const dialNumber = (code: string, num: string) => '+' + `${code}${num}`.replace(/[^\d]/g, '');

// Vakolatxonalar endi data.egov.uz dan to‘g‘ridan so‘ralmaydi: scripts/fetch-data.mjs 4 tilni
// embassies.json ga birlashtiradi → til almashtirilganda qayta yuklanmaydi, oflaynda barcha tillar ishlaydi.
const EMB_FILE = 'embassies.json';
type LocLang = keyof Loc;

function localize(file: EmbassiesFile, lang: LocLang): Embassy[] {
  return file.items.map((e) => ({
    id: e.id, code: e.code, phones: e.phones, faxes: e.faxes, lat: e.lat, lon: e.lon, kind: e.kind,
    name: e.name[lang] || e.name['uz-latn'], address: e.address[lang] || e.address['uz-latn'],
    head: e.head[lang] || e.head['uz-latn'], position: e.position[lang] || e.position['uz-latn'],
  }));
}

// v2.0 dagi tilma-til kesh (su2:emb:1…4) endi kerak emas
try { for (let i = 1; i <= 4; i++) localStorage.removeItem('su2:emb:' + i); } catch { /* */ }

/** Qurilmadagi nusxa (internet talab qilmaydi). lang: 'uz-yangi' → 'uz-latn' (UI ext() bilan o‘giradi) */
export function cachedEmbassies(lang: string): Cached<Embassy[]> | null {
  const c = load<EmbassiesFile>('file:' + EMB_FILE);
  return c ? { t: c.t, data: localize(c.data, toLocLang(lang)) } : null;
}

export async function fetchEmbassies(lang: string): Promise<Cached<Embassy[]>> {
  const file = await loadDataFile<EmbassiesFile>(EMB_FILE);
  return { t: load('file:' + EMB_FILE)?.t ?? Date.now(), data: localize(file, toLocLang(lang)) };
}

const toLocLang = (lang: string): LocLang => (lang === 'uz-cyrl' || lang === 'ru' || lang === 'en' ? lang : 'uz-latn');

/** Eng yaqin vakolatxona — keshdagi koordinatalar bo‘yicha, internet talab qilmaydi */
export function nearestEmbassy(list: Embassy[], pos: Pos): { item: Embassy; km: number } | null {
  let best: { item: Embassy; km: number } | null = null;
  for (const e of list) {
    if (e.lat == null || e.lon == null) continue;
    const km = distanceKm(pos, { lat: e.lat, lon: e.lon });
    if (!best || km < best.km) best = { item: e, km };
  }
  return best;
}

// ---------------- Ob-havo (OpenWeatherMap) ----------------
export interface WeatherItem { dt: number; temp: number; icon: string }
export interface WeatherData { city: string; country: string; tz: number; sunrise: number; sunset: number; items: WeatherItem[] }

export function cachedWeather(): Cached<WeatherData> | null { return load<WeatherData>('wx'); }

export async function fetchWeather(pos: Pos, force = false): Promise<Cached<WeatherData>> {
  const cached = cachedWeather();
  const near = cached?.meta && distanceKm(pos, cached.meta as unknown as Pos) < 20;
  if (!force && cached && near && isFresh(cached, TTL.weather)) return cached;
  if (!OWM_KEY) throw new Error('no-key');
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${pos.lat}&lon=${pos.lon}&appid=${OWM_KEY}&units=metric`);
    if (!res.ok) throw new Error(String(res.status));
    const j = await res.json();
    const data: WeatherData = {
      city: j.city?.name ?? '', country: j.city?.country ?? '', tz: j.city?.timezone ?? 0,
      sunrise: j.city?.sunrise ?? 0, sunset: j.city?.sunset ?? 0,
      items: (j.list ?? []).map((x: { dt: number; main: { temp: number }; weather: { icon: string }[] }) => ({ dt: x.dt, temp: Math.round(x.main.temp), icon: x.weather?.[0]?.icon ?? '03d' })),
    };
    rememberPlace({ city: data.city, country: data.country });
    return save('wx', data, { lat: pos.lat, lon: pos.lon });
  } catch (e) {
    if (cached) return cached;
    throw e;
  }
}

export type Cond = 'clear' | 'partly' | 'cloudy' | 'rain' | 'thunder' | 'snow' | 'mist';
export function condition(icon: string): Cond {
  const c = icon.slice(0, 2);
  return c === '01' ? 'clear' : c === '02' ? 'partly' : c === '03' || c === '04' ? 'cloudy'
    : c === '09' || c === '10' ? 'rain' : c === '11' ? 'thunder' : c === '13' ? 'snow' : 'mist';
}

/** Joy vaqti bo‘yicha kunlarga ajratish: har kun uchun ertalab/tushlik/kechqurun */
export function dailySlots(w: WeatherData) {
  const days = new Map<string, WeatherItem[]>();
  for (const it of w.items) {
    const local = new Date((it.dt + w.tz) * 1000);
    const key = local.toISOString().slice(0, 10);
    if (!days.has(key)) days.set(key, []);
    days.get(key)!.push(it);
  }
  const pick = (items: WeatherItem[], hour: number) =>
    items.reduce((best, it) => {
      const h = new Date((it.dt + w.tz) * 1000).getUTCHours();
      const bh = new Date((best.dt + w.tz) * 1000).getUTCHours();
      return Math.abs(h - hour) < Math.abs(bh - hour) ? it : best;
    });
  return [...days.entries()].slice(0, 5).map(([key, items]) => ({
    date: new Date(key + 'T12:00:00'),
    slots: [pick(items, 9), pick(items, 15), pick(items, 21)],
  }));
}

// ---------------- Namoz vaqtlari (Aladhan, 13-usul) ----------------
export interface PrayerDay {
  day: number; month: number; year: number;
  hijri: { day: number; month: number; year: number };
  times: [string, string, string, string, string, string]; // bomdod, quyosh, peshin, asr, shom, xufton
}

export function cachedPrayer(year: number, month: number): Cached<PrayerDay[]> | null {
  return load<PrayerDay[]>(`pr:${year}-${month}`);
}

export async function fetchPrayer(pos: Pos, year: number, month: number): Promise<Cached<PrayerDay[]>> {
  const cached = cachedPrayer(year, month);
  if (cached && cached.meta && distanceKm(pos, cached.meta as unknown as Pos) < 20) return cached;
  try {
    const res = await fetch(`https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${pos.lat}&longitude=${pos.lon}&method=13`);
    if (!res.ok) throw new Error(String(res.status));
    const j = await res.json();
    const clean = (s: string) => s.slice(0, 5);
    const data: PrayerDay[] = (j.data ?? []).map((d: any) => ({
      day: +d.date.gregorian.day, month: +d.date.gregorian.month.number, year: +d.date.gregorian.year,
      hijri: { day: +d.date.hijri.day, month: +d.date.hijri.month.number, year: +d.date.hijri.year },
      times: [clean(d.timings.Fajr), clean(d.timings.Sunrise), clean(d.timings.Dhuhr), clean(d.timings.Asr), clean(d.timings.Maghrib), clean(d.timings.Isha)],
    }));
    return save(`pr:${year}-${month}`, data, { lat: pos.lat, lon: pos.lon });
  } catch (e) {
    if (cached) return cached;
    throw e;
  }
}
