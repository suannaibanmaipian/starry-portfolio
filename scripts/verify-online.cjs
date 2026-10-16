/* Run only against the real deployed URL: node scripts/verify-online.cjs https://project.pages.dev */
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/cy155/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = (process.argv[2] || '').replace(/\/$/, '');
if (!/^https:\/\//.test(base)) throw new Error('Pass the real HTTPS deployment URL.');
const out = path.resolve(__dirname, '../deliverables/site-online');
const assert = (ok, label) => { if (!ok) throw new Error(label); console.log('PASS ' + label); };
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage(); const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const response = await page.goto(base + '/');
    assert(response.ok(), 'HTTPS homepage HTTP success');
    assert(await page.locator('h1').count() === 1, 'homepage renders');
    await page.goto(base + '/admin/profile');
    await page.waitForURL('**/admin/login');
    assert(true, 'unauthenticated route guard');
    await page.getByLabel('账号', { exact: true }).fill('admin');
    await page.getByLabel('密码', { exact: true }).fill('Starry2026!');
    await page.getByRole('button', { name: '进入管理后台' }).click();
    await page.waitForURL('**/admin');
    assert(true, 'online demo login');
    await page.goto(base + '/admin/profile');
    const originalBio = await page.getByLabel('首页短简介').inputValue();
    await page.getByLabel('首页短简介').fill('线上验收：个人简介保存验证');
    await page.getByRole('button', { name: '保存更改' }).click();
    await page.getByRole('status').waitFor();
    await page.reload();
    assert(await page.getByLabel('首页短简介').inputValue() === '线上验收：个人简介保存验证', 'profile edit persists after refresh');
    await page.goto(base + '/');
    assert(await page.locator('.hero-bio').innerText() === '线上验收：个人简介保存验证', 'public page displays edited profile');
    await page.goto(base + '/admin/profile');
    await page.getByLabel('首页短简介').fill(originalBio);
    await page.getByRole('button', { name: '保存更改' }).click();
    await page.getByRole('status').waitFor();
    for (const [route, file] of [['/projects/imagegrab', '06-project-detail-online.png'], ['/blog/first-note', '07-blog-detail-online.png']]) {
      const res = await page.goto(base + route); assert(res.ok(), 'deep route HTTP success ' + route);
      await page.reload(); await page.locator('.detail-page').waitFor();
      await page.screenshot({ path: path.join(out, file), fullPage: true });
    }
    // Remove this browser's QA content entirely before taking submission screenshots.
    await page.evaluate(() => localStorage.removeItem('cy-portfolio-v1'));
    await page.goto(base + '/');
    assert(await page.locator('.hero-bio').innerText() === originalBio, 'default content restored for screenshots');
    await page.screenshot({ path: path.join(out, '01-home-desktop-online.png'), fullPage: true });
    await page.goto(base + '/admin');
    await page.screenshot({ path: path.join(out, '02-admin-dashboard-online.png'), fullPage: true });
    await page.goto(base + '/admin/profile');
    await page.screenshot({ path: path.join(out, '03-admin-profile-online.png'), fullPage: true });
    await page.setViewportSize({ width: 375, height: 812 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), '375px admin no overflow');
    await page.screenshot({ path: path.join(out, '05-admin-mobile-online.png'), fullPage: true });
    await page.goto(base + '/');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), '375px homepage no overflow');
    await page.screenshot({ path: path.join(out, '04-home-mobile-online.png'), fullPage: true });
    assert(errors.length === 0, 'zero browser page errors');
    const result = { url: base, checkedAt: new Date().toISOString(), status: 'passed', browser: 'Chrome headless', screenshots: fs.readdirSync(out).filter(x => x.endsWith('.png')), note: 'Real HTTPS deployment; default data restored before submission screenshots.' };
    fs.writeFileSync(path.join(out, 'verification.json'), JSON.stringify(result, null, 2));
    console.log('VERIFIED_URL ' + base);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
