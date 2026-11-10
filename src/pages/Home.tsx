import { Icon } from '../components/Icon';
import { Chip, InstallBanner, LangButton, StatusChip, Tile, type Tone } from '../components/ui';
import { useI18n } from '../i18n';
import { paths } from '../router';
import { nextPrayer, usePosition, usePrayer, useWeather } from '../hooks';
import { condition } from '../lib/api';
import { BASE } from '../lib/config';

const PRAYER_KEYS = ['prayer.fajr', 'prayer.sunrise', 'prayer.dhuhr', 'prayer.asr', 'prayer.maghrib', 'prayer.isha'];

export function Home() {
  const { t } = useI18n();
  const { pos } = usePosition(true);
  const wx = useWeather(pos);
  const pr = usePrayer(pos);
  const next = pr.data ? nextPrayer(pr.data) : null;
  const nowItem = wx.data?.items.find((i) => i.dt * 1000 > Date.now() - 3 * 3600e3);

  const blocks: [string, Tone, string, string, string][] = [
    ['shield', 'blue', t('home.sourcesTitle'), t('home.sourcesText'), paths.sources],
    ['stop', 'red', t('home.bannedTitle'), t('home.bannedText'), paths.banned],
    ['bank', 'green', t('home.embassiesTitle'), t('home.embassiesText'), paths.embassies],
    ['gift', 'gold', t('home.vaqfTitle'), t('home.vaqfText'), paths.vaqf],
  ];
  // «Xorijda ish va safar» bo‘limi
  const work: [string, Tone, string, string, string][] = [
    ['brief', 'blue', t('nav.xorijdaish'), t('home.xdText'), paths.xorijdaish],
    ['grad', 'green', t('nav.courses'), t('home.crText'), paths.courses],
    ['users', 'navy', t('nav.agencies'), t('home.agText'), paths.agencies],
    ['plane', 'gold', t('nav.visa'), t('home.visaText'), paths.visa],
    ['scale', 'green', t('nav.guides'), t('home.guidesText'), paths.guides],
  ];

  const widgets = (
    <div class="grid2 home-widgets">
      <a href={paths.weather} class="card" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', textDecoration: 'none' }}>
        <Icon name="cloud" size={26} color="var(--blue)" />
        <span><small style={{ display: 'block', fontSize: '12px', color: 'var(--muted)' }}>{wx.data?.city || t('nav.weather')}</small>
          <b style={{ fontFamily: 'var(--hf)', fontSize: '18px', color: 'var(--navy)' }}>{nowItem ? `${nowItem.temp}°C` : '—'}</b>
          {nowItem && <small class="sr-only">{t(`weather.c.${condition(nowItem.icon)}`)}</small>}</span>
      </a>
      <a href={paths.prayer} class="card" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', textDecoration: 'none' }}>
        <Icon name="clock" size={26} color="var(--green)" />
        <span><small style={{ display: 'block', fontSize: '12px', color: 'var(--muted)' }}>{t('home.nextPrayer')}{next ? ` · ${t(PRAYER_KEYS[next.index])}` : ''}</small>
          <b style={{ fontFamily: 'var(--hf)', fontSize: '18px', color: 'var(--navy)' }}>{next ? next.day.times[next.index] : '—'}</b></span>
      </a>
    </div>
  );

  return (
    <>
      {/* mobil sarlavha */}
      <section class="m-hero m-only" style={{ margin: '0 -18px' }}>
        <div class="m-hero-row">
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={`${BASE}img/rosette.svg`} alt="" width={34} height={34} />
            <b style={{ fontFamily: 'var(--hf)', fontSize: '17px', color: 'var(--ivory)' }}>{t('app.name')}</b>
          </span>
          <LangButton />
        </div>
        <h1>{t('app.tagline')}</h1>
        <div class="chips"><StatusChip /><Chip tone="navy" icon="check">{t('status.cacheReady')}</Chip></div>
      </section>
      <div class="ikat m-only" aria-hidden="true" style={{ backgroundImage: `url(${BASE}img/ikat_h.svg)`, margin: '0 -18px', width: 'calc(100% + 36px)' }} />

      {/* desktop sarlavha */}
      <header class="page-head d-only"><div><h1 class="page-title">{t('nav.home')}</h1><p class="page-sub">{t('home.subtitle')}</p></div></header>

      <InstallBanner />

      <a class="sos-card m-only" href={paths.sos}>
        <span class="ico"><Icon name="phone" size={22} color="var(--ivory)" /></span>
        <span style={{ flex: 1 }}><b>{t('home.sosTitle')}</b><small>{t('home.sosText')}</small></span>
        <Icon name="chev" size={20} color="var(--ivory)" />
      </a>

      <div class="wrap">
        <figure class="quote" style={{ flex: '1 1 360px' }}>
          <blockquote>{t('home.quote')}</blockquote>
          <figcaption>{t('home.quoteAuthor')}</figcaption>
        </figure>
        <div class="d-only" style={{ flex: '1 1 360px', display: 'flex' }}>{widgets}</div>
      </div>

      <div class="card card-pad-s m-only">
        {blocks.map(([icon, tone, title, text, href]) => (
          <a class="row" href={href}><Tile icon={icon} tone={tone} />
            <span class="row-main"><span class="row-title" style={{ display: 'block' }}>{title}</span><span class="row-sub" style={{ display: 'block' }}>{text}</span></span>
            <Icon name="chev" size={18} color="var(--muted)" /></a>
        ))}
      </div>
      <div class="wrap d-only" style={{ display: 'flex' }}>
        {blocks.map(([icon, tone, title, text, href]) => (
          <a href={href} class="card" style={{ flex: '1 1 360px', display: 'flex', flexDirection: 'column', gap: '12px', padding: '22px', textDecoration: 'none' }}>
            <span style={{ display: 'flex', justifyContent: 'space-between' }}><Tile icon={icon} tone={tone} size="l" /><Icon name="chev" size={20} color="var(--muted)" /></span>
            <b style={{ fontFamily: 'var(--hf)', fontSize: '18px', color: 'var(--navy)' }}>{title}</b>
            <span style={{ fontSize: '14px', color: 'var(--ink)' }}>{text}</span>
          </a>
        ))}
      </div>

      <div class="m-only">{widgets}</div>

      <h2 class="h2">{t('home.workTitle')}</h2>
      <div class="card card-pad-s m-only">
        {work.map(([icon, tone, title, text, href]) => (
          <a class="row" href={href}><Tile icon={icon} tone={tone} />
            <span class="row-main"><span class="row-title" style={{ display: 'block' }}>{title}</span><span class="row-sub" style={{ display: 'block' }}>{text}</span></span>
            <Icon name="chev" size={18} color="var(--muted)" /></a>
        ))}
      </div>
      <div class="wrap d-only" style={{ display: 'flex', gap: '12px' }}>
        {work.map(([icon, tone, title, text, href]) => (
          <a href={href} class="card" style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: '10px', padding: '18px', textDecoration: 'none' }}>
            <Tile icon={icon} tone={tone} />
            <b style={{ fontFamily: 'var(--hf)', fontSize: '16px', color: 'var(--navy)' }}>{title}</b>
            <span style={{ fontSize: '13px', color: 'var(--ink)' }}>{text}</span>
          </a>
        ))}
      </div>

      <div class="banner d-only" style={{ background: 'var(--gold-t)', border: '1px solid #E7D3A6', padding: '18px 22px', borderRadius: '22px', fontSize: '15px', flexWrap: 'wrap' }}>
        <Icon name="alert" size={26} color="var(--gold-d)" />
        <p style={{ flex: '1 1 320px' }}>{t('home.warning')}</p>
        <a class="btn navy" href={paths.banned}><Icon name="ext" size={18} />{t('home.viewList')}</a>
      </div>
    </>
  );
}
