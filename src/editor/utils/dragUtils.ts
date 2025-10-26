export interface InsertPosition {
    index: number;
    position: 'before' | 'after' | 'inside';
    element?: HTMLElement;
}

export interface DropZone {
    rect: DOMRect;
    element: HTMLElement;
    componentId: number;
}

/**
 * 计算精确的插入位置
 */
export function calculatePreciseInsertPosition(
    clientOffset: { x: number; y: number },
    container: HTMLElement,
    threshold: number = 10
): InsertPosition {
    const containerRect = container.getBoundingClientRect();
    const children = Array.from(container.children).filter(
        child => child.getAttribute('data-component-id') && 
                 !child.classList.contains('drop-preview-container')
    ) as HTMLElement[];

    if (children.length === 0) {
        return {
            index: 0,
            position: 'inside'
        };
    }

    // 计算相对于容器的坐标
    const relativeY = clientOffset.y - containerRect.top;
    const relativeX = clientOffset.x - containerRect.left;

    let bestMatch: InsertPosition = {
        index: children.length,
        position: 'after',
        element: children[children.length - 1]
    };

    let minDistance = Infinity;

    children.forEach((child, index) => {
        const childRect = child.getBoundingClientRect();
        const childRelativeRect = {
            top: childRect.top - containerRect.top,
            bottom: childRect.bottom - containerRect.top,
            left: childRect.left - containerRect.left,
            right: childRect.right - containerRect.left,
            centerY: (childRect.top + childRect.bottom) / 2 - containerRect.top,
            centerX: (childRect.left + childRect.right) / 2 - containerRect.left
        };

        // 计算到元素中心的距离
        const distanceToCenter = Math.sqrt(
            Math.pow(relativeX - childRelativeRect.centerX, 2) +
            Math.pow(relativeY - childRelativeRect.centerY, 2)
        );

        // 检查是否在元素的上方、下方或内部
        if (relativeY < childRelativeRect.top - threshold) {
            // 在元素上方
            if (distanceToCenter < minDistance) {
                minDistance = distanceToCenter;
                bestMatch = {
                    index,
                    position: 'before',
                    element: child
                };
            }
        } else if (relativeY > childRelativeRect.bottom + threshold) {
            // 在元素下方
            if (distanceToCenter < minDistance) {
                minDistance = distanceToCenter;
                bestMatch = {
                    index: index + 1,
                    position: 'after',
                    element: child
                };
            }
        } else if (
            relativeY >= childRelativeRect.top - threshold &&
            relativeY <= childRelativeRect.bottom + threshold &&
            relativeX >= childRelativeRect.left - threshold &&
            relativeX <= childRelativeRect.right + threshold
        ) {
            // 在元素内部或边缘
            const isInUpperHalf = relativeY < childRelativeRect.centerY;
            
            if (distanceToCenter < minDistance) {
                minDistance = distanceToCenter;
                bestMatch = {
                    index: isInUpperHalf ? index : index + 1,
                    position: isInUpperHalf ? 'before' : 'after',
                    element: child
                };
            }
        }
    });

    return bestMatch;
}

/**
 * 获取插入线的位置
 */
export function getInsertLinePosition(
    insertPosition: InsertPosition,
    container: HTMLElement,
    padding: number = 10
): { x: number; y: number; width: number } {
    const containerRect = container.getBoundingClientRect();
    const children = Array.from(container.children).filter(
        child => child.getAttribute('data-component-id') && 
                 !child.classList.contains('drop-preview-container')
    ) as HTMLElement[];

    const lineX = padding;
    const lineWidth = containerRect.width - padding * 2;
    let lineY = padding;

    if (children.length === 0) {
        // 容器为空
        lineY = containerRect.height / 2;
    } else if (insertPosition.index === 0) {
        // 插入到第一个元素前
        const firstChild = children[0];
        const firstChildRect = firstChild.getBoundingClientRect();
        lineY = firstChildRect.top - containerRect.top - 2;
    } else if (insertPosition.index >= children.length) {
        // 插入到最后一个元素后
        const lastChild = children[children.length - 1];
        const lastChildRect = lastChild.getBoundingClientRect();
        lineY = lastChildRect.bottom - containerRect.top + 2;
    } else {
        // 插入到两个元素之间
        const prevChild = children[insertPosition.index - 1];
        const nextChild = children[insertPosition.index];
        const prevRect = prevChild.getBoundingClientRect();
        const nextRect = nextChild.getBoundingClientRect();
        
        lineY = (prevRect.bottom + nextRect.top) / 2 - containerRect.top;
    }

    return { x: lineX, y: lineY, width: lineWidth };
}

/**
 * 检查是否可以放置在指定位置
 */
export function canDropAtPosition(
    draggedItemType: string,
    targetContainer: HTMLElement,
    acceptedTypes: string[]
): boolean {
    return acceptedTypes.includes(draggedItemType);
}

/**
 * 获取拖拽悬停效果的样式
 */
export function getDragHoverStyles(isOver: boolean, canDrop: boolean) {
    const baseStyles = {
        transition: 'all 0.2s ease-in-out'
    };

    if (!canDrop) {
        return {
            ...baseStyles,
            cursor: 'not-allowed',
            opacity: 0.6
        };
    }

    if (isOver) {
        return {
            ...baseStyles,
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            borderColor: '#3b82f6',
            boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.2), inset 0 0 0 1px rgba(59, 130, 246, 0.1)'
        };
    }

    if (canDrop) {
        return {
            ...baseStyles,
            borderColor: 'rgba(59, 130, 246, 0.3)'
        };
    }

    return baseStyles;
}

/**
 * 防抖函数，用于优化拖拽性能
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: number;
    
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = window.setTimeout(() => func(...args), wait);
    };
}

/**
 * 节流函数，用于限制拖拽更新频率
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            window.setTimeout(() => inThrottle = false, limit);
        }
    };
}