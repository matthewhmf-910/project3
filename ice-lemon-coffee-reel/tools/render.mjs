// Frame-accurate capture of index.html.
//   node tools/render.mjs stills <outDir> <t1,t2,...> [quality]   single-sample stills (seconds)
//   node tools/render.mjs video  <out.mp4> [fromFrame] [toFrame]   full quality, sub-frame motion blur -> H.264
import { createRequire } from 'node:module';
import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch { pw = require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); }
const { chromium } = pw;

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const [mode, out, a3, a4] = process.argv.slice(2);
const FPS = 30, TOTAL = 15 * FPS;

const browser = await chromium.launch({ args: ['--force-device-scale-factor=1'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('console', m => { if (m.type() === 'error') console.error('[page]', m.text()); });
page.on('pageerror', e => console.error('[pageerror]', e.message));
await page.goto('file://' + path.join(root, 'index.html') + '?render');
await page.evaluate(() => window.READY);
const canvas = await page.$('#c');

async function grab(fi, q) {
  await page.evaluate(([f, qq]) => window.renderFrame(f, qq), [fi, q]);
  return canvas.screenshot({ type: 'png' });
}

if (mode === 'stills') {
  fs.mkdirSync(out, { recursive: true });
  for (const s of a3.split(',')) {
    const fi = Math.round(parseFloat(s) * FPS);
    fs.writeFileSync(path.join(out, `t${s.padStart(5, '0')}.png`), await grab(fi, +(a4 ?? 0)));
  }
} else {
  const from = +(a3 ?? 0), to = +(a4 ?? TOTAL);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p', '-tune', 'film', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let fi = from; fi < to; fi++) {
    const buf = await grab(fi, 1);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (fi % 30 === 0) console.log(`frame ${fi}/${to}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
}
await browser.close();
