# Team Managers Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a permanent, spreadsheet-driven team manager section between the player archive and photo wall without allowing manager records into player statistics, lineups, or newcomer data.

**Architecture:** Add a dedicated `球队经理` workbook sheet and generate `window.MANAGER_DATA` into its own JavaScript file. The existing static page reads that file and renders either two equal manager profiles or one honest empty state; CSS handles the two-column desktop layout and touch-friendly mobile horizontal snap.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Python 3, openpyxl, Node.js contract tests, Python unittest, Playwright browser verification.

## Global Constraints

- The section order is player archive, team managers, photo wall.
- Do not add a top-navigation item for this two-person section.
- Do not put managers into player arrays, ratings, match statistics, lineups, squad switching, featured player cards, or newcomer data.
- Use the existing green, paper white, and dark gray palette; card radius must not exceed `8px`.
- Use `4:5` portrait images with `object-fit: cover` and configurable `object-position`.
- Do not invent names, photos, grades, duties, or introductions when source data is absent.
- Desktop shows both profiles directly; mobile uses manual horizontal scrolling with snap and no autoplay.

---

### Task 1: Isolated Manager Workbook Data

**Files:**
- Modify: `tests/team-workbook-sync.test.py`
- Modify: `tools/sync_team_workbook.py`
- Modify: `data/生康足球队数据源.xlsx`
- Create: `js/manager-data.js`

**Interfaces:**
- Consumes: workbook rows from sheet `球队经理`.
- Produces: `manager_payload(rows) -> {'managers': list[dict]}` and `window.MANAGER_DATA = { managers: [...] }`.

- [x] **Step 1: Write failing workbook and payload tests**

Add `MANAGER_DATA_PATH`, `load_manager_data()`, and tests that require these exact headers:

```python
[
    '排序', '姓名', '年级', '加入赛季', '身份', '职责',
    '个人介绍', '照片文件名', '照片焦点', '展示状态',
]
```

Test a visible fixture and a hidden fixture. Assert that the visible output is:

```python
{
    'managers': [{
        'order': 1,
        'name': 'Fixture Manager',
        'grade': '2026级',
        'season': '2026-2027',
        'role': '球队经理',
        'duties': '协助球队日常事务、比赛记录、人员联络与赛场保障。',
        'intro': '和球队一起记录每一次出发。',
        'photo': 'assets/managers/fixture-manager.webp',
        'photoPosition': '50% 30%',
    }],
}
```

Also assert that official players, `startingLineup`, and `NEWCOMER_DATA` do not contain `Fixture Manager`.

- [x] **Step 2: Run the workbook tests and confirm failure**

Run:

```powershell
python tests/team-workbook-sync.test.py
```

Expected: failure because `球队经理`, `manager_payload`, and `manager-data.js` do not exist.

- [x] **Step 3: Implement workbook creation and manager serialization**

Add:

```python
MANAGER_HEADERS = [
    '排序', '姓名', '年级', '加入赛季', '身份', '职责',
    '个人介绍', '照片文件名', '照片焦点', '展示状态',
]
```

Implement `ensure_manager_sheet(workbook)` using `style_table()` and `append_table(..., 'TeamManagers')`. Implement `manager_payload(rows)` to retain only rows whose `展示状态` is `展示` and whose `姓名` is non-empty, sort by `排序`, default `身份` to `球队经理`, default `职责` to the approved common duties sentence, prefix photos with `assets/managers/`, and default focus to `50% 50%`.

Implement:

```python
def write_manager_data(payload, path):
    source = 'window.MANAGER_DATA = ' + json.dumps(
        payload, ensure_ascii=False, indent=4
    ) + ';\n'
    path.write_text(source, encoding='utf-8')
```

Extend `sync_workbook()` with `manager_output_path`, call `ensure_manager_sheet()`, and write manager data after saving the workbook. Pass `ROOT / 'js' / 'manager-data.js'` from `main()`.

- [x] **Step 4: Run the sync tool and workbook tests**

Run:

```powershell
python tools/sync_team_workbook.py
python tests/team-workbook-sync.test.py
```

