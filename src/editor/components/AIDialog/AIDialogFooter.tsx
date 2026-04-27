import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Button } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import QuickActions from './QuickActions';
import './AIDialog.css';

interface AIDialogFooterProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export default function AIDialogFooter({
  onSendMessage,
  disabled,
}: AIDialogFooterProps) {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整文本域高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInputValue(prompt);
    onSendMessage(prompt);
    setInputValue('');
  };

  return (
    <div className="ai-dialog-footer">
      {/* 快捷操作 */}
      <QuickActions
        onSelectAction={handleQuickAction}
        disabled={disabled}
      />

      {/* 输入区域 */}
      <div className="input-area">
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="描述你想要的页面，如：生成一个登录页面..."
          disabled={disabled}
          rows={1}
          className="ai-input"
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          disabled={disabled || !inputValue.trim()}
          className="send-button"
        >
          发送
        </Button>
      </div>
    </div>
  );
}
