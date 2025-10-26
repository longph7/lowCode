import React, { useRef } from 'react';
import type { CommonComponentProps } from '../../stores/interface.ts';
import useEnhancedMaterialDrops from '../../hooks/useEnhancedMaterialDrops.ts';
import DropPreview from '../../components/DropPreview.tsx';

interface DivProps extends CommonComponentProps {
    backgroundColor?: string;
    padding?: number;
    margin?: number;
    borderRadius?: number;
    border?: string;
    minHeight?: number;
    display?: 'block' | 'flex' | 'inline-block' | 'inline-flex';
    flexDirection?: 'row' | 'column';
    justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
    alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
}

export default function Div({ 
    id, 
    name, 
    children,
    backgroundColor = 'transparent',
    padding = 10,
    margin = 0,
    borderRadius = 0,
    border = '1px solid #e0e0e0',
    minHeight = 50,
    display = 'block',
    flexDirection = 'column',
    justifyContent = 'flex-start',
    alignItems = 'flex-start',
    style,
    className
}: DivProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { canDrop, isOver, dropRef, dropPreview } = useEnhancedMaterialDrops(
        ['Button', 'Container', 'Header', 'Input', 'Image', 'Text', 'Div'], 
        id
    );

    // 组合 refs
    const combinedRef = (node: HTMLDivElement) => {
        containerRef.current = node;
        dropRef(node);
    };
    
    // 基础样式
    const baseStyles: React.CSSProperties = {
        backgroundColor: isOver ? 'rgba(59, 130, 246, 0.05)' : backgroundColor,
        padding: `${padding}px`,
        margin: `${margin}px`,
        borderRadius: `${borderRadius}px`,
        border: canDrop ? '2px solid #3b82f6' : border,
        minHeight: `${minHeight}px`,
        display,
        flexDirection: display.includes('flex') ? flexDirection : undefined,
        justifyContent: display.includes('flex') ? justifyContent : undefined,
        alignItems: display.includes('flex') ? alignItems : undefined,
        transition: 'all 0.2s ease',
        position: 'relative'
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
    );
}