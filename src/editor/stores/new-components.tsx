import { create } from 'zustand';
import { persist, createJSONStorage, subscribeWithSelector } from 'zustand/middleware';

export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number;
}

export interface ComponentNode {
  id: string;
  type: string;
  props: Record<string, any>;
  position: Position;
  parentId?: string;
}

export interface State {
  nodes: ComponentNode[];
  curNodeId: string | null;
  curNode: ComponentNode | null;
  mode: 'edit' | 'preview';
}

export interface Actions {
  addNode: (node: Omit<ComponentNode, 'id'>) => void;
  replaceNodes: (nodes: ComponentNode[]) => void;
  deleteNode: (nodeId: string) => void;
  clearCanvas: () => void;
  updateNode: (nodeId: string, updates: Partial<Omit<ComponentNode, 'id' | 'parentId'>>) => void;
  updateNodeThrottled: (
    nodeId: string,
    updates: Partial<Omit<ComponentNode, 'id' | 'parentId'>>
  ) => void;
  setCurNodeId: (nodeId: string | null) => void;
  setMode: (mode: 'edit' | 'preview') => void;
  updateCanvas: (updates: {
    width?: number;
    height?: number;
    backgroundColor?: string;
    preset?: string;
  }) => void;
}

const STORE_NAME = 'lowcode-poster-components';

function createDefaultRootNode(): ComponentNode {
  return {
    id: 'root_page',
    type: 'Page',
    props: {
      preset: 'poster_story',
      backgroundColor: '#ffffff',
    },
    position: { x: 0, y: 0, width: 1080, height: 1920 },
    parentId: undefined,
  };
}

function createDefaultState(): State {
  return {
    nodes: [createDefaultRootNode()],
    curNodeId: null,
    curNode: null,
    mode: 'edit',
  };
}

function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return obj1 === obj2;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}

