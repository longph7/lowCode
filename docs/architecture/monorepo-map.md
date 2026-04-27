# 仓库边界图

虽然模板名叫 monorepo map，但 `lowCode` 当前更接近单仓库双运行层结构。这里记录的是“顶层目录 ownership 和依赖方向”。

## 顶层目录

```text
backend/            独立 Node/Express 服务
docs/               项目知识、规范、说明文档
plans/              非 trivial 任务计划
public/             前端静态资源
src/                前端低代码编辑器
dist/               前端构建产物
node_modules/       依赖目录
```

## 目录清单

| Path | 作用 | 允许依赖 | 不应该做什么 | 备注 |
| --- | --- | --- | --- | --- |
| `src/` | 前端编辑器、画布、物料、AI 对话 UI | npm 前端依赖、`src/api/`、`src/editor/` 内部模块 | 直接 import `backend/src/` | 当前主业务层 |
| `src/editor/` | 编辑器核心运行时 | `src/editor/*`、通用 UI、状态库 | 直接写后端调用细节到任意子组件 | 真正的核心代码区 |
| `src/api/` | HTTP/SSE 调用封装 | `axios`、浏览器 EventSource | 承担画布状态管理 | 前端和后端的边界层 |
| `backend/src/` | Express API、SSE、模型接入、节点归一化 | Node 依赖、本目录模块 | 反向依赖前端源码 | 单独启动 |
| `docs/` | 结构化知识和协作规则 | 引用仓库真实文件路径 | 只写空泛说明 | 应持续更新 |
| `plans/active/` | 当前复杂任务的执行上下文 | 任务事实、验证结果、风险 | 长期堆积过期计划 | 做完要清理 |
| `public/` | 浏览器公开静态资源 | 被前端构建引用 | 存放业务逻辑 | 较稳定 |
| `dist/` | 构建结果 | 无 | 手工编辑 | 可再生 |

## 前后端依赖方向

```text
src/editor/ -> src/api/ -> backend/src/server.js -> backend/src/llm.js
                                          \-> backend/src/poster-schema.js
```

允许：

- 前端通过 `src/api/` 调 HTTP/SSE
- 后端内部在 `server.js / llm.js / poster-schema.js` 之间组织逻辑

不允许：

- 前端直接 import `backend/src/*`
- 后端依赖浏览器状态或前端组件实现

## 核心代码入口

- 前端入口：`src/main.tsx`
- 页面组装入口：`src/App.tsx`
- 编辑器入口：`src/editor/HybridLowcodeEditor.tsx`
- 画布入口：`src/editor/EditoArea/index.tsx`
- AI 对话入口：`src/editor/components/AIDialog/index.tsx`
- 后端入口：`backend/src/server.js`

## 修改定位口诀

- 改画布交互，先看 `src/editor/`
- 改接口和流式协议，先看 `src/api/` + `backend/src/`
- 改项目说明和协作规则，先改 `docs/`
- 改复杂任务过程记录，先改 `plans/active/`
