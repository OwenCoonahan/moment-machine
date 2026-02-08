const { chromium } = require('playwright');

async function screenshot() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  // Screenshot landing page
  await page.goto('https://moment-machine.vercel.app');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/landing.png', fullPage: false });
  console.log('Landing page screenshot saved');
  
  // Screenshot dashboard
  await page.goto('https://moment-machine.vercel.app/dashboard');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/dashboard.png', fullPage: false });
  console.log('Dashboard screenshot saved');
  
  await browser.close();
  console.log('Done!');
}

screenshot().catch(console.error);
