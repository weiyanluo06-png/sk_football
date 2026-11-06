# 生康足球队纪念站 · 维护规则（唯一有效版）

> **本文件是项目唯一的规则来源。** 它合并了原先分散的 `docs/网站更新规则.md`、`docs/生康足球队纪念站-项目交接手册.md`（有效章节）、`README.md`（维护章节）、`data/README.md`、`docs/updates/2026-10-17-publish-and-announcement-rules.md`，并剔除了 2026-10-16 数据架构迁移后失效的旧流程。**合并完成后，上述规则类旧文件已从仓库删除**，历史只在本文件的第 0.1 节留档。

| 项 | 内容 |
|---|---|
| 适用项目 | 生康足球队纪念站（weiyanluo06-png/sk_football） |
| 线上地址 | https://weiyanluo06-png.github.io/sk_football/ |
| 规则版本 | 1.1（2026-11-06 合并定稿） |
| 生效日期 | 2026-11-06 |
| 数据架构基线 | 2026-10-16（`data/team-records.json` 成为唯一手写数据源） |
| 冲突处理 | 本文是唯一准绳；旧文档已删除，不必再对照 |

---

## 0. 本规则的地位与用法

### 0.1 合并来源（原文件已删除）

| 已删除的旧文档 | 内容去向 |
|---|---|
| `docs/网站更新规则.md` | 全部并入第 8.3、13、14 章 |
| `docs/生康足球队纪念站-项目交接手册.md`（751 行）及其 `.docx` | 有效章节并入第 0–3、5.3、5.4、7–19 章；其中第 3.1、4、5.1、5.2、6 章的 Excel 旧流程**已废弃**（该通道被 `tools/sync_team_workbook.py:350` 硬性拦截） |
| `data/README.md` | 逐场录入规范并入第 3、4 章 |
| 上述文档中"Excel 四张表同步球队数据"的旧流程 | 已删除，替换为第 4.6 节的 Excel 逐场录入流程 |

历史只在这里留档；**不要再去别处找我，也不要照着已删除的旧文档执行**。

### 0.2 阅读顺序

- 只做一次数据录入 → 第 2、3、4 章。
- 加球员/改首发 → 第 5 章。
- 加比赛/赛事 → 第 6 章。
- 改页面样式或新增板块 → 第 10、11、12 章。
- 准备提交发布 → 第 13、14、15 章。
- 第一次接手 → 先读第 1 章，再读第 18 章首日清单。

### 0.3 给自动化助手 / AI 的硬约束

1. **不得编造任何数据**：进球、助攻、时间、出场、照片人物、评价、奖项，未知一律写「待补充」。
2. **不得手改生成文件**：`js/team-data.js`、`data/player-stats.json` 只能由脚本生成。
3. **不得绕过校验**：提交前必须跑第 14.2 节全部命令并通过。
4. **不得跳过公告**：每次更新必须产出可发群的更新通知（第 13.2 节）。
5. **不得擅自不发布**：校验通过后默认推送 `main`，只有用户明确要求「暂不发布 / 只在本地预览」才不推送。
6. **不得对外发布内部规则**：本文件、Git 流程、数据维护说明默认不进官网公告。
7. **不得强制推送、不得覆盖无关改动**。

---

## 1. 项目定位与原则

### 1.1 项目是什么

武汉纺织大学生物医学工程与健康学院（简称"生康"）足球队的线上档案与纪念站。它记录：

- 球队怎样在 2025 年从人数不足开始组建；
- 训练、比赛、合照、毕业与场外生活；
- 球员资料、真实数据、踢球风格和队友评价；
- 每个赛季的赛事索引和逐场比赛记录；
- 材料学院对球队成立和成长的帮助；
- 新学期招新信息。

它**不是**学院通知站、公示栏或商业宣传页。

### 1.2 七条产品理念（不可动摇）

- **记录优先于宣传。** 页面要像球队档案、比赛日刊物和队史相册，不是学院公告栏。
- **真实优先于完整。** 没有资料就标「待补充」或暂不展示，不编造进球、评价、奖项和故事。
- **人物优先于装饰。** 照片中的人不能被标题、按钮、渐变或信息卡挡住。
- **球队共同体优先于个人包装。** 可以突出球员，但整体气质仍是同一支队伍。
- **手机体验与电脑体验同等重要。** 队员最可能从手机链接进入。
- **纪念感来自真实细节。** 日期、比分、号码、场地、雨天、围圈、毕业照比空泛口号更有价值。
- **修改应当可持续。** 优先更新数据文件，而不是在 HTML 里重复写死同一份信息。

### 1.3 已确认的事实基线

- 建队年份：`2025`（2025 年秋季）
- 球队：生康足球队
- 学院：武汉纺织大学生物医学工程与健康学院
- 常用主场：阳光校区足球场 / 武汉纺织大学足球场
- 材料学院是球队长期认可的**兄弟学院**
- 招新 QQ 群：`913800697`
- 抖音号：`67421116473`
- 赛事节奏（每学年三段）：
  1. 上学期：十一人制纺大杯
  2. 上学期：八人制新生杯
  3. 下学期：八人制纺大杯
- **当前默认赛事：`2026-eleven-fangda`（2026 · 十一人制纺大杯）**

### 1.4 每次更新前先问五个问题

1. 这段内容是真的吗？
2. 队员多年后看到会觉得这是他们的球队吗？
3. 照片中的人是否被尊重？
4. 手机访问是否顺畅？
5. 下一位维护者是否还能继续更新？

五个答案都是肯定的，才可以发布。

---

## 2. 数据架构

### 2.1 唯一真源与生成链

```text
data/team-records.json            ← 唯一手写数据源（人只改这里）
        │
        │  node tools/build_team_data.mjs
        ▼
js/team-data.js   +   data/player-stats.json      ← 生成产物（禁止手改）

data/比赛录入.xlsx                ← 新的「比赛录入表单」（推荐给交接后的维护者）
        │  python tools/import_matches.py   ← 带校验，失败自动回滚
        ▼
data/team-records.json 的 matches  ← 写入后再走上面那条构建链

data/生康足球队数据源.xlsx
        │  （仅剩三张表与球员/比赛无关：新生展示 / 球队经理 / 通知公告）
        │  python tools/sync_team_workbook.py  ← ⚠ 该命令当前必然报错，见 7.6
        ▼
js/newcomer-data.js  +  js/manager-data.js  +  js/notices-data.js
```

> **球员信息与比赛信息已完全脱离 Excel。** Excel 里的 `统计汇总`、`球员数据`、`赛事索引`、`赛程` 四张表自 2026-10-16 起只是只读历史存档，停在 17 人 / 110 出场 / 13 球的旧快照。

### 2.2 文件所有权矩阵（现行，取代旧矩阵）

