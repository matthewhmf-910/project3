// Screenshot every .page in pages.html into ../assets/pages/<id>.jpg at 2x (1992x1128) so the
// 16:9 full-bleed layout stays sharp.
// usage: node render_pages.js
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'assets/pages');
fs.mkdirSync(out, { recursive: true });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png' };
const srv = http.createServer((q, r) => {
  const p = path.join(root, decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' }); r.end(d); });
}).listen(0, async () => {
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1100, height: 800 }, deviceScaleFactor: 2 });
  pg.on('pageerror', (e) => console.error('pageerror', e.message));
  await pg.goto(`http://localhost:${srv.address().port}/pages/pages.html`);
  await pg.waitForSelector('body[data-ready="1"]');
  for (const el of await pg.$$('.page')) {
    const id = await el.getAttribute('id');
    await el.screenshot({ path: path.join(out, `${id}.jpg`), type: 'jpeg', quality: 88 });
  }
  console.log('rendered', (await pg.$$('.page')).length, 'pages ->', out);
  await b.close(); srv.close();
});
