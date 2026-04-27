import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { type ComponentNode } from './new-components';
import {
  applyComponentPatch,
  type AIMessage,
  type ComponentPatch,
  type ToolCall,
  type SSEEvent,
  generateMessageId,
  generateToolCallId,
} from '../utils/ai-utils';

interface AIState {
  messages: AIMessage[];
  isStreaming: boolean;
  rawStreamingContent: string;
  visibleStreamingContent: string;
  currentToolCalls: ToolCall[];
  generatedComponents: ComponentNode[];
  pendingComponents: ComponentNode[] | null;
  dialogOpen: boolean;
  dialogPosition: { x: number; y: number };
  dialogSize: { width: number; height: number };
  dialogMinimized: boolean;
  generationHistory: {
    prompt: string;
    components: ComponentNode[];
    timestamp: number;
  }[];
}

interface AIActions {
  addUserMessage: (content: string) => void;
  startAssistantResponse: () => void;
  appendContentDelta: (content: string) => void;
  endAssistantResponse: () => void;
  addSystemMessage: (content: string) => void;
  clearMessages: () => void;
  retryLastMessage: () => void;
  addToolCall: (toolCall: ToolCall) => void;
  updateToolCall: (id: string, updates: Partial<ToolCall>) => void;
  clearToolCalls: () => void;
  setGeneratedComponents: (components: ComponentNode[]) => void;
  setPendingComponents: (components: ComponentNode[] | null) => void;
  applyPendingComponentPatch: (patch: ComponentPatch) => void;
  clearPendingComponents: () => void;
  clearGeneratedComponents: () => void;
  toggleDialog: () => void;
  setDialogOpen: (open: boolean) => void;
  setDialogPosition: (position: { x: number; y: number }) => void;
  setDialogSize: (size: { width: number; height: number }) => void;
  toggleMinimize: () => void;
  addToGenerationHistory: (entry: {
    prompt: string;
    components: ComponentNode[];
    timestamp: number;
  }) => void;
  clearGenerationHistory: () => void;
}

type AIStore = AIState & AIActions;

const defaultState: AIState = {
  messages: [],
  isStreaming: false,
  rawStreamingContent: '',
  visibleStreamingContent: '',
  currentToolCalls: [],
  generatedComponents: [],
  pendingComponents: null,
  dialogOpen: false,
  dialogPosition: { x: 20, y: 20 },
  dialogSize: { width: 400, height: 600 },
  dialogMinimized: false,
  generationHistory: [],
};

const TYPEWRITER_CHUNK_SIZE = 3;
const TYPEWRITER_FRAME_MS = 24;

let typewriterTimer: number | null = null;

function deepEqual(obj1: unknown, obj2: unknown): boolean {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return obj1 === obj2;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;

  const keys1 = Object.keys(obj1 as Record<string, unknown>);
  const keys2 = Object.keys(obj2 as Record<string, unknown>);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (
      !deepEqual(
        (obj1 as Record<string, unknown>)[key],
        (obj2 as Record<string, unknown>)[key]
      )
    ) {
      return false;
    }
  }

  return true;
}

function throttle<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (lastArgs && deepEqual(args, lastArgs)) {
      return;
    }

    if (now - lastCall >= delay) {
      lastCall = now;
      lastArgs = args;
      func(...args);
      return;
    }

    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(() => {
      if (!lastArgs || !deepEqual(args, lastArgs)) {
        lastCall = Date.now();
        lastArgs = args;
        func(...args);
      }
      timeoutId = null;
    }, delay - (now - lastCall));
  };
}

function stopTypewriterTimer() {
  if (typewriterTimer !== null) {
    clearTimeout(typewriterTimer);
    typewriterTimer = null;
  }
}

function scheduleTypewriter(
  get: () => AIStore,
  set: (partial: Partial<AIStore>) => void
) {
  if (typeof window === 'undefined' || typewriterTimer !== null) {
    return;
  }

  typewriterTimer = window.setTimeout(() => {
    typewriterTimer = null;

    const state = get();
    if (state.visibleStreamingContent.length >= state.rawStreamingContent.length) {
      return;
    }

    const nextChunk = state.rawStreamingContent.slice(
      state.visibleStreamingContent.length,
      state.visibleStreamingContent.length + TYPEWRITER_CHUNK_SIZE
    );

    set({
      visibleStreamingContent: state.visibleStreamingContent + nextChunk,
    });

    const nextState = get();
    if (
      nextState.visibleStreamingContent.length < nextState.rawStreamingContent.length ||
      nextState.isStreaming
    ) {
      scheduleTypewriter(get, set);
    }
  }, TYPEWRITER_FRAME_MS);
}

