import { useEffect, useState } from 'preact/hooks';
import { I18nProvider } from './i18n';
import { ResCtx } from './hooks';
import { loadDataFile, WORK_FILES, type Resources } from './lib/data';
import { useRoute } from './router';
import { Shell } from './components/Shell';
import { Toaster } from './components/ui';
import { Home } from './pages/Home';
import { Sources } from './pages/Sources';
import { Banned } from './pages/Banned';
import { Embassies } from './pages/Embassies';
import { Vaqf } from './pages/Vaqf';
import { Weather } from './pages/Weather';
import { Prayer } from './pages/Prayer';
import { Sos } from './pages/Sos';
import { More } from './pages/More';
import { Agencies } from './pages/Agencies';
import { Visa } from './pages/Visa';
import { Courses } from './pages/Courses';
import { Xorijdaish } from './pages/Xorijdaish';
import { Guides } from './pages/Guides';

const Splash = () => <div class="spinner" style={{ marginTop: '40vh' }} aria-label="…" />;

function Pages() {
  const route = useRoute();
  let page;
  switch (route.name) {
    case 'sources': page = <Sources />; break;
    case 'banned': page = <Banned />; break;
    case 'embassies': page = <Embassies />; break;
    case 'embassy': page = <Embassies id={route.id} />; break;
    case 'vaqf': page = <Vaqf />; break;
    case 'weather': page = <Weather />; break;
    case 'prayer': page = <Prayer />; break;
    case 'sos': page = <Sos />; break;
    case 'more': page = <More />; break;
    case 'agencies': page = <Agencies />; break;
    case 'visa': page = <Visa />; break;
    case 'courses': page = <Courses />; break;
    case 'xorijdaish': page = <Xorijdaish />; break;
    case 'guides': page = <Guides id={route.id} group={route.group} />; break;
    default: page = <Home />;
  }
  return <Shell route={route}>{page}</Shell>;
}

export function App() {
  const [res, setRes] = useState<Resources | null>(null);
  useEffect(() => {
    loadDataFile<Resources>('resources.json').then(setRes).catch(() => {});
    // agentliklar, viza, kurslar — sahifa ochilmasa ham oflayn uchun oldindan saqlanadi
    const prefetch = () => WORK_FILES.forEach((f) => loadDataFile(f).catch(() => {}));
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(prefetch); else setTimeout(prefetch, 3000);
  }, []);
  return (
    <I18nProvider fallback={<Splash />}>
      {res ? <ResCtx.Provider value={res}><Pages /></ResCtx.Provider> : <Splash />}
      <Toaster />
    </I18nProvider>
  );
}
