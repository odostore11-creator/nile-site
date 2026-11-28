// Builds niletherapy.org into dist/. Every OLD URL keeps its address (see inventory/seo.json);
// new pages (specialties, articles) are additions.
//   node src/build.mjs              -> production (indexable)
//   NT_STAGING=1 node src/build.mjs -> staging (noindex on every page)
import fs from 'fs';
import path from 'path';
import { SITE, CONTACT, GA, SERVICES, SPECIALTIES, TESTIMONIAL, GOVERNORATES, NECK } from './content.mjs';
import { FOUNDERS, FAQ, SPEC_PAGES, ARTICLES } from './content2.mjs';
import { TURNSTILE_SITEKEY, CF_ANALYTICS_TOKEN } from './services.mjs'; // public keys: empty = off
import { PHOTOS, REVIEWS, STATS, NEWS, STORY } from './pending.mjs'; // founders' content: empty = hidden

const ROOT = path.resolve(path.dirname(decodeURIComponent(new URL(import.meta.url).pathname).replace(/^\/(\w:)/, '$1')), '..');
const DIST = path.join(ROOT, 'dist');
const STAGING = process.env.NT_STAGING === '1';
const BASE = process.env.NT_BASE || '/'; // where the site lives: only used by 404.html
const VER = (process.env.GITHUB_SHA || String(Date.now())).slice(0, 8);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------- links (relative, so the site also works under a sub-path) ----------
const depth = p => p.split('/').length - 2;
const rel = (from, to) => {
  const [p, hash = ''] = to.split('#'); const b = '../'.repeat(Math.max(0, depth(from)));
  const t = p === '/' ? (b || './') : b + p.replace(/^\//, '');
  return t + (hash ? '#' + hash : '');
};
const A = from => '../'.repeat(Math.max(0, depth(from))) + 'assets/';
const fileFor = p => (p === '/' ? 'index.html' : p.replace(/^\//, '') + '.html');
const pic = (name, alt, { cls = '', eager = false, sizes = '(max-width: 760px) 100vw, 50vw' } = {}) =>
  `<img class="${cls}" src="{A}img/${name}.webp" srcset="{A}img/${name}-600.webp 600w, {A}img/${name}.webp 1000w" sizes="${sizes}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="1000" height="667">`;

// ---------- text ----------
const T = {
  ar: { home: 'الرئيسية', services: 'الخدمات والأسعار', articles: 'المقالات', about: 'من نحن', reviews: 'آراء المرضى', book: 'احجز الآن', other: 'English', otherLang: 'en',
    menu: 'القائمة', wa: 'واتساب', call: 'اتصل', egp: 'ج.م', min: 'دقيقة', atHome: 'في منزلك', bookThis: 'احجز الآن', more: 'التفاصيل',
    payNote: 'الدفع نقداً بعد الجلسة', tagline: 'شريكك الموثوق في رحلة العلاج الطبيعي.', rights: 'جميع الحقوق محفوظة لشركة النيل للعلاج الطبيعي', contact: 'تواصل معنا', read: 'اقرأ المقال', specialties: 'التخصصات' },
  en: { home: 'Home', services: 'Services & prices', articles: 'Resources', about: 'About', reviews: 'Testimonials', book: 'Book now', other: 'العربية', otherLang: 'ar',
    menu: 'Menu', wa: 'WhatsApp', call: 'Call', egp: 'EGP', min: 'min', atHome: 'At your home', bookThis: 'Book now', more: 'Details',
    payNote: 'Pay cash after the session', tagline: 'Your trusted partner on your physiotherapy journey.', rights: 'All rights reserved, Nile Therapy', contact: 'Contact', read: 'Read article', specialties: 'Specialties' },
};
const waText = lang => encodeURIComponent(lang === 'ar' ? 'مرحباً، أريد حجز جلسة علاج طبيعي' : 'Hello, I would like to book a physiotherapy session');
const WA = lang => `https://wa.me/${CONTACT.wa}?text=${waText(lang)}`;

// ---------- icons (one stroke style everywhere) ----------
const I = {
  brain: '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a3 3 0 0 0-3-1Z"/><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>',
  bone: '<path d="M17 3a2.5 2.5 0 0 1 2 4 2.5 2.5 0 0 1-3.5 2.5L9.5 15.5A2.5 2.5 0 0 1 7 19a2.5 2.5 0 0 1-4-2 2.5 2.5 0 0 1 2.5-3.5l6-6A2.5 2.5 0 0 1 14 4a2.5 2.5 0 0 1 3-1Z"/>',
  scalpel: '<path d="M3 21 14 10l3 3L6 21Z"/><path d="M14 10l5-5a2 2 0 0 1 3 3l-5 5"/>',
  home: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M12 13v5M9.5 15.5h5"/>',
  run: '<circle cx="15" cy="4.5" r="2"/><path d="m6 20 4-5 3 2 2-5 4 2"/><path d="m9 9 4-1 2 4"/>',
  heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z"/><path d="M5 12h3l2-3 3 6 2-3h4"/>',
  wa: '<path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/><path d="M9 9.5c.5 2 2.5 4 4.5 4.5l1-1.2 2 .9c-.3 1.3-1.4 2-2.5 1.8-3-.5-5.5-3-6-6-.2-1.1.5-2.2 1.8-2.5l.9 2z"/>',
  phone: '<path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  check: '<path d="m5 12 5 5 9-10"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', pin: '<path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12Z"/><circle cx="12" cy="9" r="2.5"/>',
  cash: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>', cal: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  shield: '<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6Z"/><path d="m9 12 2 2 4-4"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', plus: '<path d="M12 5v14M5 12h14"/>',
  fb: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v7h4v-7h3l1-4h-4V8Z"/>', ig: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>',
  tt: '<path d="M14 3v11a3.5 3.5 0 1 1-3-3.5"/><path d="M14 3c.5 3 2.5 4.5 5 4.5"/>',
  chev: '<path d="m6 9 6 6 6-6"/>', clip: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h4"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>', pulse: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2.2.7 3.5 2.8 3.5 6"/>',
  doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>', news: '<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M7 9h6M7 13h10M7 16h10"/>',
  heartHand: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z"/>',
};
const icon = (n, c = '') => `<svg class="ic ${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;
const LOTUS = '<path d="M50 12 C61.5 25 65 43 50 63 C35 43 38.5 25 50 12 Z"/><path d="M46.5 66 C32 64.5 18.5 54 15 35 C30.5 37.5 42.5 48 46.5 66 Z"/><path d="M53.5 66 C68 64.5 81.5 54 85 35 C69.5 37.5 57.5 48 53.5 66 Z"/>';

// ---------- custom graphics ----------
// Hero map: Egypt and its neighbours from Natural Earth (1:10m, simplified by src/egypt-geo.json),
// with the Nile, the Delta, Lake Nasser and a few real cities. A calm, real-looking map card.
const GEO = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'egypt-geo.json'), 'utf8'));
const PROJ = ([lat, lng]) => [+((lng - GEO.box.w) * GEO.K * GEO.C).toFixed(1), +((GEO.box.n - lat) * GEO.K).toFixed(1)];
const smooth = pts => { // Catmull-Rom -> cubic Bézier
  const P = pts.map(PROJ); let d = `M${P[0][0]} ${P[0][1]}`;
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return d;
};
const poly = pts => 'M' + pts.map(PROJ).map(p => p.join(' ')).join(' L') + ' Z';
// The Nile (real towns along its course), its two Delta branches, the Delta fan and Lake Nasser.
const NILE = [[21.8, 31.35], [22.34, 31.61], [23.2, 32.55], [24.09, 32.9], [24.47, 32.95], [24.98, 32.87], [25.29, 32.55], [25.69, 32.64], [26.16, 32.72], [26.05, 32.24],
  [26.34, 31.89], [26.56, 31.69], [27.18, 31.18], [27.73, 30.84], [28.1, 30.75], [28.65, 30.9], [29.07, 31.1], [29.55, 31.2], [29.85, 31.33], [30.05, 31.24]];
const ROSETTA = [[30.05, 31.24], [30.4, 31.05], [30.82, 30.81], [31.1, 30.6], [31.4, 30.42]];
const DAMIETTA = [[30.05, 31.24], [30.47, 31.18], [30.79, 31.25], [31.04, 31.38], [31.25, 31.6], [31.42, 31.81]];
const DELTA = [[30.05, 31.24], [30.6, 30.5], [31.15, 29.95], [31.6, 30.4], [31.7, 31.1], [31.6, 31.85], [31.3, 32.25], [30.75, 32.0], [30.3, 31.55]];
const NASSER = [[21.8, 31.2], [22.4, 31.5], [22.85, 32.05], [23.35, 32.55], [23.9, 32.85], [23.75, 32.98], [23.2, 32.75], [22.7, 32.2], [22.2, 31.75], [21.8, 31.55]];
function egyptArt(lang) {
  const ar = lang === 'ar';
  const [cx, cy] = PROJ([30.05, 31.24]);
  const label = (ll, t, cls = 'eg-sea') => { const [x, y] = PROJ(ll); return `<text class="${cls}" x="${x}" y="${y}" text-anchor="middle">${t}</text>`; };
  // Decorative home visits along the Nile valley and the Delta (not a list of covered cities).
  const homes = [[31.15, 29.95], [31.0, 31.45], [30.55, 32.25], [29.3, 30.6], [28.05, 30.95], [26.6, 31.9]].map((ll, i) => { const [x, y] = PROJ(ll); return { x, y, i }; });
  const [lx, ly] = PROJ([26.3, 27.9]);
  return `<svg class="egypt" viewBox="0 0 ${GEO.W} ${GEO.H}" role="img" aria-label="${ar ? 'خريطة مصر ونهر النيل، ونحن في القاهرة نصل إليك في بيتك' : 'Map of Egypt and the Nile; from Cairo we come to your home'}">
  <defs>
    <linearGradient id="egSea" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#cfe8ef"/><stop offset="1" stop-color="#dff0f3"/></linearGradient>
    <linearGradient id="egSand" x1="0" y1="0" x2=".4" y2="1"><stop offset="0" stop-color="#f7f0e1"/><stop offset=".55" stop-color="#f2e7d0"/><stop offset="1" stop-color="#ecdcbc"/></linearGradient>
    <pattern id="egDots" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r=".8" fill="#dccaa3"/></pattern>
    <clipPath id="egClip"><path d="${GEO.egypt}"/></clipPath>
    <radialGradient id="egGlow"><stop offset="0" stop-color="#5cc9b5" stop-opacity=".45"/><stop offset="1" stop-color="#5cc9b5" stop-opacity="0"/></radialGradient>
  </defs>
  <rect class="eg-sea-bg" width="${GEO.W}" height="${GEO.H}"/>
  <path class="eg-nb" d="${GEO.neighbours}"/>
  <path class="eg-land" d="${GEO.egypt}"/><path class="eg-dots" d="${GEO.egypt}"/>
  <g clip-path="url(#egClip)"><path class="eg-valley" d="${smooth(NILE)}"/><path class="eg-delta" d="${poly(DELTA)}"/></g>
  <path class="eg-lake" d="${poly(NASSER)}"/>
  <path class="eg-nile" d="${smooth(NILE)}"/><path class="eg-nile thin" d="${smooth(ROSETTA)}"/><path class="eg-nile thin" d="${smooth(DAMIETTA)}"/>
  ${label([32.25, 28.4], ar ? 'البحر المتوسط' : 'Mediterranean Sea')}${label([24.6, 36.05], ar ? 'البحر الأحمر' : 'Red Sea')}
  ${homes.map(h => `<path class="eg-route" d="M${cx} ${cy} Q${(cx + h.x) / 2 + (h.y > cy ? 34 : 0)} ${Math.min(cy, h.y) - 26} ${h.x} ${h.y}" style="animation-delay:${h.i * .35}s"/>
    <g class="eg-home" transform="translate(${h.x - 11} ${h.y - 11})" style="animation-delay:${.4 + h.i * .35}s"><circle cx="11" cy="11" r="14"/><path d="M4.5 11.5 11 6l6.5 5.5M6.5 11v6h9v-6"/></g>`).join('')}
  <circle cx="${cx}" cy="${cy}" r="34" fill="url(#egGlow)"/><circle class="eg-pulse" cx="${cx}" cy="${cy}" r="10"/>
  <g class="eg-hub"><circle cx="${cx}" cy="${cy}" r="17"/><g transform="translate(${cx - 12} ${cy - 13.5}) scale(.24)">${LOTUS}</g></g>
  <g class="eg-tag" transform="translate(${lx} ${ly})"><rect x="-100" y="-24" width="200" height="48" rx="24"/><text x="0" y="7" text-anchor="middle">${ar ? 'العلاج يوصل لحد بيتك' : 'Care that comes home'}</text></g>
  <g class="eg-north" transform="translate(${GEO.W - 34} 30)"><circle r="16"/><path d="M0 -10 L5 6 L0 3 L-5 6 Z"/><text y="-20" text-anchor="middle">N</text></g>
</svg>`;
}
const waveTop = cls => `<svg class="wave-top ${cls}" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true"><path d="M0 40 C 240 0 420 60 720 34 S 1200 10 1440 36 V60 H0 Z"/></svg>`;

// ---------- top menu ----------
// Short names for the menu (the page titles are long).
const SPEC_SHORT = {
  neuro: { ar: ['المخ والأعصاب', 'بعد الجلطات وإصابات الأعصاب والحبل الشوكي'], en: ['Neurological rehab', 'After stroke, nerve or spinal cord injury'] },
  ortho: { ar: ['العظام والمفاصل', 'آلام المفاصل والعمود الفقري والكسور'], en: ['Orthopedics', 'Joint and spine pain, fractures'] },
  surgery: { ar: ['قبل وبعد العمليات', 'تجهيز قبل العملية وتعافٍ أسرع بعدها'], en: ['Before & after surgery', 'Get ready for surgery, recover faster after'] },
  homecare: { ar: ['الرعاية المنزلية', 'بعد الخروج من المستشفى ولكبار السن'], en: ['Advanced home care', 'After hospital discharge and for older adults'] },
  sports: { ar: ['إصابات الملاعب', 'التأهيل والعودة الآمنة للتدريب'], en: ['Sports injuries', 'Rehab and a safe return to training'] },
  icu: { ar: ['الرعاية المركزة', 'التنفس والحركة أثناء وبعد العناية المركزة'], en: ['Critical care', 'Breathing and movement during and after ICU'] },
};
// Menu items; groups open as dropdowns (hover on desktop, tap on phones). Links with '#' never mark a page as current.
function navModel(lang) {
  const ar = lang === 'ar', t = T[lang];
  const about = ar ? '/mn-nhn' : '/en/about', prices = ar ? '/online-store' : '/en#prices';
  return [
    { href: ar ? '/' : '/en', label: t.home },
    { key: 'services', href: prices, label: t.services, also: [...SERVICES.map(s => s.path), '/online-store'] },
    { key: 'articles', href: ar ? '/almqalat' : '/en/resources', label: t.articles,
      items: ar ? [{ href: '/almqalat-altbyh', icon: 'doc', label: 'المقالات الطبية', sub: 'آلام الرقبة والظهر، الركبة، والجلطات' },
        ...(NEWS.length ? [{ href: '/akhr-alakhbar', icon: 'news', label: 'أخر الأخبار', sub: 'الشراكات والإنجازات وأخبار الفريق' }] : [])] : [],
      also: ['/akhr-alakhbar', '/neckpain', ...ARTICLES.map(x => x[lang])] },
    { key: 'about', href: about, label: t.about, items: [
      { href: about, icon: 'heartHand', label: ar ? 'قصتنا ورسالتنا' : 'Our story & mission', sub: ar ? 'من نحن وكيف نعمل' : 'Who we are and how we work' },
      { href: about + '#founders', icon: 'users', label: ar ? 'المؤسسون' : 'The founders', sub: ar ? 'أطباء علاج طبيعي متخصصون' : 'Specialist physiotherapists' },
      { href: ar ? '/testimonials' : '/en/testimonials', icon: 'check', label: t.reviews, sub: ar ? 'تجارب مرضانا' : 'What our patients say' },
      { href: about + '#partners', icon: 'shield', label: ar ? 'الشراكات' : 'Partnerships', sub: ar ? 'مستشفيات وعيادات وأندية' : 'Hospitals, clinics and clubs' }],
      also: [ar ? '/testimonials' : '/en/testimonials'] },
  ];
}
function navHtml(p, lang) {
  const ar = lang === 'ar', t = T[lang], r = to => rel(p, to);
  const cur = it => [it.href, ...(it.items || []).map(x => x.href), ...(it.also || []), ...(it.key === 'services' ? SPEC_PAGES.map(s => s[lang]) : [])]
    .some(h => !h.includes('#') && h === p);
  const row = x => `<li><a href="${r(x.href)}"><span class="dd-ic">${icon(x.icon)}</span><span class="dd-tx"><b>${x.label}</b><small>${x.sub}</small></span></a></li>`;
  const body = it => {
    if (it.key === 'services') {
      const first = SERVICES[0];
      return `<div class="drop-in mega-in"><ul class="dd-list two">${SPEC_PAGES.map(s => row({ href: s[lang], icon: s.icon, label: SPEC_SHORT[s.key][lang][0], sub: SPEC_SHORT[s.key][lang][1] })).join('')}</ul>
        <aside class="dd-aside"><p class="dd-eyebrow">${ar ? 'ابدأ من هنا' : 'Start here'}</p><b>${first[lang].name}</b><p>${first[lang].short}</p>
          <p class="dd-price"><b>${first.price}</b> ${t.egp} · ${first.minutes} ${t.min}</p>
          <a class="btn book sm" href="${r(ar ? '/hjz-almwaayd' : '/en/book')}?service=${first.key}" data-track="book:menu">${t.book}</a>
          <a class="dd-more" href="${r(it.href)}">${ar ? 'كل الخدمات والأسعار' : 'All services & prices'} ${icon('arrow', 'flip')}</a></aside></div>`;
    }
    if (it.key === 'articles') {
      const latest = (ar ? arArticleList : enArticleList).slice(0, 4);
      return `<div class="drop-in cols-in">${it.items.length ? `<ul class="dd-list">${it.items.map(row).join('')}</ul>` : ''}
        <div class="dd-latest"><p class="dd-eyebrow">${ar ? 'أحدث المقالات' : 'Latest articles'}</p><ul>${latest.map(x => `<li><a href="${r(x.path)}">${x.title}</a></li>`).join('')}</ul>
          <a class="dd-more" href="${r(it.href)}">${ar ? 'كل المقالات' : 'All articles'} ${icon('arrow', 'flip')}</a></div></div>`;
    }
    return `<div class="drop-in"><ul class="dd-list">${it.items.map(row).join('')}</ul></div>`;
  };
  return navModel(lang).map(it => !it.key
    ? `<a class="nav-top" href="${r(it.href)}"${it.href === p ? ' aria-current="page"' : ''}>${it.label}</a>`
    : `<div class="nav-item" data-drop><a class="nav-top" href="${r(it.href)}"${cur(it) ? ' aria-current="page"' : ''}>${it.label}</a><button class="drop-btn" type="button" aria-expanded="false" aria-controls="dd-${it.key}" aria-label="${esc(it.label)}">${icon('chev')}</button>
      <div class="drop${it.key === 'services' ? ' mega' : it.key === 'articles' ? ' wide' : ''}" id="dd-${it.key}">${body(it)}</div></div>`).join('');
}

// ---------- layout ----------
function page(pg) {
  const { path: p, lang, title, description, pair } = pg;
  const t = T[lang], ar = lang === 'ar', a = A(p);
  const home = ar ? '/' : '/en', book = ar ? '/hjz-almwaayd' : '/en/book';
  const nav = navModel(lang).map(it => [it.href, it.label]).concat([[ar ? '/testimonials' : '/en/testimonials', t.reviews]]); // footer links
  const alt = pair ? [[lang, p], [t.otherLang, pair]] : [];
  const ld = [orgLd(lang), ...(pg.ld || [])];
  const booking = pg.bodyClass === 'is-booking';
  return `<!doctype html>
<html lang="${ar ? 'ar-EG' : 'en'}" dir="${ar ? 'rtl' : 'ltr'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${STAGING ? '<meta name="robots" content="noindex, nofollow">\n' : ''}<link rel="canonical" href="${SITE}${p}">
${alt.map(([l, u]) => `<link rel="alternate" hreflang="${l}" href="${SITE}${u}">`).join('\n')}${alt.length ? `\n<link rel="alternate" hreflang="x-default" href="${SITE}${ar ? p : pair}">` : ''}
<meta property="og:type" content="${pg.ogType || 'website'}">
<meta property="og:site_name" content="Nile Therapy">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${SITE}${p}">
<meta property="og:image" content="${SITE}/assets/og.png">
<meta property="og:locale" content="${ar ? 'ar_EG' : 'en_US'}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0b4f5c">
<link rel="icon" href="${a}logo/mark.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${a}logo/app-icon-filled.png">
<link rel="preload" href="${a}fonts/${ar ? 'readex-pro-arabic-600-normal' : 'outfit-latin-600-normal'}.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${a}site.css?v=${VER}">
<script type="application/ld+json">${JSON.stringify(ld.length === 1 ? ld[0] : { '@context': 'https://schema.org', '@graph': ld.map(({ '@context': _, ...x }) => x) })}</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA}');</script>
${CF_ANALYTICS_TOKEN ? `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"${CF_ANALYTICS_TOKEN}"}'></script>
` : ''}${booking && TURNSTILE_SITEKEY ? `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
` : ''}</head>
<body class="${pg.bodyClass || ''}">
<a class="skip" href="#main">${ar ? 'تخطَّ إلى المحتوى' : 'Skip to content'}</a>
<header class="top"><div class="wrap top-in">
  <a class="brand" href="${rel(p, home)}"><img src="${a}logo/${ar ? 'logo-horizontal' : 'logo-horizontal-en'}.svg" alt="Nile Therapy${ar ? ' - نايل ثيرابي' : ''}" width="214" height="52"></a>
  <nav class="nav" id="nav" aria-label="${t.menu}">${navHtml(p, lang)}
    <a class="lang" href="${rel(p, pair || (ar ? '/en' : '/'))}" hreflang="${t.otherLang}" lang="${t.otherLang}">${t.other}</a></nav>
  ${booking ? '' : `<a class="btn book sm book-top" href="${rel(p, book)}" data-track="book:header">${icon('cal')}${t.book}</a>`}
  <button class="menu" type="button" aria-expanded="false" aria-controls="nav" aria-label="${t.menu}">${icon('menu')}</button>
</div></header>
<main id="main">
${pg.body.replace(/\{A\}/g, a)}
</main>
<footer class="foot">${waveTop('to-deep')}<div class="wrap foot-in">
  <div><img src="${a}logo/logo-horizontal-white.svg" alt="Nile Therapy" width="214" height="52" loading="lazy"><p>${t.tagline}</p>
    <p class="social"><a href="${CONTACT.facebook}" rel="noopener" target="_blank" aria-label="Facebook">${icon('fb')}</a><a href="${CONTACT.instagram}" rel="noopener" target="_blank" aria-label="Instagram">${icon('ig')}</a><a href="${CONTACT.tiktok}" rel="noopener" target="_blank" aria-label="TikTok">${icon('tt')}</a></p></div>
  <div><h2>${t.contact}</h2><ul class="contact">
    <li>${icon('phone')}<a href="tel:${CONTACT.phone}" dir="ltr" data-track="call:footer">${CONTACT.phoneShow}</a></li>
    <li>${icon('wa')}<a href="${WA(lang)}" rel="noopener" target="_blank" data-track="whatsapp:footer">${t.wa}</a></li>
    <li>${icon('mail')}<a href="mailto:${CONTACT.email}">${CONTACT.email}</a></li></ul>
    <a class="btn ghost-light foot-book" href="${rel(p, book)}" data-track="book:footer">${t.book}</a></div>
  <div><h2>${t.specialties}</h2><ul class="links">${SPEC_PAGES.map(s => `<li><a href="${rel(p, s[lang])}">${esc(SPECIALTIES.find(x => x.icon === s.icon)[lang][0])}</a></li>`).join('')}</ul></div>
  <div><h2>${ar ? 'روابط' : 'Links'}</h2><ul class="links">${nav.map(([u, l]) => `<li><a href="${rel(p, u)}">${l}</a></li>`).join('')}</ul></div>
</div><p class="wrap copy">© ${new Date().getFullYear()} Nile Therapy · ${t.rights}</p></footer>
${booking ? '' : `<nav class="bookbar" aria-label="${t.book}"><a class="btn book" href="${rel(p, book)}" data-track="book:bottom-bar">${icon('cal')}${t.book}</a><a class="bb-ic wa" href="${WA(lang)}" rel="noopener" target="_blank" aria-label="${t.wa}" data-track="whatsapp:bottom-bar">${icon('wa')}</a><a class="bb-ic" href="tel:${CONTACT.phone}" aria-label="${t.call}" data-track="call:bottom-bar">${icon('phone')}</a></nav>
<a class="wa-float" href="${WA(lang)}" rel="noopener" target="_blank" aria-label="${t.wa}" data-track="whatsapp:float">${icon('wa')}</a>`}
<script src="${a}site.js?v=${VER}" defer></script>
</body>
</html>
`;
}

// ---------- structured data ----------
function orgLd(lang) {
  return { '@context': 'https://schema.org', '@type': ['MedicalBusiness', 'Physiotherapy'], '@id': SITE + '/#org', name: 'Nile Therapy',
    alternateName: ['شركة النيل للعلاج الطبيعي', 'نايل ثيرابي', 'Nile Therapy Egypt'], url: SITE + (lang === 'ar' ? '/' : '/en'),
    logo: SITE + '/assets/logo/app-icon-filled.png', image: SITE + '/assets/og.png', telephone: CONTACT.phone, email: CONTACT.email,
    areaServed: { '@type': 'Country', name: 'Egypt' }, medicalSpecialty: 'Physiotherapy', priceRange: 'EGP 500–800',
    founder: FOUNDERS.map(f => ({ '@type': 'Person', name: f.en.name, alternateName: f.ar.name, jobTitle: f.en.role, description: f.en.spec })),
    sameAs: [CONTACT.facebook, CONTACT.instagram, CONTACT.tiktok] };
}
const serviceLd = (s, lang) => ({ '@context': 'https://schema.org', '@type': 'Service', name: s[lang].name, description: s[lang].lead, serviceType: 'Physiotherapy',
  provider: { '@id': SITE + '/#org' }, areaServed: { '@type': 'Country', name: 'Egypt' }, url: SITE + s.path,
  offers: { '@type': 'Offer', price: s.price, priceCurrency: 'EGP', availability: 'https://schema.org/InStock' } });
const articleLd = (title, lead, url, lang, date, img) => ({ '@context': 'https://schema.org', '@type': 'Article', headline: title, description: lead, inLanguage: lang,
  datePublished: date, dateModified: '2026-11-23', image: `${SITE}/assets/img/${img}.webp`, mainEntityOfPage: SITE + url,
  author: { '@id': SITE + '/#org' }, publisher: { '@id': SITE + '/#org' } });
const faqLd = lang => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ[lang].map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
const crumbLd = (items) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE + url })) });

