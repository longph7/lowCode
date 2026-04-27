import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useShallow } from 'zustand/react/shallow';
import { getNodeById, useComponentsStore } from '../../editor/stores/new-components';
import { useDragStore } from '../../editor/stores/dragStore';

interface HoverMaskProps {
    containerClassName?: string;
    componentId?: string;
    poralWrapperClassName?: string;
}

export default function Hover({
    containerClassName,
    componentId,
    poralWrapperClassName,
}: HoverMaskProps) {
    const [position, setPosition] = useState({
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        labelTop: 0,
        labelLeft: 0,
    });

    const updatePosition = useCallback(() => {
        if (!componentId) {
            return;
        }

        try {
            const container = document.querySelector(`.${containerClassName}`) as HTMLElement | null;
            const node = document.querySelector(`[data-component-id="${componentId}"]`) as HTMLElement | null;
            if (!container || !node) {
                return;
            }

            const { top, left, width, height } = node.getBoundingClientRect();
            const { top: containerTop, left: containerLeft } = container.getBoundingClientRect();

            const nextPosition = {
                top: top - containerTop + container.scrollTop,
                left: left - containerLeft + container.scrollLeft,
                width,
                height,
                labelTop: top - containerTop + container.scrollTop,
                labelLeft: left - containerLeft + container.scrollLeft,
            };

            setPosition((prev) => {
                const changed =
                    Math.abs(prev.top - nextPosition.top) > 1 ||
                    Math.abs(prev.left - nextPosition.left) > 1 ||
                    Math.abs(prev.width - nextPosition.width) > 1 ||
                    Math.abs(prev.height - nextPosition.height) > 1;
                return changed ? nextPosition : prev;
            });
        } catch (error) {
            console.warn('Failed to update hover position', error);
        }
    }, [componentId, containerClassName]);

    useEffect(() => {
        updatePosition();
    }, [updatePosition]);

    const portalElement = useMemo(() => {
        try {
            return document.querySelector(`.${poralWrapperClassName}`);
        } catch (error) {
            console.warn('Failed to query hover portal container', error);
            return null;
        }
    }, [poralWrapperClassName]);

    const { nodes } = useComponentsStore(
        useShallow((state) => ({
            nodes: state.nodes,
        }))
    );

    const curNode = useMemo(() => {
        if (!componentId) return null;
        return getNodeById(componentId, nodes);
    }, [componentId, nodes]);

    const isDragging = useDragStore((state) => state.isDragging);

    if (!componentId || !portalElement || isDragging) {
        return null;
    }

    return createPortal(
        <>
            <div
                style={{
                    position: 'absolute',
                    top: position.top,
                    left: position.left,
                    width: position.width,
                    height: position.height,
                    background: 'transparent',
                    border: '1px dashed rgba(59, 130, 246, 0.3)',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                    pointerEvents: 'none',
                    zIndex: 999,
                }}
            />
            {curNode?.type && (
                <div
                    style={{
                        position: 'absolute',
                        top: position.labelTop - 20,
                        left: position.labelLeft,
                        background: 'rgba(59, 130, 246, 0.7)',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        lineHeight: '16px',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        zIndex: 1000,
                        fontFamily: 'system-ui, sans-serif',
                    }}
                >
                    {curNode.type}
                </div>
            )}
        </>,
        portalElement
    );
}
