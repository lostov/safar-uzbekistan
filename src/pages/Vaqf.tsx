import { useEffect, useState } from 'preact/hooks';
import { Icon } from '../components/Icon';
import { PageHead, toast } from '../components/ui';
import { useI18n } from '../i18n';
import { useResources } from '../hooks';
import { BASE } from '../lib/config';

export function Vaqf() {
  const { t } = useI18n();
  const url = useResources().vaqf.url;
  const [qr, setQr] = useState('');
  useEffect(() => { import('qrcode').then((m) => m.toDataURL(url, { width: 360, margin: 1, color: { dark: '#16324F', light: '#FFFDF8' } })).then(setQr); }, [url]);

  return (
    <>
      <PageHead title={t('vaqf.title')} sub={t('vaqf.subtitle')} />
      <section style={{ position: 'relative', minHeight: '190px', borderRadius: '22px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(rgba(22,50,79,.62), rgba(22,50,79,.62)), url('${BASE}img/vaqf_bg.jpg') center / cover` }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '22px' }}>
          <img src={`${BASE}img/vaqf.png`} alt={t('vaqf.title')} width={240} height={117} style={{ objectFit: 'contain' }} />
          <p style={{ fontFamily: 'var(--hf)', fontSize: '15px', fontWeight: 800, letterSpacing: '2px', textAlign: 'center', textTransform: 'uppercase', color: 'var(--ivory)' }}>{t('vaqf.slogan')}</p>
        </div>
      </section>
      <div class="wrap">
        <section class="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', alignItems: 'center', flex: '2 1 420px' }}>
          {qr ? <img src={qr} alt={`${t('common.qr')}: ${url}`} width={150} height={150} style={{ borderRadius: '14px', border: '1px solid var(--line)' }} /> : <div class="spinner" />}
          <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h2 class="h2">{t('vaqf.qrTitle')}</h2>
            <p style={{ fontSize: '14px', lineHeight: 1.45 }}>{t('vaqf.qrText')}</p>
            <p style={{ fontSize: '13px', fontWeight: 800, color: 'var(--blue)' }}>{url.replace(/^https?:\/\//, '')}</p>
            <div class="chips" style={{ gap: '10px' }}>
              <a class="btn gold" href={url} target="_blank" rel="noopener"><Icon name="ext" size={18} />{t('vaqf.open')}</a>
              <button type="button" class="btn light" onClick={() => navigator.clipboard?.writeText(url).then(() => toast(t('common.copied')))}><Icon name="copy" size={16} color="var(--navy)" />{t('common.copy')}</button>
            </div>
          </div>
        </section>
        <section class="card" style={{ background: 'var(--sand)', display: 'flex', gap: '12px', alignItems: 'flex-start', flex: '1 1 260px' }}>
          <Icon name="shield" size={22} color="var(--navy)" />
          <div><p style={{ fontSize: '15px', fontWeight: 800, color: 'var(--navy)' }}>{t('vaqf.safeTitle')}</p><p style={{ marginTop: '4px', fontSize: '14px', lineHeight: 1.5 }}>{t('vaqf.safeText')}</p></div>
        </section>
      </div>
    </>
  );
}
