# AGENTS.md

从这里开始。把这个文件当作导航图，不要当成百科全书。

## 仓库定位

`lowCode` 是一个面向海报/页面生成的低代码编辑器仓库，当前形态是：

- 一个 Vite + React + TypeScript 前端应用
- 一个放在 `backend/` 下的独立 Express 服务
- 以 Zustand 为核心状态层
- 以 React DnD 驱动拖拽放置
- 以 SSE 驱动 AI 生成过程中的增量组件回传

## 先看什么

- 项目整体结构：[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- 文档索引：[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)
- 架构总览：`docs/architecture/index.md`
- 模块边界：`docs/architecture/monorepo-map.md`
- 编辑器运行时与数据流：`docs/architecture/editor-runtime.md`
- 默认任务流程：`docs/workflows/task-flow.md`
- 约束与不变量：`docs/rules/invariants.md`
- 验证方式：`docs/validation/checks.md`
- 质量债务记录：`docs/quality/debt-log.md`
- 非 trivial 任务计划：`plans/active/`

## 默认工作顺序

1. 先确认任务落在前端编辑器、AI 对话、后端接口还是文档层。
2. 改动 `src/editor/`、`src/api/`、`backend/src/` 之前，先读 `docs/architecture/index.md` 和 `docs/architecture/editor-runtime.md`。
3. 如果任务会跨前后端数据契约，先读 `docs/rules/invariants.md`。
4. 非 trivial 任务先在 `plans/active/` 写计划。
5. 优先做最小正确改动，不要先大规模重构。
6. 完成后按 `docs/validation/checks.md` 跑最小验证集。
7. 如果发现反复出现的问题，把它沉淀到 docs、脚本或检查项，而不是只留在聊天里。

## 这个仓库里的事实来源

- 前端架构事实：`src/` 和 `docs/architecture/`
- AI 交互与流式生成事实：`src/editor/components/AIDialog/`、`src/api/`、`backend/src/`
- 规则事实：`docs/rules/`
- 验证事实：`docs/validation/`
- 当前任务上下文：`plans/active/`

## 针对 lowCode 的操作规则

- 不要把 `backend/` 当作前端目录的一部分；它是单独启动的 Node 服务。
- 不要跳过 `ComponentNode` 数据结构检查；前后端共享的核心契约就是节点数组。
- 不要在没有确认注册配置的情况下新增物料组件；`stores/component-config.tsx`、属性面板和渲染路径必须一致。
- 不要只改 UI 表层而忽略 Zustand store 的状态流。
- 改动 AI 生成链路时，同时检查同步接口和 SSE 接口。
- 如果变更影响用户操作路径，至少补一次手工 smoke test。

## 什么情况下必须写计划

- 同时改 `src/` 和 `backend/`
- 改 `ComponentNode`、AI 返回格式或画布数据结构
- 调整拖拽放置规则、组件注册机制或预览/编辑切换
- 需要额外迁移已有本地持久化数据
- 会引入后续清理项或已知风险

## Done 的标准

任务完成至少满足：

- 修改位置和需求匹配
- 关键验证已执行并记录
- 如果行为或边界改变，相关架构/规则文档同步更新
- 下一个 agent 不需要重新猜项目结构
