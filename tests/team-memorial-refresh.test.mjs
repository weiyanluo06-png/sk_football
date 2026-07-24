import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');
const css = readFileSync('css/style.css', 'utf8');
const js = readFileSync('js/main.js', 'utf8');

assert.match(html, /class="hero__chapter"/);
assert.match(html, /class="lineup-rail__header"/);
assert.match(css, /\.hero__frame/);
assert.match(css, /\.lineup-rail__group-number/);
assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(css, /\.season-overview--archive/);
assert.match(css, /\.gallery__item--loaded/);
assert.match(js, /function syncLineupRail\(group\)/);
assert.match(js, /function lazyLoadGalleryImages/);
assert.match(js, /classList\.add\('gallery__item--loaded'\)/);
assert.match(html, /id="recruit"/);
assert.match(html, /assets\/photos\/recruit-qq-group\.jpg/);
assert.match(html, /913800697/);
assert.match(css, /\.recruit__card/);
assert.match(js, /setProperty\('--lineup-roster-count'/);
assert.match(css, /repeat\(var\(--lineup-roster-count\), minmax\(0, 1fr\)\)/);
assert.match(js, /data-player-id/);
assert.match(js, /closest\('\.lineup-card'\)/);
assert.match(css, /\.lineup-card--dim\s*\{[^}]*pointer-events:\s*auto/);
