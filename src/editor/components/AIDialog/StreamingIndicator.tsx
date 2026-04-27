import './AIDialog.css';

interface StreamingIndicatorProps {
  content: string;
}

export default function StreamingIndicator({ content }: StreamingIndicatorProps) {
  return (
    <div className="streaming-indicator">
      {/* 光标闪烁效果 */}
      <span className="cursor">▊</span>
      <span
        className="streaming-content"
        dangerouslySetInnerHTML={{
          __html: content.replace(/\n/g, '<br/>'),
        }}
      />
    </div>
  );
}