Expected: the workbook includes an empty styled `球队经理` sheet, `js/manager-data.js` contains `{"managers": []}`, and all workbook tests pass.

---

### Task 2: Manager Section and Responsive Profiles

**Files:**
- Modify: `tests/team-memorial-refresh.test.mjs`
- Modify: `index.html`
- Modify: `js/main.js`
- Modify: `css/style.css`

**Interfaces:**
- Consumes: `window.MANAGER_DATA.managers` from Task 1.
- Produces: `renderManagers()` and DOM section `#managers` containing `#managerProfiles`.

- [x] **Step 1: Write failing page contract tests**

Require:

```javascript
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
assert.match(css, /scroll-snap-type:\s*x mandatory/);
```

- [x] **Step 2: Run the page contract test and confirm failure**

Run:

```powershell
node tests/team-memorial-refresh.test.mjs
```

Expected: failure because the manager section and renderer are absent.

- [x] **Step 3: Add the section markup and data script**

Insert after `</section>` for `#squad` and before `#gallery`:

```html
<section class="section reveal managers" id="managers">
    <div class="section__heading managers__heading">
        <span class="section__kicker">TEAM MANAGERS</span>
        <h2 class="section__title">场边同行</h2>
        <p class="section__subtitle">球场上的十一人之外，也有人陪球队走过每一次训练和比赛。</p>
    </div>
    <div class="manager-profiles" id="managerProfiles" aria-label="球队经理"></div>
</section>
```

Load `js/manager-data.js` after `js/newcomer-data.js` and before `js/main.js`.

- [x] **Step 4: Render real profiles and the honest empty state**

At the top of `js/main.js`, read:

```javascript
var managerData = window.MANAGER_DATA || {};
var managers = managerData.managers || [];
```

Implement `managerCardHtml(item)` with an image using `loading="lazy"`, `decoding="async"`, and `object-position`; use a shield and `照片待更新` when no image exists. Render name, role, grade/season, duties, and intro only when available.

Implement `renderManagers()` so no-data output is exactly one non-person card containing `球队经理资料待更新`, and call it from `init()` after `renderNewcomers()`.

- [x] **Step 5: Add desktop and mobile styles**

Use a restrained full-width section band. Desktop `.manager-profiles` is a two-column grid with a maximum content width, and each `.manager-card` uses a `minmax(0, 0.92fr) minmax(260px, 1.08fr)` photo/content layout. On screens at or below `760px`, change the container to horizontal flex scrolling with `scroll-snap-type: x mandatory`, set each card to about `82vw`, and stack photo above copy. Do not add autoplay or JavaScript swipe interception.

- [x] **Step 6: Run the page contract test**

Run:

```powershell
node tests/team-memorial-refresh.test.mjs
```

Expected: pass.

---

### Task 3: Full Verification and Visual Review

**Files:**
- Verify: `index.html`
- Verify: `css/style.css`
- Verify: `js/main.js`
- Verify: `js/manager-data.js`
- Verify: `data/生康足球队数据源.xlsx`

**Interfaces:**
- Consumes: completed Task 1 and Task 2 outputs.
- Produces: verified desktop/mobile manager section ready for real records.

- [ ] **Step 1: Run all automated checks**

Run:

```powershell
python tests/team-workbook-sync.test.py
node tests/team-memorial-refresh.test.mjs
git diff --check
```

Expected: all tests pass and `git diff --check` reports no errors.

- [ ] **Step 2: Start the local static site**

Run the existing Python static server on an unused local port and open `/#managers`.

- [ ] **Step 3: Verify desktop behavior at 1440 x 1000**

Confirm the section is between player archive and photo wall, uses the approved empty state without fake people, aligns with the existing content width, and introduces no overlap or horizontal page overflow.

- [ ] **Step 4: Verify mobile behavior at 390 x 844**

Confirm the empty state fits the viewport. In a fixture render with two manager records, confirm one profile is emphasized, the next profile remains partially visible, manual horizontal swipe snaps cleanly, and vertical page scrolling remains normal.

- [ ] **Step 5: Review the final diff**

Confirm only the manager feature, tests, workbook sheet, and related documentation changed. Keep real manager records empty until the user supplies names and photos.
