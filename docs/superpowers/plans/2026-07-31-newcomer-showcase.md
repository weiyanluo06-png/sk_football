# Newcomer Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a permanent newcomer showcase after recruitment, driven by an isolated Excel sheet, with equal-size cards, a truthful empty state, and smooth leftward scrolling that does not affect the official roster or lineup.

**Architecture:** Add a `新生展示` sheet to the existing workbook and extend the sync tool to generate `js/newcomer-data.js` instead of mixing newcomers into `PONYTAIL_DATA.players`. `index.html`, `css/style.css`, and `js/main.js` render the permanent section; real newcomer cards use a duplicated visual track with `requestAnimationFrame`-driven native horizontal scrolling, while an empty data set renders three static, non-fictional placeholder cards.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Python 3, openpyxl, Node.js assertion tests, GitHub Pages.

## Global Constraints

- The section remains visible even when newcomer data is empty.
- Empty-state cards must not invent names, positions, photos, ratings, or reviews.
- Newcomers must not enter `PONYTAIL_DATA.players`, the player count, featured cards, the lineup, or the squad editor.
- Every real photo uses a fixed `4:5` display area; all cards are equal width and height.
- Real cards move left at approximately `38px/s`; placeholders remain static.
- Hover, keyboard focus, touch, hidden browser tabs, and reduced-motion preference pause automatic movement.
- Mobile users can drag horizontally without blocking ordinary vertical page scrolling.
- No new framework, carousel dependency, database, backend, or admin interface.
- Existing player ratings, match data, gallery data, and lineup data remain unchanged.

---

## File Structure

- Create `js/newcomer-data.js`: generated static newcomer payload only.
- Modify `tools/sync_team_workbook.py`: create/read the newcomer sheet and write the isolated data file.
- Modify `data/生康足球队数据源.xlsx`: add the styled `新生展示` sheet.
- Modify `index.html`: add navigation, permanent section markup, and data script.
- Modify `js/main.js`: render real/empty newcomer cards and manage scrolling.
- Modify `css/style.css`: newcomer visual system, equal cards, responsive layout, placeholders, reduced-motion behavior.
- Modify `tests/team-workbook-sync.test.py`: verify workbook schema and roster isolation.
- Modify `tests/team-memorial-refresh.test.mjs`: verify page, style, rendering, and motion contracts.
- Modify `README.md`: document the newcomer data workflow.
- Modify `docs/生康足球队纪念站-项目交接手册.md`: document adding, hiding, and promoting newcomers.

---

### Task 1: Isolated Newcomer Workbook Pipeline

**Files:**
- Modify: `tests/team-workbook-sync.test.py`
- Modify: `tools/sync_team_workbook.py`
- Create: `js/newcomer-data.js`
- Modify: `data/生康足球队数据源.xlsx`

**Interfaces:**
- Consumes: Excel sheet `新生展示`.
- Produces: `window.NEWCOMER_DATA = { season: string, newcomers: Newcomer[] }`.
- `Newcomer`: `{ order, name, grade, number, pos, role, preferredFoot, style, intro, photo, photoPosition }`.

- [ ] **Step 1: Write failing workbook and isolation tests**

Add to `tests/team-workbook-sync.test.py`:

```python
def load_newcomer_data():
    script = """
const fs = require('fs');
const vm = require('vm');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync('js/newcomer-data.js', 'utf8'), context);
process.stdout.write(JSON.stringify(context.window.NEWCOMER_DATA));
"""
    result = subprocess.run(['node', '-e', script], cwd=ROOT, check=True, capture_output=True)
    return json.loads(result.stdout.decode('utf-8'))
```

Add test methods:

```python
def test_workbook_has_isolated_newcomer_sheet(self):
    workbook = load_workbook(WORKBOOK_PATH, data_only=False)
    self.assertIn('新生展示', workbook.sheetnames)
    headers = [cell.value for cell in workbook['新生展示'][1]]
    self.assertEqual(headers, [
        '排序', '姓名', '年级', '号码', '主位置', '可胜任位置',
        '惯用脚', '踢球风格', '自我介绍', '照片文件名', '照片焦点', '展示状态',
    ])

def test_newcomers_are_not_official_players(self):
    workbook = load_workbook(WORKBOOK_PATH, data_only=True)
    rows = list(workbook['新生展示'].iter_rows(min_row=2, values_only=True))
    visible_names = {row[1] for row in rows if row[0] is not None and row[11] == '展示'}
    newcomer_names = {item['name'] for item in load_newcomer_data()['newcomers']}
    official_names = {item['name'] for item in load_site_data()['players']}
    self.assertEqual(newcomer_names, visible_names)
    self.assertTrue(newcomer_names.isdisjoint(official_names))
```

