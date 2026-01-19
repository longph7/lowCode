import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useComponentsStore, getNodeById } from '../../editor/stores/new-components';
import { createPortal } from 'react-dom';
import { useShallow } from 'zustand/react/shallow';

interface SvgSelectedMaskProps {
  nodeId?: string;
  containerClassName?: string;
  portalWrapperClassName?: string;
}

export default function SvgSelectedMask({ nodeId, containerClassName, portalWrapperClassName }: SvgSelectedMaskProps) {
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    labelX: 0,
    labelY: 0
  });

  const { nodes } = useComponentsStore(
    useShallow((state) => ({
      nodes: state.nodes
    }))
  );

  const currentNode = useMemo(() => {
    if (!nodeId) return null;
    return getNodeById(nodeId, nodes);
  }, [nodeId, nodes]);

  const updatePosition = useCallback(() => {
    if (!nodeId || !currentNode) {
      return;
    }

    const { x, y, width, height } = currentNode.position;

    const newPosition = {
      x,
      y,
      width,
      height,
      labelX: x,
      labelY: y - 25
    };

    // 智能状态更新，只有位置真正变化才更新
    setPosition(prev => {
      const changed = Math.abs(prev.x - newPosition.x) > 1 ||
                     Math.abs(prev.y - newPosition.y) > 1 ||
                     Math.abs(prev.width - newPosition.width) > 1 ||
                     Math.abs(prev.height - newPosition.height) > 1;
      return changed ? newPosition : prev;
    });
  }, [nodeId, currentNode]);

  useEffect(() => {
    updatePosition();
  }, [updatePosition]);

  const portalContainer = useMemo(() => {
    try {
      return document.querySelector(`.${portalWrapperClassName}`);
    } catch (error) {
      console.warn('Portal容器查询失败:', error);
      return null;
    }
  }, [portalWrapperClassName]);

  if (!nodeId || !portalContainer || !currentNode) {
    return null;
  }

  return createPortal((
    <>
      {/* 选中遮罩层 */}
      <g>
        {/* 主边框 */}
        <rect
          x={position.x}
          y={position.y}
          width={position.width}
          height={position.height}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="0"
          rx={4}
          pointerEvents="none"
          style={{ zIndex: 1001 }} // 比悬停状态层级更高
        />
        
        {/* 控制手柄 */}
        <circle
          cx={position.x}
          cy={position.y}
          r={4}
          fill="#3b82f6"
          stroke="white"
          strokeWidth={2}
          pointerEvents="all"
          style={{ cursor: 'nw-resize', zIndex: 1002 }}
        />
        <circle
          cx={position.x + position.width / 2}
          cy={position.y}
          r={4}
          fill="#3b82f6"
          stroke="white"
          strokeWidth={2}
          pointerEvents="all"
          style={{ cursor: 'n-resize', zIndex: 1002 }}
        />
        <circle
          cx={position.x + position.width}
          cy={position.y}
          r={4}
          fill="#3b82f6"
          stroke="white"
          strokeWidth={2}
          pointerEvents="all"
          style={{ cursor: 'ne-resize', zIndex: 1002 }}
        />
        <circle
          cx={position.x}
          cy={position.y + position.height / 2}
          r={4}
          fill="#3b82f6"
          stroke="white"
          strokeWidth={2}
          pointerEvents="all"
          style={{ cursor: 'w-resize', zIndex: 1002 }}
        />
        <circle
          cx={position.x + position.width}
          cy={position.y + position.height / 2}
          r={4}
          fill="#3b82f6"
          stroke="white"
          strokeWidth={2}
          pointerEvents="all"
          style={{ cursor: 'e-resize', zIndex: 1002 }}
        />
        <circle
          cx={position.x}
          cy={position.y + position.height}
          r={4}
          fill="#3b82f6"
          stroke="white"
          strokeWidth={2}
          pointerEvents="all"
          style={{ cursor: 'sw-resize', zIndex: 1002 }}
        />
        <circle
          cx={position.x + position.width / 2}
          cy={position.y + position.height}
          r={4}
          fill="#3b82f6"
          stroke="white"
          strokeWidth={2}
          pointerEvents="all"
          style={{ cursor: 's-resize', zIndex: 1002 }}
        />
        <circle
          cx={position.x + position.width}
          cy={position.y + position.height}
          r={4}
          fill="#3b82f6"
          stroke="white"
          strokeWidth={2}
          pointerEvents="all"
          style={{ cursor: 'se-resize', zIndex: 1002 }}
        />
        
        {/* 组件名称标签 */}
        {currentNode.type && (
          <g>
            <rect
              x={position.labelX}
              y={position.labelY}
              width={Math.max(60, currentNode.type.length * 8)}
              height={20}
              fill="rgba(59, 130, 246, 0.9)"
              rx={4}
              pointerEvents="none"
              style={{ zIndex: 1003 }}
            />
            <text
              x={position.labelX + 8}
              y={position.labelY + 13}
              fill="white"
              fontSize={12}
              fontWeight="normal"
              textAnchor="start"
              dominantBaseline="middle"
              pointerEvents="none"
              style={{ zIndex: 1003, fontFamily: 'system-ui, sans-serif' }}
            >
              {currentNode.type}
            </text>
          </g>
        )}
      </g>
    </>
  ), portalContainer as Element);
}