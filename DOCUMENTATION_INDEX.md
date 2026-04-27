# 📖 LowCode Editor - 文档索引

> 项目所有文档的导航和快速访问入口

---

## 🗺️ 文档导航

### 📌 必读文档（优先级：⭐⭐⭐⭐⭐）

| 文档名称 | 文件路径 | 适用人群 | 简介 |
|---------|---------|---------|------|
| **项目说明** | `README.md` | 所有人 | 项目基本介绍和快速开始 |
| **快速参考** | `QUICK_REFERENCE.md` | 开发者 | 快速查找功能和文件定位 ⭐ NEW |
| **项目结构** | `PROJECT_STRUCTURE.md` | 开发者 | 完整的目录结构详解 ⭐ NEW |

### 📚 功能文档（优先级：⭐⭐⭐⭐）

| 文档名称 | 文件路径 | 简介 |
|---------|---------|------|
| **AI 标注指南** | `docs/AI_ANNOTATION_GUIDE.md` | AI 标注组件使用教程 ⭐ NEW |
| **使用指南** | `USAGE_GUIDE.md` | 编辑器基础使用教程 |
| **拖拽功能** | `DRAG_FEATURES.md` | 拖拽功能实现细节 |
| **预览模式** | `docs/preview-mode-guide.md` | 预览模式使用说明 |

### 🔧 技术文档（优先级：⭐⭐⭐）

| 文档名称 | 文件路径 | 简介 |
|---------|---------|------|
| **性能优化** | `PERFORMANCE_OPTIMIZATION.md` | 性能优化策略和实现 |
| **组件样式指南** | `docs/component-style-guide.md` | 组件样式系统说明 |
| **实现总结** | `IMPLEMENTATION_SUMMARY.md` | 核心功能实现总结 |
| **低代码详解** | `lowCode.md` | 低代码系统架构详解 |

### 🐛 维护文档（优先级：⭐⭐）

| 文档名称 | 文件路径 | 简介 |
|---------|---------|------|
| **Bug 修复** | `BUGFIX_SUMMARY.md` | 已修复问题记录 |
| **面试问答** | `docs/interview-qa.md` | 项目相关面试问题 |

### 📂 辅助文档（优先级：⭐）

| 文档名称 | 文件路径 | 简介 |
|---------|---------|------|
| **目录树** | `DIRECTORY_TREE.txt` | 可视化项目结构 ⭐ NEW |
| **文档索引** | `DOCUMENTATION_INDEX.md` | 本文档 ⭐ NEW |

---

## 🎯 按场景查找文档

### 我是新人，刚接触项目

**推荐阅读顺序**：
1. `README.md` - 了解项目基本信息
2. `QUICK_REFERENCE.md` - 快速上手指南
3. `PROJECT_STRUCTURE.md` - 熟悉项目结构
4. `USAGE_GUIDE.md` - 学习基本使用

### 我要开发新功能

**推荐查看**：
- `QUICK_REFERENCE.md` - 快速定位核心文件
- `PROJECT_STRUCTURE.md` - 了解代码组织
- `lowCode.md` - 理解系统架构
- `docs/component-style-guide.md` - 组件样式规范

### 我要添加新组件

**推荐查看**：
- `QUICK_REFERENCE.md` - 添加组件步骤
- `PROJECT_STRUCTURE.md` → materials 目录说明
- 参考现有组件：`src/editor/materials/button/index.tsx`

### 我要使用 AI 标注功能

**推荐查看**：
- `docs/AI_ANNOTATION_GUIDE.md` - AI 标注完整指南
- `QUICK_REFERENCE.md` → AI 标注组件索引

### 我要优化性能

**推荐查看**：
- `PERFORMANCE_OPTIMIZATION.md` - 性能优化文档
- `QUICK_REFERENCE.md` → 性能优化检查清单
- 源码：`src/editor/stores/components.tsx`（节流优化）
- 源码：`src/editor/hooks/useStyleChangeDetection.ts`

### 我要修复拖拽问题

**推荐查看**：
- `DRAG_FEATURES.md` - 拖拽功能详解
- 源码：`src/editor/hooks/useEnhancedMaterialDrops.ts`
- 源码：`src/editor/utils/dragUtils.ts`

### 我遇到了 Bug

**推荐查看**：
- `BUGFIX_SUMMARY.md` - 查看是否已知问题
- 浏览器控制台 - 查看错误信息
- `src/components/ErrorBoundary/` - 错误边界实现

### 我要准备面试

**推荐查看**：
- `docs/interview-qa.md` - 面试问答
- `IMPLEMENTATION_SUMMARY.md` - 实现亮点
- `PERFORMANCE_OPTIMIZATION.md` - 性能优化点

---

## 📊 文档统计

### 文档数量
- **根目录文档**: 12 个
- **docs 子目录**: 4 个
- **总计**: 16 个文档