- [ ] **Step 2: Run the Python test and verify RED**

Run:

```powershell
python tests\team-workbook-sync.test.py
```

Expected: FAIL because `新生展示` and `js/newcomer-data.js` do not exist.

- [ ] **Step 3: Add the workbook schema and data serializer**

In `tools/sync_team_workbook.py`, add:

```python
NEWCOMER_HEADERS = [
    '排序', '姓名', '年级', '号码', '主位置', '可胜任位置',
    '惯用脚', '踢球风格', '自我介绍', '照片文件名', '照片焦点', '展示状态',
]


def ensure_newcomer_sheet(workbook):
    if '新生展示' not in workbook.sheetnames:
        sheet = workbook.create_sheet('新生展示')
        sheet.append(NEWCOMER_HEADERS)
    sheet = workbook['新生展示']
    style_table(sheet, {
        'A': 8, 'B': 12, 'C': 10, 'D': 8, 'E': 10, 'F': 18,
        'G': 10, 'H': 18, 'I': 34, 'J': 24, 'K': 14, 'L': 12,
    })
    append_table(sheet, 'NewcomerShowcase')
    return sheet


def newcomer_payload(rows):
    visible = [row for row in rows if str(row.get('展示状态') or '').strip() == '展示']
    visible.sort(key=lambda row: (row.get('排序') is None, row.get('排序') or 0))
    newcomers = []
    for row in visible:
        filename = str(row.get('照片文件名') or '').strip()
        newcomers.append({
            'order': row.get('排序'),
            'name': str(row.get('姓名') or '').strip(),
            'grade': str(row.get('年级') or '').strip(),
            'number': row.get('号码'),
            'pos': str(row.get('主位置') or '').strip(),
            'role': str(row.get('可胜任位置') or '').strip(),
            'preferredFoot': str(row.get('惯用脚') or '').strip(),
            'style': str(row.get('踢球风格') or '').strip(),
            'intro': str(row.get('自我介绍') or '').strip(),
            'photo': f'assets/players/{filename}' if filename else '',
            'photoPosition': str(row.get('照片焦点') or '50% 50%').strip(),
        })
    season = next((item['grade'].replace('级', '') for item in newcomers if item['grade']), '')
    return {'season': season, 'newcomers': newcomers}


def write_newcomer_data(payload):
    path = ROOT / 'js' / 'newcomer-data.js'
    source = 'window.NEWCOMER_DATA = ' + json.dumps(
        payload, ensure_ascii=False, indent=4
    ) + ';\n'
    path.write_text(source, encoding='utf-8')
```

In `main()`, call `ensure_newcomer_sheet(workbook)` before saving, then after saving:

```python
write_newcomer_data(newcomer_payload(read_rows(workbook['新生展示'])))
```

- [ ] **Step 4: Run the sync tool to create the real sheet and data file**

Run:

```powershell
python tools\sync_team_workbook.py
```

Expected: workbook gains `新生展示`; `js/newcomer-data.js` contains an empty `newcomers` array; official player data is unchanged.

- [ ] **Step 5: Run the Python test and verify GREEN**

Run:

```powershell
python tests\team-workbook-sync.test.py
```

Expected: all tests PASS.

- [ ] **Step 6: Commit the isolated data pipeline**

```powershell
git add tests/team-workbook-sync.test.py tools/sync_team_workbook.py data/生康足球队数据源.xlsx js/newcomer-data.js
git commit -m "Add isolated newcomer data pipeline"
```

---

### Task 2: Permanent Section and Truthful Empty State

**Files:**
- Modify: `tests/team-memorial-refresh.test.mjs`
- Modify: `index.html`
- Modify: `js/main.js`

