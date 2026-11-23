// Local preview that behaves like GitHub Pages: /page -> page.html, /dir/ -> dir/index.html, else 404.html.
//   node scripts/serve.mjs [port] [base]   e.g. node scripts/serve.mjs 5700 /nile-site/
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const DIST = path.resolve(path.dirname(decodeURIComponent(new URL(import.meta.url).pathname).replace(/^\/(\w:)/, '$1')), '..', 'dist');
const PORT = Number(process.argv[2] || 5700), BASE = process.argv[3] || '/';
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (!p.startsWith(BASE)) { res.writeHead(404); return res.end(); }
  p = p.slice(BASE.length);
  const tries = p === '' ? ['index.html'] : p.endsWith('/') ? [p + 'index.html'] : [p, p + '.html', p + '/index.html'];
  for (const t of tries) {
    const f = path.join(DIST, t);
    if (f.startsWith(DIST) && fs.existsSync(f) && fs.statSync(f).isFile()) {
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      return res.end(fs.readFileSync(f));
    }
  }
  res.writeHead(404, { 'Content-Type': MIME['.html'] }); res.end(fs.readFileSync(path.join(DIST, '404.html')));
}).listen(PORT, () => console.log(`preview http://localhost:${PORT}${BASE}`));
