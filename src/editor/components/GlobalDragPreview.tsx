import React, { useEffect, useState } from 'react';
import { useDragStore } from '../stores/dragStore';
import './DragPreviewStyles.css';

// 导入物料组件
import Input from '../materials/input';
import Button from '../materials/button';
import Text from '../materials/text';
import Container from '../materials/container';
import Page from '../materials/page';
import Image from '../materials/image';
import Header from '../materials/header';
import Div from '../materials/div';
import ImageUpload from '../materials/image-upload';
import PreAnnotation from '../materials/pre-annotation';
import AnnotationCanvas from '../materials/annotation-canvas';

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

    // 根据组件类型渲染对应的组件预览
    const renderComponentPreview = (componentType: string) => {
        // 创建一个临时的props对象，使用默认值
        const defaultProps = {};
        
        // 使用时间戳作为唯一ID
        const tempId = Date.now();
        
        switch (componentType) {
            case 'Input':
                return <Input id={tempId} name={componentType} {...defaultProps} />;
            case 'Button':
                return <Button id={tempId} name={componentType} text="按钮" {...defaultProps} />;
            case 'Text':
                return <Text id={tempId} name={componentType} content="文本预览" {...defaultProps} />;
            case 'Container':
                return <Container id={tempId} name={componentType} {...defaultProps} />;
            case 'Page':
                return <Page id={tempId} name={componentType} {...defaultProps} />;
            case 'Image':
                return <Image id={tempId} name={componentType} {...defaultProps} />;
            case 'Header':
                return <Header id={tempId} name={componentType} {...defaultProps} />;
            case 'Div':
                return <Div id={tempId} name={componentType} {...defaultProps} />;
            case 'ImageUpload':
                return <ImageUpload id={tempId} name={componentType} {...defaultProps} />;
            case 'PreAnnotation':
                return <PreAnnotation id={tempId} name={componentType} {...defaultProps} />;
            case 'AnnotationCanvas':
                return <AnnotationCanvas id={tempId} name={componentType} {...defaultProps} />;
            default:
                return <div>{componentType}</div>;
        }
    };

    return (
        <>
            {/* 拖拽项跟随鼠标的预览 - 显示实际组件预览 */}
            <div
                className="fixed pointer-events-none z-[9999] max-w-xs"
                style={{
                    left: mousePosition.x + 10,
                    top: mousePosition.y - 10,
                    transform: 'translate(0, -50%)',
                    opacity: 0.8,
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                }}
            >
                <div className="border-2 border-blue-400 rounded bg-white bg-opacity-90 p-1" style={{minWidth: '100px', pointerEvents: 'none'}}>
                    {draggedItem && renderComponentPreview(draggedItem.name)}
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