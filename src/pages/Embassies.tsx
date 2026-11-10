import { useMemo, useState } from 'preact/hooks';
import { Icon } from '../components/Icon';
import { Chip, PageHead, StatusChip, Tile, toast } from '../components/ui';
import { useI18n } from '../i18n';
import { useEmbassies } from '../hooks';
import { useOnline } from '../lib/pwa';
import { dialNumber, type Embassy } from '../lib/api';
import { paths } from '../router';

type Filter = 'all' | 'embassy' | 'consulate';

function useList() {
  const emb = useEmbassies();
  const online = useOnline();
  return { ...emb, online };
}

function OfflineBanner({ savedAt, onRefresh }: { savedAt: number | null; onRefresh: () => void }) {
  const { t, date } = useI18n();
  const online = useOnline();
  if (online || !savedAt) return null;
  return (
    <div class="banner" style={{ background: 'var(--gold-t)', border: '1px solid #E7D3A6' }}>
      <Icon name="offline" size={18} color="var(--gold-d)" />
      <span style={{ flex: 1 }}>{t('emb.offlineSaved', { date: date(new Date(savedAt), true) })}</span>
      <button type="button" class="icon-btn" aria-label={t('common.refresh')} onClick={onRefresh} style={{ width: '32px', height: '32px', minWidth: '32px' }}><Icon name="refresh" size={16} color="var(--gold-d)" /></button>
    </div>
  );
}

function ListPane({ list, selected, compact }: { list: ReturnType<typeof useList>; selected?: number; compact?: boolean }) {
  const { t, ext } = useI18n();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const items = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (list.data ?? []).filter((e) => (filter === 'all' || e.kind === filter) && (!s || (e.name + ' ' + e.address).toLowerCase().includes(s)));
  }, [list.data, q, filter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <OfflineBanner savedAt={list.savedAt} onRefresh={list.reload} />
      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 14px', height: '46px', borderRadius: '14px', background: 'var(--card)', border: '1px solid var(--line)' }}>
        <Icon name="search" size={18} color="var(--muted)" />
        <input type="search" value={q} onInput={(e) => setQ((e.target as HTMLInputElement).value)} placeholder={t('emb.search')} aria-label={t('emb.search')}
          style={{ flex: 1, border: 0, outline: 'none', background: 'transparent', fontSize: '15px', color: 'var(--navy)' }} />
      </label>
      <div class="chips" role="group">
        {(['all', 'embassy', 'consulate'] as Filter[]).map((f) => (
          <button type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} class="btn" style={{ height: '36px', padding: '0 14px', borderRadius: '12px', fontSize: '13px',
            background: filter === f ? 'var(--navy)' : 'var(--card)', color: filter === f ? 'var(--ivory)' : 'var(--navy)', border: filter === f ? 0 : '1px solid var(--line)' }}>
            {t(f === 'all' ? 'emb.all' : f === 'embassy' ? 'emb.embassies' : 'emb.consulates')}
          </button>
        ))}
      </div>
      <div class="card card-pad-s" style={compact ? { maxHeight: '640px', overflowY: 'auto' } : undefined}>
        {list.loading && !list.data && <div class="spinner" />}
        {!list.loading && !list.data && <div class="empty">{t('emb.noData')}<br /><button type="button" class="btn light" style={{ marginTop: '12px' }} onClick={list.reload}>{t('common.retry')}</button></div>}
        {list.data && !items.length && <div class="empty">{t('emb.empty')}</div>}
        {items.map((e) => (
          <a class="row" href={paths.embassy(e.id)} aria-current={selected === e.id ? 'true' : undefined}
            style={selected === e.id ? { background: 'var(--blue-t)', borderRadius: '14px', padding: '12px', margin: '2px -8px' } : undefined}>
            <Tile icon="bank" tone={e.kind === 'embassy' ? 'blue' : 'green'} size="s" />
            <span class="row-main"><span class="row-title" style={{ display: 'block', fontSize: '14px' }}>{ext(e.name)}</span>
              <span class="row-sub" style={{ display: 'block' }}>{e.code ? `+${e.code} ${e.phones[0] ?? ''}` : ext(e.address)}</span></span>
            <Icon name="chev" size={18} color={selected === e.id ? 'var(--blue)' : 'var(--muted)'} />
          </a>
        ))}
      </div>
      <p class="note">{t('emb.source')}</p>
    </div>
  );
}

