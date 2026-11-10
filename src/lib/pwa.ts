import { useEffect, useState } from 'preact/hooks';
import { registerSW } from 'virtual:pwa-register';
import { track } from './stats';

// ---------- Service Worker: yangi versiya chiqsa avtomatik yangilanadi ----------
export function initSW() {
  if (!('serviceWorker' in navigator)) return;
  // v1 (eski ilova) keshlarini tozalash: 'safaruz-v3-…' kabi nomlar
  caches?.keys().then((keys) => keys.filter((k) => k.startsWith('safaruz-')).forEach((k) => caches.delete(k))).catch(() => {});
  registerSW({
    immediate: true,
    onRegisteredSW(_url, reg) {
      // Ilova uzoq ochiq tursa ham soatiga bir marta yangilanishni tekshiradi
      if (reg) setInterval(() => reg.update(), 60 * 60e3);
    },
  });
}

// ---------- O‘rnatish (beforeinstallprompt) ----------
interface BIPEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }
let deferred: BIPEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((f) => f());

export const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
export const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;

export function initInstall() {
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e as BIPEvent; notify(); });
  window.addEventListener('appinstalled', () => { deferred = null; localStorage.setItem('su2:installed', '1'); track('install'); notify(); });
}

export function useInstall() {
  const [, force] = useState(0);
  useEffect(() => { const f = () => force((n) => n + 1); listeners.add(f); return () => { listeners.delete(f); }; }, []);
  const installed = isStandalone() || localStorage.getItem('su2:installed') === '1';
  return {
    installed,
    canPrompt: !!deferred,
    ios: isIOS() && !installed,
    available: !installed && (!!deferred || isIOS()),
    async prompt() {
      if (!deferred) return false;
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      deferred = null; notify();
      return outcome === 'accepted';
    },
  };
}

// ---------- Onlayn / oflayn holat ----------
export function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  return online;
}
