// Requires Playwright + Edge. The historical layout fixture is retained locally
// at verification/pre-void-index.html; old full-site snapshot archives were removed.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const assert = require('node:assert/strict');

(async () => {
    const root = process.cwd();
    const url = pathToFileURL(path.join(root, 'index.html')).href;
    const baselinePath = path.join(root, 'verification/.baseline-preview.html');
    const baseline = fs.readFileSync('verification/pre-void-index.html', 'utf8');
    fs.writeFileSync(baselinePath, baseline.replace('<head>', '<head><base href="' + url + '">'));
    const browser = await chromium.launch({ channel: 'msedge', headless: true });
    try {
        const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, reducedMotion: 'reduce' });
        const page = await context.newPage();
        const original = await context.newPage();
        const errors = [];
        const externalRequests = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
        page.on('request', request => { if (/^https?:/.test(request.url())) externalRequests.push(request.url()); });
        await page.goto(url);
        await original.goto(pathToFileURL(baselinePath).href);
        const selectors = ['#mainNav', '.hero-content', '#heroName', '#heroClock', '#heroDesc', '.hero-action', '#heroScroll', '#projects', '#all-projects', '#about', '#contact'];
        const sizes = [[1440, 900], [1920, 1080], [2560, 1440], [3732, 1853]];
        for (const [width, height] of sizes) {
            await page.setViewportSize({ width, height });
            await original.setViewportSize({ width, height });
            await page.waitForTimeout(200);
            for (const selector of selectors) {
                const actual = await page.locator(selector).boundingBox();
                const before = await original.locator(selector).boundingBox();
                for (const key of ['x', 'y', 'width', 'height']) assert.ok(Math.abs(actual[key] - before[key]) < 1, selector + ' ' + key + ' changed at ' + width);
            }
        }
        await original.close();
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.waitForTimeout(250);
        assert.equal(await page.locator('#hero').getAttribute('data-scene-state'), 'paused');
        // Mask foreground UI (clock and scroll indicator have independent animations).
        const captureBackground = () => page.locator('#heroCanvas').screenshot({ mask: ['.hero-content', '.hero-action', '.hero-scroll', '#sceneToggle'].map(selector => page.locator(selector)) });
        const stillA = await captureBackground();
        await page.waitForTimeout(150);
        const stillB = await captureBackground();
        assert.ok(stillA.equals(stillB), 'Reduced motion must be genuinely static');
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await page.waitForFunction(() => document.querySelector('#hero').dataset.sceneState === 'running');
        await page.waitForTimeout(500);
        const movingA = await captureBackground();
        await page.mouse.move(1510, 310);
        await page.waitForTimeout(500);
        const movingB = await captureBackground();
        assert.ok(!movingA.equals(movingB), 'Animation must change rendered pixels');
        await page.screenshot({ path: 'verification/void-core-desktop.png' });
        await page.locator('#sceneToggle').click();
        assert.equal(await page.locator('#hero').getAttribute('data-scene-state'), 'paused');
        const pausedA = await captureBackground();
        await page.waitForTimeout(180);
        assert.ok(pausedA.equals(await captureBackground()), 'Pause button must stop drawing');
        await page.locator('#sceneToggle').click();
        await page.locator('#projects').scrollIntoViewIfNeeded();
        await page.waitForFunction(() => document.querySelector('#hero').dataset.sceneState === 'paused');
        await page.locator('#projectsGrid .project-card').first().click();
        assert.equal(await page.locator('#detailOverlay').isVisible(), true);
        assert.equal(await page.locator('#hero').getAttribute('data-scene-state'), 'paused');
        await page.keyboard.press('Escape');
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
        await page.waitForFunction(() => document.querySelector('#hero').dataset.sceneState === 'running');
        assert.equal(await page.locator('#allProjectsGrid .project-card').count(), 10);
        assert.deepEqual(errors, []);
        assert.deepEqual(externalRequests, [], 'Background must work completely offline');
        const contextLost = await page.evaluate(() => {
            const extension = document.querySelector('#heroCanvas').getContext('webgl2').getExtension('WEBGL_lose_context');
            if (!extension) return false;
            window.__restoreBackground = () => extension.restoreContext();
            extension.loseContext(); return true;
        });
        if (contextLost) {
            await page.waitForFunction(() => document.querySelector('#hero').dataset.sceneState === 'fallback');
            assert.equal(await page.locator('#hero').evaluate(el => el.classList.contains('scene-ready')), false);
            await page.waitForTimeout(200);
            await page.evaluate(() => window.__restoreBackground());
            await page.waitForFunction(() => document.querySelector('#hero').dataset.sceneState === 'running');
        }
        await page.close();
        const unavailable = await browser.newPage();
        await unavailable.addInitScript(() => {
            const original = HTMLCanvasElement.prototype.getContext;
            HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
                return /webgl/.test(kind) ? null : original.call(this, kind, ...args);
            };
        });
        await unavailable.goto(url);
        assert.equal(await unavailable.locator('#hero').getAttribute('data-scene-state'), 'fallback');
        assert.equal(await unavailable.locator('#allProjectsGrid .project-card').count(), 10);
        assert.equal(await unavailable.locator('#sceneToggle').isVisible(), false);
        const report = { result: 'passed', desktopSizes: sizes, unchangedLayoutElements: selectors,
            checks: ['backup styles/content unchanged', 'rendered animation changes', 'pause stops rendering', 'mouse interaction', 'reduced motion', 'offscreen pause', 'project modal pause', 'WebGL unavailable fallback', 'context loss/restoration', 'offline file opening'], externalRequests, errors };
        fs.writeFileSync('verification/background-report.json', JSON.stringify(report, null, 2));
        console.log(JSON.stringify(report, null, 2));
    } finally {
        await browser.close();
        fs.unlinkSync(baselinePath);
    }
})().catch(error => { console.error(error); process.exit(1); });