**Interfaces:**
- Consumes: `window.NEWCOMER_DATA`.
- Produces: `renderNewcomers()` and markup inside `#newcomerTrack`.
- Empty state: three `.newcomer-card--placeholder` cards with no invented person data.

- [ ] **Step 1: Write failing structure and rendering tests**

Append to `tests/team-memorial-refresh.test.mjs`:

```javascript
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
```

- [ ] **Step 2: Run the Node test and verify RED**

Run:

```powershell
node tests\team-memorial-refresh.test.mjs
```

Expected: FAIL because the newcomer section and renderer do not exist.

- [ ] **Step 3: Add permanent semantic markup**

In `index.html`:

1. Add `<a class="header__nav-link" href="#newcomers">新生</a>` after the recruitment link.
2. Add this section after `</section>` for `#recruit`:

```html
<section class="section reveal newcomers" id="newcomers">
    <div class="newcomers__heading">
        <span class="section__kicker" id="newcomerKicker">NEW FACES</span>
        <h2 class="section__title">新赛季，新面孔</h2>
        <p class="section__subtitle">欢迎新学期来到球队的新队员。认识他们，也记住他们加入球队时最初的样子。</p>
    </div>
    <div class="newcomers__viewport" id="newcomerViewport" aria-label="新生球员展示" tabindex="0">
        <div class="newcomers__track" id="newcomerTrack"></div>
    </div>
</section>
```

3. Load `js/newcomer-data.js` after `team-data.js` and before `main.js`.

- [ ] **Step 4: Add minimal real and empty-state rendering**

At the top of `js/main.js`:

```javascript
var newcomerData = window.NEWCOMER_DATA || {};
var newcomers = newcomerData.newcomers || [];
var newcomerMotion = null;
```

Add helpers:

```javascript
function newcomerCardHtml(item, extraClass, hidden) {
    var photo = item.photo
        ? '<img src="' + escapeHtml(item.photo) + '" alt="" loading="lazy" decoding="async" style="object-position:' +
          escapeHtml(item.photoPosition || '50% 50%') + ';">'
        : '<i class="fa-solid fa-shield-heart" aria-hidden="true"></i><span>照片待更新</span>';
    var number = item.number !== '' && item.number != null
        ? '<b>NO. ' + escapeHtml(item.number) + '</b>'
        : '';
    var meta = [item.grade, item.pos, item.role, item.preferredFoot].filter(Boolean).join(' · ');
    return '<article class="newcomer-card ' + (extraClass || '') + '"' +
        (hidden ? ' aria-hidden="true"' : '') + '>' +
        '<div class="newcomer-card__photo">' + photo +
        '</div><div class="newcomer-card__body"><div class="newcomer-card__top"><strong>' +
        escapeHtml(item.name) + '</strong>' + number + '</div>' +
        '<p class="newcomer-card__meta">' + escapeHtml(meta) + '</p>' +
        '<p class="newcomer-card__intro">' + escapeHtml(item.intro || '新赛季，一起上场。') + '</p>' +
        '<span class="newcomer-card__style">' +
        escapeHtml(item.style || '等待第一次训练记录') +
        '</span></div></article>';
}

function placeholderNewcomerHtml() {
    return '<article class="newcomer-card newcomer-card--placeholder">' +
        '<div class="newcomer-card__photo"><i class="fa-solid fa-shield-heart" aria-hidden="true"></i></div>' +
        '<div class="newcomer-card__body"><div class="newcomer-card__top"><strong>新生资料待更新</strong></div>' +
        '<p class="newcomer-card__meta">新学期见</p>' +
        '<p class="newcomer-card__intro">等待新面孔加入。</p>' +
        '<span class="newcomer-card__style">NEW FACES</span></div></article>';
}

function renderNewcomers() {
    var track = $('newcomerTrack');
    var section = $('newcomers');
    var kicker = $('newcomerKicker');
    if (!track || !section) return;
    if (kicker) {
        kicker.textContent = 'NEW FACES' + (newcomerData.season ? ' / ' + newcomerData.season : '');
    }
    section.classList.toggle('newcomers--empty', newcomers.length === 0);
    if (!newcomers.length) {
        track.innerHTML = [placeholderNewcomerHtml(), placeholderNewcomerHtml(), placeholderNewcomerHtml()].join('');
        return;
    }
    var originals = newcomers.map(function (item) { return newcomerCardHtml(item, '', false); }).join('');
    var duplicates = newcomers.map(function (item) {
        return newcomerCardHtml(item, 'newcomer-card--duplicate', true);
    }).join('');
    track.innerHTML =
        '<div class="newcomers__sequence">' + originals + '</div>' +
        '<div class="newcomers__sequence newcomers__sequence--duplicate" aria-hidden="true">' +
        duplicates + '</div>';
}
```