| 信息类型 | 唯一维护位置 | 是否自动生成 | 维护方式 |
|---|---|---|---|
| 球员 ID、姓名、绰号、号码、主/副位置 | `team-records.json` → `players` | 是 | 改 JSON 后跑构建 |
| 球员照片路径 `photo` | `team-records.json` → `players[].photo` | 是 | 改 JSON 后跑构建 |
| 球员介绍 `bio`、队友评价 `reviews`、踢球风格 `traits`、图标 `avatarIcon` | `team-records.json` → `players` | 是 | 改 JSON 后跑构建 |
| 出场、进球、助攻、MVP、零封、低失球场 | `team-records.json` → `matches` | 是 | 逐场录入后跑构建 |
| 历史累计基数 | `team-records.json` → `players[].baseline` | 是 | 仅在确证漏记/错记时修正 |
| 固定首发 | `team-records.json` → `startingLineup` | 是 | 改 `playerId` |
| 赛事索引 | `team-records.json` → `competitions` | 是 | 新增赛事对象 |
| 逐场比赛 / 历史赛程 | `team-records.json` → `matches` / `historicalMatches` | 是 | 见第 6 章 |
| 队史节点 | `team-records.json` → `honors` | 是 | 只增值得长期保留的节点 |
| 默认赛事 | `team-records.json` → `defaultCompetitionId` | 是 | 新赛季手动改 |
| 评分 `rating`、代表数据 `memory` | `tools/build_team_data.mjs` 计算 | 是 | 改公式而非改数值 |
| 新生展示 | Excel `新生展示` 表（→ JS 已与 Excel 有偏差） | 设计上由 sync 脚本生成，**入口当前失效** | 见 7.6 |
| 比赛录入（推荐入口） | `data/比赛录入.xlsx` | 由 `tools/import_matches.py` 写入 `matches` | 见 4.6 |
| 球队经理 | Excel `球队经理` 表（→ JS 已与 Excel 有偏差） | 设计上由 sync 脚本生成，**入口当前失效** | 见 7.6 |
| 通知公告 | Excel `通知公告` 表（→ JS 已与 Excel 有偏差） | 设计上由 sync 脚本生成，**入口当前失效** | 见 7.6 |
| 影像墙照片与文案 | `js/gallery-data.js` | **否** | 手工维护 |
| 首页轮播、招新文案、静态队史 | `index.html` | **否** | 手工维护 |
| 全站样式 | `css/style.css`、`css/sections.css`、`css/match-detail.css` | **否** | 手工维护 |
| 页面渲染与交互 | `js/main.js`、`sections.js`、`tactics.js`、`match-detail.js` | **否** | 手工维护 |
| 历史存档 | `data/生康足球队数据源.xlsx` 的 `统计汇总`/`球员数据`/`赛事索引`/`赛程` | — | **只读，不得回写** |

### 2.3 三条铁律

1. **单向数据流**：`team-records.json` → 生成文件。永远不要反向覆盖，也就是不要手改生成文件，也不要让 Excel 覆盖 JSON。
2. **禁止双写**：同一项数据不能同时存在两处"真相"。历史基数与逐场明细不能重复计算（见 3.5）。
3. **可重跑**：任何数据修改后，`node tools/build_team_data.mjs` 重跑必须幂等——重复运行不会重复累计。

### 2.4 目录职责

```text
sk_football/
├─ index.html                    页面结构、首页轮播、招新、静态队史文案
├─ rule.md                       ← 本规则
├─ README.md                     项目说明（面向访客与接手者）
├─ css/
│  ├─ style.css                  全站视觉、响应式、动效（2284 行）
│  ├─ sections.css               栏目页布局
│  └─ match-detail.css           战报页样式
├─ js/
│  ├─ team-data.js               【生成】window.PONYTAIL_DATA
│  ├─ main.js                    主控制器：渲染、轮播、筛选、弹窗、点赞
│  ├─ sections.js                栏目分页 + hash 路由
│  ├─ tactics.js                 自由战术板
│  ├─ match-detail.js            逐场战报渲染 window.renderTeamMatch
│  ├─ gallery-data.js            【手写】影像墙数据
│  ├─ newcomer-data.js           【生成】新生展示
│  ├─ newcomer-images.js         【生成】新生图 srcset 清单
│  ├─ manager-data.js            【生成】球队经理
│  └─ notices-data.js            【生成】通知公告
├─ data/
│  ├─ team-records.json          【手写】唯一主数据源
│  ├─ player-stats.json          【生成】个人累计与逐场档案
│  ├─ 比赛录入.xlsx                【手写】比赛录入表单（4.6）
│  └─ 生康足球队数据源.xlsx       历史存档（四表只读；三表设计可同步但入口失效，见 7.6）
├─ assets/
│  ├─ players/                   球员头像（原图 + WebP + showcase/320|640）
│  ├─ photos/                    首页、影像墙、比赛照片、招新二维码
│  ├─ managers/                  经理照片
│  ├─ branding/                  官方品牌素材
│  └─ favicon.svg
├─ tools/
│  ├─ build_team_data.mjs        生成 + 校验（--check）
│  ├─ build_match_workbook.py    生成「比赛录入.xlsx」表单
│  ├─ import_matches.py          Excel 录入表 → team-records.json（带校验与回滚）
│  ├─ sync_team_workbook.py      Excel → 新生/经理/公告
│  ├─ build_newcomer_images.py   生成 320/640 WebP 与清单
│  └─ finalize-recruitment-posters.ps1 招新海报合成
├─ tests/
│  ├─ match-records.test.mjs     逐场汇总、幂等、脏数据拒绝、渲染转义
│  ├─ import-matches.test.py     录入表往返无损与填表校验
│  ├─ tactics.test.cjs           六种阵型换人后 11 人唯一且在场内
│  ├─ team-workbook-sync.test.py Excel 同步与隔离
│  ├─ team-memorial-refresh.test.mjs 页面结构契约
│  ├─ fangzhaoju-player.test.mjs 单人物数据一致性
│  └─ manager-notices.test.mjs   经理与公告一致性
├─ docs/                         历史文档、更新记录、比赛数据收集清单
└─ .github/workflows/deploy-pages.yml
```

---

## 3. 数据结构规范

### 3.1 `team-records.json` 顶层结构

```jsonc
{
  "schemaVersion": 1,
  "baseline": { "through": "2026-10-15", "source": "…" },
  "players": [],
  "startingLineup": { "GK": {}, "LB": {}, "CB1": {}, "CB2": {}, "RB": {},
                      "DM": {}, "LCM": {}, "RCM": {}, "LW": {}, "ST": {}, "RW": {} },
  "defaultCompetitionId": "2026-eleven-fangda",
  "competitions": [],
  "historicalMatches": [],
  "matches": [],
  "honors": [],
  "fallbackPhotos": []
}
```

- `baseline.through` 是历史基数截止日，**不得随意改动**。
- `defaultCompetitionId` 必须能在 `competitions` 中找到。

### 3.2 `player` 对象

```jsonc
{
  "id": 1,                      // 永久唯一整数 ID，比赛永远引用 ID，不引用号码
  "name": "吴宇成",              // 唯一（构建脚本按姓名查重）
  "nickname": "铁血后卫",
  "number": 6,                  // 号码可重复、可更换，不是身份标识
  "pos": "DF",                  // FW / MF / DF / GK / TBD
  "role": "CB/CM/GK",           // 可胜任位置，用 / 分隔
  "avatarIcon": "fa-shield-halved",
  "traits": ["后场组织者/进攻型门将"],
  "reviews": ["真实队友评价，可多条"],
  "bio": "基于真实资料的一句话介绍",
  "photo": "assets/players/wuyucheng.webp",
  "photoPosition": "50% 30%",   // 可选，object-position
  "baseline": { "apps": 11, "goals": 0, "asts": 1,
                "motm": 0, "cleanSheets": 0, "lowConcedeGames": 0 }
}
```

规则：

- `id` 必须为正整数且全表唯一；新增球员取当前最大值 +1，**永不复用**。
- `name` 必须唯一（构建脚本按姓名去重，重名会报错）。
- 新球员的 `baseline` 六项一律填 `0`。
- 照片、介绍、评价、踢球风格都在这里维护，**不要写进 `js/team-data.js`**。

### 3.3 `match` 对象

