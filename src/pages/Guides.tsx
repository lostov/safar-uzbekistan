import { useMemo, useState } from 'preact/hooks';
import { Icon } from '../components/Icon';
import { Chip, PageHead, SearchInput, Segments, Tile, type Tone } from '../components/ui';
import { useI18n } from '../i18n';
import { useDataFile, useResources } from '../hooks';
import type { Guide, GuidesFile } from '../lib/data';
import { paths } from '../router';

type Group = Guide['group'] | 'all';
const GROUP: Record<Guide['group'], { icon: string; tone: Tone }> = {
  country: { icon: 'globe', tone: 'blue' },
  return: { icon: 'home2', tone: 'green' },
  general: { icon: 'scale', tone: 'gold' },
};

/** Maqola: manbadagi HTML scripts/fetch-data.mjs da xavfsiz teglargacha tozalangan */
function Article({ g, file }: { g: Guide; file: GuidesFile }) {
  const { t, loc, ext, lang, date } = useI18n();
  const { work } = useResources();
  const html = lang === 'uz-yangi' ? ext(g.body['uz-latn']) : g.body[lang] || g.body['uz-latn'];
  const old = g.updated && Date.now() - new Date(g.updated).getTime() > 2 * 365 * 864e5;
  return (
    <>
      <PageHead title={loc(g.title)} sub={loc(g.desc)} back={g.group === 'return' ? paths.returnees : paths.guides} />
      <div class="chips">
        <Chip tone="sand" icon="clock">{t('gd.updated', { date: date(new Date(g.updated + 'T12:00:00')) })}</Chip>
      </div>
      {old && (
        <section class="card" style={{ background: 'var(--gold-t)', borderColor: '#E7D3A6', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <Icon name="alert" size={22} color="var(--gold-d)" />
          <p style={{ fontSize: '14px', lineHeight: 1.5, color: 'var(--navy)' }}>{t('gd.old')}</p>
        </section>
      )}
      <article class="card guide-body" dangerouslySetInnerHTML={{ __html: html }} />
      <section class="card" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Tile icon="info" tone="blue" />
        <p style={{ flex: '1 1 240px', fontSize: '13px', lineHeight: 1.5 }}>{t('gd.source', { date: date(new Date(file.fetched + 'T12:00:00'), true) })}</p>
        <a class="btn light" href={work.xorijdaish} target="_blank" rel="noopener"><Icon name="ext" size={17} />xorijdaish.uz</a>
      </section>
    </>
  );
}

export function Guides({ id, group }: { id?: number; group?: 'return' }) {
  const { t, loc, lang, country } = useI18n();
  const file = useDataFile<GuidesFile>('guides.json');
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<Group>(group ?? 'all');
  const items = file.data?.items ?? [];

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const order: Guide['group'][] = ['country', 'general', 'return'];
    return items
      .filter((g) => (tab === 'all' || g.group === tab) && (!s || (loc(g.title) + ' ' + loc(g.desc)).toLowerCase().includes(s)))
      .sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group));
  }, [items, q, tab, lang]);

  const current = id ? items.find((g) => g.id === id) : undefined;
  if (id && file.data && current) return <Article g={current} file={file.data} />;

  return (
    <>
      <PageHead title={t(group === 'return' ? 'gd.returnTitle' : 'gd.title')} sub={t(group === 'return' ? 'gd.returnSubtitle' : 'gd.subtitle')} />
      <div class="filters">
        <SearchInput value={q} onInput={setQ} placeholder={t('gd.search')} />
      </div>
      <Segments value={tab} onChange={setTab} items={[['all', t('emb.all')], ['country', t('gd.country')], ['general', t('gd.general')], ['return', t('gd.return')]]} />

      {!file.data && (file.error ? <div class="empty">{t('common.error')}</div> : <div class="spinner" />)}
      {id && file.data && !current && <div class="card empty">{t('emb.empty')}</div>}
      {file.data && !list.length && <div class="card empty">{t('emb.empty')}</div>}
      <div class="card card-pad-s">
        {list.map((g, i) => (
          <a class="row" href={paths.guide(g.id)} style={i ? { borderTop: '1px solid var(--line)' } : undefined}>
            <Tile icon={GROUP[g.group].icon} tone={GROUP[g.group].tone} size="s" />
            <span class="row-main">
              <span class="row-title" style={{ display: 'block', fontSize: '14px' }}>{g.iso ? country(g.iso) : loc(g.title)}</span>
              <span class="row-sub" style={{ display: 'block' }}>{g.iso ? loc(g.title) : loc(g.desc)}</span>
            </span>
            <Icon name="chev" size={18} color="var(--muted)" />
          </a>
        ))}
      </div>
      {file.data && <p class="note"><Icon name="info" size={14} color="var(--muted)" />{t('gd.sourceShort')}</p>}
    </>
  );
}
