# 情绪调酒师 Mood Mixer V5

移动端优先的水彩情绪调酒 PWA。

## 本次升级

### 视觉
- 酒杯改成完整一体式 SVG，不再把杯身、杯脚和底座拆开拼接。
- 飓风杯、圆肚杯、高球杯、马天尼杯共四种杯型。
- 杯中增加颜料晕染、半透明水彩斑块、纸张颗粒、色素沉积和不规则边缘。
- 首页、调制动画、结果页、酒窖和公共酒单全部使用同一套水彩酒杯语言。
- 卡片、按钮和页面背景也加入了水彩纸与晕染质感。

### 功能
- 酒窖筛选可用：全部、本周、开心、疲惫、焦虑、平静、复杂。
- 酒窖支持网格与时间线两种浏览模式。
- 公共酒单分类按钮可用。
- 公共配方可以查看、套用和收藏到酒窖。
- 新增杯型与装饰选择：薄荷叶、柑橘片、浆果串、不加装饰。
- 结果页支持收藏、重新命名、重新调制、删除。
- 分享卡支持三种模板；手机支持系统分享，桌面端支持 PNG 下载。
- 个人页支持安装提示、数据导出、重看引导和清空数据。
- 所有可见按钮都已绑定对应操作。

### 手机与 PWA
- JavaScript 改为 `defer` 普通脚本，兼容性比 module 脚本更好。
- localStorage 被限制时不再导致白屏。
- Service Worker 改为页面网络优先，减少手机读取旧版本的问题。
- CSS、JS、Manifest 均加入 V5 版本参数。
- 增加 iPhone PWA Meta、Manifest scope/id/orientation。
- 增加 `vercel.json` 缓存规则。

## 上传到 GitHub

请将 `mood-mixer-v5` 文件夹里面的内容上传到仓库根目录：

```text
assets/
app.js
index.html
manifest.webmanifest
styles.css
sw.js
vercel.json
README.md
```

不要把外层文件夹一起嵌套上传。

## Vercel 设置

- Framework Preset：Other
- Root Directory：仓库根目录
- Build Command：留空
- Output Directory：留空或 `.`
- Install Command：留空

## 手机仍显示旧版本

PWA 会缓存旧文件。新版部署后：

1. 删除手机桌面上的旧 App 图标。
2. 清除该网站的浏览数据或缓存。
3. 在 Safari/Chrome 中重新打开 Vercel 地址。
4. 确认页面显示 V5 后，再添加到主屏幕。

## 本地启动

```bash
python -m http.server 5173
```

然后打开：

```text
http://localhost:5173
```
