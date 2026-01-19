import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useComponentsStore, type ComponentNode, getNodeById, getChildNodes } from '../stores/new-components';
import { useComponentConfigStore } from '../stores/component-config';
import SvgHover from '../../components/SvgHover';
import SvgSelectedMask from '../../components/SvgSelectedMask';
import ErrorBoundary from '../../components/ErrorBoundary';
import { useShallow } from 'zustand/react/shallow';
import { useDrop } from 'react-dnd';

// SVG 渲染组件的类型定义
interface SvgComponentRendererProps {
  node: ComponentNode;
  allNodes: ComponentNode[];
  componentConfig: any;
  mode: 'edit' | 'preview';
}

// SVG 渲染器组件
const SvgComponentRenderer: React.FC<SvgComponentRendererProps> = ({ node, allNodes, componentConfig, mode }) => {
  const config = componentConfig[node.type];
  const childNodes = getChildNodes(node.id, allNodes);

  // 根据组件类型渲染不同的 SVG 元素
  const renderSvgElement = () => {
    const { x, y, width, height, zIndex = 1 } = node.position;
    const props = { ...config.defaultProps, ...node.props };
    
    // 根据组件类型决定如何渲染
    switch (node.type) {
      case 'Page':
        return (
          <g transform={`translate(${x}, ${y})`} data-node-id={node.id}>
            <rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill="#ffffff"
              stroke={mode === 'edit' ? '#cccccc' : 'none'}
              strokeWidth={mode === 'edit' ? 1 : 0}
              rx={0}
            />
            {childNodes.map(childNode => (
              <SvgComponentRenderer
                key={childNode.id}
                node={childNode}
                allNodes={allNodes}
                componentConfig={componentConfig}
                mode={mode}
              />
            ))}
          </g>
        );
        
      case 'Container':
        // 使用 SVG 容器组件
        return (
          <g transform={`translate(${x}, ${y})`} data-node-id={node.id}>
            <rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill="#f8fafc"
              stroke={mode === 'edit' ? '#3b82f6' : '#d1d5db'}
              strokeWidth={mode === 'edit' ? 2 : 1}
              rx={4}
              opacity={0.9}
            />
            {childNodes.map(childNode => (
              <SvgComponentRenderer
                key={childNode.id}
                node={childNode}
                allNodes={allNodes}
                componentConfig={componentConfig}
                mode={mode}
              />
            ))}
          </g>
        );
        
      case 'Button':
        return (
          <g transform={`translate(${x}, ${y})`} data-node-id={node.id}>
            <rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill={props.type === 'primary' ? '#3b82f6' : '#ffffff'}
              stroke={props.type === 'primary' ? '#3b82f6' : '#d1d5db'}
              strokeWidth={1}
              rx={6}
            />
            <text
              x={width / 2}
              y={height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={props.type === 'primary' ? '#ffffff' : '#333333'}
              fontSize={props.fontSize || 14}
              fontWeight="normal"
            >
              {props.text || '按钮'}
            </text>
          </g>
        );
        
      case 'Text':
        return (
          <g transform={`translate(${x}, ${y})`} data-node-id={node.id}>
            <text
              x={0}
              y={height / 2}
              fill={props.color || '#333333'}
              fontSize={props.fontSize || 14}
              textAnchor="start"
              dominantBaseline="middle"
            >
              {props.content || '文本'}
            </text>
          </g>
        );
        
      case 'Div':
        return (
          <g transform={`translate(${x}, ${y})`} data-node-id={node.id}>
            <rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill={props.backgroundColor || 'transparent'}
              stroke={props.border || '#e0e0e0'}
              strokeWidth={1}
              rx={props.borderRadius || 0}
            />
            {childNodes.map(childNode => (
              <SvgComponentRenderer
                key={childNode.id}
                node={childNode}
                allNodes={allNodes}
                componentConfig={componentConfig}
                mode={mode}
              />
            ))}
          </g>
        );
        
      case 'Header':
        return (
          <g transform={`translate(${x}, ${y})`} data-node-id={node.id}>
            <text
              x={0}
              y={height / 2}
              fill={props.color || '#1f2937'}
              fontSize={props.level ? 24 - (props.level - 1) * 4 : 24}
              fontWeight="bold"
              textAnchor="start"
              dominantBaseline="middle"
            >
              {props.title || '标题'}
            </text>
          </g>
        );
        
      case 'Input':
        return (
          <g transform={`translate(${x}, ${y})`} data-node-id={node.id}>
            <rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill="#ffffff"
              stroke="#d1d5db"
              strokeWidth={1}
              rx={4}
            />
            <text
              x={10}
              y={height / 2}
              fill="#9ca3af"
              fontSize={14}
              textAnchor="start"
              dominantBaseline="middle"
            >
              {props.placeholder || '请输入内容'}
            </text>
          </g>
        );
        
      default:
        // 默认渲染一个矩形框表示未知组件
        return (
          <g transform={`translate(${x}, ${y})`} data-node-id={node.id}>
            <rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill="#f3f4f6"
              stroke="#9ca3af"
              strokeWidth={1}
              strokeDasharray="5,5"
              rx={2}
            />
            <text
              x={width / 2}
              y={height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#6b7280"
              fontSize={12}
            >
              {node.type}
            </text>
          </g>
        );
    }
  };

  return (
    <g>
      {renderSvgElement()}
    </g>
  );
};

// SVG 画布区域组件
export default function SvgEditorArea() {
  const { nodes, mode, addNode } = useComponentsStore(
    useShallow((state) => ({
      nodes: state.nodes,
      mode: state.mode,
      addNode: state.addNode
    }))
  );

  const { componentConfig } = useComponentConfigStore(
    useShallow((state) => ({
      componentConfig: state.componentConfig
    }))
  );

  const [hoverNodeId, setHoverNodeId] = useState<string | null>(null);
  const { setCurNodeId, curNodeId } = useComponentsStore(
    useShallow((state) => ({
      setCurNodeId: state.setCurNodeId,
      curNodeId: state.curNodeId
    }))
  );

  // 顶级拖拽接收区域
  const [{ canDrop, isOver }, connectDropTarget] = useDrop(() => ({
    accept: Object.keys(componentConfig),
    drop: (item: { name: string }, monitor) => {
      if (mode === 'preview') return;

      // 在这里无法访问 e 变量，所以我们需要另一种方式获取 SVG 元素
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      // 通过 document 查找 SVG 元素
      const svgElements = document.querySelectorAll('svg.editor-svg');
      if (svgElements.length === 0) return;
      
      // 假设最后一个 SVG 元素是我们需要的
      const svgElement = svgElements[svgElements.length - 1];
      const rect = svgElement.getBoundingClientRect();
      
      const x = clientOffset.x - rect.left;
      const y = clientOffset.y - rect.top;

      // 默认尺寸
      let width = 200;
      let height = 50;
      switch (item.name) {
        case 'Button':
          width = 100;
          height = 40;
          break;
        case 'Text':
          width = 200;
          height = 30;
          break;
        case 'Header':
          width = 300;
          height = 40;
          break;
        case 'Input':
          width = 200;
          height = 32;
          break;
        case 'Container':
          width = 300;
          height = 200;
          break;
        case 'Div':
          width = 250;
          height = 100;
          break;
      }

      // 添加随机偏移量来增加位置的随机性
      const randomOffsetX = (Math.random() - 0.5) * 60; // -30到+30像素的随机偏移
      const randomOffsetY = (Math.random() - 0.5) * 60; // -30到+30像素的随机偏移
      
      const newNodeData = {
        type: item.name,
        props: { ...componentConfig[item.name]?.defaultProps },
        position: { 
          x: Math.max(0, x - 50 + randomOffsetX), // 带随机偏移的位置调整
          y: Math.max(0, y - 15 + randomOffsetY), 
          width,
          height,
          zIndex: 1
        },
        parentId: undefined // 根节点，无父节点
      };

      addNode(newNodeData);
    },
    collect: (monitor) => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver(),
    }),
  }), [mode, componentConfig, addNode]);

  // 查找根节点（没有 parentId 的节点）
  const rootNode = useMemo(() => {
    return nodes.find(node => node.parentId === undefined || node.parentId === null);
  }, [nodes]);

  // 处理 SVG 上的鼠标事件
  const handleSvgMouseOver = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (mode === 'preview') return;

    // 获取鼠标位置相对于 SVG 的坐标
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const cursorPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    // 查找哪个节点包含了这个点
    for (let i = nodes.length - 1; i >= 0; i--) { // 从顶层开始查找
      const node = nodes[i];
      const { x, y, width, height } = node.position;

      if (
        cursorPt.x >= x &&
        cursorPt.x <= x + width &&
        cursorPt.y >= y &&
        cursorPt.y <= y + height
      ) {
        if (hoverNodeId !== node.id) {
          setHoverNodeId(node.id);
        }
        return;
      }
    }
  }, [mode, nodes, hoverNodeId]);

  const handleSvgClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (mode === 'preview') return;

    // 获取鼠标位置相对于 SVG 的坐标
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const cursorPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    // 查找哪个节点包含了这个点
    for (let i = nodes.length - 1; i >= 0; i--) { // 从顶层开始查找
      const node = nodes[i];
      const { x, y, width, height } = node.position;

      if (
        cursorPt.x >= x &&
        cursorPt.x <= x + width &&
        cursorPt.y >= y &&
        cursorPt.y <= y + height
      ) {
        if (curNodeId !== node.id) {
          setCurNodeId(node.id);
        }
        return;
      }
    }

    // 如果没有点击到任何节点，取消选择
    if (curNodeId) {
      setCurNodeId(null);
    }
  }, [mode, nodes, curNodeId, setCurNodeId]);

  const handleSvgMouseOut = useCallback(() => {
    if (mode === 'preview') return;
    setHoverNodeId(null);
  }, [mode]);

  // 计算 SVG 画布尺寸
  const canvasSize = useMemo(() => {
    if (!rootNode) {
      return { width: 800, height: 600 };
    }
    return {
      width: rootNode.position.width,
      height: rootNode.position.height
    };
  }, [rootNode]);

  // 连接拖拽目标到 SVG 元素
  const enhancedSvgRef = useCallback((element: SVGSVGElement | null) => {
    if (element) {
      connectDropTarget(element);
    }
  }, [connectDropTarget]);

  return (
    <ErrorBoundary>
      <div className={`w-full h-full editor-area ${mode === 'preview' ? 'preview-mode' : 'edit-mode'}`}>
        <svg
          ref={enhancedSvgRef}
          width={canvasSize.width}
          height={canvasSize.height}
          viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
          className={`w-full h-full border border-gray-300 rounded ${canDrop ? 'border-dashed border-blue-500' : ''}`}
          onMouseOver={handleSvgMouseOver}
          onMouseOut={handleSvgMouseOut}
          onClick={handleSvgClick}
        >
          {/* 渲染所有节点 */}
          {nodes
            .filter(node => !node.parentId) // 只渲染根节点，子节点由 SvgComponentRenderer 递归渲染
            .map(rootNode => (
              <SvgComponentRenderer
                key={rootNode.id}
                node={rootNode}
                allNodes={nodes}
                componentConfig={componentConfig}
                mode={mode}
              />
            ))
          }

          {/* 在编辑模式下显示悬停和选中效果 */}
          {/* 在编辑模式下显示悬停和选中效果 */}
          {mode === 'edit' && hoverNodeId && hoverNodeId !== curNodeId && (
            <SvgHover nodeId={hoverNodeId} portalWrapperClassName="portal-wrapper" />
          )}
          {mode === 'edit' && curNodeId && (
            <SvgSelectedMask nodeId={curNodeId} portalWrapperClassName="portal-wrapper" />
          )}
        </svg>
      </div>
    </ErrorBoundary>
  );
}