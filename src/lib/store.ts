// localStorage asosidagi oddiy kesh (vaqt belgisi bilan)
const PREFIX = 'su2:';

export interface Cached<T> { t: number; data: T; meta?: Record<string, unknown> }

export function load<T>(key: string): Cached<T> | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as Cached<T>) : null;
  } catch {
    return null;
  }
}

export function save<T>(key: string, data: T, meta?: Record<string, unknown>): Cached<T> {
  const entry: Cached<T> = { t: Date.now(), data, meta };
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    /* xotira to‘lgan bo‘lsa — kesh saqlanmaydi, ilova ishlashda davom etadi */
  }
  return entry;
}

export const isFresh = (c: Cached<unknown> | null, ttl: number) => !!c && Date.now() - c.t < ttl;

export function getPref(key: string): string | null {
  try { return localStorage.getItem(PREFIX + 'pref:' + key); } catch { return null; }
}
export function setPref(key: string, value: string) {
  try { localStorage.setItem(PREFIX + 'pref:' + key, value); } catch { /* */ }
}
