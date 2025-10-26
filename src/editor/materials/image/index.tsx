import React from 'react';
import type { CommonComponentProps } from '../../stores/interface.ts';

interface ImageProps extends CommonComponentProps {
    src?: string;
    alt?: string;
    width?: number | string;
    height?: number | string;
    objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
    borderRadius?: number;
}

export default function Image({ 
    id, 
    name, 
    src = 'https://via.placeholder.com/300x200?text=图片',
    alt = '图片',
    width = '100%',
    height = 'auto',
    objectFit = 'cover',
    borderRadius = 0,
    style,
    className
}: ImageProps) {
    // 基础图片样式
    const baseImageStyles: React.CSSProperties = {
        width,
        height,
        objectFit,
        borderRadius: `${borderRadius}px`,
        display: 'block',
        maxWidth: '100%'
    };

    // 合并容器样式
    const mergedContainerStyle: React.CSSProperties = {
        ...style
    };

    return (
        <div 
            data-component-id={id}
            style={mergedContainerStyle}
            className={className}
        >
            <img
                src={src}
                alt={alt}
                style={baseImageStyles}
            />
        </div>
    );
}