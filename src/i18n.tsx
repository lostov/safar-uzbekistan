import { createContext } from 'preact';
import { useContext, useEffect, useMemo, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { loadDataFile } from './lib/data';
import { getPref, setPref } from './lib/store';
import { toYangi } from './lib/translit';
import type { Loc } from './lib/data';

export type Lang = 'uz-latn' | 'uz-cyrl' | 'uz-yangi' | 'ru' | 'en';
type Value = string | string[] | Record<string, string>;
interface I18nFile {
  version: string;
  default: Lang;
  languages: Record<Lang, { label: string; short: string; htmlLang: string }>;
  strings: Record<Lang, Record<string, Value>>;
}

// data.egov.uz dagi til raqamlari
export const EGOV_LANG: Record<Lang, number> = { 'uz-latn': 1, 'uz-yangi': 1, 'uz-cyrl': 2, ru: 3, en: 4 };

export interface I18n {
  lang: Lang;
  setLang: (l: Lang) => void;
  languages: I18nFile['languages'];
  t: (key: string, vars?: Record<string, string | number>) => string;
  list: (key: string) => string[];
  country: (code?: string) => string;
  date: (d: Date, short?: boolean) => string;
  /** tashqi manbadan kelgan lotin matnni tanlangan alifboga moslaydi */
  ext: (text: string) => string;
  /** 4 tildagi maʼlumotdan joriy tildagisini oladi (Özbekça — lotindan o‘giriladi) */
  loc: (v: Loc | null | undefined) => string;
  /** Oʻzbekiston hududi nomi (ISO 3166-2:UZ kodi bo‘yicha, @regions) */
  region: (code?: string | null) => string;
}

const Ctx = createContext<I18n | null>(null);
export const useI18n = () => useContext(Ctx)!;

function detectLang(file: I18nFile): Lang {
  const saved = getPref('lang') as Lang | null;
  if (saved && file.languages[saved]) return saved;
  const nav = (navigator.language || '').toLowerCase();
  if (nav.startsWith('ru')) return 'ru';
  if (nav.startsWith('en')) return 'en';
  if (nav.startsWith('uz-cyrl')) return 'uz-cyrl';
  return file.default;
}

export function I18nProvider({ children, fallback }: { children: ComponentChildren; fallback: ComponentChildren }) {
  const [file, setFile] = useState<I18nFile | null>(null);
  const [lang, setLangState] = useState<Lang>('uz-latn');
  const [error, setError] = useState(false);

  useEffect(() => {
    loadDataFile<I18nFile>('i18n.json')
      .then((f) => { setFile(f); setLangState(detectLang(f)); })
      .catch(() => setError(true));
  }, []);

  const value = useMemo<I18n | null>(() => {
    if (!file) return null;
    const S = file.strings[lang] || file.strings[file.default];
    const D = file.strings[file.default];
    const get = (k: string) => (k in S ? S[k] : D[k]);
    const fill = (s: string, vars?: Record<string, string | number>) =>
      vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : s;
    return {
      lang,
      languages: file.languages,
      setLang: (l) => { setPref('lang', l); setLangState(l); },
      t: (key, vars) => { const v = get(key); return typeof v === 'string' ? fill(v, vars) : key; },
      list: (key) => { const v = get(key); return Array.isArray(v) ? v : []; },
      country: (code) => { const m = get('@countries') as Record<string, string> | undefined; return (code && m?.[code]) || code || ''; },
      date: (d, short) => {
        const months = get('@months') as string[];
        const fmt = get(short ? '@dateShort' : '@date') as string;
        return fill(fmt, { day: d.getDate(), month: months[d.getMonth()], year: d.getFullYear() });
      },
      ext: (text) => (lang === 'uz-yangi' ? toYangi(text) : text),
      loc: (v) => (!v ? '' : lang === 'uz-yangi' ? toYangi(v['uz-latn']) : v[lang] || v['uz-latn']),
      region: (code) => { const m = get('@regions') as Record<string, string> | undefined; return (code && m?.[code]) || ''; },
    };
  }, [file, lang]);

  useEffect(() => {
    if (value) document.documentElement.lang = value.languages[lang].htmlLang;
  }, [value, lang]);

  if (error) return <div class="empty">Maʼlumotlarni yuklab boʻlmadi. Internetga ulanib, sahifani yangilang.</div>;
  if (!value) return <>{fallback}</>;
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