Call `renderNewcomers()` near the start of `init()`.

- [ ] **Step 5: Run the Node test and verify GREEN**

Run:

```powershell
node tests\team-memorial-refresh.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit the permanent section and renderer**

```powershell
git add tests/team-memorial-refresh.test.mjs index.html js/main.js
git commit -m "Add permanent newcomer showcase"
```

---

### Task 3: Equal Cards and Leftward Motion

**Files:**
- Modify: `tests/team-memorial-refresh.test.mjs`
- Modify: `css/style.css`
- Modify: `js/main.js`

**Interfaces:**
- Consumes: `#newcomerViewport`, `#newcomerTrack`, duplicated real cards.
- Produces: `initNewcomerMotion()` and the CSS custom property `--newcomer-card-width`.

- [ ] **Step 1: Write failing style and behavior tests**

Append:

```javascript
assert.match(css, /\.newcomer-card__photo\s*\{[^}]*aspect-ratio:\s*4\s*\/\s*5/s);
assert.match(css, /\.newcomer-card__photo img\s*\{[^}]*object-fit:\s*cover/s);
assert.match(css, /\.newcomer-card\s*\{[^}]*flex:\s*0\s*0\s*var\(--newcomer-card-width\)/s);
assert.match(css, /\.newcomers__track\s*\{[^}]*width:\s*max-content/s);
assert.match(css, /\.newcomers--empty[\s\S]*\.newcomers__track/);
assert.match(js, /function initNewcomerMotion\(\)/);
assert.match(js, /requestAnimationFrame/);
assert.match(js, /viewport\.scrollLeft/);
assert.match(js, /prefers-reduced-motion/);
assert.match(js, /visibilitychange/);
```

- [ ] **Step 2: Run the Node test and verify RED**

Run:

```powershell
node tests\team-memorial-refresh.test.mjs
```

Expected: FAIL on the missing newcomer styles and motion controller.

- [ ] **Step 3: Add newcomer visual styles**

Add a dedicated newcomer block to `css/style.css` using:

```css
.newcomers {
    overflow: hidden;
    background: var(--cream);
    border-top: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
}
.newcomers__heading { padding: 0 5vw 30px; }
.newcomers__viewport {
    overflow-x: auto;
    scrollbar-width: none;
    overscroll-behavior-inline: contain;
    touch-action: pan-x pan-y;
}
.newcomers__viewport::-webkit-scrollbar { display: none; }
.newcomers__track {
    --newcomer-card-width: clamp(220px, 18vw, 240px);
    display: flex;
    width: max-content;
    padding: 4px 0 28px;
}
.newcomers__sequence {
    display: flex;
    gap: 14px;
    padding-left: 5vw;
}
.newcomer-card {
    flex: 0 0 var(--newcomer-card-width);
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: 7px;
    background: var(--paper);
    box-shadow: 0 12px 28px rgba(15, 61, 42, 0.08);
}
.newcomer-card__photo {
    display: grid;
    place-items: center;
    width: 100%;
    aspect-ratio: 4 / 5;
    overflow: hidden;
    background: #dce5df;
    color: var(--green);
    font-size: 2rem;
}
.newcomer-card__photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.newcomer-card__photo span {
    display: block;
    font-size: 0.72rem;
    font-weight: 800;
}
.newcomer-card__body {
    min-height: 168px;
    padding: 14px 15px 16px;
}
.newcomer-card__top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
}
.newcomer-card__top strong { color: var(--ink); font-size: 1.14rem; }
.newcomer-card__top b { color: var(--green); font: 700 0.78rem Oswald, sans-serif; }
.newcomer-card__meta { min-height: 36px; margin-top: 5px; color: var(--muted); font-size: 0.78rem; }
.newcomer-card__intro {
    min-height: 42px;
    margin-top: 10px;
    color: var(--green-dark);
    font-size: 0.8rem;
    line-height: 1.65;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
}
.newcomer-card__style {
    display: inline-block;
    margin-top: 9px;
    padding: 5px 8px;
    border-radius: var(--radius-full);
    background: var(--line);
    color: var(--green-dark);
    font-size: 0.66rem;
    font-weight: 900;
}
.newcomer-card--placeholder .newcomer-card__photo {
    background: #e7eee8;
}
.newcomers--empty .newcomers__track {
    width: auto;
    justify-content: center;
    gap: 14px;
    padding-inline: 5vw;
}
@media (max-width: 760px) {
    .newcomers__heading { padding-inline: 20px; }
    .newcomers__viewport { scroll-snap-type: x mandatory; }
    .newcomers__track {
        --newcomer-card-width: 70vw;
    }
    .newcomers__sequence { padding-left: 20px; }
    .newcomer-card { scroll-snap-align: start; }
    .newcomers--empty .newcomers__track {
        justify-content: flex-start;
        padding-inline: 20px;
    }
}
@media (prefers-reduced-motion: reduce) {
    .newcomers__viewport { scroll-behavior: auto; }
}
```

