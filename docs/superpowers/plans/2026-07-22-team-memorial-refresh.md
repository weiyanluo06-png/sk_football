# Team Memorial Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the static football memorial site into a cohesive, photo-led desktop and mobile experience without changing real team data or its GitHub Pages deployment model.

**Architecture:** Retain the current HTML, CSS and native JavaScript. Add only presentation hooks and small state helpers for visual behavior; do not add framework, API or runtime dependency. Validate with Node source checks and real desktop/mobile browser screenshots.

**Tech Stack:** HTML, CSS, vanilla JavaScript, WebP, Node, Playwright CLI.

## Global Constraints

- Preserve real photos, player data, historical matches and existing page destinations.
- Use paper-white surfaces, deep green type, restrained accent colors and low-frequency motion.
- Retain the pitch proportion and 4-3-3 lineup data model.
- Keep mobile vertical scrolling natural; horizontal gestures are limited to the hero and lineup areas.
- Support `prefers-reduced-motion` and add no external dependency.

---

### Task 1: Create a refresh contract test

**Files:**
- Create: `tests/team-memorial-refresh.test.mjs`
- Modify: `index.html`
- Modify: `css/style.css`
- Modify: `js/main.js`

**Interfaces:**
- Consumes: hero, lineup and gallery IDs already in the page.
- Produces: a Node test that asserts the required visual hooks and interaction helpers exist.

- [ ] **Step 1: Write the failing test**

```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html = readFileSync('index.html', 'utf8');
const css = readFileSync('css/style.css', 'utf8');
const js = readFileSync('js/main.js', 'utf8');
assert.match(html, /class="hero__chapter"/);
assert.match(html, /class="lineup-rail__header"/);
assert.match(css, /prefers-reduced-motion/);
assert.match(js, /function syncLineupRail/);
assert.match(js, /function lazyLoadGalleryImages/);
```

- [ ] **Step 2: Confirm it fails before implementation**

Run: `node tests/team-memorial-refresh.test.mjs`

Expected: `AssertionError` for missing homepage or lineup hooks.

- [ ] **Step 3: Keep the test in the final project**

The hooks are implemented in Tasks 2-4. Re-run this command after every task and require exit code 0 after Task 4.

### Task 2: Recompose the homepage and global reading system

**Files:**
- Modify: `index.html:44-82`
- Modify: `css/style.css:1-351, 1404-1558`
- Test: `tests/team-memorial-refresh.test.mjs`

**Interfaces:**
- Consumes: `.hero`, `.hero__slide`, existing slide images and `showSlide()`.
- Produces: `.hero__chapter`, `.hero__frame` and reduced-motion rules.

- [ ] **Step 1: Extend the test with the homepage contract**

```js
assert.match(html, /class="hero__chapter"/);
assert.match(css, /\.hero__frame/);
assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
```

- [ ] **Step 2: Run the test and verify the expected red state**

Run: `node tests/team-memorial-refresh.test.mjs`

Expected: `AssertionError` for `hero__chapter`.

- [ ] **Step 3: Implement the season-cover treatment**

Wrap each hero eyebrow in `hero__chapter`. Add a quiet hero frame, stronger horizontal title rhythm, clear desktop slide controls, a safe lower information rail, polished focus states and reduced-motion fallback. Keep mobile text in the upper safe area so it does not cover faces.

- [ ] **Step 4: Verify homepage behavior**

Run: `node --check js/main.js && node tests/team-memorial-refresh.test.mjs`

Expected: exit code 0. Capture desktop and mobile screenshots of `/#hero`; the title must not cover the main faces.

### Task 3: Turn the lineup rail into an archive card

**Files:**
- Modify: `index.html:135-167`
- Modify: `css/style.css:700-930, 1404-1558`
- Modify: `js/main.js:69-163`
- Test: `tests/team-memorial-refresh.test.mjs`

**Interfaces:**
- Consumes: `lineupGroupMeta`, `startingLineup`, `updateLineupFocus(group)` and lineup controls.
- Produces: `syncLineupRail(group)`, `.lineup-rail__header`, `.lineup-rail__group-number`.

- [ ] **Step 1: Extend the test with the lineup contract**

```js
assert.match(html, /class="lineup-rail__header"/);
assert.match(js, /function syncLineupRail\(group\)/);
assert.match(css, /\.lineup-rail__group-number/);
```

- [ ] **Step 2: Confirm the test fails**

Run: `node tests/team-memorial-refresh.test.mjs`

Expected: `AssertionError` for the missing archive-card elements.

- [ ] **Step 3: Implement the card without changing pitch geometry**

Add the rail header and group counter. Extract rail label, roster and progress updates into `syncLineupRail(group)`, called by `updateLineupFocus(group)`. Make the rail a denser editorial card on desktop and a full-width, useful mobile card below the pitch. Use the existing cyclic group order for tabs and swipes.

- [ ] **Step 4: Verify interaction and screenshots**

Run: `node --check js/main.js && node tests/team-memorial-refresh.test.mjs`

Expected: exit code 0. Capture desktop midfield and mobile forward/midfield/goalkeeper states; the green card must have no large empty area.

### Task 4: Refine match archive, photo wall and record surfaces

**Files:**
- Modify: `css/style.css:520-700, 1142-1230`
- Modify: `js/main.js:270-382`
- Test: `tests/team-memorial-refresh.test.mjs`

**Interfaces:**
- Consumes: `renderMatches()`, `renderGallery()`, `galleryItems`, `activeCompetition`, existing like handlers.
- Produces: `.season-overview--archive`, `.gallery__item--loaded`, and retained `lazyLoadGalleryImages(root)` behavior.

- [ ] **Step 1: Extend the test with the archive contract**

```js
assert.match(css, /\.season-overview--archive/);
assert.match(css, /\.gallery__item--loaded/);
assert.match(js, /classList\.add\('gallery__item--loaded'\)/);
```

- [ ] **Step 2: Confirm the test fails**

Run: `node tests/team-memorial-refresh.test.mjs`

Expected: `AssertionError` for gallery loaded-state styling.

- [ ] **Step 3: Implement the archive treatment**

Add the archive modifier to the season overview and clearer real-event metadata. Add a gallery loaded state as backgrounds are assigned, then refine tabs, timeline, honors, player cards and modal spacing into the paper-and-ink system. Keep photo click and like click as independent interactions.

- [ ] **Step 4: Verify gallery behavior**

Run: `node --check js/main.js && node tests/team-memorial-refresh.test.mjs`

Expected: exit code 0. Capture gallery screenshots and verify a like does not open the photo modal.

### Task 5: Complete cross-device QA and release

**Files:**
- Modify: `index.html` cache versions only if CSS or JavaScript changes.
- Test: `tests/team-memorial-refresh.test.mjs`

**Interfaces:**
- Consumes: complete UI and the local HTTP server.
- Produces: a verified `main` commit ready for GitHub Pages.

- [ ] **Step 1: Run non-visual verification**

```powershell
node --check js/main.js
node --check js/team-data.js
node --check js/gallery-data.js
node tests/team-memorial-refresh.test.mjs
git diff --check
```

Expected: every command exits 0.

- [ ] **Step 2: Run visual QA**

Capture desktop and mobile screenshots for homepage, lineup midpoint, gallery and player modal. Test hero swipe, lineup cyclic swipe, lineup tabs, season index, gallery filters, likes and modal close.

- [ ] **Step 3: Commit and push**

```powershell
git add index.html css/style.css js/main.js tests/team-memorial-refresh.test.mjs
git commit -m "Refine team memorial visual experience"
git push origin main
```

Expected: `main` is pushed and GitHub Pages begins deployment.
