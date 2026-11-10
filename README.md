# Safar Uzbekistan 2.0

Xorijdagi O‘zbekiston fuqarolari uchun qo‘llanma — PWA ilova.
Ro‘yxatdan o‘tish yo‘q; maʼlumotlar onlayn yangilanadi va qurilmada keshlanadi.

**Stek:** Vite + TypeScript + Preact + `vite-plugin-pwa` (Workbox).

## Ishga tushirish

```bash
npm install
cp .env.example .env        # VITE_OWM_KEY ni to‘ldiring
npm run dev                 # http://localhost:5173/safar-uzbekistan/
npm run build               # dist/ papkasiga
npm run preview             # build’ni tekshirish (PWA va oflayn rejim shu yerda ishlaydi)
npm run data                # agentliklar, viza, kurslar — rasmiy manbalardan yangilash
```

## Papkalar tuzilmasi

```
public/
  data/i18n.json         ← 5 til, bitta faylda
  data/resources.json    ← havolalar, taqiqlangan manbalar ro‘yxati, favqulodda raqamlar
  icons/, img/           ← ikonkalar, naqshlar, «Vaqf» rasmlari
src/
  main.tsx, app.tsx      ← kirish nuqtasi, sahifalar
  i18n.tsx               ← tillar konteksti
  router.ts              ← #/manbalar, #/vakolatxonalar ... (GitHub Pages’da sozlamasiz ishlaydi)
  hooks.ts               ← vakolatxonalar, ob-havo, namoz, joylashuv
  lib/                   ← api, kesh, geolokatsiya, PWA, statistika, yangi alifbo
  components/            ← Shell (yuqori panel, yon menyu, pastki menyu), UI bloklari, ikonkalar
  pages/                 ← Bosh, Manbalar, Taqiqlangan, Vakolatxonalar, Vaqf, ObHavo, Namoz, SOS, Yana
scripts/i18n-check.mjs   ← tillar faylini tekshirish
stats-worker/            ← o‘rnatishlar hisoblagichi (Cloudflare Worker)
```

## Tillar

`public/data/i18n.json` — barcha tillar bitta faylda:

| Kod | Nomi | Izoh |
|---|---|---|
| `uz-latn` | Oʻzbekcha | amaldagi lotin alifbosi (asosiy) |
| `uz-cyrl` | Ўзбекча | kirill |
| `uz-yangi` | Özbekça | 2027-yil 22-apreldan kuchga kiradigan yangi lotin alifbosi (Ö, Ğ, Ş, Ç) |
| `ru` | Русский | |
| `en` | English | |

Imlo qoidalari:
- oʻ va gʻ — **U+02BB** (ʻ) belgisi bilan, tutuq belgisi — **U+02BC** (ʼ). Oddiy `'` ishlatilmaydi.
- `uz-yangi` qo‘lda yozilmaydi: `uz-latn` dan avtomatik olinadi →
  `npm run i18n:yangi`.
- Har o‘zgarishdan keyin: `npm run i18n`. Skript yetishmayotgan kalitlarni, noto‘g‘ri apostroflarni
  va `{placeholder}` mos kelmasligini topadi. GitHub Actions ham shu tekshiruvdan o‘tmasa deploy qilmaydi.
- data.egov.uz’dan keladigan vakolatxona nomlari ham Özbekça tanlanganda avtomatik yangi alifboga o‘giriladi.

## Maʼlumotlarni yangilash (kesh parametri)

`index.html` da:

```html
<meta name="data-version" content="2026.11.09" />
```

JSON fayllar shu versiya bilan yuklanadi: `data/i18n.json?v=2026.11.09`.

**`i18n.json` yoki `resources.json` ni o‘zgartirsangiz — shu sanani yangilang** (masalan `2026.11.15`):

1. `index.html` o‘zgaradi → Service Worker yangi versiyani ko‘radi va foydalanuvchida avtomatik yangilanadi (`registerType: 'autoUpdate'`).
2. Yangi `?v=` tufayli brauzer va CDN keshi chetlab o‘tiladi — hamma yangi faylni oladi.
3. Internet bo‘lmasa, oxirgi yuklangan nusxa ishlaydi (Service Worker keshi + localStorage).

Masalan, Oliy sud ro‘yxati yangilanganda faqat `resources.json` dagi `banned` bo‘limi va `data-version` o‘zgartiriladi.

## Oflayn ishlash

| Maʼlumot | Manba | Yangilanish |
|---|---|---|
| Sahifalar, rasmlar, JS/CSS | Service Worker (precache) | har deploy’da |
| Tillar, havolalar | `data/*.json` | `data-version` o‘zgarganda |
| Vakolatxonalar | data.egov.uz | 7 kunda bir |
| Ob-havo | OpenWeatherMap | 3 soatda bir |
| Namoz vaqtlari | Aladhan (13-usul) | oylik jadval |

Eng yaqin vakolatxona (SOS) keshdagi koordinatalar bo‘yicha hisoblanadi — internet kerak emas.

## Deploy

`.github/workflows/deploy.yml` — `main` ga push qilinganda build va GitHub Pages’ga chiqaradi.
- Repo → Settings → Pages → Source: **GitHub Actions**.
- Settings → Secrets → Actions: `VITE_OWM_KEY`, (ixtiyoriy) `VITE_STATS_URL`.
- Eski `.github/workflows/static.yml` ni o‘chiring (u build qilmasdan butun repo’ni chiqarardi).

## O‘rnatishlar hisoblagichi

`src/lib/stats.ts` anonim hodisalar yuboradi (faqat `VITE_STATS_URL` sozlangan bo‘lsa):

- `install` — Android/desktop’da ilova o‘rnatildi (`appinstalled`)
- `first_standalone` — ilova birinchi marta uy ekranidan ochildi (iOS uchun yagona ishonchli belgi)
- `open`, `open_standalone` — kuniga bir marta ochilish

Server qismi: `stats-worker/` (Cloudflare Workers + KV, bepul tarif). Natija:
`https://<worker>/stats?key=<STATS_KEY>` → jami, platformalar bo‘yicha va oxirgi 7 kun.
