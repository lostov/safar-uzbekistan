import { load, save, isFresh } from './store';
import { TTL } from './config';

export interface Pos { lat: number; lon: number; city?: string; country?: string }

export function lastPos(): Pos | null {
  return load<Pos>('pos')?.data ?? null;
}

export function rememberPlace(extra: Partial<Pos>) {
  const p = lastPos();
  if (p) save('pos', { ...p, ...extra });
}

/** Joylashuvni oladi (GPS internetsiz ham ishlaydi). Yaqinda olingan bo‘lsa — keshdan. */
export function getPosition(force = false): Promise<Pos> {
  const cached = load<Pos>('pos');
  if (!force && cached && isFresh(cached, TTL.position)) return Promise.resolve(cached.data);
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('unsupported'));
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const prev = cached?.data;
        const pos: Pos = { lat: p.coords.latitude, lon: p.coords.longitude };
        // 20 km dan kam siljigan bo‘lsa, eski shahar va davlat nomi saqlanadi
        if (prev && distanceKm(prev, pos) < 20) { pos.city = prev.city; pos.country = prev.country; }
        save('pos', pos);
        resolve(pos);
      },
      (err) => (cached ? resolve(cached.data) : reject(err)),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60e3 },
    );
  });
}

export function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
