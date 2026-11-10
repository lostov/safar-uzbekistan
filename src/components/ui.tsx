import type { ComponentChildren } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { Icon } from './Icon';
import { useI18n, type Lang } from '../i18n';
import { useInstall, useOnline } from '../lib/pwa';
import { paths } from '../router';

export type Tone = 'blue' | 'green' | 'red' | 'gold' | 'navy' | 'sand';
const TONE: Record<Tone, string> = { blue: 'var(--blue)', green: 'var(--green)', red: 'var(--red)', gold: 'var(--gold)', navy: 'var(--navy)', sand: 'var(--navy)' };
const TONE_BG: Record<Tone, string> = { blue: 'var(--blue-t)', green: 'var(--green-t)', red: 'var(--red-t)', gold: 'var(--gold-t)', navy: '#DCE8F2', sand: 'var(--sand)' };

// ---------- toast ----------
export function toast(text: string) { window.dispatchEvent(new CustomEvent('su-toast', { detail: text })); }
export function Toaster() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    let timer: number | undefined;
    const on = (e: Event) => { setMsg((e as CustomEvent).detail); clearTimeout(timer); timer = window.setTimeout(() => setMsg(null), 2200); };
    window.addEventListener('su-toast', on);
    return () => window.removeEventListener('su-toast', on);
  }, []);
  return msg ? <div class="toast" role="status">{msg}</div> : null;
}

// ---------- kichik bloklar ----------
export function Chip({ tone, icon, children }: { tone: Tone; icon?: string; children: ComponentChildren }) {
  return <span class={`chip t-${tone}`}>{icon && <Icon name={icon} size={14} sw={2.4} />}{children}</span>;
}

export function StatusChip() {
  const online = useOnline();
  const { t } = useI18n();
  return online ? <Chip tone="green" icon="wifi">{t('status.online')}</Chip> : <Chip tone="gold" icon="offline">{t('status.offline')}</Chip>;
}

export function Tile({ icon, tone, size = '' }: { icon: string; tone: Tone; size?: '' | 's' | 'l' }) {
  const px = size === 's' ? 20 : size === 'l' ? 26 : 22;
  return <span class={`tile ${size}`} style={{ background: TONE_BG[tone] }}><Icon name={icon} size={px} color={TONE[tone]} /></span>;
}

export function Card({ children, class: cls = '', style }: { children: ComponentChildren; class?: string; style?: Record<string, string | number> }) {
  return <div class={`card ${cls}`} style={style}>{children}</div>;
}

// ---------- sarlavhalar ----------
/** Mobilda: orqaga tugmasi + holat; desktopda: katta sarlavha */
export function PageHead({ title, sub, back = paths.home, right }: { title: string; sub?: string; back?: string | false; right?: ComponentChildren }) {
  const { t } = useI18n();
  return (
    <header class="sub-head page-head">
      <div class="sub-head-row m-only">
        {back ? <a class="back" href={back} aria-label={t('common.back')}><Icon name="back" size={20} color="var(--navy)" /></a> : <span />}
        {right ?? <StatusChip />}
      </div>
      <div>
        <h1 class="page-title">{title}</h1>
        {sub && <p class="page-sub">{sub}</p>}
      </div>
      <div class="d-only">{right ?? <StatusChip />}</div>
    </header>
  );
}

// ---------- qidiruv va tanlash maydonlari ----------
export function SearchInput({ value, onInput, placeholder }: { value: string; onInput: (v: string) => void; placeholder: string }) {
  return (
    <label class="field">
      <Icon name="search" size={18} color="var(--muted)" />
      <input type="search" value={value} onInput={(e) => onInput((e.target as HTMLInputElement).value)} placeholder={placeholder} aria-label={placeholder} />
    </label>
  );
}

export function SelectInput({ value, onChange, label, options }: { value: string; onChange: (v: string) => void; label: string; options: [string, string][] }) {
  return (
    <label class="field">
      <Icon name="pin" size={18} color="var(--muted)" />
      <select value={value} onChange={(e) => onChange((e.target as HTMLSelectElement).value)} aria-label={label}>
        {options.map(([v, text]) => <option value={v}>{text}</option>)}
      </select>
    </label>
  );
}

/** Filtr tugmalari (Barchasi / Elchixonalar ...) */
export function Segments<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: [T, string][] }) {
  return (
    <div class="chips" role="group">
      {items.map(([v, label]) => <button type="button" class="seg" aria-pressed={value === v} onClick={() => onChange(v)}>{label}</button>)}
    </div>
  );
}

// ---------- havola qatori: nusxa, QR, ikki marta bosib ochish ----------
export function LinkRow({ label, url, icon, img, tone = 'green', onQr }: { label: string; url: string; icon?: string; img?: string; tone?: Tone; onQr: (url: string, label: string) => void }) {
  const { t } = useI18n();
  const [armed, setArmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const pretty = url.replace(/^https?:\/\//, '').replace(/%20/g, ' ');

  const open = () => {
    if (armed) { window.open(url, '_blank', 'noopener'); setArmed(false); return; }
    setArmed(true); toast(t('common.tapAgain'));
    clearTimeout(timer.current); timer.current = window.setTimeout(() => setArmed(false), 2500);
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); toast(t('common.copied')); setTimeout(() => setCopied(false), 1800); } catch { /* */ }
  };
  return (
    <div class="row">
      {img ? <span class="tile s" style={{ background: 'var(--sand)' }}><img src={img} width={20} height={20} alt="" /></span>
        : icon && <Tile icon={icon} tone={tone} size="s" />}
      <div class="row-main">
        <p class="row-title" style={{ fontWeight: 700, fontSize: '14px' }}>{label}</p>
        <button type="button" onClick={open} onDblClick={() => window.open(url, '_blank', 'noopener')}
          style={{ background: 'none', border: 0, padding: 0, marginTop: '2px', color: armed ? 'var(--blue)' : 'var(--green)', fontWeight: 700, fontSize: '13px', textAlign: 'left', overflowWrap: 'anywhere' }}>
          {pretty}
        </button>
      </div>
      <button type="button" class={`icon-btn ${copied ? 'ok' : ''}`} aria-label={t('common.copy')} onClick={copy}><Icon name={copied ? 'check' : 'copy'} size={18} color={copied ? 'var(--green)' : 'var(--navy)'} /></button>
      <button type="button" class="icon-btn" aria-label={t('common.qr')} onClick={() => onQr(url, label)}><Icon name="qr" size={18} color="var(--navy)" /></button>
    </div>
  );
}

