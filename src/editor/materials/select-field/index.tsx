import { Select as AntSelect } from 'antd';
import type { CommonComponentProps } from '../../stores/interface.ts';

interface SelectFieldProps extends CommonComponentProps {
    placeholder?: string;
    value?: string;
    options?: string[];
    disabled?: boolean;
    allowClear?: boolean;
    onChange?: (value: string) => void;
}

export default function SelectField({
    id,
    placeholder = 'Please select',
    value,
    options = ['Option A', 'Option B', 'Option C'],
    disabled = false,
    allowClear = true,
    onChange,
    style,
    className
}: SelectFieldProps) {
    return (
        <div data-component-id={id} style={style} className={className}>
            <AntSelect
                value={value}
                placeholder={placeholder}
                disabled={disabled}
                allowClear={allowClear}
                style={{ width: '100%' }}
                options={options.map((item) => ({ label: item, value: item }))}
                onChange={onChange}
            />
        </div>
    );
}
