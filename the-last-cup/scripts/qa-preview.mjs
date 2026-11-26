// Playwright QA of the interactive preview: loads the single-file build, seeks chapters, checks the WebGL canvas,
// collects console errors, takes screenshots (desktop + phone, film + explore). node scripts/qa-preview.mjs
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(ROOT, 'dist-preview/index.html'));
const server = http.createServer((_q, r) => r.writeHead(200, { 'content-type': 'text/html' }).end(html)).listen(0);
const url = `http://127.0.0.1:${server.address().port}/`;
const out = path.join(ROOT, 'qa/preview');
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
const report = { url, errors: [], checks: {} };

async function run(name, viewport, hash, act) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  page.on('console', (m) => m.type() === 'error' && report.errors.push(`${name}: ${m.text().slice(0, 200)}`));
  page.on('pageerror', (e) => report.errors.push(`${name}: pageerror ${String(e).slice(0, 200)}`));
  const t0 = Date.now();
  await page.goto(url + hash, { waitUntil: 'load' });
  await page.waitForSelector('canvas', { timeout: 60000 });
  report.checks[`${name}.firstCanvasMs`] = Date.now() - t0;
  await act(page);
  const gl = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    if (!c) return null;
    return { w: c.width, h: c.height, webgl2: !!(c.getContext('webgl2') || c.getContext('webgl')) || c.dataset.engine || 'context-in-use' };
  });
  report.checks[`${name}.canvas`] = gl;
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  report.checks[`${name}.horizontalOverflow`] = overflow;
  await page.screenshot({ path: path.join(out, `${name}.png`) });
  await page.close();
}

await run('film-desktop', { width: 1280, height: 900 }, '#film', async (p) => {
  await p.click('#chapter-3'); // 'Empty' — 一期一会
  await p.waitForTimeout(9000);
});
await run('film-phone', { width: 390, height: 844 }, '#film', async (p) => {
  await p.click('#chapter-4');
  await p.waitForTimeout(9000);
});
await run('explore-desktop', { width: 1280, height: 900 }, '#explore', async (p) => {
  await p.waitForTimeout(6000);
  const box = await p.locator('canvas').boundingBox();
  // orbit: drag across the canvas
  await p.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
  await p.mouse.down();
  await p.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.45, { steps: 12 });
  await p.mouse.up();
  await p.waitForTimeout(6000);
});
await browser.close();
server.close();
fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
