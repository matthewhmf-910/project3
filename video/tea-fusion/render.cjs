// Renders scene.html frame by frame to PNGs.
// Usage: node render.cjs <outDir> [frameList]   e.g.  node render.cjs out/frames  0,62,112
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const outDir = path.resolve(process.argv[2] || 'out/frames');
  const FPS = 24, TOTAL = 240;
  const frames = process.argv[3] ? process.argv[3].split(',').map(Number) : [...Array(TOTAL).keys()];
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 720, height: 1280 } });
  page.on('pageerror', e => { console.error('page error:', e.message); process.exitCode = 1; });
  await page.goto('file://' + path.join(__dirname, 'scene.html'));
  await page.evaluate(() => window.ready);
  // file:// images taint the canvas, so capture by screenshot rather than toDataURL
  const canvas = page.locator('#c');
  for (const f of frames) {
    await page.evaluate(([f, fps]) => window.draw(f / fps), [f, FPS]);
    await canvas.screenshot({ path: path.join(outDir, `f_${String(f).padStart(3, '0')}.png`) });
  }
  await browser.close();
  console.log(`rendered ${frames.length} frames → ${outDir}`);
})();
