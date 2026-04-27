import { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAIStore } from '../../stores/ai-store';
import { useComponentsStore } from '../../stores/new-components';
import { validateComponents } from '../../utils/component-injector';
import { streamGeneratePoster } from '../../../api/poster';
import AIDialogHeader from './AIDialogHeader';
import AIDialogContent from './AIDialogContent';
import AIDialogFooter from './AIDialogFooter';
import './AIDialog.css';

interface AIDialogProps {
  open?: boolean;
  onClose?: () => void;
  defaultPosition?: { x: number; y: number };
}

export default function AIDialog({
  open = true,
  onClose,
  defaultPosition = { x: 20, y: 20 },
}: AIDialogProps) {
  const {
    dialogOpen,
    dialogPosition,
    dialogSize,
    dialogMinimized,
    toggleDialog,
    setDialogPosition,
    setDialogSize,
    toggleMinimize,
    addUserMessage,
    startAssistantResponse,
    appendContentDelta,
    endAssistantResponse,
    setGeneratedComponents,
    setPendingComponents,
    applyPendingComponentPatch,
    clearPendingComponents,
    addToGenerationHistory,
    addToolCall,
    updateToolCall,
    clearToolCalls,
  } = useAIStore();
  const replaceNodes = useComponentsStore((state) => state.replaceNodes);

  const [localPosition, setLocalPosition] = useState(defaultPosition);
  const [localSize, setLocalSize] = useState({ width: 400, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const streamCleanupRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    if (dialogOpen !== open) {
      toggleDialog();
    }
  }, [open, dialogOpen, toggleDialog]);

  useEffect(() => {
    setLocalPosition(dialogPosition);
  }, [dialogPosition]);

  useEffect(() => {
    setLocalSize(dialogSize);
  }, [dialogSize]);

  const stopCurrentStream = useCallback(() => {
    if (streamCleanupRef.current) {
      streamCleanupRef.current();
      streamCleanupRef.current = null;
    }
  }, []);

  const commitPendingComponents = useCallback(
    (prompt: string) => {
      const pendingComponents = useAIStore.getState().pendingComponents;
      if (!pendingComponents || pendingComponents.length === 0) {
        return;
      }

      const result = validateComponents(pendingComponents);
      if (!result.valid) {
        throw new Error(result.errors.join('\n'));
      }

      replaceNodes(pendingComponents);
      setGeneratedComponents(pendingComponents);
      addToGenerationHistory({
        prompt,
        components: pendingComponents,
        timestamp: Date.now(),
      });
    },
    [addToGenerationHistory, replaceNodes, setGeneratedComponents]
  );

  const handleSendMessage = useCallback(
    (content: string) => {
      stopCurrentStream();
      clearPendingComponents();
      clearToolCalls();
      addUserMessage(content);
      startAssistantResponse();
      setIsGenerating(true);

      streamCleanupRef.current = streamGeneratePoster(
        {
          prompt: content,
          size: '1080x1920',
          style: 'festival',
        },
        {
          onContent: (streamingContent) => {
            appendContentDelta(streamingContent);
          },
          onContentDelta: (delta) => {
            appendContentDelta(delta);
          },
          onToolCall: (toolCall) => {
            addToolCall(toolCall);
          },
          onToolResult: (toolCallId, result) => {
            updateToolCall(toolCallId, {
              status: result?.error ? 'failed' : 'completed',
              result,
            });
          },
          onComponent: (components) => {
            const result = validateComponents(components);
            if (!result.valid) {
              throw new Error(result.errors.join('\n'));
            }

            setPendingComponents(components);
          },
          onComponentSnapshot: (components) => {
            const result = validateComponents(components);
            if (!result.valid) {
              throw new Error(result.errors.join('\n'));
            }

            setPendingComponents(components);
          },
          onComponentPatch: (patch) => {
            applyPendingComponentPatch(patch);
          },
          onDone: () => {
            commitPendingComponents(content);
            clearPendingComponents();
            endAssistantResponse();
            setIsGenerating(false);
            streamCleanupRef.current = null;
          },
          onError: (error) => {
            console.error('[AIDialog] SSE generate failed:', error);
            clearPendingComponents();
            appendContentDelta(`生成失败：${error.message}`);
            endAssistantResponse();
            setIsGenerating(false);
            streamCleanupRef.current = null;
          },
        }
      );
    },
    [
      addToolCall,
      addUserMessage,
      appendContentDelta,
      applyPendingComponentPatch,
      clearPendingComponents,
      clearToolCalls,
      commitPendingComponents,
      endAssistantResponse,
      startAssistantResponse,
      stopCurrentStream,
      updateToolCall,
      setPendingComponents,
    ]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleDialog();
      }
      if (e.key === 'Escape' && dialogOpen) {
        onClose?.();
        toggleDialog();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dialogOpen, toggleDialog, onClose]);

  useEffect(() => {
    const handle = dragHandleRef.current;
    if (!handle) return;

    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;

      dragging = true;
      const rect = dialogRef.current?.getBoundingClientRect();
      if (rect) {
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
      }
      setIsDragging(true);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return;

      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;
      const maxX = window.innerWidth - localSize.width;
      const maxY = window.innerHeight - localSize.height;

      const newPosition = {
        x: Math.max(0, Math.min(x, maxX)),
        y: Math.max(0, Math.min(y, maxY)),
      };

      setLocalPosition(newPosition);
      setDialogPosition(newPosition);
    };

    const onMouseUp = () => {
      dragging = false;
      setIsDragging(false);
    };

    handle.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      handle.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [localSize, setDialogPosition]);

  useEffect(() => {
    const handle = resizeHandleRef.current;
    if (!handle) return;

    let resizing = false;
    let startX = 0;
    let startY = 0;
    let startWidth = 0;
    let startHeight = 0;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;

      e.preventDefault();
      resizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = localSize.width;
      startHeight = localSize.height;
      setIsResizing(true);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!resizing) return;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      const newWidth = Math.max(300, Math.min(window.innerWidth - 40, startWidth + deltaX));
      const newHeight = Math.max(400, Math.min(window.innerHeight - 40, startHeight - deltaY));

      const newSize = { width: newWidth, height: newHeight };
      setLocalSize(newSize);
      setDialogSize(newSize);
    };

    const onMouseUp = () => {
      resizing = false;
      setIsResizing(false);
    };

    handle.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      handle.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [localSize, setDialogSize]);

  useEffect(() => {
    return () => {
      stopCurrentStream();
      clearPendingComponents();
    };
  }, [clearPendingComponents, stopCurrentStream]);

  if (!dialogOpen) {
    return null;
  }

  if (dialogMinimized) {
    return createPortal(
      <div
        className="ai-dialog-minimized"
        style={{
          position: 'fixed',
          right: `${localPosition.x}px`,
          bottom: `${localPosition.y}px`,
          zIndex: 9999,
        }}
        onClick={toggleMinimize}
      >
        <span className="minimized-icon">AI</span>
        <span className="minimized-text">AI</span>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div
      ref={dialogRef}
      className="ai-dialog"
      style={{
        position: 'fixed',
        right: `${localPosition.x}px`,
        bottom: `${localPosition.y}px`,
        width: `${localSize.width}px`,
        height: `${localSize.height}px`,
        zIndex: 9999,
      }}
    >
      <div
        ref={dragHandleRef}
        id="ai-dialog-header"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <AIDialogHeader
          onMinimize={toggleMinimize}
          onClose={onClose}
          onExpand={toggleMinimize}
          isMinimized={dialogMinimized}
        />
      </div>

      <AIDialogContent />

      <AIDialogFooter
        onSendMessage={handleSendMessage}
        disabled={isGenerating}
      />

      <div
        ref={resizeHandleRef}
        className="resize-handle"
        style={{ cursor: isResizing ? 'nwse-resize' : 'nwse-resize' }}
      />
    </div>,
    document.body
  );
}

export { AIDialog };
