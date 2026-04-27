import { Button } from 'antd';
import './AIDialog.css';

interface QuickActionsProps {
  onSelectAction: (prompt: string) => void;
  disabled?: boolean;
}

const quickActions = [
  {
    label: '新年海报',
    prompt: '做一个新年元旦海报，主标题写“新年快乐”，风格喜庆简约，加入灯笼和烟花元素',
  },
  {
    label: '放假通知',
    prompt: '做一个元旦放假通知海报，主标题写“元旦放假通知”，加入日历和红包元素，排版清晰',
  },
  {
    label: '红金风格',
    prompt: '生成一个红金配色的节日海报，主标题醒目，整体简洁高级，适合社交媒体封面',
  },
];

export default function QuickActions({ onSelectAction, disabled }: QuickActionsProps) {
  return (
    <div className="quick-actions">
      {quickActions.map((action) => (
        <Button
          key={action.label}
          type="text"
          size="small"
          disabled={disabled}
          onClick={() => onSelectAction(action.prompt)}
          className="quick-action-btn"
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}
