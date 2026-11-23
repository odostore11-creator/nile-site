// Pulls the readable content of each saved page, in order, into inventory/content/<page>.md
// (headings, paragraphs, list items, buttons/links, images with alt) so it can be carried over.
import fs from 'fs';
import path from 'path';
const DIR = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname).replace(/^\/(\w:)/, '$1'));
const out = path.join(DIR, 'content'); fs.mkdirSync(out, { recursive: true });
const dec = s => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
for (const f of fs.readdirSync(path.join(DIR, 'pages'))) {
  let h = fs.readFileSync(path.join(DIR, 'pages', f), 'utf8');
  h = h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>|<svg[\s\S]*?<\/svg>/g, '');
  const body = (h.match(/<body[\s\S]*<\/body>/i) || [h])[0];
  const lines = [];
  const re = /<(h[1-6]|p|li|a|button|img)\b([^>]*)>([\s\S]*?)(?=<\/\1>|$)|<img\b([^>]*)>/gi;
  for (const m of body.matchAll(/<(h[1-6]|p|li|button)\b[^>]*>([\s\S]*?)<\/\1>|<a\b([^>]*)>([\s\S]*?)<\/a>|<img\b([^>]*)>/gi)) {
    if (m[1]) { const t = dec(m[2].replace(/<[^>]+>/g, ' ')); if (t) lines.push((m[1][0] === 'h' ? '#'.repeat(+m[1][1]) + ' ' : m[1] === 'li' ? '- ' : m[1] === 'button' ? '[button] ' : '') + t); }
    else if (m[4] !== undefined) { const t = dec(m[4].replace(/<[^>]+>/g, ' ')); const href = (m[3].match(/href="([^"]*)"/) || [])[1] || ''; if (t && href) lines.push(`[link] ${t} -> ${href}`); }
    else if (m[5]) { const src = (m[5].match(/\ssrc="([^"]*)"/) || [])[1] || ''; const alt = (m[5].match(/\salt="([^"]*)"/) || [])[1] || ''; if (src) lines.push(`[img] ${dec(alt)} | ${src}`); }
  }
  const dedup = lines.filter((l, i) => l !== lines[i - 1]);
  fs.writeFileSync(path.join(out, f.replace(/\.html$/, '.md')), dedup.join('\n') + '\n');
}
console.log('done');
