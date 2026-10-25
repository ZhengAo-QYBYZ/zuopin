// Local QA only. All email submissions are intercepted; no messages are sent.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
    const browser = await chromium.launch({
        channel: 'msedge', headless: true,
        args: []
    });
    const errors = [];
    const failures = [];
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
        if (response.url().startsWith('http://127.0.0.1:8765/') && response.status() >= 400) failures.push(response.url());
    });
    await page.route('https://**/*', route => route.abort());
    await page.goto('http://127.0.0.1:8765/', { waitUntil: 'networkidle' });
    const projectCount = await page.evaluate(() => window.portfolioContent.projects.length);
    assert.equal(await page.locator('#projectsGrid .project-card').count(), await page.evaluate(() => window.portfolioContent.projects.filter(project => project.featured).length));
    assert.equal(await page.locator('#allProjectsGrid .project-card').count(), projectCount);
    assert.equal(await page.locator('#heroCanvas').evaluate(el => el.width > 1 && el.height > 1), true);
    assert.equal(await page.locator('#hero').getAttribute('data-scene-state'), 'paused');
    fs.mkdirSync('verification', { recursive: true });
    await page.screenshot({ path: 'verification/desktop-home.png' });
    const initialResources = await page.evaluate(() => performance.getEntriesByType('resource').map(entry => ({ name: entry.name, bytes: entry.transferSize })));

    for (const button of await page.locator('#filterBar button').all()) {
        const category = await button.getAttribute('data-filter');
        await button.click();
        assert.equal(await button.getAttribute('aria-pressed'), 'true');
        const actual = await page.locator('#allProjectsGrid .project-card:visible').count();
        const expected = await page.evaluate(category => window.portfolioContent.projects.filter(p => category === '全部' || p.category === category).length, category);
        assert.equal(actual, expected, `Filter: ${category}`);
    }
    await page.getByRole('button', { name: '全部', exact: true }).click();
    const card = page.locator('#allProjectsGrid .project-card').filter({ hasText: '轮椅走廊' });
    await card.scrollIntoViewIfNeeded();
    const scrollBefore = await page.evaluate(() => scrollY);
    await card.focus();
    await page.keyboard.press('Space');
    await page.locator('#detailOverlay').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#pageShell').evaluate(el => el.inert), true);
    assert.equal(await page.locator('#detailTitle').innerText(), '轮椅走廊');
    await page.locator('#detailOverlay [data-image="0"]').click();
    await page.locator('#lightbox').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#detailOverlay').evaluate(el => el.inert), true);
    await page.locator('#lbImg').evaluate(img => img.decode());
    assert.equal(await page.locator('#lbCounter').innerText(), '1 / 3');
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#lbCounter').innerText(), '2 / 3');
    await page.keyboard.press('ArrowLeft');
    assert.equal(await page.locator('#lbCounter').innerText(), '1 / 3');
    await page.waitForFunction(() => document.querySelector('#imageStatus').textContent === '');
    await page.screenshot({ path: 'verification/lightbox.png' });
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'originalImage');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.className), 'lb-close');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#lightbox').isVisible(), false);
    assert.equal(await page.locator('#detailOverlay').isVisible(), true);
    assert.equal(await page.evaluate(() => document.activeElement.dataset.image), '0');
    await page.locator('.detail-nav-btn.next').click();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#detailOverlay').isVisible(), false);
    assert.equal(await card.evaluate(el => document.activeElement === el), true);
    assert.ok(Math.abs(await page.evaluate(() => scrollY) - scrollBefore) < 3, 'Scroll position restored');
    await page.locator('#projects').scrollIntoViewIfNeeded();
    await page.screenshot({ path: 'verification/desktop-projects.png' });

    // Every project must open; all local media/document references are checked separately.
    for (let index = 0; index < projectCount; index++) {
        await page.locator('#allProjectsGrid .project-card').nth(index).click();
        await page.locator('#detailContent img').first().evaluate(img => img.decode());
        await page.keyboard.press('Escape');
    }
    // Clipboard denied/unavailable path must still report a truthful result.
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined }));
    await page.getByRole('button', { name: '复制微信号' }).click();
    assert.ok((await page.locator('#toast').innerText()).includes('AtlasStbz'));

    await page.getByLabel('你的邮箱').fill('qa@example.com');
    await page.getByLabel('主题', { exact: true }).fill('本地自动检查，不会实际发送');
    await page.getByLabel('消息内容').fill('这是一条本地测试消息，仅用于验证错误处理逻辑。');
    await page.getByRole('button', { name: '发送消息' }).click();
    await page.getByText('邮件服务暂时无法连接', { exact: false }).waitFor();
    assert.ok((await page.getByLabel('消息内容').inputValue()).length > 0);
    assert.equal(await page.getByRole('button', { name: '发送消息' }).isEnabled(), true);
    // Delayed mocked send verifies pending state and duplicate-submit protection.
    await page.evaluate(() => {
        window.__sendCount = 0;
        window.emailjs = { init() {}, send(_service, _template, payload) {
            window.__sendCount++;
            window.__payload = payload;
            return new Promise(resolve => { window.__completeSend = resolve; });
        }};
    });
    await page.getByRole('button', { name: '发送消息' }).click();
    await page.waitForFunction(() => window.__sendCount === 1);
    assert.equal(await page.getByRole('button', { name: '正在发送' }).isDisabled(), true);
    await page.evaluate(() => document.querySelector('#contactForm').dispatchEvent(new Event('submit', { cancelable: true })));
    assert.equal(await page.evaluate(() => window.__sendCount), 1);
    assert.ok((await page.evaluate(() => window.__payload.message)).includes('qa@example.com'));
    await page.evaluate(() => window.__completeSend({ status: 200 }));
    await page.getByText('消息已发送，谢谢你的联系！', { exact: true }).waitFor();
    assert.equal(await page.getByLabel('消息内容').inputValue(), '');
    assert.equal(await page.getByRole('button', { name: '发送消息' }).isEnabled(), true);

    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, reducedMotion: 'reduce' });
    const phone = await mobile.newPage();
    phone.on('pageerror', error => errors.push(error.message));
    await phone.route('https://**/*', route => route.abort());
    await phone.goto('http://127.0.0.1:8765/', { waitUntil: 'networkidle' });
    await phone.screenshot({ path: 'verification/mobile-home.png' });
    assert.equal(await phone.locator('#hero').getAttribute('data-scene-state'), 'paused');
    await phone.getByRole('button', { name: '菜单' }).click();
    await phone.getByRole('link', { name: 'Projects', exact: true }).click();
    assert.equal(await phone.locator('#menuToggle').getAttribute('aria-expanded'), 'false');
    await phone.screenshot({ path: 'verification/mobile-projects.png' });
    for (const width of [320, 375, 390, 768, 1024, 1440, 1920]) {
        await page.setViewportSize({ width, height: 900 });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `No horizontal overflow at ${width}px`);
    }
    await phone.locator('#projectsGrid .project-card').first().click();
    await phone.locator('[data-image="0"]').click();
    await phone.keyboard.press('Escape');
    await phone.keyboard.press('Escape');

    const noScript = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const fallback = await noScript.newPage();
    await fallback.route('https://**/*', route => route.abort());
    await fallback.goto('http://127.0.0.1:8765/');
    assert.equal(await fallback.locator('.hero-desc').evaluate(el => getComputedStyle(el).opacity), '1');
    assert.equal(await fallback.locator('#contact').evaluate(el => getComputedStyle(el).opacity), '1');
    assert.equal(await fallback.locator('noscript').first().isVisible(), true);
    assert.equal(await fallback.locator('.send-button').isDisabled(), true);

    const animated = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const animatedPage = await animated.newPage();
    animatedPage.on('pageerror', error => errors.push(error.message));
    await animatedPage.goto('http://127.0.0.1:8765/', { waitUntil: 'networkidle' });
    assert.equal(await animatedPage.locator('#hero').getAttribute('data-scene-state'), 'running');
    await animatedPage.locator('#all-projects').scrollIntoViewIfNeeded();
    await animatedPage.waitForFunction(() => document.querySelector('#hero').dataset.sceneState === 'paused');
    await animatedPage.locator('#allProjectsGrid .project-card').first().scrollIntoViewIfNeeded();
    await animatedPage.waitForFunction(() => !document.querySelector('#allProjectsGrid .project-card').classList.contains('will-reveal'));
    await animatedPage.emulateMedia({ reducedMotion: 'reduce' });
    await animatedPage.waitForFunction(() => document.querySelectorAll('.will-reveal').length === 0);
    assert.equal(await animatedPage.locator('.will-reveal').count(), 0);

    const localFile = await browser.newPage();
    localFile.on('pageerror', error => errors.push(error.message));
    await localFile.goto(require('node:url').pathToFileURL(require('node:path').join(process.cwd(), 'index.html')).href);
    assert.equal(await localFile.locator('#allProjectsGrid .project-card').count(), projectCount);

    assert.deepEqual(errors, [], 'No JavaScript errors');
    assert.deepEqual(failures, [], 'No missing local resources');
    const report = { result: 'passed', projects: projectCount, viewportWidths: [320, 375, 390, 768, 1024, 1440, 1920],
        checks: ['category filters', 'all project details', 'nested dialogs', 'keyboard/focus trap', 'scroll restoration after project navigation', 'clipboard fallback', 'email load failure', 'mock email success', 'duplicate send guard', 'mobile menu', 'reduced motion', 'no-JS readable content', 'no-JS form disabled', 'local network errors', 'offscreen animation pause', 'reveal observer', 'live reduced-motion change', 'direct file opening'],
        initialTransferBytes: initialResources.reduce((total, entry) => total + entry.bytes, 0),
        errors, failures };
    fs.writeFileSync('verification/report.json', JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
