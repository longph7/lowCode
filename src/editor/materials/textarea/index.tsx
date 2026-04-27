import React from 'react';
import { Input } from 'antd';
import type { CommonComponentProps } from '../../stores/interface.ts';

interface TextAreaProps extends CommonComponentProps {
    placeholder?: string;
    value?: string;
    rows?: number;
    maxLength?: number;
    disabled?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function TextArea({
    id,
    placeholder = 'Please enter content',
    value = '',
    rows = 4,
    maxLength,
    disabled = false,
    onChange,
    style,
    className
}: TextAreaProps) {
    return (
        <div data-component-id={id} style={style} className={className}>
            <Input.TextArea
                placeholder={placeholder}
                value={value}
                rows={rows}
                maxLength={maxLength}
                disabled={disabled}
                onChange={onChange}
            />
        </div>
    );
}
