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
assert.match(css, /\.lineup-scroll-steps\s*\{[^}]*pointer-events:\s*none/);
assert.match(js, /function getDisplayRating\(rating\)/);
assert.match(js, /numericRating < 8 \? numericRating \+ 1 : numericRating/);
assert.match(html, /href="#newcomers">新生<\/a>/);
assert.match(html, /id="newcomers"/);
assert.match(html, /id="newcomerTrack"/);
assert.match(html, /js\/newcomer-data\.js/);
assert.ok(
  html.indexOf('id="recruit"') < html.indexOf('id="newcomers"') &&
  html.indexOf('id="newcomers"') < html.indexOf('id="story"')
);
assert.match(js, /var newcomerData = window\.NEWCOMER_DATA/);
assert.match(js, /function renderNewcomers\(\)/);
assert.match(js, /新生资料待更新/);
assert.match(js, /newcomer-card--duplicate/);
assert.match(js, /aria-hidden="true"/);
