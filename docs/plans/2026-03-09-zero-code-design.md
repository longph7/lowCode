# 低代码到0代码平台转型设计文档

**项目名称**：AI 零代码应用生成平台
**设计日期**：2026-03-09
**设计版本**：1.0

---

## 目录

1. [项目概述](#项目概述)
2. [整体架构设计](#整体架构设计)
3. [UI布局和组件设计](#ui布局和组件设计)
4. [状态管理和数据流设计](#状态管理和数据流设计)
5. [后端设计和API接口](#后端设计和api接口)
6. [错误处理和测试设计](#错误处理和测试设计)
7. [实施计划和步骤](#实施计划和步骤)
8. [目录结构和文件清单](#目录结构和文件清单)

---

## 项目概述

### 目标
将现有低代码编辑器转型为AI驱动的零代码应用生成平台，用户可通过与AI对话生成网页，实时预览生成结果并进行可视化修改。

### 核心需求
- AI生成 + 手动拖拽组合
- 悬浮对话框形式
- 实时预览 + 直接添加到画布
- AI功能：生成页面/组件结构、样式修改建议、布局优化建议
- 暂不需要用户系统
- 需要完整后端服务
- 需要代码导出和下载
- 实施策略：先改造UI和布局

---

## 整体架构设计

### 技术栈扩展

**前端保持现有技术栈**：
- React 19 + TypeScript
- Ant Design 5 + Tailwind CSS
- Zustand（状态管理）
- React DnD（拖拽）
- Allotment（面板布局）

**新增前端依赖**：
- EventSource（SSE流式响应）
- react-hotkeys-hook（快捷键支持）
- react-resizable（可调整大小）
- react-draggable（可拖拽）

**后端技术栈**：
- Node.js + NestJS + TypeScript
- OpenAI API / Anthropic API
- SSE（Server-Sent Events）
- Handlebars（模板引擎）
- Archiver（文件打包）

### 系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         前端应用（React）                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  物料面板    │  │  编辑画布    │  │  属性面板    │            │
│  │ (现有)      │  │  (现有)      │  │  (现有)      │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                   │
│  ┌─────────────────────────────────────────────────────┐       │
│  │           AI 悬浮对话框 (新增)                         │       │
│  │  - 对话历史  - 输入框  - 流式响应显示  - 工具调用展示  │       │
│  └─────────────────────────────────────────────────────┘       │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────┐       │
│  │           AI 状态管理 (新增)                          │       │
│  │  - 对话历史  - 生成状态  - 组件注入逻辑              │       │
│  └─────────────────────────────────────────────────────┘       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ SSE / REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      后端服务（Node.js）                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  AI 接口    │  │  代码生成    │  │  导出服务    │            │
│  │  - OpenAI   │  │  - 模板引擎  │  │  - 文件打包  │            │
│  │  - SSE流    │  │  - AST解析   │  │  - 下载接口  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                         ┌────────┐
                         │ AI API │
                         └────────┘
```

---

## UI布局和组件设计

### 悬浮AI对话框组件

**组件路径**：`src/editor/components/AIDialog/`

**位置设计**：
- 默认位置：右下角固定悬浮
- 可拖拽位置
- 可最小化/展开
- 可调整大小

**UI结构**：
```tsx
<AIDialog>
  <AIDialogHeader>
    <Title>AI 助手</Title>
    <Actions>
      <MinimizeButton />
      <MaximizeButton />
      <CloseButton />
    </Actions>
  </AIDialogHeader>

  <AIDialogContent>
    <ChatHistory>
      {messages.map(msg => (
        <MessageBubble type={msg.role}>
          {msg.content}
          {msg.toolCalls && <ToolCallsDisplay />}
        </MessageBubble>
      ))}
    </ChatHistory>

    <StreamingIndicator />
  </AIDialogContent>

  <AIDialogFooter>
    <InputArea>
      <TextInput
        placeholder="描述你想要的页面，如：生成一个登录页面..."
        disabled={isStreaming}
      />
      <SendButton disabled={isStreaming} />
    </InputArea>
    <QuickActions>
      <Button>生成登录页</Button>
      <Button>生成卡片组件</Button>
      <Button>优化布局</Button>
    </QuickActions>
  </AIDialogFooter>
</AIDialog>
```

### 主布局调整

**文件**：`src/editor/HybridLowcodeEditor.tsx`

```tsx
export default function HybridLowcodeEditor() {
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  // 快捷键支持 (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setAiDialogOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-full flex flex-col px-5 relative">
      <Header />

      <Allotment>
        <Allotment.Pane><Material /></Allotment.Pane>
        <Allotment.Pane><HybridEditorArea /></Allotment.Pane>
        <Allotment.Pane><Setting /></Allotment.Pane>
      </Allotment>

      <AIDialog
        open={aiDialogOpen}
        onClose={() => setAiDialogOpen(false)}
        defaultPosition={{ x: 20, y: 20 }}
      />
    </div>
  );
}
```

### AI对话框状态管理

**文件**：`src/editor/stores/ai-store.ts`

```typescript
interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  toolCalls?: ToolCall[];
  componentGenerated?: Component;
}

interface ToolCall {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
}

interface AIStore {
  messages: AIMessage[];
  isStreaming: boolean;
  streamingContent: string;
  currentToolCalls: ToolCall[];
  generatedComponents: Component[];
  pendingComponent: Component | null;
  dialogOpen: boolean;
  dialogPosition: { x: number; y: number };
  dialogSize: { width: number; height: number };

  // Actions
  addUserMessage: (content: string) => void;
  startAssistantResponse: () => void;
  appendContent: (content: string) => void;
  endAssistantResponse: () => void;
  addToolCall: (toolCall: ToolCall) => void;
  updateToolCall: (id: string, updates: Partial<ToolCall>) => void;
  setGeneratedComponents: (components: Component[]) => void;
  injectComponents: (components: Component[], parentId?: number) => void;
  toggleDialog: () => void;
  setDialogPosition: (position: { x: number; y: number }) => void;
  clearMessages: () => void;
}
```

### 响应式布局设计

```css
/* AI对话框移动端全屏 */
@media (max-width: 768px) {
  .ai-dialog {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    border-radius: 0;
  }
}

/* AI对话框平板端调整 */
@media (max-width: 1024px) {
  .ai-dialog {
    width: 80%;
    height: 60%;
  }
}
```

---

## 状态管理和数据流设计

### AI Store（新增）

**文件**：`src/editor/stores/ai-store.ts`

### 扩展现有 Components Store

**文件**：`src/editor/stores/components.tsx`

**新增Actions**：
```typescript
interface Actions {
  // ... 现有actions

  // AI注入相关
  injectComponents: (
    components: Component[],
    options?: {
      parentId?: number;
      insertBeforeId?: number;
      replaceComponentId?: number;
      mergeStrategy?: 'replace' | 'append' | 'prepend';
    }
  ) => void;

  // AI生成历史
  addGenerationHistory: (entry: {
    prompt: string;
    components: Component[];
    timestamp: number;
  }) => void;

  // 批量操作
  batchUpdateComponents: (updates: Array<{
    componentId: number;
    props: any;
  }>) => void;
}
```

### 数据流设计

#### AI生成流程

```
用户输入
   │
   ▼
AIDialog 输入框
   │
   ▼
aiStore.addUserMessage()
   │
   ▼
调用后端SSE接口
   │
   ▼
SSE流式响应
   │
   ├─► aiStore.appendContent()  (显示打字机效果)
   │
   ├─► aiStore.addToolCall()  (显示工具调用)
   │
   └─► aiStore.setGeneratedComponents()  (接收组件数据)
          │
          ▼
    aiStore.injectComponents()
          │
          ▼
    componentsStore.injectComponents()
          │
          ▼
    画布实时更新
```

#### 组件注入策略

**策略1：追加到父组件**（默认）
**策略2：替换选中组件**
**策略3：插入到指定位置**

---

## 后端设计和API接口

### 后端项目结构

```
backend/
├── src/
│   ├── ai/                          # AI模块
│   ├── code-generator/              # 代码生成模块
│   ├── export/                      # 导出模块
│   └── common/                      # 公共模块
```

### API接口设计

#### 1. AI对话接口（SSE流式）

**端点**：`POST /api/ai/chat`

**请求体**：
```typescript
interface ChatRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  context?: {
    currentComponent?: Component;
    componentsTree?: Component[];
  };
  stream: boolean;
}
```

**SSE响应格式**：
```typescript
interface SSEEvent {
  type: 'content' | 'tool_call' | 'tool_result' | 'component' | 'done';
  data: any;
}
```

#### 2. 代码生成接口

**端点**：`POST /api/code/generate`

#### 3. 导出下载接口

**端点**：`POST /api/export/download`

### AI服务设计

**OpenAI Provider** 主要功能：
- 构建系统提示词
- 定义可用工具
- 处理流式响应
- 错误处理

---

## 错误处理和测试设计

### 前端错误处理

- AI错误边界组件
- SSE连接错误处理
- 自动重试机制

### 后端错误处理

- 全局异常过滤器
- AI API错误处理
- 超时处理

### 测试策略

- 前端单元测试
- 前端组件测试
- 后端单元测试
- 端到端测试

---

## 实施计划和步骤

### 阶段一：UI改造和布局调整（1-2周）

1. 创建AI对话框组件
2. 集成到主布局
3. 实现对话界面
4. 测试UI功能

### 阶段二：前端状态管理扩展（1周）

1. 创建AI Store
2. 扩展Components Store
3. 创建工具函数
4. 测试状态管理

### 阶段三：后端服务搭建（2-3周）

1. 初始化后端项目
2. 实现AI模块
3. 实现SSE流式响应
4. 实现代码生成模块
5. 实现导出模块
6. 后端测试

### 阶段四：前后端集成（1-2周）

1. 实现SSE前端客户端
2. 集成AI对话框
3. 实现实时预览
4. 实现导出功能
5. 集成测试

### 阶段五：优化和完善（1周）

1. 性能优化
2. 用户体验优化
3. 代码质量
4. 部署准备

### 时间线总结

| 阶段 | 任务 | 预估时间 |
|------|------|----------|
| 阶段一 | UI改造和布局调整 | 1-2周 |
| 阶段二 | 前端状态管理扩展 | 1周 |
| 阶段三 | 后端服务搭建 | 2-3周 |
| 阶段四 | 前后端集成 | 1-2周 |
| 阶段五 | 优化和完善 | 1周 |
| **总计** | | **6-9周** |

### 关键里程碑

1. 里程碑1：AI对话框UI完成并集成
2. 里程碑2：前端状态管理完成
3. 里程碑3：后端SSE接口可用
4. 里程碑4：完整AI对话流程可用
5. 里程碑5：项目可部署和导出

---

## 目录结构和文件清单

详细文件结构见第七部分。

### 环境变量配置

**前端 `.env.example`**：
```bash
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ENABLE_AI=true
VITE_ENABLE_EXPORT=true
VITE_MAX_RETRY_COUNT=3
VITE_SSE_TIMEOUT=30000
```

**后端 `.env.example`**：
```bash
NODE_ENV=development
PORT=3000
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4-turbo-preview
ANTHROPIC_API_KEY=your_anthropic_api_key_here
CORS_ORIGIN=http://localhost:5173
SSE_TIMEOUT=30000
MAX_RETRY_COUNT=3
```

---

## 总结

本设计文档描述了从低代码编辑器到AI驱动的零代码平台的完整转型方案。采用渐进式改造策略，保留现有代码价值，分阶段实施。

核心特点：
- 保持现有三栏布局，添加AI悬浮对话框
- 前后端分离，使用SSE实现流式响应
- 支持AI生成和手动拖拽组合工作流
- 支持代码导出和下载
- 完整的错误处理和测试覆盖

预计实施周期：6-9周
