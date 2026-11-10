import { useState } from 'preact/hooks';
import { Icon } from '../components/Icon';
import { Chip, LinkRow, PageHead, QrSheet } from '../components/ui';
import { useI18n } from '../i18n';
import { useResources } from '../hooks';

export function Banned() {
  const { t, date } = useI18n();
  const res = useResources();
  const [qr, setQr] = useState<{ url: string; label: string } | null>(null);
  const onQr = (url: string, label: string) => setQr({ url, label });
  const asOf = date(new Date(res.banned.asOf + 'T12:00:00'));
  const tone = (icon?: string) => (icon === 'pdf' || icon === 'video' ? 'red' : icon === 'doc' ? 'navy' : 'blue') as 'red' | 'navy' | 'blue';

  return (
    <>
      <PageHead title={t('banned.title')} sub={t('banned.subtitle')} />

      <section class="card" style={{ background: 'var(--red-t)', borderColor: '#EBC3BD', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--red)' }}>
          <Icon name="scale" size={22} color="var(--red)" />{t('banned.court')}
        </p>
        <p style={{ fontSize: '15px', lineHeight: 1.5, color: 'var(--navy)' }}>{t('banned.description')}</p>
        <div><Chip tone="red" icon="clock">{t('banned.asOf', { date: asOf })}</Chip></div>
      </section>

      <section class="card" style={{ background: 'var(--green-t)', borderColor: '#C6E0CE', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <Icon name="shield" size={22} color="var(--green)" />
        <div><p style={{ fontSize: '15px', fontWeight: 800, color: 'var(--navy)' }}>{t('banned.appealTitle')}</p>
          <p style={{ marginTop: '4px', fontSize: '14px', lineHeight: 1.5 }}>{t('banned.appealText')}</p></div>
      </section>

      <div class="wrap">
        <section class="card" style={{ padding: '14px 16px 4px' }}>
          <h2 class="h2" style={{ paddingBottom: '4px' }}>{t('banned.list')}</h2>
          <div class="rows" style={{ borderTop: '1px solid var(--line)' }}>
            {res.banned.list.map((l) => <LinkRow label={t(l.label)} url={l.url} icon={l.icon} tone={tone(l.icon)} onQr={onQr} />)}
          </div>
        </section>
        <section class="card" style={{ padding: '14px 16px 4px' }}>
          <h2 class="h2" style={{ paddingBottom: '4px' }}>{t('banned.law')}</h2>
          <p style={{ fontSize: '14px', lineHeight: 1.5, padding: '4px 0 8px' }}><b style={{ color: 'var(--navy)' }}>{t('banned.article')}</b> {t('banned.articleText')}</p>
          <div class="rows" style={{ borderTop: '1px solid var(--line)' }}>
            {res.banned.law.map((l) => <LinkRow label={t(l.label)} url={l.url} icon={l.icon} tone={tone(l.icon)} onQr={onQr} />)}
          </div>
        </section>
      </div>
      <p class="note"><Icon name="info" size={14} color="var(--muted)" />{t('common.doubleTap')}</p>
      {qr && <QrSheet url={qr.url} label={qr.label} onClose={() => setQr(null)} />}
    </>
  );
}
