// Runs before every publish. Stops the deploy if an SEO basic is broken:
//  * every URL from the OLD site's sitemap (inventory/sitemap.xml) must exist at the same address
//  * every page: one <title>, a meta description, a canonical, exactly one <h1>, lang + dir
//  * noindex only on staging; internal links and assets must resolve.
import fs from 'fs';
import path from 'path';
const ROOT = path.resolve(path.dirname(decodeURIComponent(new URL(import.meta.url).pathname).replace(/^\/(\w:)/, '$1')), '..');
const DIST = path.join(ROOT, 'dist');
const STAGING = process.env.NT_STAGING === '1';
const problems = [];
const fileFor = p => (p === '/' ? 'index.html' : p.replace(/^\//, '') + '.html');

const old = [...fs.readFileSync(path.join(ROOT, 'inventory', 'sitemap.xml'), 'utf8').matchAll(/<loc>https:\/\/www\.niletherapy\.org([^<]*)<\/loc>/g)].map(m => m[1] || '/');
for (const p of old) if (!fs.existsSync(path.join(DIST, fileFor(p)))) problems.push(`Old URL missing: ${p}`);

const pages = [];
const walk = d => { for (const f of fs.readdirSync(d)) { const x = path.join(d, f); if (fs.statSync(x).isDirectory()) { if (f !== 'assets') walk(x); } else if (f.endsWith('.html')) pages.push(x); } };
walk(DIST);
for (const f of pages) {
  const rel = path.relative(DIST, f).replace(/\\/g, '/');
  const h = fs.readFileSync(f, 'utf8');
  const count = re => (h.match(re) || []).length;
  if (count(/<title>[^<]+<\/title>/g) !== 1) problems.push(`${rel}: needs exactly one <title>`);
  if (!/<meta name="description" content="[^"]{30,}"/.test(h)) problems.push(`${rel}: description missing or too short`);
  if (rel !== '404.html' && !/<link rel="canonical" href="https:\/\/www\.niletherapy\.org[^"]*">/.test(h)) problems.push(`${rel}: canonical missing`);
  if (count(/<h1[\s>]/g) !== 1) problems.push(`${rel}: needs exactly one <h1> (has ${count(/<h1[\s>]/g)})`);
  if (!/<html lang="[^"]+" dir="(rtl|ltr)">/.test(h)) problems.push(`${rel}: lang/dir missing`);
  const noindex = /<meta name="robots" content="noindex/.test(h);
  if (rel !== '404.html' && noindex !== STAGING) problems.push(`${rel}: noindex is ${noindex ? 'ON' : 'OFF'} but staging is ${STAGING ? 'ON' : 'OFF'}`);
  if (rel === '404.html') continue;
  for (const [, u] of h.matchAll(/(?:href|src)="([^"#?]+)[^"]*"/g)) {
    if (/^(https?:|mailto:|tel:|data:)/.test(u)) continue;
    const target = path.resolve(path.dirname(f), u);
    const ok = fs.existsSync(target) && fs.statSync(target).isFile() || fs.existsSync(target + '.html') || fs.existsSync(path.join(target, 'index.html'));
    if (!ok) problems.push(`${rel}: broken link ${u}`);
  }
}
if (problems.length) { console.error(`✗ ${problems.length} problem(s):\n- ` + [...new Set(problems)].join('\n- ')); process.exit(1); }
console.log(`✓ ${pages.length} pages OK; all ${old.length} old URLs exist${STAGING ? ' (staging: noindex)' : ''}.`);
