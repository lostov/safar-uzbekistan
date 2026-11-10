import { defineConfig, loadEnv } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages: https://lostov.github.io/safar-uzbekistan/ → BASE=/safar-uzbekistan/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.BASE || '/safar-uzbekistan/';

  return {
    base,
    plugins: [
      preact(),
      VitePWA({
        registerType: 'autoUpdate', // yangi versiya chiqsa, foydalanuvchida avtomatik yangilanadi
        injectRegister: false, // ro‘yxatdan o‘tkazish src/lib/pwa.ts ichida
        includeAssets: ['icons/*.png', 'icons/favicon.ico', 'img/*'],
        manifest: {
          id: base,
          name: 'Safar Uzbekistan',
          short_name: 'SafarUz',
          description: 'Xorijga chiqayotgan fuqarolar uchun diniy-maʼrifiy tavsiyalar',
          lang: 'uz',
          start_url: base,
          scope: base,
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#FAF6EE',
          theme_color: '#16324F',
          icons: [
            { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-256x256.png', sizes: '256x256', type: 'image/png' },
            { src: 'icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
            { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
            { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          // Ilova qobig‘i (HTML, JS, CSS, rasmlar) oldindan keshlanadi
          globPatterns: ['**/*.{js,css,html,svg,png,jpg,webp,ico,woff2}'],
          // data/*.json — versiya parametri (?v=) bilan alohida keshlanadi, shuning uchun precache'ga kiritilmaydi
          globIgnores: ['**/data/*.json'],
          navigateFallback: 'index.html',
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              // i18n.json?v=..., resources.json?v=... — avval tarmoq, internet bo‘lmasa keshdan
              urlPattern: ({ url }) => url.pathname.includes('/data/') && url.pathname.endsWith('.json'),
              handler: 'NetworkFirst',
              options: {
                cacheName: 'safar-data',
                networkTimeoutSeconds: 4,
                expiration: { maxEntries: 20 },
                matchOptions: { ignoreSearch: true }, // oflaynda eski versiya bo‘lsa ham ochiladi
              },
            },
            {
              urlPattern: ({ url }) => url.origin === 'https://openweathermap.org' && url.pathname.startsWith('/img/'),
              handler: 'CacheFirst',
              options: { cacheName: 'safar-weather-icons', expiration: { maxEntries: 40 } },
            },
          ],
        },
      }),
    ],
    build: { target: 'es2019', sourcemap: false },
  };
});
