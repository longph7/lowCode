import React from 'react';
import { useAIStore, selectMessages } from '../../stores/ai-store';
import MessageBubble from './MessageBubble';
import StreamingIndicator from './StreamingIndicator';
import ToolCallsDisplay from './ToolCallsDisplay';
import './AIDialog.css';

interface AIDialogContentProps {
  className?: string;
}

export default function AIDialogContent({ className }: AIDialogContentProps) {
  const messages = useAIStore(selectMessages);
  const { isStreaming, visibleStreamingContent, currentToolCalls } = useAIStore();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, visibleStreamingContent]);

  return (
    <div className={`ai-dialog-content ${className || ''}`}>
      <div
        ref={scrollContainerRef}
        className="chat-scroll-container"
        style={{
          overflowY: 'auto',
          maxHeight: '400px',
        }}
      >
        {/* 聊天历史 */}
        <div className="chat-history">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* 流式响应指示器 */}
          {isStreaming && visibleStreamingContent && (
            <StreamingIndicator content={visibleStreamingContent} />
          )}

          {/* 当前工具调用显示 */}
          {currentToolCalls.length > 0 && (
            <ToolCallsDisplay toolCalls={currentToolCalls} />
          )}

          {/* 消息列表末尾锚点 */}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
