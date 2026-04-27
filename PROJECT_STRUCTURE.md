# 📁 LowCode Editor - 完整项目结构

> 可视化低代码编辑器项目 - 完整文件结构说明
> 
> **项目类型**: React + TypeScript + Vite  
> **UI 框架**: Ant Design + Tailwind CSS  
> **状态管理**: Zustand  
> **拖拽功能**: React DnD  
> **最后更新**: 2025-10-26

---

## 📂 根目录结构

```
lowCode/
├── 📄 配置文件
├── 📚 文档文件
├── 📦 依赖文件
├── 🎨 public/          # 静态资源
└── 💻 src/             # 源代码目录
```

---

## 🔧 配置文件

```
lowCode/
├── .gitignore                    # Git 忽略配置
├── eslint.config.js              # ESLint 代码规范配置
├── index.html                    # HTML 入口文件
├── package.json                  # NPM 项目配置和依赖
├── pnpm-lock.yaml               # PNPM 锁定文件
├── postcss.config.js            # PostCSS 配置
├── tailwind.config.js           # Tailwind CSS 配置
├── tsconfig.json                # TypeScript 根配置
├── tsconfig.app.json            # TypeScript 应用配置
├── tsconfig.node.json           # TypeScript Node 配置
└── vite.config.ts               # Vite 构建工具配置
```

### 主要配置说明：

| 文件 | 作用 |
|------|------|
| `package.json` | 定义项目依赖（React, Ant Design, Zustand 等）|
| `vite.config.ts` | Vite 开发服务器和构建配置 |
| `tailwind.config.js` | Tailwind CSS 样式框架配置 |
| `tsconfig.json` | TypeScript 编译器配置 |

---

## 📚 文档文件

```
lowCode/
├── README.md                     # 项目说明文档
├── lowCode.md                    # 低代码系统详细文档
├── BUGFIX_SUMMARY.md             # Bug 修复总结
├── DRAG_FEATURES.md              # 拖拽功能文档
├── IMPLEMENTATION_SUMMARY.md     # 实现总结
├── PERFORMANCE_OPTIMIZATION.md   # 性能优化文档
├── USAGE_GUIDE.md                # 使用指南
└── docs/                         # 详细文档目录
    ├── AI_ANNOTATION_GUIDE.md        # AI 标注组件指南 ⭐ NEW
    ├── component-style-guide.md      # 组件样式指南
    ├── interview-qa.md               # 面试问答
    └── preview-mode-guide.md         # 预览模式指南
```

---

## 💻 源代码结构详解

### 📂 src/ 总览

```
src/
├── main.tsx                 # 应用入口文件
├── App.tsx                  # 根组件
├── index.css                # 全局样式
├── vite-env.d.ts           # Vite 类型定义
├── assets/                  # 静态资源
├── components/              # 全局通用组件
├── demo/                    # 演示组件
└── editor/                  # 编辑器核心代码 ⭐
```

---

## 🎯 核心目录：src/editor/

这是整个低代码编辑器的核心代码目录。

### 📊 editor/ 目录结构

```
src/editor/
├── 📁 components/           # 编辑器专用组件
├── 📁 EditoArea/           # 编辑区域（画布）
├── 📁 hooks/               # 自定义 Hooks
├── 📁 Materail/            # 组件物料面板
├── 📁 materials/           # 可拖拽的组件库 ⭐
├── 📁 Setting/             # 属性设置面板
├── 📁 stores/              # 状态管理（Zustand）
├── 📁 utils/               # 工具函数
├── 📁 CanvasRenderer/      # Canvas 渲染器
├── 📁 HybridEditorArea/    # 混合编辑区域
├── 📁 SvgEditorArea/       # SVG 编辑区域
├── 📁 SvgEditorLayer/      # SVG 编辑层
├── HybridLowcodeEditor.tsx # 混合编辑器组件
└── SvgLowcodeEditor.tsx    # SVG 编辑器组件
```

