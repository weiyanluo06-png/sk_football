# 生康足球队纪念站

武汉纺织大学生物医学工程与健康学院足球队的记忆网站。

这里不只是比分和名单，也是训练后的笑声、雨战后的合照、毕业前最后一脚球，以及每位队员在场上留下的痕迹。

> 希望这段足球队时光，能成为大家大学青春记忆中浓墨重彩的一笔。
> 是每一位队员的存在成就了生康足球队，也希望球队越来越好。

## 在线访问

[https://weiyanluo06-png.github.io/sk_football/](https://weiyanluo06-png.github.io/sk_football/)

每次推送到 `main` 分支后，GitHub Pages 会自动重新发布网站。

## 网站内容

- 首页轮播：球队合照与球队记忆主题
- 本赛季：比赛时间轴、对手、比分、进球记录与赛后记忆
- 队员档案：球员数据、重点队员卡片与阵容调换预览
- 沉浸式阵容：滚动时依次聚焦前锋、中场、后卫与门将
- 影像墙：训练、比赛、合照、荣誉与告别时刻
- 荣誉瞬间：队史节点与值得记住的比赛

## 项目结构

```text
.
├─ assets/
│  ├─ photos/          # 首页与影像墙照片
│  └─ players/         # 球员照片
├─ css/
│  └─ style.css        # 页面样式与响应式布局
├─ js/
│  ├─ team-data.js     # 球员、阵容、比赛与荣誉数据
│  ├─ gallery-data.js  # 影像墙数据
│  └─ main.js          # 页面渲染、交互、轮播与弹窗逻辑
├─ .github/workflows/  # GitHub Pages 自动发布工作流
└─ index.html          # 网站入口
```

## 更新球队内容

### 更新球员资料

编辑 `js/team-data.js`。例如，为队员绑定本地照片：

```js
photo: 'assets/players/wuyuze.jpg'
```

球员照片放在 `assets/players/`，建议使用竖版 JPG 或 WebP。

### 更新首页或影像墙照片

将照片放到 `assets/photos/`，再修改对应路径：

- 首页轮播：编辑 `index.html` 中的 `.hero__slide` 背景图片
- 影像墙：编辑 `js/gallery-data.js` 中的 `image` 字段

建议使用新的文件名，例如 `team-photo-2026.jpg`，避免手机浏览器继续使用旧缓存。

### 更新比赛与荣誉

在 `js/team-data.js` 中维护：

- `matches`：比赛记录
- `honors`：荣誉与队史节点
- `startingLineup`：沉浸式首发阵容

## 本地预览

在项目根目录运行：

```powershell
python -m http.server 8061 --bind 127.0.0.1
```

然后访问 [http://127.0.0.1:8061/](http://127.0.0.1:8061/)。

## 提交与发布

```powershell
git add .
git commit -m "更新球队资料"
git push
```

推送后，到 GitHub 仓库的 `Actions` 页面查看 `Deploy GitHub Pages` 是否为绿色成功状态。
