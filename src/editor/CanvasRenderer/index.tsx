import React, { useEffect, useRef, useCallback } from 'react';
import { useComponentsStore, type ComponentNode } from '../stores/new-components';
import { useComponentConfigStore } from '../stores/component-config';
import { useShallow } from 'zustand/react/shallow';

interface CanvasRendererProps {
  nodes: ComponentNode[];
  mode: 'edit' | 'preview';
}

const CanvasRenderer: React.FC<CanvasRendererProps> = ({ nodes, mode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { componentConfig } = useComponentConfigStore(
    useShallow((state) => ({
      componentConfig: state.componentConfig
    }))
  );

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制所有节点
    const drawNode = (node: ComponentNode) => {
      const { x, y, width, height } = node.position;
      const config = componentConfig[node.type];
      const props = { ...config?.defaultProps, ...node.props };

      // 根据组件类型绘制
      switch (node.type) {
        case 'Page':
          // 绘制页面背景
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, y, width, height);
          break;

        case 'Container':
          // 绘制容器
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(x, y, width, height);
          ctx.strokeStyle = mode === 'edit' ? '#d1d5db' : 'transparent';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, width, height);
          break;

        case 'Button':
          // 绘制按钮
          ctx.fillStyle = props.type === 'primary' ? '#3b82f6' : '#ffffff';
          ctx.fillRect(x, y, width, height);
          
          ctx.strokeStyle = props.type === 'primary' ? '#3b82f6' : '#d1d5db';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, width, height);
          
          // 绘制按钮文本
          ctx.fillStyle = props.type === 'primary' ? '#ffffff' : '#333333';
          ctx.font = `${props.fontSize || 14}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(props.text || '按钮', x + width / 2, y + height / 2);
          break;

        case 'Text':
          // 绘制文本
          ctx.fillStyle = props.color || '#333333';
          ctx.font = `${props.fontSize || 14}px Arial`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(props.content || '文本', x, y + height / 2);
          break;

        case 'Header':
          // 绘制标题
          ctx.fillStyle = props.color || '#1f2937';
          const fontSize = props.level ? 24 - (props.level - 1) * 4 : 24;
          ctx.font = `bold ${fontSize}px Arial`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(props.title || '标题', x, y + height / 2);
          break;

        case 'Input':
          // 绘制输入框
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, y, width, height);
          ctx.strokeStyle = '#d1d5db';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, width, height);
          
          // 绘制占位符文本
          ctx.fillStyle = '#9ca3af';
          ctx.font = '14px Arial';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(props.placeholder || '请输入内容', x + 10, y + height / 2);
          break;

        case 'Div':
          // 绘制Div
          ctx.fillStyle = props.backgroundColor || 'transparent';
          ctx.fillRect(x, y, width, height);
          ctx.strokeStyle = props.border || '#e0e0e0';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, width, height);
          break;

        default:
          // 默认绘制一个矩形框
          ctx.fillStyle = '#f3f4f6';
          ctx.fillRect(x, y, width, height);
          ctx.strokeStyle = '#9ca3af';
          ctx.lineWidth = 1;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(x, y, width, height);
          ctx.setLineDash([]);
          
          ctx.fillStyle = '#6b7280';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(node.type, x + width / 2, y + height / 2);
          break;
      }
    };

    // 绘制所有节点（按照 zIndex 排序）
    const sortedNodes = [...nodes].sort((a, b) => (a.position.zIndex || 0) - (b.position.zIndex || 0));
    sortedNodes.forEach(drawNode);
  }, [nodes, componentConfig, mode]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // 监听窗口大小变化，调整 canvas 尺寸
  useEffect(() => {
    const handleResize = () => {
      redrawCanvas();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [redrawCanvas]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default CanvasRenderer;