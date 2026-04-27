# 低代码平台 README.md
### 基于 React+TypeScript+Vite+Tailwind CSS+React DnD 开发，融合 AI 数据标注与组件生成能力

## 一、项目简介（Project Introduction）
### 项目定位
一款基于 React+TypeScript+Vite+Tailwind CSS+React DnD 开发的低代码可视化平台，支持拖拽式搭建页面与 AI 数据标注工具，可快速生成前端组件、定制标注流程，输出标准化大模型训练数据，兼顾开发效率与 AI 业务落地能力。核心特色在于增强的拖拽功能，支持精准位置计算和视觉反馈。

### 核心亮点（Core Highlights）
- **技术栈优势**：React 18 组件化开发，TypeScript 强类型约束，Vite 极速构建，Tailwind 原子化样式高效开发
- **核心能力闭环**：拖拽式画布 + AI 辅助生成 + 自定义标注页面 + 大模型数据导出，覆盖前端开发与 AI 数据生产全流程
- **增强拖拽功能**：基于 React DnD v14+ 实现的精准拖拽，支持插入线预览、容器高亮、智能位置计算和跟随鼠标的真实组件预览
- **性能优化**：SVG+Canvas 混合渲染架构，支持大规模组件流畅渲染；精准状态更新与组件缓存，避免无效重渲染
- **兼容性适配**：支持现代主流浏览器，内置降级提示，适配不同环境使用需求

## 二、快速开始（Quick Start）
### 1. 环境准备
```markdown
- Node.js: v18.0.0+
- 包管理工具: npm@9.0.0+ / yarn@1.22.0+
- 浏览器: Chrome/Edge 最新2版、Safari 16.0+
```

### 2. 安装与启动
```bash
# 克隆仓库
git clone https://github.com/your-username/your-lowcode-platform.git
cd your-lowcode-platform

# 安装依赖（推荐 npm）
npm install

# 本地开发环境启动（默认端口 5173）
npm run dev

# 构建生产环境包
npm run build

# 预览生产环境构建结果
npm run preview

# 代码格式化与校验
npm run lint
npm run format
```

### 3. 首次使用指引
1.  启动后访问 `http://localhost:5173`，进入平台首页
2.  点击「新建项目」，输入项目名称后进入画布编辑器
3.  左侧组件库拖拽组件到画布，可通过属性面板配置样式、位置与交互
4.  点击顶部「AI 生成」，输入自然语言需求（如“生成红色登录按钮”），自动生成组件
5.  切换至「标注模式」，拖拽组件搭建自定义标注页面，标注完成后一键导出数据

## 三、核心功能（Core Features）
### 1. 可视化画布编辑器
- 拖拽交互：支持组件拖拽、磁吸对齐、层级调整（置顶/置底/锁定/隐藏）
- 增强拖拽功能：基于 React DnD v14+ 实现的精准拖拽，支持插入线预览、容器高亮、智能位置计算和跟随鼠标的真实组件预览
- 混合渲染：Canvas 负责大规模组件批量渲染，SVG 处理精准交互（选中、控制点、磁吸提示）
- 层级管理：内置图层面板，支持组件嵌套、批量选择与操作，适配复杂页面结构
- 响应式预览：支持 PC/移动端断点切换，实时预览不同设备下的页面效果

### 2. AI 辅助生成能力
- 组件/页面生成：自然语言输入需求，自动生成 React+Tailwind 代码与扁平 JSON 节点树
- 代码校验优化：内置 ESLint+Zod+Prettier 校验，确保生成代码符合项目规范，可直接集成
- AI 辅助标注：调用大模型自动预标注文本实体、分类标签，人工仅需审核修正，提升标注效率
- 多轮迭代：支持对生成结果微调需求，AI 自动优化输出内容，精准匹配业务场景

