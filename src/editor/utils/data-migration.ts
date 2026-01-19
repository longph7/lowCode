import { type ComponentNode, type Position } from '../stores/new-components';
import { type Component } from '../stores/components';

/**
 * 将旧版组件数据结构转换为新版节点数据结构
 */
export function migrateComponentToNode(component: Component, parentId?: string): ComponentNode {
  // 生成新的字符串ID
  const newId = `node_${component.id.toString()}`;
  const newParentId = parentId ? `node_${parentId}` : undefined;

  // 创建默认位置信息（可以根据需要调整默认值）
  const defaultPosition: Position = {
    x: component.position?.x || 20, // 默认位置
    y: component.position?.y || 20,
    width: 200, // 默认宽度
    height: 50, // 默认高度
    zIndex: 1
  };

  // 特定组件类型的默认尺寸
  switch (component.name) {
    case 'Page':
      defaultPosition.width = component.props.width || 800;
      defaultPosition.height = component.props.height || 600;
      break;
    case 'Container':
      defaultPosition.width = component.props.width || 300;
      defaultPosition.height = component.props.height || 200;
      break;
    case 'Button':
      defaultPosition.width = component.props.width || 100;
      defaultPosition.height = component.props.height || 40;
      break;
    case 'Text':
      defaultPosition.width = component.props.width || 200;
      defaultPosition.height = component.props.height || 30;
      break;
    case 'Header':
      defaultPosition.width = component.props.width || 300;
      defaultPosition.height = component.props.height || 40;
      break;
    case 'Input':
      defaultPosition.width = component.props.width || 200;
      defaultPosition.height = component.props.height || 32;
      break;
    case 'Div':
      defaultPosition.width = component.props.width || 250;
      defaultPosition.height = component.props.height || 100;
      break;
    default:
      // 对于其他组件类型，使用默认尺寸
      break;
  }

  return {
    id: newId,
    type: component.name, // 从 name 改为 type
    props: component.props || {},
    position: defaultPosition,
    parentId: newParentId
  };
}

/**
 * 递归转换组件树为扁平化的节点数组
 */
export function migrateComponentTreeToNodes(
  components: Component[], 
  parentId?: string
): ComponentNode[] {
  let nodes: ComponentNode[] = [];

  for (const component of components) {
    // 转换当前组件
    const node = migrateComponentToNode(component, parentId);
    nodes.push(node);

    // 递归转换子组件
    if (component.children && component.children.length > 0) {
      const childNodes = migrateComponentTreeToNodes(component.children, node.id);
      nodes = [...nodes, ...childNodes];
    }
  }

  return nodes;
}

/**
 * 将旧版状态转换为新版状态
 */
export function migrateState(oldState: any): { nodes: ComponentNode[], curNodeId: string | null, curNode: ComponentNode | null, mode: 'edit' | 'preview' } {
  // 转换组件树为节点数组
  const nodes = migrateComponentTreeToNodes(oldState.components || []);

  // 转换当前选中的组件ID
  const curNodeId = oldState.curComponentId ? `node_${oldState.curComponentId.toString()}` : null;

  // 如果有当前选中的组件，也转换它
  let curNode: ComponentNode | null = null;
  if (oldState.curComponent) {
    curNode = migrateComponentToNode(oldState.curComponent, oldState.curComponent.parentId?.toString());
  }

  return {
    nodes,
    curNodeId,
    curNode,
    mode: oldState.mode || 'edit'
  };
}

/**
 * 将新的节点数据结构转换回旧版组件结构（用于兼容性）
 */
export function convertNodeToComponent(node: ComponentNode): Component {
  return {
    id: parseInt(node.id.replace('node_', '')) || 1,
    name: node.type, // 从 type 改回 name
    props: node.props,
    desc: node.type, // 使用类型作为描述
    parentId: node.parentId ? parseInt(node.parentId.replace('node_', '')) : undefined,
    position: {
      x: node.position.x,
      y: node.position.y
    }
  };
}

/**
 * 从节点数组重建组件树结构
 */
export function convertNodesToComponentTree(nodes: ComponentNode[]): Component[] {
  // 首先创建一个映射，方便查找节点
  const nodeMap = new Map<string, ComponentNode>();
  nodes.forEach(node => {
    nodeMap.set(node.id, node);
  });

  // 找到所有根节点（没有父节点的节点）
  const rootNodes = nodes.filter(node => !node.parentId);

  // 递归构建树结构
  function buildTree(nodeList: ComponentNode[]): Component[] {
    return nodeList.map(node => {
      const component = convertNodeToComponent(node);
      
      // 找到当前节点的所有子节点
      const childNodes = nodes.filter(child => child.parentId === node.id);
      
      if (childNodes.length > 0) {
        component.children = buildTree(childNodes);
      }
      
      return component;
    });
  }

  return buildTree(rootNodes);
}