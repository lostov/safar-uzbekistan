import type { ComponentChildren } from 'preact';
import { Icon } from './Icon';
import { Chip, InstallTopButton, LangButton, StatusChip } from './ui';
import { useI18n } from '../i18n';
import { paths, type Route } from '../router';
import { BASE } from '../lib/config';

type NavKey = Route['name'];
const active = (r: Route, keys: NavKey[]) => (keys.includes(r.name) ? 'page' : undefined);

export function Shell({ route, children }: { route: Route; children: ComponentChildren }) {
  const { t } = useI18n();
  const side: [string, string, string, NavKey[]][] = [
    ['home', t('nav.home'), paths.home, ['home']],
    ['shield', t('nav.sources'), paths.sources, ['sources']],
    ['stop', t('nav.banned'), paths.banned, ['banned']],
    ['bank', t('nav.embassies'), paths.embassies, ['embassies', 'embassy']],
    ['gift', t('nav.vaqf'), paths.vaqf, ['vaqf']],
    ['cloud', t('nav.weather'), paths.weather, ['weather']],
    ['clock', t('nav.prayerFull'), paths.prayer, ['prayer']],
    ['brief', t('nav.xorijdaish'), paths.xorijdaish, ['xorijdaish']],
    ['grad', t('nav.courses'), paths.courses, ['courses']],
    ['users', t('nav.agencies'), paths.agencies, ['agencies']],
    ['plane', t('nav.visa'), paths.visa, ['visa']],
    ['scale', t('nav.guides'), paths.guides, ['guides']],
    ['dots', t('nav.more'), paths.more, ['more']],
  ];
  return (
    <div class="shell">
      {/* desktop: yuqori panel */}
      <header class="topbar d-only">
        <div class="topbar-in">
          <a class="brand" href={paths.home}><img src={`${BASE}img/rosette.svg`} alt="" /><span><b>{t('app.name')}</b><small>{t('app.tagline')}</small></span></a>
          <div class="topbar-right"><StatusChip /><Chip tone="navy" icon="check">{t('status.cacheReady')}</Chip><InstallTopButton /><LangButton /></div>
        </div>
      </header>
      <div class="ikat d-only" aria-hidden="true" style={{ backgroundImage: `url(${BASE}img/ikat_h.svg)` }} />

      <div class="layout">
        {/* desktop: yon menyu */}
        <aside class="sidebar d-only" aria-label={t('nav.menu')}>
          <a class="sos-card" href={paths.sos}>
            <span class="ico" style={{ fontFamily: 'var(--hf)', fontWeight: 800, fontSize: '12px', color: 'var(--ivory)' }}>SOS</span>
            <span><b>{t('home.sosTitle')}</b><small>{t('home.sosText')}</small></span>
          </a>
          <nav class="side-nav">
            {side.map(([icon, label, href, keys]) => (
              <a href={href} aria-current={active(route, keys)}><Icon name={icon} size={20} color="var(--navy)" />{label}</a>
            ))}
          </nav>
          <p class="side-note">{t('more.basis')}</p>
        </aside>

        <main class="main" id="main">{children}</main>
      </div>

      {/* mobil: pastki menyu */}
      <nav class="bottom-nav m-only" aria-label={t('nav.menu')}>
        <a href={paths.home} aria-current={active(route, ['home', 'sources', 'banned', 'embassies', 'embassy', 'vaqf', 'agencies', 'visa', 'courses', 'xorijdaish', 'guides'])}><Icon name="home" size={22} /><span>{t('nav.home')}</span></a>
        <a href={paths.weather} aria-current={active(route, ['weather'])}><Icon name="cloud" size={22} /><span>{t('nav.weather')}</span></a>
        <a href={paths.sos} class="sos" aria-label={t('home.sosTitle')} aria-current={active(route, ['sos'])}>SOS</a>
        <a href={paths.prayer} aria-current={active(route, ['prayer'])}><Icon name="clock" size={22} /><span>{t('nav.prayer')}</span></a>
        <a href={paths.more} aria-current={active(route, ['more'])}><Icon name="dots" size={22} /><span>{t('nav.more')}</span></a>
      </nav>
    </div>
  );
}
