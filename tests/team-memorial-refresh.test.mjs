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
assert.match(css, /\.newcomer-card__photo\s*\{[^}]*aspect-ratio:\s*4\s*\/\s*5/s);
assert.match(css, /\.newcomer-card__photo img\s*\{[^}]*object-fit:\s*cover/s);
assert.match(css, /\.newcomer-card\s*\{[^}]*flex:\s*0\s*0\s*var\(--newcomer-card-width\)/s);
assert.match(css, /\.newcomers__track\s*\{[^}]*width:\s*max-content/s);
assert.match(css, /\.newcomers--empty[\s\S]*\.newcomers__track/);
assert.match(html, /id="managers"/);
assert.match(html, /id="managerProfiles"/);
assert.match(html, /js\/manager-data\.js/);
assert.ok(
  html.indexOf('id="squad"') < html.indexOf('id="managers"') &&
  html.indexOf('id="managers"') < html.indexOf('id="gallery"')
);
assert.match(js, /var managerData = window\.MANAGER_DATA/);
assert.match(js, /function renderManagers\(\)/);
assert.match(js, /球队经理资料待更新/);
assert.match(css, /\.manager-card__photo\s*\{[^}]*aspect-ratio:\s*4\s*\/\s*5/s);
assert.match(css, /\.manager-profiles\s*\{[^}]*grid-template-columns:\s*repeat\(2,/s);
assert.match(css, /\.manager-card\s*\{[^}]*border-radius:\s*8px/s);
assert.match(css, /\.manager-profiles\s*\{[^}]*scroll-snap-type:\s*x mandatory/s);
assert.match(js, /function initNewcomerMotion\(\)/);
assert.match(js, /requestAnimationFrame/);
assert.match(js, /viewport\.scrollLeft/);
assert.match(js, /prefers-reduced-motion/);
assert.match(js, /visibilitychange/);
assert.match(js, /function getNewcomerDuplicateCount\(distance, viewportWidth\)/);
assert.match(js, /Math\.max\(1, Math\.ceil\(viewportWidth \/ distance\)\)/);
assert.match(js, /while \(duplicates\.length < duplicateCount\)/);

const newcomerMotionHelper = js.match(/function advanceNewcomerMotionOffset\(offset, increment, distance\) \{[\s\S]*?\n    \}/);
assert.ok(newcomerMotionHelper, 'newcomer motion keeps a floating-point logical offset');
const advanceNewcomerMotionOffset = new Function(`${newcomerMotionHelper[0]}; return advanceNewcomerMotionOffset;`)();
assert.equal(advanceNewcomerMotionOffset(0, 0.316, 820), 0.316);
assert.equal(advanceNewcomerMotionOffset(0.316, 0.316, 820), 0.632);
assert.ok(Math.abs(advanceNewcomerMotionOffset(819.8, 0.5, 820) - 0.3) < 1e-9);
assert.ok(Math.abs(advanceNewcomerMotionOffset(1640.2, 0.5, 820) - 0.7) < 1e-9);

const newcomerPauseHelper = js.match(/function createNewcomerPauseState\(\) \{[\s\S]*?\n    \}/);
assert.ok(newcomerPauseHelper, 'newcomer motion tracks independent pause reasons');
const scheduledResumes = new Map();
let nextResumeId = 1;
globalThis.window = {
  setTimeout(callback) {
    const id = nextResumeId++;
    scheduledResumes.set(id, callback);
    return id;
  },
  clearTimeout(id) {
    scheduledResumes.delete(id);
  },
};
const createNewcomerPauseState = new Function(`${newcomerPauseHelper[0]}; return createNewcomerPauseState;`)();
const pauseState = createNewcomerPauseState();
pauseState.pause('hover');
pauseState.pause('focus');
pauseState.resumeLater('hover');
scheduledResumes.get(1)();
assert.equal(pauseState.isPaused(), true, 'focus keeps motion paused after hover resumes');
pauseState.resumeLater('focus');
scheduledResumes.get(2)();
assert.equal(pauseState.isPaused(), false, 'motion resumes after every pause reason clears');
pauseState.pause('touch');
pauseState.resumeLater('touch');
pauseState.pause('touch');
assert.equal(scheduledResumes.has(3), false, 'a renewed touch cancels its pending resume');
delete globalThis.window;

const newcomerMotionSource = js.match(/function initNewcomerMotion\(\) \{[\s\S]*?\n    \}\n\n    function getPlayerById/)[0];
assert.match(newcomerMotionSource, /motionOffset = advanceNewcomerMotionOffset\(motionOffset, delta \* 0\.038, distance\)/);
assert.match(newcomerMotionSource, /viewport\.scrollLeft = motionOffset/);
assert.doesNotMatch(newcomerMotionSource, /viewport\.scrollLeft\s*\+=/);
assert.match(newcomerMotionSource, /viewport\.style\.scrollSnapType = 'none'/);
assert.match(newcomerMotionSource, /mouseenter', function \(\) \{ pauseState\.pause\('hover'\); \}/);
assert.match(newcomerMotionSource, /mouseleave', function \(\) \{ pauseState\.resumeLater\('hover'\); \}/);
assert.match(newcomerMotionSource, /focusin', function \(\) \{ pauseState\.pause\('focus'\); \}/);
assert.match(newcomerMotionSource, /focusout', function \(\) \{ pauseState\.resumeLater\('focus'\); \}/);
assert.match(newcomerMotionSource, /touchstart', function \(\) \{ pauseState\.pause\('touch'\); viewport\.style\.scrollSnapType = ''; \}/);
assert.match(newcomerMotionSource, /touchend', resumeTouchLater/);
assert.match(newcomerMotionSource, /touchcancel', resumeTouchLater/);
assert.match(newcomerMotionSource, /else if \(reduceMotion\.matches\) \{\s*viewport\.style\.scrollSnapType = '';/);
