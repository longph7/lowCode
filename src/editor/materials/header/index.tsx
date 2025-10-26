import React from 'react';
import type { CommonComponentProps } from '../../stores/interface.ts';

interface HeaderProps extends CommonComponentProps {
    title?: string;
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    align?: 'left' | 'center' | 'right';
    color?: string;
}

export default function Header({ id, name, children, title = '标题', level = 1, align = 'left', color = '#1f2937', style, className }: HeaderProps) {
    // 基础样式
    const baseStyles: React.CSSProperties = {
        margin: 0,
        padding: '16px 0',
        fontSize: level === 1 ? '32px' : level === 2 ? '24px' : level === 3 ? '20px' : level === 4 ? '18px' : level === 5 ? '16px' : '14px',
        fontWeight: level <= 3 ? 600 : 500,
        lineHeight: '1.4',
        color: color,
        textAlign: align,
        borderBottom: level <= 2 ? '2px solid #e5e7eb' : 'none',
        marginBottom: level <= 2 ? '16px' : '8px'
    };

    // 合并样式，style中的样式优先级最高
    const headerStyles: React.CSSProperties = {
        ...baseStyles,
        ...style
    };

    const renderTitle = () => {
        switch (level) {
            case 1:
                return <h1 style={headerStyles}>{title}</h1>;
            case 2:
                return <h2 style={headerStyles}>{title}</h2>;
            case 3:
                return <h3 style={headerStyles}>{title}</h3>;
            case 4:
                return <h4 style={headerStyles}>{title}</h4>;
            case 5:
                return <h5 style={headerStyles}>{title}</h5>;
            case 6:
                return <h6 style={headerStyles}>{title}</h6>;
            default:
                return <h1 style={headerStyles}>{title}</h1>;
        }
    };

    return (
        <header className={className || 'header-component'}
        data-component-id={id}
        >
            {renderTitle()}
            {children}
        </header>
    );
}