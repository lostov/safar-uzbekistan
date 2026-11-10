/**
 * Safar Uzbekistan — anonim hisoblagich (Cloudflare Workers + KV, bepul tarif yetarli).
 *
 * Nima hisoblaydi:
 *   install           — Android/desktop’da “O‘rnatish” bosilib, ilova o‘rnatilgan (appinstalled hodisasi)
 *   first_standalone  — ilova birinchi marta uy ekranidan ochilgan (iOS o‘rnatishlarini ham ushlaydi)
 *   open / open_standalone — kuniga bir marta: brauzerda yoki o‘rnatilgan ilovada ochilgan
 * Shaxsiy maʼlumot saqlanmaydi: faqat tasodifiy qurilma ID’si (unikal qurilmalarni sanash uchun).
 *
 * O‘rnatish:
 *   1) npm i -g wrangler && wrangler login
 *   2) wrangler kv namespace create STATS   → chiqqan id’ni wrangler.toml ga yozing
 *   3) wrangler deploy
 *   4) Ilovada .env: VITE_STATS_URL=https://safar-stats.<akkaunt>.workers.dev/hit
 *   5) Statistika: https://safar-stats.<akkaunt>.workers.dev/stats?key=<STATS_KEY>
 */
const EVENTS = ['install', 'first_standalone', 'open', 'open_standalone'];
const PLATFORMS = ['android', 'ios', 'desktop'];
const ALLOWED_ORIGINS = ['https://lostov.github.io', 'http://localhost:5173', 'http://localhost:4173'];

function cors(origin) {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

async function incr(env, key) {
  const v = parseInt((await env.STATS.get(key)) || '0', 10) + 1;
  await env.STATS.put(key, String(v));
  return v;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors(origin) });

    if (url.pathname === '/hit' && request.method === 'POST') {
      let body = {};
      try { body = JSON.parse(await request.text()); } catch { return new Response('bad json', { status: 400 }); }
      const e = EVENTS.includes(body.e) ? body.e : null;
      const p = PLATFORMS.includes(body.p) ? body.p : 'desktop';
      const id = typeof body.id === 'string' ? body.id.slice(0, 64) : '';
      if (!e || !id) return new Response('bad event', { status: 400, headers: cors(origin) });

      const day = new Date().toISOString().slice(0, 10);
      // bir qurilma bir hodisani faqat bir marta (install, first_standalone) yoki kuniga bir marta (open) sanaydi
      const onceKey = e.startsWith('open') ? `seen:${e}:${day}:${id}` : `seen:${e}:${id}`;
      if (await env.STATS.get(onceKey)) return new Response('dup', { headers: cors(origin) });
      await env.STATS.put(onceKey, '1', e.startsWith('open') ? { expirationTtl: 3 * 86400 } : undefined);

      await incr(env, `total:${e}`);
      await incr(env, `total:${e}:${p}`);
      await incr(env, `day:${day}:${e}`);
      return new Response('ok', { headers: cors(origin) });
    }

    if (url.pathname === '/stats') {
      if (url.searchParams.get('key') !== env.STATS_KEY) return new Response('forbidden', { status: 403 });
      const out = { totals: {}, last7days: {} };
      for (const e of EVENTS) {
        out.totals[e] = { all: +(await env.STATS.get(`total:${e}`) || 0) };
        for (const p of PLATFORMS) out.totals[e][p] = +(await env.STATS.get(`total:${e}:${p}`) || 0);
      }
      for (let i = 0; i < 7; i++) {
        const d = new Date(Date.now() - i * 86400e3).toISOString().slice(0, 10);
        out.last7days[d] = {};
        for (const e of EVENTS) out.last7days[d][e] = +(await env.STATS.get(`day:${d}:${e}`) || 0);
      }
      // taxminiy o‘rnatishlar soni: Android/desktop install + iOS first_standalone
      out.installsEstimate = out.totals.install.all + out.totals.first_standalone.ios;
      return Response.json(out, { headers: cors(origin) });
    }
    return new Response('Safar Uzbekistan stats', { status: 404 });
  },
};
