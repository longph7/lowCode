import type { AIMessage } from '../../utils/ai-utils';
import './AIDialog.css';

interface MessageBubbleProps {
  message: AIMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  // 系统/助手消息不显示
  if (isSystem) {
    return null;
  }

  return (
    <div
      className={`message-bubble message-${message.role}`}
      style={{
        alignItems: isUser ? 'flex-end' : 'flex-start',
      }}
    >
      <div className="message-content">
        {/* 用户消息 */}
        {isUser && (
          <div className="message-label">你</div>
        )}

        {/* 助手消息 */}
        {!isUser && (
          <div className="message-label message-label-ai">AI</div>
        )}

        {/* 消息内容 */}
        <div
          className="message-text"
          dangerouslySetInnerHTML={{
            __html: message.content.replace(/\n/g, '<br/>'),
          }}
        />

        {/* 工具调用显示 */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="message-tool-calls">
            <div className="tool-calls-title">工具调用：</div>
            {message.toolCalls.map((toolCall) => (
              <div key={toolCall.id} className="tool-call-item">
                <span className={`tool-status status-${toolCall.status}`}>
                  {toolCall.status === 'completed' && '✓'}
                  {toolCall.status === 'failed' && '✗'}
                  {toolCall.status === 'running' && '⟳'}
                  {toolCall.status === 'pending' && '⏳'}
                </span>
                <span className="tool-name">{toolCall.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* 生成的组件信息 */}
        {message.componentGenerated && message.componentGenerated.length > 0 && (
          <div className="message-components">
            <div className="components-title">生成了 {message.componentGenerated.length} 个组件</div>
          </div>
        )}

        {/* 时间戳 */}
        <div className="message-timestamp">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