```jsonc
{
  "id": "2026-10-23-eleven-management",   // 小写字母/数字/连字符，唯一
  "competitionId": "2026-eleven-fangda",  // 必须存在于 competitions
  "season": "2026-2027",
  "date": "2026-10-23",                   // YYYY-MM-DD
  "kickoff": "12:00",                     // HH:MM（24 小时制）
  "venue": "武汉纺织大学足球场",
  "fullTimeMinutes": 70,                  // 可选，未知就不写，不默认 90
  "opponent": "管理学院",
  "status": "played",                     // 明细只接受 played
  "goalsFor": 2,
  "goalsAgainst": 0,
  "formation": "4-4-2",
  "captainId": 9,
  "appearances": [],
  "events": [],
  "mvpId": 18,
  "mvpReview": "本场评语",
  "quote": "一句话总结",
  "reportTitle": "战报标题",
  "report": ["段落一", "段落二"],
  "recorders": ["记录人"],                 // 可选
  "photographers": ["摄影"],
  "photos": [{ "src": "assets/photos/x.jpg", "caption": "照片说明", "photographer": "摄影者" }],
  "missingInfo": ["仍未确认的信息"]
}
```

### 3.4 `appearance` 与 `event`

```jsonc
// 出场：每人每场只记一条
{ "playerId": 4, "started": true, "position": "GK",
  "onMinute": 0, "offMinute": null, "cleanSheet": true, "lowConcedeGame": false }

// 进球
{ "type": "goal", "minute": 19, "exactTime": "19:15", "playerId": 9, "assistId": 18 }

// 换人
{ "type": "substitution", "minute": 50, "playerInId": 5, "playerOutId": 27 }
```

硬规则：

- 替补席未上场者**不记出场**。
- `position` 是**本场位置**，不修改个人惯常位置。
- 首发 `onMinute` 必须为 `0`；`offMinute` 未知填 `null`。
- `started: false` 的球员必须有对应换人事件的 `playerInId`；`offMinute` 非空必须有对应 `playerOutId`。
- 助攻写在进球的 `assistId`，**未知填 `null`，不编造**。
- `assistId` 不能等于 `playerId`；助攻者必须当时在场。
- `cleanSheet: true` 仅当本场 `goalsAgainst === 0`。
- `lowConcedeGame: true` 仅当本场 `goalsAgainst <= 1`。
- 事件分钟必须落在该球员的在场区间内。
- 进球事件数必须等于 `goalsFor`。
- **只维护 `events`**，不要在别处再写一份进球/助攻统计。

### 3.5 `baseline`（历史基数）规则

- `baseline.through = 2026-10-15`。此前的 17 名球员累计数据整体作为基数保留；历史逐场资料不全，**不反推每场出场**。
- `historicalMatches`（截止日前的比赛）**只用于展示，不参与个人统计累加**。
- `matches`（截止日后的比赛）必须是 `date > baseline.through`，否则构建脚本报错「明细比赛落在历史基数内，会重复统计」。
- 只有确证属于截止日前的漏记或错误才可修正 `baseline`，且必须在提交说明中记录依据。
- 禁止同一数据同时保留在基数和明细中。

### 3.6 构建脚本会拒绝的情况（录入前先自查）

`node tools/build_team_data.mjs` 会对以下情形直接报错退出，不会生成错误数据：

1. 球员 ID 或姓名重复、缺失；`baseline` 六项非整数。
2. 赛事 ID 不存在，或 `defaultCompetitionId` 不存在。
3. 比赛 ID 含非法字符或重复。
4. 「赛事｜日期｜对手｜开球」四元组重复（同一赛程重复录入）。
5. 历史赛程日期晚于基数截止日。
6. 明细比赛日期不晚于基数截止日。
7. 明细比赛 `status !== 'played'`。
8. `kickoff` 不是合法 `HH:MM`；`fullTimeMinutes` 非正整数。
9. 比分不是非负整数。
10. 同一场同一球员重复出场；`started` 非布尔；`position` 不在 FW/MF/DF/GK。
11. 出场分钟非法（首发非 0、`offMinute < onMinute`）。
12. 失球比赛记零封、失球 >1 记低失球场。
13. 首发超过 11 人。
14. 我方进球事件数 ≠ 比分；事件分钟球员不在场。
15. 助攻者不在场、自己助攻自己。
16. 换人与出场记录不一致（替补无换入、下场无换出、重复换上/换下）。
17. 未知事件类型；`exactTime` 格式错误或与 `minute` 不一致。
18. 比赛照片路径不在 `assets/` 下，或缺 `caption`。

---

## 4. 逐场录入（核心流程）

### 4.1 八步

1. **查球员固定 ID**（在 `players` 中查）。新球员先加资料与 0 基数，**不要用号码猜身份**。
2. 在 `matches` 增加一条比赛，填写日期、开球时间、赛事、对手、比分、场地、阵型、队长。
3. 填 `appearances`：出场每人只记一次，首发 `started: true`，替补写 `onMinute`。
4. 填 `events`：进球（含 `assistId`）、换人。
5. 填 `mvpId` 与 `mvpReview`。
6. 写 `report`（分段数组）、`quote`、`reportTitle`；照片放 `assets/photos/` 并登记到 `photos`。
7. 有未确认信息就写进 `missingInfo`，**不要猜**。
8. 运行 `node tools/build_team_data.mjs`，然后按 4.2 验收。

### 4.2 录入验收清单

- 比分与 `goalsFor/goalsAgainst` 一致；进球者与事件一致。
- 出场人数与实际一致；首发数 ≤ 11。
- 换人时间与 `onMinute`/`offMinute` 吻合。
- MVP 在本场出场名单内。
- 零封/低失球场只在符合条件时填写。
- 照片路径存在、说明准确。
- 个人累计（`player-stats.json`）增量符合预期：`totals = baseline + Σmatches`。
- 战报页 `#match/<比赛ID>` 能打开，阵容/事件/MVP/照片显示正确。

### 4.3 不确定信息

- 没有提供的助攻、进球时间、出场分钟、照片人物、外部链接，**一律不得猜测**。
- 统一使用「待补充」，并写进该场的 `missingInfo`，同时在更新通知中说明。
- 全场时长未知时不写 `fullTimeMinutes`，**不默认 90 分钟**。

### 4.4 历史更正

- 修正 `baseline` 需在提交说明里写明依据。
- 若以后补齐历史逐场数据，应先完成"基数与历史明细对账"，再把数据从基数迁移到明细，**不能两边都留**。
- 已归档的旧比赛日期/比分如需修正，改 `historicalMatches` 并同步更新相关 `honors` 文案。

### 4.5 默认值

| 情况 | 处理 |
|---|---|
| 用户未说明开球时间 | 记 `12:00` |
| 用户未说明比赛地点 | 记「武汉纺织大学足球场」 |
| 用户明确给出时间/地点 | 以实际信息为准，不被默认值覆盖 |

### 4.6 Excel 逐场录入（交接后的推荐流程）

考虑到交接给非技术同学，比赛数据支持用 Excel 填、脚本导入：

```
data/比赛录入.xlsx  →  python tools/import_matches.py  →  team-records.json → 构建
```

**表结构**（5 张数据表 + 说明 + 参考）：

| 表 | 一行代表 | 关键字段 |
|---|---|---|
| 比赛 | 一场比赛 | 比赛ID、日期、开球时间、场地、赛事ID、对手、我方进球、对方进球、阵型、队长、全场分钟、MVP |
| 战报 | 一场比赛 | 比赛ID、一句话总结、MVP评语、战报标题、战报正文、记录人、摄影、待补充信息 |
| 出场 | 一名上场球员 | 比赛ID、球员姓名、首发、本场位置、上场分钟、下场分钟、零封、低失球场 |
| 事件 | 一个进球或一次换人 | 比赛ID、分钟、类型、进球者或换上、助攻或换下、精确时间 |
| 照片 | 一张照片 | 比赛ID、文件路径、说明、摄影 |

**规则**：