- [ ] **Step 4: Implement native horizontal motion**

Add to `js/main.js`:

```javascript
function initNewcomerMotion() {
    var section = $('newcomers');
    var viewport = $('newcomerViewport');
    var track = $('newcomerTrack');
    if (!section || !viewport || !track || !newcomers.length) return;

    var paused = false;
    var resumeTimer = 0;
    var lastTime = 0;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function setPaused(value) {
        paused = value;
        if (resumeTimer) window.clearTimeout(resumeTimer);
    }
    function resumeLater() {
        if (resumeTimer) window.clearTimeout(resumeTimer);
        resumeTimer = window.setTimeout(function () { paused = false; }, 1200);
    }
    function frame(time) {
        var firstSequence = track.querySelector('.newcomers__sequence');
        var distance = firstSequence ? firstSequence.offsetWidth : 0;
        if (!paused && !reduceMotion.matches && !document.hidden && distance > 0) {
            var delta = lastTime ? Math.min(50, time - lastTime) : 0;
            viewport.scrollLeft += delta * 0.038;
            if (viewport.scrollLeft >= distance) viewport.scrollLeft -= distance;
        }
        lastTime = time;
        newcomerMotion = window.requestAnimationFrame(frame);
    }

    viewport.addEventListener('mouseenter', function () { setPaused(true); });
    viewport.addEventListener('mouseleave', resumeLater);
    viewport.addEventListener('focusin', function () { setPaused(true); });
    viewport.addEventListener('focusout', resumeLater);
    viewport.addEventListener('touchstart', function () { setPaused(true); }, { passive: true });
    viewport.addEventListener('touchend', resumeLater, { passive: true });
    document.addEventListener('visibilitychange', function () {
        lastTime = performance.now();
    });
    newcomerMotion = window.requestAnimationFrame(frame);
}
```

Call `initNewcomerMotion()` immediately after `renderNewcomers()` in `init()`.

- [ ] **Step 5: Run the Node test and verify GREEN**

Run:

```powershell
node tests\team-memorial-refresh.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit equal cards and motion**

```powershell
git add tests/team-memorial-refresh.test.mjs css/style.css js/main.js
git commit -m "Add smooth newcomer card motion"
```

---

### Task 4: Maintenance Documentation

**Files:**
- Modify: `README.md`
- Modify: `docs/生康足球队纪念站-项目交接手册.md`

**Interfaces:**
- Consumes: workbook and sync behavior from Task 1.
- Produces: exact maintainer instructions for adding, hiding, and promoting newcomers.

- [ ] **Step 1: Add the README workflow**

Document:

```markdown
### 更新新生展示