---

## 🧩 详细目录说明

### 1️⃣ src/editor/components/ - 编辑器专用组件

```
components/
├── DragPreviewStyles.css      # 拖拽预览样式
├── DropPreview.tsx            # 拖拽预览组件
├── GlobalDragPreview.tsx      # 全局拖拽预览
└── OptimizedColorPicker.tsx   # 优化的颜色选择器（带节流）
```

**功能说明**：
- `DropPreview.tsx`: 显示拖拽时的插入线预览
- `OptimizedColorPicker.tsx`: 颜色选择器，支持节流优化，避免过度渲染
- `GlobalDragPreview.tsx`: 全局拖拽预览效果

---

### 2️⃣ src/editor/EditoArea/ - 编辑区域

```
EditoArea/
└── index.tsx                  # 主编辑画布组件
```

**核心功能**：
- 递归渲染组件树
- 处理鼠标悬停和点击事件
- 显示选中蒙层和悬停效果
- 支持编辑模式和预览模式切换

**关键代码**：
```typescript
- renderComponent()      // 递归渲染组件
- handleMouseOver()      // 处理悬停
- handleClick()          // 处理点击选中
```

---

### 3️⃣ src/editor/hooks/ - 自定义 Hooks

```
hooks/
├── useEnhancedMaterialDrops.ts  # 增强的拖拽放置 Hook ⭐
├── useMaterialDrops.ts           # 基础拖拽放置 Hook
├── useStyleChangeDetection.ts    # 样式变化检测 Hook ⭐ NEW
├── useSvgMaterialDrops.ts        # SVG 拖拽 Hook
└── useThrottle.ts                # 节流 Hook
```

**功能说明**：

| Hook | 功能 |
|------|------|
| `useEnhancedMaterialDrops` | 拖拽放置逻辑，计算插入位置，显示预览 |
| `useStyleChangeDetection` | 检测样式是否真正变化，避免无意义渲染 |
| `useThrottle` | 节流函数，限制高频操作 |

---

### 4️⃣ src/editor/Materail/ - 组件物料面板

```
Materail/
└── index.tsx                  # 左侧组件库面板
```

**功能说明**：
- 展示所有可拖拽的组件
- 支持分类折叠显示（基础组件、AI 标注）
- 使用 `react-dnd` 实现拖拽

**组件分类**：
```typescript
📁 基础组件 (8)
   - Container, Button, Header, Input, Image, Text, Div, Page

📁 AI 标注 (3) ⭐ NEW
   - ImageUpload, PreAnnotation, AnnotationCanvas
```

---

### 5️⃣ src/editor/materials/ - 可拖拽组件库 ⭐⭐⭐

这是最重要的目录，包含所有可拖拽的组件实现。

```
materials/
├── 📁 基础组件
│   ├── page/                  # 页面容器
│   │   └── index.tsx
│   ├── container/             # 通用容器
│   │   └── index.tsx
│   ├── div/                   # Div 容器（支持 Flex 布局）
│   │   └── index.tsx
│   ├── button/                # 按钮组件
│   │   └── index.tsx
│   ├── header/                # 标题组件
│   │   └── index.tsx
│   ├── input/                 # 输入框组件
│   │   └── index.tsx
│   ├── image/                 # 图片组件
│   │   └── index.tsx
│   └── text/                  # 文本组件
│       └── index.tsx
│
├── 📁 AI 标注组件 ⭐ NEW
│   ├── image-upload/          # 图像上传
│   │   └── index.tsx
│   ├── pre-annotation/        # AI 预标注
│   │   └── index.tsx
│   └── annotation-canvas/     # 标注画布
│       └── index.tsx
│
└── 📁 SVG 组件
    └── svg-container/         # SVG 容器
        └── index.tsx
```

#### 基础组件详解：