// ---------- sections ----------
const L = (p, lang) => ({ t: T[lang], ar: lang === 'ar', book: lang === 'ar' ? '/hjz-almwaayd' : '/en/book', r: to => rel(p, to) });
// "Who is this booking for?": half the people who book are arranging care for a parent or relative.
// The choice relabels the name/phone fields (site.js) and travels from the quick form to the booking page.
const forWhom = (lang, id) => {
  const ar = lang === 'ar';
  return `<fieldset class="for-whom"><legend>${ar ? 'لمين الحجز؟' : 'Who is this for?'}</legend>
    <input class="sr" type="radio" name="for" value="self" id="${id}-for-self" checked><label for="${id}-for-self">${ar ? 'لنفسي' : 'Me'}</label>
    <input class="sr" type="radio" name="for" value="family" id="${id}-for-family"><label for="${id}-for-family">${ar ? 'لحد من عيلتي' : 'Someone in my family'}</label></fieldset>`;
};
const govOptions = lang => GOVERNORATES.map(([e, a]) => `<option value="${e}">${lang === 'ar' ? a : e}</option>`).join('');

function hero(p, lang) {
  const { t, ar, book, r } = L(p, lang);
  return `<section class="hero"><div class="wrap hero-in">
  <div class="hero-text">
    <p class="eyebrow">${ar ? 'شركة النيل للعلاج الطبيعي والرعاية المنزلية' : 'Physiotherapy & home care across Egypt'}</p>
    <h1>${ar ? `علاجك يوصلك <span class="mark">لحد بيتك</span>` : `Physiotherapy that comes <span class="mark">to your home</span>`}</h1>
    <p class="lead">${ar ? `نبدأ بكشف كامل في البيت لمدة ${SERVICES[0].minutes} دقيقة، ثم خطة علاج طبيعي يشرف عليها أخصائي من مؤسسي Nile&nbsp;Therapy، لك أو لحد من عيلتك.` : `We start with a full ${SERVICES[0].minutes}-minute assessment at home, then a physiotherapy plan overseen by one of Nile Therapy's specialist founders, for you or someone in your family.`}</p>
    <form class="quick card" id="quick" data-book="${r(book)}" data-lang="${lang}" novalidate>
      <p class="quick-title">${ar ? 'احجز في أقل من دقيقة' : 'Book in under a minute'}</p>
      ${forWhom(lang, 'q')}
      <div class="quick-fields">
        <label class="qf"><span class="qf-l" data-self="${ar ? 'الاسم' : 'Name'}" data-family="${ar ? 'اسم المريض' : "Patient's name"}">${ar ? 'الاسم' : 'Name'}</span><input type="text" name="name" autocomplete="name" dir="auto" maxlength="120" required aria-describedby="qe-name"><small class="qf-err" id="qe-name" hidden></small></label>
        <label class="qf"><span class="qf-l" data-self="${ar ? 'رقم الموبايل' : 'Mobile number'}" data-family="${ar ? 'رقم موبايلك للتواصل' : 'Your mobile number'}">${ar ? 'رقم الموبايل' : 'Mobile number'}</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="01x xxxx xxxx" dir="ltr" maxlength="20" required aria-describedby="qe-phone"><small class="qf-err" id="qe-phone" hidden></small></label>
        <label class="qf"><span class="qf-l">${ar ? 'المحافظة' : 'Governorate'}</span><select name="governorate" required aria-describedby="qe-governorate"><option value="">${ar ? 'اختر المحافظة' : 'Choose…'}</option>${govOptions(lang)}</select><small class="qf-err" id="qe-governorate" hidden></small></label>
        <button class="btn book" type="submit" data-track="book:hero-form">${ar ? 'أكمل الحجز' : 'Continue booking'} ${icon('arrow', 'flip')}</button>
      </div>
      <p class="quick-note">${ar ? 'الخطوة التالية: العنوان والموعد المناسب، ثم نتصل بك للتأكيد.' : 'Next: your address and a good day, then we call you to confirm.'}</p>
    </form>
    <ul class="ticks"><li>${icon('shield')}${ar ? 'أطباء مرخّصون' : 'Licensed physiotherapists'}</li><li>${icon('home')}${ar ? 'في منزلك' : 'At your home'}</li><li>${icon('cash')}${t.payNote}</li></ul>
  </div>
  <div class="hero-art">${egyptArt(lang)}</div>
</div></section>`;
}
// Numbers band: only confirmed numbers (pending.mjs STATS). Until the founders confirm them, it shows facts that
// are already true on the site (specialties, first-visit length, session price, the three founders).
function stats(lang) {
  const ar = lang === 'ar';
  const labels = { partners: ar ? 'شريك من مستشفيات وعيادات وأندية' : 'partner hospitals, clinics and clubs', cities: ar ? 'مدينة نخدمها' : 'cities served',
    patients: ar ? 'مريض تابعناه في بيته' : 'patients treated at home', rating: ar ? `تقييم مرضانا${STATS?.ratingCount ? ` (${STATS.ratingCount})` : ''}` : `patient rating${STATS?.ratingCount ? ` (${STATS.ratingCount})` : ''}` };
  const confirmed = STATS ? Object.entries(labels).filter(([k]) => STATS[k] != null).map(([k, l]) => [k === 'rating' ? `★ ${STATS[k]}` : `${STATS[k]}${k === 'patients' || k === 'partners' ? '+' : ''}`, l]) : [];
  const facts = ar ? [['6', 'تخصصات علاج طبيعي'], [String(SERVICES[0].minutes), 'دقيقة للكشف الأول في بيتك'], [String(SERVICES[1].price), 'ج.م للجلسة، والدفع بعدها'], ['3', 'أطباء علاج طبيعي أسّسوا الشركة']]
    : [['6', 'physiotherapy specialties'], [String(SERVICES[0].minutes), 'minute first assessment at home'], [String(SERVICES[1].price), 'EGP a session, paid after'], ['3', 'physiotherapists founded the company']];
  const s = confirmed.length >= 2 ? confirmed.concat(facts).slice(0, 4) : facts;
  return `<section class="stats-band"><div class="wrap stats-in">${s.map(([n, l]) => `<p><b><bdi dir="ltr">${n}</bdi></b><span>${l}</span></p>`).join('')}</div></section>`;
}

// "What do you need help with?": pick a problem, see the matching care, its first step and a Book button.
// Works without JavaScript (radio buttons + :has); site.js only keeps the analytics.
const FINDER = [
  { key: 'ortho', ar: 'ألم في الظهر أو الرقبة أو المفاصل', en: 'Back, neck or joint pain' },
  { key: 'neuro', ar: 'جلطة أو مشكلة في الأعصاب', en: 'Stroke or a nerve problem' },
  { key: 'surgery', ar: 'قبل عملية أو بعدها', en: 'Before or after surgery' },
  { key: 'sports', ar: 'إصابة رياضية', en: 'A sports injury' },
  { key: 'homecare', ar: 'كبير سن أو بعد الخروج من المستشفى', en: 'An older adult, or just home from hospital' },
  { key: 'icu', ar: 'عناية مركزة أو رقود طويل', en: 'Intensive care or long bed rest' },
];
function finder(p, lang) {
  const { t, ar, book, r } = L(p, lang), first = SERVICES[0];
  return `<section class="sec finder-sec" id="services"><div class="wrap finder">
  <div class="sec-head split-head"><h2>${ar ? 'بماذا نساعدك؟' : 'What do you need help with?'}</h2><p>${ar ? 'اختر ما يشبه حالتك، ونوضّح لك نوع العلاج المناسب وكيف نبدأ.' : 'Pick what sounds like your situation and we will show you the right care and how to start.'}</p></div>
  <div class="finder-ui">
    <fieldset class="finder-chips"><legend class="sr">${ar ? 'اختر حالتك' : 'Choose your situation'}</legend>${FINDER.map((f, i) => {
      const s = SPEC_PAGES.find(x => x.key === f.key);
      return `<input class="sr" type="radio" name="need" id="need-${f.key}" value="${f.key}"${i === 0 ? ' checked' : ''}><label for="need-${f.key}">${icon(s.icon)}<span>${f[lang]}</span></label>`;
    }).join('')}</fieldset>
    <div class="finder-panels">${FINDER.map(f => {
      const s = SPEC_PAGES.find(x => x.key === f.key);
      return `<article class="finder-panel" data-for="${f.key}">
        <div class="fp-img">${pic(s.img, '', { sizes: '(max-width: 760px) 100vw, 30vw' })}</div>
        <div class="fp-body"><p class="eyebrow">${SPEC_SHORT[f.key][lang][0]}</p><h3>${s.t[lang]}</h3><p>${s.lead[lang]}</p>
          <ul class="fp-facts"><li>${icon('home')}${t.atHome}</li><li>${icon('clock')}${ar ? `البداية: ${first.ar.name.replace(/\s+/g, ' ')} (${first.minutes} دقيقة)` : `Start: first home assessment (${first.minutes} min)`}</li><li>${icon('cash')}${t.payNote}</li></ul>
          <div class="cta-row"><a class="btn" href="${r(book)}?service=${s.book}" data-track="book:finder-${f.key}">${icon('cal')}${t.book}</a><a class="btn ghost" href="${r(s[lang])}">${ar ? 'تفاصيل هذا العلاج' : 'About this care'} ${icon('arrow', 'flip')}</a></div></div>
      </article>`;
    }).join('')}</div>
  </div>
  <p class="finder-foot"><a class="more" href="${r(ar ? '/online-store' : '/en#prices')}">${ar ? 'كل الخدمات والأسعار' : 'All services and prices'} ${icon('arrow', 'flip')}</a></p>
</div></section>`;
}

// Your first visit, step by step (from the home-assessment and "first visit" content), with how to prepare.
function firstVisit(lang) {
  const ar = lang === 'ar', first = SERVICES[0];
  const steps = ar ? [['phone', 'نتصل بك', 'نفهم حالتك ونحدد موعداً يناسبك.'], ['clip', 'التاريخ المرضي', 'يراجع الطبيب حالتك وتقاريرك وأشعتك وأدويتك.'],
      ['pulse', 'تقييم شامل', 'الحركة، القوة العضلية، مدى المفاصل، التوازن ومستوى الألم.'], ['target', 'خطة علاجك', 'أهداف واضحة، عدد الجلسات المقترح، وبرنامج تمارين منزلي.']]
    : [['phone', 'We call you', 'We understand your case and set a time that suits you.'], ['clip', 'Your history', 'The physiotherapist reviews your case, reports, scans and medication.'],
      ['pulse', 'A full assessment', 'Movement, muscle strength, joint range, balance and pain.'], ['target', 'Your plan', 'Clear goals, the suggested number of sessions and a home exercise program.']];
  const prep = ar ? ['جهّز تقاريرك وأشعتك وقائمة أدويتك.', 'البس ملابس مريحة تسمح بحركة المنطقة المصابة.', 'وفّر مساحة صغيرة للحركة وكرسياً ثابتاً.', 'اكتب أسئلتك وما تريد أن تعود لفعله.']
    : ['Have your reports, scans and medication list ready.', 'Wear comfortable clothes that let the affected area move.', 'Clear a little space to move and have a firm chair nearby.', 'Write down your questions and what you want to be able to do again.'];
  return `<section class="sec visit-sec"><div class="wrap visit">
  <div class="visit-main"><p class="eyebrow">${ar ? `${first.ar.name.replace(/\s+/g, ' ')} · ${first.minutes} دقيقة` : `First home assessment · about ${first.minutes} min`}</p>
    <h2>${ar ? 'زيارتك الأولى، خطوة بخطوة' : 'Your first visit, step by step'}</h2>
    <ol class="visit-steps">${steps.map(([ic, h, d]) => `<li><span class="vs-ic">${icon(ic)}</span><div><b>${h}</b><p>${d}</p></div></li>`).join('')}</ol></div>
  <aside class="visit-prep"><h3>${ar ? 'كيف تستعد؟' : 'How to prepare'}</h3><ul>${prep.map(x => `<li>${icon('check')}<span>${x}</span></li>`).join('')}</ul></aside>
</div></section>`;
}

// Prices as one comparison (services page). On phones each column becomes a card with its own labels.
function priceTable(p, lang) {
  const { t, ar, book, r } = L(p, lang);
  const rows = ar ? ['مدة الزيارة', 'المكان', 'الدفع', 'مناسبة لـ'] : ['Visit length', 'Where', 'Payment', 'Best for'];
  return `<section class="sec" id="prices"><div class="wrap"><div class="ptable">
  <div class="pt-col pt-labels" aria-hidden="true"><div class="pt-head"></div><div class="pt-price"></div>${rows.map(x => `<div class="pt-cell">${x}</div>`).join('')}<div class="pt-cta"></div></div>
  ${SERVICES.map((s, i) => `<article class="pt-col${i === 0 ? ' featured' : ''}">
    <div class="pt-head">${i === 0 ? `<p class="badge">${ar ? 'البداية الموصى بها' : 'Recommended first step'}</p>` : ''}<h3>${ar ? `<a href="${r(s.path)}">${s.ar.name}</a>` : s.en.name}</h3></div>
    <div class="pt-price"><b>${s.price}</b> ${t.egp}</div>
    <div class="pt-cell"><span class="pt-l">${rows[0]}</span>${icon('clock')}${s.minutes} ${t.min}</div>
    <div class="pt-cell"><span class="pt-l">${rows[1]}</span>${icon('home')}${t.atHome}</div>
    <div class="pt-cell"><span class="pt-l">${rows[2]}</span>${icon('cash')}${ar ? 'نقداً بعد الجلسة' : 'Cash, after the session'}</div>
    <div class="pt-cell"><span class="pt-l">${rows[3]}</span><span>${s[lang].short}</span></div>
    <div class="pt-cta"><a class="btn ${i === 0 ? 'book' : 'ghost'} block" href="${r(book)}?service=${s.key}" data-track="book:table-${s.key}">${t.bookThis}</a>${ar ? `<a class="more" href="${r(s.path)}">${t.more} ${icon('arrow', 'flip')}</a>` : ''}</div>
  </article>`).join('')}
</div></div></section>`;
}

// Real home-visit photos (pending.mjs PHOTOS.visits): hidden until there are at least 3.
function visits(lang) {
  const list = PHOTOS.visits || [];
  if (list.length < 3) return '';
  const ar = lang === 'ar';
  return `<section class="sec visits-sec"><div class="wrap"><div class="sec-head"><h2>${ar ? 'من زياراتنا المنزلية' : 'From our home visits'}</h2></div>
    <div class="visits">${list.slice(0, 6).map(v => `<figure>${pic(v.file, v.alt?.[lang] || '', { sizes: '(max-width: 760px) 50vw, 33vw' })}</figure>`).join('')}</div></div></section>`;
}

// The founders' story (pending.mjs STORY): hidden until written.
function story(lang) {
  if (!STORY?.[lang]?.length) return '';
  const ar = lang === 'ar';
  return `<section class="sec tint story-sec">${waveTop('to-tint')}<div class="wrap narrow"><p class="eyebrow">${ar ? 'قصتنا' : 'Our story'}</p><h2>${ar ? 'لماذا بدأنا Nile Therapy' : 'Why we started Nile Therapy'}</h2>${STORY[lang].map(x => `<p>${x}</p>`).join('')}</div></section>`;
}

function specialtyList(p, lang) {
  const { ar, r } = L(p, lang);
  return `<section class="sec" id="services"><div class="wrap">
  <div class="sec-head split-head"><h2>${ar ? 'كل ما تحتاجه من علاج طبيعي، في بيتك' : 'Every kind of physiotherapy, at home'}</h2><p>${ar ? 'من تأهيل الجلطات وما بعد العمليات، لإصابات الملاعب ورعاية كبار السن، في بيتك ومن غير مشوار.' : 'From stroke rehab and recovery after surgery to sports injuries and elderly care, at home, with no trip to a clinic.'}</p></div>
  <ul class="spec-list">${SPEC_PAGES.map(s => { const sp = SPECIALTIES.find(x => x.icon === s.icon)[lang]; return `<li><a href="${r(s[lang])}">
    <span class="spec-ic">${icon(s.icon)}</span><span class="spec-tx"><b>${sp[0]}</b><span>${sp[1].split(/[.،]/)[0]}.</span></span>${icon('arrow', 'go flip')}</a></li>`; }).join('')}</ul>
</div></section>`;
}
function timeline(lang) {
  const ar = lang === 'ar';
  const first = SERVICES[0];
  // Booking and the first visit as one path: the full assessment and the founder-reviewed plan are the method, so they
  // sit in the middle of the strip (marked .key) between "book" and "pay after".
  const s = ar ? [['cal', 'احجز', 'نموذج قصير أو رسالة واتساب.'], ['phone', 'نتصل بك', 'نؤكد الموعد ونفهم الحالة.'],
      ['pulse', 'كشف كامل في البيت', `حوالي ${first.minutes} دقيقة: التاريخ المرضي والتقارير، ثم الحركة والقوة ومدى المفاصل والألم.`, 1],
      ['target', 'خطة علاج مكتوبة', 'أهداف واضحة وعدد الجلسات وتمارين منزلية، يشرف عليها أخصائي من المؤسسين.', 1], ['cash', 'ادفع بعد الجلسة', 'نقداً، بدون أي دفع أونلاين.']]
    : [['cal', 'Book', 'A short form or a WhatsApp message.'], ['phone', 'We call you', 'We confirm the time and understand the case.'],
      ['pulse', 'A full assessment at home', `About ${first.minutes} minutes: history and reports, then movement, strength, joint range and pain.`, 1],
      ['target', 'A written plan', 'Clear goals, the number of sessions and home exercises, overseen by a specialist founder.', 1], ['cash', 'Pay after the session', 'Cash, nothing online.']];
  return `<section class="sec how-sec"><div class="wrap"><div class="how">
  <div class="how-head"><div><h2>${ar ? 'زيارتك الأولى، خطوة بخطوة' : 'Your first visit, step by step'}</h2><p class="how-sub">${ar ? `${first.ar.name.replace(/\s+/g, ' ')}: ${first.price} ج.م` : `Home assessment and first session: EGP ${first.price}`}</p></div>
    <a class="how-wa" href="${WA(lang)}" rel="noopener" target="_blank" data-track="whatsapp:how">${icon('wa')}${ar ? 'أو ابعتلنا على واتساب' : 'Or message us on WhatsApp'}</a></div>
  <ol class="how-flow">${s.map(([ic, h, d, key]) => `<li${key ? ' class="key"' : ''}><span class="how-ic">${icon(ic)}</span><b>${h}</b><span>${d}</span></li>`).join('')}</ol></div></div></section>`;
}
function priceStrip(p, lang, { heading = true } = {}) {
  const { t, ar, book, r } = L(p, lang);
  return `<section class="sec" id="prices"><div class="wrap">
  ${heading ? `<div class="sec-head"><h2>${t.services}</h2><p>${ar ? 'أسعار واضحة للجلسة في منزلك. احجز أونلاين وادفع نقداً بعد الجلسة.' : 'Clear prices per session at your home. Book online, pay cash after the session.'}</p></div>` : ''}
  <div class="prices">${SERVICES.map((s, i) => `<article class="price${i === 0 ? ' featured' : ''}">
    ${i === 0 ? `<p class="badge">${ar ? 'البداية الموصى بها' : 'Recommended first step'}</p>` : ''}
    <h3>${ar ? `<a href="${r(s.path)}">${s.ar.name}</a>` : s.en.name}</h3><p class="desc">${s[lang].short}</p>
    <p class="amount"><b>${s.price}</b> ${t.egp}</p>
    <p class="meta"><span>${icon('clock')}${s.minutes} ${t.min}</span><span>${icon('home')}${t.atHome}</span></p>
    <a class="btn ${i === 0 ? 'book' : 'ghost'} block" href="${r(book)}?service=${s.key}" data-track="book:price-${s.key}">${t.bookThis}</a>
    ${ar ? `<a class="more" href="${r(s.path)}">${t.more} ${icon('arrow', 'flip')}</a>` : ''}</article>`).join('')}</div>
  <p class="pay-note">${icon('cash')}${t.payNote}</p>
</div></section>`;
}
// Until the portraits arrive: each founder's mark is the Nile Therapy lotus holding their specialty
// (neuromuscular → brain, cardiopulmonary/critical care → heart). On hover the side petals open a little.
const founderMark = f => {
  const ic = /neuro/i.test(f.en.spec) ? 'brain' : 'heart';
  return `<span class="f-mark" aria-hidden="true"><svg class="f-lotus" viewBox="0 0 100 100">${LOTUS}</svg><svg class="f-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${I[ic]}</svg></span>`;
};
function founders(lang, heading = true) {
  const ar = lang === 'ar';
  const photo = f => PHOTOS.founders?.[f.key];
  const withPhotos = FOUNDERS.every(photo); // portraits only when all three are in, so the cards match
  return `<section class="sec" id="founders"><div class="wrap">
  ${heading ? `<div class="sec-head"><h2>${ar ? 'المؤسسون' : 'Meet the founders'}</h2><p>${ar ? 'ثلاثة أخصائيين علاج طبيعي أسّسوا Nile&nbsp;Therapy، ويشرفون على خطط العلاج ويتابعونها مع الأخصائي الذي يزورك.' : 'Three specialist physiotherapists founded Nile Therapy. They oversee every treatment plan and follow it up with the physiotherapist who visits you.'}</p></div>` : ''}
  <div class="founders${withPhotos ? ' with-photos' : ''}">${FOUNDERS.map(f => `<article class="founder">
    ${withPhotos ? `<img class="f-photo" src="{A}img/${photo(f)}-600.webp" alt="${esc(f[lang].name)}" width="600" height="600" loading="lazy" decoding="async">` : founderMark(f)}
    <div><p class="role">${f[lang].spec}</p><h3>${f[lang].name}</h3><p class="spec">${f[lang].role.replace(/\s*\([A-Z]{2,4}\)/, '')}</p></div></article>`).join('')}</div>
</div></section>`;
}
// Patient reviews: the single real quote until the founders send more (pending.mjs REVIEWS, 2+ to show the grid).
function reviews(lang, { all = false } = {}) {
  if ((REVIEWS || []).length < 2) return quote(lang);
  const ar = lang === 'ar';
  const list = [{ quote: { [lang]: TESTIMONIAL[lang].quote }, who: { [lang]: TESTIMONIAL[lang].who } }, ...REVIEWS].filter(x => x.quote?.[lang]);
  return `<section class="sec tint">${waveTop('to-tint')}<div class="wrap">
    ${all ? '' : `<div class="sec-head split-head"><h2>${ar ? 'آراء مرضانا' : 'What patients say'}</h2></div>`}
    <div class="reviews">${(all ? list : list.slice(0, 3)).map(x => `<figure class="review"><span class="stars" role="img" aria-label="5/5">★★★★★</span>
      <blockquote dir="auto">${esc(x.quote[lang])}</blockquote><figcaption><b dir="auto">${esc(x.who?.[lang] || '')}</b>${x.about?.[lang] ? `<span dir="auto">${esc(x.about[lang])}</span>` : ''}</figcaption></figure>`).join('')}</div></div></section>`;
}
function quote(lang) {
  const q = TESTIMONIAL[lang];
  return `<section class="sec tint">${waveTop('to-tint')}<div class="wrap narrow"><h2 class="quote-h">${lang === 'ar' ? 'من مرضانا' : 'From a patient'}</h2><figure class="quote"><svg class="qmark" viewBox="0 0 60 48" aria-hidden="true"><path d="M0 48V28C0 12 8 3 24 0l3 6C17 9 13 15 13 24h12v24Zm33 0V28C33 12 41 3 57 0l3 6c-10 3-14 9-14 18h12v24Z"/></svg>
  <blockquote>${q.quote}</blockquote><figcaption><span class="stars" role="img" aria-label="5/5">★★★★★</span> ${q.who}</figcaption></figure></div></section>`;
}
function faq(lang) {
  const ar = lang === 'ar';
  return `<section class="sec"><div class="wrap faq-split"><div class="faq-side"><h2>${ar ? 'أسئلة شائعة' : 'Questions people ask'}</h2>
    <p class="muted">${ar ? 'لم تجد إجابتك؟ راسلنا وسنرد عليك.' : "Didn't find your answer? Message us and we'll reply."}</p>
    <a class="btn ghost" href="${WA(lang)}" rel="noopener" target="_blank" data-track="whatsapp:faq">${icon('wa')}${T[lang].wa}</a></div>
  <div class="faq">${FAQ[lang].map(([q, a]) => `<details><summary>${q}${icon('plus')}</summary><div class="faq-a"><p>${a}</p></div></details>`).join('')}</div></div></section>`;
}
function articleCards(p, lang, items) {
  const { t, r } = L(p, lang);
  return `<div class="posts">${items.map(x => `<article class="post"><div class="post-img">${pic(x.img, '', { sizes: '(max-width: 760px) 100vw, 33vw' })}</div>
    <div class="post-body"><p class="tag">${x.tag}</p><h3><a href="${r(x.path)}">${x.title}</a></h3><p>${x.lead}</p><a class="more" href="${r(x.path)}">${t.read} ${icon('arrow', 'flip')}</a></div></article>`).join('')}</div>`;
}
function ctaBand(p, lang) {
  const { t, ar, book, r } = L(p, lang);
  return `<section class="band"><div class="wrap band-in"><div><h2>${ar ? 'خطوتك الأولى نحو التعافي تبدأ اليوم' : 'Your recovery can start this week'}</h2><p>${ar ? 'احجز النهارده، وهنكلمك نحدد معاك ميعاد يناسبك.' : 'Book today and we will call you to set a time that suits you.'}</p></div>
  <div class="cta-row"><a class="btn book lg" href="${r(book)}" data-track="book:band">${icon('cal')}${t.book}</a><a class="btn lg ghost-light" href="${WA(lang)}" rel="noopener" target="_blank" data-track="whatsapp:band">${icon('wa')}${t.wa}</a></div></div></section>`;
}
function aboutText(lang) {
  const ar = lang === 'ar';
  const paras = ar ? ['هي وكالة متخصصة في العلاج الطبيعي والرعاية المنزلية، بتربط المرضى بأطباء علاج طبيعي مرخّصين وكوادر طبية مؤهلة في كل أنحاء مصر. بنقدّم خدمات تأهيل وعلاج بجودة عالية جوه بيتك، علشان نوفرلك الراحة والأمان ونساعدك تشوف تحسّن حقيقي وملموس في حالتك.',
    'نظام الرعاية المنزلية المتكامل بتاعنا بيجمع بين العلاج الطبيعي، والتمريض، واستخدام أحدث التقنيات الطبية، علشان نوفّر مستوى رعاية قريب من المستشفى لكن في بيتك. سواء تأهيل إصابات المخ والأعصاب، مشاكل العظام، التعافي بعد العمليات، أو رعاية كبار السن — كل برنامج بيتصمم مخصوص على حسب حالة كل مريض واحتياجاته.',
    'من خلال شبكة متنامية من أخصائيين معتمدين، وإشراف طبي مستمر، ومنسقين ميدانيين، بنضمنلك خدمة احترافية، متابعة مستمرة، واهتمام إنساني حقيقي.']
    : ['Nile Therapy is a physiotherapy and home-care agency that connects patients with licensed physiotherapists and qualified medical staff across Egypt. We bring high-quality treatment and rehabilitation into your home, for comfort, safety and real, measurable progress.',
      'Our integrated home-care system combines physiotherapy, nursing and modern medical technology to bring near-hospital care to your home: neuro rehabilitation, orthopedic problems, recovery after surgery or elderly care, each program designed around the patient.',
      'Through a growing network of accredited specialists, continuous medical supervision and field coordinators, we guarantee professional service, ongoing follow-up and genuine human care.'];
  // The same three paragraphs, laid out as an opening statement, two pillars and the mission card.
  return `<section class="sec about-sec"><div class="wrap">
  <div class="about-open"><p class="eyebrow">${ar ? 'من نحن' : 'About us'}</p><h2>${ar ? 'شركة النيل للعلاج الطبيعى' : 'About Nile Therapy'}</h2><p class="about-lead">${paras[0]}</p></div>
  <div class="pillars">
    <article class="pillar"><span class="pl-ic">${icon('home')}</span><h3>${ar ? 'رعاية متكاملة في بيتك' : 'Complete care at home'}</h3><p>${paras[1]}</p></article>
    <article class="pillar"><span class="pl-ic">${icon('users')}</span><h3>${ar ? 'فريق معتمد ومتابعة مستمرة' : 'An accredited team, always following up'}</h3><p>${paras[2]}</p></article>
    <aside class="mission"><svg viewBox="0 0 100 100" aria-hidden="true" class="mission-lotus">${LOTUS}</svg><p class="eyebrow">${ar ? 'رسالتنا' : 'Our mission'}</p>
      <p>${ar ? 'إننا نخلي العلاج والتأهيل أسهل في الوصول، معتمد على المتابعة والبيانات، ومتمحور حوالين المريض، ونغيّر مفهوم التعافي في مصر.' : 'To make treatment and rehabilitation easier to reach, data-driven and patient-centred, and to change what recovery means in Egypt.'}</p>
      <p class="sign">${ar ? '— العلاج يوصل لحد باب بيتك.' : '— Care that comes to your door.'}</p></aside>
  </div>
</div></section>`;
}
function partners(lang) {
  const ar = lang === 'ar';
  return `<section class="sec" id="partners"><div class="wrap partner">
  <div><h2>${ar ? 'الشراكات و التعاون' : 'Partnerships'}</h2><p>${ar ? 'نعمل في Nile Therapy على بناء شراكات فعّالة مع المستشفيات والعيادات والأندية الرياضية و الشركات لتقديم خدمات علاج طبيعي و رعاية منزلية تتمحور حول احتياجات المريض. نعتمد في جميع برامجنا العلاجية على المعايير الدولية والممارسات القائمة على الأدلة العلمية.' : 'We partner with hospitals, clinics, sports clubs and companies to deliver patient-centred physiotherapy and home care, following international standards and evidence-based practice.'}</p></div>
  <a class="btn ghost" href="mailto:${CONTACT.email}">${ar ? 'أنضم لنا' : 'Partner with us'}</a></div></section>`;
}
const pageHead = (h1, lead, crumbs = '') => `<section class="page-head"><div class="wrap narrow">${crumbs}<h1>${h1}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}</div></section>`;

