import React, { useRef, useEffect } from 'react'
import type { ComponentNode } from '../../stores/new-components';
import { useComponentConfigStore } from '../../stores/component-config';
import { useComponentsStore } from '../../stores/new-components';
import useSvgMaterialDrops from '../../hooks/useSvgMaterialDrops';
import { useShallow } from 'zustand/react/shallow';

interface SvgContainerProps {
  node: ComponentNode;
  allNodes: ComponentNode[];
  mode: 'edit' | 'preview';
}

export default function SvgContainer({ node, allNodes, mode }: SvgContainerProps) {
  const { componentConfig } = useComponentConfigStore(
    useShallow((state) => ({
      componentConfig: state.componentConfig
    }))
  );
  
  const { addNode } = useComponentsStore(
    useShallow((state) => ({
      addNode: state.addNode
    }))
  );
  
  // 使用 SVG 版本的拖拽功能
  const { canDrop, isOver, dropRef } = useSvgMaterialDrops(
    Object.keys(componentConfig),
    node.id
  );

  // 创建一个 ref 来连接拖拽目标
  const containerRef = useRef<SVGGElement>(null);
  useEffect(() => {
    if (containerRef.current) {
      dropRef(containerRef.current);
    }
  }, [dropRef]);

  const { x, y, width, height } = node.position;
  const props = { ...componentConfig['Container']?.defaultProps, ...node.props };
  
  // 获取子节点
  const childNodes = allNodes.filter(n => n.parentId === node.id);

  return (
    <g 
      transform={`translate(${x}, ${y})`} 
      data-node-id={node.id}
    >
      {/* 容器背景 */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={props.backgroundColor || '#f8fafc'}
        stroke={canDrop ? '#3b82f6' : (mode === 'edit' ? '#d1d5db' : 'transparent')}
        strokeWidth={1}
        rx={4}
        opacity={isOver ? 0.8 : 0.9}
      />
      
      {/* 渲染子节点 */}
      {childNodes.map(childNode => {
        const config = componentConfig[childNode.type];
        if (!config?.component) {
          return null;
        }
        
        // 根据组件类型渲染不同的 SVG 元素
        switch (childNode.type) {
          case 'Button':
            return (
              <g key={childNode.id} transform={`translate(${childNode.position.x}, ${childNode.position.y})`}>
                <rect
                  x={0}
                  y={0}
                  width={childNode.position.width}
                  height={childNode.position.height}
                  fill={childNode.props.type === 'primary' ? '#3b82f6' : '#ffffff'}
                  stroke={childNode.props.type === 'primary' ? '#3b82f6' : '#d1d5db'}
                  strokeWidth={1}
                  rx={6}
                />
                <text
                  x={childNode.position.width / 2}
                  y={childNode.position.height / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={childNode.props.type === 'primary' ? '#ffffff' : '#333333'}
                  fontSize={childNode.props.fontSize || 14}
                  fontWeight="normal"
                >
                  {childNode.props.text || '按钮'}
                </text>
              </g>
            );
            
          case 'Text':
            return (
              <g key={childNode.id} transform={`translate(${childNode.position.x}, ${childNode.position.y})`}>
                <text
                  x={0}
                  y={childNode.position.height / 2}
                  fill={childNode.props.color || '#333333'}
                  fontSize={childNode.props.fontSize || 14}
                  textAnchor="start"
                  dominantBaseline="middle"
                >
                  {childNode.props.content || '文本'}
                </text>
              </g>
            );
            
          case 'Div':
            return (
              <g key={childNode.id} transform={`translate(${childNode.position.x}, ${childNode.position.y})`}>
                <rect
                  x={0}
                  y={0}
                  width={childNode.position.width}
                  height={childNode.position.height}
                  fill={childNode.props.backgroundColor || 'transparent'}
                  stroke={childNode.props.border || '#e0e0e0'}
                  strokeWidth={1}
                  rx={childNode.props.borderRadius || 0}
                />
              </g>
            );
            
          case 'Header':
            return (
              <g key={childNode.id} transform={`translate(${childNode.position.x}, ${childNode.position.y})`}>
                <text
                  x={0}
                  y={childNode.position.height / 2}
                  fill={childNode.props.color || '#1f2937'}
                  fontSize={childNode.props.level ? 24 - (childNode.props.level - 1) * 4 : 24}
                  fontWeight="bold"
                  textAnchor="start"
                  dominantBaseline="middle"
                >
                  {childNode.props.title || '标题'}
                </text>
              </g>
            );
            
          case 'Input':
            return (
              <g key={childNode.id} transform={`translate(${childNode.position.x}, ${childNode.position.y})`}>
                <rect
                  x={0}
                  y={0}
                  width={childNode.position.width}
                  height={childNode.position.height}
                  fill="#ffffff"
                  stroke="#d1d5db"
                  strokeWidth={1}
                  rx={4}
                />
                <text
                  x={10}
                  y={childNode.position.height / 2}
                  fill="#9ca3af"
                  fontSize={14}
                  textAnchor="start"
                  dominantBaseline="middle"
                >
                  {childNode.props.placeholder || '请输入内容'}
                </text>
              </g>
            );
            
          case 'Container':
            // 递归渲染嵌套容器
            return (
              <SvgContainer
                key={childNode.id}
                node={childNode}
                allNodes={allNodes}
                mode={mode}
              />
            );
            
          default:
            // 默认渲染一个矩形框表示未知组件
            return (
              <g key={childNode.id} transform={`translate(${childNode.position.x}, ${childNode.position.y})`}>
                <rect
                  x={0}
                  y={0}
                  width={childNode.position.width}
                  height={childNode.position.height}
                  fill="#f3f4f6"
                  stroke="#9ca3af"
                  strokeWidth={1}
                  strokeDasharray="5,5"
                  rx={2}
                />
                <text
                  x={childNode.position.width / 2}
                  y={childNode.position.height / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#6b7280"
                  fontSize={12}
                >
                  {childNode.type}
                </text>
              </g>
            );
        }
      })}
    </g>
  );
}