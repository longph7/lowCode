import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { useEffect, useCallback, useMemo } from 'react'
import { useDragStore } from '../../editor/stores/dragStore'

export interface MaterialItemProps {
    name: string;
    index: number;
    componentType?: string;
    previewSrc?: string;
    dragProps?: Record<string, any>;
}

export default function MaterialItem(props: MaterialItemProps) {
    const setDragging = useDragStore(useCallback((state) => state.setDragging, []));
    const componentType = props.componentType || props.name;
    const transparentDragImage = useMemo(() => {
        const img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
        return img;
    }, []);
    
    const [{ isDragging }, dragRef, preview] = useDrag(() => ({
        type: componentType,
        item: () => {
            const draggedItem = {
                name: props.name,
                type: componentType,
                componentType,
                previewSrc: props.previewSrc,
                props: props.dragProps,
            };
            setDragging(true, draggedItem);
            return draggedItem;
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        end: () => {
            setDragging(false);
        },
    }), [componentType, props.dragProps, props.name, props.previewSrc, setDragging])
    
    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
    }, [preview]);
    
    // ?????????????
    useEffect(() => {
        if (!isDragging) {
            setDragging(false);
        }
    }, [isDragging, setDragging]);
    return (
        <div 
            key={props.name + props.index}
            className={`
                border border-[1px] border-[#d1d5db] py-[8px] px-[10px]
                bg-white m-[5px] cursor-pointer rounded-[12px]
                transition-all duration-200 hover:bg-[#fff7ed] hover:border-[#f59e0b]
                ${isDragging ? 'opacity-60 scale-95' : 'opacity-100 scale-100'}
            `}
            ref={dragRef as any}
            onDragStart={(e) => {
                if (e.dataTransfer) {
                    e.dataTransfer.setDragImage(transparentDragImage, 0, 0);
                }
            }}
        >
            <div className="flex items-center space-x-3">
                {props.previewSrc ? (
                    <div className="w-10 h-10 rounded-[8px] bg-[#fff7ed] border border-[#fde6b6] flex items-center justify-center overflow-hidden shrink-0">
                        <img
                            src={props.previewSrc}
                            alt={props.name}
                            className="max-w-[30px] max-h-[30px] object-contain"
                            draggable={false}
                        />
                    </div>
                ) : (
                    <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0"></div>
                )}
                <span className="text-sm font-medium text-[#1f2937]">{props.name}</span>
            </div>
        </div>
    )
}
