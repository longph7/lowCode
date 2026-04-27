import apiClient, { getAPIBaseURL } from './client';
import type { ComponentNode } from '../editor/stores/new-components';
import type { ComponentPatch, ToolCall } from '../editor/utils/ai-utils';

export interface GeneratePosterRequest {
  prompt: string;
  size?: string;
  style?: string;
}

export interface GeneratePosterResponse {
  ok: boolean;
  provider: 'mock' | 'llm' | string;
  nodes: ComponentNode[];
  error?: string;
}

export async function generatePoster(
  request: GeneratePosterRequest
): Promise<GeneratePosterResponse> {
  return apiClient.post('/ai/generate-poster', request);
}

export interface PosterSSEHandlers {
  onContent?: (content: string) => void;
  onContentDelta?: (delta: string) => void;
  onToolCall?: (toolCall: ToolCall) => void;
  onToolResult?: (toolCallId: string, result: any) => void;
  onComponent?: (components: ComponentNode[]) => void;
  onComponentPatch?: (patch: ComponentPatch) => void;
  onComponentSnapshot?: (components: ComponentNode[]) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

export function streamGeneratePoster(
  request: GeneratePosterRequest,
  handlers: PosterSSEHandlers
): () => void {
  const params = new URLSearchParams({
    prompt: request.prompt,
    size: request.size || '1080x1920',
    style: request.style || 'festival',
  });

  const eventSource = new EventSource(
    `${getAPIBaseURL()}/ai/generate-poster/stream?${params.toString()}`
  );

  eventSource.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);

      switch (payload.type) {
        case 'content':
          handlers.onContent?.(payload.data.content);
          break;
        case 'content_delta':
          handlers.onContentDelta?.(payload.data.delta);
          break;
        case 'tool_call':
          handlers.onToolCall?.(payload.data);
          break;
        case 'tool_result':
          handlers.onToolResult?.(payload.data.toolCallId, payload.data.result);
          break;
        case 'component':
          handlers.onComponent?.(payload.data.components || payload.data);
          break;
        case 'component_patch':
          handlers.onComponentPatch?.(payload.data);
          break;
        case 'component_snapshot':
          handlers.onComponentSnapshot?.(payload.data.components || payload.data);
          break;
        case 'done':
          handlers.onDone?.();
          eventSource.close();
          break;
        case 'error':
          handlers.onError?.(new Error(payload.data.message || 'Unknown SSE error'));
          eventSource.close();
          break;
        default:
          break;
      }
    } catch (error) {
      handlers.onError?.(error instanceof Error ? error : new Error('Failed to parse SSE message'));
      eventSource.close();
    }
  };

  eventSource.onerror = () => {
    handlers.onError?.(new Error('SSE connection failed'));
    eventSource.close();
  };

  return () => eventSource.close();
}
