// Builds niletherapy.org into dist/. Every OLD URL keeps its address (see inventory/seo.json);
// new pages (specialties, articles) are additions.
//   node src/build.mjs              -> production (indexable)
//   NT_STAGING=1 node src/build.mjs -> staging (noindex on every page)
import fs from 'fs';
import path from 'path';
import { SITE, CONTACT, GA, SERVICES, SPECIALTIES, TESTIMONIAL, GOVERNORATES, NECK } from './content.mjs';
import { FOUNDERS, FAQ, SPEC_PAGES, ARTICLES } from './content2.mjs';

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
    menu: 'القائمة', wa: 'واتساب', call: 'اتصل', egp: 'ج.م', min: 'دقيقة', atHome: 'في منزلك', bookThis: 'احجز هذه الخدمة', more: 'التفاصيل',
    payNote: 'الدفع نقداً بعد الجلسة', tagline: 'شريكك الموثوق في رحلة العلاج الطبيعي.', rights: 'جميع الحقوق محفوظة لشركة النيل للعلاج الطبيعي', contact: 'تواصل معنا', read: 'اقرأ المقال', specialties: 'التخصصات' },
  en: { home: 'Home', services: 'Services & prices', articles: 'Resources', about: 'About', reviews: 'Testimonials', book: 'Book now', other: 'العربية', otherLang: 'ar',
    menu: 'Menu', wa: 'WhatsApp', call: 'Call', egp: 'EGP', min: 'min', atHome: 'At your home', bookThis: 'Book this service', more: 'Details',
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
const CITIES = [[30.05, 31.24, 'القاهرة', 'Cairo', 'cap'], [31.2, 29.92, 'الإسكندرية', 'Alexandria'], [25.69, 32.64, 'الأقصر', 'Luxor'], [24.09, 32.9, 'أسوان', 'Aswan'],
  [27.18, 31.18, 'أسيوط', 'Assiut'], [27.26, 33.81, 'الغردقة', 'Hurghada']];
function egyptArt(lang) {
  const ar = lang === 'ar';
  const [cx, cy] = PROJ([30.05, 31.24]);
  const label = (ll, t, cls = 'eg-sea') => { const [x, y] = PROJ(ll); return `<text class="${cls}" x="${x}" y="${y}" text-anchor="middle">${t}</text>`; };
  const cities = CITIES.map(([lat, lng, a, e, cap]) => {
    const [x, y] = PROJ([lat, lng]); const right = lng > 32.7 && !cap;
    return cap ? '' : `<g class="eg-city"><circle cx="${x}" cy="${y}" r="3.4"/><text x="${x + (right ? 7 : -7)}" y="${y + 4}" text-anchor="${right ? 'start' : 'end'}">${ar ? a : e}</text></g>`;
  }).join('');
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
  ${label([26.6, 27.6], ar ? 'مـصـر' : 'EGYPT', 'eg-country')}
  ${cities}
  <circle cx="${cx}" cy="${cy}" r="34" fill="url(#egGlow)"/><circle class="eg-pulse" cx="${cx}" cy="${cy}" r="10"/>
  <circle class="eg-cap" cx="${cx}" cy="${cy}" r="6"/>
  <g class="eg-pin" transform="translate(${cx + 6} ${cy - 40}) scale(.85)"><path class="eg-pin-body" d="M15 0C7 0 1 6 1 13.5 1 23 15 34 15 34s14-11 14-20.5C29 6 23 0 15 0Z"/><g transform="translate(5 3) scale(.2)">${LOTUS}</g></g>
  <text class="eg-cap-label" x="${cx - 10}" y="${cy + 5}" text-anchor="end">${ar ? 'القاهرة' : 'Cairo'}</text>
  <g class="eg-north" transform="translate(${GEO.W - 34} 30)"><circle r="16"/><path d="M0 -10 L5 6 L0 3 L-5 6 Z"/><text y="-20" text-anchor="middle">N</text></g>
</svg>`;
}
// Underline: one tapered brush stroke that sweeps in (from the right in Arabic).
const squiggle = '<svg class="squiggle" viewBox="0 0 240 26" preserveAspectRatio="none" aria-hidden="true"><path class="brush" d="M3 17 C 40 10, 95 8, 140 9.5 C 180 11, 214 8, 237 4.5 C 236 7.5, 233 10, 228 11.5 C 200 15, 170 17.5, 138 17 C 95 16.5, 50 18.5, 8 21.5 C 3.5 21.8, 1.5 19, 3 17 Z"/></svg>';
const waveTop = cls => `<svg class="wave-top ${cls}" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true"><path d="M0 40 C 240 0 420 60 720 34 S 1200 10 1440 36 V60 H0 Z"/></svg>`;

// ---------- layout ----------
function page(pg) {
  const { path: p, lang, title, description, pair } = pg;
  const t = T[lang], ar = lang === 'ar', a = A(p);
  const home = ar ? '/' : '/en', book = ar ? '/hjz-almwaayd' : '/en/book';
  const nav = ar
    ? [['/', t.home], ['/online-store', t.services], ['/almqalat', t.articles], ['/mn-nhn', t.about], ['/testimonials', t.reviews]]
    : [['/en', t.home], ['/en#prices', t.services], ['/en/resources', t.articles], ['/en/about', t.about], ['/en/testimonials', t.reviews]];
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
</head>
<body class="${pg.bodyClass || ''}">
<a class="skip" href="#main">${ar ? 'تخطَّ إلى المحتوى' : 'Skip to content'}</a>
<header class="top"><div class="wrap top-in">
  <a class="brand" href="${rel(p, home)}"><img src="${a}logo/${ar ? 'logo-horizontal' : 'logo-horizontal-en'}.svg" alt="Nile Therapy${ar ? ' - نايل ثيرابي' : ''}" width="214" height="52"></a>
  <nav class="nav" id="nav" aria-label="${t.menu}">${nav.map(([u, l]) => `<a href="${rel(p, u)}"${u === p ? ' aria-current="page"' : ''}>${l}</a>`).join('')}
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
    <a class="btn book foot-book" href="${rel(p, book)}" data-track="book:footer">${t.book}</a></div>
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
    founder: FOUNDERS.map(f => ({ '@type': 'Person', name: f.en.name, alternateName: f.ar.name, jobTitle: f.en.spec })),
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
const govOptions = lang => GOVERNORATES.map(([e, a]) => `<option value="${e}">${lang === 'ar' ? a : e}</option>`).join('');

function hero(p, lang) {
  const { t, ar, book, r } = L(p, lang);
  return `<section class="hero"><div class="wrap hero-in">
  <div class="hero-text">
    <p class="eyebrow">${ar ? 'شركة النيل للعلاج الطبيعي والرعاية المنزلية' : 'Physiotherapy & home care across Egypt'}</p>
    <h1>${ar ? `علاجك يوصلك <span class="mark">لحد بيتك${squiggle}</span>` : `Physiotherapy that comes <span class="mark">to your home${squiggle}</span>`}</h1>
    <p class="lead">${ar ? 'أطباء علاج طبيعي مرخّصون يزورونك في منزلك، بخطة علاج مخصصة لحالتك ومتابعة مستمرة حتى تتعافى.' : 'Licensed physiotherapists visit you at home, with a treatment plan built around you and follow-up until you recover.'}</p>
    <form class="quick card" id="quick" data-book="${r(book)}" novalidate>
      <p class="quick-title">${ar ? 'احجز في أقل من دقيقة' : 'Book in under a minute'}</p>
      <div class="quick-fields">
        <label><span class="sr">${ar ? 'الاسم' : 'Name'}</span><input type="text" name="name" autocomplete="name" placeholder="${ar ? 'الاسم' : 'Your name'}" dir="auto" maxlength="120"></label>
        <label><span class="sr">${ar ? 'رقم الموبايل' : 'Mobile number'}</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="${ar ? 'رقم الموبايل' : 'Mobile number'}" dir="ltr" maxlength="20"></label>
        <label><span class="sr">${ar ? 'المحافظة' : 'Governorate'}</span><select name="governorate"><option value="">${ar ? 'المحافظة' : 'Governorate'}</option>${govOptions(lang)}</select></label>
        <button class="btn book" type="submit" data-track="book:hero-form">${ar ? 'ابدأ الحجز' : 'Start booking'} ${icon('arrow', 'flip')}</button>
      </div>
    </form>
    <ul class="ticks"><li>${icon('shield')}${ar ? 'أطباء مرخّصون' : 'Licensed physiotherapists'}</li><li>${icon('home')}${ar ? 'في منزلك' : 'At your home'}</li><li>${icon('cash')}${t.payNote}</li></ul>
  </div>
  <div class="hero-art">${egyptArt(lang)}</div>
</div></section>`;
}
function stats(lang) {
  const ar = lang === 'ar';
  const s = ar ? [['23+', 'شريك نجاح من مستشفيات وعيادات وأندية'], ['15', 'مدينة نخدمها'], ['6', 'تخصصات علاج طبيعي'], ['★ 5.0', 'تقييم مرضانا']]
    : [['23+', 'partner hospitals, clinics and clubs'], ['15', 'cities served'], ['6', 'physiotherapy specialties'], ['★ 5.0', 'patient rating']];
  return `<section class="stats-band"><div class="wrap stats-in">${s.map(([n, l]) => `<p><b><bdi dir="ltr">${n}</bdi></b><span>${l}</span></p>`).join('')}</div></section>`;
}
function specialtyList(p, lang) {
  const { ar, r } = L(p, lang);
  return `<section class="sec" id="services"><div class="wrap">
  <div class="sec-head split-head"><h2>${ar ? 'كل ما تحتاجه من علاج طبيعي، في بيتك' : 'Every kind of physiotherapy, at home'}</h2><p>${ar ? 'اكتشف خدمات العلاج الطبيعي الشاملة التي نقدمها والمصممة لتعزيز التعافي والصحة.' : 'Complete physiotherapy services designed to support recovery and health.'}</p></div>
  <ul class="spec-list">${SPEC_PAGES.map(s => { const sp = SPECIALTIES.find(x => x.icon === s.icon)[lang]; return `<li><a href="${r(s[lang])}">
    <span class="spec-ic">${icon(s.icon)}</span><span class="spec-tx"><b>${sp[0]}</b><span>${sp[1].split(/[.،]/)[0]}.</span></span>${icon('arrow', 'go flip')}</a></li>`; }).join('')}</ul>
</div></section>`;
}
function timeline(lang) {
  const ar = lang === 'ar';
  const s = ar ? [['احجز أونلاين', 'نموذج قصير أو رسالة واتساب.'], ['نتصل بك', 'نؤكد الموعد ونفهم حالتك.'], ['الأخصائي يزورك', 'أقرب أخصائي مرخّص يأتي لمنزلك.'], ['ادفع بعد الجلسة', 'نقداً، بدون أي دفع أونلاين.']]
    : [['Book online', 'A short form or a WhatsApp message.'], ['We call you', 'We confirm the time and understand your case.'], ['Your physio visits', 'The nearest licensed physiotherapist comes to you.'], ['Pay after', 'Cash after the session, nothing online.']];
  return `<section class="sec tint">${waveTop('to-tint')}<div class="wrap"><div class="sec-head"><h2>${ar ? 'كيف تحجز؟' : 'How it works'}</h2></div>
  <div class="river"><svg class="river-line" viewBox="0 0 1000 80" preserveAspectRatio="none" aria-hidden="true"><path d="M0 40 C 125 5 250 75 375 40 S 625 5 750 40 S 925 70 1000 40"/></svg>
  <ol class="steps">${s.map(([h, d], i) => `<li><span class="n">${i + 1}</span><h3>${h}</h3><p>${d}</p></li>`).join('')}</ol></div></div></section>`;
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
    <a class="btn book block" href="${r(book)}?service=${s.key}" data-track="book:price-${s.key}">${t.bookThis}</a>
    ${ar ? `<a class="more" href="${r(s.path)}">${t.more} ${icon('arrow', 'flip')}</a>` : ''}</article>`).join('')}</div>
  <p class="pay-note">${icon('cash')}${t.payNote}</p>
</div></section>`;
}
function founders(lang, heading = true) {
  const ar = lang === 'ar';
  return `<section class="sec"><div class="wrap">
  ${heading ? `<div class="sec-head"><h2>${ar ? 'المؤسسون' : 'Meet the founders'}</h2><p>${ar ? 'أطباء علاج طبيعي أسّسوا Nile Therapy ليصل العلاج المتخصص إلى كل بيت في مصر.' : 'Physiotherapists who founded Nile Therapy to bring specialist care into every home in Egypt.'}</p></div>` : ''}
  <div class="founders">${FOUNDERS.map(f => `<article class="founder">
    <div class="mono" aria-hidden="true"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" class="mono-ring"/><g class="mono-lotus" transform="translate(30 4) scale(.4)">${LOTUS}</g></svg><span>${ar ? f.initial : f.initialEn}</span></div>
    <h3>${f[lang].name}</h3><p class="role">${f[lang].role}</p><p class="spec">${f[lang].spec}</p></article>`).join('')}</div>
</div></section>`;
}
function quote(lang) {
  const q = TESTIMONIAL[lang];
  return `<section class="sec tint">${waveTop('to-tint')}<div class="wrap narrow"><figure class="quote"><svg class="qmark" viewBox="0 0 60 48" aria-hidden="true"><path d="M0 48V28C0 12 8 3 24 0l3 6C17 9 13 15 13 24h12v24Zm33 0V28C33 12 41 3 57 0l3 6c-10 3-14 9-14 18h12v24Z"/></svg>
  <blockquote>${q.quote}</blockquote><figcaption><span class="stars" role="img" aria-label="5/5">★★★★★</span> ${q.who}</figcaption></figure></div></section>`;
}
function faq(lang) {
  const ar = lang === 'ar';
  return `<section class="sec"><div class="wrap narrow"><div class="sec-head"><h2>${ar ? 'أسئلة شائعة' : 'Questions people ask'}</h2></div>
  <div class="faq">${FAQ[lang].map(([q, a]) => `<details><summary>${q}${icon('plus')}</summary><p>${a}</p></details>`).join('')}</div></div></section>`;
}
function articleCards(p, lang, items) {
  const { t, r } = L(p, lang);
  return `<div class="posts">${items.map(x => `<article class="post"><div class="post-img">${pic(x.img, '', { sizes: '(max-width: 760px) 100vw, 33vw' })}</div>
    <div class="post-body"><p class="tag">${x.tag}</p><h3><a href="${r(x.path)}">${x.title}</a></h3><p>${x.lead}</p><a class="more" href="${r(x.path)}">${t.read} ${icon('arrow', 'flip')}</a></div></article>`).join('')}</div>`;
}
function ctaBand(p, lang) {
  const { t, ar, book, r } = L(p, lang);
  return `<section class="band"><div class="wrap band-in"><div><h2>${ar ? 'خطوتك الأولى نحو التعافي تبدأ اليوم' : 'Your recovery can start this week'}</h2><p>${ar ? 'خطوتك الأولى اليوم قد تكون الفارق في تعافيك غدًا — لا تؤجل قرار فى صحتك.' : 'Your first step today can make the difference in your recovery tomorrow.'}</p></div>
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
  return `<section class="sec"><div class="wrap about">
  <div class="about-main"><p class="eyebrow">${ar ? 'من نحن' : 'About us'}</p><h2>${ar ? 'شركة النيل للعلاج الطبيعى' : 'About Nile Therapy'}</h2>${paras.map(x => `<p>${x}</p>`).join('')}</div>
  <aside class="mission"><svg viewBox="0 0 100 100" aria-hidden="true" class="mission-lotus">${LOTUS}</svg><p class="eyebrow">${ar ? 'رسالتنا' : 'Our mission'}</p>
    <p>${ar ? 'إننا نخلي العلاج والتأهيل أسهل في الوصول، معتمد على المتابعة والبيانات، ومتمحور حوالين المريض، ونغيّر مفهوم التعافي في مصر.' : 'To make treatment and rehabilitation easier to reach, data-driven and patient-centred, and to change what recovery means in Egypt.'}</p>
    <p class="sign">${ar ? '— العلاج يوصل لحد باب بيتك.' : '— Care that comes to your door.'}</p></aside>
</div></section>`;
}
function partners(lang) {
  const ar = lang === 'ar';
  return `<section class="sec"><div class="wrap partner">
  <div><h2>${ar ? 'الشراكات و التعاون' : 'Partnerships'}</h2><p>${ar ? 'نعمل في Nile Therapy على بناء شراكات فعّالة مع المستشفيات والعيادات والأندية الرياضية و الشركات لتقديم خدمات علاج طبيعي و رعاية منزلية تتمحور حول احتياجات المريض. نعتمد في جميع برامجنا العلاجية على المعايير الدولية والممارسات القائمة على الأدلة العلمية.' : 'We partner with hospitals, clinics, sports clubs and companies to deliver patient-centred physiotherapy and home care, following international standards and evidence-based practice.'}</p></div>
  <a class="btn ghost" href="mailto:${CONTACT.email}">${ar ? 'أنضم لنا' : 'Partner with us'}</a></div></section>`;
}
const pageHead = (h1, lead, crumbs = '') => `<section class="page-head"><div class="wrap narrow">${crumbs}<h1>${h1}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}</div></section>`;

// ---------- booking form ----------
function bookingForm(lang) {
  const ar = lang === 'ar';
  const f = ar ? { name: 'الاسم بالكامل', phone: 'رقم الموبايل (واتساب إن أمكن)', gov: 'المحافظة', addr: 'العنوان أو المنطقة', addrPh: 'مثال: مدينة نصر، شارع مكرم عبيد', loc: 'شارك موقعك (اختياري)', locBtn: 'استخدم موقعي الحالي', locHelp: 'يساعدنا نرسل لك أقرب أخصائي. أو الصق رابط موقعك من خرائط جوجل.', service: 'الخدمة', choose: 'اختر…', other: 'أخرى / غير متأكد', date: 'اليوم المفضّل', time: 'الوقت المفضّل', morning: 'صباحاً', afternoon: 'بعد الظهر', evening: 'مساءً', any: 'أي وقت', complaint: 'الشكوى أو الحالة', complaintPh: 'مثال: ألم في الرقبة منذ شهر، أو تأهيل بعد عملية ركبة', consent: 'أوافق على أن تحتفظ Nile Therapy ببياناتي لتنظيم الجلسات والتواصل معي.', send: 'إرسال طلب الحجز', note: 'سنتواصل معك لتأكيد الموعد. الدفع نقداً بعد الجلسة.', s1: 'بياناتك', s2: 'تفاصيل الزيارة', req: 'مطلوب' }
    : { name: 'Full name', phone: 'Mobile number (WhatsApp if possible)', gov: 'Governorate', addr: 'Address or area', addrPh: 'e.g. Nasr City, Makram Ebeid St.', loc: 'Share your location (optional)', locBtn: 'Use my current location', locHelp: 'Helps us send the nearest physiotherapist. Or paste a Google Maps link.', service: 'Service', choose: 'Choose…', other: 'Other / not sure', date: 'Preferred day', time: 'Preferred time', morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', any: 'Any time', complaint: 'Complaint or condition', complaintPh: 'e.g. neck pain for a month, or rehab after knee surgery', consent: 'I agree that Nile Therapy keeps my details to arrange sessions and contact me.', send: 'Send booking request', note: "We'll call you to confirm. Pay cash after the session.", s1: 'Your details', s2: 'About the visit', req: 'required' };
  const star = `<span class="req" aria-hidden="true">*</span>`;
  return `<form class="card booking" id="booking" novalidate data-lang="${lang}" aria-describedby="booking-err">
  <p class="step-label"><span>1</span>${f.s1}</p>
  <div class="grid2"><label class="field"><span>${f.name}${star}</span><input type="text" name="name" autocomplete="name" required maxlength="120" dir="auto"></label>
    <label class="field"><span>${f.phone}${star}</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" required maxlength="20" dir="ltr" placeholder="01x xxxx xxxx"></label></div>
  <div class="grid2"><label class="field"><span>${f.gov}${star}</span><select name="governorate" required><option value="">${f.choose}</option>${govOptions(lang)}</select></label>
    <label class="field"><span>${f.addr}${star}</span><input type="text" name="address" maxlength="300" dir="auto" placeholder="${f.addrPh}" required autocomplete="address-line1"></label></div>
  <p class="step-label"><span>2</span>${f.s2}</p>
  <div class="field"><span>${f.loc}</span><div class="loc-row"><button type="button" class="btn ghost sm" data-here>${icon('pin')}${f.locBtn}</button><input name="map_link" type="url" dir="ltr" inputmode="url" maxlength="500" placeholder="https://maps.app.goo.gl/…" aria-label="${f.loc}"></div><small>${f.locHelp}</small><input type="hidden" name="lat"><input type="hidden" name="lng"></div>
  <label class="field"><span>${f.service}</span><select name="service"><option value="">${f.choose}</option>${SERVICES.map(s => `<option value="${s.key}">${s[lang].name} — ${s.price} ${T[lang].egp}</option>`).join('')}<option value="other">${f.other}</option></select></label>
  <div class="grid2"><label class="field"><span>${f.date}${star}</span><input name="date" type="date" required></label>
    <label class="field"><span>${f.time}</span><select name="slot"><option value="any">${f.any}</option><option value="morning">${f.morning}</option><option value="afternoon">${f.afternoon}</option><option value="evening">${f.evening}</option></select></label></div>
  <label class="field"><span>${f.complaint}</span><textarea name="complaint" maxlength="1000" dir="auto" rows="3" placeholder="${f.complaintPh}"></textarea></label>
  <label class="hp" aria-hidden="true">Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label>
  <label class="consent"><input type="checkbox" name="consent" required> <span>${f.consent}</span></label>
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

const homeBody = lang => p => hero(p, lang) + stats(lang) + specialtyList(p, lang) + timeline(lang) + priceStrip(p, lang) + founders(lang) + quote(lang) + faq(lang)
  + `<section class="sec"><div class="wrap"><div class="sec-head split-head"><h2>${lang === 'ar' ? 'من مقالاتنا' : 'From our articles'}</h2><a class="more" href="${rel(p, lang === 'ar' ? '/almqalat' : '/en/resources')}">${lang === 'ar' ? 'كل المقالات' : 'All articles'} ${icon('arrow', 'flip')}</a></div>${articleCards(p, lang, (lang === 'ar' ? arArticleList : enArticleList).slice(0, 3))}</div></section>`
  + ctaBand(p, lang);
add({ path: '/', lang: 'ar', pair: '/en', title: 'Nile Therapy | العلاج الطبيعي في المنزل - شركة النيل للعلاج الطبيعي', ld: [faqLd('ar')],
  description: 'Nile Therapy (شركة النيل للعلاج الطبيعي): علاج طبيعي ورعاية منزلية في كل أنحاء مصر، للمخ والأعصاب والعظام وما بعد العمليات. احجز جلستك في منزلك.',
  body: homeBody('ar') });
add({ path: '/en', lang: 'en', pair: '/', title: 'Nile Therapy | Expert Physiotherapy at Home in Egypt', ld: [faqLd('en')],
  description: 'Licensed physiotherapists at your home across Egypt: neuro rehab, orthopedics, recovery after surgery and sports injuries. Book online, pay after the session.',
  body: homeBody('en') });

add({ path: '/mn-nhn', lang: 'ar', pair: '/en/about', title: 'من نحن | Nile Therapy - شركة النيل للعلاج الطبيعي',
  description: 'Nile Therapy وكالة متخصصة في العلاج الطبيعي والرعاية المنزلية، أسسها أطباء علاج طبيعي، وتربط المرضى بأخصائيين مرخّصين في كل أنحاء مصر.',
  body: p => pageHead('من نحن', 'شركة النيل للعلاج الطبيعي والرعاية المنزلية — العلاج يوصل لحد باب بيتك.') + aboutText('ar') + stats('ar') + founders('ar') + timeline('ar') + partners('ar') + ctaBand(p, 'ar') });
add({ path: '/en/about', lang: 'en', pair: '/mn-nhn', title: 'About Nile Therapy | Physiotherapy & Home Care in Egypt',
  description: 'Nile Therapy is a physiotherapy and home-care agency founded by physiotherapists, connecting patients with licensed physiotherapists across Egypt.',
  body: p => pageHead('About Nile Therapy', 'Physiotherapy and advanced home care: treatment that comes to your door.') + aboutText('en') + stats('en') + founders('en') + timeline('en') + partners('en') + ctaBand(p, 'en') });

const reviewsBody = lang => p => pageHead(lang === 'ar' ? 'آراء المرضى' : 'Patient testimonials', lang === 'ar' ? 'تجارب حقيقية من مرضى تعافوا معنا.' : 'Real experiences from patients who recovered with us.') + quote(lang)
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
  body: p => pageHead('الخدمات والأسعار', 'أسعار واضحة للجلسة في منزلك. احجز أونلاين وادفع نقداً بعد الجلسة.') + priceStrip(p, 'ar', { heading: false }) + specialtyList(p, 'ar') + faq('ar') + ctaBand(p, 'ar'), ld: [faqLd('ar')] });
for (const s of SERVICES) add({ path: s.path, lang: 'ar', title: `${s.ar.name} | Nile Therapy`, description: (s.ar.lead + '. الدفع نقداً بعد الجلسة.').slice(0, 158),
  ld: [serviceLd(s, 'ar'), crumbLd([['الخدمات والأسعار', '/online-store'], [s.ar.name, s.path]])],
  body: p => `<section class="page-head"><div class="wrap service-in"><div><p class="crumbs"><a href="${rel(p, '/online-store')}">الخدمات والأسعار</a></p><h1>${s.ar.name}</h1><p class="lead">${s.ar.lead}</p></div>
    <div class="price-box"><p class="amount"><b>${s.price}</b> ج.م</p><p class="meta"><span>${icon('clock')}${s.minutes} دقيقة</span><span>${icon('home')}فى منزلك</span></p>
    <a class="btn book lg block" href="${rel(p, '/hjz-almwaayd')}?service=${s.key}" data-track="book:service-${s.key}">${icon('cal')}احجز الان</a><p class="small muted">الدفع نقداً بعد الجلسة</p></div></div></section>
  <section class="sec"><div class="wrap narrow prose">${s.ar.body.map(x => `<p>${x}</p>`).join('')}</div></section>` + timeline('ar') + faq('ar') + ctaBand(p, 'ar') });

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
    </div></section>` + timeline(lang) + priceStrip(p, lang) + faq(lang) + ctaBand(p, lang) });
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
    `<p class="narrow">وقال الإمام ابن سينا: «الطِّبُّ علمٌ يُعرَفُ به أحوالُ بدنِ الإنسان، من حيثُ ما يَصحُّ ويَمرضُ، حفظًا للصِّحة، واستردادًا لها عند زوالها.» نلتزم في Nile Therapy بتقديم مقالات طبية موثوقة قائمة على الدليل العلمي، إلى جانب آخر الأخبار والشراكات.</p><div class="tabs"><a class="chip" href="almqalat-altbyh">المقالات الطبية</a><a class="chip" href="akhr-alakhbar">أخر الأخبار</a></div>`) });
add({ path: '/almqalat-altbyh', lang: 'ar', title: 'المقالات الطبية | Nile Therapy', description: 'مقالات طبية عن آلام الرقبة والظهر، التأهيل بعد تغيير الركبة، وتأهيل الجلطات في المنزل، مبنية على أحدث الممارسات، من Nile Therapy.',
  body: listBody('ar', 'المقالات الطبية', 'معرفة طبية موثوقة تساعدك تفهم حالتك وتتعافى بشكل أفضل.', arArticleList) });
add({ path: '/akhr-alakhbar', lang: 'ar', title: 'أخر الأخبار | Nile Therapy', description: 'آخر أخبار Nile Therapy: الشراكات الطبية، الإنجازات، وأخبار أطبائنا وخبرائنا في العلاج الطبيعي.',
  body: p => pageHead('أخر الأخبار', 'آخر الشراكات الطبية والإنجازات وأخبار فريقنا.') + `<section class="sec"><div class="wrap narrow center"><p>ننشر أخبارنا أولاً بأول على صفحاتنا. تابعنا على <a href="${CONTACT.facebook}" rel="noopener" target="_blank">فيسبوك</a> و<a href="${CONTACT.instagram}" rel="noopener" target="_blank">إنستجرام</a> و<a href="${CONTACT.tiktok}" rel="noopener" target="_blank">تيك توك</a>.</p></div></section>` + ctaBand(p, 'ar') });
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
