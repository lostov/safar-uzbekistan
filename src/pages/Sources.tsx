import { useState } from 'preact/hooks';
import { Icon } from '../components/Icon';
import { LinkRow, PageHead, QrSheet, Tile } from '../components/ui';
import { useI18n } from '../i18n';
import { useResources } from '../hooks';

export function Sources() {
  const { t } = useI18n();
  const res = useResources();
  const [open, setOpen] = useState<string>('g2');
  const [qr, setQr] = useState<{ url: string; label: string } | null>(null);
  const onQr = (url: string, label: string) => setQr({ url, label });

  return (
    <>
      <PageHead title={t('sources.title')} sub={t('sources.subtitle')} />
      <div class="banner" style={{ background: 'var(--blue-t)' }}><Icon name="info" size={18} color="var(--blue)" /><span>{t('common.doubleTap')}</span></div>

      {/* mobil: ochiladigan ro‘yxat */}
      <div class="card card-pad-s m-only">
        {res.officialSources.map((g) => {
          const isOpen = open === g.id;
          return (
            <div class="acc" style={{ borderTop: g === res.officialSources[0] ? 0 : '1px solid var(--line)' }}>
              <button type="button" class="row" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? '' : g.id)}>
                <Tile icon={g.icon} tone={g.tone} size="s" />
                <span class="row-main row-title" style={{ lineHeight: 1.3 }}>{t(g.title)}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted)' }}>{g.links.length}</span>
                <span style={{ display: 'flex', transform: `rotate(${isOpen ? 90 : 0}deg)` }}><Icon name="chev" size={18} color="var(--muted)" /></span>
              </button>
              {isOpen && <div class="rows" style={{ paddingBottom: '6px', borderTop: '1px solid var(--line)' }}>{g.links.map((l) => <LinkRow label={t(l.label)} url={l.url} onQr={onQr} />)}</div>}
            </div>
          );
        })}
      </div>

      {/* desktop: barcha guruhlar kartochkalarda */}
      <div class="wrap d-only" style={{ display: 'flex' }}>
        {res.officialSources.map((g) => (
          <div class="card" style={{ flex: '1 1 360px', padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '8px' }}><Tile icon={g.icon} tone={g.tone} /><p class="h2" style={{ fontSize: '16px', lineHeight: 1.3 }}>{t(g.title)}</p></div>
            <div class="rows" style={{ borderTop: '1px solid var(--line)' }}>{g.links.map((l) => <LinkRow label={t(l.label)} url={l.url} onQr={onQr} />)}</div>
          </div>
        ))}
      </div>

      <p class="note"><Icon name="check" size={14} sw={2.6} color="var(--green)" />{t('sources.cached')}</p>
      {qr && <QrSheet url={qr.url} label={qr.label} onClose={() => setQr(null)} />}
    </>
  );
}
