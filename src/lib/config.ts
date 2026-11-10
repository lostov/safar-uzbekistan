// Ilova sozlamalari
export const BASE = import.meta.env.BASE_URL; // masalan: /safar-uzbekistan/
export const APP_VERSION = '2.0.0';

// index.html dagi <meta name="data-version"> — JSON fayllarni yangilashni majburlash uchun
export const DATA_VERSION =
  document.querySelector<HTMLMetaElement>('meta[name="data-version"]')?.content || APP_VERSION;

export const OWM_KEY: string = import.meta.env.VITE_OWM_KEY || '';
export const STATS_URL: string = import.meta.env.VITE_STATS_URL || '';


// Keshlarning amal qilish muddati
export const TTL = {
  weather: 3 * 3600e3,
  position: 30 * 60e3,
};

export const dataUrl = (file: string) => `${BASE}data/${file}?v=${encodeURIComponent(DATA_VERSION)}`;
