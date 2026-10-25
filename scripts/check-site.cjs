// Run with Node.js. Checks local content and image links without contacting third parties.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = process.cwd();
const context = { window: {} };
for (const file of ['assets/content.js', 'assets/image-manifest.js', 'assets/main.js', 'assets/hero-scene.js']) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    new vm.Script(source, { filename: file });
    if (['assets/content.js', 'assets/image-manifest.js'].includes(file)) vm.runInNewContext(source, context);
}
const content = context.window.portfolioContent;
const manifest = context.window.portfolioImages;
const exists = file => assert.ok(fs.existsSync(path.join(root, file)), `Missing local file: ${file}`);
const checked = new Set();
function check(file) {
    if (/^https?:/.test(file)) return;
    exists(file);
    checked.add(file);
}
check(content.heroImage);
assert.ok(content.projects.length);
assert.ok(content.projects.some(project => project.featured), 'At least one featured project required');
const ids = new Set();
for (const project of content.projects) {
    assert.ok(project.title && project.category && project.desc, 'Missing project text');
    if (project.id) {
        assert.ok(!ids.has(project.id), `Duplicate project id: ${project.id}`);
        ids.add(project.id);
    }
    [project.thumb, ...project.gallery, ...project.documents.map(doc => doc.url)].forEach(check);
}
for (const [original, entry] of Object.entries(manifest)) {
    check(original);
    entry.variants.forEach(item => check(item.src));
}
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    if (!/^(?:https?:|mailto:)/.test(match[1])) check(match[1]);
}
const htmlIds = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(htmlIds).size, htmlIds.length, 'Duplicate HTML id');
assert.ok(!/\bon(?:click|load|error|contextmenu)=/.test(html), 'Inline interaction handler remains');
console.log(JSON.stringify({ projects: content.projects.length, verifiedLocalFiles: checked.size, syntax: 'passed' }));
