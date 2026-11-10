import { useState } from 'preact/hooks';
import { Icon } from '../components/Icon';
import { LinkRow, PageHead, QrSheet, Tile, type Tone } from '../components/ui';
import { useI18n } from '../i18n';
import { useResources } from '../hooks';
import { paths } from '../router';
import { BASE } from '../lib/config';

const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export function Xorijdaish() {
  const { t } = useI18n();
  const { work } = useResources();
  const [qr, setQr] = useState<{ url: string; label: string } | null>(null);
  const onQr = (url: string, label: string) => setQr({ url, label });

  const features: [string, Tone, string][] = [
    ['brief', 'blue', 'xd.f1'], ['grad', 'green', 'xd.f2'], ['globe', 'blue', 'xd.f3'],
    ['doc', 'gold', 'xd.f4'], ['plane', 'green', 'xd.f5'], ['user', 'navy', 'xd.f6'],
  ];
  const stores = [
    <a class="btn light" href={work.android} target="_blank" rel="noopener"><img src={`${BASE}img/google-play.svg`} width={20} height={20} alt="" />Google Play</a>,
    <a class="btn light" href={work.ios} target="_blank" rel="noopener"><img src={`${BASE}img/app-store.svg`} width={20} height={20} alt="" />App Store</a>,
  ];
  const related: [string, Tone, string, string, string][] = [
    ['grad', 'green', t('nav.courses'), t('home.crText'), paths.courses],
    ['brief', 'blue', t('nav.agencies'), t('home.agText'), paths.agencies],
    ['plane', 'gold', t('nav.visa'), t('home.visaText'), paths.visa],
  ];

  return (
    <>
      <PageHead title={t('xd.title')} sub={t('xd.subtitle')} />

      <section class="navy-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <p style={{ fontSize: '15px', lineHeight: 1.55 }}>{t('xd.about')}</p>
        <div class="store-row">
          {isIos ? [stores[1], stores[0]] : stores}
          <a class="btn gold" href={work.xorijdaish} target="_blank" rel="noopener"><Icon name="ext" size={18} />{t('xd.web')}</a>
        </div>
      </section>

      <h2 class="h2">{t('xd.features')}</h2>
      <div class="wrap" style={{ gap: '12px' }}>
        {features.map(([icon, tone, key]) => (
          <div class="card" style={{ flex: '1 1 260px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Tile icon={icon} tone={tone} size="s" /><p style={{ fontSize: '14px', lineHeight: 1.5, color: 'var(--navy)' }}>{t(key)}</p>
          </div>
        ))}
      </div>

      <section class="card" style={{ background: 'var(--gold-t)', borderColor: '#E7D3A6', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <Icon name="alert" size={22} color="var(--gold-d)" />
        <p style={{ fontSize: '14px', lineHeight: 1.5, color: 'var(--navy)' }}>{t('xd.warning')}</p>
      </section>

      <section class="card" style={{ padding: '14px 16px 4px' }}>
        <h2 class="h2" style={{ paddingBottom: '4px' }}>{t('xd.links')}</h2>
        <div class="rows" style={{ borderTop: '1px solid var(--line)' }}>
          <LinkRow label={t('xd.web')} url={work.xorijdaish} icon="globe" tone="blue" onQr={onQr} />
          <LinkRow label="Google Play" url={work.android} img={`${BASE}img/google-play.svg`} onQr={onQr} />
          <LinkRow label="App Store" url={work.ios} img={`${BASE}img/app-store.svg`} onQr={onQr} />
          <LinkRow label={t('xd.mahalla')} url={work.mahalla} icon="users" tone="green" onQr={onQr} />
        </div>
      </section>

      <h2 class="h2">{t('xd.related')}</h2>
      <div class="card card-pad-s">
        {related.map(([icon, tone, title, text, href]) => (
          <a class="row" href={href}><Tile icon={icon} tone={tone} />
            <span class="row-main"><span class="row-title" style={{ display: 'block' }}>{title}</span><span class="row-sub" style={{ display: 'block' }}>{text}</span></span>
            <Icon name="chev" size={18} color="var(--muted)" /></a>
        ))}
      </div>
      <p class="note">{t('xd.source')}</p>
      {qr && <QrSheet url={qr.url} label={qr.label} onClose={() => setQr(null)} />}
    </>
  );
}
