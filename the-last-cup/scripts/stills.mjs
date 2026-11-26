// Render review stills: node scripts/stills.mjs 0 1.2 2.5 ...  (seconds)  [--dir qa/stills] [--scale 0.5]
import path from 'node:path';
import fs from 'node:fs';
import { renderStill, openBrowser } from '@remotion/renderer';
import { setup, browserExecutable, chromiumOptions, ROOT } from './common.mjs';

const args = process.argv.slice(2);
let dir = path.join(ROOT, 'qa/stills');
let scale = 0.5;
let quality = 'final';
let dbg = '';
const times = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--dir') dir = path.resolve(args[++i]);
  else if (args[i] === '--scale') scale = Number(args[++i]);
  else if (args[i] === '--quality') quality = args[++i];
  else if (args[i] === '--dbg') dbg = args[++i];
  else times.push(Number(args[i]));
}
fs.mkdirSync(dir, { recursive: true });
const inputProps = { quality, dbg };
const { serveUrl, composition } = await setup(inputProps);
const browser = await openBrowser('chrome', { browserExecutable, chromiumOptions });
for (const t of times) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(t * composition.fps));
  const output = path.join(dir, `f${String(frame).padStart(3, '0')}.jpg`);
  const t0 = Date.now();
  await renderStill({
    serveUrl,
    composition,
    inputProps,
    frame,
    output,
    imageFormat: 'jpeg',
    jpegQuality: 92,
    scale,
    puppeteerInstance: browser,
    browserExecutable,
    chromiumOptions,
    timeoutInMilliseconds: 240000,
    onBrowserLog: (l) => {
      if (l.type === 'error' || l.type === 'warning') console.log('[browser]', l.type, l.text.slice(0, 300));
    },
  });
  console.log(`frame ${frame} (${t}s) → ${output}  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

await browser.close({ silent: true });
