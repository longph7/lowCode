# 低代码编辑器预览模式切换功能文档

## 📋 概述

本文档详细介绍了低代码编辑器中预览模式切换功能的设计原理、实现方式和使用方法。该功能允许用户在编辑模式和预览模式之间无缝切换，提供真实的页面预览体验。

## 🎯 功能目标

- **编辑模式**：完整的组件编辑功能，包括拖拽、选中、属性配置等
- **预览模式**：纯净的页面预览，隐藏所有编辑器相关的UI元素和交互

## 🏗️ 架构设计

### 状态管理架构

```
┌─────────────────────────────────┐
│        Zustand Store            │
├─────────────────────────────────┤
│ State:                          │
│  - components: Component[]      │
│  - curComponentId: number|null  │
│  - curComponent: Component|null │
│  - mode: 'edit' | 'preview'     │
├─────────────────────────────────┤
│ Actions:                        │
│  - setMode(mode)               │
│  - setCurComponentId(id)       │
│  - addComponent(component)     │
│  - deleteComponent(id)         │
│  - updateComponent(id, props)  │
└─────────────────────────────────┘
```

### 组件层级结构

```
LowcodeEditor (主编辑器)
├── Header (顶部导航 - 包含模式切换按钮)
├── 编辑模式布局
│   ├── Material (物料库面板)
│   ├── EditorArea (编辑区域)
│   └── Setting (属性配置面板)
└── 预览模式布局
    └── EditorArea (纯净预览区域)
```

## 🔧 技术实现

### 1. 状态管理实现

#### 接口定义
```typescript
// src/editor/stores/components.tsx
export interface State {
    components: Component[];
    curComponentId: number | null;
    curComponent: Component | null;
    mode: 'edit' | 'preview';  // 新增模式状态
}

export interface Actions {
    setMode: (mode: 'edit' | 'preview') => void;  // 新增模式切换方法
    // ... 其他方法
}
```

#### 状态切换逻辑
```typescript
setMode: (mode) => {
    set((state) => {
        // 切换到预览模式时，清除当前选中的组件
        if (mode === 'preview') {
            return {
                ...state,
                mode,
                curComponentId: null,
                curComponent: null
            };
        }
        return {
            ...state,
            mode
        };
    })
}
```

### 2. Header组件实现

#### 切换按钮渲染
```tsx
// src/components/Header/index.tsx
const {mode, setMode} = useComponentsStore(
    useShallow((state) => ({
        mode: state.mode,
        setMode: state.setMode
    }))
);

{mode === 'edit' ? (
    <Button type="primary" onClick={() => setMode('preview')}>
       预览
    </Button>
) : (
    <Button type="default" onClick={() => setMode('edit')}>
        退出预览
    </Button>
)}
```

### 3. EditorArea组件实现

#### 交互事件处理
```typescript
// src/editor/EditoArea/index.tsx
const handleMouseOver = useCallback((e: any) => {
    // 预览模式下不响应鼠标事件
    if (mode === 'preview') {
        return;
    }
    // ... 编辑模式的鼠标悬停逻辑
}, [mode]);

const handleClick = useCallback((e: any) => {
    // 预览模式下不响应点击事件
    if (mode === 'preview') {
        return;
    }
    // ... 编辑模式的点击选中逻辑
}, [mode]);
```

#### 条件渲染逻辑
```tsx
{/* 只在编辑模式下显示悬停提示 */}
{mode === 'edit' && hoverComponentId && hoverComponentId !== curComponentId?.toString() && (
    <Hover componentId={hoverComponentId} />
)}

{/* 只在编辑模式下显示选中遮罩 */}
{mode === 'edit' && curComponentId && (
    <SelectedMask componentId={curComponentId.toString()} />
)}
```

### 4. 主编辑器布局实现

#### 响应式布局切换
```tsx
// src/editor/index.tsx
{mode === 'preview' ? (
    // 预览模式：只显示编辑区域
    <div className="flex-1 p-4">
        <EditorArea />
    </div>
) : (
    // 编辑模式：显示完整布局
    <Allotment>
        <Allotment.Pane preferredSize="20%">
            <Material />
        </Allotment.Pane>
        <Allotment.Pane>
            <EditorArea />
        </Allotment.Pane>
        <Allotment.Pane>
            <Setting />
        </Allotment.Pane>
    </Allotment>
)}
```

### 5. 样式优化

