# lowCode Harness 首轮接入

## 背景

目标是把 Harness 结构接入现有 `lowCode` 仓库，并把通用模板改成适合当前项目的真实导航和架构说明。

## 本轮完成项

- 将 `software` Harness 模板复制到仓库
- 基于实际目录结构重写 `AGENTS.md`
- 补充架构总览、仓库边界和编辑器运行时文档
- 将验证文档替换为当前项目可执行的检查方式
- 将规则文档改成贴合 `lowCode` 的不变量

## 已确认事实

- 前端是 Vite + React + TypeScript 应用
- `src/editor/` 是编辑器核心运行时
- `backend/` 是独立 Express 服务
- AI 生成通过 SSE 回传组件补丁和快照
- 画布状态事实源是 `src/editor/stores/new-components.tsx`

## 风险与后续

- 当前没有自动化测试，核心改动仍依赖手工 smoke test
- 部分旧文档编码显示异常，但不影响新增 Harness 文档
- 未来建议补一个专门的“AI 生成协议”文档，减少前后端契约漂移
