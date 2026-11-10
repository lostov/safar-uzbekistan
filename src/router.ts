import { useEffect, useState } from 'preact/hooks';

// Hash-router: GitHub Pages’da qo‘shimcha sozlamasiz ishlaydi (#/vakolatxonalar)
export type Route =
  | { name: 'home' } | { name: 'sources' } | { name: 'banned' } | { name: 'embassies' }
  | { name: 'embassy'; id: number } | { name: 'vaqf' } | { name: 'weather' } | { name: 'prayer' }
  | { name: 'sos' } | { name: 'more' }
  | { name: 'agencies' } | { name: 'visa' } | { name: 'courses' } | { name: 'xorijdaish' }
  | { name: 'guides'; id?: number; group?: 'return' };

export const paths = {
  home: '#/', sources: '#/manbalar', banned: '#/taqiqlangan', embassies: '#/vakolatxonalar',
  embassy: (id: number) => `#/vakolatxona/${id}`, vaqf: '#/vaqf', weather: '#/ob-havo',
  prayer: '#/namoz', sos: '#/sos', more: '#/yana',
  agencies: '#/agentliklar', visa: '#/viza', courses: '#/kurslar', xorijdaish: '#/xorijda-ish',
  guides: '#/qollanma', guide: (id: number) => `#/qollanma/${id}`, returnees: '#/qollanma/qaytganlar',
};

function parse(hash: string): Route {
  const p = hash.replace(/^#\/?/, '').split('/');
  switch (p[0]) {
    case 'manbalar': return { name: 'sources' };
    case 'taqiqlangan': return { name: 'banned' };
    case 'vakolatxonalar': return { name: 'embassies' };
    case 'vakolatxona': return { name: 'embassy', id: Number(p[1]) || 0 };
    case 'vaqf': return { name: 'vaqf' };
    case 'ob-havo': return { name: 'weather' };
    case 'namoz': return { name: 'prayer' };
    case 'sos': return { name: 'sos' };
    case 'yana': return { name: 'more' };
    case 'agentliklar': return { name: 'agencies' };
    case 'viza': return { name: 'visa' };
    case 'kurslar': return { name: 'courses' };
    case 'xorijda-ish': return { name: 'xorijdaish' };
    case 'qollanma': return p[1] === 'qaytganlar' ? { name: 'guides', group: 'return' } : { name: 'guides', id: Number(p[1]) || undefined };
    default: return { name: 'home' };
  }
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parse(location.hash));
  useEffect(() => {
    const on = () => { setRoute(parse(location.hash)); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}