function Detail({ e }: { e: Embassy }) {
  const { t, ext } = useI18n();
  const map = e.lat != null ? `https://www.google.com/maps?q=${e.lat},${e.lon}` : `https://www.google.com/maps/search/${encodeURIComponent(e.address)}`;
  const share = () => {
    const text = `${e.name}\n${e.address}\n${e.phones.map((p) => dialNumber(e.code, p)).join(', ')}`;
    if (navigator.share) navigator.share({ title: e.name, text }).catch(() => {});
    else navigator.clipboard?.writeText(text).then(() => toast(t('common.copied')));
  };
  const info = (icon: string, label: string, value: string, right?: preact.ComponentChildren) => (
    <div class="row"><Tile icon={icon} tone="sand" size="s" />
      <span class="row-main"><span style={{ display: 'block', fontSize: '12px', color: 'var(--muted)' }}>{label}</span><span style={{ display: 'block', marginTop: '2px', fontSize: '15px', fontWeight: 700, color: 'var(--navy)' }}>{value}</span></span>
      {right}</div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div class="chips"><Chip tone={e.kind === 'embassy' ? 'blue' : 'green'} icon="bank">{t(e.kind === 'embassy' ? 'emb.embassy' : 'emb.consulate')}</Chip></div>
      <h2 style={{ fontFamily: 'var(--hf)', fontSize: '22px', fontWeight: 800, lineHeight: 1.25, color: 'var(--navy)' }}>{ext(e.name)}</h2>
      <a href={map} target="_blank" rel="noopener" class="btn soft" style={{ alignSelf: 'flex-start' }}><Icon name="map" size={17} />{t('emb.map')}</a>
      <div class="card card-pad-s">
        {e.head && info('user', e.position || t('emb.head'), ext(e.head))}
        {e.address && info('pin', t('emb.address'), ext(e.address))}
        {e.phones.map((p) => info('phone', t('emb.phone'), `+${e.code} ${p}`,
          <a class="icon-btn" href={`tel:${dialNumber(e.code, p)}`} aria-label={t('common.call')} style={{ background: 'var(--green)', borderColor: 'var(--green)', borderRadius: '21px', width: '42px', height: '42px' }}><Icon name="phone" size={17} color="var(--ivory)" /></a>))}
        {e.faxes.map((p) => info('doc', t('emb.fax'), `+${e.code} ${p}`))}
      </div>
      <div class="chips" style={{ gap: '10px' }}>
        {e.phones[0] && <a class="btn green" href={`tel:${dialNumber(e.code, e.phones[0])}`}><Icon name="phone" size={18} />{t('common.call')}</a>}
        <button type="button" class="btn light" onClick={share}><Icon name="share" size={18} color="var(--navy)" />{t('common.share')}</button>
      </div>
      <p class="note">{t('emb.source')}</p>
    </div>
  );
}

export function Embassies({ id }: { id?: number }) {
  const { t } = useI18n();
  const list = useList();
  const selected = id ?? 0;
  const item = list.data?.find((e) => e.id === selected) ?? null;
  const offline = !list.online && list.savedAt ? <Chip tone="gold" icon="offline">{t('status.offline')}</Chip> : <StatusChip />;

  // mobil: alohida sahifa (vakolatxona) yoki ro‘yxat
  if (id != null) {
    return (
      <>
        <div class="m-only">
          <PageHead title={t('emb.title')} back={paths.embassies} right={offline} />
          {item ? <Detail e={item} /> : list.loading ? <div class="spinner" /> : <div class="empty">{t('emb.noData')}</div>}
        </div>
        <div class="d-only"><DesktopView list={list} selected={selected} item={item} right={offline} /></div>
      </>
    );
  }
  return (
    <>
      <div class="m-only"><PageHead title={t('emb.title')} sub={t('emb.subtitle')} right={offline} /><ListPane list={list} /></div>
      <div class="d-only"><DesktopView list={list} selected={selected} item={item} right={offline} /></div>
    </>
  );
}

function DesktopView({ list, selected, item, right }: { list: ReturnType<typeof useList>; selected: number; item: Embassy | null; right: preact.ComponentChildren }) {
  const { t } = useI18n();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PageHead title={t('emb.title')} sub={t('emb.subtitle')} right={right} />
      <div class="wrap" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 340px', maxWidth: '440px' }}><ListPane list={list} selected={selected} compact /></div>
        <div class="card" style={{ flex: '2 1 460px', padding: '22px 24px' }}>{item ? <Detail e={item} /> : <div class="spinner" />}</div>
      </div>
    </div>
  );
}
