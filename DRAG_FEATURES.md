# 增强拖拽功能实现文档

## 功能概述

我已经为你的低代码编辑器实现了增强的拖拽功能，包括以下特性：

### 1. 精准插入预览
- **插入线（Insert Line）**: 在拖拽过程中显示蓝色的插入线，指示元素将被插入的确切位置
- **高亮区域**: 当拖拽悬停在容器上时，容器会有淡蓝色背景高亮
- **动画效果**: 插入线和高亮区域都有平滑的动画效果

### 2. 智能位置计算
- **精确定位**: 使用 `calculatePreciseInsertPosition` 函数计算最佳插入位置
- **阈值检测**: 支持设置阈值来判断是插入到元素前面、后面还是内部
- **性能优化**: 使用节流函数限制计算频率，避免性能问题

### 3. 全局拖拽状态管理
- **状态同步**: 使用 Zustand 管理全局拖拽状态
- **拖拽预览**: 全局拖拽预览组件跟随鼠标显示被拖拽的元素
- **状态清理**: 自动清理拖拽结束后的状态

## 实现的文件

### 核心 Hook
- `src/editor/hooks/useEnhancedMaterialDrops.ts` - 增强的拖拽 Hook
- `src/editor/hooks/useMaterialDrops.ts` - 原始拖拽 Hook（已修复错误）

### 组件
- `src/editor/components/DropPreview.tsx` - 拖拽预览组件
- `src/editor/components/GlobalDragPreview.tsx` - 全局拖拽预览
- `src/editor/components/DragPreviewStyles.css` - 拖拽样式

### 工具函数
- `src/editor/utils/dragUtils.ts` - 拖拽相关工具函数

### 状态管理
- `src/editor/stores/dragStore.ts` - 拖拽状态管理

### 更新的组件
- `src/editor/materials/page/index.tsx` - 页面组件
- `src/editor/materials/container/index.tsx` - 容器组件
- `src/editor/materials/div/index.tsx` - Div 组件
- `src/components/Mateialltem/index.tsx` - 材料项组件

## 使用方法

### 1. 在容器组件中使用增强拖拽

```tsx
import useEnhancedMaterialDrops from '../hooks/useEnhancedMaterialDrops';
import DropPreview from '../components/DropPreview';

function MyContainer({ id, children }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { canDrop, isOver, dropRef, dropPreview } = useEnhancedMaterialDrops(
        ['Button', 'Container', 'Text'], // 接受的组件类型
        id
    );

    const combinedRef = (node: HTMLDivElement) => {
        containerRef.current = node;
        dropRef(node);
    };

    return (
        <div 
            ref={combinedRef}
            className="relative"
            style={{
                border: canDrop ? '2px solid #3b82f6' : '1px solid #d1d5db',
                backgroundColor: isOver ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                transition: 'all 0.2s ease'
            }}
        >
            {children}
            <DropPreview preview={dropPreview} containerRef={containerRef} />
        </div>
    );
}
```

### 2. 在拖拽源组件中集成状态管理

```tsx
import { useDragStore, selectDragActions } from '../stores/dragStore';

function MaterialItem({ name }) {
    const { setDragging } = useDragStore(selectDragActions);
    
    const [{ isDragging }, dragRef] = useDrag(() => ({
        type: name,
        item: { name },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        begin: () => {
            setDragging(true, { name, type: name });
        },
        end: () => {
            setDragging(false);
        },
    }));

    return (
        <div 
            ref={dragRef}
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            {name}
        </div>
    );
}
```

## 视觉效果

### 1. 插入线效果
- 蓝色渐变线条，两端有圆点
- 脉冲动画效果
- 自动计算位置和宽度

### 2. 容器高亮
- 淡蓝色背景
- 蓝色边框
- 平滑过渡动画

### 3. 拖拽项预览
- 跟随鼠标的预览框
- 显示组件名称和图标
- 半透明背景和阴影

## 性能优化

1. **节流函数**: 限制位置计算频率到 60fps
2. **状态选择器**: 使用 Zustand 选择器避免不必要的重渲染
3. **引用合并**: 正确处理多个 ref 的合并
4. **条件渲染**: 只在需要时渲染预览组件

## 浏览器兼容性

- 支持现代浏览器（Chrome, Firefox, Safari, Edge）
- 使用 CSS3 动画和过渡效果
- 支持响应式设计
- 支持深色主题

## 自定义配置

你可以通过修改以下文件来自定义拖拽行为：

1. **样式**: 编辑 `DragPreviewStyles.css`
2. **位置计算**: 修改 `dragUtils.ts` 中的算法
3. **动画**: 调整 CSS 动画参数
4. **阈值**: 修改 `calculatePreciseInsertPosition` 的阈值参数

## 测试建议

1. 测试不同容器类型的拖拽
2. 验证插入线在不同位置的显示
3. 检查性能在大量组件时的表现
4. 测试嵌套容器的拖拽行为
5. 验证移动设备上的触摸拖拽

现在你可以启动项目 (`npm run dev`) 并测试这些新的拖拽功能！