1. 打开 `data/生康足球队数据源.xlsx` 的“新生展示”工作表。
2. 按表头填写真实资料，把“展示状态”设为“展示”。
3. 将照片放入 `assets/players/`，并在表格中填写文件名。
4. 运行 `python tools/sync_team_workbook.py`。
5. 在桌面端和手机端检查照片裁切、卡片滚动和导航锚点。

新生正式进入大名单时，将其加入“球员数据”，再从“新生展示”删除或隐藏。
```

- [ ] **Step 2: Update the handoff manual**

Add a “新生展示” subsection covering:

- the 12 Excel fields;
- `js/newcomer-data.js` ownership;
- empty-state rules;
- real photo requirements;
- newcomer-to-official-player migration;
- proof that newcomers do not affect official statistics or lineup.

- [ ] **Step 3: Run formatting checks**

Run:

```powershell
git diff --check
```

Expected: no trailing whitespace or malformed patch output.

- [ ] **Step 4: Commit documentation**

```powershell
git add README.md docs/生康足球队纪念站-项目交接手册.md
git commit -m "Document newcomer maintenance workflow"
```

---

### Task 5: Full Verification and Responsive Visual QA

**Files:**
- Verify: `index.html`
- Verify: `css/style.css`
- Verify: `js/main.js`
- Verify: `js/newcomer-data.js`
- Verify: `data/生康足球队数据源.xlsx`

**Interfaces:**
- Consumes: all previous tasks.
- Produces: verified desktop, mobile, empty-state, and fixture-backed real-data behavior.

- [ ] **Step 1: Run all repository tests**

Run:

```powershell
python tests\team-workbook-sync.test.py
node tests\team-memorial-refresh.test.mjs
git diff --check
```

Expected: Python reports all tests `OK`; Node exits `0`; diff check exits `0`.

- [ ] **Step 2: Start a local server**

Run:

```powershell
python -m http.server 8061 --bind 127.0.0.1
```

Expected: `http://127.0.0.1:8061/` serves the site.

- [ ] **Step 3: Verify the empty state**

At desktop `1440 × 1000` and mobile `390 × 844`, verify:

- navigation reaches `#newcomers`;
- the section appears between recruitment and team story;
- exactly three “新生资料待更新” cards appear;
- no invented player identity appears;
- desktop cards are equal;
- mobile cards remain `4:5` and horizontally accessible;
- there is no unexpected horizontal page overflow.

- [ ] **Step 4: Verify real-data motion with a browser route fixture**

Use browser automation to intercept `js/newcomer-data.js` and return:

```javascript
window.NEWCOMER_DATA = {
  season: "2026",
  newcomers: [
    { order: 1, name: "测试甲", grade: "2026级", number: 18, pos: "MF", role: "CM/RW", preferredFoot: "右脚", style: "持球推进", intro: "一起训练，一起比赛。", photo: "assets/players/caoweijia.webp", photoPosition: "50% 40%" },
    { order: 2, name: "测试乙", grade: "2026级", number: 22, pos: "DF", role: "CB/DM", preferredFoot: "右脚", style: "沉稳出球", intro: "先做好每一次防守。", photo: "assets/players/zhangjun.webp", photoPosition: "50% 35%" },
    { order: 3, name: "测试丙", grade: "2026级", number: "", pos: "FW", role: "ST/LW", preferredFoot: "左脚", style: "无球跑动", intro: "希望尽快融入球队。", photo: "assets/players/pengzhuolun.webp", photoPosition: "50% 35%" }
  ]
};
```

Verify:

- every card has identical dimensions;
- movement is leftward and continuous;
- duplicate cards have `aria-hidden="true"`;
- hover pauses;
- touch drag works without blocking vertical scrolling;
- hidden tab and reduced-motion mode stop movement;
- images render without broken paths;
- the section does not change the official player count or lineup.

- [ ] **Step 5: Inspect screenshots**

Capture:

- desktop newcomer section;
- mobile newcomer section;
- empty state;
- real-data fixture state after several seconds of scrolling.

Check text clipping, card equality, image crop, overlap, vertical rhythm, and transition into the team-story section.

- [ ] **Step 6: Perform final repository review**

Run:

```powershell
git status --short
git log -5 --oneline
```

Confirm only intended files are included in feature commits. Leave unrelated untracked files untouched.
