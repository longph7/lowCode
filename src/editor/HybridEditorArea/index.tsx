import React, { useEffect, useCallback } from 'react';
import { useComponentsStore, type ComponentNode } from '../stores/new-components';
import CanvasRenderer from '../CanvasRenderer';
import SvgEditorLayer from '../SvgEditorLayer';
import ErrorBoundary from '../../components/ErrorBoundary';
import { useShallow } from 'zustand/react/shallow';

export default function HybridEditorArea() {
  const { nodes, mode, curNodeId, setCurNodeId, updateNode } = useComponentsStore(
    useShallow((state) => ({
      nodes: state.nodes,
      mode: state.mode,
      curNodeId: state.curNodeId,
      setCurNodeId: state.setCurNodeId,
      updateNode: state.updateNode
    }))
  );

  // 处理节点选择
  const handleNodeSelect = useCallback((nodeId: string) => {
    setCurNodeId(nodeId);
  }, [setCurNodeId]);

  // 处理节点移动
  const handleNodeMove = useCallback((nodeId: string, x: number, y: number) => {
    const node = getNodeById(nodeId, nodes);
    if (!node) return;
    
    updateNode(nodeId, {
      position: {
        ...node.position,
        x: Math.max(0, x), // 确保不小于0
        y: Math.max(0, y)
      }
    });
  }, [nodes, updateNode]);

  // 处理节点调整大小
  const handleNodeResize = useCallback((nodeId: string, width: number, height: number) => {
    const node = getNodeById(nodeId, nodes);
    if (!node) return;
    
    updateNode(nodeId, {
      position: {
        ...node.position,
        width: Math.max(20, width), // 最小宽度
        height: Math.max(20, height) // 最小高度
      }
    });
  }, [nodes, updateNode]);

  // 根据ID获取节点的辅助函数
  const getNodeById = (id: string, nodeList: ComponentNode[]): ComponentNode | undefined => {
    return nodeList.find(node => node.id === id);
  };

  return (
    <ErrorBoundary>
      <div className={`w-full h-full editor-area relative ${mode === 'preview' ? 'preview-mode' : 'edit-mode'}`}>
        {/* Canvas 渲染层 - 只读渲染 */}
        <div className="absolute inset-0 w-full h-full">
          <CanvasRenderer nodes={nodes} mode={mode} />
        </div>
        
        {/* SVG 交互层 - 处理用户交互 */}
        {mode === 'edit' && (
          <SvgEditorLayer
            nodes={nodes}
            mode={mode}
            onNodeSelect={handleNodeSelect}
            selectedNodeId={curNodeId}
            onNodeMove={handleNodeMove}
            onNodeResize={handleNodeResize}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}