export const useAIStore = create<AIStore>()(
  subscribeWithSelector((set, get) => ({
    ...defaultState,

    addUserMessage: (content) => {
      const message: AIMessage = {
        id: generateMessageId(),
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      set((state) => ({
        messages: [...state.messages, message],
      }));
    },

    startAssistantResponse: () => {
      stopTypewriterTimer();
      set({
        isStreaming: true,
        rawStreamingContent: '',
        visibleStreamingContent: '',
        currentToolCalls: [],
        pendingComponents: [],
      });
    },

    appendContentDelta: (content) => {
      if (!content) {
        return;
      }

      set((state) => ({
        rawStreamingContent: state.rawStreamingContent + content,
      }));
      scheduleTypewriter(get, (partial) => set(partial));
    },

    endAssistantResponse: () => {
      stopTypewriterTimer();
      const state = get();

      if (state.rawStreamingContent || state.currentToolCalls.length > 0) {
        const message: AIMessage = {
          id: generateMessageId(),
          role: 'assistant',
          content: state.rawStreamingContent,
          timestamp: Date.now(),
          toolCalls: state.currentToolCalls,
        };

        set((currentState) => ({
          ...currentState,
          messages: [...currentState.messages, message],
          isStreaming: false,
          rawStreamingContent: '',
          visibleStreamingContent: '',
          currentToolCalls: [],
        }));
        return;
      }

      set({
        isStreaming: false,
        rawStreamingContent: '',
        visibleStreamingContent: '',
        currentToolCalls: [],
      });
    },

    addSystemMessage: (content) => {
      const message: AIMessage = {
        id: generateMessageId(),
        role: 'system',
        content,
        timestamp: Date.now(),
      };

      set((state) => ({
        messages: [...state.messages, message],
      }));
    },

    clearMessages: () => {
      stopTypewriterTimer();
      set({
        messages: [],
        rawStreamingContent: '',
        visibleStreamingContent: '',
        currentToolCalls: [],
        generatedComponents: [],
        pendingComponents: null,
      });
    },

    retryLastMessage: () => {
      const state = get();
      const lastUserMessage = [...state.messages].reverse().find((message) => message.role === 'user');

      if (!lastUserMessage) {
        return;
      }

      set({
        messages: state.messages.filter((message) => message.id !== lastUserMessage.id),
      });
    },

    addToolCall: (toolCall) => {
      const callWithId = toolCall.id || generateToolCallId();
      set((state) => ({
        currentToolCalls: [...state.currentToolCalls, { ...toolCall, id: callWithId }],
      }));
    },

    updateToolCall: (id, updates) => {
      set((state) => ({
        currentToolCalls: state.currentToolCalls.map((toolCall) =>
          toolCall.id === id ? { ...toolCall, ...updates } : toolCall
        ),
      }));
    },

    clearToolCalls: () => {
      set({
        currentToolCalls: [],
      });
    },

    setGeneratedComponents: (components) => {
      set({
        generatedComponents: components,
      });
    },

    setPendingComponents: (components) => {
      set({
        pendingComponents: components,
      });
    },

    applyPendingComponentPatch: (patch) => {
      set((state) => ({
        pendingComponents: applyComponentPatch(state.pendingComponents ?? [], patch),
      }));
    },

    clearPendingComponents: () => {
      set({
        pendingComponents: null,
      });
    },

    clearGeneratedComponents: () => {
      set({
        generatedComponents: [],
        pendingComponents: null,
      });
    },

    toggleDialog: () => {
      set((state) => ({
        dialogOpen: !state.dialogOpen,
      }));
    },

    setDialogOpen: (open) => {
      set({
        dialogOpen: open,
      });
    },

    setDialogPosition: (position) => {
      set({
        dialogPosition: position,
      });
    },

    setDialogSize: (size) => {
      set({
        dialogSize: size,
      });
    },

    toggleMinimize: () => {
      set((state) => ({
        dialogMinimized: !state.dialogMinimized,
      }));
    },

    addToGenerationHistory: (entry) => {
      set((state) => ({
        generationHistory: [entry, ...state.generationHistory],
      }));
    },

    clearGenerationHistory: () => {
      set({
        generationHistory: [],
      });
    },
  }))
);

export const selectMessages = (state: AIStore) => state.messages;

export const selectLastMessage = (state: AIStore) => {
  return state.messages[state.messages.length - 1] || null;
};

export const selectUserMessages = (state: AIStore) => {
  return state.messages.filter((message) => message.role === 'user');
};

export const selectAssistantMessages = (state: AIStore) => {
  return state.messages.filter((message) => message.role === 'assistant');
};

export const selectHasRunningToolCalls = (state: AIStore) => {
  return state.currentToolCalls.some((toolCall) => toolCall.status === 'running');
};

export const selectCompletedToolCalls = (state: AIStore) => {
  return state.currentToolCalls.filter((toolCall) => toolCall.status === 'completed').length;
};

export const debugAIStore = () => {
  const state = useAIStore.getState();
  console.log('[AI Store Debug]', state);
  return state;
};

export const resetAIStore = () => {
  stopTypewriterTimer();
  useAIStore.setState(defaultState);
};

export const applySSEEventThrottled = throttle((event: SSEEvent) => {
  console.log('[AI SSE Event]', event.type, event.data);
}, 100);