| 组件 | 功能 | 特性 |
|------|------|------|
| `page` | 页面根容器 | 最外层容器，支持嵌套 |
| `container` | 通用容器 | 可嵌套，支持样式定制 |
| `div` | Flex 容器 | 支持 Flex 布局，方向、对齐 |
| `button` | 按钮 | 支持多种类型、大小、形状 |
| `header` | 标题 | 支持 h1-h6，文字对齐 |
| `input` | 输入框 | 支持占位符、清空 |
| `image` | 图片 | 支持 URL、适配方式 |
| `text` | 文本 | 支持字体、颜色、对齐 |

#### AI 标注组件详解：⭐ NEW

| 组件 | 功能 | 核心特性 |
|------|------|----------|
| `image-upload` | 图像上传 | 拖拽上传、预览、验证 |
| `pre-annotation` | AI 预标注 | 模拟 AI 检测、进度、结果展示 |
| `annotation-canvas` | 标注画布 | Canvas 绘制、多工具、缩放 |

---

### 6️⃣ src/editor/Setting/ - 属性设置面板

```
Setting/
├── index.tsx               # 设置面板主组件
├── ComponentProps.tsx      # 组件属性设置 ⭐
├── ComponentStyle.tsx      # 组件样式设置 ⭐
└── ComponentEvent.tsx      # 组件事件设置
```

**功能说明**：

#### ComponentProps.tsx - 属性设置
- 动态表单，根据组件类型显示不同属性
- 支持文本、颜色、选择器、数字输入
- 实时更新组件属性

#### ComponentStyle.tsx - 样式设置
- 宽度/高度设置（支持 px、%、vw、vh 等单位）
- 背景色、边框、圆角
- 内外边距、文字对齐
- Flex 布局属性
- 使用节流优化，避免频繁渲染 ⭐

---

### 7️⃣ src/editor/stores/ - 状态管理

```
stores/
├── components.tsx          # 组件树状态管理 ⭐⭐⭐
├── component-config.tsx    # 组件配置注册中心 ⭐⭐
├── dragStore.ts           # 拖拽状态管理
├── interface.ts           # TypeScript 接口定义
└── new-components.tsx     # 新组件状态（备用）
```

#### components.tsx - 核心状态管理

**数据结构**：
```typescript
interface Component {
  id: number;              // 组件唯一 ID
  name: string;            // 组件类型名称
  props: any;              // 组件属性（包括 style）
  desc: string;            // 组件描述
  children?: Component[];  // 子组件数组（树形结构）
  parentId?: number;       // 父组件 ID
  position?: {x, y};       // 拖拽位置信息
}
```

**核心方法**：
```typescript
- addComponent()              // 添加组件到树中
- deleteComponent()           // 删除组件
- updateComponent()           // 更新组件属性
- updateComponentThrottled()  // 节流更新（100ms）⭐
- setCurComponentId()         // 设置当前选中组件
- setMode()                   // 切换编辑/预览模式
```

**优化特性**：⭐ NEW
- 深度比较，只有真正变化时才更新
- 节流函数，限制更新频率
- 避免无意义的重渲染

#### component-config.tsx - 组件注册中心

**功能**：
- 注册所有可用组件
- 定义组件默认属性
- 组件分类（基础组件、AI 标注）
- 动态注册新组件

**配置结构**：
```typescript
interface ComponentConfig {
  name: string;              // 组件名称
  defaultProps: object;      // 默认属性
  component: ReactComponent; // React 组件
  desc: string;              // 描述
  category?: string;         // 分类 ⭐ NEW
  setters?: Array;           // 属性设置器
}
```

---

### 8️⃣ src/editor/utils/ - 工具函数

```
utils/
├── dragUtils.ts           # 拖拽工具函数
└── data-migration.ts      # 数据迁移工具
```

