# 验证检查

这份文档定义 `lowCode` 仓库里“最小但有意义”的验证方式。

## 最小验证策略

当前仓库没有成体系的自动化测试，因此每次任务至少要从下面几类里选出能证明改动正确的最小组合：

- 静态检查
- 构建检查
- 后端健康检查
- 手工交互 smoke test

## 常用命令

在仓库根目录执行：

```powershell
npm run lint
npm run build
```

在仓库根目录启动前后端联调：

```powershell
npm run dev
```

只启动后端：

```powershell
npm --prefix backend run start
```

后端健康检查：

```powershell
Invoke-WebRequest "http://localhost:3000/api/health"
Invoke-WebRequest "http://localhost:3000/api/ai/health"
```

## 按改动类型选择验证

### 改前端 UI 或编辑器交互

至少执行：

- `npm run lint`
- `npm run build`
- 手工验证编辑器可打开
- 手工验证画布基础交互没有断

优先手工检查：

- 拖拽物料到画布
- 选中节点后属性面板是否更新
- 编辑/预览模式切换
- 缩放与拖动画布是否正常

### 改拖拽放置或画布节点逻辑

至少执行：

- `npm run lint`
- `npm run build`
- 手工验证新增节点是否正确进入 `nodes`
- 手工验证拖拽预览和落点是否符合预期
- 手工验证 `root_page` 未被破坏

### 改 AI 对话或流式生成

至少执行：

- `npm run lint`
- `npm run build`
- 启动后端并检查 `/api/ai/health`
- 手工发起一次 AI 生成
- 确认流式内容、tool call、组件提交链路正常

重点观察：

- `pendingComponents` 是否正常生成和清理
- `done` 事件后是否正确替换正式画布
- 无 API key 时 mock 回退是否仍可工作

### 改后端接口或节点归一化

至少执行：

- `npm --prefix backend run start`
- `/api/health`
- `/api/ai/health`
- 一次真实或 mock 的 `generate-poster` 请求链路验证

## 当前已知验证缺口

- 没有自动化单元测试
- 没有 E2E 测试
- 前后端契约主要靠运行时校验和手工联调

做涉及核心数据结构的改动时，要在结果里显式说明“哪些没有被自动化覆盖”。
