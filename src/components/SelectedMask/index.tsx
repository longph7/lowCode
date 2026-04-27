import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useShallow } from 'zustand/react/shallow';
import { useComponentsStore } from '../../editor/stores/new-components';

interface SelectedMaskProps {
    containerClassName: string;
    poralWrapperClassName: string;
    componentId: string;
}

export default function SelectedMask({ componentId }: SelectedMaskProps) {
    const { deleteNode, setCurNodeId, curNodeId } = useComponentsStore(
        useShallow((state) => ({
            deleteNode: state.deleteNode,
            setCurNodeId: state.setCurNodeId,
            curNodeId: state.curNodeId,
        }))
    );
    const isRootPage = componentId === 'root_page';

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
            const node = document.querySelector(`[data-component-id="${componentId}"]`) as HTMLElement | null;
            if (!node) {
                return;
            }

            const { top, left, width, height } = node.getBoundingClientRect();
            const nextPosition = {
                top,
                left,
                width,
                height,
                labelTop: Math.max(top - 35, 5),
                labelLeft: Math.max(left + width - 80, 5),
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
            console.warn('Failed to update selected mask position', error);
        }
    }, [componentId]);

    const handleDelete = useCallback(() => {
        if (isRootPage || !curNodeId) {
            return;
        }

        deleteNode(curNodeId);
        setCurNodeId(null);
    }, [curNodeId, deleteNode, isRootPage, setCurNodeId]);

    useEffect(() => {
        updatePosition();
    }, [updatePosition]);

    useEffect(() => {
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [updatePosition]);

    return createPortal(
        <>
            {!isRootPage && (
                <div
                    className="selected-mask"
                    style={{
                        top: position.top,
                        left: position.left,
                        width: position.width,
                        height: position.height,
                        position: 'fixed',
                        backgroundColor: 'transparent',
                        border: '2px solid #3b82f6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                        zIndex: 1010,
                        pointerEvents: 'none',
                    }}
                />
            )}
            {!isRootPage && (
                <div
                    className="selected-label"
                    style={{
                        position: 'fixed',
                        top: position.labelTop,
                        left: position.labelLeft,
                        backgroundColor: '#1e40af',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontFamily: 'system-ui, sans-serif',
                        zIndex: 1011,
                        pointerEvents: 'auto',
                    }}
                >
                    <Popconfirm
                        title="确定要删除这个组件吗？"
                        description="删除后将无法恢复"
                        okText="确定删除"
                        cancelText="取消"
                        onConfirm={handleDelete}
                        placement="bottomLeft"
                    >
                        <Button
                            type="primary"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            style={{
                                fontSize: '12px',
                                height: '24px',
                                lineHeight: '1',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            }}
                        >
                            删除
                        </Button>
                    </Popconfirm>
                </div>
            )}
        </>,
        document.body
    );
}
