import React from 'react';
import type { DropPreview as DropPreviewType } from '../hooks/useEnhancedMaterialDrops';
import './DragPreviewStyles.css';

interface DropPreviewProps {
    preview: DropPreviewType;
    containerRef: React.RefObject<HTMLElement>;
}

export default function DropPreview({ preview, containerRef }: DropPreviewProps) {
    if (!preview.show || !containerRef.current) {
        return null;
    }

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // 获取容器内的子元素
    const children = Array.from(container.children).filter(
        child => child.getAttribute('data-component-id')
    );

    const renderInsertLine = () => {
        if (preview.type !== 'line') return null;

        const { x, y, width } = preview.position;

        return (
            <div
                className="insert-line"
                style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    width: `${width || containerRect.width - 20}px`,
                    height: '3px'
                }}
            />
        );
    };

    const renderHighlight = () => {
        if (preview.type !== 'highlight') return null;

        return (
            <div className="highlight-area" />
        );
    };

    const renderPlaceholder = () => {
        if (preview.type !== 'placeholder') return null;

        const { x, y } = preview.position;

        return (
            <div
                className="placeholder-box"
                style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    width: '120px',
                    height: '40px'
                }}
            >
                放置在这里
            </div>
        );
    };

    return (
        <div className="drop-preview-container">
            {renderInsertLine()}
            {renderHighlight()}
            {renderPlaceholder()}
        </div>
    );
}