import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useComponentsStore, type ComponentNode, getNodeById, getChildNodes } from '../stores/new-components';
import { useComponentConfigStore } from '../stores/component-config';
import { useShallow } from 'zustand/react/shallow';
import { useDrop } from 'react-dnd';

interface SvgEditorLayerProps {
  nodes: ComponentNode[];
  mode: 'edit' | 'preview';
  onNodeSelect: (nodeId: string) => void;
  selectedNodeId: string | null;
  onNodeMove: (nodeId: string, x: number, y: number) => void;
  onNodeResize: (nodeId: string, width: number, height: number) => void;
}

// 控制点类型
type ControlPointType = 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se';

const SvgEditorLayer: React.FC<SvgEditorLayerProps> = ({
  nodes,
  mode,
  onNodeSelect,
  selectedNodeId,
  onNodeMove,
  onNodeResize
}) => {
  const [draggingNode, setDraggingNode] = useState<{ id: string; startX: number; startY: number; startLeft: number; startTop: number } | null>(null);
  const [resizingNode, setResizingNode] = useState<{ id: string; controlPoint: ControlPointType; startX: number; startY: number; startWidth: number; startHeight: number; startXPos: number; startYPos: number } | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { componentConfig } = useComponentConfigStore(
    useShallow((state) => ({
      componentConfig: state.componentConfig
    }))
  );

  // 顶级拖拽接收区域
  const { addNode } = useComponentsStore(
    useShallow((state) => ({
      addNode: state.addNode
    }))
  );
  
  const [{ canDrop }, connectDropTarget] = useDrop(() => ({
    accept: Object.keys(componentConfig),
    drop: (item: { name: string }, monitor) => {
      if (mode === 'preview') return;

      const clientOffset = monitor.getClientOffset();
      if (!clientOffset || !svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const x = clientOffset.x - rect.left;
      const y = clientOffset.y - rect.top;

      // 添加新节点
      const defaultSize = { width: 100, height: 50 };
      const defaultPositions: Record<string, { width: number; height: number }> = {
        'Page': { width: 800, height: 600 },
        'Container': { width: 300, height: 200 },
        'Text': { width: 200, height: 30 },
        'Button': { width: 100, height: 40 },
        'Input': { width: 200, height: 40 },
        'Image': { width: 150, height: 100 },
        'Header': { width: 800, height: 80 },
        'Div': { width: 250, height: 150 },
        'ImageUpload': { width: 200, height: 150 },
        'PreAnnotation': { width: 400, height: 300 },
        'AnnotationCanvas': { width: 500, height: 400 }
      };
      
      const size = defaultPositions[item.name as string] || defaultSize;
      
      // 添加随机偏移量来增加位置的随机性
      const randomOffsetX = (Math.random() - 0.5) * 40; // -20到+20像素的随机偏移
      const randomOffsetY = (Math.random() - 0.5) * 40; // -20到+20像素的随机偏移
      
      addNode({
        type: item.name,
        props: { ...componentConfig[item.name]?.defaultProps },
        position: {
          x: Math.max(0, x - size.width / 2 + randomOffsetX), // 带随机偏移的居中放置
          y: Math.max(0, y - size.height / 2 + randomOffsetY),
          width: size.width,
          height: size.height
        }
      });
    },
    collect: (monitor) => ({
      canDrop: monitor.canDrop(),
    }),
  }), [mode, componentConfig, addNode]);

  // 处理鼠标按下事件（选择组件）
  const handleMouseDown = useCallback((e: React.MouseEvent<SVGElement>, nodeId: string) => {
    if (mode === 'preview') return;
    
    e.stopPropagation();
    onNodeSelect(nodeId);
  }, [mode, onNodeSelect]);

  // 处理拖拽移动事件
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGElement>) => {
    if (!draggingNode || !svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const deltaX = x - draggingNode.startX;
    const deltaY = y - draggingNode.startY;
    
    onNodeMove(draggingNode.id, draggingNode.startLeft + deltaX, draggingNode.startTop + deltaY);
  }, [draggingNode, onNodeMove]);

  // 处理拖拽结束事件
  const handleMouseUp = useCallback(() => {
    setDraggingNode(null);
  }, []);

  // 处理控制点拖拽（调整大小）
  const handleControlPointMouseDown = useCallback((e: React.MouseEvent<SVGElement>, nodeId: string, controlPoint: ControlPointType) => {
    e.stopPropagation();
    if (!svgRef.current) return;
    
    const node = getNodeById(nodeId, nodes);
    if (!node) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setResizingNode({
      id: nodeId,
      controlPoint,
      startX: x,
      startY: y,
      startWidth: node.position.width,
      startHeight: node.position.height,
      startXPos: node.position.x,
      startYPos: node.position.y
    });
  }, [nodes]);

  // 处理大小调整
  const handleResize = useCallback((e: React.MouseEvent<SVGElement>) => {
    if (!resizingNode || !svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const deltaX = x - resizingNode.startX;
    const deltaY = y - resizingNode.startY;
    
    let newWidth = resizingNode.startWidth;
    let newHeight = resizingNode.startHeight;
    let newX = resizingNode.startXPos;
    let newY = resizingNode.startYPos;
    
    // 根据控制点调整大小和位置
    switch (resizingNode.controlPoint) {
      case 'nw': // 左上
        newWidth = Math.max(20, resizingNode.startWidth - deltaX);
        newHeight = Math.max(20, resizingNode.startHeight - deltaY);
        newX = resizingNode.startXPos + deltaX;
        newY = resizingNode.startYPos + deltaY;
        break;
      case 'n': // 上
        newHeight = Math.max(20, resizingNode.startHeight - deltaY);
        newY = resizingNode.startYPos + deltaY;
        break;
      case 'ne': // 右上
        newWidth = Math.max(20, resizingNode.startWidth + deltaX);
        newHeight = Math.max(20, resizingNode.startHeight - deltaY);
        newY = resizingNode.startYPos + deltaY;
        break;
      case 'w': // 左
        newWidth = Math.max(20, resizingNode.startWidth - deltaX);
        newX = resizingNode.startXPos + deltaX;
        break;
      case 'e': // 右
        newWidth = Math.max(20, resizingNode.startWidth + deltaX);
        break;
      case 'sw': // 左下
        newWidth = Math.max(20, resizingNode.startWidth - deltaX);
        newHeight = Math.max(20, resizingNode.startHeight + deltaY);
        newX = resizingNode.startXPos + deltaX;
        break;
      case 's': // 下
        newHeight = Math.max(20, resizingNode.startHeight + deltaY);
        break;
      case 'se': // 右下
        newWidth = Math.max(20, resizingNode.startWidth + deltaX);
        newHeight = Math.max(20, resizingNode.startHeight + deltaY);
        break;
    }
    
    onNodeResize(resizingNode.id, newWidth, newHeight);
    // 注意：这里我们只调整大小，位置调整需要额外处理
  }, [resizingNode, onNodeResize]);

  // 处理鼠标移动事件
  const handleSvgMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    handleMouseMove(e);
    handleResize(e);
  }, [handleMouseMove, handleResize]);

  // 处理鼠标抬起事件
  const handleSvgMouseUp = useCallback(() => {
    handleMouseUp();
    setResizingNode(null);
  }, [handleMouseUp]);

  // 处理节点悬停
  const handleNodeMouseEnter = useCallback((nodeId: string) => {
    if (mode === 'preview') return;
    setHoveredNodeId(nodeId);
  }, [mode]);

  const handleNodeMouseLeave = useCallback(() => {
    if (mode === 'preview') return;
    setHoveredNodeId(null);
  }, [mode]);

  // 渲染控制点
  const renderControlPoints = (node: ComponentNode) => {
    if (selectedNodeId !== node.id || mode === 'preview') return null;

    const { x, y, width, height } = node.position;
    const size = 8;
    const halfSize = size / 2;

    return (
      <g>
        {/* 八个控制点 */}
        <rect
          x={x - halfSize}
          y={y - halfSize}
          width={size}
          height={size}
          fill="#3b82f6"
          stroke="white"
          strokeWidth={1}
          style={{ cursor: 'nw-resize' }}
          onMouseDown={(e) => handleControlPointMouseDown(e, node.id, 'nw')}
        />
        <rect
          x={x + width / 2 - halfSize}
          y={y - halfSize}
          width={size}
          height={size}
          fill="#3b82f6"
          stroke="white"
          strokeWidth={1}
          style={{ cursor: 'n-resize' }}
          onMouseDown={(e) => handleControlPointMouseDown(e, node.id, 'n')}
        />
        <rect
          x={x + width - halfSize}
          y={y - halfSize}
          width={size}
          height={size}
          fill="#3b82f6"
          stroke="white"
          strokeWidth={1}
          style={{ cursor: 'ne-resize' }}
          onMouseDown={(e) => handleControlPointMouseDown(e, node.id, 'ne')}
        />
        <rect
          x={x - halfSize}
          y={y + height / 2 - halfSize}
          width={size}
          height={size}
          fill="#3b82f6"
          stroke="white"
          strokeWidth={1}
          style={{ cursor: 'w-resize' }}
          onMouseDown={(e) => handleControlPointMouseDown(e, node.id, 'w')}
        />
        <rect
          x={x + width - halfSize}
          y={y + height / 2 - halfSize}
          width={size}
          height={size}
          fill="#3b82f6"
          stroke="white"
          strokeWidth={1}
          style={{ cursor: 'e-resize' }}
          onMouseDown={(e) => handleControlPointMouseDown(e, node.id, 'e')}
        />
        <rect
          x={x - halfSize}
          y={y + height - halfSize}
          width={size}
          height={size}
          fill="#3b82f6"
          stroke="white"
          strokeWidth={1}
          style={{ cursor: 'sw-resize' }}
          onMouseDown={(e) => handleControlPointMouseDown(e, node.id, 'sw')}
        />
        <rect
          x={x + width / 2 - halfSize}
          y={y + height - halfSize}
          width={size}
          height={size}
          fill="#3b82f6"
          stroke="white"
          strokeWidth={1}
          style={{ cursor: 's-resize' }}
          onMouseDown={(e) => handleControlPointMouseDown(e, node.id, 's')}
        />
        <rect
          x={x + width - halfSize}
          y={y + height - halfSize}
          width={size}
          height={size}
          fill="#3b82f6"
          stroke="white"
          strokeWidth={1}
          style={{ cursor: 'se-resize' }}
          onMouseDown={(e) => handleControlPointMouseDown(e, node.id, 'se')}
        />

        {/* 边框 */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={1}
          strokeDasharray="4,2"
        />
      </g>
    );
  };

  // 渲染单个节点
  const renderNode = (node: ComponentNode) => {
    const { x, y, width, height } = node.position;
    const isSelected = selectedNodeId === node.id;
    const isHovered = hoveredNodeId === node.id;
    
    // 根据组件类型渲染不同的可视化表示
    const renderNodeVisual = () => {
      switch (node.type) {
        case 'Page':
          return (
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              fill="#f8fafc"  // 浅灰色背景
              stroke="#e2e8f0"
              strokeWidth={isSelected ? 2 : 1}
              strokeDasharray={isSelected ? "0" : "4,4"}
              rx={4}
              opacity={0.8}
            />
          );
        case 'Container':
          return (
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              fill="#f8fafc"  // 浅灰色背景
              stroke="#cbd5e1"
              strokeWidth={isSelected ? 2 : 1}
              strokeDasharray={isSelected ? "0" : "2,2"}
              rx={2}
              opacity={0.8}
            />
          );
        case 'Button':
          return (
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              fill="#3b82f6"  // 蓝色按钮
              stroke="#2563eb"
              strokeWidth={isSelected ? 2 : 1}
              rx={4}
              opacity={0.8}
            />
          );
        case 'Text':
          return (
            <g>
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill="none"
                stroke="none"
              />
              <text
                x={x + 5}
                y={y + height / 2}
                fontSize={node.props?.fontSize || 14}
                fill="#1e293b"
                dominantBaseline="middle"
              >
                {node.props?.content || '文本'}
              </text>
            </g>
          );
        default:
          // 默认矩形
          return (
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              fill="#f1f5f9"  // 浅灰色
              stroke="#94a3b8"
              strokeWidth={isSelected ? 2 : 1}
              strokeDasharray={isSelected ? "0" : "4,2"}
              opacity={0.7}
            />
          );
      }
    };
    
    return (
      <g key={node.id} data-node-id={node.id}>
        {/* 渲染节点的可视化表示 */}
        {renderNodeVisual()}
        
        {/* 交互矩形 - 透明，用于交互 */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="transparent"
          stroke={isSelected ? '#3b82f6' : isHovered ? '#60a5fa' : 'transparent'}
          strokeWidth={isSelected ? 2 : isHovered ? 1 : 0}
          rx={2}
          style={{ 
            cursor: mode === 'edit' ? 'move' : 'default',
            pointerEvents: mode === 'edit' ? 'all' : 'none'
          }}
          onMouseDown={(e) => {
            setDraggingNode({
              id: node.id,
              startX: e.clientX,
              startY: e.clientY,
              startLeft: x,
              startTop: y
            });
            handleMouseDown(e, node.id);
          }}
          onMouseEnter={() => handleNodeMouseEnter(node.id)}
          onMouseLeave={handleNodeMouseLeave}
        />
        
        {/* 渲染控制点 */}
        {renderControlPoints(node)}
      </g>
    );
  };

  // 连接 SVG 到拖拽目标
  const enhancedSvgRef = useCallback((element: SVGSVGElement | null) => {
    if (element) {
      svgRef.current = element;
      connectDropTarget(element);
    }
  }, [connectDropTarget]);

  return (
    <svg
      ref={enhancedSvgRef}
      width="100%"
      height="100%"
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        pointerEvents: mode === 'edit' ? 'all' : 'none',
        zIndex: 1000
      }}
      onMouseMove={handleSvgMouseMove}
      onMouseUp={handleSvgMouseUp}
    >
      {/* 渲染所有节点的交互层 */}
      {nodes.map(renderNode)}
      
      {/* 显示辅助线或网格（在编辑模式下） */}
      {mode === 'edit' && (
        <g>
          {/* 这里可以添加辅助线或网格 */}
        </g>
      )}
    </svg>
  );
};

export default SvgEditorLayer;