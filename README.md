# 情绪调酒师 Mood Mixer

一个移动端优先、无需后端即可运行的情绪娱乐 PWA。用户选择情绪、强度、当天事件、电量、天气与期望余味，应用会通过确定性规则生成专属虚拟饮品。

## 已实现

- 三页新手引导
- 移动端首页与底部导航
- 五步情绪调制流程
- 非 Spinner 的调制动画
- 动态饮品名称、配方、风味和视觉
- 本地收藏与情绪酒窖
- 公共情绪酒单
- 个人月度摘要
- 三套 9:16 分享卡模板
- Canvas 导出 PNG
- PWA Manifest 与 Service Worker
- 本地离线使用
- 无 API Key、无数据库依赖

## 本地运行

推荐使用静态服务器，不要直接双击 `index.html`，否则 Service Worker 可能无法生效。

### Python

```bash
python -m http.server 5173
```

访问：

```text
http://localhost:5173
```

### Node

```bash
npx serve .
```

## 部署到 Vercel

1. 把整个项目上传到 GitHub 仓库。
2. 在 Vercel 中导入仓库。
3. Framework Preset 选择 `Other`。
4. Build Command 留空。
5. Output Directory 填 `.`。
6. 点击 Deploy。

## 交给在线 Codex 继续修改

把仓库连接到 Codex 后，可使用：

```text
Continue developing this mobile-first PWA without changing its core product concept.
Preserve the existing onboarding, five-step mixing flow, deterministic generator,
localStorage persistence, CSS/SVG drink visuals, share-card canvas export and PWA setup.

Priorities:
1. Refactor app.js into reusable ES modules and components.
2. Improve accessibility and keyboard navigation.
3. Add a polished timeline view to the Mood Cellar.
4. Add optional Supabase authentication and cloud sync while keeping localStorage as fallback.
5. Add an optional server-side AI generator that returns structured JSON, while preserving
   the deterministic generator as offline fallback.
6. Do not convert the interface into a desktop dashboard.
7. Keep all visible copy in natural Chinese.
```

## 说明

本项目生成的饮品均为虚拟、零酒精情绪饮品，不构成心理诊断或治疗建议。