**dragUtils.ts 核心函数**：
```typescript
- calculatePreciseInsertPosition()  // 计算精确插入位置
- getInsertLinePosition()           // 获取插入线位置
- canDropAtPosition()               // 检查是否可放置
- getDragHoverStyles()              // 拖拽悬停样式
- throttle()                        // 节流函数
- debounce()                        // 防抖函数
```

---

## 🌐 全局组件：src/components/

```
components/
├── ErrorBoundary/         # 错误边界组件
│   └── index.tsx
├── Header/                # 顶部导航栏
│   └── index.tsx
├── Hover/                 # 悬停蒙层效果
│   └── index.tsx
├── Mateialltem/          # 物料项组件
│   └── index.tsx
├── SelectedMask/         # 选中蒙层效果
│   └── index.tsx
├── SvgHover/             # SVG 悬停效果
│   └── index.tsx
└── SvgSelectedMask/      # SVG 选中蒙层
    └── index.tsx
```

**组件说明**：

| 组件 | 功能 |
|------|------|
| `ErrorBoundary` | 捕获组件渲染错误，防止整个应用崩溃 |
| `Header` | 顶部导航，显示编辑/预览切换按钮 |
| `Hover` | 鼠标悬停时显示组件边框和名称 |
| `SelectedMask` | 选中组件时显示蓝色边框和操作按钮 |
| `Mateialltem` | 可拖拽的物料项，使用 `useDrag` |

---

## 🎨 演示组件：src/demo/

```
demo/
└── ColorPickerDemo.tsx    # 颜色选择器性能演示
```

**功能**：演示优化前后的性能对比

---

## 📦 依赖说明

### 核心依赖（package.json）

```json
{
  "dependencies": {
    "react": "^18.3.1",           // React 框架
    "react-dom": "^18.3.1",       // React DOM 渲染
    "react-dnd": "^16.0.1",       // 拖拽功能
    "react-dnd-html5-backend": "^16.0.1",
    "antd": "^5.23.3",            // Ant Design UI 框架
    "zustand": "^5.0.3",          // 轻量级状态管理
    "allotment": "^1.21.0"        // 可调整大小的面板布局
  },
  "devDependencies": {
    "typescript": "^5.6.3",       // TypeScript
    "vite": "^7.1.3",             // 构建工具
    "tailwindcss": "^3.4.19",     // CSS 框架
    "@vitejs/plugin-react": "^4.3.4"
  }
}
```

---

## 🔄 数据流程图

```
┌─────────────────────────────────────────────────────┐
│                   用户操作                           │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  Material Panel (左侧)                               │
│  - 拖拽组件                                          │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  EditoArea (中间画布)                                │
│  - useEnhancedMaterialDrops()                       │
│  - 计算插入位置                                      │
│  - 调用 addComponent()                              │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  Zustand Store (状态管理)                            │
│  - components[] 组件树                               │
│  - 深度比较 + 节流优化 ⭐                            │
│  - 触发重渲染                                        │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  递归渲染组件树                                      │
│  - renderComponent()                                │
│  - React.createElement()                            │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  DOM 输出 (HTML 结构)                                │
│  - 文档流布局 / Flex 布局                            │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 启动和构建命令

```bash
# 安装依赖
npm install
# 或
pnpm install

