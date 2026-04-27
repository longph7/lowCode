import { useEffect, useMemo, useRef } from 'react';
import { useDragStore } from '../stores/dragStore';
import './DragPreviewStyles.css';
import Input from '../materials/input';
import TextArea from '../materials/textarea';
import SelectField from '../materials/select-field';
import RadioGroupField from '../materials/radio-group';
import CheckboxGroupField from '../materials/checkbox-group';
import Button from '../materials/button';
import Text from '../materials/text';
import Container from '../materials/container';
import Page from '../materials/page';
import Image from '../materials/image';
import Header from '../materials/header';
import Div from '../materials/div';
import Title from '../materials/title';
import Shape from '../materials/shape';
import Divider from '../materials/divider';
import Icon from '../materials/icon';

export default function GlobalDragPreview() {
    const isDragging = useDragStore((state) => state.isDragging);
    const draggedItem = useDragStore((state) => state.draggedItem);
    const clearDragState = useDragStore((state) => state.clearDragState);
    const latestPositionRef = useRef<{ x: number; y: number } | null>(null);
    const previewRef = useRef<HTMLDivElement | null>(null);
    const rafIdRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isDragging) {
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
            latestPositionRef.current = null;
            if (previewRef.current) {
                previewRef.current.style.transform = 'translate3d(0px, 0px, 0)';
            }
            return;
        }

        const schedulePositionUpdate = (x: number, y: number) => {
            latestPositionRef.current = { x, y };
            if (rafIdRef.current !== null) {
                return;
            }

            rafIdRef.current = requestAnimationFrame(() => {
                const latest = latestPositionRef.current;
                const node = previewRef.current;
                if (latest && node) {
                    node.style.transform = `translate3d(${latest.x}px, ${latest.y}px, 0)`;
                }
                rafIdRef.current = null;
            });
        };

        const handleMouseMove = (e: MouseEvent) => {
            schedulePositionUpdate(e.clientX, e.clientY);
        };

        const handleDragOver = (e: DragEvent) => {
            schedulePositionUpdate(e.clientX, e.clientY);
        };

        const handleDragCleanup = () => {
            clearDragState();
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('dragover', handleDragOver);
        window.addEventListener('dragend', handleDragCleanup);
        window.addEventListener('drop', handleDragCleanup);
        window.addEventListener('mouseup', handleDragCleanup);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('dragover', handleDragOver);
            window.removeEventListener('dragend', handleDragCleanup);
            window.removeEventListener('drop', handleDragCleanup);
            window.removeEventListener('mouseup', handleDragCleanup);
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
        };
    }, [clearDragState, isDragging]);

    const previewContent = useMemo(() => {
        if (!draggedItem) {
            return null;
        }

        const defaultProps = {};
        const tempId = `preview_${draggedItem.componentType || draggedItem.name}`;
        const componentType = draggedItem.componentType || draggedItem.name;

        switch (componentType) {
            case 'Input':
                return <Input id={tempId} name={componentType} {...defaultProps} />;
            case 'TextArea':
                return <TextArea id={tempId} name={componentType} {...defaultProps} />;
            case 'Select':
                return <SelectField id={tempId} name={componentType} {...defaultProps} />;
            case 'RadioGroup':
                return <RadioGroupField id={tempId} name={componentType} {...defaultProps} />;
            case 'CheckboxGroup':
                return <CheckboxGroupField id={tempId} name={componentType} {...defaultProps} />;
            case 'Button':
                return <Button id={tempId} name={componentType} text="Submit" {...defaultProps} />;
            case 'Text':
                return <Text id={tempId} name={componentType} content="Question text" {...defaultProps} />;
            case 'Container':
                return <Container id={tempId} name={componentType} {...defaultProps} />;
            case 'Page':
                return <Page id={tempId} name={componentType} {...defaultProps} />;
            case 'Image':
                return (
                    <Image
                        id={tempId}
                        name={componentType}
                        src={draggedItem.props?.src}
                        alt={draggedItem.props?.alt || draggedItem.name}
                        objectFit={draggedItem.props?.objectFit || 'contain'}
                        {...defaultProps}
                    />
                );
            case 'Header':
                return <Header id={tempId} name={componentType} {...defaultProps} />;
            case 'Title':
                return <Title id={tempId} name={componentType} {...defaultProps} />;
            case 'Div':
                return <Div id={tempId} name={componentType} {...defaultProps} />;
            case 'Shape':
                return <Shape id={tempId} name={componentType} {...defaultProps} />;
            case 'Divider':
                return <Divider id={tempId} name={componentType} {...defaultProps} />;
            case 'Icon':
                return <Icon id={tempId} name={componentType} {...defaultProps} />;
            default:
                return <div>{componentType}</div>;
        }
    }, [draggedItem]);

    if (!isDragging || !draggedItem) {
        return null;
    }

    return (
        <>
            <div
                ref={previewRef}
                className="fixed pointer-events-none z-[9999] max-w-xs"
                style={{
                    left: 0,
                    top: 0,
                    opacity: 0.8,
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                    transform: 'translate3d(0px, 0px, 0)'
                }}
            >
                <div className="border-2 border-blue-400 rounded bg-white bg-opacity-90 p-1" style={{ minWidth: '100px', pointerEvents: 'none' }}>
                    {previewContent}
                </div>
            </div>


        </>
    );
}
