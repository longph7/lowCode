import type { CSSProperties } from 'react';
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
    src = 'https://via.placeholder.com/300x200?text=Image',
    alt = 'Image',
    width = '100%',
    height = 'auto',
    objectFit = 'cover',
    borderRadius = 0,
    style,
    className,
}: ImageProps) {
    const imageStyle: CSSProperties = {
        width,
        height,
        objectFit,
        borderRadius: `${borderRadius}px`,
        display: 'block',
        maxWidth: '100%',
    };

    return (
        <div data-component-id={id} style={style} className={className}>
            <img src={src} alt={alt} style={imageStyle} draggable={false} />
        </div>
    );
}
