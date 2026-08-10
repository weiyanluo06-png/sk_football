# Material Team Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a safe, responsive homepage button that opens the Material College football team website.

**Architecture:** Extend the existing hero action group with one semantic external anchor using the established `hero__cta` component. Keep desktop styling unchanged and add a narrow-screen modifier that lets all three actions fit without overlapping the hero controls.

**Tech Stack:** Static HTML, CSS, Font Awesome, Node assertion test, Playwright visual verification.

## Global Constraints

- The target URL is exactly `https://weiyanluo06-png.github.io/wtu-football/`.
- The visible label is exactly `材料足球队`.
- The link opens in a new tab with `target="_blank"` and `rel="noopener noreferrer"`.
- Desktop actions stay in one row; narrow screens may wrap only when necessary.
- No new JavaScript, dependency, page, or data source is introduced.

---

### Task 1: Add And Verify The Material Team Link

**Files:**
- Modify: `tests/team-memorial-refresh.test.mjs`
- Modify: `index.html:72-75`
- Modify: `css/style.css:2217-2218`

**Interfaces:**
- Consumes: the existing `.hero__actions` container and `.hero__cta` button component.
- Produces: an external anchor with class `hero__cta hero__cta--external` and responsive styles for the three-action group.

- [ ] **Step 1: Write the failing test**

Add these assertions beside the existing hero checks:

```js
assert.match(html, /href="https:\/\/weiyanluo06-png\.github\.io\/wtu-football\/"/);
assert.match(html, /target="_blank"/);
assert.match(html, /rel="noopener noreferrer"/);
assert.match(html, /材料足球队/);
assert.match(css, /\.hero__cta--external/);
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node tests/team-memorial-refresh.test.mjs`

Expected: FAIL because the Material College link and `.hero__cta--external` style do not exist.

- [ ] **Step 3: Add the external hero action**

Append this link after “打开影像墙” in `.hero__actions`:

```html
<a href="https://weiyanluo06-png.github.io/wtu-football/"
   class="hero__cta hero__cta--external"
   target="_blank"
   rel="noopener noreferrer"
   aria-label="打开材料学院足球队网站">
    <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
    材料足球队
</a>
```

- [ ] **Step 4: Add the narrow-screen layout rule**

Inside the existing `@media screen and (max-width: 760px)` hero rules, use:

```css
.hero__actions {
    flex-wrap: wrap;
    max-width: 88%;
}
.hero__cta--external { white-space: nowrap; }
@media screen and (max-width: 420px) {
    .hero__actions { gap: 7px; }
    .hero__cta { padding: 8px 10px; font-size: 0.76rem; }
}
```

- [ ] **Step 5: Run automated verification**

Run:

```powershell
node tests/team-memorial-refresh.test.mjs
python tests/team-workbook-sync.test.py
git diff --check
```

Expected: both test suites pass and `git diff --check` reports no errors.

- [ ] **Step 6: Verify the rendered layout and navigation**

Open the local page at desktop and 390px mobile widths. Confirm the three actions are readable, do not overlap the hero statistics or carousel controls, and the new link resolves to the exact target URL in a new tab.

- [ ] **Step 7: Commit the implementation**

```powershell
git add index.html css/style.css tests/team-memorial-refresh.test.mjs
git commit -m "Add material team homepage link"
```
