import type { CommonComponentProps } from '../../stores/interface.ts';

interface DividerProps extends CommonComponentProps {
    direction?: 'horizontal' | 'vertical';
    color?: string;
    thickness?: number;
    lineStyle?: 'solid' | 'dashed' | 'dotted';
    opacity?: number;
}

export default function Divider({
    id,
    direction = 'horizontal',
    color = '#d1d5db',
    thickness = 2,
    lineStyle = 'solid',
    opacity = 1,
    style,
    className,
}: DividerProps) {
    const isHorizontal = direction === 'horizontal';

    return (
        <div
            data-component-id={id}
            className={className}
            style={{
                width: isHorizontal ? '100%' : `${thickness}px`,
                height: isHorizontal ? `${thickness}px` : '100%',
                backgroundColor: lineStyle === 'solid' ? color : 'transparent',
                borderTop: isHorizontal && lineStyle !== 'solid' ? `${thickness}px ${lineStyle} ${color}` : undefined,
                borderLeft: !isHorizontal && lineStyle !== 'solid' ? `${thickness}px ${lineStyle} ${color}` : undefined,
                opacity,
                boxSizing: 'border-box',
                ...style,
            }}
        />
    );
}
