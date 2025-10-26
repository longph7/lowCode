# 拖拽功能错误修复总结

## 🐛 修复的问题

### 1. React DnD API 弃用警告
**错误信息**：
```
useDrag::spec.begin was deprecated in v14. Replace spec.begin() with spec.item()
```

**修复方案**：
- 将 `begin` 回调移动到 `item` 函数中
- 使用 `item` 函数返回拖拽数据，同时在其中设置拖拽状态
- 保留 `end` 回调用于清理状态

**修改文件**：
- `src/components/Mateialltem/index.tsx`

### 2. Zustand getSnapshot 缓存问题
**错误信息**：
```
The result of getSnapshot should be cached to avoid an infinite loop
```

**修复方案**：
- 移除选择器函数 `selectDragState` 和 `selectDragActions`
- 直接使用 `useDragStore((state) => state.property)` 的方式
- 避免每次渲染都创建新的对象引用

**修改文件**：
- `src/editor/stores/dragStore.ts`
- `src/components/Mateialltem/index.tsx`
- `src/editor/hooks/useEnhancedMaterialDrops.ts`
- `src/editor/components/GlobalDragPreview.tsx`

## 🔧 具体修改

### MaterialItem 组件
```typescript
// 修改前
const { setDragging } = useDragStore(selectDragActions);
const [{ isDragging }, dragRef] = useDrag(() => ({
    type: props.name,
    item: { name: props.name },
    begin: () => {
        setDragging(true, { name: props.name, type: props.name });
    },
    end: () => {
        setDragging(false);
    },
}), [props.name, setDragging])

// 修改后
const setDragging = useDragStore(useCallback((state) => state.setDragging, []));
const [{ isDragging }, dragRef] = useDrag(() => ({
    type: props.name,
    item: () => {
        setDragging(true, { name: props.name, type: props.name });
        return { name: props.name };
    },
    end: () => {
        setDragging(false);
    },
}), [props.name, setDragging])
```

### 状态管理
```typescript
// 修改前
export const selectDragActions = (state: DragState & DragActions) => ({
    setDragging: state.setDragging,
    setHoveredContainer: state.setHoveredContainer,
    setInsertPreview: state.setInsertPreview,
    clearDragState: state.clearDragState
});

// 修改后
// 直接使用 useDragStore((state) => state.property)
```

### GlobalDragPreview 组件
```typescript
// 修改前
const { isDragging, draggedItem, insertPreview } = useDragStore(selectDragState);

// 修改后
const isDragging = useDragStore((state) => state.isDragging);
const draggedItem = useDragStore((state) => state.draggedItem);
const insertPreview = useDragStore((state) => state.insertPreview);
```

## ✅ 验证修复

1. **启动项目**：
   ```bash
   npm run dev
   ```
   项目现在在 `http://localhost:5176/` 运行

2. **检查控制台**：
   - 不再有 React DnD 弃用警告
   - 不再有 getSnapshot 缓存警告

3. **测试拖拽功能**：
   - 拖拽组件时状态正常更新
   - 插入线正常显示
   - 全局拖拽预览正常工作

## 🎯 最佳实践

### Zustand 状态选择
```typescript
// ✅ 推荐：直接选择属性
const value = useStore((state) => state.value);

// ❌ 避免：使用选择器函数（除非正确缓存）
const selectValue = (state) => ({ value: state.value });
const { value } = useStore(selectValue);
```

### React DnD v14+ API
```typescript
// ✅ 推荐：使用 item 函数
const [{ isDragging }, dragRef] = useDrag(() => ({
    type: 'item',
    item: () => {
        // 在这里执行开始拖拽的逻辑
        return { data: 'some data' };
    },
    end: () => {
        // 清理逻辑
    }
}));

// ❌ 弃用：使用 begin 回调
const [{ isDragging }, dragRef] = useDrag(() => ({
    type: 'item',
    item: { data: 'some data' },
    begin: () => {
        // 这个 API 已被弃用
    }
}));
```

## 🚀 项目状态

✅ React DnD API 兼容性问题已修复  
✅ Zustand 状态管理优化完成  
✅ 拖拽功能正常工作  
✅ 控制台无错误警告  

项目现在可以正常使用所有拖拽功能！