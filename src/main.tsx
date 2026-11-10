import { render } from 'preact';
import './fonts';
import './styles.css';
import { App } from './app';
import { initInstall, initSW, isStandalone } from './lib/pwa';
import { trackLaunch } from './lib/stats';

initInstall(); // beforeinstallprompt’ni erta ushlab qolish uchun render’dan oldin
initSW();
trackLaunch(isStandalone());

render(<App />, document.getElementById('app')!);
