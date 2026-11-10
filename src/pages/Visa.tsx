import { useMemo, useState } from 'preact/hooks';
import { Icon } from '../components/Icon';
import { Chip, LinkRow, PageHead, QrSheet, SearchInput, Tile, type Tone } from '../components/ui';
import { useI18n } from '../i18n';
import { useDataFile } from '../hooks';
import { cachedWeather } from '../lib/api';
import type { VisaFile, VisaGroupId } from '../lib/data';

const GROUP: Record<VisaGroupId, { icon: string; tone: Tone }> = {
  free: { icon: 'check', tone: 'green' },
  tourist: { icon: 'doc', tone: 'blue' },
  arrival: { icon: 'plane', tone: 'gold' },
  evisa: { icon: 'globe', tone: 'navy' },
};

export function Visa() {
  const { t, lang, loc, date } = useI18n();
  const file = useDataFile<VisaFile>('visa.json');
  const [q, setQ] = useState('');
  const [qr, setQr] = useState<{ url: string; label: string } | null>(null);
  const here = cachedWeather()?.data.country || '';

  const groups = file.data?.groups ?? [];
  const count = (ids: VisaGroupId[]) => groups.filter((g) => ids.includes(g.id)).reduce((n, g) => n + g.countries.length, 0);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return groups;
    return groups.map((g) => ({ ...g, countries: g.countries.filter((c) => [loc(c.name), ...Object.values(c.name)].join(' ').toLowerCase().includes(s)) }));
  }, [groups, q, lang]);
  const hereGroups = here ? groups.filter((g) => g.countries.some((c) => c.iso === here)) : [];
  const hereName = hereGroups[0]?.countries.find((c) => c.iso === here)?.name;

  const official = file.data?.source[lang === 'uz-yangi' ? 'uz-latn' : lang];
  const officialOther = file.data && official && !official.includes(`/${{ 'uz-latn': 'oz', 'uz-yangi': 'oz', 'uz-cyrl': 'uz', ru: 'ru', en: 'en' }[lang]}/`);

  return (
    <>
      <PageHead title={t('visa.title')} sub={t('visa.subtitle')} />

      {file.data && (
        <div class="grid2">
          <div class="card" style={{ background: 'var(--green-t)', borderColor: '#C6E0CE' }}>
            <b style={{ fontFamily: 'var(--hf)', fontSize: '28px', color: 'var(--green)' }}>{count(['free', 'tourist'])}</b>
            <p style={{ fontSize: '13px', lineHeight: 1.4, color: 'var(--navy)' }}>{t('visa.sumFree')}</p>
          </div>
          <div class="card" style={{ background: 'var(--gold-t)', borderColor: '#E7D3A6' }}>
            <b style={{ fontFamily: 'var(--hf)', fontSize: '28px', color: 'var(--gold-d)' }}>{count(['arrival', 'evisa'])}</b>
            <p style={{ fontSize: '13px', lineHeight: 1.4, color: 'var(--navy)' }}>{t('visa.sumSimple')}</p>
          </div>
        </div>
      )}

      {hereName && (
        <section class="card" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Tile icon="pin" tone="blue" />
          <span class="row-main">
            <span class="row-sub" style={{ display: 'block' }}>{t('visa.here')}</span>
            <span class="row-title" style={{ display: 'block' }}>{loc(hereName)}</span>
          </span>
          <span style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
            {hereGroups.map((g) => <Chip tone={GROUP[g.id].tone}>{t(`visa.g.${g.id}`)}</Chip>)}
          </span>
        </section>
      )}

      <SearchInput value={q} onInput={setQ} placeholder={t('visa.search')} />

      {!file.data && (file.error ? <div class="empty">{t('common.error')}</div> : <div class="spinner" />)}
      {filtered.map((g) => g.countries.length > 0 && (
        <section class="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Tile icon={GROUP[g.id].icon} tone={GROUP[g.id].tone} size="s" />
            <span class="row-main">
              <span class="h2" style={{ display: 'block', fontSize: '16px' }}>{t(`visa.g.${g.id}`)}</span>
              <span class="row-sub" style={{ display: 'block' }}>{t(`visa.g.${g.id}Text`)}</span>
            </span>
            <Chip tone="sand">{g.countries.length}</Chip>
          </div>
          <div class="country-list">
            {g.countries.map((c) => <span class={`country ${c.iso && c.iso === here ? 'here' : ''}`}>{loc(c.name)}</span>)}
          </div>
        </section>
      ))}
      {file.data && q && !filtered.some((g) => g.countries.length) && <div class="card empty">{t('visa.notListed')}</div>}

      {file.data && (
        <section class="card" style={{ padding: '14px 16px 4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: '14px', lineHeight: 1.5, display: 'flex', gap: '8px' }}><Icon name="info" size={18} color="var(--blue)" />{t('visa.other')}</p>
          <p class="note">{t('visa.source', { date: date(new Date((file.data.updated || file.data.fetched) + 'T12:00:00'), true) })}</p>
          <div class="rows" style={{ borderTop: '1px solid var(--line)' }}>
            {official && <LinkRow label={t('visa.official')} url={official} icon="bank" tone="blue" onQr={(url, label) => setQr({ url, label })} />}
          </div>
          {officialOther && <p class="note" style={{ paddingBottom: '10px' }}>{t('visa.langNote')}</p>}
        </section>
      )}
      {qr && <QrSheet url={qr.url} label={qr.label} onClose={() => setQr(null)} />}
    </>
  );
}
