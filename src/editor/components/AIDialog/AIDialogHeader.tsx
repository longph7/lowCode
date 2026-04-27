import { MinusOutlined, CloseOutlined, ExpandOutlined } from '@ant-design/icons';
import './AIDialog.css';

interface AIDialogHeaderProps {
  onMinimize?: () => void;
  onClose?: () => void;
  onExpand?: () => void;
  isMinimized?: boolean;
}

export default function AIDialogHeader({
  onMinimize,
  onClose,
  onExpand,
  isMinimized,
}: AIDialogHeaderProps) {
  return (
    <div className="ai-dialog-header">
      <div className="ai-dialog-title">
        <span className="ai-icon">🤖</span>
        <span>AI 助手</span>
      </div>
      <div className="ai-dialog-controls">
        {onMinimize && !isMinimized && (
          <button
            className="control-btn control-minimize"
            onClick={onMinimize}
            title="最小化"
          >
            <MinusOutlined />
          </button>
        )}
        {onExpand && isMinimized && (
          <button
            className="control-btn control-expand"
            onClick={onExpand}
            title="展开"
          >
            <ExpandOutlined />
          </button>
        )}
        {onClose && (
          <button
            className="control-btn control-close"
            onClick={onClose}
            title="关闭"
          >
            <CloseOutlined />
          </button>
        )}
      </div>
    </div>
  );
}
