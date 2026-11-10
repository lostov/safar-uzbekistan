import { useState } from 'preact/hooks';
import { Icon } from '../components/Icon';
import { PageHead } from '../components/ui';
import { useI18n } from '../i18n';
import { nextPrayer, usePosition, usePrayer, useResources } from '../hooks';
import { LocationGate } from './Weather';
import { lastPos } from '../lib/geo';

const KEYS = ['prayer.fajr', 'prayer.sunrise', 'prayer.dhuhr', 'prayer.asr', 'prayer.maghrib', 'prayer.isha'];
const ICONS = ['moon', 'sunrise', 'sun', 'sun', 'sunset', 'moon'];

export function Prayer() {
  const { t, list, date, ext } = useI18n();
  const res = useResources();
  const { pos, error, request } = usePosition(true);
  const pr = usePrayer(pos);
  const today = new Date();
  const todayKey = (d: { day: number; month: number; year: number }) => d.day === today.getDate() && d.month === today.getMonth() + 1 && d.year === today.getFullYear();
  const idx = pr.data?.findIndex(todayKey) ?? -1;
  const days = pr.data && idx >= 0 ? pr.data.slice(Math.max(0, idx - 1), idx + 5) : [];
  const [sel, setSel] = useState<number | null>(null);
  const current = days.find((d, i) => (sel == null ? todayKey(d) : i === sel)) ?? days[0];
  const next = pr.data ? nextPrayer(pr.data) : null;
  const weekdays = list('@weekdays'), hijri = list('@hijri'), monthsNom = list('@monthsNom');
  const label = (d: { day: number; month: number; year: number }, i: number) => {
    if (todayKey(d)) return t('prayer.today');
    if (i === 0 && idx > 0) return t('prayer.yesterday');
    return `${d.day}/${d.month}`;
  };
  const until = (at: Date) => {
    const mins = Math.max(0, Math.round((at.getTime() - Date.now()) / 60000));
    return mins >= 60 ? t('prayer.inHM', { h: Math.floor(mins / 60), m: mins % 60 }) : t('prayer.inM', { m: mins });
  };
  const city = lastPos()?.city;

  return (
    <>
      <PageHead title={t('prayer.title')} sub={`${city ? ext(city) + ' · ' : ''}${t('prayer.method')}`} back={false} />
      {!pos && <LocationGate text={t('prayer.permission')} onAsk={request} error={error} />}
      {pos && pr.loading && !pr.data && <div class="spinner" />}
      {pos && !pr.data && pr.error && <div class="empty">{t('common.error')}<br /><button type="button" class="btn light" style={{ marginTop: '12px' }} onClick={pr.reload}>{t('common.retry')}</button></div>}
      {current && (
        <>
          <div class="chips" role="tablist" style={{ gap: '6px', flexWrap: 'nowrap', overflowX: 'auto' }}>
            {days.map((d, i) => {
              const on = d === current;
              return <button type="button" role="tab" aria-selected={on} onClick={() => setSel(i)} class="btn"
                style={{ height: '38px', minWidth: '62px', padding: '0 10px', borderRadius: '12px', fontSize: '13px', background: on ? 'var(--navy)' : 'var(--card)', color: on ? 'var(--ivory)' : 'var(--navy)', border: on ? 0 : '1px solid var(--line)' }}>{label(d, i)}</button>;
            })}
          </div>
          <div class="wrap" style={{ alignItems: 'stretch' }}>
            <section class="navy-card" style={{ flex: '2 1 380px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gold-l)' }}>
                {weekdays[new Date(current.year, current.month - 1, current.day).getDay()]}, {date(new Date(current.year, current.month - 1, current.day))} · {current.hijri.day} {hijri[current.hijri.month - 1]} {current.hijri.year}
              </p>
              {next && <>
                <p style={{ marginTop: '8px', fontSize: '14px', color: '#C9D6E3' }}>{t('prayer.next')}</p>
                <p style={{ marginTop: '2px', fontFamily: 'var(--hf)', fontSize: '32px', fontWeight: 800 }}>{t(KEYS[next.index])} · {next.day.times[next.index]}</p>
                <p style={{ marginTop: '4px', fontSize: '14px' }}>{until(next.at)}</p>
              </>}
            </section>
            <a class="card" href={res.qibla} target="_blank" rel="noopener" style={{ flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
              <Icon name="compass" size={30} color="var(--green)" /><span class="row-title">{t('prayer.qibla')}</span>
            </a>
          </div>
          <section class="card" style={{ padding: '8px' }}>
            {current.times.map((tm, i) => {
              const isNext = next && next.day === current && next.index === i;
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '14px', background: isNext ? 'var(--green-t)' : undefined, borderTop: i && !isNext && !(next && next.day === current && next.index === i - 1) ? '1px solid var(--line)' : undefined }}>
                  <Icon name={ICONS[i]} size={20} color={isNext ? 'var(--green)' : 'var(--muted)'} />
                  <span style={{ flex: 1, fontSize: '16px', fontWeight: isNext ? 800 : 700, color: 'var(--navy)' }}>{t(KEYS[i])}</span>
                  <span style={{ fontFamily: 'var(--hf)', fontSize: '17px', fontWeight: 800, color: isNext ? 'var(--green)' : 'var(--navy)' }}>{tm}</span>
                </div>
              );
            })}
          </section>
          {/* desktop: haftalik jadval */}
          <div class="card d-only" style={{ overflowX: 'auto', padding: '8px 10px' }}>
            <table class="ptable">
              <thead><tr><th scope="col" style={{ textAlign: 'left' }}>{t('prayer.day')}</th>{KEYS.map((k) => <th scope="col">{t(k)}</th>)}</tr></thead>
              <tbody>{days.map((d, i) => (
                <tr class={todayKey(d) ? 'today' : ''}><th scope="row">{label(d, i)} · {date(new Date(d.year, d.month - 1, d.day), true)}</th>{d.times.map((tm) => <td>{tm}</td>)}</tr>
              ))}</tbody>
            </table>
          </div>
          <p class="note"><Icon name="check" size={14} sw={2.6} color="var(--green)" />{(() => { const s = t('prayer.cached', { month: monthsNom[today.getMonth()] }); return s.charAt(0).toUpperCase() + s.slice(1); })()}</p>
        </>
      )}
    </>
  );
}