#### CSS样式定义
```css
/* src/index.css */
/* 预览模式样式 */
.preview-mode {
  background-color: #f8fafc;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: auto;
}

.edit-mode {
  background-color: #ffffff;
  border: 1px dashed #e2e8f0;
  border-radius: 4px;
}

/* 预览模式下隐藏编辑相关元素 */
.preview-mode * {
  cursor: default !important;
}

.preview-mode .drop-hint,
.preview-mode .drag-handle {
  display: none !important;
}
```

## 🎮 使用方法

### 基本操作流程

1. **进入预览模式**
   - 点击Header右上角的"预览"按钮
   - 界面自动切换到预览模式
   - 物料库和属性面板自动隐藏
   - 编辑区域显示纯净的页面效果

2. **退出预览模式**
   - 点击"退出预览"按钮
   - 返回到完整的编辑界面
   - 恢复所有编辑功能

### 模式对比

| 功能特性 | 编辑模式 | 预览模式 |
|---------|---------|---------|
| 物料库面板 | ✅ 显示 | ❌ 隐藏 |
| 属性配置面板 | ✅ 显示 | ❌ 隐藏 |
| 组件选中效果 | ✅ 支持 | ❌ 禁用 |
| 鼠标悬停提示 | ✅ 支持 | ❌ 禁用 |
| 拖拽操作 | ✅ 支持 | ❌ 禁用 |
| 组件删除 | ✅ 支持 | ❌ 禁用 |
| 页面展示 | 🔧 编辑视图 | 👁️ 真实预览 |

## 🔄 状态流转图

```
┌─────────────┐    点击"预览"     ┌─────────────┐
│   编辑模式   │ ─────────────→  │   预览模式   │
│             │                 │             │
│ • 显示面板   │                 │ • 隐藏面板   │
│ • 支持交互   │                 │ • 禁用交互   │
│ • 编辑功能   │                 │ • 纯净预览   │
└─────────────┘ ←───────────── └─────────────┘
                点击"退出预览"
```

## 📋 关键实现要点

### 1. 状态一致性保证
- 切换到预览模式时自动清除组件选中状态
- 使用useShallow优化状态订阅性能
- 确保所有相关组件同步响应模式变化

### 2. 事件处理优化
- 在事件处理函数开头检查模式状态
- 预览模式下提前返回，避免不必要的计算
- 依赖数组包含mode状态，确保正确响应变化

### 3. 条件渲染策略
- 使用&&运算符进行条件渲染
- 在最外层组件进行布局切换
- 避免深层嵌套的条件判断

### 4. 性能考虑
- 使用useCallback缓存事件处理函数
- 合理使用useMemo缓存计算结果
- 精确的依赖数组设置

## 🐛 错误处理

### DOM操作安全性
```typescript
// 遵循DOM查询错误处理规范
try {
    const element = document.querySelector(`[data-component-id="${componentId}"]`);
    if (!element) {
        console.warn(`找不到组件: ${componentId}`);
        return;
    }
    // 检查dataset存在性
    if (element.dataset && element.dataset.componentId) {
        // 安全的DOM操作
    }
} catch (error) {
    console.warn('DOM操作出错:', error);
}
```

## 🚀 扩展建议

### 未来可能的增强功能

1. **快捷键支持**
   - `F11` 键快速切换预览模式
   - `Esc` 键退出预览模式

2. **预览模式增强**
   - 支持全屏预览
   - 响应式预览（手机、平板、桌面）
   - 预览链接分享

3. **状态持久化**
   - 记住用户的预览偏好
   - 会话存储当前模式状态

4. **动画效果**
   - 模式切换时的平滑过渡动画
   - 面板显隐的动效

## 📚 相关文件

- `src/editor/stores/components.tsx` - 状态管理核心
- `src/components/Header/index.tsx` - 切换按钮实现
- `src/editor/EditoArea/index.tsx` - 编辑区域适配
- `src/editor/index.tsx` - 主编辑器布局
- `src/index.css` - 预览模式样式
- `src/components/SelectedMask/index.tsx` - 选中遮罩组件
- `src/components/Hover/index.tsx` - 悬停提示组件

## 📝 总结

预览模式切换功能通过精心设计的状态管理和条件渲染机制，实现了编辑模式和预览模式的无缝切换。该功能不仅提升了用户体验，还为后续的功能扩展奠定了良好的基础。

核心技术要点：
- **状态驱动**：通过mode状态控制整个应用的显示逻辑
- **条件渲染**：根据模式动态显示/隐藏相关组件
- **事件隔离**：预览模式下完全禁用编辑交互
- **布局适配**：响应式调整界面布局结构

这种设计模式可以作为其他类似功能开发的参考模板。