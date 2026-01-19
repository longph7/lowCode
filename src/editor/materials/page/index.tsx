import React, { useRef } from 'react'
import type { CommonComponentProps } from '../../stores/interface.ts'
import useEnhancedMaterialDrops from '../../hooks/useEnhancedMaterialDrops.ts'
import DropPreview from '../../components/DropPreview.tsx'






export default function Page({ id, children }: CommonComponentProps) {
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

    return (
        <div 
            className='box-border h-[100%] p-[20px] relative'
            data-component-id={id}
            ref={combinedRef}
            style={{
                border: canDrop ? '2px solid #3b82f6' : '1px solid transparent',
                backgroundColor: isOver ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                transition: 'all 0.2s ease'
            }}
        >
            {children}
            <DropPreview preview={dropPreview} containerRef={containerRef as React.RefObject<HTMLElement>} />
        </div>
    )
}