# 开发模式启动
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint
```

---

## 📊 项目统计

| 指标 | 数量 |
|------|------|
| **总文件数** | 118 个文件 |
| **核心组件** | 11 个（8 基础 + 3 AI 标注）|
| **自定义 Hooks** | 5 个 |
| **Zustand Stores** | 3 个 |
| **工具函数** | 2 个模块 |
| **文档文件** | 8 个 |
| **代码行数** | ~15,000+ 行 |

---

## 🎯 核心技术栈

### 前端框架
- ⚛️ **React 18** - 用户界面
- 📘 **TypeScript** - 类型安全
- ⚡ **Vite** - 快速构建

### UI 框架
- 🎨 **Ant Design 5** - UI 组件库
- 🌊 **Tailwind CSS** - 原子化 CSS

### 状态管理
- 🐻 **Zustand** - 轻量级状态管理

### 拖拽功能
- 🎪 **React DnD** - 拖拽交互

### 布局管理
- 📐 **Allotment** - 可调整面板

---

## 🌟 核心特性

### ✅ 已实现功能

1. **可视化编辑器**
   - 拖拽添加组件
   - 实时预览
   - 组件树结构

2. **组件系统**
   - 8 个基础组件
   - 3 个 AI 标注组件 ⭐ NEW
   - 支持嵌套和组合

3. **属性编辑**
   - 样式属性实时编辑
   - 组件属性配置
   - 多种输入控件

4. **性能优化** ⭐ NEW
   - 节流函数（100ms）
   - 样式变化检测
   - 深度比较优化
   - 避免无意义渲染

5. **交互体验**
   - 悬停高亮
   - 选中蒙层
   - 拖拽预览
   - 编辑/预览模式切换

---

## 📈 性能优化总结

### 渲染优化
- ✅ 使用 `useCallback` 缓存函数
- ✅ 使用 `useMemo` 缓存计算结果
- ✅ 使用 `useShallow` 避免不必要的订阅更新
- ✅ 深度比较，只在真正变化时更新
- ✅ 节流限制高频操作（100ms）

### 状态管理优化
- ✅ Zustand 精确订阅
- ✅ 分离读写操作
- ✅ 避免全局状态污染

### 拖拽优化
- ✅ 精确计算插入位置
- ✅ 防抖/节流拖拽事件
- ✅ 优化拖拽预览渲染

---

## 🔮 未来扩展方向

### 功能扩展
- [ ] 撤销/重做功能
- [ ] 组件复制/粘贴
- [ ] 快捷键支持
- [ ] 多页面管理
- [ ] 组件库扩展

### AI 标注扩展
- [ ] 接入真实 AI 模型
- [ ] 支持更多标注类型（多边形、关键点）
- [ ] 标注数据导出（COCO、YOLO 格式）
- [ ] 协作标注功能

### 性能优化
- [ ] 虚拟滚动（大量组件）
- [ ] Web Worker 处理
- [ ] 懒加载组件

### 工程化
- [ ] 单元测试覆盖
- [ ] E2E 测试
- [ ] CI/CD 流程
- [ ] Docker 部署

---

## 📞 项目信息

**项目名称**: LowCode Editor  
**版本**: 1.0.0  
**创建时间**: 2024  
**最后更新**: 2025-10-26  
**开发框架**: React 18 + TypeScript + Vite  

---

## 📝 备注

### 重要文件说明

| 文件 | 重要性 | 说明 |
|------|--------|------|
| `src/editor/stores/components.tsx` | ⭐⭐⭐⭐⭐ | 核心状态管理，包含所有组件数据 |
| `src/editor/EditoArea/index.tsx` | ⭐⭐⭐⭐⭐ | 主画布，递归渲染逻辑 |
| `src/editor/stores/component-config.tsx` | ⭐⭐⭐⭐ | 组件注册中心 |
| `src/editor/hooks/useEnhancedMaterialDrops.ts` | ⭐⭐⭐⭐ | 拖拽核心逻辑 |
| `src/editor/Setting/ComponentStyle.tsx` | ⭐⭐⭐⭐ | 样式编辑面板 |
| `src/editor/materials/*` | ⭐⭐⭐⭐ | 所有可用组件实现 |

### 命名约定

- **组件文件**: PascalCase (例: `ComponentStyle.tsx`)
- **工具文件**: camelCase (例: `dragUtils.ts`)
- **目录名**: kebab-case 或 PascalCase
- **Hook 文件**: `use` 前缀 (例: `useThrottle.ts`)

---

**🎉 项目结构文档完成！**

如需更详细的某个模块说明，请查看对应的文档文件或源代码注释。