### 3. 自定义 AI 数据标注工具
- 零代码搭建：拖拽组件（文本展示、标签栏、高亮框、按钮）快速搭建标注页面，支持个性化配置
- 多标注类型支持：适配文本分类、命名实体识别（NER）、多轮对话标注等核心场景
- 组件联动配置：可视化绑定交互规则（选中文本→关联标签、必填校验、样式联动），无需编码
- 数据导出：一键导出 JSON（平台内部管理）、JSONL（大模型训练标准格式），无缝对接微调流程

### 4. 数据与版本管理
- 数据格式兼容：标注数据支持自定义字段扩展，导出格式适配 Hugging Face、LLaMA Factory 等框架
- 版本控制：记录组件编辑、标注数据的操作历史，支持版本回滚、差异对比，避免数据丢失
- 缓存优化：常用组件模板、标注配置自动缓存，提升二次开发与标注效率

### 5. 性能与兼容性
- 渲染优化：React.memo+useMemo 组件缓存，虚拟列表处理大规模数据，拖拽操作防抖节流
- 构建优化：Vite 分包策略、CDN 集成、Tailwind 按需生成样式，减小包体积，提升加载速度
- 兼容性处理：@vitejs/plugin-legacy 转译 ES6+ 语法，autoprefixer 自动添加 CSS 前缀，内置浏览器能力检测与降级提示

## 四、技术架构（Technical Architecture）
### 1. 技术栈明细
| 模块         | 核心技术/依赖                          | 核心作用                              |
|--------------|---------------------------------------|---------------------------------------|
| 核心框架     | React 18.x、TypeScript 5.x             | 组件化开发、强类型校验，避免类型错误  |
| 构建工具     | Vite 5.x                               | 极速冷启动、热更新、按需构建，提升开发效率 |
| 样式解决方案 | Tailwind CSS 3.x、autoprefixer         | 原子化样式开发，自动添加浏览器前缀，适配多端 |
| 拖拽库       | React DnD v14+                         | 支持拖拽交互、拖拽预览、位置计算等功能 |
| 状态管理     | Zustand、Immer                        | 轻量状态管理，精准更新节点数据，不可变数据处理 |
| 画布渲染     | Konva、react-konva、react-svg         | SVG+Canvas 混合渲染，处理交互与大规模渲染 |
| 数据校验     | Zod、ESLint、Prettier                 | 数据格式校验、代码规范检查、自动格式化 |
| AI 集成      | OpenAI API、通义千问 API               | 组件生成、AI 预标注、大模型数据生产    |
| 辅助工具     | react-window、uuid、core-js            | 虚拟列表、唯一 ID 生成、ES API 补全    |

### 2. 架构分层（从下到上）
1.  **数据层**：扁平化 JSON 树存储组件与标注数据，提供树/扁平结构互转工具，支持版本管理与缓存
2.  **核心层**：画布渲染引擎（混合渲染）、组件库、状态管理、跨窗口通信（主窗口+iframe）、事件总线
3.  **功能层**：AI 生成模块、标注工具模块、属性配置模块、数据导出模块、预览模块
4.  **应用层**：画布编辑器、标注页面、图层面板、属性面板、首页与项目管理页

## 五、目录结构（Directory Structure）

### 增强拖拽功能相关文件

以下文件包含了增强拖拽功能的核心实现：

- `src/editor/hooks/useEnhancedMaterialDrops.ts` - 增强拖拽 Hook，实现精准位置计算和视觉反馈
- `src/editor/hooks/useMaterialDrops.ts` - 原始拖拽 Hook（已修复错误）
- `src/editor/components/DropPreview.tsx` - 拖拽预览组件，显示插入线和高亮区域
- `src/editor/components/GlobalDragPreview.tsx` - 全局拖拽预览组件，跟随鼠标显示真实组件预览
- `src/editor/components/DragPreviewStyles.css` - 拖拽相关样式，包含插入线动画效果
- `src/editor/utils/dragUtils.ts` - 拖拽相关工具函数，包含位置计算算法
- `src/editor/stores/dragStore.ts` - 拖拽状态管理，使用 Zustand 实现全局状态管理

