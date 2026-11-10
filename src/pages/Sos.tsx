import { useState } from 'preact/hooks';
import { Icon } from '../components/Icon';
import { Chip, PageHead, Tile } from '../components/ui';
import { useI18n } from '../i18n';
import { useResources, usePosition } from '../hooks';
import { cachedEmbassies, dialNumber, nearestEmbassy } from '../lib/api';
import type { Emergency } from '../lib/data';
import { paths } from '../router';

const GUIDES = ['doc', 'salary', 'detained', 'medical'] as const;

export function Sos() {
  const { t, country, lang, ext } = useI18n();
  const res = useResources();
  const { pos, request } = usePosition(true);
  const [openGuide, setOpenGuide] = useState<string | null>(null);

  const code = pos?.country;
  const raw = (code && res.emergency[code]) || res.emergency.default;
  const em: Emergency = typeof raw === 'string' ? { main: raw } : raw;
  // xizmatlar bo‘yicha alohida raqamlar (asosiy raqamdan farq qilsa ko‘rsatiladi)
  const services = ([['police', 'shield'], ['ambulance', 'heart'], ['fire', 'alert']] as const)
    .map(([k, icon]) => ({ k, icon, num: em[k] }))
    .filter((s) => !!s.num);
  // hammasi asosiy raqamga teng bo‘lsa — alohida bloklar kerak emas
  if (services.every((s) => s.num === em.main)) services.length = 0;
  // eng yaqin vakolatxona: tanlangan tildagi, bo‘lmasa istalgan tildagi kesh
  const list = cachedEmbassies(lang)?.data ?? [];
  const near = pos ? nearestEmbassy(list, pos) : null;

  const shareLocation = () => {
    if (!pos) { request(); return; }
    const url = `https://maps.google.com/?q=${pos.lat.toFixed(5)},${pos.lon.toFixed(5)}`;
    const text = t('sos.shareMessage', { url });
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else location.href = `sms:?&body=${encodeURIComponent(text)}`;
  };

  return (
    <>
      <PageHead title={t('sos.title')} sub={t('sos.subtitle')} back={false} right={code ? <Chip tone="navy" icon="pin">{country(code)}</Chip> : undefined} />
      <div class="wrap">
        <a href={`tel:${em.main}`} style={{ display: 'flex', alignItems: 'center', gap: '18px', padding: '22px', borderRadius: '24px', background: 'var(--red)', textDecoration: 'none', boxShadow: '0 12px 26px rgba(179,42,38,.28)' }}>
          <span style={{ width: '70px', height: '70px', minWidth: '70px', borderRadius: '35px', background: 'rgba(250,246,238,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="phone" size={32} color="var(--ivory)" /></span>
          <span>
            <b style={{ display: 'block', fontFamily: 'var(--hf)', fontSize: '44px', lineHeight: 1, color: 'var(--ivory)' }}>{em.main}</b>
            <small style={{ display: 'block', marginTop: '6px', fontSize: '14px', color: '#F8DCD8' }}>{code ? t('sos.emergency', { country: country(code) }) : t('sos.emergencyDefault')}</small>
            {em.other && <small style={{ display: 'block', marginTop: '2px', fontSize: '13px', color: '#F8DCD8' }}>{t('sos.alsoNumbers', { list: em.other.join(', ') })}</small>}
          </span>
        </a>
        {services.length > 0 && (
          <div class="sos-services">
            {services.map((s) => (
              <a class="card" href={`tel:${s.num}`}>
                <Icon name={s.icon} size={20} color="var(--red)" />
                <b>{s.num}</b><small>{t(`sos.${s.k}`)}</small>
              </a>
            ))}
          </div>
        )}
        <section class="card">
          <p style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--muted)' }}>{t('sos.nearest')}</p>
          {near ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}><Tile icon="bank" tone="blue" />
                <div><p class="row-title">{ext(near.item.name)}</p><p class="row-sub">{t('sos.nearestAuto', { km: Math.round(near.km) })}</p></div></div>
              <div class="chips" style={{ gap: '8px', marginTop: '12px' }}>
                {near.item.phones[0] && <a class="btn green" href={`tel:${dialNumber(near.item.code, near.item.phones[0])}`}><Icon name="phone" size={17} />{t('common.call')}</a>}
                <a class="btn soft" href={paths.embassy(near.item.id)}><Icon name="info" size={17} />{t('common.details')}</a>
              </div>
            </>
          ) : (
            <div style={{ marginTop: '10px' }}><p class="row-sub">{t('sos.nearestUnknown')}</p>
              <a class="btn soft" style={{ marginTop: '10px' }} href={paths.embassies}><Icon name="bank" size={17} />{t('nav.embassies')}</a></div>
          )}
        </section>
      </div>

      <button type="button" onClick={shareLocation} class="row" style={{ padding: '14px 16px', borderRadius: '20px', background: 'var(--navy)', border: 0 }}>
        <Icon name="send" size={22} color="var(--gold-l)" />
        <span class="row-main"><span style={{ display: 'block', fontSize: '15px', fontWeight: 800, color: 'var(--ivory)' }}>{t('sos.shareTitle')}</span>
          <span style={{ display: 'block', marginTop: '2px', fontSize: '13px', color: '#C9D6E3' }}>{t('sos.shareText')}</span></span>
        <Icon name="chev" size={18} color="var(--ivory)" />
      </button>

      <h2 class="h2">{t('sos.guides')}</h2>
      <div class="wrap" style={{ gap: '10px' }}>
        {GUIDES.map((g) => (
          <button type="button" class="card" aria-expanded={openGuide === g} onClick={() => setOpenGuide(openGuide === g ? null : g)}
            style={{ flex: '1 1 300px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px', padding: '14px 16px' }}>
            <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '15px', fontWeight: 800, color: 'var(--navy)' }}>{t(`sos.g.${g}`)}
              <span style={{ display: 'flex', transform: `rotate(${openGuide === g ? 90 : 0}deg)` }}><Icon name="chev" size={16} color="var(--muted)" /></span></span>
            {openGuide === g && <span style={{ fontSize: '14px', lineHeight: 1.5, color: 'var(--ink)' }}>{t(`sos.g.${g}Text`)}</span>}
          </button>
        ))}
      </div>
    </>
  );
}
