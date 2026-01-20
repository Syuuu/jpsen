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
默认无需配置即可运行。若需要服务器端 TTS（支持 VoiceRSS 或 OpenAI）：

```bash
TTS_PROVIDER=voicerss
TTS_API_KEY=你的key
TTS_VOICE=ja-jp
```

## 如何接入第三方 TTS API
项目内置 `/api/tts` 作为统一入口，你可以在 `app/api/tts/route.ts` 中按需扩展供应商逻辑。

**推荐流程：**
1. 在环境变量中设置 `TTS_PROVIDER` 与对应的密钥。
2. 在 `route.ts` 中根据 `TTS_PROVIDER` 选择不同的供应商实现。
3. 返回音频二进制数据（`audio/mpeg` 或 `audio/wav`），前端自动播放。

**示例：使用 VoiceRSS**
```bash
TTS_PROVIDER=voicerss
TTS_API_KEY=你的key
TTS_VOICE=ja-jp
```

**示例：使用 OpenAI**
```bash
TTS_PROVIDER=openai
OPENAI_API_KEY=你的key
OPENAI_TTS_MODEL=gpt-4o-mini-tts
OPENAI_TTS_FORMAT=mp3
TTS_VOICE=alloy
```

**可扩展方向：**
- 新增 `if (provider === "azure") { ... }`、`if (provider === "polly") { ... }` 分支。
- 使用 `voice` 查询参数来切换不同音色（例如 `?voice=female1`）。

## 部署到 Vercel
1. 将仓库推到 GitHub。
2. 在 Vercel 导入项目（Framework 选择 Next.js）。
3. 进入项目 Settings → Environment Variables。
4. 选择环境（Production/Preview/Development），逐项添加变量（如 `TTS_PROVIDER`、`OPENAI_API_KEY` 等）。
5. 保存后触发一次重新部署（Redeploy）。
6. 部署完成后即可访问。

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
