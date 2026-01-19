import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

// 新的位置接口
export interface Position { 
  x: number; 
  y: number; 
  width: number; 
  height: number; 
  zIndex?: number 
}

// 新的组件节点接口
export interface ComponentNode {
  id: string;
  type: string;  // 从 name 改为 type
  props: Record<string, any>;
  position: Position;
  parentId?: string;
}

// 新的状态接口
export interface State {
  nodes: ComponentNode[];  // 从 components 改为 nodes，扁平化存储
  curNodeId: string | null;  // 从 curComponentId 改为 curNodeId
  curNode: ComponentNode | null;  // 从 curComponent 改为 curNode
  mode: 'edit' | 'preview';
}

// 新的动作接口
export interface Actions {
  addNode: (node: Omit<ComponentNode, 'id'>) => void;
  deleteNode: (nodeId: string) => void;
  updateNode: (nodeId: string, updates: Partial<Omit<ComponentNode, 'id' | 'parentId'>>) => void;
  updateNodeThrottled: (nodeId: string, updates: Partial<Omit<ComponentNode, 'id' | 'parentId'>>) => void; // 节流版本
  setCurNodeId: (nodeId: string | null) => void;
  setMode: (mode: 'edit' | 'preview') => void;
}

// 深度比较对象是否相等
function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  
  if (obj1 == null || obj2 == null) return obj1 === obj2;
  
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (let key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
}

// 节流函数实现
function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    // 检查参数是否真正发生变化
    if (lastArgs && deepEqual(args, lastArgs)) {
      return;
    }
    
    if (now - lastCall >= delay) {
      lastCall = now;
      lastArgs = args;
      func(...args);
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        // 在延迟执行前再次检查参数是否变化
        if (!lastArgs || !deepEqual(args, lastArgs)) {
          lastCall = Date.now();
          lastArgs = args;
          func(...args);
        }
        timeoutId = null;
      }, delay - (now - lastCall));
    }
  };
}

// 生成唯一ID的辅助函数
const generateId = (): string => {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 根据ID获取节点的辅助函数
export function getNodeById(id: string | null, nodes: ComponentNode[]): ComponentNode | null {
  if (id === null) {
    return null;
  }
  return nodes.find(node => node.id === id) || null;
}

// 获取所有子节点的辅助函数
export function getChildNodes(parentId: string, nodes: ComponentNode[]): ComponentNode[] {
  return nodes.filter(node => node.parentId === parentId);
}

// 获取节点路径的辅助函数
export function getNodePath(id: string, nodes: ComponentNode[]): ComponentNode[] {
  const node = getNodeById(id, nodes);
  if (!node || !node.parentId) {
    return node ? [node] : [];
  }
  
  const path = getNodePath(node.parentId, nodes);
  path.push(node);
  return path;
}

export const useComponentsStore = create<State & Actions>()(
  subscribeWithSelector(
    (set, get) => ({
      nodes: [{
        id: 'root_page',
        type: 'Page',
        props: {},
        position: { x: 0, y: 0, width: 800, height: 600 },
        parentId: undefined
      }],
      curNodeId: null,
      curNode: null,
      mode: 'edit',
      
      addNode: (nodeData) => {
        set((state) => {
          const newNode: ComponentNode = {
            ...nodeData,
            id: generateId()
          };
          
          return {
            nodes: [...state.nodes, newNode]
          };
        });
      },
      
      deleteNode: (nodeId) => {
        set((state) => {
          // 删除目标节点及其所有子节点
          const nodeIdsToDelete = getAllDescendantIds(nodeId, state.nodes);
          nodeIdsToDelete.push(nodeId);
          
          const updatedNodes = state.nodes.filter(node => !nodeIdsToDelete.includes(node.id));
          
          // 如果被删除的是当前选中节点，则清除选中状态
          let newCurNodeId = state.curNodeId;
          let newCurNode = state.curNode;
          
          if (nodeIdsToDelete.includes(state.curNodeId!)) {
            newCurNodeId = null;
            newCurNode = null;
          }
          
          return {
            nodes: updatedNodes,
            curNodeId: newCurNodeId,
            curNode: newCurNode
          };
        });
      },
      
      updateNode: (nodeId, updates) => {
        set((state) => {
          const nodeIndex = state.nodes.findIndex(node => node.id === nodeId);
          if (nodeIndex === -1) {
            return state;
          }
          
          const node = state.nodes[nodeIndex];
          const updatedNode = { ...node, ...updates };
          
          // 检查是否有实际变化
          const hasChanges = Object.keys(updates).some(key => 
            !deepEqual(node[key as keyof ComponentNode], updatedNode[key as keyof ComponentNode])
          );
          
          if (!hasChanges) {
            return state;
          }
          
          const newNodes = [...state.nodes];
          newNodes[nodeIndex] = updatedNode;
          
          // 如果更新的是当前选中的节点，也要更新 curNode
          let newCurNode = state.curNode;
          if (state.curNodeId === nodeId) {
            newCurNode = updatedNode;
          }
          
          return {
            nodes: newNodes,
            curNode: newCurNode
          };
        });
      },
      
      updateNodeThrottled: throttle((nodeId: string, updates: Partial<Omit<ComponentNode, 'id' | 'parentId'>>) => {
        const { updateNode } = get();
        updateNode(nodeId, updates);
      }, 100),
      
      setCurNodeId: (nodeId) => {
        set((state) => {
          if (state.curNodeId === nodeId) {
            return state;
          }
          
          const newNode = getNodeById(nodeId, state.nodes);
          
          return {
            ...state,
            curNodeId: nodeId,
            curNode: newNode
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
              curNode: null
            };
          }
          return {
            ...state,
            mode
          };
        });
      },
    })
  )
);

// 获取所有后代节点ID的辅助函数
function getAllDescendantIds(parentId: string, nodes: ComponentNode[]): string[] {
  const descendantIds: string[] = [];
  const directChildren = nodes.filter(node => node.parentId === parentId);
  
  for (const child of directChildren) {
    descendantIds.push(child.id);
    descendantIds.push(...getAllDescendantIds(child.id, nodes));
  }
  
  return descendantIds;
}