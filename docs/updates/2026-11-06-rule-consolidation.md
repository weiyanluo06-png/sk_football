# 2026-11-06 规则合并与比赛录入工具（内部维护，不发官网公告）

## 本次做了什么

1. **规则合并**：把原先分散的 `docs/网站更新规则.md`、`docs/生康足球队纪念站-项目交接手册.md`（含 .docx）、`data/README.md` 的有效内容合并成根目录的 `rule.md`，并剔除 2026-10-16 数据架构迁移后失效的 Excel 旧流程。合并后**删除上述旧规则文件**。
2. **新增比赛录入通道**：`data/比赛录入.xlsx`（比赛 / 战报 / 出场 / 事件 / 照片五张表）+ `python tools/import_matches.py`，填表后自动转换成 `data/team-records.json` 的逐场明细并重新生成网站数据；校验失败自动回滚。
3. **新增生成器与测试**：`tools/build_match_workbook.py` 重新生成录入表；`tests/import-matches.test.py` 覆盖往返无损与填表错误。
4. **新增采集清单**：`docs/比赛数据收集清单.md`，赛后按 20 个问题问清再填表。
5. **清理历史遗留**：删除 `docs/superpowers/`（10 份已实现特性的设计与计划稿）、`tools/build_handoff_docx.py`（只为生成已删除的交接手册 docx）、`docs/updates/2026-10-24-management-match-photos.md`（与同日另一篇内容完全重复）。
6. **README 重写**：改为项目介绍 + 目录导览，维护细节统一指向 `rule.md`；修正"编辑 js/team-data.js"这类已失效的旧指引。

## 为什么不算网站更新

本次只动维护文档与工具，**没有任何访客可见的页面变化**，也没有新增或修改比赛/球员数据。

按 `rule.md` 第 8.4 节，内部维护规则与流程默认不做成官网公告，因此**本次不发布公告、不写进 `#notice/` 列表**；本文件只作为维护者日志留档。

## 验证

```powershell
node tools/build_team_data.mjs --check          # 比赛记录与生成数据一致
python tools/import_matches.py --dry-run        # 表内 2 场：0 新增 0 更新
python tests/import-matches.test.py             # 8 项通过
```

## 下一位维护者注意

- 规则只有 `rule.md` 一份，旧文档已删除，不要再去找。
- 新增规则或改流程：直接改 `rule.md`，并在 `docs/updates/` 留一条记录。
- `data/生康足球队数据源.xlsx` 仍是历史存档，只读。
