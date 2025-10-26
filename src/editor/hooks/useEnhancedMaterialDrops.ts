import { useDrop } from 'react-dnd'
import { message } from 'antd'
import { useState, useCallback, useRef, useEffect } from 'react'
import useComponentsStore from '../stores/components.tsx'
import { useComponentConfigStore } from '../stores/component-config.tsx'
import { useDragStore } from '../stores/dragStore'
import { 
    calculatePreciseInsertPosition, 
    getInsertLinePosition
} from '../utils/dragUtils'

export interface DropPosition {
    x: number;
    y: number;
    width?: number;
    insertIndex?: number;
    insertPosition?: 'before' | 'after' | 'inside';
}

export interface DropPreview {
    show: boolean;
    position: DropPosition;
    type: 'line' | 'highlight' | 'placeholder';
}

export default function useEnhancedMaterialDrops(accept: string[], id: number) {
    const { addComponent } = useComponentsStore((state) => state);
    const { componentConfig } = useComponentConfigStore((state) => state);
    // const setHoveredContainer = useDragStore((state) => state.setHoveredContainer);
    
    const [dropPreview, setDropPreview] = useState<DropPreview>({
        show: false,
        position: { x: 0, y: 0 },
        type: 'highlight'
    });
    
    const dropRef = useRef<HTMLDivElement>(null);
    const previewTimeoutRef = useRef<number>(0);

    // 计算插入位置（使用节流优化性能）
    const calculateInsertPosition = useCallback((clientOffset: { x: number; y: number }, dropTargetRef: HTMLElement) => {
        const insertPos = calculatePreciseInsertPosition(clientOffset, dropTargetRef);
        const linePos = getInsertLinePosition(insertPos, dropTargetRef);
        
        return {
            x: linePos.x,
            y: linePos.y,
            width: linePos.width,
            insertIndex: insertPos.index,
            insertPosition: insertPos.position,
            targetElement: insertPos.element
        };
    }, []);

    // 更新预览状态
    const updatePreview = useCallback((monitor: any) => {
        if (!monitor.isOver({ shallow: true })) {
            setDropPreview(prev => ({ ...prev, show: false }));
            return;
        }

        const clientOffset = monitor.getClientOffset();
        const dropTargetRef = dropRef.current;

        if (clientOffset && dropTargetRef) {
            const position = calculateInsertPosition(clientOffset, dropTargetRef);
            
            setDropPreview({
                show: true,
                position,
                type: 'line'
            });
        }
    }, [calculateInsertPosition]);

    const [{ canDrop, isOver, isOverCurrent }, drop] = useDrop(() => ({
        accept,
        drop: (item: { name: string }, monitor) => {
            // 检查是否已经在其他容器中处理了放置
            const didDrop = monitor.didDrop();
            if (didDrop) return;

            const clientOffset = monitor.getClientOffset();
            const dropTargetRef = dropRef.current;

            if (clientOffset && dropTargetRef) {
                const position = calculateInsertPosition(clientOffset, dropTargetRef);
                
                const props = componentConfig?.[item.name]?.defaultProps;
                const desc = componentConfig?.[item.name]?.desc;

                // 创建新组件
                const newComponent = {
                    id: Date.now(),
                    name: item.name,
                    props: props || {},
                    children: [],
                    desc: desc || '',
                    position: { x: position.x, y: position.y }
                };

                message.success(`成功添加 ${item.name} 组件到容器！`);
                addComponent(newComponent, id);
                
                console.log('dropped item to container:', item, 'at position:', position);
            }

            // 清除预览
            setDropPreview(prev => ({ ...prev, show: false }));
        },
        hover: (_item, monitor) => {
            // 清除之前的定时器
            if (previewTimeoutRef.current) {
                clearTimeout(previewTimeoutRef.current);
            }

            // 延迟更新预览，避免闪烁
            previewTimeoutRef.current = window.setTimeout(() => {
                updatePreview(monitor);
            }, 16); // 约60fps
        },
        collect: (monitor) => ({
            canDrop: monitor.canDrop(),
            isOver: monitor.isOver(),
            isOverCurrent: monitor.isOver({ shallow: true }),
        }),
    }), [accept, id, addComponent, componentConfig, updatePreview]);

    // 组合 refs
    const combinedRef = useCallback((node: HTMLDivElement) => {
        dropRef.current = node;
        drop(node);
    }, [drop]);

    // 清理定时器
    useEffect(() => {
        return () => {
            if (previewTimeoutRef.current) {
                clearTimeout(previewTimeoutRef.current);
            }
        };
    }, []);

    // 当不再悬停时清除预览
    useEffect(() => {
        if (!isOverCurrent) {
            setDropPreview(prev => ({ ...prev, show: false }));
        }
    }, [isOverCurrent]);

    return {
        canDrop,
        isOver,
        isOverCurrent,
        dropRef: combinedRef,
        dropPreview
    };
}