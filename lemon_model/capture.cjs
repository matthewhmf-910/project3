const { chromium } = require('playwright');
const path = require('path');

async function main() {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
  const url = 'http://localhost:8731/render.html';
  page.on('console', (msg) => console.log('PAGE:', msg.text()));
  page.on('pageerror', (err) => console.log('PAGEERROR:', err.message));
  await page.goto(url);
  await page.waitForFunction('window.__ready === true', { timeout: 15000 });

  const views = [
    { name: 'hero', az: 0 },
    { name: 'orbit-plus35', az: 35 },
    { name: 'orbit-minus35', az: -35 },
    { name: 'profile', az: 78 },
    { name: 'rear', az: 180 },
  ];

  for (const v of views) {
    await page.evaluate((az) => {
      window.__setAzimuth(az);
      window.__render();
    }, v.az);
    await page.screenshot({ path: path.join(__dirname, 'renders', v.name + '.png') });
    console.log('captured', v.name);
  }

  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
