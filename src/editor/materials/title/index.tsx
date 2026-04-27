import type { CommonComponentProps } from '../../stores/interface.ts';

interface TitleProps extends CommonComponentProps {
    text?: string;
    title?: string;
    fontSize?: number;
    fontWeight?: number | string;
    color?: string;
    textAlign?: 'left' | 'center' | 'right';
    letterSpacing?: number;
    lineHeight?: number;
}

export default function Title({
    id,
    text = 'Main Title',
    title,
    fontSize = 48,
    fontWeight = 700,
    color = '#111827',
    textAlign = 'left',
    letterSpacing = 0,
    lineHeight = 1.2,
    style,
    className,
}: TitleProps) {
    const displayText = title ?? text;

    return (
        <div
            data-component-id={id}
            className={className}
            style={{
                margin: 0,
                fontSize: `${fontSize}px`,
                fontWeight,
                color,
                textAlign,
                letterSpacing: `${letterSpacing}px`,
                lineHeight,
                ...style,
            }}
        >
            {displayText}
        </div>
    );
}
