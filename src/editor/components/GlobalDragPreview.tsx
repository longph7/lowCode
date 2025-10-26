import React, { useEffect, useState } from 'react';
import { useDragStore } from '../stores/dragStore';
import './DragPreviewStyles.css';

export default function GlobalDragPreview() {
    const isDragging = useDragStore((state) => state.isDragging);
    const draggedItem = useDragStore((state) => state.draggedItem);
    const insertPreview = useDragStore((state) => state.insertPreview);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // 跟踪鼠标位置
    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        document.addEventListener('mousemove', handleMouseMove);
        return () => document.removeEventListener('mousemove', handleMouseMove);
    }, [isDragging]);

    if (!isDragging || !draggedItem) {
        return null;
    }

    return (
        <>
            {/* 拖拽项跟随鼠标的预览 */}
            <div
                className="fixed pointer-events-none z-[9999]"
                style={{
                    left: mousePosition.x + 10,
                    top: mousePosition.y - 10,
                    transform: 'translate(0, -50%)'
                }}
            >
                <div className="bg-white border-2 border-blue-500 rounded-lg px-3 py-2 shadow-lg">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-gray-700">
                            {draggedItem.name}
                        </span>
                    </div>
                </div>
            </div>

            {/* 全局插入预览 */}
            {insertPreview && (
                <div
                    className="fixed pointer-events-none z-[9998]"
                    style={{
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%'
                    }}
                >
                    {/* 这里可以添加全局的插入线或其他预览效果 */}
                </div>
            )}

            {/* 拖拽时的全局遮罩 */}
            <div
                className="fixed inset-0 pointer-events-none z-[9997]"
                style={{
                    background: 'rgba(59, 130, 246, 0.02)',
                    backdropFilter: 'blur(0.5px)'
                }}
            />
        </>
    );
}