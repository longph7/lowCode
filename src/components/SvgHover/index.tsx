import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useComponentsStore, type ComponentNode, getNodeById } from '../../editor/stores/new-components';
import { createPortal } from 'react-dom';
import { useShallow } from 'zustand/react/shallow';

interface SvgHoverProps {
  nodeId?: string;
  containerClassName?: string;
  portalWrapperClassName?: string;
}

export default function SvgHover({ nodeId, containerClassName, portalWrapperClassName }: SvgHoverProps) {
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
      labelY: y - 20
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
      {/* 悬停遮罩层 */}
      <g>
        <rect
          x={position.x}
          y={position.y}
          width={position.width}
          height={position.height}
          fill="rgba(59, 130, 246, 0.05)" // 非常浅的蓝色背景
          stroke="rgba(59, 130, 246, 0.3)" // 浅蓝色虚线边框
          strokeWidth={1}
          strokeDasharray="4,2"
          rx={4}
          pointerEvents="none"
          style={{ zIndex: 999 }} // 比选中状态层级低
        />
        
        {/* 组件名称标签 */}
        {currentNode.type && (
          <text
            x={position.labelX}
            y={position.labelY + 12}
            fill="white"
            fontSize={12}
            fontWeight="normal"
            textAnchor="start"
            dominantBaseline="middle"
            pointerEvents="none"
            style={{ zIndex: 1000 }}
          >
            <tspan
              style={{
                background: 'rgba(59, 130, 246, 0.7)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontFamily: 'system-ui, sans-serif'
              }}
            >
              {currentNode.type}
            </tspan>
          </text>
        )}
      </g>
    </>
  ), portalContainer as Element);
}