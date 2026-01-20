# jp-phrases-trainer

一个面向日常口语的日语整句训练器，基于 Next.js 14（App Router）+ TypeScript + Tailwind CSS。

## 功能亮点
- 60+ 日常整句数据（场景、语气、中文释义、对话、可扩展槽位）。
- TTS 语音播放，支持语速调节；未配置 TTS 时自动降级到浏览器 Web Speech API。
- 简化版 SRS（间隔复习）系统，状态保存在 localStorage。
- 跟读、填空练习、句子库搜索筛选、收藏。

## 本地启动
```bash
npm install
npm run dev
```

浏览器打开 `http://localhost:3000`。

## 环境变量（可选）
默认无需配置即可运行。若需要服务器端 TTS：

```bash
TTS_PROVIDER=voicerss
TTS_API_KEY=你的key
TTS_VOICE=ja-jp
```

## 部署到 Vercel
1. 将仓库推到 GitHub。
2. 在 Vercel 导入项目（Framework 选择 Next.js）。
3. 如需服务器端 TTS，在 Vercel 的 Environment Variables 中添加上述变量。
4. 部署完成后即可访问。

## 项目结构
```
app/                # App Router 页面与 API
components/         # UI 组件
data/               # 本地句子数据
hooks/              # 客户端 hooks
lib/                # SRS/存储等逻辑
```

## 后续可扩展清单
- 接入数据库与账号系统（同步 SRS/收藏）。
- 多语音提供商（Azure/Google/Polly/OpenAI 等）。
- 录音跟读评分（声学对齐/发音评分）。
- AI 自动生成对话/多轮语境。
- 主题学习计划与日历提醒。
