import { createContext } from 'preact';
import { useCallback, useContext, useEffect, useState } from 'preact/hooks';
import { loadDataFile, type Resources } from './lib/data';
import { load } from './lib/store';
import { useI18n, EGOV_LANG } from './i18n';
import { cachedEmbassies, fetchEmbassies, cachedWeather, fetchWeather, cachedPrayer, fetchPrayer,
  type Embassy, type WeatherData, type PrayerDay } from './lib/api';
import { getPosition, lastPos, type Pos } from './lib/geo';

export const ResCtx = createContext<Resources | null>(null);
export const useResources = () => useContext(ResCtx)!;

/** public/data/*.json fayli: avval qurilmadagi nusxa, keyin tarmoqdan yangisi (loadDataFile) */
export function useDataFile<T>(file: string) {
  const init = load<T>('file:' + file);
  const [state, set] = useState<{ data: T | null; savedAt: number | null; error: boolean }>({ data: init?.data ?? null, savedAt: init?.t ?? null, error: false });
  useEffect(() => {
    let alive = true;
    loadDataFile<T>(file)
      .then((data) => alive && set({ data, savedAt: load<T>('file:' + file)?.t ?? Date.now(), error: false }))
      .catch(() => alive && set((s) => ({ ...s, error: true })));
    return () => { alive = false; };
  }, [file]);
  return state;
}

interface Async<T> { data: T | null; savedAt: number | null; loading: boolean; error: string | null; reload: () => void }

export function useEmbassies(): Async<Embassy[]> {
  const { lang } = useI18n();
  const id = EGOV_LANG[lang];
  const init = cachedEmbassies(id);
  const [state, set] = useState({ data: init?.data ?? null, savedAt: init?.t ?? null, loading: !init, error: null as string | null });
  const run = useCallback((force = false) => {
    set((s) => ({ ...s, loading: true, error: null }));
    fetchEmbassies(id, force)
      .then((c) => set({ data: c.data, savedAt: c.t, loading: false, error: null }))
      .catch((e) => set((s) => ({ ...s, loading: false, error: String(e?.message || e) })));
  }, [id]);
  useEffect(() => { const c = cachedEmbassies(id); set({ data: c?.data ?? null, savedAt: c?.t ?? null, loading: !c, error: null }); run(); }, [id]);
  return { ...state, reload: () => run(true) };
}

export function usePosition(auto: boolean) {
  const [pos, setPos] = useState<Pos | null>(lastPos());
  const [error, setError] = useState<string | null>(null);
  const request = useCallback(() => {
    setError(null);
    getPosition(true).then(setPos).catch((e) => setError(e?.code === 1 ? 'denied' : 'error'));
  }, []);
  useEffect(() => {
    if (!auto) return;
    // ruxsat oldin berilgan bo‘lsa — avtomatik yangilaymiz
    const q = navigator.permissions?.query?.({ name: 'geolocation' as PermissionName });
    if (q) q.then((st) => { if (st.state === 'granted') getPosition().then(setPos).catch(() => {}); }).catch(() => {});
    else if (pos) getPosition().then(setPos).catch(() => {});
  }, [auto]);
  return { pos, error, request };
}

export function useWeather(pos: Pos | null): Async<WeatherData> {
  const init = cachedWeather();
  const [state, set] = useState({ data: init?.data ?? null, savedAt: init?.t ?? null, loading: false, error: null as string | null });
  const run = useCallback((force = false) => {
    if (!pos) return;
    set((s) => ({ ...s, loading: !s.data, error: null }));
    fetchWeather(pos, force)
      .then((c) => set({ data: c.data, savedAt: c.t, loading: false, error: null }))
      .catch((e) => set((s) => ({ ...s, loading: false, error: String(e?.message || e) })));
  }, [pos?.lat, pos?.lon]);
  useEffect(() => { run(); }, [run]);
  return { ...state, reload: () => run(true) };
}

export function usePrayer(pos: Pos | null): Async<PrayerDay[]> {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth() + 1;
  const init = cachedPrayer(y, m);
  const [state, set] = useState({ data: init?.data ?? null, savedAt: init?.t ?? null, loading: false, error: null as string | null });
  const run = useCallback(() => {
    if (!pos) return;
    set((s) => ({ ...s, loading: !s.data, error: null }));
    // joriy oy va kerak bo‘lsa keyingi oy (oy oxirida 6 kunlik jadval uchun)
    const next = m === 12 ? [y + 1, 1] : [y, m + 1];
    Promise.all([fetchPrayer(pos, y, m), now.getDate() > 24 ? fetchPrayer(pos, next[0], next[1]).catch(() => null) : Promise.resolve(null)])
      .then(([a, b]) => set({ data: [...a.data, ...(b?.data ?? [])], savedAt: a.t, loading: false, error: null }))
      .catch((e) => set((s) => ({ ...s, loading: false, error: String(e?.message || e) })));
  }, [pos?.lat, pos?.lon]);
  useEffect(() => { run(); }, [run]);
  return { ...state, reload: run };
}

/** Joriy vaqtdan keyingi namoz */
export function nextPrayer(days: PrayerDay[], now = new Date()) {
  const toDate = (d: PrayerDay, hm: string) => { const [h, mi] = hm.split(':').map(Number); return new Date(d.year, d.month - 1, d.day, h, mi); };
  for (const d of days) {
    const base = new Date(d.year, d.month - 1, d.day);
    if (base < new Date(now.getFullYear(), now.getMonth(), now.getDate())) continue;
    for (let i = 0; i < 6; i++) {
      if (i === 1) continue; // quyosh chiqishi namoz emas
      const at = toDate(d, d.times[i]);
      if (at > now) return { index: i, at, day: d };
    }
  }
  return null;
}
