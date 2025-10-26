import { useDrag } from 'react-dnd'
import { useEffect, useCallback } from 'react'
import { useDragStore } from '../../editor/stores/dragStore'

export interface MaterialItemProps {
    name: string;
    index: number;
}

export default function MaterialItem(props: MaterialItemProps) {
    const setDragging = useDragStore(useCallback((state) => state.setDragging, []));
    
    const [{ isDragging }, dragRef] = useDrag(() => ({
        type: props.name, // 拖拽的类型
        item: () => {
            // 开始拖拽时设置状态
            setDragging(true, { name: props.name, type: props.name });
            return { name: props.name };
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        end: () => {
            setDragging(false);
        },
    }), [props.name, setDragging])
    
    // 监听拖拽状态变化
    useEffect(() => {
        if (!isDragging) {
            setDragging(false);
        }
    }, [isDragging, setDragging]);
    return (
        <div 
            key={props.name + props.index}
            className={`
                border-dashed border-[1px] border-[#000] py-[8px] px-[10px] 
                inline-block bg-[#fdf2f8] m-[5px] cursor-pointer
                transition-all duration-200 hover:bg-[#f3e8ff] hover:border-[#8b5cf6]
                ${isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
            `}
            ref={dragRef as any}
        >
            <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">{props.name}</span>
            </div>
        </div>
    )
}