1. `比赛ID` 必填，格式 `日期-杯赛-对手拼音`，如 `2026-11-06-eleven-jisuanji`；五张表用同一个 ID（明细表有下拉）。
2. 日期列是文本格式，写 `2026-11-06`，不会被 Excel 转成日期。
3. 只填**真正上场**的球员，替补席未上场的不填。
4. 首发上场分钟填 `0`；替补必须有对应换人事件。
5. 比分必须等于事件表里的进球条数。
6. 不知道的信息留空或写进「待补充信息」，**不许猜**。
7. 日期必须晚于 `2026-10-15`（历史基数截止日），否则脚本拒绝导入。

**命令**：

```powershell
python tools/build_match_workbook.py      # 重新生成录入表（球员/赛事变动后跑）
python tools/import_matches.py --dry-run  # 只校验、预览，不写文件
python tools/import_matches.py            # 导入 + 自动重新生成网站数据
```

**安全性**：导入只改 `records["matches"]`；写前备份，构建校验失败**自动回滚**；幂等，重复导入不重复累计。删除比赛不支持在 Excel 里删行，需改 JSON。

**采集环节**：赛后按 [`docs/比赛数据收集清单.md`](docs/比赛数据收集清单.md) 的 20 个问题问清再填表。

---

## 5. 球员维护

### 5.1 新增球员

1. 在 `team-records.json` 的 `players` 增加对象，`id` 取最大值 +1。
2. 填 `name`、`number`、`pos`、`role`、`traits`、`bio`、`reviews`、`avatarIcon`。
3. `baseline` 六项全填 `0`。
4. 照片放入 `assets/players/`，`photo` 填相对路径。
5. 若进入固定首发，改 `startingLineup` 对应位置。
6. 更新 `index.html` 首页「球员档案」数量（当前写死，见 16.2）。
7. 运行 `node tools/build_team_data.mjs`。
8. 检查：随机三人展示、全队档案、球员弹窗、战术板候选池都出现该球员。

### 5.2 更新球员资料

- 只改 `team-records.json`，改完跑构建。
- 号码可以变，**ID 不能变**。
- 不要直接改 `rating`——它由公式算出。

### 5.3 球员照片规范

- 目录 `assets/players/`；文件名用小写拼音 slug，如 `wuyuze.webp`。
- 推荐竖版、脸部清晰、主体居中或略偏上；最小 `800 × 1000`。
- 同时保留原始 JPG/PNG 与网页 WebP。
- 不拉伸；背景复杂靠裁切改善，不叠字。
- **禁止**用陌生网络人物替代真实队员，**禁止** AI 生成人像。
- 人脸在阵容小卡中应仍可辨认。
- 新增图片同步生成 `showcase/<name>-320.webp` 与 `-640.webp`（`tools/build_newcomer_images.py` 的做法可复用）。
- 用新文件名，避免浏览器缓存造成"改了没生效"。

### 5.4 固定首发

当前位置数据在 `team-records.json` 的 `startingLineup`：

```jsonc
"GK":  { "top": "88%", "left": "50%", "playerId": 4 },
"ST":  { "top": "12%", "left": "50%", "playerId": 9 }
```

更换首发时：

- 只改对应位置的 `playerId`；确认 ID 存在。
- 同一球员不得占两个位置。
- 阵型不变时不要随意改 `top`/`left`。
- 阵型变化要同时改桌面与手机布局、阵线人数和文案。
- 改完检查沉浸式阵容与普通战术板**同时**正确。

### 5.5 评分规则

原始分（`tools/build_team_data.mjs:112-113` 计算，写入 `rating`）：

```text
基础 6
+ 出场 × 0.08
+ 进球 × 0.35
+ 助攻 × 0.25
+ MVP × 0.25
+ 零封 × 0.15
主位置为 DF 时额外：
+ 出场 × 0.06
+ 零封 × 0.35
+ 低失球场 × 0.15
→ clamp(6.0, 9.5)，保留 1 位小数
```

**两层分数的区分（极重要）**：

- `team-data.js` 里的 `rating` 是**原始分**，写进文件，可追溯。
- 网页端 `main.js` 的 `getDisplayRating()` 会把**低于 8 分的原始分临时 +1**，仅用于展示，**不写回任何文件**。
- 若评委/队员问"为什么档案上是 8.1、弹窗显示 9.1"，原因就在这里。

修改评分体系时必须同步修改：

1. `tools/build_team_data.mjs` 的评分表达式（**真正生效的地方**）。
2. `tools/sync_team_workbook.py` 中的 `rating_formula()` / `calculate_rating()`（保持口径一致）。
3. Excel 里的评分公式列。
4. `tests/team-workbook-sync.test.py` 与 `tests/match-records.test.mjs`。
5. 决定是否继续保留 `main.js` 的展示加分。

### 5.6 改名风险

- 构建脚本按 `name` 查重，`sync_team_workbook.py` 也按**姓名**匹配保留照片/评价/介绍。
- 改名会让旧匹配失效，可能被当成新球员。
- 改名流程：先记录该球员现有 `photo`、`bio`、`reviews` → 改 `name` → 改完跑构建 → 检查照片和评价是否还在。

---

## 6. 赛事与比赛

### 6.1 新增赛事

在 `team-records.json` 的 `competitions` 增加：

```jsonc
{ "id": "2026-freshmen-cup", "year": "2026", "name": "八人制新生杯",
  "label": "八人制新生杯", "status": "第二届新生杯", "description": "真实简短介绍" }
```

- `id` 唯一，小写英文/数字/连字符，**一旦上线尽量不改**（会断掉 `#match/` 之外的引用与筛选）。
- `name` 与 `label` 用于展示与筛选。

### 6.2 新增比赛

在 `matches` 增加（结构见 3.3）。要求：

- `date` 必须晚于 `baseline.through`。
- `competitionId` 必须存在。
- `id` 建议格式 `日期-赛事-对手拼音`，如 `2026-10-23-eleven-management`。
- 比赛在页面按日期倒序排列，不要手工调顺序。

### 6.3 历史赛程

`historicalMatches` 用于 2026-10-15 之前的比赛：

```jsonc
{ "season": "2025-2026", "result": "win", "score": "2 : 0",
  "opponent": "化工学院", "date": "2025-12-12", "venue": "阳光校区足球场",
  "competition": "八人制新生杯", "scorers": "彭卓伦 30′ / 吴宇泽 42′",
  "quote": "小组赛第二场胜利。", "id": "archive-2025-12-12-7",
  "competitionId": "2025-freshmen-cup" }
```

- 只展示，不累加个人数据。
- `scorers` 无进球时写「暂无进球记录」，不编造。

### 6.4 默认赛事

- `defaultCompetitionId` 决定赛事档案首次打开时展示哪一项。
- 当前值：`2026-eleven-fangda`。
- 新赛季上线后由维护者手动决定是否切换；**不会自动跟随最近比赛**。

### 6.5 赛事档案展示规则

- 一级索引是**年份**，二级索引是**杯赛**。
- 默认只展示一个赛事，不一次罗列全部年份。
- 比赛卡片信息优先级：日期 → 赛事 → 对手 → 比分 → 进球者 → 备注。
- 赛果颜色只作辅助（蓝=平、红=负），**不能只靠颜色表达**。
- 比分卡片可进入 `#match/<比赛ID>` 逐场战报。

---

## 7. 新生展示（Excel 通道，同步入口当前失效）

### 7.1 地位

`新生展示` 表用于**尚未进入正式大名单**的新队员，输出到 `js/newcomer-data.js`。

- 不写入 `window.PONYTAIL_DATA.players`。
- 不计入正式球员人数、`startingLineup`、战术板候选池、球员弹窗。
- 不记录出场、进球、助攻、MVP、零封或评分。

### 7.2 字段（12 项）

