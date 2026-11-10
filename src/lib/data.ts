import { dataUrl, DATA_VERSION } from './config';
import { load, save } from './store';

// public/data/*.json fayllarini versiya parametri bilan yuklaydi:
//   data/i18n.json?v=2026.11.09
// Versiya index.html dagi <meta name="data-version"> dan olinadi.
// Tarmoq bo‘lmasa — Service Worker keshi, u ham bo‘lmasa — localStorage dagi oxirgi nusxa.
export async function loadDataFile<T>(file: string): Promise<T> {
  const key = 'file:' + file;
  try {
    const res = await fetch(dataUrl(file), { cache: 'no-cache' });
    if (!res.ok) throw new Error(String(res.status));
    const json = (await res.json()) as T;
    save(key, json, { v: DATA_VERSION });
    return json;
  } catch (err) {
    const cached = load<T>(key);
    if (cached) return cached.data;
    throw err;
  }
}

export interface ResourceLink { label: string; url: string; icon?: string }
export interface SourceGroup { id: string; title: string; icon: string; tone: 'blue' | 'green'; links: ResourceLink[] }
export interface Emergency { main: string; police?: string; ambulance?: string; fire?: string; other?: string[]; check?: boolean }
export interface Resources {
  version: string;
  officialSources: SourceGroup[];
  banned: { asOf: string; list: ResourceLink[]; law: ResourceLink[] };
  vaqf: { url: string };
  qibla: string;
  /** ISO davlat kodi → raqamlar; police/ambulance/fire bo‘lmasa — hammasi main orqali. "_..." kalitlar — izoh */
  emergency: Record<string, Emergency | string>;
  /** «Xorijda ish» platformasi va unga bog‘liq havolalar */
  work: { xorijdaish: string; android: string; ios: string; mahalla: string };
}

// ---------- scripts/fetch-data.mjs yaratadigan fayllar ----------
/** 4 tildagi matn (uz-yangi — uz-latn dan ext() orqali) */
export type Loc = Record<'uz-latn' | 'uz-cyrl' | 'ru' | 'en', string>;

/** agencies.json — Xususiy bandlik agentliklari reestri (gov.uz) */
export interface Agency {
  id: string; no: number; license: string; date: string; region: string | null;
  name: Loc; address: Loc; head: Loc; phones: string[]; emails: string[];
}
export interface AgenciesFile { fetched: string; source: Loc; items: Agency[] }

/** visa.json — Oʻzbekiston fuqarolari uchun viza talablari (TIV, gov.uz) */
export type VisaGroupId = 'free' | 'tourist' | 'arrival' | 'evisa';
export interface VisaFile {
  fetched: string; updated: string; source: Loc;
  groups: { id: VisaGroupId; countries: { iso: string | null; name: Loc }[] }[];
}

/** courses.json — Til va kasb kurslari («Xorijda ish») */
export interface Course {
  id: number; name: string; format: 'online' | 'offline'; months: number | null;
  phone: string | null; regions: string[]; lang?: Loc | null;
}
export interface CoursesFile { fetched: string; source: string; language: Course[]; profession: Course[]; predeparture: Course[] }

/** Fon rejimida oldindan yuklanadigan fayllar — sahifa ochilmasa ham oflaynda ishlaydi */
export const WORK_FILES = ['embassies.json', 'agencies.json', 'visa.json', 'courses.json', 'guides.json'] as const;

/** embassies.json — xorijdagi vakolatxonalar (data.egov.uz, 4 til bitta faylda; scripts/fetch-data.mjs) */
export interface EmbassyItem {
  id: number; code: string; phones: string[]; faxes: string[]; lat: number | null; lon: number | null;
  kind: 'embassy' | 'consulate'; name: Loc; address: Loc; head: Loc; position: Loc;
}
export interface EmbassiesFile { fetched: string; source: string; items: EmbassyItem[] }

/** guides.json — Huquqiy va ijtimoiy qo‘llanma («Xorijda ish» → information-blog). body — tozalangan HTML */
export interface Guide { id: number; iso: string | null; group: 'country' | 'return' | 'general'; updated: string; title: Loc; desc: Loc; body: Loc }
export interface GuidesFile { fetched: string; source: string; items: Guide[] }