### 文档类型分布
- **指南类**: 6 个
- **技术类**: 5 个
- **参考类**: 3 个
- **维护类**: 2 个

### 新增文档 ⭐
- `PROJECT_STRUCTURE.md` - 完整项目结构
- `DIRECTORY_TREE.txt` - 可视化目录树
- `QUICK_REFERENCE.md` - 快速参考手册
- `DOCUMENTATION_INDEX.md` - 文档索引
- `docs/AI_ANNOTATION_GUIDE.md` - AI 标注指南

---

## 🔍 文档搜索关键词

### 关键词索引

| 关键词 | 相关文档 |
|--------|---------|
| **安装/启动** | README.md, QUICK_REFERENCE.md |
| **项目结构** | PROJECT_STRUCTURE.md, DIRECTORY_TREE.txt |
| **组件开发** | QUICK_REFERENCE.md, component-style-guide.md |
| **AI 标注** | AI_ANNOTATION_GUIDE.md |
| **拖拽** | DRAG_FEATURES.md, QUICK_REFERENCE.md |
| **性能优化** | PERFORMANCE_OPTIMIZATION.md |
| **样式设置** | component-style-guide.md |
| **状态管理** | QUICK_REFERENCE.md, lowCode.md |
| **Bug 修复** | BUGFIX_SUMMARY.md |
| **面试准备** | interview-qa.md |

---

## 📝 文档内容概览

### README.md
```
- 项目简介
- 技术栈
- 快速开始
- 主要功能
- 项目结构（简要）
```

### PROJECT_STRUCTURE.md ⭐ NEW
```
- 完整目录结构详解
- 每个目录的功能说明
- 核心文件重要性标注
- 数据流程图
- 技术栈详解
- 项目统计信息
```

### QUICK_REFERENCE.md ⭐ NEW
```
- 核心文件快速定位
- 功能快速查找
- 组件快速索引
- 常见修改场景
- 样式系统参考
- 状态管理方法
- 调试技巧
```

### AI_ANNOTATION_GUIDE.md ⭐ NEW
```
- 三个 AI 标注组件介绍
- 使用流程
- 功能特性
- 示例场景
- 技术特点
- 注意事项
```

### DRAG_FEATURES.md
```
- 拖拽功能实现
- 插入位置计算
- 预览效果
- 性能优化
```

### PERFORMANCE_OPTIMIZATION.md
```
- 性能问题分析
- 优化策略
- 节流/防抖
- 渲染优化
- 效果对比
```

### USAGE_GUIDE.md
```
- 基础操作
- 组件添加
- 属性编辑
- 样式设置
- 预览发布
```

---

## 🔄 文档维护

### 文档更新记录

| 日期 | 更新内容 | 文档 |
|------|---------|------|
| 2025-10-26 | 新增完整项目结构文档 | PROJECT_STRUCTURE.md |
| 2025-10-26 | 新增快速参考手册 | QUICK_REFERENCE.md |
| 2025-10-26 | 新增可视化目录树 | DIRECTORY_TREE.txt |
| 2025-10-26 | 新增文档索引 | DOCUMENTATION_INDEX.md |
| 2025-10-26 | 新增 AI 标注指南 | AI_ANNOTATION_GUIDE.md |
| 2025-10-26 | 更新性能优化内容 | PERFORMANCE_OPTIMIZATION.md |

### 文档维护规范

1. **命名规范**：
   - 根目录文档：大写_下划线（如 `QUICK_REFERENCE.md`）
   - 子目录文档：小写-连字符（如 `component-style-guide.md`）

2. **格式规范**：
   - 使用 Markdown 格式
   - 添加清晰的标题层级
   - 使用表格、列表提高可读性
   - 添加代码示例

3. **更新规范**：
   - 重大功能更新需同步更新相关文档
   - 新增功能需添加使用说明
   - Bug 修复需记录到 BUGFIX_SUMMARY.md

---

## 💡 文档使用建议

### 对于新手
1. 先看 README.md 了解项目
2. 查看 QUICK_REFERENCE.md 快速上手
3. 阅读 USAGE_GUIDE.md 学习基本操作
4. 需要时查看 PROJECT_STRUCTURE.md

### 对于开发者
1. 使用 QUICK_REFERENCE.md 快速定位
2. 参考 PROJECT_STRUCTURE.md 了解架构
3. 查看 component-style-guide.md 学习规范
4. 遇到问题查看 BUGFIX_SUMMARY.md

### 对于维护者
1. 定期更新 BUGFIX_SUMMARY.md
2. 新功能更新对应文档
3. 保持文档与代码同步
4. 添加必要的示例和说明

---

## 📞 反馈和建议

如果你发现：
- 文档有错误或不清楚的地方
- 需要补充新的文档
- 有更好的组织建议

欢迎提出反馈！

---

**文档索引最后更新**: 2025-10-26  
**维护者**: LowCode Editor Team  
**版本**: 1.0.0
