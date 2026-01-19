import React, { useRef } from 'react'
import type { CommonComponentProps } from '../../stores/interface.ts'
import useEnhancedMaterialDrops from '../../hooks/useEnhancedMaterialDrops.ts'
import DropPreview from '../../components/DropPreview.tsx'

export default function Container({ id, children, style, className }: CommonComponentProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { canDrop, isOver, dropRef, dropPreview } = useEnhancedMaterialDrops(
        ['Button', 'Container', 'Header', 'Input', 'Image', 'Text', 'Div', 'ImageUpload', 'PreAnnotation', 'AnnotationCanvas'], 
        id
    );

    // 组合 refs
    const combinedRef = (node: HTMLDivElement) => {
        containerRef.current = node;
        dropRef(node);
    };
    
    // 基础样式
    const baseStyles: React.CSSProperties = {
        minHeight: '100px',
        padding: '20px',
        position: 'relative',
        border: canDrop ? '2px solid #3b82f6' : '1px solid #d1d5db',
        backgroundColor: isOver ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
        transition: 'all 0.2s ease'
    };

    // 合并样式，style中的样式优先级最高
    const mergedStyles: React.CSSProperties = {
        ...baseStyles,
        ...style
    };

    return (
        <div 
            data-component-id={id}
            ref={combinedRef}
            style={mergedStyles}
            className={className}
        >
            {children}
            <DropPreview preview={dropPreview} containerRef={containerRef as React.RefObject<HTMLElement>} />
        </div>
    )
}
