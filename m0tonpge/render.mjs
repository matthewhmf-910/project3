// Usage:
//   node render.mjs stills <fmt> <t1,t2,...> <outdir>   -> PNG per time
//   node render.mjs video  <fmt> <out.mp4> [fps]         -> silent H.264
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SIZES = { '16x9': [1920, 1080], '9x16': [1080, 1920], '1x1': [1080, 1080] };
const [mode, fmt, arg, arg2] = process.argv.slice(2);
const [W, H] = SIZES[fmt];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const url = pathToFileURL(path.join(ROOT, 'src/index.html')).href + `?f=${fmt}`;
await page.goto(url, { waitUntil: 'load' });
await page.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map(i => i.decode()));
});

async function shot(t) {
  await page.evaluate(t => window.render(t), t);
  return page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: W, height: H } });
}

if (mode === 'stills') {
  mkdirSync(arg2, { recursive: true });
  for (const t of arg.split(',').map(Number)) {
    const buf = await shot(t);
    const { writeFileSync } = await import('node:fs');
    writeFileSync(path.join(arg2, `${fmt}_t${t.toFixed(2)}.png`), buf);
  }
} else {
  const fps = Number(arg2 || 30);
  const dur = await page.evaluate(() => window.TIMELINE.DURATION);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps),
    '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', arg], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round(dur * fps);
  for (let i = 0; i < n; i++) {
    const buf = await shot(i / fps);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  console.log(`${fmt}: ${n} frames -> ${arg}`);
}
await browser.close();
