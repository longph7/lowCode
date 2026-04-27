# 架构总览

本文档回答三个问题：

1. 这个仓库由哪些运行层组成
2. 每一层分别拥有什么职责
3. 出现需求时应该先改哪里

## 系统概览

`lowCode` 当前不是 monorepo，而是“单前端应用 + 同仓库独立后端服务”的组合。

```text
src/                前端低代码编辑器与 AI 对话 UI
backend/src/        Express API 与 LLM 接入
public/             前端静态资源
docs/               持久化项目知识
plans/              非 trivial 任务计划
```

## 前端分层

- `src/App.tsx`
  - 组装编辑器、全局拖拽预览和 AI 对话浮层
- `src/editor/`
  - 编辑器核心运行时
- `src/api/`
  - 前端调用后端 API 与 SSE 的封装
- `src/components/`
  - 与编辑器配合的通用 UI 组件

前端的真实核心在 `src/editor/`，不是 `src/components/`。

## 编辑器核心分层

- `stores/`
  - 核心状态与数据结构
- `materials/`
  - 可放入画布的组件实现
- `components/`
  - 编辑器专用交互组件，例如拖拽预览和 AI 对话子组件
- `hooks/`
  - 拖拽、样式变化检测等交互逻辑
- `Setting/`
  - 选中节点后的属性与样式编辑
- `EditoArea/`
  - 画布渲染、缩放、拖动、选中和预览切换
- `utils/`
  - 拖拽、AI 消息、组件注入等工具能力

## 后端分层

- `backend/src/server.js`
  - HTTP 入口、健康检查、SSE 输出
- `backend/src/llm.js`
  - 模型调用或 mock 回退
- `backend/src/poster-schema.js`
  - 节点归一化和 mock 海报节点生成

后端当前是一个轻量 API 层，核心职责不是业务编排，而是把提示词变成前端可消费的 `ComponentNode[]`。

## 核心边界

- 前端不能直接依赖 `backend/src/` 内部实现，只能通过 HTTP/SSE 调用
- `ComponentNode` 及其嵌套 `position/props` 结构是前后端共享契约
- `component-config.tsx` 是组件注册中心；新增物料要围绕这里扩展
- `root_page` 是画布根节点，不应该被普通交互删除
- AI 流式生成先进入 `pendingComponents`，确认完成后才替换正式画布状态

## 改动归属指南

- 画布渲染、缩放、选中、拖动：改 `src/editor/EditoArea/`
- 物料拖入和插入预览：改 `src/editor/hooks/` 和 `src/editor/utils/dragUtils.ts`
- 组件默认属性和可用物料：改 `src/editor/stores/component-config.tsx`
- 节点增删改与持久化：改 `src/editor/stores/new-components.tsx`
- AI 对话 UI 与流式状态：改 `src/editor/components/AIDialog/`、`src/editor/stores/ai-store.ts`
- API 调用方式：改 `src/api/`
- 模型调用、SSE 事件、节点归一化：改 `backend/src/`

## 推荐阅读顺序

1. `docs/architecture/monorepo-map.md`
2. `docs/architecture/editor-runtime.md`
3. `src/editor/stores/new-components.tsx`
4. `src/editor/EditoArea/index.tsx`
5. `src/editor/components/AIDialog/index.tsx`
6. `backend/src/server.js`
