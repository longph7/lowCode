# 编辑器运行时与数据流

这份文档用于帮助快速建立“代码是怎么跑起来的”这一层认知。

## 顶层运行时结构

```text
App
├─ HybridLowcodeEditor
│  ├─ Header
│  ├─ Material
│  ├─ EditorArea
│  └─ Setting
├─ GlobalDragPreview
└─ AIDialog
```

对应职责：

- `HybridLowcodeEditor`
  - 编辑器主布局，控制 edit/preview 模式下左右面板是否显示
- `EditorArea`
  - 画布渲染、缩放、选中、拖拽移动、清空画布
- `Material`
  - 左侧物料列表，作为拖拽源
- `Setting`
  - 当前节点属性/样式编辑
- `GlobalDragPreview`
  - 拖拽时的全局视觉反馈
- `AIDialog`
  - 通过 SSE 驱动 AI 生成组件，并最终替换画布

## 核心状态

### 1. 画布状态：`useComponentsStore`

文件：`src/editor/stores/new-components.tsx`

它管理：

- `nodes`
  - 当前画布上的全部节点
- `curNodeId` / `curNode`
  - 当前选中的节点
- `mode`
  - `edit` 或 `preview`

它提供：

- `addNode`
- `replaceNodes`
- `deleteNode`
- `clearCanvas`
- `updateNode`
- `updateNodeThrottled`
- `setCurNodeId`
- `setMode`
- `updateCanvas`

这个 store 是编辑器事实源。只要你改的是画布内容，最终都应该落回这里。

### 2. 组件注册：`useComponentConfigStore`

文件：`src/editor/stores/component-config.tsx`

它定义：

- 有哪些物料组件
- 每个组件的 `defaultProps`
- 组件描述和分类
- 组件 React 实现

新增一个组件时，通常不是只写 `materials/<name>/index.tsx` 就结束，还要同步更新注册中心和编辑面板可配置项。

### 3. AI 对话状态：`useAIStore`

文件：`src/editor/stores/ai-store.ts`

它管理：

- 对话消息
- 流式输出内容
- tool call 状态
- `pendingComponents`
- 已确认的生成历史
- 对话框打开、位置、尺寸、最小化状态

其中最关键的是：

- AI 流式返回的节点先进入 `pendingComponents`
- SSE 完成后，经校验再提交到 `useComponentsStore.replaceNodes`

这让 AI 生成过程和正式画布状态解耦。

## 拖拽链路

### 用户动作

1. 用户从 `Material` 面板拖出组件
2. `EditorArea` 中的可落点通过 `useEnhancedMaterialDrops` 监听悬停和落下
3. `dragUtils.ts` 负责计算插入位置与预览线
4. `useComponentsStore.addNode` 把新节点写入画布状态
5. `EditorArea` 基于最新 `nodes` 重新渲染

### 关键文件

- `src/editor/hooks/useEnhancedMaterialDrops.ts`
- `src/editor/utils/dragUtils.ts`
- `src/editor/stores/new-components.tsx`
- `src/editor/EditoArea/index.tsx`

## 画布渲染链路

1. `EditorArea` 从 store 读取 `nodes`
2. 按 `parentId` 把节点组织成树形/层级关系
3. 按 `zIndex` 排序同层节点
4. 根据 `componentConfig` 选择具体 React 组件
5. 在 edit 模式叠加 Hover / SelectedMask 等交互层

这里的关键不是传统路由，而是“节点数组 -> 画布组件树”的转换。

## AI 生成链路

### 前端侧

1. 用户在 `AIDialog` 输入 prompt
2. `streamGeneratePoster()` 通过 `EventSource` 连接后端 SSE
3. 流式事件进入 `useAIStore`
4. `component_patch` / `component_snapshot` 更新 `pendingComponents`
5. `done` 到达后执行校验并 `replaceNodes`

### 后端侧

1. `backend/src/server.js` 暴露 `/api/ai/generate-poster/stream`
2. 调用 `generatePosterNodes()`
3. `backend/src/llm.js` 根据环境变量选择：
   - 有 API key：请求外部模型
   - 无 API key：回退到 mock 节点
4. `backend/src/poster-schema.js` 归一化节点结构
5. 服务端以 SSE 事件流形式逐步推回前端

## 核心数据契约

前后端共享的最关键契约是 `ComponentNode`：

```ts
{
  id: string
  type: string
  props: Record<string, any>
  position: { x, y, width, height, zIndex? }
  parentId?: string
}
```

重要约束：

- 必须存在 `root_page`
- `Page` 节点作为画布根
- AI 返回的节点最终都要被归一化成这套结构

## 最值得优先读的代码

如果你只有 20 分钟，优先读这些文件：

1. `src/editor/stores/new-components.tsx`
2. `src/editor/EditoArea/index.tsx`
3. `src/editor/hooks/useEnhancedMaterialDrops.ts`
4. `src/editor/stores/component-config.tsx`
5. `src/editor/components/AIDialog/index.tsx`
6. `src/editor/stores/ai-store.ts`
7. `src/api/poster.ts`
8. `backend/src/server.js`
9. `backend/src/llm.js`
