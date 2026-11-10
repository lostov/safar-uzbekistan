import { Icon } from '../components/Icon';
import { PageHead } from '../components/ui';
import { useI18n } from '../i18n';
import { usePosition, useWeather } from '../hooks';
import { condition, dailySlots, type Cond, type WeatherItem } from '../lib/api';

const ICON: Record<Cond, [string, string]> = {
  clear: ['sun', 'var(--gold)'], partly: ['cloud', 'var(--gold)'], cloudy: ['cloud2', '#7A8699'], rain: ['rain', 'var(--blue)'],
  thunder: ['rain', 'var(--navy)'], snow: ['cloud2', 'var(--blue)'], mist: ['cloud2', '#9AA5B4'],
};
const isNight = (icon: string) => icon.endsWith('n');

export function LocationGate({ text, onAsk, error }: { text: string; onAsk: () => void; error: string | null }) {
  const { t } = useI18n();
  return (
    <section class="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: '28px 20px', textAlign: 'center' }}>
      <Icon name="pin" size={40} color="var(--blue)" />
      <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy)' }}>{text}</p>
      {error === 'denied' && <p style={{ fontSize: '13px', color: 'var(--red)' }}>{t('common.locationDenied')}</p>}
      <button type="button" class="btn navy" onClick={onAsk}><Icon name="pin" size={18} />{t('common.locationButton')}</button>
    </section>
  );
}

function Slot({ it, label, dark }: { it: WeatherItem; label: string; dark?: boolean }) {
  const { t } = useI18n();
  const c = condition(it.icon);
  const [ico, col] = isNight(it.icon) && (c === 'clear' || c === 'partly') ? ['moon', '#7A8699'] : ICON[c];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }} title={t(`weather.c.${c}`)}>
      <span style={{ fontSize: '11px', fontWeight: 700, color: dark ? '#C9D6E3' : 'var(--muted)' }}>{label}</span>
      <Icon name={ico} size={26} color={dark && col === '#7A8699' ? '#9FB4C8' : col} label={t(`weather.c.${c}`)} />
      <span style={{ fontFamily: 'var(--hf)', fontSize: '16px', fontWeight: 800, color: dark ? 'var(--ivory)' : 'var(--navy)' }}>{it.temp}°</span>
    </div>
  );
}

export function Weather() {
  const { t, list, date, ext, country } = useI18n();
  const { pos, error, request } = usePosition(true);
  const wx = useWeather(pos);
  const w = wx.data;
  const fmtTime = (unix: number, tz: number) => new Date((unix + tz) * 1000).toISOString().slice(11, 16);
  const days = w ? dailySlots(w) : [];
  const now = w?.items.find((i) => i.dt * 1000 > Date.now() - 3 * 3600e3) ?? w?.items[0];
  const weekdays = list('@weekdays');
  const labels = [t('weather.morning'), t('weather.noon'), t('weather.evening')];

  return (
    <>
      <PageHead title={t('weather.title')} sub={t('weather.subtitle')} back={false} />
      {!pos && <LocationGate text={t('weather.permission')} onAsk={request} error={error} />}
      {pos && wx.loading && !w && <div class="spinner" />}
      {pos && !w && wx.error && <div class="empty">{wx.error === 'no-key' ? t('weather.noKey') : t('common.error')}<br /><button type="button" class="btn light" style={{ marginTop: '12px' }} onClick={wx.reload}>{t('common.retry')}</button></div>}
      {w && now && (
        <>
          <section class="navy-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 700, color: 'var(--gold-l)' }}><Icon name="pin" size={15} color="var(--gold-l)" />{ext(w.city)}{w.country ? `, ${country(w.country)}` : ''}</p>
              <p style={{ marginTop: '6px', fontFamily: 'var(--hf)', fontSize: '52px', fontWeight: 800, lineHeight: 1 }}>{now.temp}°</p>
              <p style={{ marginTop: '6px', fontSize: '14px', color: '#C9D6E3' }}>{t(`weather.c.${condition(now.icon)}`)}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Icon name="sunrise" size={18} color="var(--gold-l)" />{t('weather.sunrise')} <b>{fmtTime(w.sunrise, w.tz)}</b></span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Icon name="sunset" size={18} color="var(--gold-l)" />{t('weather.sunset')} <b>{fmtTime(w.sunset, w.tz)}</b></span>
            </div>
          </section>
          <div class="wrap" style={{ gap: '12px' }}>
            {days.map((d, i) => (
              <section class={i === 0 ? 'navy-card' : 'card'} style={{ flex: '1 1 160px', display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
                <div><p style={{ fontSize: '15px', fontWeight: 800, color: i === 0 ? 'var(--ivory)' : 'var(--navy)' }}>{i === 0 ? t('weather.today') : weekdays[d.date.getDay()]}</p>
                  <p style={{ fontSize: '12px', color: i === 0 ? '#C9D6E3' : 'var(--muted)' }}>{date(d.date, true)}</p></div>
                <div style={{ display: 'flex', gap: '4px' }}>{d.slots.map((s, k) => <Slot it={s} label={labels[k]} dark={i === 0} />)}</div>
              </section>
            ))}
          </div>
          <p class="note"><Icon name="refresh" size={14} color="var(--muted)" />{t('weather.updated', { time: wx.savedAt ? new Date(wx.savedAt).toTimeString().slice(0, 5) : '—' })}</p>
        </>
      )}
    </>
  );
}