// ---------- booking form ----------
function bookingForm(lang) {
  const ar = lang === 'ar';
  const f = ar ? { name: 'الاسم بالكامل', phone: 'رقم الموبايل (واتساب إن أمكن)', gov: 'المحافظة', addr: 'العنوان أو المنطقة', addrPh: 'مثال: مدينة نصر، شارع مكرم عبيد', loc: 'شارك موقعك (اختياري)', locBtn: 'استخدم موقعي الحالي', locHelp: 'يساعدنا نرسل لك أقرب أخصائي. أو الصق رابط موقعك من خرائط جوجل.', service: 'الخدمة', choose: 'اختر…', other: 'أخرى / غير متأكد', date: 'اليوم المفضّل', time: 'الوقت المفضّل', morning: 'صباحاً', afternoon: 'بعد الظهر', evening: 'مساءً', any: 'أي وقت', complaint: 'الشكوى أو الحالة', complaintPh: 'مثال: ألم في الرقبة منذ شهر، أو تأهيل بعد عملية ركبة', consent: 'أوافق على أن تحتفظ Nile Therapy ببياناتي لتنظيم الجلسات والتواصل معي.', send: 'إرسال طلب الحجز', note: 'سنتواصل معك لتأكيد الموعد. الدفع نقداً بعد الجلسة.', s1: 'بياناتك', email: 'البريد الإلكتروني (اختياري)', emailHelp: 'نرسل لك ملخص الحجز على بريدك.', s2: 'تفاصيل الزيارة', req: 'مطلوب' }
    : { name: 'Full name', phone: 'Mobile number (WhatsApp if possible)', gov: 'Governorate', addr: 'Address or area', addrPh: 'e.g. Nasr City, Makram Ebeid St.', loc: 'Share your location (optional)', locBtn: 'Use my current location', locHelp: 'Helps us send the nearest physiotherapist. Or paste a Google Maps link.', service: 'Service', choose: 'Choose…', other: 'Other / not sure', date: 'Preferred day', time: 'Preferred time', morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', any: 'Any time', complaint: 'Complaint or condition', complaintPh: 'e.g. neck pain for a month, or rehab after knee surgery', consent: 'I agree that Nile Therapy keeps my details to arrange sessions and contact me.', send: 'Send booking request', note: "We'll call you to confirm. Pay cash after the session.", s1: 'Your details', email: 'Email (optional)', emailHelp: 'We will email you a summary of your booking.', s2: 'About the visit', req: 'required' };
  const star = `<span class="req" aria-hidden="true">*</span>`;
  return `<form class="card booking" id="booking" novalidate data-lang="${lang}" aria-describedby="booking-err">
  <p class="step-label"><span>1</span>${f.s1}</p>
  ${forWhom(lang, 'b')}
  <div class="grid2"><label class="field"><span><span data-self="${f.name}" data-family="${ar ? 'اسم المريض بالكامل' : "Patient's full name"}">${f.name}</span>${star}</span><input type="text" name="name" autocomplete="name" required maxlength="120" dir="auto"></label>
    <label class="field"><span><span data-self="${f.phone}" data-family="${ar ? 'رقم موبايلك للتواصل (واتساب إن أمكن)' : 'Your mobile number (WhatsApp if possible)'}">${f.phone}</span>${star}</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" required maxlength="20" dir="ltr" placeholder="01x xxxx xxxx"></label></div>
  <div class="grid2"><label class="field"><span>${f.gov}${star}</span><select name="governorate" required><option value="">${f.choose}</option>${govOptions(lang)}</select></label>
    <label class="field"><span>${f.addr}${star}</span><input type="text" name="address" maxlength="300" dir="auto" placeholder="${f.addrPh}" required autocomplete="address-line1"></label></div>
  <label class="field" data-family-only hidden><span>${ar ? 'اسمك وصلة القرابة (اختياري)' : 'Your name and relationship (optional)'}</span><input type="text" name="booker" maxlength="80" dir="auto" placeholder="${ar ? 'مثال: منى، ابنته' : 'e.g. Mona, his daughter'}"><small>${ar ? 'حتى نعرف مين بنكلّم لما نتصل.' : 'So we know who we are speaking to when we call.'}</small></label>
  <label class="field"><span>${f.email}</span><input name="email" type="email" inputmode="email" autocomplete="email" maxlength="254" dir="ltr" placeholder="name@example.com"><small>${f.emailHelp}</small></label>
  <p class="step-label"><span>2</span>${f.s2}</p>
  <div class="field"><span>${f.loc}</span><div class="loc-row"><button type="button" class="btn ghost sm" data-here>${icon('pin')}${f.locBtn}</button><input name="map_link" type="url" dir="ltr" inputmode="url" maxlength="500" placeholder="https://maps.app.goo.gl/…" aria-label="${f.loc}"></div><small>${f.locHelp}</small><input type="hidden" name="lat"><input type="hidden" name="lng"></div>
  <label class="field"><span>${f.service}</span><select name="service"><option value="">${f.choose}</option>${SERVICES.map(s => `<option value="${s.key}">${s[lang].name} — ${s.price} ${T[lang].egp}</option>`).join('')}<option value="other">${f.other}</option></select></label>
  <div class="grid2"><label class="field"><span>${f.date}${star}</span><input name="date" type="date" required></label>
    <label class="field"><span>${f.time}</span><select name="slot"><option value="any">${f.any}</option><option value="morning">${f.morning}</option><option value="afternoon">${f.afternoon}</option><option value="evening">${f.evening}</option></select></label></div>
  <label class="field"><span>${f.complaint}</span><textarea name="complaint" maxlength="1000" dir="auto" rows="3" placeholder="${f.complaintPh}"></textarea></label>
  <label class="hp" aria-hidden="true">Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label>
  <label class="consent"><input type="checkbox" name="consent" required> <span>${f.consent}</span></label>
  ${TURNSTILE_SITEKEY ? `<div class="cf-turnstile" data-sitekey="${TURNSTILE_SITEKEY}" data-language="${lang}" data-size="flexible" data-theme="light"></div>` : ''}
  <p class="form-error" id="booking-err" role="alert" hidden></p>
  <button class="btn book lg block" type="submit">${f.send}</button>
  <p class="small muted center">${f.note}</p>
</form>
<div class="card done" id="booking-done" hidden tabindex="-1"><div class="done-ic">${icon('check')}</div>
  <h2>${ar ? 'تم استلام طلبك' : 'Request received'}</h2><p>${ar ? 'شكراً لك! سيتواصل معك فريق Nile Therapy قريباً لتأكيد الموعد.' : 'Thank you! The Nile Therapy team will call you soon to confirm.'}</p>
  <p><a class="btn ghost" href="https://wa.me/${CONTACT.wa}" rel="noopener" target="_blank" data-track="whatsapp:booking-done">${icon('wa')}${ar ? 'تواصل عبر واتساب' : 'Message us on WhatsApp'}</a></p></div>`;
}
function bookingAside(lang) {
  const ar = lang === 'ar';
  return `<aside class="book-aside"><h2>${ar ? 'ماذا يحدث بعد الحجز؟' : 'What happens next?'}</h2>
    <ol>${(ar ? ['نتصل بك لتأكيد الموعد.', 'نرسل لك أقرب أخصائي مرخّص.', 'الجلسة في بيتك، والدفع نقداً بعدها.'] : ['We call you to confirm the time.', 'We send the nearest licensed physiotherapist.', 'The session is at your home; pay cash after.']).map(x => `<li>${x}</li>`).join('')}</ol>
    <p>${ar ? 'تفضّل واتساب؟' : 'Prefer WhatsApp?'}</p><a class="btn ghost block" href="${WA(lang)}" rel="noopener" target="_blank" data-track="whatsapp:booking-aside">${icon('wa')}${T[lang].wa}</a></aside>`;
}

// ---------- pages ----------
const P = [];
const add = pg => P.push(pg);
const NECK_EN = '/en/enhancing-your-physical-therapy-practice-with-a-professional-website';
const HOMECARE_EN = '/en/enhancing-your-physical-therapy-practice-with-a-professional-online-presence';
const arArticleList = [{ path: '/neckpain', img: 'neck-exam', tag: 'المقالات الطبية', title: NECK.ar.title, lead: NECK.ar.lead.slice(0, 130) + '…' },
  ...ARTICLES.map(a => ({ path: a.ar, img: a.img, tag: 'المقالات الطبية', title: a.ar_t, lead: a.ar_lead }))];
const enArticleList = [{ path: NECK_EN, img: 'neck-exam', tag: 'Medical article', title: NECK.en.title, lead: NECK.en.lead },
  ...ARTICLES.map(a => ({ path: a.en, img: a.img, tag: 'Medical article', title: a.en_t, lead: a.en_lead })),
  { path: HOMECARE_EN, img: 'icu', tag: 'Home care', title: 'Physiotherapy at Home: What to Expect From Your First Visit', lead: 'How a home physiotherapy visit works, who it helps, and how to get ready for it.' }];

const homeBody = lang => p => hero(p, lang) + stats(lang) + finder(p, lang) + timeline(lang) + founders(lang) + priceStrip(p, lang) + visits(lang) + reviews(lang) + faq(lang)
  + `<section class="sec"><div class="wrap"><div class="sec-head split-head"><h2>${lang === 'ar' ? 'من مقالاتنا' : 'From our articles'}</h2><a class="more" href="${rel(p, lang === 'ar' ? '/almqalat' : '/en/resources')}">${lang === 'ar' ? 'كل المقالات' : 'All articles'} ${icon('arrow', 'flip')}</a></div>${articleCards(p, lang, (lang === 'ar' ? arArticleList : enArticleList).slice(0, 3)).replace('class="posts"', 'class="posts feature"')}</div></section>`
  + ctaBand(p, lang);
add({ path: '/', lang: 'ar', pair: '/en', title: 'Nile Therapy | العلاج الطبيعي في المنزل - شركة النيل للعلاج الطبيعي', ld: [faqLd('ar')],
  description: 'Nile Therapy (شركة النيل للعلاج الطبيعي): علاج طبيعي ورعاية منزلية في كل أنحاء مصر، للمخ والأعصاب والعظام وما بعد العمليات. احجز جلستك في منزلك.',
  body: homeBody('ar') });
add({ path: '/en', lang: 'en', pair: '/', title: 'Nile Therapy | Expert Physiotherapy at Home in Egypt', ld: [faqLd('en')],
  description: 'Licensed physiotherapists at your home across Egypt: neuro rehab, orthopedics, recovery after surgery and sports injuries. Book online, pay after the session.',
  body: homeBody('en') });

add({ path: '/mn-nhn', lang: 'ar', pair: '/en/about', title: 'من نحن | Nile Therapy - شركة النيل للعلاج الطبيعي',
  description: 'Nile Therapy وكالة متخصصة في العلاج الطبيعي والرعاية المنزلية، أسسها أطباء علاج طبيعي، وتربط المرضى بأخصائيين مرخّصين في كل أنحاء مصر.',
  body: p => pageHead('من نحن', 'شركة النيل للعلاج الطبيعي والرعاية المنزلية — العلاج يوصل لحد باب بيتك.') + aboutText('ar') + story('ar') + stats('ar') + visits('ar') + founders('ar') + timeline('ar') + partners('ar') + ctaBand(p, 'ar') });
add({ path: '/en/about', lang: 'en', pair: '/mn-nhn', title: 'About Nile Therapy | Physiotherapy & Home Care in Egypt',
  description: 'Nile Therapy is a physiotherapy and home-care agency founded by physiotherapists, connecting patients with licensed physiotherapists across Egypt.',
  body: p => pageHead('About Nile Therapy', 'Physiotherapy and advanced home care: treatment that comes to your door.') + aboutText('en') + story('en') + stats('en') + visits('en') + founders('en') + timeline('en') + partners('en') + ctaBand(p, 'en') });

const reviewsBody = lang => p => pageHead(lang === 'ar' ? 'آراء المرضى' : 'Patient testimonials', lang === 'ar' ? 'تجارب حقيقية من مرضى تعافوا معنا.' : 'Real experiences from patients who recovered with us.') + reviews(lang, { all: true })
  + `<section class="sec"><div class="wrap narrow center"><p>${lang === 'ar' ? `هل تعالجت معنا؟ يسعدنا سماع رأيك على <a href="${CONTACT.facebook}" rel="noopener" target="_blank">فيسبوك</a> أو <a href="${CONTACT.instagram}" rel="noopener" target="_blank">إنستجرام</a>.` : `Treated with us? We'd love to hear from you on <a href="${CONTACT.facebook}" rel="noopener" target="_blank">Facebook</a> or <a href="${CONTACT.instagram}" rel="noopener" target="_blank">Instagram</a>.`}</p></div></section>` + ctaBand(p, lang);
add({ path: '/testimonials', lang: 'ar', pair: '/en/testimonials', title: 'آراء المرضى | Nile Therapy', description: 'اقرأ تجارب مرضى Nile Therapy مع جلسات العلاج الطبيعي والرعاية المنزلية في منازلهم.', body: reviewsBody('ar') });
add({ path: '/en/testimonials', lang: 'en', pair: '/testimonials', title: 'Patient Testimonials | Nile Therapy', description: 'Read what Nile Therapy patients say about their physiotherapy and home-care experience at home.', body: reviewsBody('en') });

add({ path: '/hjz-almwaayd', lang: 'ar', pair: '/en/book', title: 'حجز جلسات العلاج الطبيعى فى المنزل | Nile Therapy', bodyClass: 'is-booking',
  description: 'استمتع بخدمات العلاج الطبيعى فى المنزل مع حجز مواعيد لجلسات العلاج الطبيعي بسهولة. املأ نموذج الحجز وسيتواصل معك أحد المتخصصين، والدفع بعد الجلسة.',
  body: p => pageHead('حجز المواعيد', 'سواء كان لديك استفسار طبي أو تحتاج إلى حجز جلسة علاج طبيعي، نحن هنا من أجلك. املأ النموذج وسيتواصل معك أحد المتخصصين.') + `<section class="sec"><div class="wrap book-layout">${bookingForm('ar')}${bookingAside('ar')}</div></section>` });
add({ path: '/en/book', lang: 'en', pair: '/hjz-almwaayd', title: 'Book a Home Physiotherapy Session | Nile Therapy', bodyClass: 'is-booking',
  description: 'Book a physiotherapy session at your home with Nile Therapy. Fill in the form and a specialist will call you; pay after the session.',
  body: p => pageHead('Book a session', 'Tell us a little about your case and a specialist will call you to confirm the best time.') + `<section class="sec"><div class="wrap book-layout">${bookingForm('en')}${bookingAside('en')}</div></section>` });

add({ path: '/online-store', lang: 'ar', title: 'الخدمات والأسعار | Nile Therapy',
  description: 'أسعار جلسات العلاج الطبيعي في المنزل مع Nile Therapy: كشف منزلي وجلسة أولى، جلسات العظام، وجلسات المخ والأعصاب. احجز أونلاين وادفع بعد الجلسة.',
  body: p => pageHead('الخدمات والأسعار', 'أسعار واضحة للجلسة في منزلك. احجز أونلاين وادفع نقداً بعد الجلسة.') + priceTable(p, 'ar') + firstVisit('ar') + specialtyList(p, 'ar') + faq('ar') + ctaBand(p, 'ar'), ld: [faqLd('ar')] });
for (const s of SERVICES) add({ path: s.path, lang: 'ar', title: `${s.ar.name} | Nile Therapy`, description: (s.ar.lead + '. الدفع نقداً بعد الجلسة.').slice(0, 158),
  ld: [serviceLd(s, 'ar'), crumbLd([['الخدمات والأسعار', '/online-store'], [s.ar.name, s.path]])],
  body: p => `<section class="page-head"><div class="wrap service-in"><div><p class="crumbs"><a href="${rel(p, '/online-store')}">الخدمات والأسعار</a></p><h1>${s.ar.name}</h1><p class="lead">${s.ar.lead}</p></div>
    <div class="price-box"><p class="amount"><b>${s.price}</b> ج.م</p><p class="meta"><span>${icon('clock')}${s.minutes} دقيقة</span><span>${icon('home')}فى منزلك</span></p>
    <a class="btn book lg block" href="${rel(p, '/hjz-almwaayd')}?service=${s.key}" data-track="book:service-${s.key}">${icon('cal')}احجز الان</a><p class="small muted">الدفع نقداً بعد الجلسة</p></div></div></section>
  <section class="sec"><div class="wrap narrow prose">${s.ar.body.map(x => `<p>${x}</p>`).join('')}</div></section>` + firstVisit('ar') + faq('ar') + ctaBand(p, 'ar') });

// One page per specialty (new; Arabic + English).
for (const s of SPEC_PAGES) for (const lang of ['ar', 'en']) {
  const ar = lang === 'ar', other = ar ? 'en' : 'ar';
  add({ path: s[lang], lang, pair: s[other], title: `${s.t[lang]}${s.t[lang].length > 52 ? '' : ' | Nile Therapy'}`, description: s.lead[lang],
    ld: [{ '@context': 'https://schema.org', '@type': 'MedicalTherapy', name: s.t[lang], description: s.lead[lang], relevantSpecialty: 'PhysicalTherapy', url: SITE + s[lang] },
      crumbLd([[ar ? 'الرئيسية' : 'Home', ar ? '/' : '/en'], [s.t[lang], s[lang]]])],
    body: p => `<section class="page-head spec-head"><div class="wrap service-in"><div><p class="crumbs"><a href="${rel(p, ar ? '/' : '/en')}">${T[lang].home}</a> · ${T[lang].specialties}</p>
      <h1>${s.t[lang]}</h1><p class="lead">${s.lead[lang]}</p>
      <div class="cta-row"><a class="btn book lg" href="${rel(p, ar ? '/hjz-almwaayd' : '/en/book')}?service=${s.book}" data-track="book:spec-${s.key}">${icon('cal')}${T[lang].book}</a><a class="btn ghost lg" href="${WA(lang)}" rel="noopener" target="_blank" data-track="whatsapp:spec-${s.key}">${icon('wa')}${T[lang].wa}</a></div></div>
      ${pic(s.img, s.t[lang], { cls: 'service-img', eager: true })}</div></section>
    <section class="sec"><div class="wrap two-col">
      <div><h2>${ar ? 'لمن هذه الخدمة؟' : 'Who it helps'}</h2><ul class="checks">${s.who[lang].map(x => `<li>${icon('check')}${x}</li>`).join('')}</ul></div>
      <div><h2>${ar ? 'ماذا تشمل الجلسات؟' : 'What sessions include'}</h2><ol class="numbered">${s.how[lang].map(x => `<li>${x}</li>`).join('')}</ol></div>
    </div></section>` + firstVisit(lang) + priceStrip(p, lang) + faq(lang) + ctaBand(p, lang) });
}

// Articles.
const articlePage = (lang, title, lead, html, url, date, img, crumbUrl, crumbName, dateLabel) => ({ path: url, lang, title: `${title} | Nile Therapy`, ogType: 'article', description: lead.slice(0, 160),
  ld: [articleLd(title, lead, url, lang, date, img), crumbLd([[crumbName, crumbUrl], [title, url]])],
  body: p => `<article>${pageHead(title, lead, `<p class="crumbs"><a href="${rel(p, crumbUrl)}">${crumbName}</a>${dateLabel ? ` · <time datetime="${date}">${dateLabel}</time>` : ''}</p>`)}
    <section class="sec"><div class="wrap narrow prose">${html}</div></section></article>` + ctaBand(p, lang) });
add(articlePage('ar', NECK.ar.title, NECK.ar.lead, NECK.ar.html, '/neckpain', NECK.date, 'posture-desk', '/almqalat-altbyh', 'المقالات الطبية', '30 أغسطس 2025'));
add(articlePage('en', NECK.en.title, NECK.en.lead, NECK.en.html, NECK_EN, NECK.date, 'posture-desk', '/en/resources', 'Resources'));
for (const a of ARTICLES) {
  add({ ...articlePage('ar', a.ar_t, a.ar_lead, a.ar_html, a.ar, a.date, a.img, '/almqalat-altbyh', 'المقالات الطبية', '23 نوفمبر 2026'), pair: a.en });
  add({ ...articlePage('en', a.en_t, a.en_lead, a.en_html, a.en, a.date, a.img, '/en/resources', 'Resources'), pair: a.ar });
}
add(articlePage('en', 'Home Physiotherapy: Your First Visit', 'How a home physiotherapy visit with Nile Therapy works, who it helps, what the first assessment includes and how to prepare.',
  `<h2>Who home physiotherapy helps</h2><ul><li>People recovering from surgery (joint replacement, fractures, spine surgery).</li><li>Patients after a stroke or with other neurological conditions.</li><li>Older adults who find travelling to a clinic hard.</li><li>Patients discharged from hospital or intensive care who still need close follow-up.</li><li>Anyone with pain that limits daily life: neck, back, knee or shoulder.</li></ul>
  <h2>Your first visit</h2><p>Your first session is a full assessment (about 2 hours). The physiotherapist reviews your medical history and any reports or scans, then checks movement, strength, joint range, balance and pain. You leave with a clear plan: the goals, the number of sessions and a home exercise program.</p>
  <h2>How to prepare</h2><ul><li>Have your reports, scans and medication list ready.</li><li>Wear comfortable clothes that let the affected area move.</li><li>Clear a little space to move around, and have a firm chair nearby.</li><li>Write down your questions and what you want to be able to do again.</li></ul>
  <h2>After the visit</h2><p>Sessions follow the plan, with regular reassessment so the program keeps up with your progress. With Nile Therapy you book online, a licensed physiotherapist near you visits, and you pay cash after the session.</p>`,
  HOMECARE_EN, '2026-11-23', 'icu', '/en/resources', 'Resources'));

const listBody = (lang, h1, lead, items, extra = '') => p => pageHead(h1, lead) + `<section class="sec"><div class="wrap">${extra}${articleCards(p, lang, items)}</div></section>` + ctaBand(p, lang);
add({ path: '/almqalat', lang: 'ar', title: 'المقالات | Nile Therapy', description: 'مقالات طبية موثوقة عن العلاج الطبيعي وإعادة التأهيل من Nile Therapy: آلام الرقبة والظهر، التأهيل بعد العمليات والجلطات، وآخر الأخبار.',
  body: listBody('ar', 'المقالات و أخر الاخبار', 'قال الإمام الشافعي رحمه الله: «إنما العِلمُ عِلمان: عِلمُ الدِّين، وعِلمُ الدُّنيا، فأشرفُ علمِ الدُّنيا الطِّب.»', arArticleList,
    `<p class="narrow">وقال الإمام ابن سينا: «الطِّبُّ علمٌ يُعرَفُ به أحوالُ بدنِ الإنسان، من حيثُ ما يَصحُّ ويَمرضُ، حفظًا للصِّحة، واستردادًا لها عند زوالها.» نلتزم في Nile Therapy بتقديم مقالات طبية موثوقة قائمة على الدليل العلمي، إلى جانب آخر الأخبار والشراكات.</p><div class="tabs"><a class="chip" href="almqalat-altbyh">المقالات الطبية</a>${NEWS.length ? '<a class="chip" href="akhr-alakhbar">أخر الأخبار</a>' : ''}</div>`) });
add({ path: '/almqalat-altbyh', lang: 'ar', title: 'المقالات الطبية | Nile Therapy', description: 'مقالات طبية عن آلام الرقبة والظهر، التأهيل بعد تغيير الركبة، وتأهيل الجلطات في المنزل، مبنية على أحدث الممارسات، من Nile Therapy.',
  body: listBody('ar', 'المقالات الطبية', 'معرفة طبية موثوقة تساعدك تفهم حالتك وتتعافى بشكل أفضل.', arArticleList) });
add({ path: '/akhr-alakhbar', lang: 'ar', title: 'أخر الأخبار | Nile Therapy', description: 'آخر أخبار Nile Therapy: الشراكات الطبية، الإنجازات، وأخبار أطبائنا وخبرائنا في العلاج الطبيعي.',
  // With news (pending.mjs NEWS) it lists them; until then this old address shows the latest articles (it is not in the menu).
  body: p => pageHead('أخر الأخبار', 'آخر الشراكات الطبية والإنجازات وأخبار فريقنا.') + (NEWS.length
    ? `<section class="sec"><div class="wrap narrow news">${[...NEWS].sort((x, y) => y.date.localeCompare(x.date)).map(n => `<article class="news-item"><time datetime="${n.date}">${new Date(n.date + 'T00:00:00').toLocaleDateString('ar-EG-u-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
        <h2>${esc(n.title.ar)}</h2>${n.img ? pic(n.img, n.title.ar, { cls: 'news-img' }) : ''}${(n.body?.ar || []).map(x => `<p>${esc(x)}</p>`).join('')}</article>`).join('')}</div></section>`
    : `<section class="sec"><div class="wrap"><div class="sec-head"><h2>من مقالاتنا</h2><p>ننشر أخبارنا أولاً بأول على <a href="${CONTACT.facebook}" rel="noopener" target="_blank">فيسبوك</a> و<a href="${CONTACT.instagram}" rel="noopener" target="_blank">إنستجرام</a>. وإلى أن تصلك أخبارنا هنا، اقرأ أحدث مقالاتنا الطبية.</p></div>${articleCards(p, 'ar', arArticleList.slice(0, 3))}</div></section>`) + ctaBand(p, 'ar') });
add({ path: '/en/resources', lang: 'en', title: 'Physiotherapy Resources for Patients | Nile Therapy', description: 'Practical, evidence-based physiotherapy articles from Nile Therapy: neck and back pain, knee replacement and stroke rehabilitation, recovery at home.',
  body: listBody('en', 'Resources', 'Practical, evidence-based articles to help you understand your condition and recover better.', enArticleList) });

// ---------- write ----------
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
const copyDir = (from, to) => { fs.mkdirSync(to, { recursive: true }); for (const f of fs.readdirSync(from)) { const s = path.join(from, f), d = path.join(to, f); fs.statSync(s).isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d); } };
copyDir(path.join(ROOT, 'assets'), path.join(DIST, 'assets'));
fs.copyFileSync(path.join(ROOT, 'src', 'site.css'), path.join(DIST, 'assets', 'site.css'));
fs.copyFileSync(path.join(ROOT, 'src', 'site.js'), path.join(DIST, 'assets', 'site.js'));
for (const pg of P) {
  const out = path.join(DIST, fileFor(pg.path));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, page({ ...pg, body: pg.body(pg.path) }));
}
// 404: absolute paths (it can be served at any URL).
const nf = page({ path: '/404', lang: 'ar', title: 'الصفحة غير موجودة | Nile Therapy', description: 'الصفحة التي تبحث عنها غير موجودة. ارجع إلى الصفحة الرئيسية لـ Nile Therapy للعلاج الطبيعي في المنزل.',
  body: `<section class="page-head"><div class="wrap narrow center"><h1>الصفحة غير موجودة</h1><p class="lead">Page not found</p><div class="cta-row center"><a class="btn" href="${BASE}">الرئيسية</a><a class="btn ghost" href="${BASE}en">English</a></div></div></section>` })
  .replace(/(href|src)="(?:\.\/)?assets\//g, `$1="${BASE}assets/`).replace(/href="(\.\/|[a-z][a-z0-9\-/]*)"/g, (m, u) => `href="${BASE}${u === './' ? '' : u}"`)
  .replace('<link rel="canonical"', '<meta name="robots" content="noindex"><link rel="canonical"')
  // /page/ (trailing slash) or /page.html -> the real address /page, before showing 'not found'.
  .replace('<head>', '<head>\n<script>(function(){var p=location.pathname,q=p.replace(/\\.html$/,"").replace(/\\/+$/,"");if(q&&q!==p)location.replace(q+location.search+location.hash);})();</script>');
fs.writeFileSync(path.join(DIST, '404.html'), nf);
// robots + sitemap
fs.writeFileSync(path.join(DIST, 'robots.txt'), STAGING ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nDisallow:\n\nSitemap: ${SITE}/sitemap.xml\n`);
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${P.map(pg => `<url><loc>${SITE}${pg.path}</loc>${pg.pair ? `<xhtml:link rel="alternate" hreflang="${pg.lang}" href="${SITE}${pg.path}"/><xhtml:link rel="alternate" hreflang="${pg.lang === 'ar' ? 'en' : 'ar'}" href="${SITE}${pg.pair}"/>` : ''}<lastmod>${today}</lastmod><priority>${pg.path === '/' || pg.path === '/en' ? '1.0' : '0.6'}</priority></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');
console.log(`built ${P.length} pages${STAGING ? ' (STAGING: noindex)' : ''}`);
