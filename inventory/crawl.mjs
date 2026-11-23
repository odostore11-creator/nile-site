// Read-only inventory of the live niletherapy.org before the rebuild (SEO safety).
// Saves every sitemap page's raw HTML plus its SEO facts to inventory/pages/ and inventory/seo.json.
import fs from 'fs';
import path from 'path';

const UA = 'Mozilla/5.0 (compatible; site-inventory)';
const OUT = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname).replace(/^\/(\w:)/, '$1'));
fs.mkdirSync(path.join(OUT, 'pages'), { recursive: true });
const get = async u => { const r = await fetch(u, { headers: { 'User-Agent': UA }, redirect: 'manual' }); return { status: r.status, location: r.headers.get('location'), text: await r.text() }; };
const pick = (h, re) => [...h.matchAll(re)].map(m => m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()).filter(Boolean);
const attr = (h, re) => (h.match(re) || [])[1] || '';
const dec = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

const sm = (await get('https://www.niletherapy.org/sitemap.xml')).text;
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), sm);
const urls = [...new Set([...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]))];
const rows = [];
for (const u of urls) {
  const r = await get(u);
  const h = r.text;
  const slug = (new URL(u).pathname.replace(/^\/|\/$/g, '') || 'home').replace(/\//g, '__');
  fs.writeFileSync(path.join(OUT, 'pages', slug + '.html'), h);
  const body = h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ');
  rows.push({
    url: u, status: r.status, redirect: r.location,
    lang: attr(h, /<html[^>]*\slang="([^"]+)"/i),
    title: dec(attr(h, /<title[^>]*>([^<]*)<\/title>/i)),
    description: dec(attr(h, /<meta[^>]+name="description"[^>]+content="([^"]*)"/i) || attr(h, /<meta[^>]+content="([^"]*)"[^>]+name="description"/i)),
    canonical: attr(h, /<link[^>]+rel="canonical"[^>]+href="([^"]*)"/i),
    hreflang: [...h.matchAll(/<link[^>]+hreflang="([^"]+)"[^>]+href="([^"]+)"/gi)].map(m => m[1] + ' ' + m[2]),
    robots: attr(h, /<meta[^>]+name="robots"[^>]+content="([^"]*)"/i),
    og_title: dec(attr(h, /<meta[^>]+property="og:title"[^>]+content="([^"]*)"/i)),
    og_image: attr(h, /<meta[^>]+property="og:image"[^>]+content="([^"]*)"/i),
    h1: pick(body, /<h1[^>]*>([\s\S]*?)<\/h1>/gi).map(dec),
    h2: pick(body, /<h2[^>]*>([\s\S]*?)<\/h2>/gi).map(dec).slice(0, 15),
    jsonld: [...h.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map(m => { try { const j = JSON.parse(m[1]); return j['@type'] || (Array.isArray(j) ? j.map(x => x['@type']).join(',') : '?'); } catch { return 'invalid'; } }),
    images: [...h.matchAll(/<img[^>]*>/gi)].length,
    images_no_alt: [...h.matchAll(/<img(?![^>]*\salt="[^"]+")[^>]*>/gi)].length,
    words: body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').length,
  });
  await new Promise(res => setTimeout(res, 700));
}
fs.writeFileSync(path.join(OUT, 'seo.json'), JSON.stringify(rows, null, 2));
console.log(rows.length, 'pages saved');
