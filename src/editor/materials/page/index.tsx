import React, { useRef } from 'react';
import type { CommonComponentProps } from '../../stores/interface.ts';
import useEnhancedMaterialDrops from '../../hooks/useEnhancedMaterialDrops.ts';
import DropPreview from '../../components/DropPreview.tsx';

interface PageProps extends CommonComponentProps {
    backgroundColor?: string;
}

export default function Page({ id, children, backgroundColor = '#ffffff' }: PageProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { canDrop, isOver, dropRef, dropPreview } = useEnhancedMaterialDrops(
        ['Container', 'Div', 'Header', 'Title', 'Text', 'Image', 'Shape', 'Divider', 'Icon'],
        id
    );

    const combinedRef = (node: HTMLDivElement) => {
        containerRef.current = node;
        dropRef(node);
    };

    return (
        <div
            className="box-border h-[100%] relative overflow-hidden"
            data-component-id={id}
            data-export-target={id === 'root_page' ? 'poster-canvas' : undefined}
            ref={combinedRef}
            style={{
                border: canDrop ? '2px solid #3b82f6' : '1px solid #d9d9d9',
                backgroundColor: isOver ? 'rgba(59, 130, 246, 0.05)' : backgroundColor,
                transition: 'all 0.2s ease',
                boxShadow: '0 12px 40px rgba(15, 23, 42, 0.12)',
            }}
        >
            {children}
            <DropPreview
                preview={dropPreview}
                containerRef={containerRef as React.RefObject<HTMLElement>}
            />
        </div>
    );
}
