import { useMemo, useState } from 'preact/hooks';
import { Icon } from '../components/Icon';
import { Chip, PageHead, Segments, SelectInput, Tile } from '../components/ui';
import { useI18n } from '../i18n';
import { useDataFile, useResources } from '../hooks';
import type { Course, CoursesFile } from '../lib/data';

type Tab = 'language' | 'profession';

function CourseCard({ c, kind }: { c: Course; kind: Tab }) {
  const { t, ext, loc, region } = useI18n();
  const regions = c.regions.length >= 14 ? t('cr.allRegions') : c.regions.map((r) => region(r)).join(', ');
  return (
    <div class="card" style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <Tile icon={kind === 'language' ? 'lang' : 'brief'} tone={kind === 'language' ? 'blue' : 'green'} size="s" />
        {c.lang && <Chip tone="blue">{loc(c.lang)}</Chip>}
      </span>
      <p class="row-title" style={{ lineHeight: 1.35 }}>{ext(c.name)}</p>
      <div class="chips">
        <Chip tone="sand" icon={c.format === 'online' ? 'wifi' : 'pin'}>{t(c.format === 'online' ? 'cr.online' : 'cr.offline')}</Chip>
        {c.months != null && <Chip tone="sand" icon="clock">{t('cr.months', { n: c.months })}</Chip>}
      </div>
      {c.format === 'offline' && regions && <p style={{ fontSize: '13px', lineHeight: 1.45, color: 'var(--muted)' }}><b style={{ color: 'var(--ink)' }}>{t('cr.regions')}:</b> {regions}</p>}
      {c.phone && <a class="btn light" href={`tel:${c.phone}`} style={{ marginTop: 'auto' }}><Icon name="phone" size={17} />{c.phone.replace(/^\+998(\d{2})(\d{3})(\d{2})(\d{2})$/, '+998 $1 $2-$3-$4')}</a>}
    </div>
  );
}

export function Courses() {
  const { t, lang, region, date } = useI18n();
  const res = useResources();
  const file = useDataFile<CoursesFile>('courses.json');
  const [tab, setTab] = useState<Tab>('language');
  const [reg, setReg] = useState('');

  const all = file.data?.[tab] ?? [];
  const regions = useMemo(() => [...new Set([...(file.data?.language ?? []), ...(file.data?.profession ?? [])].flatMap((c) => c.regions))]
    .sort((x, y) => region(x).localeCompare(region(y))), [file.data, lang]);
  const list = all.filter((c) => !reg || c.format === 'online' || c.regions.includes(reg));

  return (
    <>
      <PageHead title={t('cr.title')} sub={t('cr.subtitle')} />

      <div class="filters">
        <Segments value={tab} onChange={setTab} items={[['language', `${t('cr.language')} · ${file.data?.language.length ?? 0}`], ['profession', `${t('cr.profession')} · ${file.data?.profession.length ?? 0}`]]} />
        <SelectInput value={reg} onChange={setReg} label={t('ag.region')} options={[['', t('ag.allRegions')], ...regions.map((r) => [r, region(r)] as [string, string])]} />
      </div>

      {(lang === 'uz-cyrl' || lang === 'ru' || lang === 'en') && file.data && <p class="note"><Icon name="info" size={14} color="var(--muted)" />{t('cr.nameNote')}</p>}

      {!file.data && (file.error ? <div class="empty">{t('common.error')}</div> : <div class="spinner" />)}
      {file.data && !list.length && <div class="card empty">{t('cr.empty')}</div>}
      <div class="wrap" style={{ gap: '12px' }}>
        {list.map((c) => <CourseCard c={c} kind={tab} />)}
      </div>

      <section class="card" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Tile icon="grad" tone="gold" />
        <p style={{ flex: '1 1 240px', fontSize: '14px', lineHeight: 1.5, color: 'var(--navy)' }}>{t('cr.apply')}</p>
        <a class="btn navy" href={res.work.xorijdaish} target="_blank" rel="noopener"><Icon name="ext" size={17} />xorijdaish.uz</a>
      </section>
      {file.data && <p class="note">{t('cr.source', { date: date(new Date(file.data.fetched + 'T12:00:00'), true) })}</p>}
    </>
  );
}