### 物料组件更新

以下物料组件已更新以支持拖拽功能：

- `src/editor/materials/page/index.tsx` - 页面组件
- `src/editor/materials/container/index.tsx` - 容器组件
- `src/editor/materials/div/index.tsx` - Div 组件
- `src/components/Mateialltem/index.tsx` - 材料项组件（拖拽源）
- `src/editor/Materail/index.tsx` - 材料面板

### 核心功能文件

- `src/editor/SvgEditorArea/index.tsx` - SVG 编辑区域，处理拖拽放置逻辑
- `src/editor/SvgEditorLayer/index.tsx` - SVG 编辑层，处理组件渲染和交互

```
your-lowcode-platform/
├── public/               # 静态资源（图标、默认图片）
├── src/
│   ├── api/              # 接口封装
│   │   ├── ai/           # AI 模型 API 封装（OpenAI、通义千问）
│   │   ├── export/       # 数据导出接口
│   │   └── index.ts      # 接口统一导出
│   ├── components/       # 公共组件
│   │   ├── canvas/       # 画布相关组件（渲染、拖拽、磁吸）
│   │   ├── label/        # 标注工具组件（文本展示、标签栏、高亮框）
│   │   ├── common/       # 通用基础组件（按钮、输入框、弹窗）
│   │   └── editor/       # 编辑器组件（属性面板、图层面板）
│   ├── config/           # 配置文件
│   │   ├── tailwind.ts   # Tailwind 自定义配置
│   │   ├── vite.ts       # Vite 额外配置
│   │   └── ai.ts         # AI 模型配置
│   ├── hooks/            # 自定义 Hooks
│   │   ├── useDrag.ts    # 拖拽逻辑 Hook
│   │   ├── useLabel.ts   # 标注逻辑 Hook
│   │   └── useAI.ts      # AI 生成逻辑 Hook
│   ├── store/            # 状态管理
│   │   ├── canvasStore.ts # 画布数据状态
│   │   └── labelStore.ts  # 标注数据状态
│   ├── types/            # TS 类型定义
│   │   ├── component.ts  # 组件节点类型
│   │   ├── label.ts      # 标注数据类型
│   │   └── index.ts      # 类型统一导出
│   ├── utils/            # 工具函数
│   │   ├── data.ts       # 数据格式转换（树/扁平、JSON/JSONL）
│   │   ├── validate.ts   # 数据校验函数
│   │   ├── aiPrompt.ts   # AI 生成 Prompt 模板
│   │   └── compat.ts     # 浏览器兼容性工具
│   ├── views/            # 页面组件
│   │   ├── Home/         # 首页
│   │   ├── CanvasEditor/ # 画布编辑器页面
│   │   └── LabelPage/    # 标注页面
│   ├── App.tsx           # 根组件
│   └── main.tsx          # 入口文件
├── .env.example          # 环境变量示例（AI 密钥配置）
├── .eslintrc.js          # ESLint 配置
├── .prettierrc           # Prettier 配置
├── tailwind.config.js    # Tailwind CSS 配置
├── postcss.config.js     # PostCSS 配置（autoprefixer）
├── tsconfig.json         # TypeScript 配置
├── vite.config.ts        # Vite 配置
├── package.json          # 依赖与脚本配置
└── README.md             # 项目说明文档
```

## 六、扩展指南（Extension Guide）
### 1. 新增自定义组件
1.  在 `src/components/common/` 下创建组件文件（如 `CustomTable.tsx`），用 TS 定义 Props 类型，集成 Tailwind 样式
2.  在 `src/components/canvas/ComponentLibrary.tsx` 中添加组件元信息（名称、图标、默认属性、位置），注册到左侧组件库
3.  在 `src/components/editor/PropsPanel.tsx` 中添加对应属性配置项（如表格列数、数据源），支持可视化配置
4.  （可选）在 `src/utils/aiPrompt.ts` 中扩展 Prompt 模板，支持 AI 生成该组件