| 字段 | 规则 |
|---|---|
| 排序 | 必填，数字越小越靠前 |
| 姓名 | 必填，真实姓名 |
| 年级 | 必填，如 `2026级` |
| 号码 | 未分配可留空 |
| 主位置 | 必填，如 `CM`、`CB` |
| 可胜任位置 | 可选，多个用 `/` 分隔 |
| 惯用脚 | 可选：左脚 / 右脚 / 双足 |
| 踢球风格 | 可选，只写真实简短的训练观察 |
| 自我介绍 | 可选，一句真实介绍，建议 ≤ 30 汉字 |
| 照片文件名 | 可选，只填 `assets/players/` 下的文件名 |
| 照片焦点 | 可选，`object-position` 值，如 `50% 30%` |
| 展示状态 | 必填，**只有精确填「展示」才上线**，`隐藏` 或其他值都不展示 |

### 7.3 流程

> ⚠ 第 3 步的官方命令**当前必然报错**，见 7.6。现状下实际做法是先改 Excel，再用 7.6 的编程方式同步并人工核对。

1. 照片放入 `assets/players/`（WebP、竖版、清晰）。
2. 在 Excel `新生展示` 表填写并设状态为「展示」。
3. 运行 `python tools/sync_team_workbook.py`（当前会报错，改用 7.6 的方案）。
4. 需要两档图时运行 `python tools/build_newcomer_images.py`。
5. 在桌面端与手机端检查裁切、横向卡片滚动、「新生」导航锚点。

### 7.4 转正（进入正式大名单）

1. 在 `team-records.json` 的 `players` 新增该球员（`baseline` 全 0）。
2. 从 Excel `新生展示` 删除该行，或将「展示状态」改为 `隐藏`。
3. 运行 `python tools/sync_team_workbook.py` 让该球员退出新生板块（命令当前报错，用 7.6 方案）。
4. 运行 `node tools/build_team_data.mjs`（进入正式档案）。
5. 视情况加入 `startingLineup`。
6. 检查：新生板块不再出现、正式档案已出现、战术板可选。

### 7.5 空状态与隔离

- 无「展示」记录或 `newcomer-data.js` 加载失败时，板块保留三张「新生资料待更新」静止占位卡。
- **不得**为占位状态编造姓名、位置、照片或评价。
- 同步脚本只把「展示」记录写入 `newcomer-data.js`，不会触碰正式球员数据。

### 7.6 该通道当前的真实状态（2026-11-05 实测，必读）

**官方命令跑不通。** 实测 `python tools/sync_team_workbook.py`：

- `sync_workbook()` **第一行**就检查「`data/team-records.json` 是否存在」且「输出目标是否为 `js/team-data.js`」，`main()` 恰好固定传这个路径；
- 结果直接 `raise ValueError`、退出码 1，**一个字节都不会写**（在写入前就抛错，不会损坏数据）。

因此以前文档里写"运行这条命令生成 `newcomer-data.js` / `manager-data.js` / `notices-data.js`"的做法**当前不可执行**。

**可行绕行**：以编程方式调用，把 `site_output` 指到临时路径（`tests/team-workbook-sync.test.py:86-100` 就是这么做的），再单独调用 `write_notices()`：

```python
import importlib.util, pathlib, tempfile
ROOT = pathlib.Path('.').resolve()
spec = importlib.util.spec_from_file_location('sync_team_workbook', ROOT / 'tools' / 'sync_team_workbook.py')
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
work = pathlib.Path(tempfile.mkdtemp())
m.sync_workbook(ROOT/'data'/'生康足球队数据源.xlsx', ROOT/'data'/'生康足球队数据源.xlsx',
                ROOT/'js'/'team-data.js', work/'team-data.js',
                work/'newcomer-data.js', work/'manager-data.js')
m.write_notices(m.load_workbook(ROOT/'data'/'生康足球队数据源.xlsx'), work/'notices-data.js')
# 再把 work/ 下三个文件复制回 js/ 并肉眼核对
```

**Excel 已与仓库内容脱钩**（同一实测的差异）：

| 文件 | 与 Excel 生成的对比 |
|---|---|
| `newcomer-data.js` | **完全一致**（0 行差异） |
| `manager-data.js` | 4 行差异：赵慰冉的 `duties` 在 Excel 里有说明文字，仓库里是空字符串 |
| `notices-data.js` | 10 行差异：2:0 战报的正文结尾与配图/图注在仓库里已手工改过，Excel 仍是旧版（无配图） |

结论：这三张表**已不再是可信真源**。改动前先以仓库里的 JS 为准核对，不要默认 Excel 是新的。

---

## 8. 球队经理与通知公告（Excel 通道，同步入口当前失效）

### 8.1 球队经理

- 来源：Excel `球队经理` 表 → `js/manager-data.js`。
- 字段：排序、姓名、年级、赛季、职务、职责、介绍、照片。
- 照片放 `assets/managers/`。
- 经理是"场边同行"板块内容，**不进球员名单**。
- ⚠ 该通道入口当前失效（见 7.6）；且仓库里的 `manager-data.js` 已与 Excel 有偏差（赵慰冉的 `duties`）。

### 8.2 公告字段

来源：Excel `通知公告` 表 → `js/notices-data.js`。⚠ 入口当前失效，且仓库内容已与 Excel 有偏差（见 7.6），**改之前先看仓库里的 JS**。

| 字段 | 说明 |
|---|---|
| `id` | 唯一，进 URL：`#notice/<id>` |
| `category` | 新人加入 / 赛事预告 / 球队动态 / 比赛战报 |
| `date` | `YYYY-MM-DD`，发布日期 |
| `title` / `summary` / `body` | 标题、摘要、正文（`\n\n` 分段） |
| `members` | 名单，用顿号分隔 |
| `image` / `imageCaption` | 配图与说明 |
| `link` / `linkText` | 关联链接 |
| `status` | **「发布」才上线**，`草稿` 不展示 |
| `pinned` | 「是」优先排列 |

规则：

- 发布日期与正文中提到的活动日期**分别维护**，不自动推断比赛或毕业信息。
- 公告正文必须已核对，不确定信息标「待补充」。
- 首页只取 `status === '发布'` 的前 3 条，按日期倒序。
- 已知闲置：`pinned` 与 `category` 目前**未被任何脚本消费**，不要依赖它们改变排序或筛选。
- **`js/notices-data.js` 是生成文件**：`sync_team_workbook.py` 每次都会从 Excel `通知公告` 表重写它，手改会在下次同步时被覆盖。要改公告内容请改 Excel。

### 8.3 公告发布规则（硬性）

**每次网站更新完成后，必须生成一份可直接发到球队群里的更新通知**，并且：

1. 保存到 `docs/updates/日期-主题.md`，**只新增，不覆盖旧通知**。
2. 在给负责人的回复中附上同样的正文。
3. 公告地址必须是**能打开的线上链接**，不能只给本地 Markdown 文件。

固定格式：

```text
【生康足球队官网公告｜公告标题】
第一段：说明本次发生了什么、涉及哪场比赛或哪个栏目。
第二段：说明已经同步到官网的具体内容。
第三段：说明队员需要注意的事项或仍待补充的信息。
完整公告：
https://weiyanluo06-png.github.io/sk_football/#notice/公告ID
```

格式要求：

- 首行必须是全角「【生康足球队官网公告｜…】」。
- 正文 2–4 段简明叙述。
- 结尾固定写「完整公告：」并紧跟线上 `#notice/公告ID` 链接。
- 不能用内部文件路径代替公告内容。

### 8.4 内部规则不外发

- **内部维护规则、Git 流程、数据维护说明，默认只写进项目文档，不得自动做成官网公告或放进公告列表。**
- 只有用户明确要求公开时才发布。
- 内部文档可以引用线上站点的公开信息，但不要把维护细节贴到公告里。

