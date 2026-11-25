// Content waiting on the founders. Everything here is OPTIONAL: while a slot is empty, the part of the site
// that uses it stays hidden (no placeholders are ever shown). Fill a slot, run the build, and it appears.
// See "Waiting on the founders" in CLAUDE.md for exactly what to send.

// Photos. Put image files in assets/img/ as WebP (name.webp, ~1000px wide, plus name-600.webp ~600px wide),
// then write the name (without .webp) here.
export const PHOTOS = {
  // Founders' portraits (square, face centred, plain background). Keys match FOUNDERS[].key in content2.mjs.
  founders: { mostafa: '', abdelrahman: '', ahmed: '' },
  // Real home-session photos, ONLY with the patient's written consent (or faces not shown).
  // Shown as a "From our home visits" strip on the home and About pages once there are at least 3.
  // e.g. { file: 'visit-1', alt: { ar: 'جلسة علاج طبيعي في المنزل', en: 'A physiotherapy session at home' } }
  visits: [],
};

// Real patient reviews (with permission; first name + initial is enough). With 2 or more here, the home page
// shows a reviews grid instead of the single quote, and the Reviews page lists them all.
// e.g. { quote: { ar: '…', en: '…' }, who: { ar: 'سعاد م.', en: 'Suad M.' }, about: { ar: 'تأهيل بعد تغيير الركبة', en: 'Knee replacement rehab' } }
export const REVIEWS = [];

// Numbers the founders can stand behind. Leave null to keep the facts band (specialties, first-visit length,
// session price, founders), which only shows things already true on the site. Any key left out is not shown.
// e.g. { partners: 23, cities: 15, patients: 300, rating: 4.9, ratingCount: 120 }
export const STATS = null;

// News for the "Latest news" page (partnerships, milestones, the team). With at least one item the page lists
// them and "News" appears in the Articles menu.
// e.g. { date: '2026-12-01', title: { ar: '…', en: '…' }, body: { ar: ['paragraph'], en: ['paragraph'] }, img: 'news-1' }
export const NEWS = [];

// The founders' story for the About page ("why we started Nile Therapy"), a few short paragraphs per language.
// e.g. { ar: ['…', '…'], en: ['…', '…'] }
export const STORY = null;
