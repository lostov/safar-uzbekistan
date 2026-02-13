const CACHE_NAME = 'safaruz-v1';
const APP_PREFIX = '/safar-uzbekistan'; // GitHub Pages papka nomi

// Oflayn ishlashi uchun barcha asosiy fayllar
const cacheUrls = [
    `${APP_PREFIX}/`,
    `${APP_PREFIX}/index.html`,    
    `${APP_PREFIX}/css/Montserrat/Montserrat-Black.woff`,
    `${APP_PREFIX}/css/Montserrat/Montserrat-Bold.woff`,
    `${APP_PREFIX}/css/Montserrat/Montserrat-ExtraBold.woff`,
    `${APP_PREFIX}/css/Montserrat/Montserrat-Medium.woff`,
    `${APP_PREFIX}/css/Montserrat/Montserrat-Regular.woff`,
    `${APP_PREFIX}/css/Montserrat/Montserrat-SemiBold.woff`,
    `${APP_PREFIX}/css/Montserrat/montserrat.css`,

    `${APP_PREFIX}/css/bootstrap.min.css`,
    `${APP_PREFIX}/css/bootstrap.min.css.map`,
    `${APP_PREFIX}/js/bootstrap.min.js`,
    `${APP_PREFIX}/js/bootstrap.min.js.map`,
    `${APP_PREFIX}/js/main.js`,
    `${APP_PREFIX}/js/qrcode.js`,
    `${APP_PREFIX}/manifest.json`,
    `${APP_PREFIX}/sw.js`,
    
    // Ikonkalar
    `${APP_PREFIX}/icons/favicon.ico`,
    `${APP_PREFIX}/icons/icon-48x48.png`,
    `${APP_PREFIX}/icons/icon-72x72.png`,
    `${APP_PREFIX}/icons/icon-128x128.png`,
    `${APP_PREFIX}/icons/icon-144x144.png`,
    `${APP_PREFIX}/icons/icon-152x152.png`,
    `${APP_PREFIX}/icons/icon-192x192.png`,
    `${APP_PREFIX}/icons/icon-256x256.png`,
    `${APP_PREFIX}/icons/icon-384x384.png`,
    `${APP_PREFIX}/icons/icon-512x512.png`,
    
    // Saytdagi rasmlar (Loyihangizdagi manzillarga qarab tekshiring)
    `${APP_PREFIX}/images/blue_pattern.jpg`,
    `${APP_PREFIX}/images/case.png`,
    `${APP_PREFIX}/images/embassy_en.png`,
    `${APP_PREFIX}/images/embassy_ru.png`,
    `${APP_PREFIX}/images/embassy_oz.png`,
    `${APP_PREFIX}/images/embassy_uz.png`,
    `${APP_PREFIX}/images/lang_en.png`,
    `${APP_PREFIX}/images/lang_ru.png`,
    `${APP_PREFIX}/images/lang_oz.png`,
    `${APP_PREFIX}/images/lang_uz.png`,
    `${APP_PREFIX}/images/favicon-16x16.png`,
    `${APP_PREFIX}/images/favicon-32x32.png`,
    `${APP_PREFIX}/images/favicon-48x48.png`,
    `${APP_PREFIX}/images/favicon-96x96.png`,
    `${APP_PREFIX}/images/ms-icon-144x144.png`,
    `${APP_PREFIX}/images/pattern.jpg`,
    `${APP_PREFIX}/images/quote_image.png`,
    `${APP_PREFIX}/images/stop.png`,
    `${APP_PREFIX}/images/vaqf_bg.jpg`,
    `${APP_PREFIX}/images/vaqf.png`,
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Fayllar keshga olinmoqda...');
            return cache.addAll(cacheUrls);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
});

// "Network First, falling back to cache" strategiyasi
// Avval internetdan yangi ma'lumotni olishga harakat qiladi, 
// internet bo'lmasa keshdagi nusxasini ko'rsatadi.
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // 1. Agar keshda bo'lsa, o'shani qaytaramiz
            if (cachedResponse) {
                return cachedResponse;
            }

            // 2. Keshda bo'lmasa, internetdan olamiz
            return fetch(event.request).then((response) => {
                // Agar kelayotgan ma'lumot rasm bo'lsa (masalan API dan kelayotgan ikonka), 
                // uni keshga saqlab qo'yamiz
                if (event.request.destination === 'image') {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, response.clone());
                        return response;
                    });
                }
                return response;
            });
        }).catch(() => {
            // 3. Internet ham, kesh ham bo'lmasa (Oflayn rejimda rasm yuklanmoqchi bo'lsa)
            if (event.request.destination === 'image') {
                return caches.match(`${APP_PREFIX}/icons/icon-192x192.png`);
            }
        })
    );
});