// O‘rnatishlar va foydalanuvchilarni anonim hisoblash.
// Shaxsiy maʼlumot yuborilmaydi: faqat tasodifiy qurilma ID, hodisa nomi, til va platforma.
// Yoqish: .env faylida VITE_STATS_URL=https://<sizning-worker>.workers.dev/hit
// Sozlanmagan bo‘lsa — hech narsa yuborilmaydi.
import { STATS_URL, APP_VERSION } from './config';

type EventName = 'install' | 'first_standalone' | 'open' | 'open_standalone';

function deviceId(): string {
  let id = localStorage.getItem('su2:did');
  if (!id) {
    id = (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36));
    localStorage.setItem('su2:did', id);
  }
  return id;
}

export function track(event: EventName) {
  if (!STATS_URL) return;
  const body = JSON.stringify({
    e: event,
    id: deviceId(),
    v: APP_VERSION,
    lang: document.documentElement.lang,
    p: /android/i.test(navigator.userAgent) ? 'android' : /iphone|ipad|ipod/i.test(navigator.userAgent) ? 'ios' : 'desktop',
  });
  try {
    if (!navigator.sendBeacon?.(STATS_URL, body)) {
      fetch(STATS_URL, { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(() => {});
    }
  } catch { /* oflayn — o‘tkazib yuboriladi */ }
}

/** Kuniga bir marta "open", ilk marta o‘rnatilgan holatda ochilganda "first_standalone" */
export function trackLaunch(standalone: boolean) {
  const today = new Date().toISOString().slice(0, 10);
  if (localStorage.getItem('su2:lastOpen') !== today) {
    localStorage.setItem('su2:lastOpen', today);
    track(standalone ? 'open_standalone' : 'open');
  }
  // iOS’da "appinstalled" hodisasi yo‘q — shuning uchun birinchi standalone ochilish o‘rnatish deb hisoblanadi
  if (standalone && !localStorage.getItem('su2:firstStandalone')) {
    localStorage.setItem('su2:firstStandalone', today);
    track('first_standalone');
  }
}
