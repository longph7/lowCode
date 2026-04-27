import { type ComponentNode } from '../stores/new-components';

/**
 * 生成消息 ID
 */
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * 生成工具调用 ID
 */
export function generateToolCallId(): string {
  return `tool_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * AI 消息接口
 */
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  toolCalls?: ToolCall[];
  componentGenerated?: ComponentNode[];
}

/**
 * 工具调用接口
 */
export interface ToolCall {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
}

export interface ComponentPatch {
  op: 'upsert' | 'remove';
  node?: ComponentNode;
  nodeId?: string;
}

/**
 * SSE 事件接口
 */
export interface SSEEvent {
  type:
    | 'content'
    | 'content_delta'
    | 'tool_call'
    | 'tool_result'
    | 'component'
    | 'component_patch'
    | 'component_snapshot'
    | 'done'
    | 'error';
  data: any;
}

export function applyComponentPatch(
  nodes: ComponentNode[],
  patch: ComponentPatch
): ComponentNode[] {
  if (patch.op === 'remove') {
    if (!patch.nodeId) {
      return nodes;
    }

    return nodes.filter((node) => node.id !== patch.nodeId);
  }

  if (!patch.node) {
    return nodes;
  }

  const nextNodes = [...nodes];
  const index = nextNodes.findIndex((node) => node.id === patch.node?.id);

  if (index === -1) {
    nextNodes.push(patch.node);
    return nextNodes;
  }

  nextNodes[index] = patch.node;
  return nextNodes;
}

/**
 * 格式化 AI 消息内容
 */
export function formatAIMessage(content: string, toolCalls?: ToolCall[]): string {
  // 简单实现，后续可以扩展支持 Markdown 解析
  let formatted = content;

  // 处理代码块
  formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>');

  // 处理行内代码
  formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // 处理工具调用
  if (toolCalls && toolCalls.length > 0) {
    formatted += '\n\n**工具调用：**\n';
    toolCalls.forEach(tc => {
      const statusIcon = tc.status === 'completed' ? '✓' : tc.status === 'failed' ? '✗' : '⟳';
      formatted += `- ${statusIcon} ${tc.name}\n`;
    });
  }

  return formatted;
}

/**
 * 清理 AI 返回的内容
 */
export function sanitizeAIContent(content: string): string {
  // 移除可能有害的内容
  let sanitized = content;

  // 移除 HTML 标签（如果需要纯文本）
  // sanitized = sanitized.replace(/<[^>]*>/g, '');

  // 移除脚本标签
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  return sanitized;
}

/**
 * 创建系统提示词
 */
export function buildSystemPrompt(): string {
  return `You are an AI assistant for a low-code editor. Your role is to help users generate web pages and components.

Available components: Page, Container, Div, Text, Header, Input, Button, Image, TextArea, Select, RadioGroup, CheckboxGroup.

Component structure:
{
  id: string;
  type: string;
  props: Record<string, any>;
  position: { x, y, width, height, zIndex? };
  parentId?: string;
}

When asked to generate a page or component, use the 'generate_components' tool to create component structure.
When asked to modify a component, use the 'modify_component' tool.
When asked to optimize layout, use the 'optimize_layout' tool.

Always respond in a helpful, conversational manner while performing the requested actions.`;
}

/**
 * 可用工具列表
 */
export function getAvailableTools(): any[] {
  return [
    {
      type: 'function',
      function: {
        name: 'generate_components',
        description: 'Generate new components based on user description',
        parameters: {
          type: 'object',
          properties: {
            description: {
              type: 'string',
              description: 'Description of components to generate',
            },
            components: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  props: { type: 'object' },
                  position: { type: 'object' },
                },
              },
            },
          },
          required: ['description', 'components'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'modify_component',
        description: 'Modify an existing component',
        parameters: {
          type: 'object',
          properties: {
            componentId: { type: 'string' },
            updates: { type: 'object' },
          },
          required: ['componentId', 'updates'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'optimize_layout',
        description: 'Optimize layout of existing components',
        parameters: {
          type: 'object',
          properties: {
            targetComponentId: { type: 'string' },
            optimizationType: {
              type: 'string',
              enum: ['alignment', 'spacing', 'hierarchy'],
            },
          },
          required: ['targetComponentId', 'optimizationType'],
        },
      },
    },
  ];
}
