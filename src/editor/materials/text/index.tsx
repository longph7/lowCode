import type { CSSProperties } from 'react';
import type { CommonComponentProps } from '../../stores/interface.ts';

interface TextProps extends CommonComponentProps {
    content?: string;
    fontSize?: number;
    color?: string;
    fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    lineHeight?: number;
    textDecoration?: 'none' | 'underline' | 'line-through';
}

export default function Text({
    id,
    content = '这是一段文本',
    fontSize = 14,
    color = '#333333',
    fontWeight = 'normal',
    textAlign = 'left',
    lineHeight = 1.5,
    textDecoration = 'none',
    style,
    className,
}: TextProps) {
    const mergedStyle: CSSProperties = {
        fontSize: `${fontSize}px`,
        color,
        fontWeight,
        textAlign,
        lineHeight,
        textDecoration,
        ...style,
    };

    return (
        <div data-component-id={id} style={mergedStyle} className={className}>
            {content}
        </div>
    );
}
