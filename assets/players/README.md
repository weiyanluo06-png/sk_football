# 球员照片

将照片放在此目录，例如 `zhouxiaoxu.jpg`。

然后在 `data/team-records.json` 的 `players` 对应球员对象里填写 `photo`：

```json
"photo": "assets/players/zhouxiaoxu.webp"
```

推荐竖版 JPG 或 WebP，最小尺寸 800 × 1000 像素；同时保留原图与网页 WebP。
改完运行 `node tools/build_team_data.mjs` 生成网站数据。未配置照片的队员会继续使用页面现有占位图。
