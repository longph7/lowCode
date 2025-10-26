import React from 'react';
import { Input as AntInput } from 'antd';
import type { CommonComponentProps } from '../../stores/interface.ts';

interface InputProps extends CommonComponentProps {
    placeholder?: string;
    value?: string;
    size?: 'large' | 'middle' | 'small';
    disabled?: boolean;
    allowClear?: boolean;
    maxLength?: number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({ 
    id, 
    name, 
    placeholder = '请输入内容',
    value = '',
    size = 'middle',
    disabled = false,
    allowClear = true,
    maxLength,
    onChange,
    style,
    className
}: InputProps) {
    // 合并样式
    const mergedStyle: React.CSSProperties = {
        ...style
    };

    return (
        <div 
            data-component-id={id}
            style={mergedStyle}
            className={className}
        >
            <AntInput
                placeholder={placeholder}
                value={value}
                size={size}
                disabled={disabled}
                allowClear={allowClear}
                maxLength={maxLength}
                onChange={onChange}
            />
        </div>
    );
}