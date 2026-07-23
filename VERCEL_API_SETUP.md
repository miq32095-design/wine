# Mood Mixer V8 · 千问 API 配置

## 1. 上传项目

将 `mood-mixer-v8-ai-bartender` 文件夹中的全部内容上传到 GitHub 仓库根目录，确认根目录能直接看到：

- `index.html`
- `app.js`
- `styles.css`
- `api/generate-drink.js`
- `vercel.json`

不要把真实 API Key 写入任何文件。

## 2. 在 Vercel 配置环境变量

进入：`Vercel 项目 → Settings → Environment Variables`，添加：

```text
DASHSCOPE_API_KEY = 你的百炼 API Key
DASHSCOPE_MODEL = qwen3.7-plus
DASHSCOPE_BASE_URL = 你的 API Host
```

北京地域可以先使用：

```text
https://dashscope.aliyuncs.com/compatible-mode/v1
```

如果百炼控制台给出了包含 Workspace ID 的新 API Host，优先原样使用控制台提供的地址，例如：

```text
https://你的WorkspaceId.cn-beijing.maas.aliyuncs.com/compatible-mode/v1
```

环境选择至少勾选 `Production`；需要测试预览部署时，再同时勾选 `Preview`。

## 3. 重新部署

保存环境变量后，必须重新部署一次：

`Deployments → 最新部署右侧 … → Redeploy`

旧部署不会自动获得新环境变量。

## 4. 验证

部署完成后打开：

```text
https://你的域名.vercel.app/api/generate-drink
```

正常情况下会看到类似：

```json
{"ok":true,"configured":true,"model":"qwen3.7-plus"}
```

然后进入 App 的“我的”页面，应显示“已连接 · qwen3.7-plus”。

## 5. 安全说明

- 不要把 `.env`、`.env.local` 或 API Key 提交到 GitHub。
- 前端只请求同域名的 `/api/generate-drink`，真实 Key 只在 Vercel Function 中读取。
- AI 失败、超时、未配置或达到本地软限制时，会自动回退到 V7.1 的本地生成器。
- 当前“每日 8 次”是设备端软限制，主要用于控制个人测试成本，不是防滥用的服务器级计费系统。
