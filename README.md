# IsMe — 个人超级助理

**IsMe** 是一个本地优先（Local-first）的个人超级助理 Web 应用：数据完全保存在你自己的浏览器里，无需注册、无需服务器。通过自然语言指令驱动技能，也可选择性接入任意 OpenAI 兼容的大模型。

设计参考了开源社区的优秀个人助理项目：[OpenClaw](https://github.com/openclaw/openclaw)（"真正做事"的指令执行）、[Leon](https://github.com/leon-ai/leon)（意图→技能的模块化架构）、[Jan](https://github.com/menloresearch/jan)（本地优先与隐私）、[Cherry Studio](https://github.com/CherryHQ/cherry-studio)（多助手工作台体验）。

## ✨ 功能

| 技能 | 指令示例 |
|---|---|
| 待办事项 | `提醒我 明天下午三点开会`、`查看待办`、`清理已完成` |
| 快速笔记 | `记一下 周四给客户回电话`、`查看笔记` |
| 实时天气 | `上海天气`（Open-Meteo，无需 API Key） |
| 安全计算 | `计算 128 * 46 + 9` |
| 时间日期 | `现在几点`、`今天几号` |
| 番茄钟 | `番茄钟`（25 分钟专注 / 5 分钟短休 / 15 分钟长休） |
| 帮助 | `帮助` 查看全部技能 |

- 🔒 **本地优先**：对话、待办、笔记、设置全部存于浏览器 localStorage，不上传任何数据
- 🧩 **技能化架构**：意图解析 → 技能路由（`src/lib/assistant.ts`），新增技能只需添加一条路由
- 🤖 **可选 LLM 增强**：在设置中填入任意 OpenAI 兼容接口（Base URL + Key + 模型），未命中本地技能的对话自动交给大模型
- 🖥️ **双栏工作台**：左侧对话流，右侧待办 / 笔记 / 专注面板，技能结果以交互卡片形式内嵌在对话中

## 🚀 快速开始

```bash
npm install
npm run dev        # 开发模式，默认 http://localhost:3000
npm run build      # 生产构建 → dist/
npm run preview    # 本地预览生产构建
```

## 🏗️ 技术栈

React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui

```
src/
├── lib/assistant.ts      # 助理核心：意图解析、技能路由、天气、计算、LLM 兜底
├── hooks/useLocalStorage.ts
├── sections/             # ChatPanel / TodoList / NotesList / Pomodoro / WeatherCard / HelpCard / SettingsDialog
└── types/                # 共享类型定义
```

## 🗺️ 路线图

- [ ] 定时提醒（通知 + 到点触发）
- [ ] 更多技能：翻译、汇率、剪贴板历史、本地文件搜索
- [ ] 技能插件市场（SKILL.md 声明式技能，借鉴 Leon 2.0）
- [ ] PWA 离线安装

## License

MIT
