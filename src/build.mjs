// Builds niletherapy.org into dist/. Every page keeps its OLD URL (see inventory/seo.json).
//   node src/build.mjs            -> production (indexable)
//   NT_STAGING=1 node src/build.mjs -> staging (noindex on every page)
import fs from 'fs';
import path from 'path';
import { SITE, CONTACT, GA, SERVICES, SPECIALTIES, TESTIMONIAL, GOVERNORATES, NECK } from './content.mjs';

const ROOT = path.resolve(path.dirname(decodeURIComponent(new URL(import.meta.url).pathname).replace(/^\/(\w:)/, '$1')), '..');
const DIST = path.join(ROOT, 'dist');
const STAGING = process.env.NT_STAGING === '1';
const BASE = process.env.NT_BASE || '/'; // where the site lives ('/nile-site/' on staging): only used by 404.html
const VER = (process.env.GITHUB_SHA || String(Date.now())).slice(0, 8);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------- links (relative, so staging under /nile-site/ works too) ----------
const depth = p => (p.startsWith('/en/') ? 1 : 0);
const rel = (from, to) => {
  const [p, hash = ''] = to.split('#'); const b = depth(from) ? '../' : '';
  const t = p === '/' ? (b || './') : b + p.replace(/^\//, '');
  return t + (hash ? '#' + hash : '');
};
const A = from => (depth(from) ? '../' : '') + 'assets/';
const fileFor = p => (p === '/' ? 'index.html' : p.replace(/^\//, '') + '.html');

// ---------- text ----------
const T = {
  ar: { home: 'الرئيسية', services: 'الخدمات والأسعار', articles: 'المقالات', about: 'من نحن', reviews: 'آراء المرضى', book: 'احجز الآن', other: 'English', otherLang: 'en',
    menu: 'القائمة', wa: 'واتساب', call: 'اتصل بنا', egp: 'ج.م', min: 'دقيقة', atHome: 'في منزلك', bookThis: 'احجز هذه الخدمة', more: 'التفاصيل',
    payNote: 'الدفع نقداً بعد الجلسة', tagline: 'شريكك الموثوق في رحلة العلاج الطبيعي.', rights: 'جميع الحقوق محفوظة لشركة النيل للعلاج الطبيعي', follow: 'تابعنا', contact: 'تواصل معنا', news: 'أخر الأخبار', medical: 'المقالات الطبية', read: 'اقرأ المقال', minsRead: 'دقائق قراءة' },
  en: { home: 'Home', services: 'Services', articles: 'Resources', about: 'About', reviews: 'Testimonials', book: 'Book now', other: 'العربية', otherLang: 'ar',
    menu: 'Menu', wa: 'WhatsApp', call: 'Call us', egp: 'EGP', min: 'min', atHome: 'At your home', bookThis: 'Book this service', more: 'Details',
    payNote: 'Pay cash after the session', tagline: 'Your trusted partner on your physiotherapy journey.', rights: 'All rights reserved, Nile Therapy', follow: 'Follow us', contact: 'Contact', news: 'News', medical: 'Medical articles', read: 'Read article', minsRead: 'min read' },
};

// ---------- small icons (inline SVG, stroke style) ----------
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
  cash: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>', star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9Z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  fb: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v7h4v-7h3l1-4h-4V8Z"/>', ig: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>',
  tt: '<path d="M14 3v11a3.5 3.5 0 1 1-3-3.5"/><path d="M14 3c.5 3 2.5 4.5 5 4.5"/>',
};
const icon = (n, c = '') => `<svg class="ic ${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;

// ---------- layout ----------
function page(pg) {
  const { path: p, lang, title, description, pair } = pg;
  const t = T[lang], ar = lang === 'ar', a = A(p);
  const home = ar ? '/' : '/en', book = ar ? '/hjz-almwaayd' : '/en/book';
  const nav = ar
    ? [['/', t.home], ['/online-store', t.services], ['/almqalat', t.articles], ['/mn-nhn', t.about], ['/testimonials', t.reviews]]
    : [['/en', t.home], ['/en#services', t.services], ['/en/resources', t.articles], ['/en/about', t.about], ['/en/testimonials', t.reviews]];
  const alt = pair ? [[lang, p], [t.otherLang, pair]] : [];
  const ld = [orgLd(lang), ...(pg.ld || [])];
  const waText = encodeURIComponent(ar ? 'مرحباً، أريد حجز جلسة علاج طبيعي' : 'Hello, I would like to book a physiotherapy session');
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
  <a class="brand" href="${rel(p, home)}" aria-label="Nile Therapy"><img src="${a}logo/${ar ? 'logo-horizontal' : 'logo-horizontal-en'}.svg" alt="Nile Therapy${ar ? ' - نايل ثيرابي' : ''}" width="${ar ? 214 : 214}" height="${ar ? 52 : 52}"></a>
  <nav class="nav" id="nav" aria-label="${t.menu}">${nav.map(([u, l]) => `<a href="${rel(p, u)}"${u === p ? ' aria-current="page"' : ''}>${l}</a>`).join('')}
    <a class="lang" href="${rel(p, pair || (ar ? '/en' : '/'))}" hreflang="${t.otherLang}" lang="${t.otherLang}">${t.other}</a></nav>
  <a class="btn sm book-top" href="${rel(p, book)}">${t.book}</a>
  <button class="menu" type="button" aria-expanded="false" aria-controls="nav" aria-label="${t.menu}">${icon('menu')}</button>
</div></header>
<main id="main">
${pg.body.replace(/\{A\}/g, a)}
</main>
<footer class="foot"><div class="wrap foot-in">
  <div><img src="${a}logo/logo-horizontal-white.svg" alt="Nile Therapy" width="214" height="52" loading="lazy"><p>${t.tagline}</p>
    <p class="social"><a href="${CONTACT.facebook}" rel="noopener" target="_blank" aria-label="Facebook">${icon('fb')}</a><a href="${CONTACT.instagram}" rel="noopener" target="_blank" aria-label="Instagram">${icon('ig')}</a><a href="${CONTACT.tiktok}" rel="noopener" target="_blank" aria-label="TikTok">${icon('tt')}</a></p></div>
  <div><h2>${t.contact}</h2><ul class="contact">
    <li>${icon('phone')}<a href="tel:${CONTACT.phone}" dir="ltr">${CONTACT.phoneShow}</a></li>
    <li>${icon('wa')}<a href="https://wa.me/${CONTACT.wa}?text=${waText}" rel="noopener" target="_blank">${t.wa}</a></li>
    <li>${icon('mail')}<a href="mailto:${CONTACT.email}">${CONTACT.email}</a></li></ul></div>
  <div><h2>${ar ? 'روابط' : 'Links'}</h2><ul class="links">${nav.map(([u, l]) => `<li><a href="${rel(p, u)}">${l}</a></li>`).join('')}<li><a href="${rel(p, book)}">${t.book}</a></li></ul></div>
</div><p class="wrap copy">© ${new Date().getFullYear()} Nile Therapy · ${t.rights}</p></footer>
<a class="wa-float" href="https://wa.me/${CONTACT.wa}?text=${waText}" rel="noopener" target="_blank" aria-label="${t.wa}">${icon('wa')}</a>
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
    sameAs: [CONTACT.facebook, CONTACT.instagram, CONTACT.tiktok] };
}
const serviceLd = (s, lang) => ({ '@context': 'https://schema.org', '@type': 'Service', name: s[lang].name, description: s[lang].lead, serviceType: 'Physiotherapy',
  provider: { '@id': SITE + '/#org' }, areaServed: { '@type': 'Country', name: 'Egypt' }, url: SITE + s.path,
  offers: { '@type': 'Offer', price: s.price, priceCurrency: 'EGP', availability: 'https://schema.org/InStock' } });
const articleLd = (a, url, lang) => ({ '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.lead, inLanguage: lang,
  datePublished: NECK.date, dateModified: '2026-11-23', image: SITE + '/assets/img/posture-desk.jpg', mainEntityOfPage: SITE + url,
  author: { '@id': SITE + '/#org' }, publisher: { '@id': SITE + '/#org' } });

// ---------- sections ----------
const L = (p, lang) => ({ t: T[lang], ar: lang === 'ar', book: lang === 'ar' ? '/hjz-almwaayd' : '/en/book', r: to => rel(p, to) });
function hero(p, lang) {
  const { t, ar, book, r } = L(p, lang);
  const wa = `https://wa.me/${CONTACT.wa}?text=${encodeURIComponent(ar ? 'مرحباً، أريد حجز جلسة علاج طبيعي' : 'Hello, I would like to book a physiotherapy session')}`;
  return `<section class="hero"><div class="wrap hero-in">
  <div class="hero-text">
    <p class="eyebrow">${ar ? 'مع شركة النيل للعلاج الطبيعي والرعاية المنزلية الفائقة' : 'Physiotherapy & advanced home care across Egypt'}</p>
    <h1>${ar ? 'خدمات علاج متكاملة تنتظرك!' : 'Expert physiotherapy, at your home'}</h1>
    <p class="lead">${ar ? 'علاجك يوصلك لحد بيتك. رعاية احترافية مع خطط علاجية مخصصة لرحلتك فى التعافي ولحياة افضل و اكثر صحة.' : 'Your treatment comes to your door: professional care and a personal plan for your recovery and a healthier life.'}</p>
    <div class="cta-row"><a class="btn lg" href="${r(book)}">${t.book}</a><a class="btn lg ghost" href="${wa}" rel="noopener" target="_blank">${icon('wa')}${t.wa}</a></div>
    <ul class="trust"><li><b><bdi dir="ltr">23+</bdi></b><span>${ar ? 'شركاء النجاح' : 'partners'}</span></li><li><b>15</b><span>${ar ? 'مدينة' : 'cities'}</span></li><li><b>★ 5.0</b><span>${ar ? 'تقييم المرضى' : 'patient rating'}</span></li></ul>
  </div>
  <div class="hero-art" aria-hidden="true"><div class="hero-blob"><img src="{A}logo/mark.svg" alt="" width="260" height="260"></div>
    <div class="hero-card c1">${icon('home')}<span>${ar ? 'زيارات منزلية' : 'Home visits'}</span></div>
    <div class="hero-card c2">${icon('check')}<span>${ar ? 'أخصائيون مرخّصون' : 'Licensed physios'}</span></div>
    <div class="hero-card c3">${icon('cash')}<span>${t.payNote}</span></div></div>
</div></section>`;
}
function specialties(p, lang) {
  const ar = lang === 'ar';
  return `<section class="sec" id="services"><div class="wrap">
  <div class="sec-head"><h2>${ar ? 'الخدمات' : 'What we treat'}</h2><p>${ar ? 'اكتشف خدمات العلاج الطبيعي الشاملة التي نقدمها والمصممة لتعزيز التعافي والصحة.' : 'Complete physiotherapy services designed to support recovery and health.'}</p></div>
  <div class="grid3">${SPECIALTIES.map(s => `<article class="card spec">${icon(s.icon, 'big')}<h3>${s[lang][0]}</h3><p>${s[lang][1]}</p></article>`).join('')}</div>
</div></section>`;
}
function priceCards(p, lang, { heading = true } = {}) {
  const { t, ar, book, r } = L(p, lang);
  return `<section class="sec tint"><div class="wrap">
  ${heading ? `<div class="sec-head"><h2>${t.services}</h2><p>${ar ? 'احجز أونلاين وادفع نقداً بعد الجلسة. الأسعار للجلسة في منزلك.' : 'Book online and pay cash after the session. Prices are per session at your home.'}</p></div>` : ''}
  <div class="grid3">${SERVICES.map(s => `<article class="card price">
    <img src="{A}img/${s.img}" alt="" loading="lazy" width="600" height="360">
    <div class="price-body"><h3>${ar ? `<a href="${r(s.path)}">${s.ar.name}</a>` : s.en.name}</h3><p>${s[lang].short}</p>
    <p class="meta"><span>${icon('clock')}${s.minutes} ${t.min}</span><span>${icon('home')}${t.atHome}</span></p>
    <p class="amount"><b>${s.price}</b> ${t.egp}</p>
    <div class="row">${ar ? `<a class="btn ghost sm" href="${r(s.path)}">${t.more}</a>` : ''}<a class="btn sm" href="${r(book)}?service=${s.key}">${t.bookThis}</a></div></div></article>`).join('')}</div>
</div></section>`;
}
function steps(p, lang) {
  const ar = lang === 'ar';
  const s = ar ? [['احجز أونلاين', 'املأ نموذج الحجز في دقيقة.'], ['نتواصل معك', 'نؤكد الموعد ونفهم حالتك.'], ['الأخصائي يزورك', 'أقرب أخصائي مرخّص يأتي لمنزلك.'], ['ادفع بعد الجلسة', 'الدفع نقداً، بدون أي دفع أونلاين.']]
    : [['Book online', 'Fill in the booking form in a minute.'], ['We call you', 'We confirm the time and understand your case.'], ['Your physio visits', 'The nearest licensed physiotherapist comes to you.'], ['Pay after', 'Cash after the session; nothing to pay online.']];
  return `<section class="sec"><div class="wrap"><div class="sec-head"><h2>${ar ? 'كيف تحجز؟' : 'How it works'}</h2></div>
  <ol class="steps">${s.map(([h, d], i) => `<li><span class="n">${i + 1}</span><h3>${h}</h3><p>${d}</p></li>`).join('')}</ol></div></section>`;
}
function about(p, lang, full = false) {
  const ar = lang === 'ar';
  const paras = ar ? ['هي وكالة متخصصة في العلاج الطبيعي والرعاية المنزلية، بتربط المرضى بأطباء علاج طبيعي مرخّصين وكوادر طبية مؤهلة في كل أنحاء مصر. بنقدّم خدمات تأهيل وعلاج بجودة عالية جوه بيتك، علشان نوفرلك الراحة والأمان ونساعدك تشوف تحسّن حقيقي وملموس في حالتك.',
    'نظام الرعاية المنزلية المتكامل بتاعنا بيجمع بين العلاج الطبيعي، والتمريض، واستخدام أحدث التقنيات الطبية، علشان نوفّر مستوى رعاية قريب من المستشفى لكن في بيتك. سواء تأهيل إصابات المخ والأعصاب، مشاكل العظام، التعافي بعد العمليات، أو رعاية كبار السن — كل برنامج بيتصمم مخصوص على حسب حالة كل مريض واحتياجاته.',
    'من خلال شبكة متنامية من أخصائيين معتمدين، وإشراف طبي مستمر، ومنسقين ميدانيين، بنضمنلك خدمة احترافية، متابعة مستمرة، واهتمام إنساني حقيقي.']
    : ['Nile Therapy is a physiotherapy and home-care agency that connects patients with licensed physiotherapists and qualified medical staff across Egypt. We bring high-quality treatment and rehabilitation into your home, for comfort, safety and real, measurable progress.',
      'Our integrated home-care system combines physiotherapy, nursing and modern medical technology to bring near-hospital care to your home: neuro rehabilitation, orthopedic problems, recovery after surgery or elderly care, each program designed around the patient.',
      'Through a growing network of accredited specialists, continuous medical supervision and field coordinators, we guarantee professional service, ongoing follow-up and genuine human care.'];
  return `<section class="sec"><div class="wrap split">
  <div><h2>${ar ? 'عن شركة النيل للعلاج الطبيعى' : 'About Nile Therapy'}</h2>${paras.map(x => `<p>${x}</p>`).join('')}
    <p class="mission"><b>${ar ? 'رسالتنا' : 'Our mission'}:</b> ${ar ? 'إننا نخلي العلاج والتأهيل أسهل في الوصول، معتمد على المتابعة والبيانات، ومتمحور حوالين المريض، ونغيّر مفهوم التعافي في مصر — العلاج يوصل لحد باب بيتك.' : 'to make treatment and rehabilitation easier to reach, data-driven and patient-centred, and to change what recovery means in Egypt: care that comes to your door.'}</p></div>
  <div class="about-art"><img src="{A}img/neuro.jpg" alt="${ar ? 'أخصائي يراجع صور أشعة المخ' : 'A specialist reviewing brain scans'}" loading="lazy" width="600" height="420">
    ${full ? `<ul class="facts"><li><b><bdi dir="ltr">23+</bdi></b> ${ar ? 'شريك نجاح من مستشفيات وعيادات وأندية' : 'partner hospitals, clinics and clubs'}</li><li><b>15</b> ${ar ? 'مدينة نخدمها' : 'cities served'}</li></ul>` : ''}</div>
</div></section>`;
}
function partners(lang) {
  const ar = lang === 'ar';
  return `<section class="sec tint"><div class="wrap narrow center"><h2>${ar ? 'الشراكات و التعاون' : 'Partnerships'}</h2>
  <p>${ar ? 'نعمل في Nile Therapy على بناء شراكات فعّالة مع المستشفيات والعيادات والأندية الرياضية و الشركات لتقديم خدمات علاج طبيعي و رعاية منزلية تتمحور حول احتياجات المريض. نعتمد في جميع برامجنا العلاجية على المعايير الدولية والممارسات القائمة على الأدلة العلمية لضمان أفضل النتائج الوظيفية.' : 'We partner with hospitals, clinics, sports clubs and companies to deliver patient-centred physiotherapy and home care. All our programs follow international standards and evidence-based practice for the best functional results.'}</p>
  <div class="cta-row center"><a class="btn ghost" href="mailto:${CONTACT.email}">${ar ? 'أنضم لنا' : 'Partner with us'}</a></div></div></section>`;
}
function quote(lang) {
  const q = TESTIMONIAL[lang];
  return `<section class="sec"><div class="wrap narrow"><figure class="quote"><div class="stars" aria-label="5/5">★★★★★</div><blockquote>“${q.quote}”</blockquote><figcaption>— ${q.who}</figcaption></figure></div></section>`;
}
function ctaBand(p, lang) {
  const { t, ar, book, r } = L(p, lang);
  return `<section class="band"><div class="wrap band-in"><div><h2>${ar ? 'تواصل معنا!' : 'Ready to start?'}</h2><p>${ar ? 'خطوتك الأولى اليوم قد تكون الفارق في تعافيك غدًا — لا تؤجل قرار فى صحتك.' : 'Your first step today can make the difference in your recovery tomorrow.'}</p></div>
  <div class="cta-row"><a class="btn lg light" href="${r(book)}">${t.book}</a><a class="btn lg ghost-light" href="tel:${CONTACT.phone}">${icon('phone')}${t.call}</a></div></div></section>`;
}
function articleCards(p, lang, items) {
  const { t, r } = L(p, lang);
  return `<div class="grid3">${items.map(x => `<article class="card post"><img src="{A}img/${x.img}" alt="" loading="lazy" width="600" height="360"><div class="price-body"><p class="tag">${x.tag}</p><h3><a href="${r(x.path)}">${x.title}</a></h3><p>${x.lead}</p><a class="more" href="${r(x.path)}">${t.read} ${icon('arrow')}</a></div></article>`).join('')}</div>`;
}
const pageHead = (h1, lead, crumbs = '') => `<section class="page-head"><div class="wrap narrow">${crumbs}<h1>${h1}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}</div></section>`;

// ---------- booking form ----------
function bookingForm(lang) {
  const ar = lang === 'ar';
  const f = ar ? { name: 'الاسم بالكامل', phone: 'رقم الموبايل (واتساب إن أمكن)', gov: 'المحافظة', addr: 'العنوان أو المنطقة', addrPh: 'مثال: مدينة نصر، شارع مكرم عبيد', loc: 'شارك موقعك (اختياري)', locBtn: 'استخدم موقعي الحالي', locHelp: 'يساعدنا نرسل لك أقرب أخصائي. أو الصق رابط موقعك من خرائط جوجل.', service: 'الخدمة', choose: 'اختر…', other: 'أخرى / غير متأكد', date: 'اليوم المفضّل', time: 'الوقت المفضّل', morning: 'صباحاً', afternoon: 'بعد الظهر', evening: 'مساءً', any: 'أي وقت', complaint: 'الشكوى أو الحالة', complaintPh: 'مثال: ألم في الرقبة منذ شهر، أو تأهيل بعد عملية ركبة', consent: 'أوافق على أن تحتفظ Nile Therapy ببياناتي لتنظيم الجلسات والتواصل معي.', send: 'إرسال طلب الحجز', note: 'سنتواصل معك لتأكيد الموعد. الدفع نقداً بعد الجلسة.' }
    : { name: 'Full name', phone: 'Mobile number (WhatsApp if possible)', gov: 'Governorate', addr: 'Address or area', addrPh: 'e.g. Nasr City, Makram Ebeid St.', loc: 'Share your location (optional)', locBtn: 'Use my current location', locHelp: 'Helps us send the nearest physiotherapist. Or paste a Google Maps link.', service: 'Service', choose: 'Choose…', other: 'Other / not sure', date: 'Preferred day', time: 'Preferred time', morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', any: 'Any time', complaint: 'Complaint or condition', complaintPh: 'e.g. neck pain for a month, or rehab after knee surgery', consent: 'I agree that Nile Therapy keeps my details to arrange sessions and contact me.', send: 'Send booking request', note: "We'll call you to confirm. Pay cash after the session." };
  return `<form class="card booking" id="booking" novalidate data-lang="${lang}">
  <div class="grid2"><label class="field"><span>${f.name}</span><input name="name" autocomplete="name" required maxlength="120" dir="auto"></label>
    <label class="field"><span>${f.phone}</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" required maxlength="20" dir="ltr" placeholder="01x xxxx xxxx"></label></div>
  <div class="grid2"><label class="field"><span>${f.gov}</span><select name="governorate" required><option value="">${f.choose}</option>${GOVERNORATES.map(([e, a]) => `<option value="${e}">${ar ? a : e}</option>`).join('')}</select></label>
    <label class="field"><span>${f.addr}</span><input name="address" maxlength="300" dir="auto" placeholder="${f.addrPh}" required></label></div>
  <div class="field"><span>${f.loc}</span><div class="loc-row"><button type="button" class="btn ghost sm" data-here>${icon('pin')}${f.locBtn}</button><input name="map_link" type="url" dir="ltr" inputmode="url" maxlength="500" placeholder="https://maps.app.goo.gl/…" aria-label="${f.loc}"></div><small>${f.locHelp}</small><input type="hidden" name="lat"><input type="hidden" name="lng"></div>
  <label class="field"><span>${f.service}</span><select name="service"><option value="">${f.choose}</option>${SERVICES.map(s => `<option value="${s.key}">${s[lang].name} — ${s.price} ${T[lang].egp}</option>`).join('')}<option value="other">${f.other}</option></select></label>
  <div class="grid2"><label class="field"><span>${f.date}</span><input name="date" type="date" required></label>
    <label class="field"><span>${f.time}</span><select name="slot"><option value="any">${f.any}</option><option value="morning">${f.morning}</option><option value="afternoon">${f.afternoon}</option><option value="evening">${f.evening}</option></select></label></div>
  <label class="field"><span>${f.complaint}</span><textarea name="complaint" maxlength="1000" dir="auto" rows="3" placeholder="${f.complaintPh}"></textarea></label>
  <label class="hp" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>
  <label class="consent"><input type="checkbox" name="consent" required> <span>${f.consent}</span></label>
  <p class="form-error" role="alert" hidden></p>
  <button class="btn lg block" type="submit">${f.send}</button>
  <p class="small muted center">${f.note}</p>
</form>
<div class="card done" id="booking-done" hidden tabindex="-1"><div class="done-ic">${icon('check')}</div>
  <h2>${ar ? 'تم استلام طلبك' : 'Request received'}</h2><p>${ar ? 'شكراً لك! سيتواصل معك فريق Nile Therapy قريباً لتأكيد الموعد.' : 'Thank you! The Nile Therapy team will call you soon to confirm.'}</p>
  <p><a class="btn ghost" href="https://wa.me/${CONTACT.wa}" rel="noopener" target="_blank">${icon('wa')}${ar ? 'تواصل عبر واتساب' : 'Message us on WhatsApp'}</a></p></div>`;
}

// ---------- pages ----------
const P = [];
const add = pg => P.push(pg);
const NECK_EN = '/en/enhancing-your-physical-therapy-practice-with-a-professional-website';
const HOMECARE_EN = '/en/enhancing-your-physical-therapy-practice-with-a-professional-online-presence';

add({ path: '/', lang: 'ar', pair: '/en', title: 'Nile Therapy | العلاج الطبيعي في المنزل - شركة النيل للعلاج الطبيعي',
  description: 'Nile Therapy (شركة النيل للعلاج الطبيعي) تقدم خدمات العلاج الطبيعي والرعاية المنزلية الفائقة في كل أنحاء مصر: تأهيل المخ والأعصاب، العظام، ما بعد العمليات والإصابات الرياضية. احجز جلستك في منزلك.',
  body: p => hero(p, 'ar') + specialties(p, 'ar') + steps(p, 'ar') + priceCards(p, 'ar') + about(p, 'ar') + quote('ar') + partners('ar') + ctaBand(p, 'ar') });
add({ path: '/en', lang: 'en', pair: '/', title: 'Nile Therapy | Expert Physiotherapy at Home in Egypt',
  description: 'Nile Therapy brings licensed physiotherapists to your home across Egypt: neuro rehabilitation, orthopedics, recovery after surgery, sports injuries and advanced home care. Book online, pay after the session.',
  body: p => hero(p, 'en') + specialties(p, 'en') + steps(p, 'en') + priceCards(p, 'en') + about(p, 'en') + quote('en') + partners('en') + ctaBand(p, 'en') });

add({ path: '/mn-nhn', lang: 'ar', pair: '/en/about', title: 'من نحن | Nile Therapy - شركة النيل للعلاج الطبيعي',
  description: 'Nile Therapy وكالة متخصصة في العلاج الطبيعي والرعاية المنزلية، تربط المرضى بأخصائيين مرخّصين في كل أنحاء مصر مع إشراف طبي ومتابعة مستمرة.',
  body: p => pageHead('من نحن', 'شركة النيل للعلاج الطبيعي والرعاية المنزلية — العلاج يوصل لحد باب بيتك.') + about(p, 'ar', true) + steps(p, 'ar') + partners('ar') + ctaBand(p, 'ar') });
add({ path: '/en/about', lang: 'en', pair: '/mn-nhn', title: 'About Nile Therapy | Physiotherapy & Home Care in Egypt',
  description: 'Nile Therapy is a physiotherapy and home-care agency connecting patients with licensed physiotherapists across Egypt, with medical supervision and continuous follow-up.',
  body: p => pageHead('About Nile Therapy', 'Physiotherapy and advanced home care: treatment that comes to your door.') + about(p, 'en', true) + steps(p, 'en') + partners('en') + ctaBand(p, 'en') });

add({ path: '/testimonials', lang: 'ar', pair: '/en/testimonials', title: 'آراء المرضى | Nile Therapy',
  description: 'اقرأ تجارب مرضى Nile Therapy مع جلسات العلاج الطبيعي والرعاية المنزلية.',
  body: p => pageHead('آراء المرضى', 'تجارب حقيقية من مرضى تعافوا معنا.') + quote('ar') + `<section class="sec"><div class="wrap narrow center"><p>${'هل تعالجت معنا؟ يسعدنا سماع رأيك على'} <a href="${CONTACT.facebook}" rel="noopener" target="_blank">فيسبوك</a> ${'أو'} <a href="${CONTACT.instagram}" rel="noopener" target="_blank">إنستجرام</a>.</p></div></section>` + ctaBand(p, 'ar') });
add({ path: '/en/testimonials', lang: 'en', pair: '/testimonials', title: 'Patient Testimonials | Nile Therapy',
  description: 'Read what Nile Therapy patients say about their physiotherapy and home-care experience.',
  body: p => pageHead('Patient testimonials', 'Real experiences from patients who recovered with us.') + quote('en') + `<section class="sec"><div class="wrap narrow center"><p>Treated with us? We'd love to hear from you on <a href="${CONTACT.facebook}" rel="noopener" target="_blank">Facebook</a> or <a href="${CONTACT.instagram}" rel="noopener" target="_blank">Instagram</a>.</p></div></section>` + ctaBand(p, 'en') });

add({ path: '/hjz-almwaayd', lang: 'ar', pair: '/en/book', title: 'حجز جلسات العلاج الطبيعى فى المنزل | Nile Therapy', bodyClass: 'is-booking',
  description: 'استمتع بخدمات العلاج الطبيعى فى المنزل مع حجز مواعيد لجلسات العلاج الطبيعي بسهولة. املأ نموذج الحجز وسيتواصل معك أحد المتخصصين، والدفع بعد الجلسة.',
  body: p => pageHead('حجز المواعيد', 'سواء كان لديك استفسار طبي أو تحتاج إلى حجز جلسة علاج طبيعي، نحن هنا من أجلك. املأ النموذج وسيتواصل معك أحد المتخصصين ويقودك خطوة بخطوة نحو الحل الأنسب لحالتك.') + `<section class="sec"><div class="wrap narrow">${bookingForm('ar')}</div></section>` });
add({ path: '/en/book', lang: 'en', pair: '/hjz-almwaayd', title: 'Book a Home Physiotherapy Session | Nile Therapy', bodyClass: 'is-booking',
  description: 'Book a physiotherapy session at your home with Nile Therapy. Fill in the form and a specialist will call you; pay after the session.',
  body: p => pageHead('Book a session', 'Tell us a little about your case and a specialist will call you to confirm the best time.') + `<section class="sec"><div class="wrap narrow">${bookingForm('en')}</div></section>` });

add({ path: '/online-store', lang: 'ar', title: 'الخدمات والأسعار | Nile Therapy',
  description: 'أسعار جلسات العلاج الطبيعي في المنزل مع Nile Therapy: كشف منزلي وجلسة أولى، جلسات العظام، وجلسات المخ والأعصاب. احجز أونلاين وادفع بعد الجلسة.',
  body: p => pageHead('الخدمات والأسعار', 'احجز أونلاين وادفع نقداً بعد الجلسة.') + priceCards(p, 'ar', { heading: false }) + steps(p, 'ar') + ctaBand(p, 'ar') });
for (const s of SERVICES) add({ path: s.path, lang: 'ar', title: `${s.ar.name} | Nile Therapy`, description: s.ar.lead + '. ' + s.ar.body[0].slice(0, 90) + '…', ld: [serviceLd(s, 'ar')],
  body: p => `<section class="page-head service-head"><div class="wrap service-in"><div><p class="crumbs"><a href="${rel(p, '/online-store')}">الخدمات والأسعار</a></p><h1>${s.ar.name}</h1><p class="lead">${s.ar.lead}</p>
    <p class="meta big"><span>${icon('cash')}<b>${s.price}</b> ج.م</span><span>${icon('clock')}${s.minutes} دقيقة</span><span>${icon('home')}فى منزلك</span></p>
    <div class="cta-row"><a class="btn lg" href="${rel(p, '/hjz-almwaayd')}?service=${s.key}">احجز الان</a><span class="muted small">الدفع نقداً بعد الجلسة</span></div></div>
    <img class="service-img" src="{A}img/${s.img}" alt="${s.ar.name}" width="600" height="420"></div></section>
  <section class="sec"><div class="wrap narrow prose">${s.ar.body.map(x => `<p>${x}</p>`).join('')}</div></section>` + steps(p, 'ar') + ctaBand(p, 'ar') });

const arArticles = p => [{ path: '/neckpain', img: 'neck-exam.jpg', tag: 'المقالات الطبية', title: NECK.ar.title, lead: NECK.ar.lead.slice(0, 140) + '…' }];
add({ path: '/almqalat', lang: 'ar', title: 'المقالات | Nile Therapy',
  description: 'مقالات طبية موثوقة عن العلاج الطبيعي وإعادة التأهيل من Nile Therapy، إلى جانب آخر الأخبار والشراكات.',
  body: p => pageHead('المقالات و أخر الاخبار', 'قال الإمام الشافعي رحمه الله: «إنما العِلمُ عِلمان: عِلمُ الدِّين، وعِلمُ الدُّنيا، فأشرفُ علمِ الدُّنيا الطِّب.»') + `<section class="sec"><div class="wrap">
    <p class="narrow">وقال الإمام ابن سينا: «الطِّبُّ علمٌ يُعرَفُ به أحوالُ بدنِ الإنسان، من حيثُ ما يَصحُّ ويَمرضُ، حفظًا للصِّحة، واستردادًا لها عند زوالها.» تُجسِّد هاتان الحكمتان مكانة الطب كأحد أنبل العلوم. وانطلاقًا من هذا المعنى، نلتزم في Nile Therapy بتقديم مقالات طبية موثوقة قائمة على الدليل العلمي، إلى جانب آخر الأخبار، الشراكات، وإنجازات الأطباء.</p>
    <div class="tabs"><a class="btn sm" href="${rel(p, '/almqalat-altbyh')}">المقالات الطبية</a><a class="btn sm ghost" href="${rel(p, '/akhr-alakhbar')}">أخر الأخبار</a></div>
    ${articleCards(p, 'ar', arArticles(p))}</div></section>` + ctaBand(p, 'ar') });
add({ path: '/almqalat-altbyh', lang: 'ar', title: 'المقالات الطبية | Nile Therapy', description: 'مقالات طبية عن آلام الرقبة والظهر والعلاج الطبيعي وإعادة التأهيل، مبنية على أحدث الأبحاث، من Nile Therapy.',
  body: p => pageHead('المقالات الطبية', 'معرفة طبية موثوقة تساعدك تفهم حالتك وتتعافى بشكل أفضل.') + `<section class="sec"><div class="wrap">${articleCards(p, 'ar', arArticles(p))}</div></section>` + ctaBand(p, 'ar') });
add({ path: '/akhr-alakhbar', lang: 'ar', title: 'أخر الأخبار | Nile Therapy', description: 'آخر أخبار Nile Therapy: الشراكات الطبية، الإنجازات، وأخبار أطبائنا وخبرائنا.',
  body: p => pageHead('أخر الأخبار', 'آخر الشراكات الطبية والإنجازات وأخبار فريقنا.') + `<section class="sec"><div class="wrap narrow center"><p>ننشر أخبارنا أولاً بأول على صفحاتنا. تابعنا على <a href="${CONTACT.facebook}" rel="noopener" target="_blank">فيسبوك</a> و<a href="${CONTACT.instagram}" rel="noopener" target="_blank">إنستجرام</a> و<a href="${CONTACT.tiktok}" rel="noopener" target="_blank">تيك توك</a>.</p></div></section>` + ctaBand(p, 'ar') });
add({ path: '/neckpain', lang: 'ar', title: 'آلام الرقبة و كيفية التخلص منها | Nile Therapy', ogType: 'article', ld: [articleLd(NECK.ar, '/neckpain', 'ar')],
  description: 'هل تعاني من آلام في الرقبة بسبب الجلوس الطويل أمام الكمبيوتر أو القيادة؟ أسباب ألم الرقبة، متى تزور دكتور العلاج الطبيعي، ووضعيات الجلوس الصحيحة.',
  body: p => `<article>${pageHead(NECK.ar.title, NECK.ar.lead, `<p class="crumbs"><a href="${rel(p, '/almqalat-altbyh')}">المقالات الطبية</a> · <time datetime="${NECK.date}">30 أغسطس 2025</time></p>`)}<section class="sec"><div class="wrap narrow prose">${NECK.ar.html}</div></section></article>` + ctaBand(p, 'ar') });

const enArticles = [
  { path: NECK_EN, img: 'neck-exam.jpg', tag: 'Medical article', title: NECK.en.title, lead: NECK.en.lead },
  { path: HOMECARE_EN, img: 'icu.jpg', tag: 'Home care', title: 'Physiotherapy at Home: What to Expect From Your First Visit', lead: 'How a home physiotherapy visit works, who it helps, and how to get ready for it.' },
];
add({ path: '/en/resources', lang: 'en', title: 'Physiotherapy Resources for Patients | Nile Therapy',
  description: 'Practical, evidence-based physiotherapy articles from Nile Therapy: neck pain, posture, recovery at home and more.',
  body: p => pageHead('Resources', 'Practical, evidence-based articles to help you understand your condition and recover better.') + `<section class="sec"><div class="wrap">${articleCards(p, 'en', enArticles)}</div></section>` + ctaBand(p, 'en') });
add({ path: NECK_EN, lang: 'en', title: `${NECK.en.title} | Nile Therapy`, ogType: 'article', ld: [articleLd(NECK.en, NECK_EN, 'en')], description: NECK.en.lead,
  body: p => `<article>${pageHead(NECK.en.title, NECK.en.lead, `<p class="crumbs"><a href="${rel(p, '/en/resources')}">Resources</a></p>`)}<section class="sec"><div class="wrap narrow prose">${NECK.en.html}</div></section></article>` + ctaBand(p, 'en') });
add({ path: HOMECARE_EN, lang: 'en', title: 'Physiotherapy at Home: What to Expect From Your First Visit | Nile Therapy', ogType: 'article',
  description: 'How a home physiotherapy visit with Nile Therapy works, who it helps, what the first assessment includes and how to prepare.',
  ld: [articleLd({ title: 'Physiotherapy at Home: What to Expect From Your First Visit', lead: 'How a home physiotherapy visit works, who it helps, and how to prepare.' }, HOMECARE_EN, 'en')],
  body: p => `<article>${pageHead('Physiotherapy at Home: What to Expect From Your First Visit', 'Home physiotherapy brings the clinic to you. Here is how a first visit works and how to get the most from it.', `<p class="crumbs"><a href="${rel(p, '/en/resources')}">Resources</a></p>`)}
  <section class="sec"><div class="wrap narrow prose">
  <h2>Who home physiotherapy helps</h2><ul><li>People recovering from surgery (joint replacement, fractures, spine surgery).</li><li>Patients after a stroke or with other neurological conditions.</li><li>Older adults who find travelling to a clinic hard.</li><li>Patients discharged from hospital or intensive care who still need close follow-up.</li><li>Anyone with pain that limits daily life: neck, back, knee or shoulder.</li></ul>
  <h2>Your first visit</h2><p>Your first session is a full assessment (about 2 hours). The physiotherapist reviews your medical history and any reports or scans, then checks movement, strength, joint range, balance and pain. You leave with a clear plan: the goals, the number of sessions and a home exercise program.</p>
  <h2>How to prepare</h2><ul><li>Have your reports, scans and medication list ready.</li><li>Wear comfortable clothes that let the affected area move.</li><li>Clear a little space to move around, and have a firm chair nearby.</li><li>Write down your questions and what you want to be able to do again.</li></ul>
  <h2>After the visit</h2><p>Sessions follow the plan, with regular reassessment so the program keeps up with your progress. With Nile Therapy you book online, a licensed physiotherapist near you visits, and you pay cash after the session.</p>
  <p><a class="btn" href="${rel(p, '/en/book')}">Book a home visit</a></p></div></section></article>` + ctaBand(p, 'en') });

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
  .replace(/(href|src)="(?:\.\/)?assets\//g, `$1="${BASE}assets/`).replace(/href="(\.\/|online-store|almqalat|mn-nhn|testimonials|hjz-almwaayd|en)"/g, (m, u) => `href="${BASE}${u === './' ? '' : u}"`)
  .replace('<link rel="canonical"', '<meta name="robots" content="noindex"><link rel="canonical"');
fs.writeFileSync(path.join(DIST, '404.html'), nf);
// robots + sitemap
fs.writeFileSync(path.join(DIST, 'robots.txt'), STAGING ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nDisallow:\n\nSitemap: ${SITE}/sitemap.xml\n`);
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${P.map(pg => `<url><loc>${SITE}${pg.path}</loc>${pg.pair ? `<xhtml:link rel="alternate" hreflang="${pg.lang}" href="${SITE}${pg.path}"/><xhtml:link rel="alternate" hreflang="${pg.lang === 'ar' ? 'en' : 'ar'}" href="${SITE}${pg.pair}"/>` : ''}<lastmod>${today}</lastmod><priority>${pg.path === '/' || pg.path === '/en' ? '1.0' : '0.6'}</priority></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');
console.log(`built ${P.length} pages${STAGING ? ' (STAGING: noindex)' : ''}`);
