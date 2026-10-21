const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function exportGLB() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Handle download
  const downloadPath = path.join(__dirname, 'bread_mascot.glb');
  const downloadPromise = page.waitForEvent('download');
  
  // Load the export HTML
  const htmlPath = path.join(__dirname, 'export-glb.html');
  const fileUrl = `file://${htmlPath}`;
  
  console.log('Opening export page...');
  await page.goto(fileUrl, { waitUntil: 'networkidle' });
  
  // Wait a moment for page to fully load
  await page.waitForTimeout(1000);
  
  // Click export button
  console.log('Clicking export button...');
  await page.click('button');
  
  // Wait for download
  const download = await downloadPromise;
  
  // Save file
  await download.saveAs(downloadPath);
  
  console.log(`✅ Exported to: ${downloadPath}`);
  console.log(`📊 File size: ${(fs.statSync(downloadPath).size / 1024).toFixed(2)} KB`);
  
  await browser.close();
}

exportGLB().catch(console.error);
