import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export interface DragState {
    isDragging: boolean;
    draggedItem: {
        name: string;
        type: string;
        componentType?: string;
        previewSrc?: string;
        props?: Record<string, any>;
    } | null;
    hoveredContainer: number | null;
    insertPreview: {
        containerId: number;
        position: {
            x: number;
            y: number;
            width?: number;
            insertIndex?: number;
            insertPosition?: 'before' | 'after' | 'inside';
        };
    } | null;
}

export interface DragActions {
    setDragging: (
        isDragging: boolean,
        item?: {
            name: string;
            type: string;
            componentType?: string;
            previewSrc?: string;
            props?: Record<string, any>;
        }
    ) => void;
    setHoveredContainer: (containerId: number | null) => void;
    setInsertPreview: (preview: DragState['insertPreview']) => void;
    clearDragState: () => void;
}

export const useDragStore = create<DragState & DragActions>()(
    subscribeWithSelector(
        (set) => ({
            // State
            isDragging: false,
            draggedItem: null,
            hoveredContainer: null,
            insertPreview: null,

            // Actions
            setDragging: (isDragging, item) => {
                set((state) => ({
                    ...state,
                    isDragging,
                    draggedItem: isDragging ? item || state.draggedItem : null,
                    // 清除其他状态当停止拖拽时
                    hoveredContainer: isDragging ? state.hoveredContainer : null,
                    insertPreview: isDragging ? state.insertPreview : null
                }));
            },

            setHoveredContainer: (containerId) => {
                set((state) => ({
                    ...state,
                    hoveredContainer: containerId,
                    // 如果不再悬停任何容器，清除插入预览
                    insertPreview: containerId ? state.insertPreview : null
                }));
            },

            setInsertPreview: (preview) => {
                set((state) => ({
                    ...state,
                    insertPreview: preview
                }));
            },

            clearDragState: () => {
                set({
                    isDragging: false,
                    draggedItem: null,
                    hoveredContainer: null,
                    insertPreview: null
                });
            }
        })
    )
);

// 注意：直接使用 state => state.property 的方式来避免 getSnapshot 缓存问题

export default useDragStore;
