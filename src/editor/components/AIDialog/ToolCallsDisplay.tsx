import type { ToolCall } from '../../utils/ai-utils';
import './AIDialog.css';

interface ToolCallsDisplayProps {
  toolCalls: ToolCall[];
}

export default function ToolCallsDisplay({ toolCalls }: ToolCallsDisplayProps) {
  if (toolCalls.length === 0) {
    return null;
  }

  return (
    <div className="tool-calls-display">
      <div className="tool-calls-header">工具调用</div>
      {toolCalls.map((toolCall) => (
        <div key={toolCall.id} className="tool-call-card">
          <div className="tool-call-header">
            <span className="tool-name">{toolCall.name}</span>
            <span className={`tool-status status-${toolCall.status}`}>
              {toolCall.status === 'pending' && '等待中...'}
              {toolCall.status === 'running' && '执行中...'}
              {toolCall.status === 'completed' && '已完成'}
              {toolCall.status === 'failed' && '失败'}
            </span>
          </div>
          {toolCall.result && (
            <div className="tool-call-result">
              <pre>{JSON.stringify(toolCall.result, null, 2)}</pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