function throttle<T extends (...args: any[]) => any>(
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

    if (timeoutId) {
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

const generateId = (): string => {
  return `node_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
};

export function getNodeById(id: string | null, nodes: ComponentNode[]): ComponentNode | null {
  if (id === null) {
    return null;
  }
  return nodes.find((node) => node.id === id) || null;
}

export function getChildNodes(parentId: string, nodes: ComponentNode[]): ComponentNode[] {
  return nodes.filter((node) => node.parentId === parentId);
}

export function getNodePath(id: string, nodes: ComponentNode[]): ComponentNode[] {
  const node = getNodeById(id, nodes);
  if (!node || !node.parentId) {
    return node ? [node] : [];
  }

  const path = getNodePath(node.parentId, nodes);
  path.push(node);
  return path;
}

function ensureValidState(state: Partial<State> | undefined): State {
  const fallback = createDefaultState();
  const rawNodes = Array.isArray(state?.nodes) ? state!.nodes : fallback.nodes;
  const hasRoot = rawNodes.some((node) => node.id === 'root_page');
  const nodes = hasRoot ? rawNodes : [createDefaultRootNode(), ...rawNodes];
  const curNodeId =
    state?.curNodeId && nodes.some((node) => node.id === state.curNodeId) ? state.curNodeId : null;

  return {
    nodes,
    curNodeId,
    curNode: getNodeById(curNodeId, nodes),
    mode: state?.mode === 'preview' ? 'preview' : 'edit',
  };
}

export const useComponentsStore = create<State & Actions>()(
  persist(
    subscribeWithSelector((set, get) => ({
      ...createDefaultState(),

      addNode: (nodeData) => {
        set((state) => ({
          nodes: [...state.nodes, { ...nodeData, id: generateId() }],
        }));
      },

      replaceNodes: (nodes) => {
        const nextState = ensureValidState({
          nodes,
          curNodeId: null,
          mode: get().mode,
        });

        set({
          nodes: nextState.nodes,
          curNodeId: null,
          curNode: null,
        });
      },

      deleteNode: (nodeId) => {
        set((state) => {
          const nodeIdsToDelete = getAllDescendantIds(nodeId, state.nodes);
          nodeIdsToDelete.push(nodeId);

          const updatedNodes = state.nodes.filter((node) => !nodeIdsToDelete.includes(node.id));
          const nextCurNodeId = nodeIdsToDelete.includes(state.curNodeId || '') ? null : state.curNodeId;

          return {
            nodes: updatedNodes,
            curNodeId: nextCurNodeId,
            curNode: getNodeById(nextCurNodeId, updatedNodes),
          };
        });
      },

      clearCanvas: () => {
        set((state) => {
          const rootNode =
            state.nodes.find((node) => node.id === 'root_page') || createDefaultRootNode();

          return {
            nodes: [rootNode],
            curNodeId: null,
            curNode: null,
          };
        });
      },

      updateNode: (nodeId, updates) => {
        set((state) => {
          const nodeIndex = state.nodes.findIndex((node) => node.id === nodeId);
          if (nodeIndex === -1) {
            return state;
          }

          const node = state.nodes[nodeIndex];
          const updatedNode = { ...node, ...updates };
          const hasChanges = Object.keys(updates).some(
            (key) =>
              !deepEqual(
                node[key as keyof ComponentNode],
                updatedNode[key as keyof ComponentNode]
              )
          );

          if (!hasChanges) {
            return state;
          }

          const newNodes = [...state.nodes];
          newNodes[nodeIndex] = updatedNode;

          return {
            nodes: newNodes,
            curNode: state.curNodeId === nodeId ? updatedNode : state.curNode,
          };
        });
      },

      updateNodeThrottled: throttle(
        (nodeId: string, updates: Partial<Omit<ComponentNode, 'id' | 'parentId'>>) => {
          get().updateNode(nodeId, updates);
        },
        100
      ),

      setCurNodeId: (nodeId) => {
        set((state) => {
          if (state.curNodeId === nodeId) {
            return state;
          }

          return {
            ...state,
            curNodeId: nodeId,
            curNode: getNodeById(nodeId, state.nodes),
          };
        });
      },

      setMode: (mode) => {
        set((state) => {
          if (mode === 'preview') {
            return {
              ...state,
              mode,
              curNodeId: null,
              curNode: null,
            };
          }

          return {
            ...state,
            mode,
          };
        });
      },

      updateCanvas: (updates) => {
        set((state) => {
          const rootIndex = state.nodes.findIndex((node) => node.id === 'root_page');
          if (rootIndex === -1) {
            return state;
          }

          const rootNode = state.nodes[rootIndex];
          const nextRootNode: ComponentNode = {
            ...rootNode,
            props: {
              ...rootNode.props,
              ...(updates.backgroundColor !== undefined
                ? { backgroundColor: updates.backgroundColor }
                : {}),
              ...(updates.preset !== undefined ? { preset: updates.preset } : {}),
            },
            position: {
              ...rootNode.position,
              ...(updates.width !== undefined ? { width: updates.width } : {}),
              ...(updates.height !== undefined ? { height: updates.height } : {}),
            },
          };

          const nextNodes = [...state.nodes];
          nextNodes[rootIndex] = nextRootNode;

          return {
            nodes: nextNodes,
            curNode: state.curNodeId === 'root_page' ? nextRootNode : state.curNode,
          };
        });
      },
    })),
    {
      name: STORE_NAME,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        nodes: state.nodes,
        curNodeId: state.curNodeId,
        mode: state.mode,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...ensureValidState(persistedState as Partial<State> | undefined),
      }),
    }
  )
);

function getAllDescendantIds(parentId: string, nodes: ComponentNode[]): string[] {
  const descendantIds: string[] = [];
  const directChildren = nodes.filter((node) => node.parentId === parentId);

  for (const child of directChildren) {
    descendantIds.push(child.id);
    descendantIds.push(...getAllDescendantIds(child.id, nodes));
  }

  return descendantIds;
}