### 2. 集成新的大模型 API
1.  在 `src/api/ai/` 下创建对应模型封装文件（如 `deepseek.ts`），统一返回格式（与现有 AI 接口对齐）
2.  在 `src/config/ai.ts` 中添加模型配置（API 地址、密钥字段、请求参数）
3.  在 `src/hooks/useAI.ts` 中扩展模型切换逻辑，支持在页面中动态选择模型
4.  调整 `src/utils/aiPrompt.ts` 中的提示词模板，适配新模型的输出特性

### 3. 定制标注模板
1.  进入平台「标注模式」，拖拽组件搭建标注页面，配置组件联动规则（如文本高亮→标签关联）
2.  如需新增标注字段，在 `src/types/label.ts` 中扩展 `LabelData` 类型，补充对应校验规则
3.  在 `src/utils/export.ts` 中调整导出逻辑，适配新字段的 JSON/JSONL 格式输出
4.  保存标注配置为模板，在 `src/utils/cache.ts` 中添加缓存逻辑，支持二次复用

### 4. 扩展拖拽功能
1.  **新增拖拽组件**：在 `src/editor/materials/` 目录下创建新组件，确保组件实现 `CommonComponentProps` 接口，以便与其他拖拽功能集成
2.  **自定义拖拽预览**：在 `src/editor/components/GlobalDragPreview.tsx` 中添加新组件的预览渲染逻辑
3.  **增强拖拽效果**：在 `src/editor/components/DragPreviewStyles.css` 中添加自定义样式，如插入线样式、高亮效果等
4.  **位置计算算法**：在 `src/editor/utils/dragUtils.ts` 中调整位置计算逻辑，如阈值、插入位置判断等
5.  **状态管理**：如需扩展拖拽状态，在 `src/editor/stores/dragStore.ts` 中添加新的状态属性和方法

## 七、注意事项（Notes）
1.  **AI 功能配置**：AI 生成、辅助标注功能依赖第三方 API 密钥，需复制 `.env.example` 为 `.env` 并填写密钥，建议通过后端转发请求，避免前端暴露密钥
2.  **环境兼容**：本地开发需确保 Node.js 版本 ≥18，否则可能导致依赖安装失败或启动报错
3.  **生产构建优化**：构建生产包前，需检查 `vite.config.ts` 中的分包策略与 CDN 配置，减小包体积，提升线上加载速度
4.  **数据导出规范**：标注数据导出为 JSONL 格式时，需确保每条数据字段完整，避免空值或格式错误，影响大模型训练
5.  **浏览器兼容性**：不支持 IE 浏览器，老旧浏览器会自动显示降级提示，建议使用现代浏览器以获得完整功能
6.  **拖拽功能兼容性**：拖拽功能基于 React DnD v14+ 实现，需要现代浏览器支持，移动设备上可能需要额外的触摸支持优化

## 八、未来规划（Roadmap）
1.  新增多模态标注支持，适配图片+文本、音频+文本的标注场景
2.  集成私有化大模型部署方案，支持内网环境使用，提升数据安全性
3.  优化 AI 生成逻辑，支持自定义组件库适配，生成更贴合项目规范的代码
4.  新增团队协作功能，支持标注任务分配、权限管理、多人实时编辑
5.  扩展数据可视化能力，支持标注进度、模型训练效果的图表展示
6.  适配移动端编辑器，支持触屏拖拽操作，提升多端使用体验

## 九、致谢（Acknowledgements）
- 开源依赖：React、Vite、Tailwind CSS、Konva 等优秀开源项目，为平台开发提供基础支撑
- 参考资源：阿里低代码平台架构设计、大模型微调数据生产规范、React 官方性能优化指南
- 工具支持：OpenAI、通义千问 API 提供的 AI 能力，BrowserStack 提供的浏览器兼容性测试支持 