import type { CommonComponentProps } from '../../stores/interface.ts';

interface ShapeProps extends CommonComponentProps {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    radius?: number;
    opacity?: number;
}

export default function Shape({
    id,
    fill = '#111827',
    stroke = 'transparent',
    strokeWidth = 0,
    radius = 16,
    opacity = 1,
    style,
    className,
}: ShapeProps) {
    return (
        <div
            data-component-id={id}
            className={className}
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: fill,
                border: `${strokeWidth}px solid ${stroke}`,
                borderRadius: `${radius}px`,
                opacity,
                ...style,
            }}
        />
    );
}
