import type { CSSProperties } from 'react';
import type { CommonComponentProps } from '../../stores/interface.ts';

interface HeaderProps extends CommonComponentProps {
    title?: string;
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    align?: 'left' | 'center' | 'right';
    color?: string;
}

export default function Header({
    id,
    children,
    title = '标题',
    level = 1,
    align = 'left',
    color = '#1f2937',
    style,
    className,
}: HeaderProps) {
    const baseStyles: CSSProperties = {
        margin: 0,
        padding: '16px 0',
        fontSize: level === 1 ? '32px' : level === 2 ? '24px' : level === 3 ? '20px' : level === 4 ? '18px' : level === 5 ? '16px' : '14px',
        fontWeight: level <= 3 ? 600 : 500,
        lineHeight: '1.4',
        color,
        textAlign: align,
        borderBottom: level <= 2 ? '2px solid #e5e7eb' : 'none',
        marginBottom: level <= 2 ? '16px' : '8px',
    };

    const headerStyles: CSSProperties = {
        ...baseStyles,
        ...style,
    };

    const content = children ?? title;

    switch (level) {
        case 1:
            return <h1 data-component-id={id} className={className} style={headerStyles}>{content}</h1>;
        case 2:
            return <h2 data-component-id={id} className={className} style={headerStyles}>{content}</h2>;
        case 3:
            return <h3 data-component-id={id} className={className} style={headerStyles}>{content}</h3>;
        case 4:
            return <h4 data-component-id={id} className={className} style={headerStyles}>{content}</h4>;
        case 5:
            return <h5 data-component-id={id} className={className} style={headerStyles}>{content}</h5>;
        default:
            return <h6 data-component-id={id} className={className} style={headerStyles}>{content}</h6>;
    }
}
