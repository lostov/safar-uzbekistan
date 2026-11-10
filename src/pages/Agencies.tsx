import { useMemo, useState } from 'preact/hooks';
import { Icon } from '../components/Icon';
import { Chip, LinkRow, PageHead, QrSheet, SearchInput, SelectInput, Tile } from '../components/ui';
import { useI18n } from '../i18n';
import { useDataFile } from '../hooks';
import type { AgenciesFile, Agency } from '../lib/data';

/** kichik harf + oʻ/gʻ va tutuq belgisining barcha variantlari bitta belgiga */
const norm = (s: string) => s.toLowerCase().replace(/[ʻʼ‘’'`´]/g, "'").replace(/[«»“”"]/g, '');
const fmtPhone = (tel: string) => tel.replace(/^\+998(\d{2})(\d{3})(\d{2})(\d{2})$/, '+998 $1 $2-$3-$4');

function Item({ a, open, onToggle }: { a: Agency; open: boolean; onToggle: () => void }) {
  const { t, loc, region, date } = useI18n();
  return (
    <div style={{ borderTop: '1px solid var(--line)' }}>
      <button type="button" class="row" aria-expanded={open} onClick={onToggle}>
        <Tile icon="brief" tone="blue" size="s" />
        <span class="row-main">
          <span class="row-title" style={{ display: 'block', fontSize: '14px' }}>{loc(a.name)}</span>
          <span class="row-sub" style={{ display: 'block' }}>{[region(a.region), t('ag.licenseShort', { no: a.license })].filter(Boolean).join(' · ')}</span>
        </span>
        <span style={{ display: 'flex', transform: `rotate(${open ? 90 : 0}deg)` }}><Icon name="chev" size={18} color="var(--muted)" /></span>
      </button>
      {open && (
        <dl class="kv">
          <dt>{t('ag.license')}</dt><dd>№ {a.license}{a.date ? ` · ${date(new Date(a.date + 'T12:00:00'))}` : ''}</dd>
          <dt>{t('emb.head')}</dt><dd>{loc(a.head)}</dd>
          <dt>{t('emb.address')}</dt><dd>{loc(a.address)}</dd>
          {a.phones.length > 0 && <><dt>{t('emb.phone')}</dt><dd>{a.phones.map((p, i) => <>{i > 0 && ', '}<a href={`tel:${p}`}>{fmtPhone(p)}</a></>)}</dd></>}
          {a.emails.length > 0 && <><dt>{t('ag.email')}</dt><dd>{a.emails.map((e, i) => <>{i > 0 && ', '}<a href={`mailto:${e}`}>{e}</a></>)}</dd></>}
        </dl>
      )}
    </div>
  );
}

export function Agencies() {
  const { t, lang, loc, region, date } = useI18n();
  const file = useDataFile<AgenciesFile>('agencies.json');
  const [q, setQ] = useState('');
  const [reg, setReg] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [qr, setQr] = useState<{ url: string; label: string } | null>(null);

  const items = file.data?.items ?? [];
  const regions = useMemo(() => [...new Set(items.map((a) => a.region).filter(Boolean) as string[])]
    .sort((x, y) => region(x).localeCompare(region(y))), [items, lang]);
  // qidiruv matni: barcha maydonlar (nom, manzil, rahbar, hudud, litsenziya, sana, telefon, email)
  const index = useMemo(() => new Map(items.map((a) => {
    const d = a.date ? new Date(a.date + 'T12:00:00') : null;
    const text = [loc(a.name), a.name['uz-latn'], loc(a.address), loc(a.head), a.region ? region(a.region) : '',
      a.license, a.date, d ? date(d) : '', d ? date(d, true) : '', ...a.phones, ...a.phones.map(fmtPhone), ...a.emails].join(' ');
    return [a.id, { text: norm(text), digits: text.replace(/\D/g, '') }];
  })), [items, lang]);
  const list = useMemo(() => {
    const words = norm(q).split(/\s+/).filter(Boolean);
    const digits = q.replace(/\D/g, '');
    const phoneLike = digits.length >= 4 && /^[\d\s()+-]+$/.test(q.trim());
    return items.filter((a) => {
      if (reg && a.region !== reg) return false;
      if (!words.length) return true;
      const ix = index.get(a.id)!;
      // telefon raqami bo‘shliq/defis bilan yozilsa ham topilsin
      if (phoneLike && ix.digits.includes(digits)) return true;
      return words.every((w) => ix.text.includes(w));
    });
  }, [items, index, q, reg]);

  const official = file.data?.source[lang === 'uz-yangi' ? 'uz-latn' : lang];

  return (
    <>
      <PageHead title={t('ag.title')} sub={t('ag.subtitle')} />

      <section class="card" style={{ background: 'var(--gold-t)', borderColor: '#E7D3A6', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <Icon name="alert" size={22} color="var(--gold-d)" />
        <p style={{ fontSize: '14px', lineHeight: 1.5, color: 'var(--navy)' }}>{t('ag.warning')}</p>
      </section>

      <div class="filters">
        <SearchInput value={q} onInput={setQ} placeholder={t('ag.search')} />
        <SelectInput value={reg} onChange={setReg} label={t('ag.region')} options={[['', t('ag.allRegions')], ...regions.map((r) => [r, region(r)] as [string, string])]} />
      </div>

      <section class="card card-pad-s">
        {!file.data && (file.error ? <div class="empty">{t('common.error')}</div> : <div class="spinner" />)}
        {file.data && (
          <p style={{ padding: '10px 0', display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center' }}>
            <b class="h2" style={{ fontSize: '15px' }}>{t('ag.count', { n: list.length })}</b>
            <Chip tone="green" icon="check">{t('ag.licensed')}</Chip>
          </p>
        )}
        {file.data && !list.length && <div class="empty">{t('emb.empty')}</div>}
        {list.map((a) => <Item a={a} open={open === a.id} onToggle={() => setOpen(open === a.id ? null : a.id)} />)}
      </section>

      {file.data && (
        <section class="card" style={{ padding: '14px 16px 4px' }}>
          <p class="note" style={{ paddingBottom: '6px' }}><Icon name="info" size={14} color="var(--muted)" />{t('ag.source', { date: date(new Date(file.data.fetched + 'T12:00:00'), true) })}</p>
          <div class="rows" style={{ borderTop: '1px solid var(--line)' }}>
            {official && <LinkRow label={t('ag.official')} url={official} icon="bank" tone="blue" onQr={(url, label) => setQr({ url, label })} />}
          </div>
        </section>
      )}
      {qr && <QrSheet url={qr.url} label={qr.label} onClose={() => setQr(null)} />}
    </>
  );
}
