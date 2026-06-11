import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:5174');
await page.waitForTimeout(3500);
await page.evaluate(() => window.scrollTo(0, 800));
await page.waitForTimeout(400);
await page.screenshot({ path: 'hero-about-scrolled.png' });
await browser.close();