---

## 9. 图片与媒体规范

### 9.1 通用原则

- 真实照片优先，人物可辨认。
- 不使用版权不明的网络照片；**禁止 AI 生成人像**替代真实队员。
- 不把长标题压在人物脸上。
- 不为"高级感"把照片压得过暗。
- 不用模糊、重度滤镜或装饰图代替真实内容。
- 同一批照片保持接近的色温和对比度。
- 新文件用新名称，避免缓存。
- 每张图必须有准确的 `alt` 与真实说明。

### 9.2 首页轮播

命名模式：

```text
hero-team-2026-04.jpg            原图
hero-team-2026-04.webp           桌面 WebP
hero-team-2026-04-mobile.webp    手机专用裁切
```

尺寸建议：

- 桌面 WebP 宽约 `1920`
- 手机 WebP 宽约 `900–1080`
- WebP 质量约 `78–85`

配置方式（`index.html`）：

```html
<div class="hero__slide"
     data-image="assets/photos/hero-team-2026-04.webp"
     data-image-mobile="assets/photos/hero-team-2026-04-mobile.webp">
  <div class="hero__content">
    <span class="hero__chapter"><span class="hero__eyebrow">真实场景说明</span></span>
    <h1 class="hero__title">真实、简短的标题</h1>
  </div>
</div>
```

验收：

- 桌面文字位于空白区，手机人物不被裁掉。
- 左右滑动、箭头、圆点、自动轮播有效。
- 首张立即加载，下一张延迟预加载，三张不一次全部下载。

### 9.3 影像墙

在 `js/gallery-data.js` 的 `PONYTAIL_GALLERY` 增加：

```js
{
  title: '开球前围圈',
  date: '球队记忆',          // 确切日期已知就写日期
  category: '比赛',          // 比赛/合照/荣誉/场外/毕业
  tag: 'HUDDLE',            // 短英文标签，仅作视觉索引
  height: 360,              // 瀑布流高度，避免过于整齐
  image: 'assets/photos/gallery-team-huddle.webp',
  story: '比赛开始前，穿白色球衣的队员围在一起。'
}
```

规则：

- `story` 只写照片能支持的事实。
- 分类来自现有照片内容，不凭空新增。
- 点赞只是本地视觉特效，**不写入任何存储，别人看不到累计**。
- 点图片打开详情，点点赞不能同时打开照片。

### 9.4 球员头像

见 5.3。

### 9.5 招新二维码

文件：`assets/photos/recruit-qq-group.jpg`

- 用群管理页面导出的清晰原图。
- **不得 AI 生成或重绘二维码**，不得在二维码上叠文字，不做重度压缩。
- 更新后用至少两台手机实扫。
- 同时核对 `index.html` 中的群号文字 `913800697`。

### 9.6 格式与性能

- 所有照片准备 WebP；球员/新生卡使用 `srcset`（320w / 640w）。
- 除首屏前 3 张外一律 `loading="lazy"` + `decoding="async"`。
- 影像墙用 `IntersectionObserver`（`rootMargin: 240px`）加载背景图。
- 新增大图先压缩，不把视频、原始大图、Excel 放进首屏加载链路。

---

## 10. 视觉与设计规范

### 10.1 核心气质

关键词：校园足球、队史档案、比赛日刊物、真实克制有温度、纸张/草坪/球衣/阵型。

不应呈现为：学院公示栏、通用企业官网、SaaS 仪表盘、夸张电竞站、全屏渐变营销页、只有装饰没有真实人物的"高级感"页面。

### 10.2 配色

CSS 变量是**唯一配色入口**：

```css
--green: #1f7a4d;      /* 品牌、重点信息、阵容信息卡 */
--green-dark: #0f3d2a;
--line: #d7eadf;
--cream: #f7f4ed;      /* 页面底色、档案感 */
--paper: #fffdf8;
--ink: #17231d;        /* 正文与标题 */
--muted: #65746b;
--gold: #d8a63a;       /* 少量荣誉、焦点、键盘焦点环 */
--blue: #315f8f;       /* 平局 */
--red: #bb4b4b;        /* 负场、必要警示 */
```

规则：

- 深绿=品牌/重点，草绿=按钮/标签/激活，纸白米白=底色，墨黑=正文。
- 金色只少量用于荣誉与焦点。
- **不新增大面积紫色、蓝紫渐变、咖啡棕或霓虹色**，不加装饰光球。

### 10.3 字体

- 中文正文：`Noto Sans SC`
- 中文叙事标题：`Noto Serif SC`（谨慎使用）
- 数字与英文标签：`Oswald`
- 系统回退：`Microsoft YaHei`, Arial

规则：

- 大字号只用于页面主标题或沉浸式阵线名称，小卡片不要用英雄页字号。
- 中文正文正常字距，英文 kicker 可加字距。
- 不混搭多种花体，不让字压住人脸或溢出卡片。

### 10.4 圆角、阴影、边框

```css
--radius-sm: 8px;   /* 普通卡片优先 */
--radius-md: 12px;  /* 模态框、大型展示 */
--radius-lg: 18px;
--radius-full: 999px; /* 只用于标签、筛选按钮、状态 */
--shadow: 0 18px 45px rgba(17, 35, 27, 0.16);
```

规则：

- 不把所有板块做成悬浮卡片；不在卡片里再套卡片。
- 阴影只表达层级，不做发光装饰。

### 10.5 布局

- 板块全宽、内容居中，标准区段用 `.section`，保持明显上下节奏。
- 运营/工具区域可更密，故事与照片区域应更有呼吸感。
- 固定比例元素必须有稳定尺寸或 `aspect-ratio`，不靠内容"撑到刚好"。
- 手机端优先单列，不强行缩小桌面多列。
- 断点：`1080 / 760 / 480 / 420`。

### 10.6 动效

现有：区段滚动出现、首页图片淡入微缩放、阵线聚焦、影像墙抬升、点赞粒子、队友评价弹幕。

规范：

- 常规交互约 `0.25s`，区段出现约 `0.7s`。
- 平滑，不造成页面跳动；滚动监听用 `requestAnimationFrame` 或观察器。
- 手机纵向滚动不能被横向滑动组件锁死。
- **必须支持 `prefers-reduced-motion`**。
- 不加无意义的持续旋转、漂浮光球、背景粒子。

---

## 11. 组件级规范

### 11.1 首页

- 首屏必须首先看到球队或真实比赛。
- 标题放照片空白区；建队年份、球员人数、主场放底部。
- 手机端必须用单独裁切图。
- 所有轮播控制可点击、可触摸。
- 首页展示最近 3 条已发布公告与下一场/最近赛果。

### 11.2 赛事档案

见 6.5。

### 11.3 沉浸式首发

桌面端：

- 球场保持足球场比例。
- 向下滚动依次聚焦前锋 → 中场 → 后卫 → 门将。
- 右侧绿色信息卡显示当前阵线与当前球员。
- 非聚焦球员仍可点击打开档案；透明覆盖层不得挡住点击。

手机端：

- 正常上下滑可离开该板块。
- 左右滑球场或信息卡切换阵线，且循环。
- 底部标签明确提示可切换。
- 后卫四人始终排在同一行；门将不被信息卡挡住。

### 11.4 球员档案

- 卡片显示真实姓名、号码、位置、风格。
- 弹窗显示出场、进球、助攻、MVP、评分。
- **只有零封 > 0 才显示零封**；不显示扑救次数。
- 队友评价用弹幕表现；无评价时不要留空白框。
- 展示分与原始分区分清楚（见 5.5）。

### 11.5 影像墙

见 9.3。

### 11.6 自由战术板

