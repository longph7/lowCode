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

    return null;
}