// ---------- modal oynalar ----------
export function Sheet({ onClose, label, children }: { onClose: () => void; label: string; children: ComponentChildren }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div class="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div class="sheet" role="dialog" aria-modal="true" aria-label={label}><div class="grip" />{children}</div>
    </div>
  );
}

export function QrSheet({ url, label, onClose }: { url: string; label: string; onClose: () => void }) {
  const { t } = useI18n();
  const [src, setSrc] = useState('');
  useEffect(() => { import('qrcode').then((m) => m.toDataURL(url, { width: 440, margin: 1, color: { dark: '#16324F', light: '#FFFDF8' } })).then(setSrc); }, [url]);
  const share = () => navigator.share?.({ title: label, url }).catch(() => {});
  return (
    <Sheet onClose={onClose} label={t('common.qr')}>
      <p class="h2" style={{ textAlign: 'center' }}>{label}</p>
      {src ? <img src={src} alt={`${t('common.qr')}: ${url}`} width={220} height={220} style={{ borderRadius: '16px', border: '1px solid var(--line)' }} /> : <div class="spinner" />}
      <p style={{ fontSize: '14px', color: 'var(--muted)', textAlign: 'center', overflowWrap: 'anywhere' }}>{url.replace(/^https?:\/\//, '')} · {t('common.qrHint')}</p>
      <div class="grid2" style={{ width: '100%' }}>
        {'share' in navigator ? <button type="button" class="btn navy" onClick={share}><Icon name="share" size={17} />{t('common.share')}</button> : <span />}
        <button type="button" class="btn light" onClick={onClose}>{t('common.close')}</button>
      </div>
    </Sheet>
  );
}

export function LangSheet({ onClose }: { onClose: () => void }) {
  const { t, lang } = useI18n();
  return (
    <Sheet onClose={onClose} label={t('more.language')}>
      <p class="h2">{t('more.language')}</p>
      <LangList onPick={onClose} />
      <p style={{ fontSize: '12px', color: 'var(--muted)', textAlign: 'center' }}>{lang === 'uz-yangi' ? t('more.yangiNote') : t('more.languageNote')}</p>
    </Sheet>
  );
}

export function LangList({ onPick }: { onPick?: () => void }) {
  const { lang, setLang, languages } = useI18n();
  return (
    <div class="lang-list">
      {(Object.keys(languages) as Lang[]).map((code) => (
        <button type="button" class="lang-opt" aria-pressed={code === lang} lang={languages[code].htmlLang}
          onClick={() => { setLang(code); onPick?.(); }}>
          <span>{languages[code].label}</span><small>{languages[code].short}</small>
        </button>
      ))}
    </div>
  );
}

export function LangButton() {
  const { t, lang, languages } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <>
      <span class="lang-wrap">
        <button type="button" class="lang-btn" aria-label={`${t('more.language')}: ${languages[lang].label}`} onClick={() => setOpen(true)}>{languages[lang].short}</button>
      </span>
      {open && <LangSheet onClose={() => setOpen(false)} />}
    </>
  );
}

// ---------- o‘rnatish ----------
function IosSheet({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  return (
    <Sheet onClose={onClose} label={t('install.iosTitle')}>
      <p class="h2">{t('install.iosTitle')}</p>
      <div style={{ width: '100%' }} class="rows">
        <div class="row"><Tile icon="share" tone="blue" size="s" /><p style={{ fontSize: '15px', color: 'var(--navy)' }}>1. {t('install.iosStep1')}</p></div>
        <div class="row"><Tile icon="download" tone="green" size="s" /><p style={{ fontSize: '15px', color: 'var(--navy)' }}>2. {t('install.iosStep2')}</p></div>
      </div>
      <button type="button" class="btn light block" onClick={onClose}>{t('common.close')}</button>
    </Sheet>
  );
}

export function useInstallAction() {
  const inst = useInstall();
  const [ios, setIos] = useState(false);
  const run = () => (inst.canPrompt ? inst.prompt() : inst.ios ? setIos(true) : undefined);
  const sheet = ios ? <IosSheet onClose={() => setIos(false)} /> : null;
  return { ...inst, run, sheet };
}

export function InstallBanner() {
  const { t } = useI18n();
  const inst = useInstallAction();
  if (!inst.available) return null;
  return (
    <div class="install">
      <span class="tile" style={{ background: 'var(--navy)' }}><Icon name="download" color="var(--gold-l)" /></span>
      <div class="row-main"><b>{t('install.title')}</b><small>{t('install.text')}</small></div>
      <button type="button" class="btn navy" style={{ height: '40px' }} onClick={inst.run}>{t('install.button')}</button>
      {inst.sheet}
    </div>
  );
}

export function InstallTopButton() {
  const { t } = useI18n();
  const inst = useInstallAction();
  if (!inst.available) return null;
  return (<><button type="button" class="install-top" onClick={inst.run}><Icon name="download" size={18} color="var(--gold-l)" />{t('more.install')}</button>{inst.sheet}</>);
}