- 6 种阵型：`4-3-3`、`4-4-2`、`4-2-3-1`、`4-1-4-1`、`3-5-2`、`3-4-3`。
- 先点场上位置再点球员换人；已在场上的两人互换。
- 头像可拖拽微调站位；拖动后不能误触打开档案。
- 换阵型时用"就近匹配"保留原有球员。
- 状态存 `localStorage`，键 **`sk-football-tactics-v1`**，值 `{formation, custom, slots}`。
- 读入时必须校验：11 人、无重复、坐标在界内、球员存在；异常则放弃读取并提示，不能把脏数据写回。
- 「恢复标准站位」「恢复默认阵容」两个按钮必须有效。
- 战术板改动**只在当前浏览器生效**，不写回数据文件。

### 11.7 新增板块前先回答

1. 是否服务"记录、纪念、队员体验"？
2. 数据来自哪里？
3. 手机端最主要的动作是什么？
4. 能否复用现有 section、标题、按钮和配色？
5. 是否影响首屏加载？
6. 没有真实内容时是否应延后上线？

实现时：用现有 CSS 变量、`.section__kicker/.section__title/.section__subtitle`、现有 Font Awesome 图标；保持键盘焦点样式；**不新增独立设计系统**；不加与纪念站无关的营销段落。

---

## 12. 前端工程规范

### 12.1 技术栈与边界

HTML + CSS + 原生 JavaScript + Font Awesome + Google Fonts + GitHub Pages。

**没有框架、没有构建器、没有数据库。** 除非需求明显扩大，不要为一个小功能引入 React/Vue/打包器/复杂状态管理。

### 12.2 JavaScript 约定

- 数据挂在全局：`window.PONYTAIL_DATA`（生成）、`window.PONYTAIL_GALLERY`（手写）等。
- 渲染逻辑集中在 `main.js`；栏目与路由在 `sections.js`；战报在 `match-detail.js`；战术板在 `tactics.js`。
- **所有用户/数据文本写入 HTML 前必须 `escapeHtml()`**。
- DOM 用现有 `$()` 辅助函数获取。
- 滚动事件必须节流或 `requestAnimationFrame`。
- 图片懒加载优先 `IntersectionObserver`。
- 弹窗打开后焦点移到关闭按钮，关闭后焦点回到触发元素，`Escape` 可关闭。
- 手机横向手势必须判断横向位移大于纵向位移。

### 12.3 路由约定

- 栏目：`#home`、`#team`、`#matches`、`#tactics`、`#gallery`、`#notices`、`#about`、`#recruit`、`#more`
- 详情：`#match/<比赛ID>`、`#notice/<公告ID>`
- 别名必须保持可用：`hero→home`、`newcomers/managers→team`、`memory→matches`、`squad→tactics`、`story/honors→about`
- 用 `history.pushState` + `hashchange` 双通道；切页时记住并恢复滚动位置。
- **新增或改名路由时，必须保留旧锚点可用**，否则外部已分享的链接会失效。

### 12.4 性能

- 首页首图立即加载，下一张延迟预加载。
- 影像墙延迟加载；球员照片用 WebP；手机首页用独立小图。
- 避免在滚动事件里浏览/重排整个页面。
- 新增大图先压缩；不把视频、原始大图、Excel 放进首屏加载链路。
- 改资源后更新版本参数（如 `?v=xxx`）或用新文件名，避免缓存。

### 12.5 可访问性

- 图片必须有 `alt`；图标按钮必须有 `aria-label`。
- 菜单维护 `aria-expanded`；标签切换维护 `aria-selected`。
- 弹窗用 `role="dialog"` + `aria-modal="true"`。
- 键盘焦点必须清晰可见。
- 状态不能只靠颜色表达。
- 动画遵守 `prefers-reduced-motion`。

---

## 13. 内容与文案规范

### 13.1 真实性

- 所有文案必须来自真实队史、真实比赛或队员信息。
- **禁止用空泛 AI 文案补齐资料。**
- 缺资料写「待补充」，或暂不展示。

### 13.2 公告格式

见 8.3（固定格式、线上链接、只增不覆盖）。

### 13.3 内部规则不外发

见 8.4。

### 13.4 语气

- 克制、具体、有温度；少用形容词堆砌。
- 用真实细节代替口号：哪天、几点、谁、第几分钟、什么天气。
- 不写与球队无关的营销句。

---

## 14. 更新与发布流程（唯一版本）

### 14.1 标准流程

1. **确认信息**：日期、对手、比分、出场、事件、图片归属、公开范围。
2. **改唯一数据源**（`team-records.json` 或对应内容文件），不直接改页面显示数字。
   - 若用 Excel 录入比赛：填 `data/比赛录入.xlsx` → `python tools/import_matches.py`（见 4.6）。
3. **生成**：`node tools/build_team_data.mjs`。
4. **测试**：见 14.2。
5. **本地验收**：桌面 + 手机尺寸检查赛事详情、公告、照片裁切、资源加载（见 15）。
6. **写公告**：`docs/updates/日期-主题.md`，并在回复中附同文（见 8.3）。
7. **提交**：`git status` / `git diff` 核对，只暂存本次相关文件。
8. **推送并核对线上**：`git push origin main` → 等 Actions 绿 → 打开线上链接强制刷新确认。

### 14.2 发布前命令（四条，全部必须通过）

```powershell
node tools/build_team_data.mjs
node --test tests/match-records.test.mjs tests/tactics.test.cjs
python tests/team-workbook-sync.test.py
node tests/team-memorial-refresh.test.mjs
```

补充说明：

- `node tools/build_team_data.mjs --check` 只校验不写入，用于确认"生成文件与数据源一致"，CI 会跑它。
- 只跑前两条测试**不算通过**。
- 改了样式/结构时，还要人工按第 15 章回归。

### 14.3 Git 规则

提交前：

```powershell
git status
git diff
```

推送：

```powershell
git pull --rebase origin main
git push origin main
```

规则：

- 只提交本次修改，不清理或回退不相关文件。
- 不机械地 `git add -A`。
- **禁止强制推送**；禁止未经确认 `git reset --hard`。
- 出现合并冲突：先 `git status`，确认冲突文件，解决后再提交；必要时 `git merge --abort`，不要反复 pull。
- **默认必须推送**（校验通过后），只有用户明确要求「暂不发布 / 只在本地预览」才停在本地。

### 14.4 部署检查

`deploy-pages.yml` 监听 `main`，流程为：Node 22 → `build_team_data.mjs --check` + 两个测试 → `configure-pages` → `upload-pages-artifact`（`path: .`）→ `deploy-pages`。

推送后：

1. 打开仓库 `Actions`。
2. 查看 `Deploy GitHub Pages` 是否绿。
3. 打开线上站点强制刷新，检查手机页面。
4. 若红叉：进入失败任务看具体步骤，**不要重复新建 Pages 工作流**。

---

## 15. 验收清单

### 15.1 必测尺寸

- 桌面 `1440 × 900`
- 笔记本 `1280 × 720`
- 手机 `390 × 844`
- 小屏手机 `360 × 800`

### 15.2 回归清单

**首页**：三张图都能加载；箭头/圆点/自动播放/滑动有效；手机人物没被裁掉；标题不挡脸；招新入口有效。

**赛事**：年份与杯赛切换有效；默认赛事正确；比赛数量正确；日期倒序；比分与赛果正确；战报页可进入并可返回。

**阵容**：11 名首发都在；四条阵线依次聚焦；聚焦期间球员仍可点击；手机左右滑与上下滚不冲突；后卫同排；信息卡不挡门将。

**战术板**：六种阵型切换后仍是 11 人且在场内；拖拽不误触弹窗；刷新后恢复上次阵容；异常数据不会写入。

