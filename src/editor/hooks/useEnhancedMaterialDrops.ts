import { useDrop } from 'react-dnd'
import { message } from 'antd'
import { useState, useCallback, useRef, useEffect } from 'react'
import { useComponentsStore } from '../stores/new-components'
import { useComponentConfigStore } from '../stores/component-config.tsx'
import { calculatePreciseInsertPosition, getInsertLinePosition } from '../utils/dragUtils'
import { getDefaultComponentSize } from './dropShared'

export interface DropPosition {
    x: number;
    y: number;
    width?: number;
    insertIndex?: number;
    insertPosition?: 'before' | 'after' | 'inside';
}

export interface DropPreview {
    show: boolean;
    position: DropPosition;
    type: 'line' | 'highlight' | 'placeholder';
}

interface DragMaterialItem {
    name: string;
    componentType?: string;
    props?: Record<string, any>;
}

export default function useEnhancedMaterialDrops(accept: string[], id: string) {
    const { addNode } = useComponentsStore((state) => state);
    const { componentConfig } = useComponentConfigStore((state) => state);

    const [dropPreview, setDropPreview] = useState<DropPreview>({
        show: false,
        position: { x: 0, y: 0 },
        type: 'line'
    });

    const dropRef = useRef<HTMLDivElement>(null);
    const previewTimeoutRef = useRef<number>(0);

    const getCanvasZoom = useCallback((element: HTMLElement) => {
        const zoomHost = element.closest('[data-canvas-zoom]') as HTMLElement | null;
        const zoomValue = Number(zoomHost?.getAttribute('data-canvas-zoom') || '1');
        return Number.isFinite(zoomValue) && zoomValue > 0 ? zoomValue : 1;
    }, []);

    const calculateInsertPosition = useCallback((clientOffset: { x: number; y: number }, dropTargetRef: HTMLElement) => {
        const insertPos = calculatePreciseInsertPosition(clientOffset, dropTargetRef);
        const linePos = getInsertLinePosition(insertPos, dropTargetRef);
        const zoom = getCanvasZoom(dropTargetRef);

        return {
            x: linePos.x / zoom,
            y: linePos.y / zoom,
            width: linePos.width / zoom,
            insertIndex: insertPos.index,
            insertPosition: insertPos.position,
            targetElement: insertPos.element
        };
    }, [getCanvasZoom]);

    const calculateCursorPosition = useCallback(
        (clientOffset: { x: number; y: number }, dropTargetRef: HTMLElement) => {
            const rect = dropTargetRef.getBoundingClientRect();
            const zoom = getCanvasZoom(dropTargetRef);

            return {
                x: Math.max(0, (clientOffset.x - rect.left) / zoom),
                y: Math.max(0, (clientOffset.y - rect.top) / zoom),
            };
        },
        [getCanvasZoom]
    );

    const updatePreview = useCallback((monitor: any) => {
        if (!monitor.isOver({ shallow: true })) {
            setDropPreview((prev) => ({ ...prev, show: false }));
            return;
        }

        const clientOffset = monitor.getClientOffset();
        const dropTargetRef = dropRef.current;

        if (clientOffset && dropTargetRef) {
            const position = calculateInsertPosition(clientOffset, dropTargetRef);

            setDropPreview({
                show: true,
                position,
                type: 'line'
            });
        }
    }, [calculateInsertPosition]);

    const [{ canDrop, isOver, isOverCurrent }, drop] = useDrop(() => ({
        accept,
        drop: (item: DragMaterialItem, monitor) => {
            if (monitor.didDrop()) return;

            const clientOffset = monitor.getClientOffset();
            const dropTargetRef = dropRef.current;

            if (clientOffset && dropTargetRef) {
                const componentType = item.componentType || item.name;
                const position = calculateInsertPosition(clientOffset, dropTargetRef);
                const cursorPosition = calculateCursorPosition(clientOffset, dropTargetRef);
                const props = componentConfig?.[componentType]?.defaultProps;
                const defaultSize = getDefaultComponentSize(componentType);

                message.success(` ${item.name} `);
                addNode({
                    type: componentType,
                    props: { ...props, ...(item.props || {}) },
                    parentId: id,
                    position: {
                        x: cursorPosition.x,
                        y: cursorPosition.y,
                        width: defaultSize.width,
                        height: defaultSize.height
                    }
                });

                console.log('dropped item to container:', item, 'at position:', position, 'cursor:', cursorPosition);
            }

            setDropPreview((prev) => ({ ...prev, show: false }));
        },
        hover: (_item, monitor) => {
            if (previewTimeoutRef.current) {
                clearTimeout(previewTimeoutRef.current);
            }

            previewTimeoutRef.current = window.setTimeout(() => {
                updatePreview(monitor);
            }, 16);
        },
        collect: (monitor) => ({
            canDrop: monitor.canDrop(),
            isOver: monitor.isOver(),
            isOverCurrent: monitor.isOver({ shallow: true })
        })
    }), [accept, id, addNode, componentConfig, updatePreview]);

    const combinedRef = useCallback((node: HTMLDivElement) => {
        dropRef.current = node;
        drop(node);
    }, [drop]);

    useEffect(() => {
        return () => {
            if (previewTimeoutRef.current) {
                clearTimeout(previewTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!isOverCurrent) {
            setDropPreview((prev) => ({ ...prev, show: false }));
        }
    }, [isOverCurrent]);

    return {
        canDrop,
        isOver,
        isOverCurrent,
        dropRef: combinedRef,
        dropPreview
    };
}


