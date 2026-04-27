import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { Button, Modal, Space } from 'antd';
import { useShallow } from 'zustand/react/shallow';
import Hover from '../../components/Hover/index.tsx';
import SelectedMask from '../../components/SelectedMask/index.tsx';
import ErrorBoundary from '../../components/ErrorBoundary/index.tsx';
import { useComponentsStore } from '../stores/new-components';
import type { ComponentNode } from '../stores/new-components';
import { useAIStore } from '../stores/ai-store.ts';
import { useComponentConfigStore } from '../stores/component-config.tsx';

const EDITOR_PADDING = 24;
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;

export default function EditorArea() {
    const containerRef = useRef<HTMLDivElement>(null);
    const nodesRef = useRef<ComponentNode[]>([]);
    const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
    const [zoom, setZoom] = useState(1);
    const [fitZoom, setFitZoom] = useState(1);
    const [hoverNodeId, setHoverNodeId] = useState('');
    const [draggingNode, setDraggingNode] = useState<{
        id: string;
        startX: number;
        startY: number;
        originX: number;
        originY: number;
    } | null>(null);

    const { nodes, mode, updateNodeThrottled, updateNode } = useComponentsStore(
        useShallow((state) => ({
            nodes: state.nodes,
            mode: state.mode,
            updateNodeThrottled: state.updateNodeThrottled,
            updateNode: state.updateNode,
        }))
    );
    const pendingComponents = useAIStore((state) => state.pendingComponents);
    const { componentConfig } = useComponentConfigStore(
        useShallow((state) => ({
            componentConfig: state.componentConfig,
        }))
    );
    const { setCurNodeId, curNodeId, clearCanvas } = useComponentsStore(
        useShallow((state) => ({
            setCurNodeId: state.setCurNodeId,
            curNodeId: state.curNodeId,
            clearCanvas: state.clearCanvas,
        }))
    );

    const renderNodes = useMemo(() => {
        if (pendingComponents && pendingComponents.length > 0) {
            return pendingComponents;
        }

        return nodes;
    }, [nodes, pendingComponents]);

    const interactionMode = pendingComponents && pendingComponents.length > 0 ? 'preview' : mode;

    nodesRef.current = renderNodes;

    useEffect(() => {
        nodesRef.current = renderNodes;
    }, [renderNodes]);

    const childrenByParent = useMemo(() => {
        const grouped = new Map<string | null, ComponentNode[]>();

        renderNodes.forEach((node) => {
            const key = node.parentId ?? null;
            const siblings = grouped.get(key) ?? [];
            siblings.push(node);
            grouped.set(key, siblings);
        });

        grouped.forEach((siblings) => {
            siblings.sort((a, b) => (a.position.zIndex ?? 0) - (b.position.zIndex ?? 0));
        });

        return grouped;
    }, [renderNodes]);

    const rootNodes = useMemo(() => {
        return (childrenByParent.get(null) ?? []).filter((node) => !node.parentId);
    }, [childrenByParent]);

    const canvasSize = useMemo(() => {
        const rootNode = rootNodes[0];
        return {
            width: rootNode?.position.width || 1080,
            height: rootNode?.position.height || 1920,
        };
    }, [rootNodes]);

    const calculateFitZoom = useCallback(() => {
        const container = containerRef.current;
        if (!container) {
            return 1;
        }

        const availableWidth = Math.max(container.clientWidth - EDITOR_PADDING * 2, 1);
        const availableHeight = Math.max(container.clientHeight - EDITOR_PADDING * 2 - 48, 1);

        return Math.min(
            availableWidth / canvasSize.width,
            availableHeight / canvasSize.height,
            1
        );
    }, [canvasSize.height, canvasSize.width]);

    useLayoutEffect(() => {
        const nextFitZoom = calculateFitZoom();
        setFitZoom(nextFitZoom);
        setZoom(nextFitZoom);
    }, [calculateFitZoom]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || typeof ResizeObserver === 'undefined') {
            return;
        }

        const observer = new ResizeObserver(() => {
            const nextFitZoom = calculateFitZoom();
            setFitZoom(nextFitZoom);
        });

        observer.observe(container);
        return () => observer.disconnect();
    }, [calculateFitZoom]);

    const displayZoom = useMemo(() => {
        return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
    }, [zoom]);

    const zoomPercent = Math.round(displayZoom * 100);

    const handleFitView = useCallback(() => {
        setZoom(fitZoom);
    }, [fitZoom]);

    const handleResetZoom = useCallback(() => {
        setZoom(1);
    }, []);

    const handleZoomIn = useCallback(() => {
        setZoom((prev) => Math.min(MAX_ZOOM, Number((prev + ZOOM_STEP).toFixed(2))));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom((prev) => Math.max(MIN_ZOOM, Number((prev - ZOOM_STEP).toFixed(2))));
    }, []);

    const handleClearCanvas = useCallback(() => {
        Modal.confirm({
            title: '确认清空画布吗？',
            content: '会删除当前画布上的所有内容，但会保留画布尺寸和背景设置。',
            okText: '清空',
            cancelText: '取消',
            okButtonProps: { danger: true },
            onOk: () => {
                clearCanvas();
            },
        });
    }, [clearCanvas]);

    useEffect(() => {
        if (!draggingNode || interactionMode !== 'edit') {
            return;
        }

        const finishDrag = (clientX: number, clientY: number) => {
            const currentNode = nodesRef.current.find((node) => node.id === draggingNode.id);
            if (currentNode) {
                const deltaX = (clientX - draggingNode.startX) / displayZoom;
                const deltaY = (clientY - draggingNode.startY) / displayZoom;

                updateNode(draggingNode.id, {
                    position: {
                        ...currentNode.position,
                        x: Math.max(0, draggingNode.originX + deltaX),
                        y: Math.max(0, draggingNode.originY + deltaY),
                    },
                });
            }
            setDraggingNode(null);
        };

        const handleMouseMove = (event: MouseEvent) => {
            lastPointerRef.current = { x: event.clientX, y: event.clientY };
            const deltaX = (event.clientX - draggingNode.startX) / displayZoom;
            const deltaY = (event.clientY - draggingNode.startY) / displayZoom;
            const currentNode = nodesRef.current.find((node) => node.id === draggingNode.id);
            if (!currentNode) {
                return;
            }

            updateNodeThrottled(draggingNode.id, {
                position: {
                    ...currentNode.position,
                    x: Math.max(0, draggingNode.originX + deltaX),
                    y: Math.max(0, draggingNode.originY + deltaY),
                },
            });
        };

        const handleMouseUp = (event: MouseEvent) => {
            finishDrag(event.clientX, event.clientY);
        };

        const handleWindowBlur = () => {
            const pointer = lastPointerRef.current;
            if (pointer) {
                finishDrag(pointer.x, pointer.y);
                return;
            }
            setDraggingNode(null);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp, true);
        window.addEventListener('blur', handleWindowBlur);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp, true);
            window.removeEventListener('blur', handleWindowBlur);
        };
    }, [displayZoom, draggingNode, interactionMode, updateNode, updateNodeThrottled]);

    const handleNodeDragStart = useCallback((
        event: React.MouseEvent<HTMLDivElement>,
        node: ComponentNode
    ) => {
        if (interactionMode !== 'edit' || node.id === 'root_page') {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        setCurNodeId(node.id);
        lastPointerRef.current = { x: event.clientX, y: event.clientY };
        setDraggingNode({
            id: node.id,
            startX: event.clientX,
            startY: event.clientY,
            originX: node.position.x,
            originY: node.position.y,
        });
    }, [interactionMode, setCurNodeId]);

    const renderNode = useCallback((node: ComponentNode): React.ReactElement | null => {
        const config = componentConfig[node.type];
        if (!config?.component) {
            return null;
        }

        const children = (childrenByParent.get(node.id) ?? [])
            .map((child) => renderNode(child))
            .filter(Boolean) as React.ReactElement[];

        return (
            <div
                key={node.id}
                data-component-id={node.id}
                draggable={false}
                style={{
                    position: node.parentId ? 'absolute' : 'relative',
                    left: node.parentId ? node.position.x : undefined,
                    top: node.parentId ? node.position.y : undefined,
                    width: node.position.width,
                    height: node.position.height,
                    zIndex: node.position.zIndex ?? 0,
                    boxSizing: 'border-box',
                    margin: node.parentId ? undefined : '0 auto',
                     cursor: interactionMode === 'edit' && node.id !== 'root_page' ? 'move' : 'default',
                     userSelect: draggingNode?.id === node.id ? 'none' : undefined,
                 }}
                 onMouseDown={(event) => handleNodeDragStart(event, node)}
            >
                {React.createElement(
                    config.component,
                    {
                        id: node.id,
                        name: node.type,
                        ...config.defaultProps,
                        ...node.props,
                        style: {
                            width: '100%',
                            height: '100%',
                            ...(config.defaultProps?.style ?? {}),
                            ...(node.props?.style ?? {}),
                        },
                    },
                    children.length > 0 ? children : undefined
                )}
            </div>
        );
    }, [childrenByParent, componentConfig, draggingNode?.id, handleNodeDragStart, interactionMode]);

    const handleMouseOver: React.MouseEventHandler = useCallback((e: any) => {
        if (interactionMode === 'preview') {
            return;
        }

        try {
            const path = e.nativeEvent.composedPath();
            for (let i = 0; i < path.length; i++) {
                const ele = path[i];
                if (ele && ele instanceof HTMLElement && ele.dataset && ele.dataset.componentId) {
                    const nodeId = ele.dataset.componentId;
                    if (nodeId) {
                        setHoverNodeId((prev) => (prev !== nodeId ? nodeId : prev));
                        return;
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to process hover event', error);
        }
    }, [interactionMode]);

    const handleClick: React.MouseEventHandler = useCallback((e: any) => {
        if (interactionMode === 'preview') {
            return;
        }

        try {
            const path = e.nativeEvent.composedPath();
            for (let i = 0; i < path.length; i++) {
                const ele = path[i];
                if (ele && ele instanceof HTMLElement && ele.dataset && ele.dataset.componentId) {
                    const nodeId = ele.dataset.componentId;
                    if (nodeId) {
                        if (curNodeId !== nodeId) {
                            setCurNodeId(nodeId);
                        }
                        return;
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to process click event', error);
        }
    }, [curNodeId, interactionMode, setCurNodeId]);

    const handleMouseOut = useCallback(() => {
        if (interactionMode === 'preview') {
            return;
        }
        setHoverNodeId((prev) => (prev ? '' : prev));
    }, [interactionMode]);

    return (
        <ErrorBoundary>
            <>
                <div
                     ref={containerRef}
                     className={`w-[100%] h-[100%] editor-area ${
                        interactionMode === 'preview' ? 'preview-mode' : 'edit-mode'
                     }`}
                    style={{
                        position: 'relative',
                        overflow: 'auto',
                        background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
                        padding: `${EDITOR_PADDING}px`,
                    }}
                    onMouseOver={handleMouseOver}
                    onMouseOut={handleMouseOut}
                    onClick={handleClick}
                >
                    <div
                        style={{
                            position: 'sticky',
                            top: 0,
                            display: 'flex',
                            justifyContent: 'flex-end',
                            zIndex: 20,
                            marginBottom: 12,
                        }}
                    >
                        <Space.Compact>
                            <Button danger onClick={handleClearCanvas}>清空画布</Button>
                            <Button onClick={handleFitView}>适应画布</Button>
                            <Button onClick={handleZoomOut}>-</Button>
                            <Button onClick={handleResetZoom}>{zoomPercent}%</Button>
                            <Button onClick={handleZoomIn}>+</Button>
                        </Space.Compact>
                    </div>

                    <div
                        style={{
                            minWidth: '100%',
                            width: Math.max(canvasSize.width * displayZoom, 0),
                            minHeight: Math.max(canvasSize.height * displayZoom, 0),
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            paddingBottom: 24,
                        }}
                    >
                        <div
                            data-canvas-zoom={displayZoom}
                            style={{
                                width: canvasSize.width,
                                height: canvasSize.height,
                                transform: `scale(${displayZoom})`,
                                transformOrigin: 'top center',
                            }}
                        >
                            {rootNodes.map((node) => renderNode(node))}
                        </div>
                    </div>

                    {interactionMode === 'edit' && hoverNodeId && hoverNodeId !== curNodeId && (
                        <ErrorBoundary>
                            <Hover
                                componentId={hoverNodeId}
                                containerClassName="editor-area"
                                poralWrapperClassName="portal-wrapper"
                            />
                        </ErrorBoundary>
                    )}
                    {interactionMode === 'edit' && curNodeId && (
                        <ErrorBoundary>
                            <SelectedMask
                                containerClassName="editor-area"
                                poralWrapperClassName="portal-wrapper"
                                componentId={curNodeId}
                            />
                        </ErrorBoundary>
                    )}
                </div>
                <div
                    className="portal-wrapper"
                    style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
                />
            </>
        </ErrorBoundary>
    );
}