**球员弹窗**：姓名/号码/位置正确；数据与 `team-records.json` 一致；展示分符合 +1 规则；零封只在有数据时显示；评价不空白；关闭与键盘行为正确。

**影像墙**：分类有效；懒加载有效；点赞不打开照片；照片弹窗正确；文案与照片匹配。

**公告**：`#notice/<id>` 可打开；首页只显示已发布的前 3 条；置顶/分类不影响排序（当前实现如此）。

**招新**：群号正确；二维码可扫码；手机端文字与二维码不溢出。

---

## 16. 已知限制与维护陷阱

### 16.1 静态站的固有限制

- 点赞不跨设备保存；阵容调换只在当前浏览器；访客不能永久留言；内容更新必须改文件重部署。
- 扩容方案（Supabase：留言表/点赞表/审核状态/RLS/前端只给匿名新增权限）为前提；**service role key 绝不能进前端或仓库**。

### 16.2 具体陷阱

1. **评分有两层**：文件里是原始分，网页对 <8 分临时 +1（见 5.5）。
2. **手改生成文件会丢**：`js/team-data.js`、`data/player-stats.json` 由构建脚本重建；`js/notices-data.js`、`js/newcomer-data.js`、`js/manager-data.js` 由 Excel 同步脚本重建。五者都不能手改。
3. **旧 Excel 不能回写球员/比赛数据**：`生康足球队数据源.xlsx` 的 `统计汇总`/`球员数据`/`赛事索引`/`赛程` 已是过期快照（17 人 / 110 出场），不要据它判断现状；新比赛请用 `比赛录入.xlsx`（4.6）。
4. **球员匹配依赖姓名**：改名可能丢照片和评价（见 5.6）。
5. **首页球员人数是写死的**：`index.html` 里目前仍是 `17`，而实际有 **29** 名球员，修改时一并更正。
6. **默认赛事不会自动跟随**：新赛季要手动改 `defaultCompetitionId`。
7. **阵容编辑不持久**：页面换人不写回代码；只有战术板存 localStorage。
8. **点赞不持久。**
9. **二维码不能由 AI 重绘。**
10. **手机与桌面用不同首页图**：只换桌面图会导致手机仍是旧图。
11. **缓存会让修改"看起来没生效"**：换文件名或更新版本参数，再强制刷新。
12. **比赛筛选依赖赛事名称与日期年份**：`name` 必须与 `competitions` 完全一致。
13. **新球员不会自动拥有真实介绍**：必须人工补 `bio`/`reviews`/照片。
14. **公告的 `pinned`、`category` 目前未生效**：脚本不消费这两个字段。
15. **`docs/` 下的旧文档含失效流程**：以本规则为准，不要照抄第 4–6 章旧流程。
16. **`docs/updates/` 有重复与格式不一致的历史文件**（2026-10-24 两篇内容相同；2026-10-21 方昭炬那篇缺标题行）：新文件按 8.3 写，不要模仿。
17. **`python tools/sync_team_workbook.py` 现在必失败**：`main()` 固定把 `js/team-data.js` 当输出，守卫检测到 `team-records.json` 就抛 `ValueError`。新生/经理/公告的同步入口因此一起被冻结，绕行方案见 7.6。
18. **Excel 与仓库已经不"同源"**：`newcomer-data.js` 一致，但 `manager-data.js`、`notices-data.js` 与 Excel 有差异。任何"照 Excel 重生成"的操作都会**回退**仓库里后来的手工修正。

---

## 17. 向负责人收集资料的模板

### 17.1 新球员

姓名、绰号、球衣号码、主位置、可胜任位置、惯用脚、踢球风格、队友评价、个人介绍、一张清晰照片、是否进入固定首发。

> 出场/进球/助攻/MVP/零封/低失球场**不再单独提供累计数**——由逐场记录自动汇总。

### 17.2 新比赛

日期、开球时间、赛事名称、对手、比分、场地、我方阵容（首发/替补）、进球者与分钟、助攻者（未知就说未知）、换人与分钟、MVP、全场时长、简短战报、照片（含归属与摄影者）。

### 17.3 新照片

照片里是谁、什么时间与场景、属于比赛/训练/合照/毕业/荣誉/场外、是否允许公开、希望放首页/影像墙/球员头像。

---

## 18. 下一位维护者的首日清单

- [ ] 读完本 `rule.md`
- [ ] 打开线上网站完整浏览一次
- [ ] 读 `data/team-records.json`，理解 `baseline` 与 `matches` 的关系
- [ ] 跑一遍：`node tools/build_team_data.mjs --check` 与 14.2 的四条命令
- [ ] 本地启动：`python -m http.server 8061 --bind 127.0.0.1`
- [ ] 桌面 + 手机各检查一遍首页
- [ ] 打开至少三个球员档案
- [ ] 切换全部赛事并进入一场战报
- [ ] 完整体验沉浸式阵容与战术板
- [ ] 测试影像墙点赞与弹窗
- [ ] 看一次 GitHub Actions 发布记录
- [ ] 第一次正式修改前先做一次独立的小提交

---

## 19. 附录

### 19.1 当前状态快照（截至 2026-10-24 最后一次提交）

| 项 | 值 |
|---|---|
| 球员总数 | 29（含 1 名位置待定新生） |
| 有出场记录 | 19 |
| 比赛总数 | 13（11 场历史 + 2 场逐场明细） |
| 战绩 | 4 胜 0 平 9 负，进 17 失 33 |
| 累计 | 出场 135、进球 17、助攻 12、MVP 2、零封 4 |
| 默认赛事 | `2026-eleven-fangda` |
| 公告数 | 8（已发布） |
| 影像墙 | 11 张 |
| 最近一场 | 2026-10-23 2:0 胜管理学院（十一人制首胜） |

> 本节只是快照，**不要当规则执行**；每次更新后如方便可顺手刷新。

### 19.2 常见错误对照表

| 做了这件事 | 后果 |
|---|---|
| 以为还能用 Excel 记球员/比赛 | 旧的四张表不能；但可用 `data/比赛录入.xlsx` + `import_matches.py`（见 4.6） |
| 跑 `python tools/sync_team_workbook.py` | 第一步抛 `ValueError`、退出码 1，什么都不会写 |
| 用 Excel 数据整体覆盖 `js/notices-data.js` / `manager-data.js` | 会**回退**仓库里后来的手工修正 |
| 手改 `js/team-data.js` | 下次构建被完全覆盖，改动丢失 |
| 手改 `js/notices-data.js` / `newcomer-data.js` / `manager-data.js` | 与 Excel 脱钩；将来修好同步通道后会被覆盖 |
| 用 Excel 改球员/比赛再跑同步 | 抛 `ValueError`，或数据不进网站 |
| 把新比赛写进 `historicalMatches` | 不参与个人统计，数据"隐身" |
| 明细比赛日期早于 2026-10-15 | 构建报错「会重复统计」 |
| 重复跑构建 | 安全，幂等不重复累计 |
| 只跑两个测试就推送 | CI 的 `--check` 或 match-records 测试失败，Pages 不发布 |
| 忘记写 `docs/updates/` 公告 | 违反硬性规则 |
| 公告只给本地 `docs/updates/xxx.md` 路径 | 违反硬性规则，必须给 `#notice/<id>` 线上链接 |
| 把维护规则写成官网公告 | 违反 8.4 |
| 用 AI 生成球员头像 | 违反 5.3 |
| 改球员姓名 | 可能丢照片与评价 |
| 改文件名覆盖旧图 | 浏览器缓存导致"没生效" |

---

**本文件维护**：规则变更时直接改本文件，并在 `docs/updates/` 留一条记录说明为什么改。历史文档不再更新。
