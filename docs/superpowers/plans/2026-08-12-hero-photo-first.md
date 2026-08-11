# Homepage Hero Photo-First Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Present all three homepage team photos at their natural brightness without dark or pale full-image overlays, while retaining a readable large white title that does not cover player faces.

**Architecture:** Keep the existing static hero carousel, image assets, controls, and JavaScript behavior unchanged. Remove the descriptive copy and CSS pseudo-elements that tint the entire photo, then make the title itself readable with a close, layered shadow and subtle text stroke. Validate the markup and styling with the existing Node assertion suite and verify composition at desktop and mobile viewport sizes.

**Tech Stack:** Static HTML, CSS, Node assertion tests, local HTTP server, Playwright visual verification.

## Global Constraints

- Remove the dark overlay from all three hero slides.
- Remove the pale bottom fade from the hero.
- Remove all three small descriptive paragraphs below the large titles.
- Keep the chapter label, large white title, hero actions, statistics, carousel controls, image assets, and carousel behavior.
- Do not add a title card, localized photo scrim, JavaScript, dependency, or new image asset.
- Keep title letter spacing at `0` and use only a close text stroke and shadow for contrast.
- Confirm that no title covers a player face at desktop and mobile viewport sizes.

---

### Task 1: Restore The Hero Photos And Preserve Title Readability

**Files:**
- Modify: `tests/team-memorial-refresh.test.mjs`
- Modify: `index.html:48-69`
- Modify: `css/style.css:192-279`
- Modify: `css/style.css:1613-1623`
- Modify: `css/style.css:2211-2218`

**Interfaces:**
- Consumes: the existing `.hero`, `.hero__slide`, `.hero__content`, `.hero__chapter`, and `.hero__title` structure.
- Produces: a photo-first hero with no `.hero__desc`, `.hero::after`, or `.hero__slide::before` overlay layers.
- Preserves: all existing carousel image attributes, action links, statistics, navigation buttons, dots, and `js/main.js` behavior.

- [ ] **Step 1: Add failing structural assertions**

Add these assertions immediately after the existing hero assertions in `tests/team-memorial-refresh.test.mjs`:

```js
assert.doesNotMatch(html, /class="hero__desc"/);
assert.doesNotMatch(css, /\.hero::after\s*\{/);
assert.doesNotMatch(css, /\.hero__slide::before\s*\{/);
assert.match(css, /\.hero__title\s*\{[^}]*-webkit-text-stroke:\s*0\.6px/s);
assert.match(css, /\.hero__title\s*\{[^}]*letter-spacing:\s*0/s);
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```powershell
node tests/team-memorial-refresh.test.mjs
```

Expected: FAIL because the three descriptive paragraphs and both overlay pseudo-elements still exist, and the title does not yet have the new text stroke.

- [ ] **Step 3: Remove the three descriptive paragraphs**

In `index.html`, leave each `.hero__content` with only its chapter label and title. The first slide should have this shape, and the other two slides should use the same two-element structure with their existing text:

```html
<div class="hero__content">
    <span class="hero__chapter"><span class="hero__eyebrow">生康足球队 / 从凑齐一支队开始</span></span>
    <h1 class="hero__title">人是慢慢凑齐的，球队也是</h1>
</div>
```

Delete all three `<p class="hero__desc">...</p>` elements. Do not change any `data-image`, `data-image-mobile`, title, or chapter text.

- [ ] **Step 4: Remove the full-photo tint layers**

Delete the complete `.hero::after` rule near the base hero styles:

```css
.hero::after {
    content: "";
    position: absolute;
    inset: auto 0 0;
    height: 26%;
    z-index: 6;
    background: linear-gradient(transparent, var(--cream));
    pointer-events: none;
}
```

Delete both `.hero__slide::before` rules: the base rule containing the initial two gradients and the later memorial-refresh override containing the stronger two gradients. This removes every full-image darkening layer rather than replacing it with a lighter tint.

Delete the base `.hero__desc` rule, the later `.hero__desc` memorial-refresh override, and the mobile `.hero__desc` rule because the corresponding markup no longer exists.

- [ ] **Step 5: Strengthen only the title glyphs**

Replace the base `.hero__title` rule with:

```css
.hero__title {
    margin-top: 14px;
    font-size: clamp(2.25rem, 4.25vw, 4.8rem);
    line-height: 1.08;
    font-weight: 900;
    white-space: nowrap;
    letter-spacing: 0;
    -webkit-text-stroke: 0.6px rgba(4, 23, 14, 0.28);
    text-shadow:
        0 2px 3px rgba(4, 23, 14, 0.76),
        0 10px 28px rgba(4, 23, 14, 0.34);
}
```

Change the later memorial-refresh title override to avoid reintroducing nonzero letter spacing:

```css
.hero__title { max-width: 980px; letter-spacing: 0; }
```

Keep the existing mobile title width, size, line height, and natural wrapping rules. Do not add a background, backdrop filter, or pseudo-element behind the title.

- [ ] **Step 6: Run automated verification**

Run:

```powershell
node tests/team-memorial-refresh.test.mjs
python tests/team-workbook-sync.test.py
git diff --check
```

Expected: both test suites pass and `git diff --check` reports no whitespace errors.

- [ ] **Step 7: Verify the desktop composition**

Serve the worktree locally and inspect all three slides at `1440x900`.

Confirm:

- each photo retains its original brightness and color;
- no dark wash or pale bottom haze remains;
- the chapter label and large title are readable without a title card;
- the large title stays in the upper sky/building area and does not cover faces;
- buttons, statistics, arrows, and dots remain usable and visually separated from the photo.

- [ ] **Step 8: Verify the mobile composition and swipe behavior**

Inspect all three slides at `390x844` and `430x932`.

Confirm:

- titles wrap without overflowing or covering faces;
- there is no empty gap where the deleted paragraph previously appeared;
- horizontal hero swiping still changes slides;
- the action buttons remain inside the viewport and do not overlap the title or carousel dots.

- [ ] **Step 9: Commit the implementation**

```powershell
git add index.html css/style.css tests/team-memorial-refresh.test.mjs
git commit -m "Show homepage team photos without overlays"
```

