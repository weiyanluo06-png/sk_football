import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadWindowData(relativePath, key) {
  const source = fs.readFileSync(path.join(root, relativePath), "utf8");
  const context = { window: {} };
  vm.runInNewContext(source, context);
  return context.window[key];
}

test("赵慰冉经理资料与欢迎公告保持一致", () => {
  const managerData = loadWindowData("js/manager-data.js", "MANAGER_DATA");
  const notices = loadWindowData("js/notices-data.js", "TEAM_NOTICES");
  const manager = managerData.managers.find((item) => item.name === "赵慰冉");
  const notice = notices.find((item) => item.id === "welcome-zhaoweiran-2026");

  assert.deepEqual(JSON.parse(JSON.stringify(manager)), {
    order: 3,
    name: "赵慰冉",
    grade: "2024级",
    season: "2026",
    role: "球队经理",
    duties: "",
    intro: "我再想想",
    photo: "assets/managers/zhaoweiran.jpg",
    photoPosition: "50% 50%",
  });
  assert.ok(notice);
  assert.equal(notice.status, "发布");
  assert.equal(notice.image, manager.photo);
  assert.deepEqual(Array.from(notice.members), ["赵慰冉"]);
  assert.match(notice.body, /个人介绍为“我再想想”/);
  assert.ok(fs.existsSync(path.join(root, manager.photo)));
});

test("姓名更正已同步到经理资料和官网公告", () => {
  const managerData = loadWindowData("js/manager-data.js", "MANAGER_DATA");
  const notices = loadWindowData("js/notices-data.js", "TEAM_NOTICES");
  const manager = managerData.managers.find((item) => item.order === 1);
  const notice = notices.find((item) => item.id === "name-corrections-2026-10-24");

  assert.equal(manager.name, "陈晗韵");
  assert.ok(notice);
  assert.equal(notice.status, "发布");
  assert.match(notice.body, /王恺程/);
});
