import {
    ArrowRightOutlined,
    FireOutlined,
    HeartOutlined,
    NotificationOutlined,
    StarFilled,
} from '@ant-design/icons';
import type { CommonComponentProps } from '../../stores/interface.ts';

const ICON_MAP = {
    star: StarFilled,
    heart: HeartOutlined,
    fire: FireOutlined,
    bell: NotificationOutlined,
    arrow: ArrowRightOutlined,
};

interface IconProps extends CommonComponentProps {
    icon?: keyof typeof ICON_MAP;
    size?: number;
    color?: string;
}

export default function Icon({
    id,
    icon = 'star',
    size = 28,
    color = '#111827',
    style,
    className,
}: IconProps) {
    const IconComponent = ICON_MAP[icon] || StarFilled;

    return (
        <div
            data-component-id={id}
            className={className}
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color,
                fontSize: `${size}px`,
                ...style,
            }}
        >
            <IconComponent />
        </div>
    );
}
