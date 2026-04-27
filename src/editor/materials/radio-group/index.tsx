import { Radio } from 'antd';
import type { CommonComponentProps } from '../../stores/interface.ts';

interface RadioGroupProps extends CommonComponentProps {
    value?: string;
    options?: string[];
    direction?: 'horizontal' | 'vertical';
    disabled?: boolean;
    onChange?: (e: any) => void;
}

export default function RadioGroupField({
    id,
    value,
    options = ['Option A', 'Option B', 'Option C'],
    direction = 'vertical',
    disabled = false,
    onChange,
    style,
    className
}: RadioGroupProps) {
    return (
        <div data-component-id={id} style={style} className={className}>
            <Radio.Group value={value} disabled={disabled} onChange={onChange}>
                <div style={{ display: 'flex', flexDirection: direction === 'vertical' ? 'column' : 'row', gap: 8 }}>
                    {options.map((item) => (
                        <Radio key={item} value={item}>
                            {item}
                        </Radio>
                    ))}
                </div>
            </Radio.Group>
        </div>
    );
}
