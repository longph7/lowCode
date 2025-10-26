import React from 'react'
import { Button as AntdButton } from 'antd'
import type { ButtonType } from 'antd/es/button'
import type { CommonComponentProps } from '../../stores/interface.ts';

interface ButtonProps extends CommonComponentProps {
    text?: string;
    type?: ButtonType;
    size?: 'large' | 'middle' | 'small';
    shape?: 'default' | 'circle' | 'round';
    disabled?: boolean;
    loading?: boolean;
    danger?: boolean;
    ghost?: boolean;
    block?: boolean;
}

export default function Button({
    id,
    name,
    text = '按钮',
    type = 'default',
    size = 'middle',
    shape = 'default',
    disabled = false,
    loading = false,
    danger = false,
    ghost = false,
    block = false,
    style,
    className,
    ...props
}: ButtonProps) {
    // 合并样式，确保自定义样式能够覆盖默认样式
    const mergedStyle: React.CSSProperties = {
        ...style
    };

    return (
        <AntdButton 
            data-component-id={id}
            type={type}
            size={size}
            shape={shape}
            disabled={disabled}
            loading={loading}
            danger={danger}
            ghost={ghost}
            block={block}
            style={mergedStyle}
            className={className}
            {...props}
        >
            {text}
        </AntdButton>
    )
}
