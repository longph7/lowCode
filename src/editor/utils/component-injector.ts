import { type ComponentNode } from '../stores/new-components';

/**
 * 组件注入选项
 */
export interface InjectionOptions {
  parentId?: string;
  insertBeforeId?: string;
  replaceComponentId?: string;
  mergeStrategy?: 'replace' | 'append' | 'prepend';
}

/**
 * 组件验证结果
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 验证组件结构
 */
export function validateComponentStructure(component: ComponentNode): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 检查必需字段
  if (!component.id) {
    errors.push('Component must have an id');
  }

  if (!component.type) {
    errors.push('Component must have a type');
  }

  if (!component.props) {
    errors.push('Component must have props');
  }

  if (!component.position) {
    errors.push('Component must have a position');
  } else {
    if (typeof component.position.x !== 'number') {
      errors.push('Component position.x must be a number');
    }
    if (typeof component.position.y !== 'number') {
      errors.push('Component position.y must be a number');
    }
    if (typeof component.position.width !== 'number') {
      errors.push('Component position.width must be a number');
    }
    if (typeof component.position.height !== 'number') {
      errors.push('Component position.height must be a number');
    }
  }

  // 检查父组件是否存在（如果设置了 parentId）
  if (component.parentId && !component.id) {
    warnings.push('Component has parentId but no id - parent reference may be invalid');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 验证组件数组
 */
export function validateComponents(components: ComponentNode[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const ids = new Set<string>();

  components.forEach(component => {
    const result = validateComponentStructure(component);
    errors.push(...result.errors);
    warnings.push(...result.warnings);

    // 检查 ID 重复
    if (component.id && ids.has(component.id)) {
      errors.push(`Duplicate component id: ${component.id}`);
    }
    ids.add(component.id);
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 注入组件到现有节点数组
 */
export function injectComponents(
  existingNodes: ComponentNode[],
  newComponents: ComponentNode[],
  options: InjectionOptions = {}
): ComponentNode[] {
  const {
    parentId,
    insertBeforeId,
    replaceComponentId,
    mergeStrategy = 'append',
  } = options;

  // 验证新组件
  const validationResult = validateComponents(newComponents);
  if (!validationResult.valid) {
    console.error('[ComponentInjector] Invalid components:', validationResult.errors);
    return existingNodes; // 返回原数组，不进行注入
  }

  if (validationResult.warnings.length > 0) {
    console.warn('[ComponentInjector] Component warnings:', validationResult.warnings);
  }

  // 复制现有节点
  let result = [...existingNodes];

  // 替换策略
  if (replaceComponentId) {
    result = result.filter(node => node.id !== replaceComponentId);
  }

  // 为新组件设置父 ID
  const componentsWithParent = newComponents.map(comp => ({
    ...comp,
    parentId: parentId || comp.parentId,
  }));

  // 根据策略插入组件
  switch (mergeStrategy) {
    case 'replace':
      // 替换后追加
      result = [...result, ...componentsWithParent];
      break;

    case 'prepend':
      // 插入到前面
      if (insertBeforeId) {
        const insertIndex = result.findIndex(node => node.id === insertBeforeId);
        if (insertIndex !== -1) {
          result = [
            ...result.slice(0, insertIndex),
            ...componentsWithParent,
            ...result.slice(insertIndex),
          ];
        } else {
          result = [...componentsWithParent, ...result];
        }
      } else {
        result = [...componentsWithParent, ...result];
      }
      break;

    case 'append':
    default:
      // 追加到末尾
      if (insertBeforeId) {
        const insertIndex = result.findIndex(node => node.id === insertBeforeId);
        if (insertIndex !== -1) {
          result = [
            ...result.slice(0, insertIndex),
            ...componentsWithParent,
            ...result.slice(insertIndex),
          ];
        } else {
          result = [...result, ...componentsWithParent];
        }
      } else {
        result = [...result, ...componentsWithParent];
      }
      break;
  }

  return result;
}

/**
 * 查找组件的父节点链
 */
export function findParentChain(
  componentId: string,
  nodes: ComponentNode[]
): ComponentNode[] {
  const chain: ComponentNode[] = [];
  let currentId = componentId;

  while (currentId) {
    const current = nodes.find(node => node.id === currentId);
    if (!current) break;

    chain.unshift(current);
    currentId = current.parentId || '';
  }

  return chain;
}

/**
 * 查找组件的所有子节点
 */
export function findChildren(
  parentId: string,
  nodes: ComponentNode[]
): ComponentNode[] {
  return nodes.filter(node => node.parentId === parentId);
}

/**
 * 计算组件的深度（层级）
 */
export function calculateComponentDepth(
  componentId: string,
  nodes: ComponentNode[]
): number {
  return findParentChain(componentId, nodes).length - 1;
}

/**
 * 获取根节点（没有 parentId 的节点）
 */
export function getRootNodes(nodes: ComponentNode[]): ComponentNode[] {
  return nodes.filter(node => !node.parentId);
}

/**
 * 将节点树转换为扁平数组
 */
export function flattenComponentTree(
  tree: ComponentNode[],
  parentId?: string
): ComponentNode[] {
  let result: ComponentNode[] = [];

  tree.forEach(node => {
    result.push({
      ...node,
      parentId: parentId || node.parentId,
    });

    // 如果节点有子节点，递归处理
    if (node.props?.children && Array.isArray(node.props.children)) {
      result = [
        ...result,
        ...flattenComponentTree(node.props.children, node.id),
      ];
    }
  });

  return result;
}
