import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage();
page.on('console', msg => console.log('CONSOLE', msg.type(), msg.text()));
page.on('pageerror', err => console.log('PAGEERROR', err.message));
await page.goto('http://localhost:8081/product', { waitUntil: 'networkidle' });
await page.screenshot({ path: 'tmp-product.png', fullPage: true });
console.log('SCREENSHOT_DONE');
await browser.close();
