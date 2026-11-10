// Ilova sozlamalari
export const BASE = import.meta.env.BASE_URL; // masalan: /safar-uzbekistan/
export const APP_VERSION = '2.0.0';

// index.html dagi <meta name="data-version"> — JSON fayllarni yangilashni majburlash uchun
export const DATA_VERSION =
  document.querySelector<HTMLMetaElement>('meta[name="data-version"]')?.content || APP_VERSION;

export const OWM_KEY: string = import.meta.env.VITE_OWM_KEY || '';
export const STATS_URL: string = import.meta.env.VITE_STATS_URL || '';

export const EGOV_URL = 'https://data.egov.uz/apiData/MainData/GetByFile?id=6107cb7d2a2e256d868e86ac&fileType=1&tableType=2';

// Keshlarning amal qilish muddati
export const TTL = {
  embassies: 7 * 24 * 3600e3,
  weather: 3 * 3600e3,
  position: 30 * 60e3,
};

export const dataUrl = (file: string) => `${BASE}data/${file}?v=${encodeURIComponent(DATA_VERSION)}`;
