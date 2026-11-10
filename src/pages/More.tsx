import { useState } from 'preact/hooks';
import { Icon } from '../components/Icon';
import { Chip, LangList, PageHead, Tile, useInstallAction, type Tone } from '../components/ui';
import { useI18n, EGOV_LANG } from '../i18n';
import { cachedEmbassies, cachedWeather, cachedPrayer } from '../lib/api';
import { APP_VERSION, DATA_VERSION } from '../lib/config';
import { load } from '../lib/store';
import { useResources } from '../hooks';
import { paths } from '../router';

export function More() {
  const { t, lang, date, list } = useI18n();
  const inst = useInstallAction();
  const [about, setAbout] = useState(false);
  const now = new Date();
  const emb = cachedEmbassies(EGOV_LANG[lang]);
  const wx = cachedWeather();
  const pr = cachedPrayer(now.getFullYear(), now.getMonth() + 1);
  const saved = (ts?: number | null, label?: string) =>
    ts ? <Chip tone="green">{label ?? date(new Date(ts), true)}</Chip> : <Chip tone="sand">{t('more.notYet')}</Chip>;

  const { work } = useResources();
  const workSaved = load('file:agencies.json')?.t;
  // href bo‘lsa — karta faol havola («Ochish»), bo‘lmasa — «Tez kunda»
  const future: [string, string, string, string?][] = [
    ['users', 'more.f2', 'more.f2t', work.mahalla], ['scale', 'more.f4', 'more.f4t', paths.guides],
    ['home2', 'more.f7', 'more.f7t', paths.returnees], ['heart', 'more.f6', 'more.f6t'], ['globe', 'more.f8', 'more.f8t'],
  ];
  const cacheRow = (icon: string, tone: Tone, title: string, note: string, badge: preact.ComponentChildren) => (
    <div class="row"><Tile icon={icon} tone={tone} size="s" /><span class="row-main"><span class="row-title" style={{ display: 'block', fontSize: '14px' }}>{title}</span><span class="row-sub" style={{ display: 'block', fontSize: '12px' }}>{note}</span></span>{badge}</div>
  );

  return (
    <>
      <PageHead title={t('more.title')} sub={t('more.subtitle')} back={false} />
      <div class="wrap">
        <section class="card">
          <h2 class="h2" style={{ marginBottom: '12px' }}>{t('more.language')}</h2>
          <LangList />
          <p style={{ marginTop: '10px', fontSize: '12px', color: 'var(--muted)' }}>{t('more.languageNote')}</p>
          <p style={{ marginTop: '4px', fontSize: '12px', color: 'var(--muted)' }}>{t('more.yangiNote')}</p>
        </section>
        <section class="card" style={{ padding: '14px 16px 4px' }}>
          <h2 class="h2" style={{ paddingBottom: '6px' }}>{t('more.offline')}</h2>
          <div class="rows" style={{ borderTop: '1px solid var(--line)' }}>
            {cacheRow('doc', 'sand', t('more.offPages'), t('more.offPagesNote'), <Chip tone="green">{t('more.saved')}</Chip>)}
            {cacheRow('bank', 'blue', t('more.offEmb'), t('more.every7'), saved(emb?.t))}
            {cacheRow('cloud', 'blue', t('more.offWeather'), t('more.every3h'), saved(wx?.t))}
            {cacheRow('clock', 'green', t('more.offPrayer'), t('more.monthly'), saved(pr?.t, pr ? list('@monthsNom')[now.getMonth()] : undefined))}
            {cacheRow('brief', 'gold', t('more.offWork'), t('more.weekly'), saved(workSaved))}
          </div>
        </section>
      </div>

      {inst.installed ? (
        <div class="banner" style={{ background: 'var(--green-t)' }}><Icon name="check" size={18} color="var(--green)" />{t('install.installed')}</div>
      ) : inst.available ? (
        <button type="button" class="row" onClick={inst.run} style={{ padding: '14px 16px', borderRadius: '20px', background: 'var(--navy)', border: 0 }}>
          <Icon name="download" size={22} color="var(--gold-l)" />
          <span class="row-main"><span style={{ display: 'block', fontSize: '15px', fontWeight: 800, color: 'var(--ivory)' }}>{t('more.install')}</span><span style={{ display: 'block', fontSize: '13px', color: '#C9D6E3' }}>{t('more.installText')}</span></span>
          <Icon name="chev" size={18} color="var(--ivory)" />
        </button>
      ) : null}
      {inst.sheet}

      <section class="card card-pad-s">
        <button type="button" class="row" aria-expanded={about} onClick={() => setAbout(!about)}>
          <Tile icon="info" tone="blue" size="s" /><span class="row-main"><span class="row-title" style={{ display: 'block' }}>{t('more.about')}</span><span class="row-sub" style={{ display: 'block' }}>{t('more.aboutTitle')}</span></span>
          <span style={{ display: 'flex', transform: `rotate(${about ? 90 : 0}deg)` }}><Icon name="chev" size={18} color="var(--muted)" /></span>
        </button>
        {about && (
          <ol style={{ margin: 0, padding: '4px 4px 14px 22px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', lineHeight: 1.5 }}>
            <li>{t('more.rule1')}</li><li>{t('more.rule2')}</li><li>{t('more.rule3')}</li>
          </ol>
        )}
        <div class="row"><Tile icon="doc" tone="sand" size="s" /><span class="row-main"><span class="row-title" style={{ display: 'block' }}>{t('more.sources')}</span><span class="row-sub" style={{ display: 'block' }}>{t('more.sourcesText')}</span></span></div>
      </section>

      <h2 class="h2">{t('more.future')}</h2>
      <div class="wrap" style={{ gap: '12px' }}>
        {future.map(([icon, title, text, href]) => {
          const body = (<>
            <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Tile icon={icon} tone={href ? 'green' : 'sand'} size="s" />
              {href ? <Chip tone="green" icon={href.startsWith('#') ? 'chev' : 'ext'}>{t('common.open')}</Chip> : <Chip tone="gold">{t('more.soon')}</Chip>}
            </span>
            <p class="row-title">{t(title)}</p><p style={{ fontSize: '13px', lineHeight: 1.45 }}>{t(text)}</p>
          </>);
          const style = { flex: '1 1 210px', display: 'flex', flexDirection: 'column', gap: '8px', textDecoration: 'none', color: 'inherit' };
          const ext = href && !href.startsWith('#');
          return href ? <a class="card" href={href} target={ext ? '_blank' : undefined} rel={ext ? 'noopener' : undefined} style={style}>{body}</a> : <div class="card" style={style}>{body}</div>;
        })}
      </div>

      <p style={{ textAlign: 'center', fontSize: '12px', lineHeight: 1.5, color: 'var(--muted)', padding: '4px 8px' }}>{t('more.basis')}</p>
      <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--muted)' }}>{t('more.version', { app: APP_VERSION, data: DATA_VERSION })}</p>
    </>
  );
}
