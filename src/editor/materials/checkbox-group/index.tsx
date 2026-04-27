import { Checkbox } from 'antd';
import type { CommonComponentProps } from '../../stores/interface.ts';

interface CheckboxGroupProps extends CommonComponentProps {
    value?: string[];
    options?: string[];
    direction?: 'horizontal' | 'vertical';
    disabled?: boolean;
    onChange?: (checkedValues: string[]) => void;
}

export default function CheckboxGroupField({
    id,
    value,
    options = ['Option A', 'Option B', 'Option C'],
    direction = 'vertical',
    disabled = false,
    onChange,
    style,
    className
}: CheckboxGroupProps) {
    return (
        <div data-component-id={id} style={style} className={className}>
            <Checkbox.Group value={value} disabled={disabled} onChange={onChange}>
                <div style={{ display: 'flex', flexDirection: direction === 'vertical' ? 'column' : 'row', gap: 8 }}>
                    {options.map((item) => (
                        <Checkbox key={item} value={item}>
                            {item}
                        </Checkbox>
                    ))}
                </div>
            </Checkbox.Group>
        </div>
    );
}
